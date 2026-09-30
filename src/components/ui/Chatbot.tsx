"use client";

import { useRef, useState, useEffect } from 'react';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'bot', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    sessionId.current ??= crypto.randomUUID();
    setInput('');
    
    // Filter out previous client-side error fallback notifications so they don't pollute Gemini context
    const cleanHistory = messages.filter(
      (m) => m.content !== "The AI is currently experiencing high demand. Please try again momentarily."
    );
    const newMessages: {role: 'user'|'bot', content: string}[] = [
      ...cleanHistory, 
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, sessionId: sessionId.current })
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', content: "The AI is currently experiencing high demand. Please try again momentarily." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 p-4 bg-brand-900 text-brand-50 rounded-full shadow-[0_16px_32px_-12px_rgba(0,0,0,0.4)] hover:scale-105 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 border border-white/10"
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[380px] h-[600px] max-h-[80vh] flex flex-col bg-white border border-black/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden rounded-2xl origin-bottom-right transition-all duration-200">
          <div className="bg-brand-50 text-brand-900 px-4 py-3 sm:px-5 sm:py-4 flex justify-between items-center border-b border-black/5">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="font-sans font-medium tracking-tight text-sm">Infriva AI Assistant</h3>
            </div>
            <button 
              onClick={toggleChat} 
              aria-label="Close chat"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-black/40 hover:text-black transition-colors rounded-lg cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-5 font-sans bg-white no-scrollbar">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-3">
                <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mb-2 border border-black/5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <p className="text-black/60 text-sm font-medium">How can we help structure your digital system today?</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-brand-900 text-brand-50 rounded-2xl rounded-tr-sm' 
                      : 'bg-brand-50 text-brand-900 rounded-2xl rounded-tl-sm border border-black/5'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 text-sm bg-brand-50 text-brand-900 border border-black/5 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-black/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-black/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="border-t border-black/5 p-3 bg-white flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message..."
              aria-label="Message input"
              className="flex-1 bg-brand-50 border border-black/5 rounded-xl px-4 text-brand-900 focus:outline-none focus:ring-1 focus:ring-brand-900/20 transition-all font-sans text-sm placeholder:text-black/30"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              aria-label="Send message"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-brand-900 text-brand-50 flex items-center justify-center hover:scale-105 hover:bg-black transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
              disabled={isLoading || !input.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
