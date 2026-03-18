import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { generateAnxietyResponse } from '../../lib/claude';
import useStore from '../../store/useStore';

const QUICK_REPLIES = [
  "I'm falling behind everyone 😔",
  "I failed my test again",
  "My parents won't stop asking about placements",
  "I don't think I'm good enough",
  "I can't understand anything I study",
  "Everyone else is getting internships",
];

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h >= 0 && h < 5) return '2AM 🌙';
  if (h < 12) return 'morning ☀️';
  if (h < 17) return 'afternoon 🌤️';
  if (h < 21) return 'evening 🌆';
  return 'night 🌙';
};

const getOpeningMessage = () => {
  const h = new Date().getHours();
  if (h >= 22 || h < 5) {
    return "Hey. It's late. You okay? 🌙\n\nThis space is here whenever you need it. What's on your mind?";
  }
  return "Hey! I'm here to talk — about anything.\n\nPlacement stress, feeling behind, comparison anxiety, family pressure... whatever's on your mind. What's up?";
};

const AnxietyChat = () => {
  const { profile } = useStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: getOpeningMessage(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput('');
    setShowQuickReplies(false);

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const timeOfDay = getTimeOfDay();
      let response;

      try {
        response = await generateAnxietyResponse(userText, timeOfDay);
      } catch {
        const fallbacks = [
          `Sunta hoon. Ye feeling bahut real hai.\n\nJo tu feel kar raha hai — woh bahut saare students feel karte hain, lekin koi bolata nahi. Tu akela nahi hai is mein.\n\nEk cheez bata — aaj kya specifically hua jo tune yeh share kiya?`,
          `Ek dum samjha. Ye pressure real hai.\n\nLekhin ek cheez yaad rakh — jo log LinkedIn pe success post karte hain, unhe bhi exactly ye wali nights aati hain. Bas woh post nahi karte.\n\nAbhi ek chhota sa kaam kar — ek task. Sirf ek. 20 minutes. Kar sakta hai?`,
          `Hey, I hear you. 💙\n\nPlacement season is brutal — especially when it feels like everyone else has it figured out. But here's what I know: you're here, you're trying, and that already puts you ahead of where you think you are.\n\nWhat's one specific thing that's worrying you the most right now?`,
          `Bilkul samjha bhai.\n\nYe comparison wali feeling — sabse dangerous hoti hai. Tu apna chapter 1 doosre ke chapter 20 se compare kar raha hai.\n\nAaj ek kaam kar — apne kal ke self se compare kar. Kya kal se better hai tu? Almost guaranteed haan.\n\nKya chhota sa step le sakta hai aaj?`,
        ];
        response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const name = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl mb-4"
          style={{ background: 'rgba(18,18,26,0.8)', border: '1px solid rgba(34,34,51,0.8)' }}>
          <div className="relative">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(0,255,148,0.2), rgba(123,97,255,0.2))' }}>
              <Sparkles size={20} className="text-primary" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-dark-800" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-white font-heading text-sm">
              Genois AI · 2AM Chat
            </h2>
            <p className="text-xs text-gray-500">
              Always here · No judgment · Just support
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.15)' }}>
            <Clock size={11} className="text-primary" />
            <span className="text-xs text-primary font-medium">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mr-2 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, rgba(0,255,148,0.2), rgba(123,97,255,0.2))' }}>
                    <Sparkles size={12} className="text-primary" />
                  </div>
                )}

                <div className={`max-w-xs md:max-w-sm ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'text-dark-900 font-medium rounded-br-sm'
                      : 'text-gray-200 rounded-bl-sm'
                  }`}
                    style={msg.role === 'user' ? {
                      background: 'linear-gradient(135deg, #00FF94, #00D68F)',
                    } : {
                      background: 'rgba(26,26,39,0.9)',
                      border: '1px solid rgba(34,34,51,0.8)',
                    }}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-600 px-1">{msg.time}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(0,255,148,0.2), rgba(123,97,255,0.2))' }}>
                <Sparkles size={12} className="text-primary" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm"
                style={{ background: 'rgba(26,26,39,0.9)', border: '1px solid rgba(34,34,51,0.8)' }}>
                <div className="flex gap-1 items-center h-4">
                  {[0,1,2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        <AnimatePresence>
          {showQuickReplies && messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3">
              <p className="text-xs text-gray-600 mb-2 px-1">Quick replies:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_REPLIES.map((reply, i) => (
                  <button key={i} onClick={() => sendMessage(reply)}
                    className="px-3 py-1.5 rounded-xl text-xs text-gray-300 transition-all hover:text-white"
                    style={{
                      background: 'rgba(26,26,39,0.8)',
                      border: '1px solid rgba(34,34,51,0.8)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,148,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(34,34,51,0.8)'}>
                    {reply}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind? (Enter to send)"
              rows={1}
              className="w-full px-4 py-3 rounded-2xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none resize-none"
              style={{
                background: 'rgba(26,26,39,0.9)',
                border: '1px solid rgba(34,34,51,0.8)',
                maxHeight: '120px',
                lineHeight: '1.5',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,255,148,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(34,34,51,0.8)'}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 flex-shrink-0"
            style={{
              background: input.trim()
                ? 'linear-gradient(135deg, #00FF94, #00D68F)'
                : 'rgba(26,26,39,0.9)',
              border: '1px solid rgba(34,34,51,0.8)',
            }}>
            <Send size={16} className={input.trim() ? 'text-dark-900' : 'text-gray-600'} />
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-700 mt-2">
          This is an AI companion. For serious concerns, please talk to someone you trust.
        </p>

      </div>
    </DashboardLayout>
  );
};

export default AnxietyChat;
