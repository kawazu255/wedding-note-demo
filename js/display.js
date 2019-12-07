var window_w = $( window ).width();
var window_h = $( window ).height();
//式場のプロジェクターの解像度がこちら
//var w = 1920;
//var h = 1200;
$( '#comment' ).get( 0 ).width = window_w;
$( '#comment' ).get( 0 ).height = window_h;
$( '#particle' ).get( 0 ).width = window_w;
$( '#particle' ).get( 0 ).height = window_h;
$( '#twinkle' ).get( 0 ).width = window_w;
$( '#twinkle' ).get( 0 ).height = window_h;
$( '#back_video' ).get( 0 ).width = window_w/3;
$( '#back_video' ).get( 0 ).height = window_h/3;

var messagesRef = firebase.database().ref('/message');

//テキスト座標保持配列(グローバルで取り扱う)
var position_arr = [];
//当たり判定計算やり直し回数の初期値
var reset_count = 0;

window.onload = function() {
  Particles.init({
    selector: '.background',
    sizeVariations: 36,
    color: [
      '#caa846', 'rgba(202,168,70,.5)', 'rgba(202,168,70,.2)'
    ]
  });

  messagesRef.on('child_added', function (snapshot) {
    var comment = snapshot.val();
    var key = snapshot.key;
    if (comment.message) {
      var text = comment.message;
      var nickname = comment.name.padStart(9, '　');

      //以下描画処理
      var canvas = document.getElementById('comment');
      if (!canvas || !canvas.getContext) return false;
      var context = canvas.getContext('2d');

      // 基本設定
      var boxWidth = 300;
      var padding = 10;
      var radius = 10;// 円弧の半径

      context.fillStyle = "rgba(" + [233, 234, 234, 0.8] + ")";

      // テキスト設定
      var limitedWidth = boxWidth - (padding * 2);
      var size = 30;
      context.font = size + "px HuiFont29";

      // テキスト調整　行に分解
      var lineTextList = text.split("\n");
      var newLineTextList = [];
      lineTextList.forEach(function (lineText) {
          if (context.measureText(lineText).width > limitedWidth) {
              characterList = lineText.split("");// 1文字ずつ分割
              var preLineText = "";
              var lineText = "";
              characterList.forEach(function (character) {
                  lineText += character;
                  if (context.measureText(lineText).width > limitedWidth) {
                      newLineTextList.push(preLineText);
                      lineText = character;
                  }
                  preLineText = lineText;
              });
          }
          newLineTextList.push(lineText);
      });
      //最後にニックネームを入れる
      newLineTextList.push(nickname);
      var lineLength = newLineTextList.length;

      // 角丸
      var box_w = boxWidth;// 枠の幅
      var box_h = (size * lineLength) + (padding * 3);// 枠の高さ
      var toRadianCoefficient = Math.PI / 180;// 角度からラジアンへの変換係数

      //XY座標決定
      //リロードされた場合は保存してある座標を設定
      if (comment.x && comment.y) {
        var box_x = comment.x;
        var box_y = comment.y;
      } else {
        var draw_position = decidePosition(window_w, window_h, box_w, box_h);
        reset_count = 0;
        var box_x = draw_position[0];
        var box_y = draw_position[1];
        messagesRef.child(key).update({x:box_x, y:box_y});
      }

      // 円弧から円弧までの直線は自動で引かれます、角度は回り方によって変わります。
      // arc(中心x, 中心y, 半径, 開始角度, 終了角度, 反時計回り)
      context.beginPath();
      context.arc(box_x + radius, box_y + radius, radius, 180 * toRadianCoefficient, 270 * toRadianCoefficient, false);// 左上
      context.arc(box_x + box_w - radius, box_y + radius, radius, 270 * toRadianCoefficient, 0, false);// 右上
      context.arc(box_x + box_w - radius, box_y + box_h - radius, radius, 0, 90 * toRadianCoefficient, false);// 右下
      context.arc(box_x + radius, box_y + box_h - radius, radius, 90 * toRadianCoefficient, 180 * toRadianCoefficient, false);// 左下
      context.closePath();
      context.fill();

      // テキスト描画
      context.fillStyle = "#000000";
      //縁取り
      //context.strokeStyle = "#000";
      newLineTextList.forEach(function (lineText, index) {
          context.fillText(lineText, box_x + padding, box_y + padding + (size * (index + 1)));
      });

      //座標を配列に保存
      position_arr.push([box_x, box_y, box_w, box_h]);

      //星描画
      $.canvas.init(box_x, box_y, box_w, box_h);
    }
  });
};

function decidePosition (window_w, window_h, box_w, box_h) {
  var box_x = decideX(window_w, box_w);
  var box_y = decideY(window_h, box_h);
  var draw_position = [box_x, box_y];

  //新規のテキスト領域
  var new_area_x = box_x + box_w/2;
  var new_area_y = box_y + box_h/2;
  var new_area_width = box_w;
  var new_area_height = box_h;

  //動画領域
  var movie_area_x = window_w/2;
  var movie_area_y = window_h/2;
  var movie_area_width = window_w/2;
  var movie_area_height = window_h/2;

  //当たり判定
  if(
    Math.abs(new_area_x - movie_area_x) < new_area_width/2 + movie_area_width/2 //横の判定
    &&
    Math.abs(new_area_y - movie_area_y) < new_area_height/2 + movie_area_height/2 //縦の判定
  ){
    draw_position = decidePosition(window_w, window_h, box_w, box_h);
  }

  position_arr.forEach(function(position, i, a){
    //既存のテキスト領域
    var exist_area_x = position[0] + position[2]/2;
    var exist_area_y = position[1] + position[3]/2;
    var exist_area_width = position[2];
    var exist_area_height = position[3];

    //当たり判定
    if(
      Math.abs(new_area_x - exist_area_x) < new_area_width/2 + exist_area_width/2 //横の判定
      &&
      Math.abs(new_area_y - exist_area_y) < new_area_height/2 + exist_area_height/2 //縦の判定
    ){
      reset_count++;
      if (reset_count < 10) {
        draw_position = decidePosition(window_w, window_h, box_w, box_h);
      }
    }
  });
  return draw_position;
}

function decideX (window_w, box_w) {
  var box_x = Math.floor(Math.random() * window_w);
  if (box_x + box_w > window_w) {
    box_x = decideX(window_w, box_w);
  }
  return box_x;
}

function decideY (window_h, box_h) {
  var box_y = Math.floor(Math.random() * window_h);
  if (box_y + box_h > window_h) {
    box_y = decideY(window_h, box_h);
  }
  return box_y;
}