var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')
var sassMiddleware = require('node-sass-middleware');
let users = require('./routes/users')
let posts = require('./routes/posts')
let comments = require('./routes/comments')
let notifications = require('./routes/notification')
let messages = require('./routes/messages')
let AutherticatePolicy = require('./policies/AuthenticatePolicy')
let upload  = require('./routes/upload')



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors({credentials: true,origin: true}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res, next) {
  res.render('index', { title: 'WIT Community' })
})
app.get('/users', users.getAllUsers)
app.post('/user/register',users.register)
app.get('/user/:id', users.getUserById)
app.post('/user/gid',users.getUserByGoogleId)
app.put('/user/update', users.updateUser)
app.delete('/user/delete/:id', users.deleteUser)
app.post('/user/login', users.login)
app.post('/post', posts.post)
app.get('/post/:id', posts.getPostDetail)
app.get('/post/user/:id', posts.getPostByUserId)
app.get('/all', posts.getAllPosts)
app.get('/popular',posts.getPopular)
app.get('/subarea/:subarea',posts.getSubareaPosts)
app.get('/search/:keyword', posts.searchPosts)
app.put('/post/update',  posts.updatePost)
app.delete('/post/delete/:id', posts.deletePost)
app.post('/comment', comments.comment)
app.get('/comment/user/:id', comments.getCommentByUserId)
app.get('/comments/:id',comments.getComments)
app.post('/comment/like',comments.likeComment)
app.delete('/comment/delete/:id', comments.deleteComment)
app.post('/upload', upload.upload)
app.get('/notification/num/:id',notifications.getUnreadNotificationNum)
app.get('/notification/:id',notifications.getNotifications)
app.get('/notification/markAll/:id',notifications.markAllRead)
app.get('/notification/mark/:id',notifications.markOneRead)
app.post('/message/create',messages.createMessage)
app.post('/message/get',messages.getMessage)
app.get('/message/num/:id', messages.getUnreadMessageNum)
app.get('/message/messenger/:id',messages.getMessengerList)
app.post('/message/read',messages.markRead)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
