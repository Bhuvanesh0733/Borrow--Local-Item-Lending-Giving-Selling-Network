import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../api/socket';
import './Chat.css';

export default function Chat() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [request, setRequest] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef();
  const typingTimer = useRef();

  useEffect(() => {
    api.get(`/messages/${requestId}`).then(r => setMessages(r.data)).catch(() => {});
    Promise.all([
      api.get('/requests?type=incoming'),
      api.get('/requests?type=outgoing')
    ]).then(([inc, out]) => {
      const found = [...inc.data, ...out.data].find(r => r._id === requestId);
      if (found) setRequest(found);
    });

    const socket = getSocket();
    socket.emit('join_chat', requestId);
    socket.on('message', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('typing', () => {
      setTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(false), 2000);
    });

    return () => {
      socket.emit('leave_chat', requestId);
      socket.off('message');
      socket.off('typing');
    };
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post(`/messages/${requestId}`, { text });
      setText('');
    } catch {}
    setSending(false);
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    getSocket().emit('typing', { requestId });
  };

  const myId = user?._id || user?.id;

  return (
    <div className="page chat-page">
      <div className="container chat-container">
        {request && (
          <div className="chat-context card">
            <div className="chat-context-img">
              {request.item?.images?.[0]
                ? <img src={`${process.env.REACT_APP_SOCKET_URL}${request.item.images[0]}`} alt="" />
                : <span>📦</span>}
            </div>
            <div>
              <Link to={`/items/${request.item?._id}`} className="chat-item-title">{request.item?.title}</Link>
              <div className="chat-meta">
                <span className={`badge badge-${request.type}`}>{request.type}</span>
                <span className={`badge badge-${request.status}`}>{request.status}</span>
              </div>
            </div>
          </div>
        )}

        <div className="messages-area">
          {messages.map((msg, i) => {
            const isMe = msg.sender?._id === myId;
            return (
              <motion.div key={msg._id || i} className={`message ${isMe ? 'mine' : 'theirs'}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {!isMe && <div className="msg-avatar">{msg.sender?.name?.[0]?.toUpperCase()}</div>}
                <div className="msg-bubble">
                  <p>{msg.text}</p>
                  <span className="msg-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
          {typing && (
            <div className="message theirs">
              <div className="msg-avatar">•</div>
              <div className="msg-bubble typing-indicator"><span /><span /><span /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form className="chat-input-bar" onSubmit={sendMessage}>
          <input className="form-input chat-input" value={text} onChange={handleTyping}
            placeholder="Type a message..." autoFocus />
          <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>Send →</button>
        </form>
      </div>
    </div>
  );
}
