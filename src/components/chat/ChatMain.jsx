import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import {
  addMessage,
  getChatMessages,
} from "../../features/chats/messagesSlice";
import socket from "../../utils/socket.js";

const ChatMain = ({ selectedChat, onBackClick }) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();
  const messagesState = useSelector((state) => state.messages || {});
  const { messages = [], loading = false, error = null } = messagesState;
  const user = useSelector((state) => state.auth?.user);
  const [isTyping, setTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState(null);

  const typingTimeoutRef = useRef(null);

  const getListingTitle = (values) => {
    return (
      values?.title ||
      values?.brand ||
      values?.name ||
      values?.model ||
      values?.productName ||
      "No Title"
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedChat?._id) {
      dispatch(getChatMessages(selectedChat._id));

      setTyping(false);
      setTypingUserId(null);
      clearTimeout(typingTimeoutRef.current);
    }
  }, [dispatch, selectedChat?._id]);

  useEffect(() => {
    socket.emit("join-chat", selectedChat?._id || "default-chat");
  }, [selectedChat?._id]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      console.log("New message received:", newMessage);
      if (newMessage.chat === selectedChat?._id) {
        dispatch(addMessage(newMessage));
      }
    };

    const handleUserTyping = (userId) => {
      // Only show typing indicator if it's not the current user
      if (userId !== user?.id) {
        setTyping(true);
        setTypingUserId(userId);
      }
    };

    const handleUserStopTyping = (userId) => {
      // Only hide typing indicator if it's not the current user and matches the typing user
      if (
        userId !== user?.id &&
        (typingUserId === userId || typingUserId === null)
      ) {
        setTyping(false);
        setTypingUserId(null);
      }
    };

    const handleError = (error) => {
      console.error("Socket error:", error);
    };

    socket.on("new-message", handleNewMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);
    socket.on("error", handleError);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
      socket.off("error", handleError);
      // Clear typing timeout on cleanup
      clearTimeout(typingTimeoutRef.current);
    };
  }, [dispatch, selectedChat?._id, user?.id, typingUserId]);

  useEffect(() => {
    if (selectedChat?._id && user?.id) {
      socket.emit("mark-chat-as-read", selectedChat._id, user.id);
    }
  }, [selectedChat?._id, user?.id]);

  const handleTyping = () => {
    if (!selectedChat?._id || !user?.id) return;

    // Emit typing event
    socket.emit("typing", selectedChat._id, user.id);

    // Clear existing timeout and set new one for stop typing
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", selectedChat._id, user.id);
    }, 2000);
  };
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && selectedChat?._id && user?.id) {
      // Clear typing timeout and emit stop typing before sending message
      clearTimeout(typingTimeoutRef.current);
      socket.emit("stop-typing", selectedChat._id, user.id);

      socket.emit("send-message", {
        chatId: selectedChat._id,
        content: message.trim(),
        sender: user.id,
      });

      setMessage("");
    }
  };

  if (!selectedChat) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 md:block">
        <div className="text-center md:hidden">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900">Your Messages</h3>
          <p className="mt-2 text-gray-500">
            Open sidebar to view conversations
          </p>
        </div>
        <div className="hidden md:flex h-full w-full items-center justify-center">
          <div className="text-center p-8 rounded-lg bg-white">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900">
              Select a chat to start messaging
            </h3>
            <p className="mt-2 text-gray-500">
              Choose from your existing conversations
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header - Fixed Height */}
      <div className="flex-none flex items-center px-4 py-3 border-b border-gray-200">
        {/* Back Button (Mobile Only) */}
        <button
          className="md:hidden mr-2 p-2 hover:bg-gray-100 rounded-lg"
          onClick={onBackClick}
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
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="flex items-center flex-1 relative top-18 mb-18">
          <div className="ml-3 flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {selectedChat.sender?._id === user?.id
                ? selectedChat.receiver?.name || "Unknown User"
                : selectedChat.sender?.name || "Unknown User"}
            </h3>
            {/* <p className="text-sm text-gray-500">Online</p> */}
          </div>
        </div>
      </div>

      {/* Listing Header - Shows the purpose of the chat */}
      <div className="flex-none bg-gray-50 border-b border-gray-200 mx-auto px-5 py-3 w-full">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
            <img
              src={
                selectedChat.listing?.values?.files?.url ||
                selectedChat.listing?.values?.profile?.url ||
                (selectedChat.listing?.values?.files &&
                Array.isArray(selectedChat.listing.values.files) &&
                selectedChat.listing.values.files.length > 0
                  ? selectedChat.listing.values.files[0]?.url
                  : null) ||
                selectedChat.listing?.values?.resume?.url ||
                selectedChat.listing?.values?.image?.url ||
                selectedChat.listing?.values?.picture?.url ||
                selectedChat.listing?.values?.photo?.url
              }
              alt={
                getListingTitle(selectedChat.listing?.values) || "Product Image"
              }
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {getListingTitle(selectedChat.listing?.values) ||
                "iPhone 14 Pro - 256GB Space Black"}
            </h4>
            <p className="text-sm text-gray-500">
              {selectedChat.listing?.storeId?.name
                ?.toLowerCase()
                .includes("job") ? (
                <>
                  Bio:{" "}
                  {selectedChat.listing?.values?.bio ||
                    selectedChat.listing?.values?.description.slice(0, 60) +
                      "........." ||
                    "Bio not available"}
                </>
              ) : (
                <>
                  {selectedChat.listing?.values?.fee ? "Fee" : "Price"}:{" "}
                  {selectedChat.listing?.values?.price ||
                    selectedChat.listing?.values?.fee ||
                    "Price not available"}
                  {!selectedChat.listing?.values?.fee && "AED"}
                </>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {selectedChat.listingStatus || "Available"}
            </span> */}
            <Link
              to={
                selectedChat.type == "vehicle"
                  ? `/garage/service/${selectedChat.listing?.slug}`
                  : selectedChat.type == "hiring"
                  ? `/hire-talent/detail/${selectedChat.listing?.slug}`
                  : selectedChat.listing?.storeId?.name
                      ?.toLowerCase()
                      .includes("health")
                  ? `/health-care/doctor/${selectedChat.listing?.slug}`
                  : selectedChat.type == "seeker"
                  ? `/jobs/detail/${selectedChat.listing?.slug}`
                  : `/ad/${selectedChat.listing?.slug}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15,3 21,3 21,9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View Listing
            </Link>
          </div>
        </div>
      </div>

      {/* Messages Area - Flexible Height with Scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500 text-sm">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg._id || index}
              className={`flex ${
                msg.sender._id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`
                  max-w-[70%] rounded-lg px-4 py-2
                  ${
                    msg.sender._id === user?.id
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }
                `}
              >
                <p className="break-words">{msg.content || msg.text}</p>
                <span
                  className={`text-xs ${
                    msg.sender._id === user?.id
                      ? "text-blue-100"
                      : "text-gray-500"
                  } block mt-1`}
                >
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString()
                    : msg.timestamp}
                </span>
              </div>
            </div>
          ))
        )}

        {isTyping && typingUserId && typingUserId !== user?.id && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg rounded-bl-none max-w-xs">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:.1s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:.2s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:.3s]"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed Height */}
      <div className="flex-none border-t border-gray-200 mt-4 md:mt-6">
        <form onSubmit={handleSendMessage} className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:border-blue-500 focus:bg-white"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
            />
            <button
              type="submit"
              className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none disabled:opacity-50"
              disabled={!message.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatMain;
