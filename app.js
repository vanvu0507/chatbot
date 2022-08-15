if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const path = require('path');
const flash = require('connect-flash')
const session = require('express-session');
const mongoose = require('mongoose')
const users = require('./routes/users');
const chatbot = require('./routes/chatbot');
const User = require('./model/user');
const Conversation = require('./model/conversation')

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'))

const dbUrl = process.env.DB_URL
const secret = process.env.SECRET

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("MONGO ATLAS CONNECTION SUCCESSFULLY !!");
}).catch (error => {
    console.log("MONGO CONNECTION ERROR !!")
    console.log(error)
});

var socketUser = []

//Tạo socket 
io.on('connection', async (socket) => {

    socket.on('login',async (data) => {
        const user = await User.findById(data.userid).populate('hangout')
        user.socketId = socket.id
        user.peerId = data.peerId
        user.save()
        console.log('user ' + socket.id + ' has just joined');
        const skUser = socketUser.filter(item => item.email == user.email)
        if(skUser.length == 0){
            socketUser.push(user)
            io.emit('online', {socketUser})
        } 
        else {
            if(skUser[0].socketId == null){
                for(let i = 0; i < socketUser.length; i++){
                    if(socketUser[i].socketId == null && socketUser[i].email == user.email){
                        socketUser[i].socketId = user.socketId
                    }
                }
            }
            io.emit('online', {socketUser})
        }
        console.log(socketUser)
    })

    socket.on('disconnect', async (data) => {
        const user = await User.findOneAndUpdate({socketId: socket.id}, {socketId: null}, {new: true})
        for(let i = 0; i < socketUser.length; i++){
            if(socketUser[i].email == user.email){
                socketUser[i].socketId = null
                io.emit('online', {socketUser})
            }
        }
        console.log('user ' + socket.id + ' has just left');
    })

    socket.on('send-message', async (data) => {
        const user = await User.findById(data.receiverId)
        // const cvst= await Conversation.findOne({
        //     members: {
        //         $all: [data.receiverId, data.senderId]
        //     }
        // })
        // const index = cvst.conversation.length
        // var daTa = await cvst.conversation[index-1]
        // console.log(daTa)
        io.to([user.socketId,socket.id]).emit('send', data );
    })

    socket.on('texting', async (data) => {
        const user = await User.findById(data.receiverId)
        io.to(user.socketId).emit('texting',{status: 'đang nhập tin nhắn...', senderId: data.senderId})
    })

    socket.on('notTexting', async (data) => {
        const user = await User.findById(data.receiverId)
        io.to(user.socketId).emit('notTexting')
    })


    socket.on('private-addFriend', async (data) => {
        const user = await User.findById(data.receiverId)
        io.to(user.socketId).emit('get-private-addFriend',{
            senderId : data.senderId,
            receiverId: data.receiverId,
            msg: 'hello'
        })
    })

});

app.use(session({
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))

app.use(flash())
app.use((req,res,next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.use("/",users)
app.use('/',chatbot)

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`Listening to ${port} port`)
});

exports.socketUser = socketUser




