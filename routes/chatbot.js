const express = require('express')
const User = require('../model/user')
const route = express.Router()

route.get('/index', isLoggedin, async(req, res) => {
    const id = req.session.userId
    const user = await User.findById(id)
    res.render('index', { user })
})

// Tìm kiếm người dùng
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
        const foreName = user.firstName + ' ' + user.lastName
        const userid = user._id
    res.json({foreName, userid})
    }
})

// gửi tin nhắn
route.post('/message', async(req,res) => {
    const email = req.body.email
    const hangout = req.body.hangout
    const user = await User.findOne({email: email})
    user.hangout.push(hangout)
    user.save()
    console.log(req.body)
})

//Gửi lời mời kết bạn
route.post('/addfriend', async(req,res) => {
    console.log(req.body)
})

function isLoggedin(req, res, next) {
    if (!req.session.userId) {
        req.flash('error', 'vui lòng đăng nhập !')
        res.redirect('/')
    } else {
        next()
    }
}

module.exports = route