require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const user = require('./models/User');
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

// 회원 가입 페이지

// 로그인 페이지

// 로그아웃

app.listen(process.env.PORT, () => console.log(`Server running on http://localhost:${process.env.PORT}`));

  