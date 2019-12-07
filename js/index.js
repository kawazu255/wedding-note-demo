var messagesRef = firebase.database().ref('/message');
$(function() {
  $('#comment').on('submit', function() {
    var name = $('#name').val();
    var message = $('#message').val();
    messagesRef.push({name:name, message:message});
    $('#name').val('');
    $('#message').val('');
    $('.js-modal').fadeIn();
    return false;
  });
});

$(function(){
  $('.js-modal-close').on('click',function(){
    $('.js-modal').fadeOut();
    return false;
  });
});