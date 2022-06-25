
$(function () {

  //Kết nối tới server socket đang lắng nghe
  var socket = io()
  socket.emit('login',{userid: $('.addFriend').val()})

  //Socket nhận data và append vào giao diện
  socket.on("send", function (data) {
      console.log(data);
      $(".textInput").before("<div class='row no-gutters'>" +
			"<div class='col-md-3 offset-md-9 right'>" +
			  "<div class='chat-bubble chat-bubble--right'>" +data.message + "</div>" + 
        "</div>" + 
        "</div>" )
  })

  //socket nhận thông báo kết bạn private
      socket.on('get-private-addFriend',(data) => {
        // var userid = $('.addFriend').val()
        // if(userid == data.receiverId) {
          alert('tin nhắn mới ' + data.msg)
        // }
        console.log(userid)
        console.log(data.receiverId)
      })

  //Người dùng đang online
  socket.on('online', (data) => {
    const socketUser = data.socketUser
    $("#onlineFriend").empty()
    for(let skUser of socketUser){
      $('#onlineFriend').prepend("<div class='friend-drawer friend-drawer--onhover' id='friendList'>" +
      "<img class='profile-image' src='https://www.clarity-enhanced.net/wp-content/uploads/2020/06/robocop.jpg' alt=''>" +
      "<div class='text'>" +
      `<h6>${skUser.email}</h6>` + 
      "<p class='text-muted'>Hey, you're arrested!</p>" +
      "</div>" +
      "<span class='time text-success ' style='font-size:40px'>&#8226;</span>" +
      "</div>")
    }
  })

  //Bắt sự kiện click gửi message
  $("#sendMessage").on('click', function () {

      var receiverId = $('#sendMessage').val()
      var message = $('#message').val();

          //Gửi dữ liệu cho socket
          socket.emit('send-message', {receiverId, message});
          $('#message').val('');

  })

  //Gửi lời mời kết bạn
$('.addFriend').click(() => {
  // gửi dữ liệu cho socket
  socket.emit('private-addFriend', {
    senderId: $('.addFriend').val(),
    receiverId: receiverId
  })
})

})


