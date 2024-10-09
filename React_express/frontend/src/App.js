
import React, { useState } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    try {
      console.log('Sending registration request to backend...');  // 調試：檢查是否發送了請求
      console.log('Request body:', { username, password });  // 調試：顯示發送的數據

      const response = await fetch('http://192.168.0.157:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      console.log('Response status:', response.status);  // 調試：顯示後端返回的 HTTP 狀態碼
      
      if (response.ok) {
        const data = await response.json();
        setMessage(`Registered as ${data.username}`);
      } else if (response.status === 409) {
        setMessage('用戶名已存在，請選擇其他用戶名');
        setUsername(''); // 清空用戶名輸入框
      } else {
        const errorData = await response.json();
        setMessage(`註冊失敗：${errorData.error}`);
      } 
    } catch (error) {
      console.error('Error in handleRegister:', error);
      setMessage('註冊失敗');
    }
  };
  

const handleLogin = async () => {
  try {
    const response = await fetch('http://192.168.0.157:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      setMessage(`Welcome back, ${data.user.username}`);
    } else {
      setMessage('Login failed');
    }
  } catch (error) {
    console.error('Error in handleLogin:', error);
    setMessage('Login failed');
  }
};


  return (
    <div>
      <h2>Register / Login</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
      <button onClick={handleLogin}>Login</button>
      <p>{message}</p>
    </div>
  );
}

export default App;
