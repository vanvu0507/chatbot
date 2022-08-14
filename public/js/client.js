$(function () {
  var receiverId
  var peerId
  var peerList = []
  var skUser = []
  $('.chat-panel').hide()
  $('.settings-tray').hide()
  $('#videoChat').hide()


  //Kết nối tới server socket đang lắng nghe
  var socket = io()

  // Peer connect
  const peer = new Peer();
  peer.on('open', (id) => {
    socket.emit('login', {
      userid: $('.addFriend').val(),
      peerId: id
    })
  })
peer.on('call', (call) => {
  $('#weather').hide()
  $('.chat-panel').hide()
  $('.settings-tray').hide()
  $('#videoChat').show()
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then((stream) => {
    var mediaStream = stream
    call.answer(stream)
    addOwnStream(stream)
    call.on('stream', (remoteStream) => {
      if(!peerList.includes(call.peer)){
        addUserStream(remoteStream)
        peerList.push(call.peer)
        console.log(call.peer)
      }
    })
    // call.on('close',() => {
    //   alert('kết thúc cuộc gọi')
    // })
    $('#btnVideo').on('click',() => {
      mediaStream.getVideoTracks()[0].enabled = !(mediaStream.getVideoTracks()[0].enabled)
      console.log(mediaStream);
    })
    $('#btnMicro').on('click', () => {
      mediaStream.getAudioTracks()[0].enabled = !(mediaStream.getAudioTracks()[0].enabled)
    })
    $('#btnEndCall').on('click',() => {

    })
  }).catch(err => console.log(err))
})

peer.on('disconnect', () => {
  alert('kết thúc cuộc gọi')
})

  //Socket nhận data và append vào giao diện
  socket.on("send", function (data) {
    const id = $('#sendMessage').val()
    if (data.senderId == $('#sendMessage').val()) {
      $(".chatFrame").append("<div class='row no-gutters'>" +
        "<div class='col-md-3 left'>" +
        "<div class='chat-bubble chat-bubble--left d-flex'>" + data.text + "</div>" +
        "<div class='text-muted' style='margin-left:30px;font-size:12px;'>" + data.createAt + "</div>" +
        "</div>" +
        "</div>")
    }
    if (data.senderId != $('#sendMessage').val() && data.senderId == $('.addFriend').val()) {
      $(".chatFrame").append("<div class='row no-gutters'>" +
        "<div class='col-md-3 offset-md-9 right'>" +
        "<div class='chat-bubble chat-bubble--right d-flex'>" + data.text + "</div>" +
        "<div class='text-muted' style='margin-left:30px;font-size:12px;'>" + data.createAt + "</div>" +
        "</div>" +
        "</div>")
    }
    // $('.chatFrame').slideToggle();
    $('.chatFrame').animate({
      scrollTop: $('.chatFrame')[0].scrollHeight
    }, 'slow');
  })

  //socket nhận thông báo kết bạn private
  socket.on('get-private-addFriend', (data) => {
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
    for (let i = 0; i < socketUser.length; i++) {
      var hangoutLength = socketUser[i].hangout.length
      $('#onlineFriend').prepend(`<div class='friend-drawer friend-drawer--onhover overflow-scroll' id='${socketUser[i]._id}'>` +
        "<img class='profile-image' src='https://www.clarity-enhanced.net/wp-content/uploads/2020/06/robocop.jpg' alt=''>" +
        "<div class='text'>" +
        `<h6>${socketUser[i].email}</h6>` +
        `<p class='text-muted'>Hey, you're arrested!</p>` +
        "</div>" +
        `<span class='time ${socketUser[i].socketId == null ? 'text-danger' : 'text-success'}' style='font-size:40px'>&#8226;</span>` +
        "</div><hr>")
    }
    skUser.forEach(item => $(document).on('click', `#${item._id}`, function () {

      $('#username').text(`${item.firstName} ` + `${item.lastName}`)
      $('#btnVideoCall').val(item.peerId)
      peerId = $('#btnVideoCall').val()
      $('#sendMessage').attr('value', `${item._id}`)
      if (item.socketId == null) {
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
      }, (res) => {
        const conversation = res.members.conversation
        $('.chatFrame').empty()
        for (let i = conversation.length - 1; i >= 0; i--) {
          if (conversation[i].senderId == $('.addFriend').val()) {
            if(conversation[i].attach){
              $('.chatFrame').prepend("<div class='row no-gutters'>" +
              "<div class='col-md-3 offset-md-9 right'>" +
              "<div class='chat-bubble chat-bubble--right d-flex'>" + conversation[i].text + "</div>" +
              `<div class='chat-bubble chat-bubble--right d-flex'><a href=${conversation[i].attach}><i class="fa-solid fa-file">${conversation[i].fileName}</i></a></div>` +  
              "<div class='text-muted' style='margin-left:30px;font-size:12px;'>" + conversation[i].createAt + "</div>" +
              "</div>" +
              "</div>")
            } else {
              $('.chatFrame').prepend("<div class='row no-gutters'>" +
              "<div class='col-md-3 offset-md-9 right'>" +
              "<div class='chat-bubble chat-bubble--right d-flex'>" + conversation[i].text + "</div>" +  
              "<div class='text-muted' style='margin-left:30px;font-size:12px;'>" + conversation[i].createAt + "</div>" +
              "</div>" +
              "</div>")
            }
            
          }
          if (conversation[i].senderId == $('#sendMessage').val()) {
            if(conversation[i].attach){
              $('.chatFrame').prepend("<div class='row no-gutters'>" +
              "<div class='col-md-3 left'>" +
              "<div class='chat-bubble chat-bubble--left d-flex'>" + conversation[i].text + "</div>" +
              `<div class='chat-bubble chat-bubble--left d-flex'><a href=${conversation[i].attach}><i class="fa-solid fa-file">${conversation[i].fileName}</i></a></div>` +
              "<div class='text-muted' style='margin-left:30px;font-size:12px;'>" + conversation[i].createAt + "</div>" +
              "</div>" +
              "</div>")
            } else {
              $('.chatFrame').prepend("<div class='row no-gutters'>" +
              "<div class='col-md-3 left'>" +
              "<div class='chat-bubble chat-bubble--left d-flex'>" + conversation[i].text + "</div>" +
              "<div class='text-muted' style='margin-left:30px;font-size:12px;'>" + conversation[i].createAt + "</div>" +
              "</div>" +
              "</div>")
            }
          }
        }
        $('#weather').hide()
        $('#videoChat').hide()
        $('.settings-tray').show()
        $('.chat-panel').show()
        $('.chatFrame').animate({
          scrollTop: $('.chatFrame')[0].scrollHeight
        }, 'slow');
      })
    }))
  })

  // lấy địa chỉ IP người dùng
  $.get('https://api.ipify.org/?format=json', (data) => {
    $.get(`https://ipinfo.io/${data.ip}?token=259f48293a9009`, (data) => {

      $.get(`https://api.openweathermap.org/data/2.5/weather?q=${data.city},${data.country}&appid=a5cdce4fffa27481c97620907099bfad&lang=vi&units=metric`, (data) => {
        const temp = Math.round(data.main.temp)
        const tempMin = Math.round(data.main.temp_min)
        const tempMax = Math.round(data.main.temp_max)
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString()
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString()
        $('.location').text(`${data.name}, ${data.sys.country}`)
        $('.temp').html(`${temp}&#8451;`)
        $('.description').text(`${data.weather[0].description}`)
        $('.minmaxDegree').html(`C:${tempMax}<sup>o</sup> T:${tempMin}<sup>o</sup>`)
        $('#sunrise').html(`Mặt trời mọc<br>${sunrise}`)
        $('#wind').html(`Gió<br>${data.wind.speed} km/h`)
        $('#sunset').html(`Mặt trời lặn<br>${sunset}`)
        $('#humidity').html(`Độ ẩm<br>${data.main.humidity}%`)
        $('#pressure').html(`Áp suât<br>${data.main.pressure} hPa`)
        $('#feelLikes').html(`Nhiệt độ cảm nhận<br>${data.main.feels_like}<sup>o</sup>C`)
        console.log(data);
      })
    })
  })

  //Bắt sự kiện click gửi message
  $("#sendMessage").on('click', function () {

    receiverId = $('#sendMessage').val()
    var senderId = $('.addFriend').val()
    var text = $('#message').val();
    var createAt = new Date().toString().slice(0, 24)
    var fileUpload = $('#fileUpload')[0].files[0]

    var fd = new FormData()
    fd.append('fileUpload', fileUpload)
    fd.append('receiverId', receiverId)
    fd.append('senderId', senderId)
    fd.append('text', text)
    fd.append('createAt', createAt)
    console.log(fileUpload)

    //Gửi dữ liệu cho socket
    if (text != "") {
      $.ajax({
        type: 'post',
        url: '/message',
        processData: false,
        contentType: false,
        data: fd,
      })
      socket.emit('send-message', {
        receiverId,
        senderId,
        text,
        createAt
      });
      $('#message').val('');
     }

  })

  // Người dùng đang gõ tin nhắn
  $('#message').focusin(() => {
    receiverId = $('#sendMessage').val()
    var senderId = $('.addFriend').val()
    socket.emit('texting',{receiverId, senderId})
  })

  // Người dùng không gõ tin nhắn
  $('#message').focusout(() => {
    receiverId = $('#sendMessage').val()
    var senderId = $('.addFriend').val()
    socket.emit('notTexting',{receiverId, senderId})
  })

  // Lắng nghe người dùng nhập tin nhắn
  socket.on('texting', (data) => {
    if($('#sendMessage').val() == data.senderId){
      $('#statusTexting').append(`<p class='ms-5 text-muted'>${data.status}</p>`).delay('fast').fadeIn()
    }
  })

  // Lắng nghe người dùng không nhập tin nhắn
  socket.on('notTexting', (data) => {
   $('#statusTexting').empty() 
  })

  // Gọi video
  $('#btnVideoCall').click(() => {
    $('.chat-panel').hide()
    $('.settings-tray').hide()
    $('#videoChat').show()
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then((stream) => {
      var mediaStream = stream
      console.log(mediaStream);
      let call = peer.call(peerId, stream)
      addOwnStream(stream)
      call.on('stream', (userStream) => {
        if(!peerList.includes(call.peer)){
          addUserStream(userStream)
          peerList.push(call.peer)
          console.log(call.peer)
        }
      })
      $('#btnVideo').on('click',() => {
        mediaStream.getVideoTracks()[0].enabled = !(mediaStream.getVideoTracks()[0].enabled)
        console.log(mediaStream);
      })
      $('#btnMicro').on('click', () => {
        mediaStream.getAudioTracks()[0].enabled = !(mediaStream.getAudioTracks()[0].enabled)
      })
    //   $('#btnEndCall').on('click',() => {
    //   call.close()
    // })
    }).catch(err => console.log(eer + 'unable to get media'))
  })


  //Gửi lời mời kết bạn
  $('.addFriend').click(() => {
    // gửi dữ liệu cho socket
    socket.emit('private-addFriend', {
      senderId: $('.addFriend').val(),
      receiverId: receiverId
    })
  })

  // thêm guest stream 
  function addUserStream(userStream) {
    let video = document.createElement('video')
    video.classList.add('guestVideo')
    video.srcObject = userStream
    video.play()
    $('#guestCam').prepend(video)
  }

  // thêm own stream
  function addOwnStream(stream) {
    let video = document.createElement('video')
    video.classList.add('ownVideo')
    video.srcObject = stream
    video.play()
    $('#ownCam').prepend(video)
  }


  $('#searchFriend').hide()

  $('.btnLogout').click(() => {
    const text = confirm('Bạn có muốn đăng xuất ?')
    if (text == true) {
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

})