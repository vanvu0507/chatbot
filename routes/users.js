const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../model/user');
const socketUser = require('../app')

router.get("/", isLoggedOut, function(req, res) {
    res.render("login");
});
router.get("/register", function(req, res) {
    res.render("register");
});

// xử lý đăng ký
router.post('/register', async (req,res) => {
    const user = req.body.authentication
    const validEmail = await User.findOne({email: user.email})
    const validPhoneNumber = await User.findOne({phoneNumber: user.phoneNumber})
    console.log(validEmail,validPhoneNumber)
    if(validEmail == null && validPhoneNumber == null) {
    const hashedPw = await bcrypt.hash(user.password,12)
    user.password = hashedPw
    const newUser = new User(user)
    await newUser.save()
    req.flash('success','vui lòng đăng nhập lại !')
    res.redirect('/')
} else {
        req.flash('error', 'tên email hoặc tên tài khoản đã được đăng ký')
        res.redirect('/register')
}
})

// xử lý đăng nhập
router.post('/login', async(req,res) => {
    const {email,password} = req.body.authentication
    const user = await User.findOne({email})
    if(user) {
        const validPassword = await bcrypt.compare(password,user.password)
        if(validPassword) {
            const checkUser = socketUser.socketUser.filter(item => item.socketId != null && item.email == user.email)
            if(checkUser.length == 0) {
                req.session.userId = user._id;
                res.redirect('/index')
            } else {
                req.flash('error', 'tài khoản này đang đăng nhập trên thiết bị khác')
                res.redirect('/')
            }
        } else {
            req.flash('error','Sai tên đăng nhập hoặc mật khẩu')
            res.redirect('/')
        }
    } else {
        req.flash('error','Sai tên đăng nhập hoặc mật khẩu')
        res.redirect('/')
    }
})

// xử lý đăng xuất
router.post('/logout', (req,res) => {
    req.session.destroy()
    res.redirect('/')
})

function isLoggedOut(req,res,next) {
    if(req.session.userId){
        res.redirect('/index')
    } else {
        next()
    }
}

module.exports = router;