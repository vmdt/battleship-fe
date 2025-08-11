import React, { useRef, useEffect, ReactNode, useState, useCallback } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { ChatMessage, CreateChatMessage } from '@/models/chat';
import { useUserStore } from '@/stores/userStore';
import { useRoomStore } from '@/stores/roomStore';
import { fetchChatMessages, sendChatMessage } from '@/services/chatService';
import { useSocketStore } from '@/stores/socketStore';
import { Socket } from 'socket.io-client';

interface ChatProps {
  header?: ReactNode;
  isMobile?: boolean;
}

export function Chat({ header, isMobile = false }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  const { user } = useUserStore();
  const { roomId, getPlayerOne, getPlayerTwo, getMe } = useRoomStore();
  const { getSocket } = useSocketStore();

  // Get current player ID based on 'me' value
  const getCurrentPlayerId = useCallback(() => {
    const me = getMe();
    if (me === 1) {
      return getPlayerOne()?.player_id;
    } else if (me === 2) {
      return getPlayerTwo()?.player_id;
    }
    return null;
  }, [getMe, getPlayerOne, getPlayerTwo]);

  // Fetch initial chat messages
  const loadChatMessages = useCallback(async () => {
    if (!roomId) return;
    
    try {
      setIsLoading(true);
      const chatData = await fetchChatMessages(roomId);
      setMessages(chatData.messages || []);
      console.log('Loaded chat messages:', chatData.messages?.length || 0);
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      // Keep existing messages if loading fails
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  // Socket event listener for "room:chat"
  useEffect(() => {
    if (!roomId) {
      console.log('No roomId, skipping socket connection');
      return;
    }

    const { getSocket, connect } = useSocketStore.getState();

    let socket = getSocket('battleship')?.socket;
    
    if (!socket) {
      const me = getMe();
      const success = connect('battleship', me, { room_id: roomId });
      if (!success) {
        console.error('Failed to connect socket');
        return;
      }
      socket = getSocket('battleship')?.socket;
    }
    
    if (!socket) {
      console.error('Socket connection failed');
      return;
    }

    // Listen for new chat messages
    socket.on('room:chat', async (data: any) => {
      console.log('Received room:chat event:', data);
      
      // Check if the message is from current user
      const currentPlayerId = getCurrentPlayerId();
      const isFromMe = data?.sender_id === currentPlayerId;
      
      if (isFromMe) {
        console.log('Message is from current user, skipping API call');
        // Don't call API if message is from current user
        return;
      }
      
      // Only refresh chat messages if message is from another user
      console.log('Message is from another user, refreshing chat messages');
      
      // Set notification indicator if chat is closed
      if (!isOpen) {
        setHasNewMessage(true);
      }
      
      await loadChatMessages();
    });

    // Listen for socket connection events
    socket.on('connect', () => {
      console.log('Socket connected event fired');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Load initial messages
    loadChatMessages();

    return () => {
      console.log('Cleaning up socket event listeners for room:', roomId);
      socket.off('room:chat');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('error');
    };
  }, [roomId, loadChatMessages, getCurrentPlayerId, getMe, isOpen]);

  // Send message function
  const sendMessage = useCallback(async () => {
    if (!messageInput.trim() || !roomId || isSending) return;

    try {
      setIsSending(true);
      
      // Get current player info
      const currentPlayerId = getCurrentPlayerId();
      if (!currentPlayerId) {
        console.error('No current player ID found');
        return;
      }

      // Create message object
      const newMessage: CreateChatMessage = {
        sender_id: currentPlayerId,
        content: messageInput.trim(),
        is_log: false,
      };

      // Send message via API
      const response = await sendChatMessage(roomId, newMessage);
      
      // Add the new message to the messages array
      if (response.messages && response.messages.length > 0) {
        // Find the newly added message (usually the last one)
        const addedMessage = response.messages[response.messages.length - 1];
        if (addedMessage && addedMessage.content === messageInput.trim()) {
          setMessages(prevMessages => [...prevMessages, addedMessage]);
        }
      }

      // Clear input
      setMessageInput('');

    } catch (error) {
      console.error('Failed to send message:', error);
      // Keep the message in input if sending fails
    } finally {
      setIsSending(false);
    }
  }, [messageInput, roomId, isSending, getCurrentPlayerId]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  useEffect(() => {
    const container = messagesEndRef.current;
    if (container && (isOpen || !isMobile)) {
      container.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isMobile]);

  // Check if a message is from current user
  const isMyMessage = useCallback((message: ChatMessage) => {
    const currentPlayerId = getCurrentPlayerId();
    return message.sender_id === currentPlayerId;
  }, [getCurrentPlayerId]);

  // Get avatar for message sender
  const getMessageAvatar = useCallback((message: ChatMessage) => {
    const currentPlayerId = getCurrentPlayerId();
    const me = getMe();
    
    if (message.sender_id === currentPlayerId) {
      // Current user's avatar
      return user?.avatar || '/assets/images/battleship-logo.png';
    } else {
      // Opponent's avatar
      if (me === 1) {
        return getPlayerTwo()?.player?.avatar || '/assets/images/cover-image.png';
      } else {
        return getPlayerOne()?.player?.avatar || '/assets/images/cover-image.png';
      }
    }
  }, [getCurrentPlayerId, getMe, getPlayerOne, getPlayerTwo, user?.avatar]);

  // Handle opening chat
  const handleOpenChat = useCallback(() => {
    setIsOpen(true);
    setHasNewMessage(false); // Clear notification when opening chat
  }, []);

  // Handle closing chat
  const handleCloseChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Desktop version (always visible)
  if (!isMobile) {
    return (
      <div className="flex flex-col h-[600px] w-full max-w-md border rounded-xl bg-white dark:bg-gray-900 shadow-lg">
        {/* Header */}
        {header && (
          <div className="rounded-t-xl">
            {header}
          </div>
        )}
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Chưa có tin nhắn nào
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = isMyMessage(msg);
              const avatar = getMessageAvatar(msg);
              
              return (
                <div
                  key={msg.id}
                  className={`flex items-end ${isMe ? 'justify-start' : 'justify-end'}`}
                >
                  {isMe && (
                    <img
                      src={avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border-2 mr-2"
                      style={{ borderColor: '#2563eb' }}
                    />
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg shadow text-sm max-w-[70%] ${
                      isMe
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'bg-red-100 text-red-900 border border-red-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {!isMe && (
                    <img
                      src={avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border-2 ml-2"
                      style={{ borderColor: '#ef4444' }}
                    />
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input panel */}
        <div className="p-2 border-t bg-gray-50 dark:bg-gray-800 flex items-center">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-lg border px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            placeholder="Nhập tin nhắn..."
            disabled={isSending}
          />
          <button 
            onClick={sendMessage}
            disabled={!messageInput.trim() || isSending}
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              !messageInput.trim() || isSending
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSending ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>
    );
  }

  // Mobile version (floating icon + popup)
  return (
    <>
      {/* Floating chat icon - always visible on mobile */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleOpenChat}
          className="relative w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <MessageCircle size={24} />
          {/* Notification indicator */}
          {hasNewMessage && (
            <div className="absolute top-0 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
          )}
        </button>
      </div>

      {/* Chat popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20"
            onClick={handleCloseChat}
          />
          
          {/* Chat container */}
          <div className="relative w-full max-w-sm h-[500px] bg-white dark:bg-gray-900 rounded-t-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl bg-gray-50 dark:bg-gray-800 flex-shrink-0">
              <h3 className="font-semibold text-gray-800 dark:text-white">Chat</h3>
              <button
                onClick={handleCloseChat}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-20">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                  Chưa có tin nhắn nào
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = isMyMessage(msg);
                  const avatar = getMessageAvatar(msg);
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end ${isMe ? 'justify-start' : 'justify-end'}`}
                    >
                      {isMe && (
                        <img
                          src={avatar}
                          alt="avatar"
                          className="w-8 h-8 rounded-full border-2 mr-2"
                          style={{ borderColor: '#2563eb' }}
                        />
                      )}
                      <div
                        className={`px-3 py-2 rounded-lg shadow text-sm max-w-[70%] ${
                          isMe
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-red-100 text-red-900 border border-red-200'
                        }`}
                      >
                        {msg.content}
                      </div>
                      {!isMe && (
                        <img
                          src={avatar}
                          alt="avatar"
                          className="w-8 h-8 rounded-full border-2 ml-2"
                          style={{ borderColor: '#ef4444' }}
                        />
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input panel - fixed at bottom */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
              <div className="flex items-center">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 rounded-lg border px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Nhập tin nhắn..."
                  disabled={isSending}
                />
                <button 
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || isSending}
                  className={`px-3 py-2 rounded-lg text-white text-sm transition-colors ${
                    !messageInput.trim() || isSending
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSending ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}