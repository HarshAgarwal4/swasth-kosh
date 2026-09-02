import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Send,
  Video,
  Search,
  CheckCheck,
  Check,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  Phone,
  Image as ImageIcon,
  FileText,
  User,
} from "lucide-react";
import { getSocket } from "../services/socket";
import axios from "../services/axios";
import { useStore } from "../zustand/store";
import SidebarLayout from "../components/SidebarLayout";

const ChatPage = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const socket = getSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get("/api/chat/conversations");
      if (res.data?.success) {
        setConversations(res.data.data);
        if (res.data.data.length > 0 && !activeConversation) {
          selectConversation(res.data.data[0]);
        }
      }
    } catch (e) {
      console.warn("Conversations error:", e);
    }
  };

  const selectConversation = async (conv) => {
    setActiveConversation(conv);
    socket.emit("chat:join", { conversationId: conv._id });

    try {
      const res = await axios.get(`/api/chat/conversations/${conv._id}/messages`);
      if (res.data?.success) {
        setMessages(res.data.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    socket.on("chat:message", (msg) => {
      if (activeConversation && msg.conversationId === activeConversation._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("chat:typing", ({ userName }) => {
      setTypingUser(userName);
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    });

    socket.on("chat:stopTyping", () => {
      setIsTyping(false);
    });

    return () => {
      socket.off("chat:message");
      socket.off("chat:typing");
      socket.off("chat:stopTyping");
    };
  }, [activeConversation, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || !activeConversation) return;

    const otherParticipant = activeConversation.participants?.find(
      (p) => p._id !== user?._id
    );

    socket.emit(
      "chat:send",
      {
        conversationId: activeConversation._id,
        receiverId: otherParticipant?._id,
        text: textInput,
      },
      (res) => {
        if (res?.success && res.message) {
          // message broadcast
        }
      }
    );

    setTextInput("");
  };

  const startVideoCallWithPeer = () => {
    if (!activeConversation) return;
    const roomId = `telemed-${activeConversation._id.slice(-8)}`;
    navigate(`/call/${roomId}`);
  };

  const getOtherParticipant = (conv) => {
    const other = conv?.participants?.find((p) => p._id !== user?._id);
    return other || { name: "Doctor / Medical Officer" };
  };

  const filteredConversations = conversations.filter((c) => {
    const name = getOtherParticipant(c).name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <SidebarLayout>
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-6 flex flex-col">
        {/* WhatsApp-Style App Container */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-300 shadow-xl flex overflow-hidden h-[calc(100vh-120px)] min-h-[580px]">
          {/* Left Sidebar: Conversations List */}
          <div className="w-full sm:w-80 md:w-96 bg-slate-50 border-r border-slate-200 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="font-bold text-xs text-slate-900">{user?.name}</h2>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Online
                  </span>
                </div>
              </div>

              <span className="text-xs bg-white font-bold px-2.5 py-1 rounded-full text-slate-600 border border-slate-200">
                {conversations.length} Chats
              </span>
            </div>

            {/* Search Bar */}
            <div className="p-3 bg-white border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search consultation chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Conversation Threads */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No consultation chats. Private chat unlocks when an appointment is accepted.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const partner = getOtherParticipant(conv);
                  const isSelected = activeConversation?._id === conv._id;
                  return (
                    <div
                      key={conv._id}
                      onClick={() => selectConversation(conv)}
                      className={`p-3.5 cursor-pointer transition flex items-center gap-3 ${
                        isSelected ? "bg-indigo-50/70 border-l-4 border-indigo-600" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {partner?.name?.[0]?.toUpperCase() || "D"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {partner?.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {conv.lastMessage?.sentAt
                              ? new Date(conv.lastMessage.sentAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {conv.lastMessage?.text || "Consultation channel opened"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Main Chat Stage */}
          <div className="hidden sm:flex flex-1 flex-col bg-slate-100/60 overflow-hidden">
            {activeConversation ? (
              <>
                {/* Chat Top Header */}
                <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {getOtherParticipant(activeConversation)?.name?.[0]?.toUpperCase() || "D"}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {getOtherParticipant(activeConversation)?.name}
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        {isTyping ? "typing..." : "Verified Consultation Channel"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={startVideoCallWithPeer}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition active:scale-95"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Call</span>
                    </button>
                  </div>
                </div>

                {/* Message Bubble Thread */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-[#e5ddd5]/30">
                  {messages.map((msg) => {
                    const isMe = (msg.senderId?._id || msg.senderId) === user?._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs shadow-xs leading-relaxed relative ${
                            isMe
                              ? "bg-[#dcf8c6] text-slate-900 rounded-br-none border border-emerald-200/50"
                              : "bg-white text-slate-900 rounded-bl-none border border-slate-200"
                          }`}
                        >
                          {!isMe && (
                            <div className="font-bold text-[10px] text-indigo-700 mb-0.5">
                              {msg.senderId?.name || "Doctor"}
                            </div>
                          )}
                          <p className="pr-12">{msg.text}</p>
                          <div className="absolute bottom-1 right-2 flex items-center gap-0.5 text-[9px] text-slate-400">
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3 text-sky-500 inline" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="text-[11px] text-slate-500 italic bg-white/70 px-3 py-1 rounded-full w-max shadow-xs">
                      {typingUser || "Doctor"} is typing...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Strip */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-indigo-600 transition"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-slate-400">
                Select a consultation conversation from the left menu.
              </div>
            )}
          </div>
        </div>
      </main>
    </SidebarLayout>
  );
};

export default ChatPage;
