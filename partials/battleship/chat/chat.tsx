import React, { useRef, useEffect, ReactNode } from 'react';

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

export function Chat({ header }: { header?: ReactNode }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mockMessages.length]);

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