const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;
const fs = require('fs');

// 使用 body-parser 解析 POST 请求的 body
app.use(bodyParser.urlencoded({ extended: true }));

// 提供静态文件 (CSS)
app.use(express.static(path.join(__dirname, 'public')));

//渲染导航页
app.get('/', (req, res) => {
  res.redirect('/note/1');
});

//渲染记事本页面
app.get('/note/:id', (req, res) => {
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
