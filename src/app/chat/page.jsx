'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Send, Menu, X, MessageSquare, Plus, Trash2, Bot, User } from 'lucide-react';
import { 
  getConversations, 
  getConversation, 
  addMessageToConversation, 
  deleteConversation,
  createConversation,
  getUserEmail 
} from '@/lib/conversations';
import { apiClient } from '@/api/client';
import { format } from 'date-fns';

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const messagesEndRef = useRef(null);

  // Load initial data
  useEffect(() => {
    const email = getUserEmail();
    if (!email) {
      router.push('/');
      return;
    }
    
    setUserEmail(email);
    loadConversations();
    
    // Check for conversation ID in URL
    const conversationId = searchParams.get('id');
    if (conversationId) {
      setSelectedConversationId(conversationId);
      loadConversation(conversationId);
    }
  }, [searchParams, router]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  const loadConversations = () => {
    const convs = getConversations();
    setConversations(convs);
  };

  const loadConversation = (id) => {
    const conv = getConversation(id);
    setCurrentConversation(conv);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput('');
    setIsLoading(true);
    let conversationId = selectedConversationId;
    let conversation = currentConversation;

    try {
      // Create new conversation if none selected
      if (!conversationId) {
        const newConv = createConversation('New Chat');
        conversationId = newConv.id;
        setSelectedConversationId(conversationId);
        conversation = newConv;
        setCurrentConversation(conversation);
        loadConversations();
      }

      // Add user message
      const userMessage = {
        type: 'user',
        content: messageText,
        timestamp: new Date().toISOString()
      };
      
      const updatedConv = addMessageToConversation(conversationId, userMessage);
      setCurrentConversation(updatedConv);
      loadConversations();

      // Get AI response
      const aiResponse = await apiClient.chatWithContext({
        message: messageText,
        context: conversation?.contextId ? { id: conversation.contextId } : null,
        userId: userEmail
      });

      // Add AI response to conversation
      const aiMessage = {
        type: 'ai',
        content: aiResponse.message || "I'm here to help with your marketing needs. How can I assist you today?",
        timestamp: new Date().toISOString()
      };
      
      const finalConv = addMessageToConversation(conversationId, aiMessage);
      setCurrentConversation(finalConv);
      loadConversations();
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to conversation
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        isError: true,
        timestamp: new Date().toISOString()
      };
      
      const errorConv = addMessageToConversation(conversationId, errorMessage);
      setCurrentConversation(errorConv);
      loadConversations();
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setSelectedConversationId(null);
    setCurrentConversation(null);
    router.push('/chat');
  };

  const handleDeleteConversation = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(id);
      
      if (selectedConversationId === id) {
        setSelectedConversationId(null);
        setCurrentConversation(null);
      }
      
      loadConversations();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200">
          <Button 
            onClick={handleNewChat}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setSelectedConversationId(conv.id);
                loadConversation(conv.id);
                if (window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
              className={`px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 ${
                selectedConversationId === conv.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
              }`}
            >
              <div className="truncate pr-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {conv.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {format(new Date(conv.updatedAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="px-4 py-8 text-center">
              <MessageSquare className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Start a new chat to begin</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {userEmail?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900">
                  {userEmail || 'User'}
                </p>
                <p className="text-xs text-gray-500">Free Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {currentConversation && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <h1 className="font-semibold ml-2">
                  {currentConversation?.title || 'AI Marketing Chat'}
                </h1>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentConversation?.messages && currentConversation.messages.length > 0 ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {currentConversation.messages.map((message) => (
                <div
                  key={message.id || message.timestamp}
                  className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-3xl ${message.type === 'user' ? 'order-first' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white ml-auto' 
                        : message.isError 
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-white border shadow-sm'
                    }`}>
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
                          return line ? (
                            <p 
                              key={index} 
                              className={message.type === 'user' 
                                ? 'text-white' 
                                : message.isError 
                                  ? 'text-red-700'
                                  : 'text-gray-700'
                              }
                            >
                              {line}
                            </p>
                          ) : <br key={index} />;
                        })}
                      </div>
                    </div>
                    
                    <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      {format(new Date(message.timestamp), 'h:mm a')}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <div className="bg-white border shadow-sm rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span className="text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Start a New Conversation</h2>
                <p className="text-gray-600 mb-4">
                  Ask me anything about marketing, growth strategies, or business development.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Try asking about marketing strategies or growth opportunities.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-white px-4 py-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about marketing strategy, competitors, growth opportunities..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading chat...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
