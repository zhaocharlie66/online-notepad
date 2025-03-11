const express = require('express');
const session = require('express-session');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;
const fs = require('fs');

// 使用 body-parser 解析 POST 请求的 body
app.use(bodyParser.urlencoded({ extended: true }));

// 提供静态文件 (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// 配置 favicon
app.use(favicon(path.join(__dirname, 'public', 'image', 'favicon.png')));

// 配置 session 中间件
app.use(session({
  secret: 'The-strongest-secret-key-in-history',  // 设置 session 的 secret
  resave: false,  // 不允许重新保存未初始化的 session
  saveUninitialized: true, // 允许初始化未使用的 session
}));

// 统一密码
const correctPassword = process.env.PASSWORD || 'password';

// 渲染登录页面
app.get('/login', (req, res) => {
  if (req.session.isLoggedIn) {
    return res.redirect('/note/1');
  }
  res.render('login');
});

// 处理登录请求
app.post('/login', (req, res) => {
  const password = req.body.password;
  if (password === correctPassword) {
    // 登录成功，设置 session 标志
    req.session.isLoggedIn = true;
    res.redirect('/note/1');
  } else {
    res.send('密码错误，请重新输入。<br><a href="/login">返回登录页</a>');
  }
});

//渲染导航页
app.get('/', (req, res) => {
  res.redirect('/note/1');
});

//渲染记事本页面
app.get('/note/:id', (req, res) => {
  // 检查是否已登录
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  
  const id = parseInt(req.params.id, 10); // 将 id 转换为整数
  if (isNaN(id) || id < 1 || id > 8) {
    return res.status(400).send('不允许的访问！<br><a href="/">返回首页</a>');
  }

  const filePath = path.join(__dirname, 'notes', `${id}.txt`);
  const noteContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  res.render('note', { note: noteContent });
});

// 保存记事本内容
app.post('/save/:id', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const id = req.params.id;
  const filePath = path.join(__dirname, 'notes', `${id}.txt`);
  const noteContent = req.body.note;
  fs.writeFileSync(filePath, noteContent);
  res.json({ success: true, message: 'Note saved successfully' });
  console.log(`save ${id}`);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
