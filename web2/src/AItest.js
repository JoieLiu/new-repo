import { GoogleGenAI } from '@google/genai';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// ----------------------------------------------------
// 移除了 TypeScript 類型定義 (type Part, type ChatMsg)
// ----------------------------------------------------

export default function AItest({
  defaultModel = 'gemini-2.5-flash', // 預設模型
  starter = '請問 Jamie Paint 的客製化寵物繪圖費用和流程？',
}) {
  // 移除了 <string> 和 <ChatMsg[]> 泛型類型
  const [model, setModel] = useState(defaultModel);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [rememberKey, setRememberKey] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // 移除了 <HTMLDivElement | null> 泛型類型
  const listRef = useRef(null);

  // Load key from localStorage (for demo only — never ship an exposed key in production)
  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) setApiKey(saved);
  }, []);

  // Warm welcome + starter (Jamie Paint 諮詢主題)
  useEffect(() => {
    setHistory([
      { role: 'model', parts: [{ text: '你好👋 我是 **Jamie Paint 寵物繪圖** 服務諮詢小幫手，很高興為您服務！請問有什麼關於客製化服務的問題嗎？' }] },
    ]);
    if (starter) setInput(starter);
  }, [starter]);

  // auto-scroll to bottom
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [history, loading]);

  const ai = useMemo(() => {
    try {
      // 檢查 apiKey 是否存在
      return apiKey ? new GoogleGenAI({ apiKey }) : null;
    } catch {
      return null;
    }
  }, [apiKey]);

  async function sendMessage(message) { // 移除了 message 的類型註釋
    const content = (message ?? input).trim();
    if (!content || loading) return;
    if (!ai) { setError('請先輸入有效的 Gemini API Key'); return; }

    setError('');
    setLoading(true);

    // 移除了新陣列的類型註釋
    const newHistory = [...history, { role: 'user', parts: [{ text: content }] }];
    setHistory(newHistory);
    setInput('');

    try {
      // Use the official SDK directly in the browser
      // 將 Jamie Paint 的背景資訊作為 system instruction 傳遞給模型，以獲得更相關的回答
      const systemInstruction = `你是一個專業的客服機器人，專門提供 Jamie Paint 客製化寵物繪圖服務的資訊。
        主要服務資訊如下：
        - 產品：寵物似顏繪 (單色/色塊背景)。
        - 費用：NT$500/隻。
        - 流程：請前往蝦皮頁面或私訊 Instagram 諮詢 -> 確認報價匯款 -> 繪圖 (一般 7-10 工作天) -> 校稿 (1-2 次免費修改) -> 提供圖稿。
        - 聯絡：蝦皮賣場網址：https://shopee.tw/jiunjiun0625 或 Instagram 私訊 (jamie_paint)。
        - 急件：可加價，需先確認檔期。
        請根據這些資訊和使用者的對話歷史來回答問題。如果使用者詢問與繪圖無關的問題，請禮貌地引導他們回到繪圖服務上。`;

      const resp = await ai.models.generateContent({
        model,
        contents: newHistory, // send the chat history to keep context
        config: {
          systemInstruction: systemInstruction,
        }
      });

      const reply = resp.text || '[No content]';
      setHistory(h => [...h, { role: 'model', parts: [{ text: reply }] }]);
    } catch (err) { // 移除了 err 的類型註釋
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function renderMarkdownLike(text) {
    const lines = text.split(/\n/);
    return (
      <>
        {lines.map((ln, i) => (
          <div key={i} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{ln}</div>
        ))}
      </>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>Jamie Paint 寵物繪圖諮詢小幫手 🎨🐶</div>

        {/* Controls (Model and API Key) */}
        <div style={styles.controls}>
          <div style={styles.controlGroup}>
            <label style={styles.label}>
              <span style={styles.labelTitle}>模型 (Model)</span>
              <input
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="例如 gemini-2.5-flash"
                style={styles.input}
                // 顯示目前使用的模型
                disabled={loading} 
              />
            </label>
            <div style={styles.controlInfo}>
              目前使用模型為: **{model}**
            </div>
          </div>
          <div style={styles.controlGroup}>
            <label style={styles.label}>
              <span style={styles.labelTitle}>Gemini API Key</span>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  const v = e.target.value; setApiKey(v);
                  if (rememberKey) localStorage.setItem('gemini_api_key', v);
                }}
                placeholder="貼上你的 API Key"
                style={styles.input}
              />
            </label>
            <label style={styles.keyRememberLabel}>
              <input type="checkbox" checked={rememberKey} onChange={(e)=>{
                setRememberKey(e.target.checked);
                if (!e.target.checked) localStorage.removeItem('gemini_api_key');
                else if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
              }} />
              <span>記住在本機（localStorage）</span>
            </label>
          </div>
        </div>
        
        {/* 外部連結按鈕區塊 (已將 LINE 替換為 蝦皮) */}
        <div style={styles.externalLinks}>
          <a
            href="https://www.instagram.com/jamie_paint/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.linkBtn, background: '#e1306c' }}
          >
            📸 前往 Instagram (作品集)
          </a>
          <a
            href="https://shopee.tw/jiunjiun0625"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.linkBtn, background: '#f53d2d' }} // 蝦皮標準色
          >
            🛒 前往蝦皮賣場
          </a>
        </div>


        {/* Messages */}
        <div ref={listRef} style={styles.messages}>
          {history.map((m, idx) => (
            <div
              key={idx}
              style={{
                ...styles.msgContainer,
                ...(m.role === 'user' ? styles.userContainer : styles.assistantContainer)
              }}
            >
              <div style={m.role === 'user' ? styles.userMsg : styles.assistantMsg}>
                <div style={styles.msgBody}>{renderMarkdownLike(m.parts.map(p => p.text).join('\n'))}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.msgContainer, ...styles.assistantContainer }}>
              <div style={styles.assistantMsg}>
                <div style={styles.msgBody}>思考中…</div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>⚠ {error}</div>
        )}

        {/* Composer */}
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(); }}
          style={styles.composer}
        >
          <input
            placeholder="輸入您的問題，例如：請問繪圖費用是多少？"
            value={input}
            onChange={e => setInput(e.target.value)}
            style={styles.textInput}
          />
          <button type="submit" disabled={loading || !input.trim() || !apiKey} style={styles.sendBtn}>
            {loading ? '傳送中' : '傳送'}
          </button>
        </form>

        {/* Quick examples (FAQ) */}
        <div style={styles.suggestionList}>
          {['請問繪圖費用是多少？', '客製化流程如何進行？', '急件製作需要多久？', '對照片有什麼要求嗎？'].map((q) => (
            <button key={q} type="button" style={styles.suggestion} onClick={() => sendMessage(q)}>{q}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 移除了 Record<string, React.CSSProperties> 的類型註釋
const styles = {
  wrap: { 
    display: 'flex', 
    justifyContent: 'center', 
    padding: 16, 
    background: '#f0f2f5', 
    minHeight: '100vh' 
  },
  card: {
    width: 'min(768px, 100%)', 
    height: '80vh', 
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    borderRadius: 20, 
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', 
    overflow: 'hidden',
  },
  header: {
    padding: '12px 20px',
    fontWeight: 600,
    fontSize: 18,
    color: '#333',
    background: '#f9fafb',
    textAlign: 'center',
    borderBottom: '1px solid #eee',
  },
  controls: {
    display: 'flex',
    gap: 16,
    padding: 16,
    borderBottom: '1px dashed #eee', 
    fontSize: 12,
  },
  controlGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  label: { display: 'grid', gap: 4 },
  labelTitle: { fontWeight: 500, opacity: 0.8 },
  controlInfo: { fontSize: 11, opacity: 0.6, marginTop: 4 },
  input: { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: '100%' },
  keyRememberLabel: { display:'flex', alignItems:'center', gap:6, marginTop:4, fontSize:11, opacity: 0.7 },
  
  // 外部連結按鈕區塊樣式
  externalLinks: {
    display: 'flex',
    gap: 8,
    padding: 12,
    background: '#fff',
    borderBottom: '1px solid #eee',
    justifyContent: 'center',
  },
  linkBtn: {
    padding: '8px 15px',
    borderRadius: 8,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  
  messages: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flexGrow: 1, 
    overflowY: 'auto',
    backgroundColor: '#fff',
  },
  msgContainer: {
    display: 'flex',
    maxWidth: '85%', 
  },
  userContainer: {
    justifyContent: 'flex-end', 
    marginLeft: 'auto',
  },
  assistantContainer: {
    justifyContent: 'flex-start', 
    marginRight: 'auto',
  },
  userMsg: {
    borderRadius: '16px 16px 0 16px', 
    padding: '10px 14px',
    background: '#007aff', 
    color: '#fff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  assistantMsg: {
    borderRadius: '16px 16px 16px 0', 
    padding: '10px 14px',
    background: '#e5e7eb', 
    color: '#333',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  msgBody: { fontSize: 14, lineHeight: 1.5 },
  error: { color: '#b91c1c', padding: '8px 16px', borderTop: '1px solid #fecaca', background: '#fef2f2' },
  
  composer: { 
    padding: 16, 
    display: 'grid', 
    gridTemplateColumns: '1fr auto', 
    gap: 10, 
    borderTop: '1px solid #eee',
    background: '#fff',
  },
  textInput: { 
    padding: '12px 16px', 
    borderRadius: 24, 
    border: '1px solid #ddd', 
    fontSize: 14,
    flexGrow: 1,
  },
  sendBtn: { 
    padding: '0 20px', 
    borderRadius: 24, 
    border: 'none', 
    background: '#007aff', 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 600,
    cursor: 'pointer',
    opacity: 1,
    transition: 'opacity 0.2s',
    display: 'flex',
    alignItems: 'center', 
    justifyContent: 'center',
    height: 'auto',
  },
  suggestionList: { 
    display: 'flex', 
    gap: 8, 
    flexWrap: 'wrap', 
    padding: '0 16px 16px',
    borderTop: '1px solid #eee', 
    background: '#fff',
  },
  suggestion: { 
    padding: '6px 12px', 
    borderRadius: 20, 
    border: '1px solid #ccc', 
    background: '#f9fafb', 
    cursor: 'pointer', 
    fontSize: 12,
    color: '#4b5563',
    transition: 'background 0.2s',
  },
};