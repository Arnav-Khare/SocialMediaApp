const express = require('express');
const passport = require('passport')
const app = express();
require('./config/passport');
const session = require("express-session")
const genPassword = require("./controllers/passwordUtils").genPassword
const MongoStore = require('connect-mongo')
const connection = require('./config/db');
const User = connection.models.User;

const port=process.env.PORT || 3000


app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/Users', 
        collection: 'sessions' 
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Equals 1 day 
    }
}));

app.use(passport.initialize());
app.use(passport.session());



app.set('view engine', 'ejs');

app.get('/',async (req,res)=>{
    await connection
    res.render('pages/login')
})



app.get('/home',(req,res)=>{
    res.render('pages/homepage',{username:req.user.username})
})

app.post('/register',async (req,res)=>{
    const saltHash = genPassword(req.body.password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = new User({
        username:req.body.username,
        hash: hash,
        salt: salt,
    })
    
    try{
        const resq = await newUser.save()
        res.redirect(307,'/logindetails')
    }
    catch(e){
        console.log(e)
        res.redirect('pages/login')
    }

     
})
app.post('/logindetails', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: '/login-success' }));


app.get('/login-success', (req, res, next) => {
    res.redirect('/home')
});

app.get('/user',(req,res)=>{
    res.render('pages/userprofile',{username:req.user.username,posts:req.user.posts,followers:req.user.followers,following:req.user.following,tablepost:true})
})

app.get('/user/followers',(req,res)=>{
    res.render('pages/userprofile',{username:req.user.username,posts:req.user.posts,followers:req.user.followers,following:req.user.following,tablepost:false})
})
app.get('/user/following',(req,res)=>{
    res.render('pages/userprofile',{username:req.user.username,posts:req.user.posts,followers:req.user.followers,following:req.user.following,tablepost:true})
})

app.get('/login-failure', (req, res, next) => {
    res.redirect('/')
});

app.get('/post',(req,res,next)=>{
    res.render('pages/post',{username:req.user.username})

})
app.post('/create-post',async (req,res,next)=>{
    let newPost = {
        title:req.body.title,
        body:req.body.body,
    }
  try{
    await  User.updateOne({_id:req.user.id},{$push:{posts:newPost}})
    console.log('Post Added..')
    res.redirect('/user')
  } catch(e){
      console.log('Error Adding Post to User...!!!')
  }
})
app.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});
app.get('/chat' ,(req,res,next)=>{
    res.render('pages/chat')
})

app.get('/demo',(req,res,next)=>{
    res.render('pages/demo')
    User.find({},function(err,users){
        var userMap = {}
        // users.forEach((user)=>{
        //     console.log(user.username)
        // })
    })
})
app.get('/searching',(req,res,next)=>{
    console.log(req.body)
})
const server = app.listen(port,()=>{
    console.log(`Server is Started at: ${port}`)
})

const io = require('socket.io')(server);


io.on('connection', (client) => {

  client.on('message',(data)=>{
      client.emit('message',data)
  })
});

