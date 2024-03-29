const express = require('express')
const {
    cloudinary
} = require('../cloudinary/cloudinary');
const multer = require('multer')
const upload = multer({
    dest: './uploads'
});
const Conversation = require('../model/conversation')
const User = require('../model/user')
const route = express.Router()

route.get('/index', isLoggedin, async (req, res) => {
    const id = req.session.userId
    const user = await User.findById(id)
    res.render('index', {
        user
    })
})

// Tìm kiếm người dùng
route.get('/search/:email', async (req, res) => {
    const txt = req.params.email
    const user = await User.findOne({
        email: {
            $regex: `^${txt}`,
        }
    })
    if (!user) {
        res.send('không tìm thấy người dùng !')
    } else {
        const foreName = user.firstName + ' ' + user.lastName
        const userid = user._id
        res.json({
            foreName,
            userid
        })
    }
})

// tạo room chat
route.post('/room', async (req, res) => {
    const members = await Conversation.findOne({
        members: {
            $all: req.body.members
        }
    })
    if (!members) {
        const conversation = new Conversation({
            members: req.body.members
        })
        const us1 = await User.findOne({_id: [req.body.members[0]]})
        const us2 = await User.findOne({_id: [req.body.members[1]]})
        us1.hangout = conversation._id
        us2.hangout = conversation._id
        await us1.save()
        await us2.save()
        await conversation.save()
        console.log(conversation);
    } else {
        console.log('đã tạo room !')
    }
    res.json({
        members
    })
})

// lưu tin nhắn vào database
route.post('/message', upload.single('fileUpload'), async (req, res) => {
    if (req.file) {
        cloudinary.uploader.upload(`./${req.file.path}`, {
            public_id: `${req.file.originalname}`,
            resource_type: "auto",
            raw_convert: "aspose",
            folder: 'chatBot',
        }, async (error, result) => {
            req.body.attach = result.url
            req.body.fileName = result.public_id
            const room = await Conversation.findOne({
                members: {
                    $all: [req.body.receiverId, req.body.senderId]
                }
            })
            room.conversation.push(req.body)
            await room.save()
        })
    } else {
        const room = await Conversation.findOne({
            members: {
                $all: [req.body.receiverId, req.body.senderId]
            }
        })
        room.conversation.push(req.body)
        await room.save()
    }
})


//Gửi lời mời kết bạn
route.post('/addfriend', async (req, res) => {
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