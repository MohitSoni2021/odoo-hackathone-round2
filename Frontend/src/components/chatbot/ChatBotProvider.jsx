import React, { createContext, useContext, useState } from 'react';
import ChatBot from './ChatBot';

// Create context
const ChatBotContext = createContext();

// Custom hook to use the ChatBot context
export const useChatBot = () => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
};

// Provider component
export const ChatBotProvider = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(true);

  // Toggle ChatBot visibility
  const toggleChatBot = () => {
    setIsEnabled(prev => !prev);
  };

  // Enable ChatBot
  const enableChatBot = () => {
    setIsEnabled(true);
  };

  // Disable ChatBot
  const disableChatBot = () => {
    setIsEnabled(false);
  };

  return (
    <ChatBotContext.Provider
      value={{
        isEnabled,
        toggleChatBot,
        enableChatBot,
        disableChatBot,
      }}
    >
      {children}
      {isEnabled && <ChatBot />}
    </ChatBotContext.Provider>
  );
};

export default ChatBotProvider;