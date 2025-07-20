"use client"

import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send,
  User,
  Sparkles,
  Copy,
  RotateCcw
} from "lucide-react";

export default function Playground() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "👋 Hi! I'm your AI marketing analyst. Let's analyze your website and create a winning marketing strategy.\n\nPlease share your website URL to get started:",
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextId, setContextId] = useState(null);
  const [stage, setStage] = useState('url'); // url, analyzing, analyzed, questions
  const messagesEndRef = useRef(null);
  const userId = "demo-user-123";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type, content, options = {}) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date(),
      ...options
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userInput = inputValue.trim();
    setInputValue("");
    
    // Add user message
    addMessage('user', userInput);
    
    if (stage === 'url') {
      await handleUrlAnalysis(userInput);
    } else if (stage === 'questions') {
      await handleMarketingQuestion(userInput);
    }
  };

  const handleUrlAnalysis = async (url) => {
    setIsLoading(true);
    setStage('analyzing');
    
    // Add analyzing message
    const analyzingMessage = addMessage('ai', '🔍 Analyzing your website... This may take 30-60 seconds.\n\n⏳ Crawling website content\n📊 Researching competitors\n🧠 Generating insights', { isLoading: true });

    try {
      const result = await apiClient.analyzeContext({ url, userId });
      
      if (result.success) {
        setContextId(result.contextId);
        setStage('analyzed');
        
        // Remove loading message and add results
        setMessages(prev => prev.filter(msg => msg.id !== analyzingMessage.id));
        
        addMessage('ai', `✅ **Website Analysis Complete!**\n\n📈 **Quick Summary:**\n• ${result.summary.pagesAnalyzed} pages analyzed\n• ${result.summary.searchTerms} search terms identified\n• ${result.summary.competitorData} competitors researched\n\n🎯 **Ready for Marketing Strategy!**\n\nNow I can help you with specific marketing questions. Try asking:\n\n• "What are the top 3 marketing opportunities?"\n• "Who is the target audience and how to reach them?"\n• "What are competitors doing differently?"\n• "How to improve conversion rates?"\n• "What content strategy would work best?"\n\nWhat would you like to know?`);
        
        setStage('questions');
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
      
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== analyzingMessage.id));
      addMessage('ai', `❌ **Analysis Failed**\n\nI couldn't analyze that website. This could be due to:\n• Website blocks crawlers\n• Invalid URL format\n• Temporary service issues\n\nPlease try a different URL or try again later.`);
      setStage('url');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarketingQuestion = async (question) => {
    if (!contextId) return;
    
    setIsLoading(true);
    
    // Add thinking message
    const thinkingMessage = addMessage('ai', '🤔 Analyzing your question and consulting multiple AI models...', { isLoading: true });

    try {
      // Get responses from multiple models
      const [openaiResult, claudeResult, openrouterResult] = await Promise.allSettled([
        apiClient.chatWithContext({ contextId, question, model: 'openai' }),
        apiClient.chatWithContext({ contextId, question, model: 'anthropic' }),
        apiClient.chatWithContext({ contextId, question, model: 'openrouter' })
      ]);

      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));

      // Format multi-model response
      let responseContent = `## 🎯 Marketing Insights: "${question}"\n\n`;
      
      if (openaiResult.status === 'fulfilled') {
        responseContent += `### 🤖 **GPT-4 Analysis:**\n${openaiResult.value.content}\n\n`;
      }
      
      if (claudeResult.status === 'fulfilled') {
        responseContent += `### 🧠 **Claude 3.5 Analysis:**\n${claudeResult.value.content}\n\n`;
      }
      
      if (openrouterResult.status === 'fulfilled') {
        responseContent += `### ⚡ **OpenRouter Analysis:**\n${openrouterResult.value.content}\n\n`;
      }

      responseContent += `---\n\n💡 **What else would you like to know about your marketing strategy?**`;

      addMessage('ai', responseContent, { isMultiModel: true });
      
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
      addMessage('ai', `❌ **Error generating insights**\n\nSorry, I couldn't process your question right now. Please try again or ask a different question.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: "👋 Hi! I'm your AI marketing analyst. Let's analyze your website and create a winning marketing strategy.\n\nPlease share your website URL to get started:",
        timestamp: new Date()
      }
    ]);
    setInputValue("");
    setContextId(null);
    setStage('url');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">AI Marketing Analyst</h1>
              <p className="text-sm text-gray-500">Website analysis & strategy insights</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.type === 'ai' && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`max-w-3xl ${message.type === 'user' ? 'order-first' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white ml-auto' 
                    : 'bg-white border shadow-sm'
                }`}>
                  {message.isLoading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    <div className={`prose prose-sm max-w-none ${message.type === 'user' ? 'prose-invert' : ''}`}>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {message.content.split('\n').map((line, index) => {
                          // Handle markdown-style formatting
                          if (line.startsWith('##')) {
                            return <h2 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-900">{line.replace('##', '').trim()}</h2>;
                          }
                          if (line.startsWith('###')) {
                            return <h3 key={index} className="text-base font-semibold mt-3 mb-2 text-gray-800">{line.replace('###', '').trim()}</h3>;
                          }
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return <p key={index} className="font-semibold text-gray-900">{line.replace(/\*\*/g, '')}</p>;
                          }
                          if (line.startsWith('•')) {
                            return <p key={index} className="ml-4 text-gray-700">{line}</p>;
                          }
                          if (line === '---') {
                            return <hr key={index} className="my-4 border-gray-200" />;
                          }
                          return line ? <p key={index} className="text-gray-700">{line}</p> : <br key={index} />;
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Copy button for AI messages */}
                  {message.type === 'ai' && !message.isLoading && (
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  )}
                </div>
                
                {/* Timestamp */}
                <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white px-4 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  stage === 'url' 
                    ? "Enter your website URL (e.g., https://example.com)" 
                    : "Ask a marketing question..."
                }
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="px-4"
            >
              {isLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Status indicator */}
          {isLoading && (
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
              AI is {stage === 'analyzing' ? 'analyzing your website' : 'generating insights'}...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}