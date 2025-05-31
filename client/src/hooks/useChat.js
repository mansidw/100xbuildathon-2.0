import { useState, useRef, useEffect } from 'react';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const createNewChat = async () => {
    if (!roleName || !jdFile || !candidatesFile) return;

    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      const newChat = {
        id: Date.now(),
        title: roleName,
        roleName,
        jdFileName: jdFile.name,
        candidatesFileName: candidatesFile.name,
        messages: [],
        processed: true,
        createdAt: new Date().toLocaleString()
      };
      
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat);
      setShowNewChatModal(false);
      setIsProcessing(false);
      setRoleName('');
      setJdFile(null);
      setCandidatesFile(null);
    }, 3000);
  };

  const sendMessage = () => {
    if (!message.trim() || !activeChat || !activeChat.processed) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, userMessage]
    };

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Based on the candidates data from ${activeChat.candidatesFileName} and the job requirements from ${activeChat.jdFileName} for the ${activeChat.roleName} position, here's the analysis: This is a simulated response showing candidate insights, skills distribution, and recommendations based on your uploaded data and job requirements.`,
        timestamp: new Date().toLocaleTimeString()
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage]
      };

      setChats(prev => prev.map(chat => 
        chat.id === activeChat.id ? finalChat : chat
      ));
      setActiveChat(finalChat);
    }, 1000);

    setChats(prev => prev.map(chat => 
      chat.id === activeChat.id ? updatedChat : chat
    ));
    setActiveChat(updatedChat);
    setMessage('');
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
    createNewChat,
    sendMessage
  };
};

export default useChat; 