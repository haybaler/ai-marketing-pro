'use client';

import { useState, useEffect, useRef } from 'react';
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

export default function ChatPage() {
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
      router.push('/playground');
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

    try {
      let conversationId = selectedConversationId;
      let conversation = currentConversation;

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
      };
      
      const updatedConv = addMessageToConversation(conversationId, userMessage);
      setCurrentConversation(updatedConv);
      loadConversations();

      // Get AI response using the existing context if available
      let aiResponse;
      if (conversation?.contextId) {
        // Use existing context for follow-up questions
        aiResponse = await apiClient.chatWithContext({
          contextId: conversation.contextId,
          question: messageText,
          model: 'openai'
        });
      } else {
        // For new conversations without context, provide a helpful response
        aiResponse = {
          content: `I'd be happy to help with your marketing questions! However, for the most detailed insights, I recommend starting with a website analysis in the Playground first.

Here are some ways I can help:

🎯 **Marketing Strategy**
• Target audience identification
• Competitive positioning
• Content strategy planning

📊 **Growth Opportunities**
• Market expansion ideas
• Conversion optimization
• Brand positioning

💡 **Campaign Ideas**
• Content marketing concepts
• Social media strategies
• Email marketing approaches

What specific marketing challenge would you like to discuss?`
        };
      }

      // Add AI response
      const aiMessage = {
        type: 'ai',
        content: aiResponse.content,
      };

      const finalConv = addMessageToConversation(conversationId, aiMessage);
      setCurrentConversation(finalConv);
      loadConversations();

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message if we have a conversation
      if (conversationId) {
        const errorMessage = {
          type: 'ai',
          content: 'Sorry, I encountered an error processing your message. Please try again.',
        };
        
        const errorConv = addMessageToConversation(conversationId, errorMessage);
        setCurrentConversation(errorConv);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewConversation = () => {
    setSelectedConversationId(null);
    setCurrentConversation(null);
    // Update URL
    router.push('/chat');
  };
  
  const handleDeleteConversation = (conversationId) => {
    deleteConversation(conversationId);
    loadConversations();
    
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null);
      setCurrentConversation(null);
      router.push('/chat');
    }
  };

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    loadConversation(conversationId);
    router.push(`/chat?id=${conversationId}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r overflow-hidden flex flex-col transition-all duration-200`}>
        <div className="p-4 border-b">
          <Button
            onClick={handleNewConversation}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                    selectedConversationId === conversation.id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(conversation.updatedAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                      className="ml-2 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            <p className="font-medium">Signed in as:</p>
            <p className="text-xs truncate">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-semibold">
                {currentConversation?.title || 'AI Marketing Chat'}
              </h1>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/playground')}
          >
            Back to Playground
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentConversation?.messages && currentConversation.messages.length > 0 ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {currentConversation.messages.map((message) => (
                <div
                  key={message.id}
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
                          return line ? <p key={index} className={message.type === 'user' ? 'text-white' : 'text-gray-700'}>{line}</p> : <br key={index} />;
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
                <h2 className="text-xl font-semibold mb-2">Continue Your Marketing Analysis</h2>
                <p className="text-gray-600 mb-4">
                  Ask follow-up questions about your marketing strategy, get deeper insights, or explore new opportunities.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Start with website analysis in the Playground for the most detailed insights!
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