import React, { useState, useEffect } from "react";
import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatMain from "../../components/chat/ChatMain";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getChatById } from "../../features/chats/chatsSlice";

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { chats, loading } = useSelector((state) => state.chats);

  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle chat selection from URL parameter
  useEffect(() => {
    if (id) {
      // If we already have the chat in our state, select it (try to match by slug first, then by ID)
      const existingChat = chats?.find(
        (chat) => chat.slug === id || chat._id === id
      );

      if (existingChat) {
        setSelectedChat(existingChat);
        if (isMobile) setIsSidebarOpen(false);
      } else {
        // If not in state, fetch it from the API (can be slug or ID)
        dispatch(getChatById(id))
          .unwrap()
          .then((chatData) => {
            setSelectedChat(chatData);
            if (isMobile) setIsSidebarOpen(false);
          })
          .catch((error) => {
            console.error("Failed to fetch chat:", error);
          });
      }
    } else {
      // Reset selection if no ID provided
      setSelectedChat(null);
    }
  }, [id, chats, dispatch, isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    // Navigate to the chat using its slug
    navigate(`/chat/${chat.slug}`);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    // Remove the header height (64px) from viewport and prevent overflow
    <div className="fixed inset-0 top-14 bg-gray-50 flex overflow-hidden">
      {/* Slim Sidebar for Mobile */}
      <div
        className={`
        md:hidden fixed h-full z-20 bg-white border-r border-gray-200
        ${isSidebarOpen ? "w-full" : "w-[60px]"}
        transition-all duration-300 ease-in-out
      `}
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          {isSidebarOpen ? (
            <>
              <h1 className="text-lg font-semibold">Messages</h1>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg"
                onClick={toggleSidebar}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </>
          ) : (
            <button
              className="p-2 hover:bg-gray-100 rounded-lg mx-auto"
              onClick={toggleSidebar}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Show either full sidebar or slim version */}
        <div className="h-[calc(100%-49px)] overflow-hidden">
          {isSidebarOpen ? (
            <ChatSidebar
              onChatSelect={handleChatSelect}
              selectedChat={selectedChat}
              onToggleSidebar={toggleSidebar}
            />
          ) : (
            <div className="flex flex-col items-center py-4 space-y-4">
              {/* Recent Chats Preview - Slim Version */}
              <button
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                onClick={toggleSidebar}
              >
                <span className="text-sm font-medium">+</span>
              </button>
              {/* You can add recent chat avatars here */}
            </div>
          )}
        </div>
      </div>

      {/* Regular Sidebar for Desktop */}
      <div className="hidden md:block w-[320px] border-r border-gray-200 bg-white overflow-hidden">
        <ChatSidebar
          onChatSelect={handleChatSelect}
          selectedChat={selectedChat}
        />
      </div>

      {/* Main Chat Area */}
      <div
        className={`
        flex-1 relative overflow-hidden
        ${!isMobile || !isSidebarOpen ? "ml-[60px] md:ml-0" : "hidden"}
      `}
      >
        <ChatMain
          selectedChat={selectedChat}
          onBackClick={() => {
            setSelectedChat(null);
            setIsSidebarOpen(true);
          }}
        />
      </div>

      {/* Overlay for mobile full sidebar */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default ChatPage;
