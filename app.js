require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const dns = require('dns');
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

// DB연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongDB Atlas Connected'))
  .catch( err => console.log(err));

// 미들웨어 설정
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

// 인증 미들웨어 : 로그인 여부 확인
const isAuth = ( req, res, next) => {
  if (req.session.isLoggedIn) {
    next(); // 통과!
  } else {
    res.redirect('/login');
  }
};

// 메인 페이지 (회원 전용)
app.get('/', isAuth, (req, res) => {
  res.render('index', { user: req.session.user });
});

// 회원 가입 페이지
app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
  const { userId, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User( { userId, password: hashedPassword, name });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    res.send("회원 가입 실패 : " + err.message);
  }
});

// 로그인 페이지
app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  const { userId, password } = req.body;
  const user = await User.findOne( {userId} );

  if( user && await bcrypt.compare(password, user.password)) {
    req.session.isLoggedIn = true;
    req.session.user = user;
    return req.session.save( () => res.redirect('/') );
  }

  res.send("로그인 정보가 올바르지 않습니다.");
});

// 로그아웃
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.listen(process.env.PORT, () => console.log(`Server running on http://localhost:${process.env.PORT}`));

  