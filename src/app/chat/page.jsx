'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';

export default function ChatPage() {
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageCounter, setMessageCounter] = useState(0);
  
  // Lead collection state
  const [stage, setStage] = useState('welcome'); // welcome, website, email, chat
  const [leadData, setLeadData] = useState({
    website: '',
    email: '',
    conversationId: null
  });
  const [contextId, setContextId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messageCounterRef = useRef(0);

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    const id = `msg_${Date.now()}_${messageCounterRef.current}_${Math.random().toString(36).substr(2, 9)}`;
    messageCounterRef.current += 1;
    return id;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeId = `welcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const welcomeMessage = {
        id: welcomeId,
        type: 'assistant',
        content: 'Welcome! I\'m your AI marketing assistant. To provide you with personalized insights, I\'ll need to collect some basic information first.\n\nLet\'s start with your website. What\'s your website URL?',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const validateWebsite = (url) => {
    if (!url || !url.trim()) return false;
    
    let normalizedUrl = url.trim();
    if (!normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    try {
      new URL(normalizedUrl);
      return true;
    } catch {
      return false;
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addMessage = useCallback((type, content) => {
    const messageId = `${type}_${Date.now()}_${messageCounterRef.current}_${Math.random().toString(36).substr(2, 9)}`;
    messageCounterRef.current += 1;
    
    const newMessage = {
      id: messageId,
      type,
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    return messageId;
  }, []);

  const handleStageProgression = async (userInput) => {
    switch (stage) {
      case 'welcome':
      case 'website':
        if (!validateWebsite(userInput)) {
          addMessage('assistant', 'Please provide a valid website URL (e.g., example.com or https://example.com)');
          return false;
        }
        
        let normalizedUrl = userInput.trim();
        if (!normalizedUrl.match(/^https?:\/\//)) {
          normalizedUrl = 'https://' + normalizedUrl;
        }
        
        setLeadData(prev => ({ ...prev, website: normalizedUrl }));
        setStage('email');
        
        addMessage('assistant', `Great! I've noted your website: ${normalizedUrl}\n\nNow, what's your email address? This will help me provide you with personalized recommendations and follow-up insights.`);
        return false;
      
      case 'email':
        if (!validateEmail(userInput)) {
          addMessage('assistant', 'Please provide a valid email address (e.g., you@example.com)');
          return false;
        }
        
        const email = userInput.trim().toLowerCase();
        const conversationId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        setLeadData(prev => ({ 
          ...prev, 
          email, 
          conversationId 
        }));
        
        // Save lead to database
        try {
          await apiClient.createLead(leadData.website, email, conversationId);
          
          // Start website analysis
          const analysisResponse = await apiClient.analyzeContext({ 
            url: leadData.website 
          });
          
          if (analysisResponse.success) {
            setContextId(analysisResponse.contextId);
          }
          
          setStage('chat');
          
          addMessage('assistant', `Perfect! I've saved your information and I'm now analyzing your website: ${leadData.website}\n\nI'm your dedicated AI marketing assistant, and I'll provide personalized insights based on your website. What would you like to know about your marketing strategy?`);
          
        } catch (error) {
          console.error('Failed to save lead:', error);
          addMessage('error', 'There was an issue saving your information. Let me still help you with marketing insights. What would you like to know?');
          setStage('chat');
        }
        return false;
      
      default:
        return true; // Proceed with normal chat
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);
    
    // Add user message to chat
    addMessage('user', userMessage);

    setIsLoading(true);

    try {
      // Handle stage progression (lead collection)
      if (stage !== 'chat') {
        const shouldProceedToChat = await handleStageProgression(userMessage);
        if (!shouldProceedToChat) {
          setIsLoading(false);
          return;
        }
      }
      
      // Normal chat flow
      let response;
      
      if (contextId) {
        response = await apiClient.chatWithContext({
          contextId,
          question: userMessage
        });
      } else {
        // Fallback to general marketing content generation
        response = await apiClient.generateMarketingContent({
          url: leadData.website || '',
          prompt: userMessage
        });
      }
      
      // Add assistant response
      addMessage('assistant', response.response || response.content || 'I apologize, but I couldn\'t generate a response. Please try again.');
      
    } catch (error) {
      console.error('Chat error:', error);
      setError(error.message);
      
      addMessage('error', `Sorry, I encountered an error: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message) => {
    const baseClasses = "max-w-3xl mx-auto px-4 py-3 rounded-lg";
    
    switch (message.type) {
      case 'user':
        return (
          <div key={message.id} className="flex justify-end mb-4">
            <div className={`${baseClasses} bg-blue-600 text-white`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs text-blue-200 mt-1 block">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        );
      
      case 'assistant':
        return (
          <div key={message.id} className="flex justify-start mb-4">
            <div className={`${baseClasses} bg-gray-100 text-gray-900 border`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs text-gray-500 mt-1 block">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        );
      
      case 'system':
        return (
          <div key={message.id} className="flex justify-center mb-4">
            <div className={`${baseClasses} bg-yellow-50 text-yellow-800 border border-yellow-200`}>
              <p className="text-sm text-center">{message.content}</p>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div key={message.id} className="flex justify-start mb-4">
            <div className={`${baseClasses} bg-red-50 text-red-800 border border-red-200`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs text-red-600 mt-1 block">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getStageIndicator = useCallback(() => {
    const stages = [
      { key: 'welcome', label: 'Welcome', completed: stage !== 'welcome' },
      { key: 'website', label: 'Website', completed: leadData.website && stage !== 'website' },
      { key: 'email', label: 'Email', completed: leadData.email && stage !== 'email' },
      { key: 'chat', label: 'Chat', completed: stage === 'chat' }
    ];
    
    return (
      <div className="flex items-center space-x-2 text-sm">
        {stages.map((stageItem, index) => (
          <div key={`stage-${stageItem.key}-${index}`} className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${
              stageItem.completed 
                ? 'bg-green-500' 
                : stage === stageItem.key 
                ? 'bg-blue-500' 
                : 'bg-gray-300'
            }`} />
            <span className={`ml-1 ${
              stageItem.completed 
                ? 'text-green-700' 
                : stage === stageItem.key 
                ? 'text-blue-700' 
                : 'text-gray-500'
            }`}>
              {stageItem.label}
            </span>
            {index < stages.length - 1 && (
              <div key={`separator-${index}`} className="w-4 h-px bg-gray-300 mx-2" />
            )}
          </div>
        ))}
      </div>
    );
  }, [stage, leadData.website, leadData.email]);

  const getPlaceholderText = () => {
    switch (stage) {
      case 'welcome':
      case 'website':
        return 'Enter your website URL (e.g., example.com)';
      case 'email':
        return 'Enter your email address';
      case 'chat':
        return 'Ask about marketing strategies, competitor analysis, SEO tips...';
      default:
        return 'Type your message...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Marketing Pro</h1>
              <p className="text-gray-600 mt-1">
                Get personalized marketing insights and strategies
              </p>
            </div>
            <div className="text-right">
              {getStageIndicator()}
            </div>
          </div>
          
          {/* Lead data badges */}
          {(leadData.website || leadData.email) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {leadData.website && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Website: {new URL(leadData.website).hostname}
                </span>
              )}
              {leadData.email && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Email: {leadData.email}
                </span>
              )}
              {contextId && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Analysis Active
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.map(renderMessage)}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="max-w-3xl mx-auto px-4 py-3 rounded-lg bg-gray-100 border">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Processing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={getPlaceholderText()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
