const express = require('express');
// const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5050;


let matchingPool = []; // 配對池，用來存放等待配對的用戶
let matchResults = {}; // 存儲用戶的配對結果

// 使用 CORS 和 bodyParser 中間件
app.use(cors({
  origin: ['http://localhost:3001'],
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
  dialect: 'postgres',
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

// 新增配對 API
app.post('/match', (req, res) => {
  const { username } = req.body;

  // 確保用戶名是有效的
  if (!username) {
    return res.status(400).json({ message: '用戶名不能為空' });
  }

  // 如果該用戶已經在配對池中，返回一條消息，避免重複加入
  if (matchingPool.includes(username)) {
    return res.status(400).json({ message: '您已經在等待配對中，請耐心等待' });
  }

  // 將用戶加入配對池
  matchingPool.push(username);
  console.log(`${username} 加入配對池`);

  // 當配對池中有兩個不同的用戶時，進行配對
  if (matchingPool.length >= 2) {
    let matchUser;

    // 尋找一個與當前用戶不同的配對對象
    for (let i = 0; i < matchingPool.length; i++) {
      if (matchingPool[i] !== username) {
        matchUser = matchingPool[i];
        matchingPool.splice(i, 1); // 將該用戶從配對池中移除
        break;
      }
    }

    // 如果找到了一個不同的用戶，進行配對
    if (matchUser) {
      matchingPool = matchingPool.filter(user => user !== username); // 從配對池中移除當前用戶
      console.log(`配對成功：${username} 與 ${matchUser}`);

      // 將配對結果存儲，以便兩位用戶可以查詢
      matchResults[username] = matchUser;
      matchResults[matchUser] = username;

      return res.json({ message: `配對成功！配對對象: ${matchUser}` });
    }
  }

  // 如果池中只有自己，返回等待配對的消息
  return res.status(200).json({ message: '等待配對中...' });
});

// 用戶查詢配對結果的 API
app.get('/match-result/:username', (req, res) => {
  const { username } = req.params;

  if (matchResults[username]) {
    return res.json({ message: `配對成功！配對對象: ${matchResults[username]}` });
  } else {
    return res.status(200).json({ message: '等待配對中...' });
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
    app.listen(5050, '0.0.0.0', () => {
      console.log('後端伺服器運行在端口 5050');
    });
  })
  .catch(err => {
    console.error('數據庫同步失敗：', err);
  });
