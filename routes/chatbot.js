const express = require('express')
const Conversation = require('../model/conversation')
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

// tạo room chat
route.post('/room', async(req,res) => {
    const members = await Conversation.findOne({members: {$all: req.body.members}})
    if(!members) {
        const conversation = new Conversation({
            members: req.body.members
        })
        await conversation.save()
        console.log(conversation);
    } else {
        console.log('đã tạo room !')
        console.log(members)
    }
    res.json({members})
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