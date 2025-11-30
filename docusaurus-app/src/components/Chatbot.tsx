import React, { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  sources?: string[];
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: 'Hello! I\'m your AI assistant for the Physical AI and Robotics Course. Ask me anything about the course content!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        setSelectedContext(selection.toString().trim());
      } else {
        // Only clear if we clicked outside the chat window? 
        // For now, let's keep it simple: if user selects nothing, context remains until manually cleared or used
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/api/rag/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputValue,
          context: selectedContext
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: messages.length + 1,
          text: data.response,
          sender: 'bot',
          timestamp: new Date(),
          sources: data.sources
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: messages.length + 1,
        text: "I'm sorry, I'm having trouble connecting to the server. Please check if the backend is running.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setSelectedContext(null); // Clear context after sending
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        className={`${styles.chatToggle} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.headerContent}>
              <div className={styles.botAvatar}>🤖</div>
              <div>
                <h3>AI Course Assistant</h3>
                <span className={styles.status}>
                  <span className={styles.statusDot}></span> Online
                </span>
              </div>
            </div>
          </div>

          <div className={styles.chatMessages}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${message.sender === 'user' ? styles.userMessage : styles.botMessage
                  }`}
              >
                <div className={styles.messageContent}>
                  <p>{message.text}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className={styles.sources}>
                      <small>Sources: {message.sources.join(', ')}</small>
                    </div>
                  )}
                  <span className={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className={`${styles.message} ${styles.botMessage}`}>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {selectedContext && (
            <div className={styles.contextPreview}>
              <small>Selected Context: "{selectedContext.substring(0, 50)}..."</small>
              <button onClick={() => setSelectedContext(null)}>✕</button>
            </div>
          )}

          <div className={styles.chatInput}>
            <input
              type="text"
              placeholder="Ask about Physical AI & Robotics..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSendMessage} aria-label="Send message">
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
