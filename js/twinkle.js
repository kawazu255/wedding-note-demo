(function(window){
  var PARAM = new Object();
  $.canvas = {
    init : function(text_x, text_y, text_w, text_h){
      PARAM = {
        main   : {id:$('#twinkle_area')},
        canvas : {
          id   : $('#twinkle'),
          //size : {x:text_x, y:text_y, width:text_w, height:text_h} // !!画像サイズと一致させる!!
        },
        velocity : {x:0, y:0},
        circle   : new createjs.Shape(),
        stage    : ''
      };		
      $.canvas.seting(text_x, text_y, text_w, text_h);
    },
    seting : function(text_x, text_y, text_w, text_h){
      var canvasObject = PARAM.canvas.id.get(0);
      var context      = canvasObject.getContext("2d");

      PARAM.stage = new createjs.Stage(canvasObject);
      PARAM.velocity.x = Math.floor(Math.random()*5) + 5;
      PARAM.velocity.y = Math.floor(Math.random()*5) + 5;

      var interbalid = null;
      interbalid = setInterval(function(){
        $.canvas.star(text_x, text_y, text_w, text_h);
      },80);

      setTimeout(function(){
        $.canvas.stop(interbalid);
      },10000);

      createjs.Ticker.on("tick", $.canvas.tick);
    },
    star : function(text_x, text_y, text_w, text_h){
        console.log('star');
      var shape      = new createjs.Shape();
      var g          = shape.graphics;
      var color      = (Math.random()*360);
      var glowColor1 = createjs.Graphics.getHSL(0, 100, 100, 1);
      var glowColor2 = createjs.Graphics.getHSL(color, 100, 40, 0.5);
      var radius     = (Math.random()*50);
      var position   = {x:text_x + Math.random()*text_w, y :text_y + Math.random()*text_h};

      g.beginRadialGradientFill( [glowColor1,glowColor2], [0.1,0.5], 0,0,1, 0,0,(Math.random()*10+13)*2);
      g.drawPolyStar(0, 0, radius, 6, 0.95, (Math.random()*360));
      g.endFill();

      g.beginRadialGradientFill( [createjs.Graphics.getHSL(color,100,30,0.5),createjs.Graphics.getHSL(color,100,30,0)], [0,0.5], 0,0,0, 0,0,radius);
      g.drawCircle(0, 0, radius);
      g.endFill();

      shape.compositeOperation = "lighter";

      shape.x      = position.x;
      shape.y      = position.y;
      shape.scaleX = 0;
      shape.scaleY = 0;
      shape.alpha  = 0;
      shape.shadow = new createjs.Shadow(color, 0, 0, 5);

      PARAM.stage.addChild(shape);
      $.canvas.tween(shape);
    },
    tween : function(SHAPE){
      var tween = createjs.Tween.get(SHAPE)
        .to({scaleX:1, scaleY:1, alpha:1}, 500, createjs.Ease.sineOut)
        .to({scaleX:0, scaleY:0, alpha:0, }, 800, createjs.Ease.sineIn)
      ;
      tween.call(function(){
        $.canvas.remove(this);
      });
    },
    remove : function(SHAPE){
      PARAM.stage.removeChild(SHAPE);
    },
    tick : function(){
      PARAM.stage.update();
    },
    stop : function(interbalid){
      //createjs.Ticker.reset();
      clearInterval(interbalid);
      interbalid = null;
    },
  };
})(window);