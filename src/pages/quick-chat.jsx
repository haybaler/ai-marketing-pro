'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Bot, User } from 'lucide-react';
import { format } from 'date-fns';

export default function QuickChat() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', content: '👋 Hi! Ask me any marketing question and I\'ll provide insights based on up-to-date search data.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput('');

    // Add user message
    setMessages((prev) => [...prev, { id: Date.now(), type: 'user', content: question, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/quick-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      const aiContent = data.content || 'Sorry, I could not generate an answer.';
      setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'ai', content: aiContent, timestamp: new Date() }]);
    } catch (error) {
      console.error('Quick chat error:', error);
      setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'ai', content: 'Error generating answer. Please try again.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <h1 className="font-semibold text-gray-900">Quick Marketing Chat</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-4 ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.type === 'ai' && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`max-w-3xl ${m.type === 'user' ? 'order-first' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 ${m.type === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-white border shadow-sm'}`}> 
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${m.type === 'user' ? 'text-right' : 'text-left'}`}>{format(m.timestamp, 'h:mm a')}</div>
              </div>
              {m.type === 'user' && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border shadow-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-gray-600">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t bg-white px-4 py-4 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your marketing question..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <Button type="submit" disabled={!input.trim() || isLoading} className="px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </footer>
    </div>
  );
}