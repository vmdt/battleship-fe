import React, { useRef, useEffect, ReactNode, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface Message {
  id: number;
  userId: string;
  avatar: string;
  content: string;
  isMe: boolean;
}

const mockMessages: Message[] = [
  { id: 1, userId: 'me', avatar: '/assets/images/battleship-logo.png', content: 'Chào bạn!', isMe: true },
  { id: 2, userId: 'opponent', avatar: '/assets/images/cover-image.png', content: 'Chào bạn, sẵn sàng chưa?', isMe: false },
  { id: 3, userId: 'me', avatar: '/assets/images/battleship-logo.png', content: 'Bắt đầu thôi!', isMe: true },
  { id: 4, userId: 'opponent', avatar: '/assets/images/cover-image.png', content: 'Ok!', isMe: false },
  { id: 5, userId: 'me', avatar: '/assets/images/battleship-logo.png', content: 'Bạn thích chơi map nào?', isMe: true },
  { id: 6, userId: 'opponent', avatar: '/assets/images/cover-image.png', content: 'Map mặc định nhé!', isMe: false },
  { id: 7, userId: 'me', avatar: '/assets/images/battleship-logo.png', content: 'Ok, mình đã sẵn sàng.', isMe: true },
  { id: 8, userId: 'opponent', avatar: '/assets/images/cover-image.png', content: 'Mình cũng vậy!', isMe: false },
  { id: 9, userId: 'me', avatar: '/assets/images/battleship-logo.png', content: 'Chúc may mắn!', isMe: true },
  { id: 10, userId: 'opponent', avatar: '/assets/images/cover-image.png', content: 'Bạn cũng vậy!', isMe: false },
  { id: 11, userId: 'me', avatar: '/assets/images/battleship-logo.png', content: 'Bắt đầu nhé!', isMe: true },
  { id: 12, userId: 'opponent', avatar: '/assets/images/cover-image.png', content: 'Tới lượt bạn!', isMe: false },
  { id: 13, userId: 'me', avatar: '/assets/images/battleship-logo.png', content: 'Mình đã bắn A1.', isMe: true },
  { id: 14, userId: 'opponent', avatar: '/assets/images/cover-image.png', content: 'Trượt rồi!', isMe: false },
  { id: 15, userId: 'me', avatar: '/assets/images/battleship-logo.png', content: 'Haha, tới lượt bạn.', isMe: true },
  { id: 16, userId: 'opponent', avatar: '/assets/images/cover-image.png', content: 'Mình bắn B2.', isMe: false },
  { id: 17, userId: 'me', avatar: '/assets/images/battleship-logo.png', content: 'Trúng rồi!', isMe: true },
  { id: 18, userId: 'opponent', avatar: '/assets/images/cover-image.png', content: 'Không thể tin được!', isMe: false },
  { id: 19, userId: 'me', avatar: '/assets/images/battleship-logo.png', content: 'Tiếp tục nào!', isMe: true },
  { id: 20, userId: 'opponent', avatar: '/assets/images/cover-image.png', content: 'Ok!', isMe: false },
];

interface ChatProps {
  header?: ReactNode;
  isMobile?: boolean;
}

export function Chat({ header, isMobile = false }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false); // Always start closed, will be controlled by isMobile

  useEffect(() => {
    const container = messagesEndRef.current;
    if (container && isOpen) {
      container.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen]);

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
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end ${msg.isMe ? 'justify-start' : 'justify-end'}`}
            >
              {msg.isMe && (
                <img
                  src={msg.avatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border-2 mr-2"
                  style={{ borderColor: '#2563eb' }} // blue-600
                />
              )}
              <div
                className={`px-4 py-2 rounded-lg shadow text-sm max-w-[70%] ${
                  msg.isMe
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'bg-red-100 text-red-900 border border-red-200'
                }`}
              >
                {msg.content}
              </div>
              {!msg.isMe && (
                <img
                  src={msg.avatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border-2 ml-2"
                  style={{ borderColor: '#ef4444' }} // red-500
                />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* Input panel (placeholder) */}
        <div className="p-2 border-t bg-gray-50 dark:bg-gray-800 flex items-center">
          <input
            type="text"
            className="flex-1 rounded-lg border px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            placeholder="Nhập tin nhắn..."
            disabled
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg opacity-60 cursor-not-allowed" disabled>Gửi</button>
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
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <MessageCircle size={24} />
        </button>
      </div>

      {/* Chat popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat container */}
          <div className="relative w-full max-w-sm h-[500px] bg-white dark:bg-gray-900 rounded-t-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-white">Chat</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[350px]">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end ${msg.isMe ? 'justify-start' : 'justify-end'}`}
                >
                  {msg.isMe && (
                    <img
                      src={msg.avatar}
                      alt="avatar"
                      className="w-8 h-8 rounded-full border-2 mr-2"
                      style={{ borderColor: '#2563eb' }}
                    />
                  )}
                  <div
                    className={`px-3 py-2 rounded-lg shadow text-sm max-w-[70%] ${
                      msg.isMe
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'bg-red-100 text-red-900 border border-red-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {!msg.isMe && (
                    <img
                      src={msg.avatar}
                      alt="avatar"
                      className="w-8 h-8 rounded-full border-2 ml-2"
                      style={{ borderColor: '#ef4444' }}
                    />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input panel */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center">
                <input
                  type="text"
                  className="flex-1 rounded-lg border px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white text-sm"
                  placeholder="Nhập tin nhắn..."
                  disabled
                />
                <button className="bg-blue-600 text-white px-3 py-2 rounded-lg opacity-60 cursor-not-allowed text-sm" disabled>
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}