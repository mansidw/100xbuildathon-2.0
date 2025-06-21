import { useState, useRef, useEffect } from 'react';
import { createNewChat, sendChatMessage, getTables, getChatHistory, sendGlobalChatMessage } from '../services/api';
import { generateTableName } from '../config/constants';
import { toast } from 'sonner';
import posthog from 'posthog-js';

export const useChat = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  // New chat form state
  const [roleName, setRoleName] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [candidatesFile, setCandidatesFile] = useState(null);

  // Helper for global chat history
  const GLOBAL_CHAT_PREFIX = 'global_chat_history_';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  // Load existing tables on mount
  useEffect(() => {
    const loadTables = async () => {
      try {
        const tablesData = await getTables();
        if (tablesData && Array.isArray(tablesData.tables)) {
          // Filter out system tables
          const userTables = tablesData.tables.filter(tableName => 
            !['rejected_candidates', 'candidates'].includes(tableName)
          );

          // Convert tables data to chat format
          const existingChats = userTables.map(tableName => {
            // Try to extract timestamp if it exists in the table name
            const parts = tableName.split('_');
            const timestamp = parts[parts.length - 1];
            const roleName = parts.slice(0, -1).join('_'); // Everything before the last underscore
            
            let createdAt;
            if (timestamp && !isNaN(timestamp)) {
              createdAt = new Date(parseInt(timestamp)).toLocaleString();
            } else {
              createdAt = new Date().toLocaleString(); // Fallback for tables without timestamp
            }

            return {
              id: Date.now() + Math.random(), // Generate unique ID
              title: roleName || tableName, // Use role name if available, otherwise use full table name
              roleName: roleName || tableName,
              tableName: tableName,
              messages: [], // Initialize with empty messages
              processed: true,
              createdAt: createdAt
            };
          });
          
          // Sort chats by creation time, newest first
          existingChats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setChats(existingChats);
          
          if (existingChats.length > 0) {
            toast.success(`Loaded ${existingChats.length} existing chats`);
          }
        }
      } catch (error) {
        console.error('Failed to load existing chats:', error);
        toast.error('Failed to load existing chats');
      }
    };

    loadTables();
  }, []);

  // Fix: Only update messages if not already loaded
  useEffect(() => {
    const fetchHistory = async () => {
      if (activeChat && activeChat.type !== 'global' && activeChat.tableName && localStorage.getItem('user_id')) {
        // Only fetch if messages are empty or only system message
        if (!activeChat.messages || activeChat.messages.length === 0 || (activeChat.messages.length === 1 && activeChat.messages[0].type === 'system')) {
          try {
            const chatsArr = await getChatHistory(localStorage.getItem('user_id'), activeChat.tableName);
            // chatsArr is an array of [question, answer] pairs
            const messages = [];
            chatsArr.forEach(([question, answer], idx) => {
              messages.push({
                id: `${activeChat.tableName}-user-${idx}-${Date.now()}`,
                type: 'user',
                content: question,
                timestamp: ''
              });
              messages.push({
                id: `${activeChat.tableName}-ai-${idx}-${Date.now()}`,
                type: 'ai',
                content: answer,
                timestamp: ''
              });
            });
            setChats(prev => prev.map(chat =>
              chat.tableName === activeChat.tableName ? { ...chat, messages } : chat
            ));
            setActiveChat(prev => prev && prev.tableName === activeChat.tableName ? { ...prev, messages } : prev);
          } catch {/* ignore */}
        }
      }
    };
    fetchHistory();
    // eslint-disable-next-line
  }, [activeChat?.tableName, activeChat?.type]);

  // Save global chat history to localStorage whenever it changes for the active chat
  useEffect(() => {
    if (activeChat && activeChat.type === 'global' && activeChat.messages.length > 0) {
      saveGlobalChatHistory(activeChat.title, activeChat.messages);
    }
  }, [activeChat, activeChat?.messages]);

  // Global chat: store and fetch from localStorage only
  const loadGlobalChatHistory = async (chatName) => {
    try {
      const data = localStorage.getItem(GLOBAL_CHAT_PREFIX + chatName);
      if (data) return JSON.parse(data);
    } catch {/* ignore */}
    return [];
  };

  const saveGlobalChatHistory = async (chatName, messages) => {
    try {
      localStorage.setItem(GLOBAL_CHAT_PREFIX + chatName, JSON.stringify(messages));
    } catch {/* ignore */}
  };

  const createNewChatSession = async (opts = {}) => {
    if (opts.chatType === 'global') {
      const { globalChatName } = opts;
      if (!globalChatName) return;
      // Load previous messages if any (from backend or localStorage)
      const previousMessages = await loadGlobalChatHistory(globalChatName);
      const newChat = {
        id: Date.now(),
        title: globalChatName,
        roleName: 'Global',
        tableName: null,
        type: 'global',
        messages: previousMessages,
        processed: true,
        createdAt: new Date().toLocaleString(),
      };
      setChats(prev => [newChat, ...prev.filter(c => c.title !== globalChatName)]);
      setActiveChat(newChat);
      setShowNewChatModal(false);
      return;
    }
    if (!roleName || !jdFile || !candidatesFile) return;
    setIsProcessing(true);
    const tableName = generateTableName(roleName);
    posthog.capture("create_new_chat", {
    timestamp: new Date().toISOString(),
    properties: {
      buttonName: 'Create New Chat',   
 },
  });
    // Show initial processing toast
    toast.info(`Processing ${candidatesFile.name} for ${roleName} position...`, {
      duration: 3000
    });
    try {
      const result = await createNewChat(candidatesFile, jdFile, tableName);
      const newChat = {
        id: Date.now(),
        title: roleName,
        roleName,
        tableName,
        jdFileName: jdFile.name,
        candidatesFileName: candidatesFile.name,
        messages: [{
          id: `system-${Date.now()}-${Math.random()}`,
          type: 'system',
          content: result.message,
          timestamp: new Date().toLocaleTimeString()
        }],
        processed: true,
        createdAt: new Date().toLocaleString()
      };
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat);
      setShowNewChatModal(false);
      toast.success(`Successfully processed ${candidatesFile.name} for ${roleName} position. Ready to analyze!`, {
        duration: 4000
      });
    } catch (error) {
      console.error('Failed to create new chat:', error);
      toast.error(`Failed to process ${candidatesFile.name}. Please try again.`, {
        duration: 4000
      });
    } finally {
      setIsProcessing(false);
      setRoleName('');
      setJdFile(null);
      setCandidatesFile(null);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !activeChat || !activeChat.processed) return;
    // If global chat, use sendGlobalChatMessage
    if (activeChat.type === 'global') {
      const userMessage = {
        id: `user-${Date.now()}-${Math.random()}`,
        type: 'user',
        content: messageText,
        timestamp: new Date().toLocaleTimeString(),
      };
      const loadingMessage = {
        id: `ai-${Date.now()}-${Math.random()}`,
        type: 'ai',
        content: '',
        isLoading: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      const updatedChat = {
        ...activeChat,
        messages: [...activeChat.messages, userMessage, loadingMessage],
      };
      setChats(prev => prev.map(chat =>
        chat.id === activeChat.id ? updatedChat : chat
      ));
      setActiveChat(updatedChat);
      try {
        // Prepare chat context from last 5 messages
        const chatContext = activeChat.messages
          .filter(msg => msg.type === 'user' || msg.type === 'ai')
          .slice(-10) // Get last 10 messages (5 pairs)
          .reduce((acc, msg, index, arr) => {
            if (msg.type === 'user' && index + 1 < arr.length && arr[index + 1].type === 'ai') {
              acc.push({
                user_message: msg.content,
                assistant_message: arr[index + 1].content
              });
            }
            return acc;
          }, [])
          .slice(-5); // Keep only last 5 pairs

        const response = await sendGlobalChatMessage(messageText, chatContext);
        const aiMessage = {
          id: loadingMessage.id,
          type: 'ai',
          content: response.summary,
          raw: response.raw,
          isLoading: false,
          timestamp: new Date().toLocaleTimeString(),
        };
        const finalChat = {
          ...updatedChat,
          messages: [...updatedChat.messages.slice(0, -1), aiMessage],
        };
        setChats(prev => prev.map(chat =>
          chat.id === activeChat.id ? finalChat : chat
        ));
        setActiveChat(finalChat);
        return; // Early return for global chat
      } catch (error) {
        console.error('Error in global chat:', error);
        toast.error('Failed to get response from AI');
        // Remove loading message on error
        const errorChat = {
          ...updatedChat,
          messages: updatedChat.messages.slice(0, -1),
        };
        setChats(prev => prev.map(chat =>
          chat.id === activeChat.id ? errorChat : chat
        ));
        setActiveChat(errorChat);
        return; // Early return
      }
    }
    const userMessage = {
        id: `user-${Date.now()}-${Math.random()}`,
        type: 'user',
        content: messageText,
        timestamp: new Date().toLocaleTimeString()
    };
    const loadingMessage = {
        id: `ai-${Date.now()}-${Math.random()}`,
        type: 'ai',
        content: '',
        isLoading: true,
        timestamp: new Date().toLocaleTimeString()
    };
    const updatedChat = {
        ...activeChat,
        messages: [...activeChat.messages, userMessage, loadingMessage]
    };
    setChats(prev => prev.map(chat => 
        chat.id === activeChat.id ? updatedChat : chat
    ));
    setActiveChat(updatedChat);
    try {
        const response = await sendChatMessage(activeChat.tableName, messageText);
        // response: { result, followups }
        const aiMessage = {
            id: loadingMessage.id,
            type: 'ai',
            content: response.result,
            followups: response.followups,
            isLoading: false,
            timestamp: new Date().toLocaleTimeString()
        };
        const finalChat = {
            ...updatedChat,
            messages: [...updatedChat.messages.slice(0, -1), aiMessage]
        };
        setChats(prev => prev.map(chat => 
            chat.id === activeChat.id ? finalChat : chat
        ));
        setActiveChat(finalChat);
        return response.followups;
    } catch (error) {
        console.error('Failed to get response:', error);
        // Remove loading message on error
        const finalChat = {
            ...updatedChat,
            messages: updatedChat.messages.slice(0, -1)
        };
        setChats(prev => prev.map(chat => 
            chat.id === activeChat.id ? finalChat : chat
        ));
        setActiveChat(finalChat);
        throw error;
    }
  };

  return {
    chats,
    activeChat,
    showNewChatModal,
    isProcessing,
    message,
    roleName,
    jdFile,
    candidatesFile,
    messagesEndRef,
    setActiveChat,
    setShowNewChatModal,
    setMessage,
    setRoleName,
    setJdFile,
    setCandidatesFile,
    createNewChat: createNewChatSession,
    sendMessage
  };
};

export default useChat; 