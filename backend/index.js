const express = require('express');
// const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;

// 使用 CORS 和 bodyParser 中間件
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.0.157:3000'],
  credentials: true
}));

app.use(bodyParser.json());


app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

//const User = mongoose.model('User', userSchema);
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mini_project', 'hsh', '@Aa82851620', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log, // 可选：用于调试
});
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
});

app.post('/register', async (req, res) => {
  console.log('Received POST request to /register');
  console.log('Request body:', req.body);

  const { username, password } = req.body;
  try {
    const user = await User.create({ username, password });
    res.json(user);
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      // 用戶名已存在，返回 409 衝突錯誤
      res.status(409).json({ error: '用戶名已存在' });
    } else {
      console.error('註冊失敗：', error);
      res.status(500).json({ error: '註冊失敗' });
    }
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username, password } });
    if (user) {
      res.json({ message: '登入成功', user });
    } else {
      res.status(401).json({ message: '帳號或密碼錯誤' });
    }
  } catch (error) {
    console.error('登入失敗：', error);
    res.status(500).json({ error: '登入失敗' });
  }
});



app.get('/', (req, res) => {
  res.send('伺服器已正常運行');
});

sequelize.authenticate()
  .then(() => {
    console.log('DB連接成功。');
  })
  .catch(err => {
    console.error('DB無法連接: ', err);
  });

  sequelize.sync({ alter: true })
  .then(() => {
    console.log('數據庫同步成功。');

    // 將 app.listen 放在這裡
    app.listen(5000, '0.0.0.0', () => {
      console.log('後端伺服器運行在端口 5000');
    });
  })
  .catch(err => {
    console.error('數據庫同步失敗：', err);
  });
