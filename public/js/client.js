
$(function () {
  var receiverId
  var skUser = []
  $('.chat-panel').hide()
  $('.settings-tray').hide()
  //Kết nối tới server socket đang lắng nghe
  var socket = io()
  socket.emit('login',{userid: $('.addFriend').val()})

  //Socket nhận data và append vào giao diện
  socket.on("send", function (data) {
      const id = $('#sendMessage').val()
      if(data.senderId == $('#sendMessage').val()){
        $(".chatFrame").append("<div class='row no-gutters'>" +
        "<div class='col-md-3 left'>" +
          "<div class='chat-bubble chat-bubble--left d-flex'>" +data.text + "</div>" +
          "<div class='text-muted' style='margin-left:30px;font-size:12px;'>"+ data.createAt + "</div>" + 
          "</div>" + 
          "</div>" )
      } if(data.senderId != $('#sendMessage').val() && data.senderId == $('.addFriend').val() ) {
        $(".chatFrame").append("<div class='row no-gutters'>" +
        "<div class='col-md-3 offset-md-9 right'>" +
          "<div class='chat-bubble chat-bubble--right d-flex'>" +data.text + "</div>" +
          "<div class='text-muted' style='margin-left:30px;font-size:12px;'>"+ data.createAt + "</div>" +  
          "</div>" + 
          "</div>" )
      }
      // $('.chatFrame').slideToggle();
      $('.chatFrame').animate({scrollTop: $('.chatFrame')[0].scrollHeight}, 'slow');
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
    socketUser.forEach(item => skUser.push(item))
    $("#onlineFriend").empty()
    for(let i = 0; i < socketUser.length; i++){
      $('#onlineFriend').prepend(`<div class='friend-drawer friend-drawer--onhover overflow-scroll' id='${socketUser[i]._id}'>` +
      "<img class='profile-image' src='https://www.clarity-enhanced.net/wp-content/uploads/2020/06/robocop.jpg' alt=''>" +
      "<div class='text'>" + 
      `<h6>${socketUser[i].email}</h6>` + 
      "<p class='text-muted'>Hey, you're arrested!</p>" +
      "</div>" +
      `<span class='time ${socketUser[i].socketId == null ? 'text-danger' : 'text-success'}' style='font-size:40px'>&#8226;</span>` +
      "</div><hr>")
    }
    skUser.forEach(item => $(document).on('click', `#${item._id}`,function(){
      
     $('#username').text(`${item.firstName} `+ `${item.lastName}`)
     $('#sendMessage').attr('value', `${item._id}`)
     if(item.socketId == null){
      $('#statusDot').removeClass('text-success').addClass('text-danger')
      $('#statusText').text('offline')
     } else {
      $('#statusDot').removeClass('text-danger').addClass('text-success')
      $('#statusText').text('online')
     }
     $.post('/room', {
      members: [
        $('#sendMessage').val(),
        $('.addFriend').val()
      ]
     },(res) => {
      const conversation = res.members.conversation
      $('.chatFrame').empty()
      for(let i = conversation.length - 1; i >= 0; i--) {
        if(conversation[i].senderId == $('.addFriend').val()){
          $('.chatFrame').prepend("<div class='row no-gutters'>" +
          "<div class='col-md-3 offset-md-9 right'>" +
            "<div class='chat-bubble chat-bubble--right d-flex'>" +conversation[i].text + "</div>" + 
            "<div class='text-muted' style='margin-left:30px;font-size:12px;'>"+ conversation[i].createAt + "</div>" + 
            "</div>" + 
            "</div>")
        } if(conversation[i].senderId == $('#sendMessage').val()){
          $('.chatFrame').prepend("<div class='row no-gutters'>" +
          "<div class='col-md-3 left'>" +
            "<div class='chat-bubble chat-bubble--left d-flex'>" +conversation[i].text + "</div>" + 
            "<div class='text-muted' style='margin-left:30px;font-size:12px;'>"+ conversation[i].createAt + "</div>" + 
            "</div>" + 
            "</div>")
        }
      }
      $('#weather').hide()
      $('.settings-tray').show()
      $('.chat-panel').show()
      $('.chatFrame').animate({scrollTop: $('.chatFrame')[0].scrollHeight}, 'slow');
     })
    }) 
    )
  })

  //Bắt sự kiện click gửi message
  $("#sendMessage").on('click', function () {

      receiverId = $('#sendMessage').val()
      var senderId = $('.addFriend').val()
      var text = $('#message').val();
      var createAt = new Date().toString().slice(0,24)
          //Gửi dữ liệu cho socket
          socket.emit('send-message', {receiverId, senderId, text, createAt});
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



$('#searchFriend').hide()

$('.btnLogout').click(() => {
    const text = confirm('Bạn có muốn đăng xuất ?')
    if(text == true){
        $.post('/logout', () => {
            location.reload();
        })
    } else {
        alert('you click cancel')
    }
})

$('#search').on('input', () => {
    $.get(`/search/${$('#search').val()}`, (data) => {
		var foreName = data.foreName
		receiverId = data.userid
		$('#userName').text(`${foreName}`)			
        $('#searchFriend').show()
		$('#sendMessage').val(receiverId)
	})
})

setTimeout(() => {
  
},500)


})

