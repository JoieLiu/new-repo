import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App'; // 移除未使用的導入
import reportWebVitals from './reportWebVitals';
import AItest from './AItest';

// 確保這裡是您 HTML 中的正確 ID: 'react-root'
const root = ReactDOM.createRoot(document.getElementById('react-root')); 
// 移除未使用的變數 el

root.render(
  <React.StrictMode>
    <AItest /> {/* 渲染您指定的元件 */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();