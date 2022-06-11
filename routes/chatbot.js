const express = require('express')
const User = require('../model/user')
const route = express.Router()

route.get('/index', isLoggedin, (req, res) => {
    res.render('index')
})

route.get('/search/:email', async (req, res) => {
    const txt = req.params.email
    const user = await User.findOne({
        email: {
            $regex: `^${txt}`,
        }
    })
    if(!user){
        res.send('không tìm thấy người dùng !')
    }
    else {
        const name = user.firstName + ' ' + user.lastName
    res.send(`<img class="profile-image" src="https://www.clarity-enhanced.net/wp-content/uploads/2020/06/robocop.jpg" alt="">
    <div class="text">
      <h6>${name}</h6>
      <p class="text-muted">Hey, you're arrested!</p>
    </div>
    <span class="time text-muted small">13:21</span>`)
    }
})

// route.post('/search', async (req, res) => {
//     const txt = req.body.email
//     const user = await User.find({
//         email: {
//             $regex: `^${txt}`,
//         }
//     })
//     res.send(`<p>${user}</p>`)
// })


function isLoggedin(req, res, next) {
    if (!req.session.userId) {
        req.flash('error', 'vui lòng đăng nhập !')
        res.redirect('/')
    } else {
        next()
    }
}

module.exports = route