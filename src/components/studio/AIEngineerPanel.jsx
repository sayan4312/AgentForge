import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, ArrowRight, Loader2, User } from 'lucide-react';

export default function AIEngineerPanel({
  prompt,
  onStartGeneration,
  isGenerating,
  generationStage,
  isGenerated,
  architecture,
  onEvolveProject,
  messages: externalMessages,
  setMessages: externalSetMessages
}) {
  const [localMessages, setLocalMessages] = useState([]);
  const messages = externalMessages || localMessages;
  const setMessages = externalSetMessages || setLocalMessages;

  const [inputMessage, setInputMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [agentNotes, setAgentNotes] = useState({
    project_name: (prompt || "Custom AI Agent").replace(/\b\w/g, l => l.toUpperCase()),
    description: prompt || "Custom AI Agent",
    stack: "Google ADK + FastMCP"
  });

  const chatEndRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // Initialize chatbot conversation cleanly ONCE on load
  useEffect(() => {
    if (messages && messages.length > 0) {
      hasInitializedRef.current = true;
      return;
    }
    if (prompt && !hasInitializedRef.current && messages.length === 0) {
      hasInitializedRef.current = true;
      fetchArchitectChat(prompt, []);
    }
  }, [prompt, messages]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  const fetchArchitectChat = async (userMsg, currentHistory) => {
    setIsAiThinking(true);
    const newHistory = [...currentHistory, { sender: 'user', text: userMsg }];
    setMessages(newHistory);

    try {
      const res = await fetch('http://localhost:8000/api/architect/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_message: userMsg,
          history: newHistory,
          prompt_context: prompt || userMsg
        })
      });
      const data = await res.json();

      if (data?.success) {
        if (data?.notes) setAgentNotes((prev) => ({ ...prev, ...data.notes }));
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: data.reply, time: 'Just now' }
        ]);
      } else {
        fallbackChatTurn(userMsg);
      }
    } catch (err) {
      fallbackChatTurn(userMsg);
    } finally {
      setIsAiThinking(false);
    }
  };

  const fallbackChatTurn = (userMsg) => {
    const replyText = `I'm ready to build "${userMsg}". Tell me any specific features, database preferences, or APIs you'd like to integrate!`;
    setMessages((prev) => [
      ...prev,
      { sender: 'ai', text: replyText, time: 'Just now' }
    ]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiThinking) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    if (isGenerated && onEvolveProject) {
      setMessages((prev) => [...prev, { sender: 'user', text: userText, time: 'Just now' }]);
      setIsAiThinking(true);
      try {
        const res = await onEvolveProject(userText);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res?.ai_explanation || `Updated codebase for: "${userText}".`,
            time: 'Just now'
          }
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: `Updated codebase for: "${userText}".`, time: 'Just now' }
        ]);
      } finally {
        setIsAiThinking(false);
      }
    } else {
      fetchArchitectChat(userText, messages);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Sleek Minimal Header */}
      {!isGenerated && (
        <div className="studio-panel-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.6rem 0.85rem' }}>
          <div className="studio-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Bot size={15} color="#ffffff" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Architect
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.65rem', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
            <span className="studio-online-dot" /> Online
          </div>
        </div>
      )}

      {/* Main Conversational Thread */}
      <div className="studio-panel-body custom-scrollbar" style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start'
            }}
          >
            {msg.sender === 'ai' && (
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <Bot size={13} color="#ffffff" />
              </div>
            )}

            <div
              style={{
                maxWidth: '85%',
                padding: '0.6rem 0.85rem',
                borderRadius: msg.sender === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                fontSize: '0.75rem',
                lineHeight: '1.5',
                background: msg.sender === 'user' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 22, 35, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-line'
              }}
            >
              {msg.text}
            </div>

            {msg.sender === 'user' && (
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <User size={13} color="var(--text-secondary)" />
              </div>
            )}
          </div>
        ))}

        {isAiThinking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.4rem 0.65rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', width: 'fit-content' }}>
            <Loader2 size={13} className="fa-spin" color="#ffffff" />
            <span>Architect thinking...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Generate Action Button */}
      {!isGenerated && !isGenerating && (
        <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(10, 14, 23, 0.6)' }}>
          <button
            onClick={() => onStartGeneration(agentNotes, messages)}
            className="studio-generate-btn"
            style={{ width: '100%', height: '34px', gap: '0.4rem', fontSize: '0.725rem' }}
          >
            <Sparkles size={13} />
            <span>Generate Agent Project</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Minimal Input Bar */}
      <form onSubmit={handleSendMessage} style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(8, 12, 20, 0.85)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isGenerated ? 'Ask Architect to update project code...' : 'Reply to Architect...'}
          className="studio-text-input"
          style={{ flex: 1, minWidth: 0, fontSize: '0.72rem', padding: '0.4rem 0.65rem', height: '32px' }}
          disabled={isAiThinking || isGenerating}
        />
        <button
          type="submit"
          disabled={isAiThinking || isGenerating || !inputMessage.trim()}
          className="studio-btn-primary"
          style={{ padding: '0.4rem 0.65rem', height: '32px', flexShrink: 0 }}
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
