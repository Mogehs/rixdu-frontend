import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserChats } from "../../features/chats/chatsSlice";
import socket from "../../utils/socket";

const ChatSidebar = ({ onChatSelect, selectedChat }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();

  // Get data from Redux store
  const chatsState = useSelector((state) => state.chats || {});
  const { userChats = [], loading = false, error = null } = chatsState;
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUserChats(user.id));
    }
  }, [user, dispatch]);

  useEffect(() => {
    socket.emit("mark-chat-as-read", selectedChat?._id, user?.id);
  }, [selectedChat?._id, user?.id]);

  const filteredChats =
    userChats?.filter((chat) => {
      if (!user?.id) return false;
      if (chat.sender._id === user.id) {
        return chat.receiver?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
      } else {
        return chat.sender?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
    }) || [];

  // Helper function to get chat display name
  const getChatDisplayName = (chat) => {
    if (!chat || !user?.id) return "Unknown User";
    return chat.sender._id === user.id
      ? chat.receiver?.name || "Unknown User"
      : chat.sender?.name || "Unknown User";
  };

  // Helper function to get chat avatar
  const getChatAvatar = (chat) => {
    if (!chat || !user?.id) return "";
    return chat.sender._id === user.id
      ? chat.receiver?.avatar || ""
      : chat.sender?.avatar || "";
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Header - Fixed Height */}
      <div className="flex-none p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full px-4 py-2 pl-10 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Chat List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500 text-sm">
              {searchQuery ? "No chats found" : "No chats yet"}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat._id}
              className={`
                flex items-center p-4 cursor-pointer hover:bg-gray-50
                ${
                  selectedChat?.slug === chat.slug ||
                  selectedChat?._id === chat._id
                    ? "bg-blue-50"
                    : ""
                }
                border-b border-gray-100
              `}
              onClick={() => onChatSelect(chat)}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0">
                {getChatAvatar(chat) ? (
                  <img
                    src={getChatAvatar(chat)}
                    alt={getChatDisplayName(chat)}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
                          ${getChatDisplayName(chat).charAt(0).toUpperCase()}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
                    {getChatDisplayName(chat).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Chat Info */}
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 truncate">
                    {getChatDisplayName(chat)}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatTimestamp(chat.lastMessageTime || chat.updatedAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-600 truncate max-w-[70%]">
                    {chat.lastMessage || "No messages yet"}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center flex-shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
