// Simple conversation management using localStorage
// In a real app, this would be a database

const STORAGE_KEY = 'marketing_conversations';
const USER_EMAIL_KEY = 'user_email';

export function setUserEmail(email) {
  localStorage.setItem(USER_EMAIL_KEY, email);
}

export function getUserEmail() {
  return localStorage.getItem(USER_EMAIL_KEY);
}

export function getConversations() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
}

export function saveConversations(conversations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversations:', error);
  }
}

export function createConversation(title, initialMessage = null) {
  const conversations = getConversations();
  const newConversation = {
    id: Date.now().toString(),
    title,
    messages: initialMessage ? [initialMessage] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  conversations.unshift(newConversation); // Add to beginning
  saveConversations(conversations);
  return newConversation;
}

export function getConversation(id) {
  const conversations = getConversations();
  return conversations.find(conv => conv.id === id);
}

export function addMessageToConversation(conversationId, message) {
  const conversations = getConversations();
  const conversation = conversations.find(conv => conv.id === conversationId);
  
  if (conversation) {
    conversation.messages.push({
      id: Date.now().toString(),
      ...message,
      timestamp: new Date().toISOString(),
    });
    conversation.updatedAt = new Date().toISOString();
    saveConversations(conversations);
    return conversation;
  }
  
  return null;
}

export function deleteConversation(id) {
  const conversations = getConversations();
  const filtered = conversations.filter(conv => conv.id !== id);
  saveConversations(filtered);
}

export function createMarketingConversation(url, analysisSummary, multiModelResponse, contextId = null) {
  const domain = new URL(url).hostname.replace('www.', '');
  const title = `Marketing Analysis: ${domain}`;
  
  const initialMessage = {
    type: 'ai',
    content: `# Marketing Analysis Complete for ${url}

## 📊 Analysis Summary
• ${analysisSummary.pagesAnalyzed} pages analyzed
• ${analysisSummary.searchTerms} search terms identified  
• ${analysisSummary.competitorData} competitors researched

## 🤖 AI Insights
${multiModelResponse}

---

**What would you like to explore next about your marketing strategy?**`,
    timestamp: new Date().toISOString(),
  };
  
  const conversation = createConversation(title, initialMessage);
  
  // Add contextId if provided for follow-up questions
  if (contextId) {
    const conversations = getConversations();
    const updatedConversation = conversations.find(conv => conv.id === conversation.id);
    if (updatedConversation) {
      updatedConversation.contextId = contextId;
      saveConversations(conversations);
    }
  }
  
  return conversation;
} 