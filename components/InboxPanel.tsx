"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ArrowLeft, X, MoreHorizontal } from "lucide-react";
import { Chat, ChatMessage } from "@/lib/api";
import ChatAvatar, { LetterAvatar } from "./ChatAvatar";

const SENDER_COLORS = [
  { name: "#E5A443", bubble: "bg-[#FCEED3] border border-[#E5A443]" },
  { name: "#9B51E0", bubble: "bg-[#EEDCFF] border border-[#9B51E0]" },
  { name: "#43B78D", bubble: "bg-[#D2F2EA] border border-[#43B78D]" },
  { name: "#2F80ED", bubble: "bg-[#D5E8FD] border border-[#2F80ED]" },
];

function MessageMenu({ isOwn, onClose }: { isOwn: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`absolute top-0 z-10 bg-white rounded-lg shadow-lg border border-[#BDBDBD] w-[126px] overflow-hidden ${
        isOwn ? "right-full mr-2" : "left-full ml-2"
      }`}
    >
      <button className="w-full px-4 py-3 text-left text-sm text-[#2F80ED] font-semibold hover:bg-[#F5F5F5] transition-colors border-b border-[#BDBDBD]">
        Edit
      </button>
      <button className="w-full px-4 py-3 text-left text-sm text-[#EB5757] font-semibold hover:bg-[#F5F5F5] transition-colors">
        Delete
      </button>
    </div>
  );
}

function ChatDetail({ chat, onBack }: { chat: Chat; onBack: () => void }) {
  const [input, setInput] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setOpenMenuId(null), []);

  const senderColorMap = useRef<Record<string, (typeof SENDER_COLORS)[0]>>({});
  let colorIdx = 0;
  function getOrAssignColor(sender: string) {
    if (!senderColorMap.current[sender]) {
      senderColorMap.current[sender] = SENDER_COLORS[colorIdx % SENDER_COLORS.length];
      colorIdx++;
    }
    return senderColorMap.current[sender];
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  chat.messages.forEach((m) => {
    if (!m.isOwn) getOrAssignColor(m.sender);
  });

  const newMessageIdx = chat.messages.findIndex((m) => m.isNew);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3 border-b border-[#BDBDBD] flex items-start gap-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="mt-0.5 text-[#333333] hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-[#2F80ED] font-bold text-sm leading-tight line-clamp-2">
            {chat.title}
          </h2>
          <p className="text-[#333333] text-xs mt-0.5">
            {chat.participantCount} Participants
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-[#333333] hover:opacity-70 transition-opacity mt-0.5"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin">
        {chat.messages.map((msg, i) => {
          const showDate = msg.dateLabel != null;
          const showNewDivider = i === newMessageIdx && newMessageIdx > 0;
          const senderStyle = !msg.isOwn ? getOrAssignColor(msg.sender) : null;

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[#BDBDBD]" />
                  <span className="text-xs text-[#4F4F4F] font-semibold whitespace-nowrap">
                    {msg.dateLabel}
                  </span>
                  <div className="flex-1 h-px bg-[#BDBDBD]" />
                </div>
              )}

              {showNewDivider && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[#EB5757]" />
                  <span className="text-xs text-[#EB5757] font-semibold whitespace-nowrap">
                    New Message
                  </span>
                  <div className="flex-1 h-px bg-[#EB5757]" />
                </div>
              )}

              <div className={`flex items-start gap-2 ${msg.isOwn ? "justify-end" : "justify-start"} group`}>
                {msg.isOwn && (
                  <div className="relative self-start mt-6 shrink-0">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#828282] hover:text-[#333333]"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === msg.id && (
                      <MessageMenu isOwn={true} onClose={closeMenu} />
                    )}
                  </div>
                )}

                <div className={`max-w-[65%] flex flex-col ${msg.isOwn ? "items-end" : "items-start"}`}>
                  {!msg.isOwn && (
                    <span className="text-xs font-bold mb-1" style={{ color: senderStyle?.name }}>
                      {msg.sender}
                    </span>
                  )}
                  {msg.isOwn && (
                    <span className="text-xs font-bold mb-1 text-[#9B51E0]">You</span>
                  )}
                  <div
                    className={`px-3 py-2 rounded-md text-sm text-[#333333] leading-relaxed ${
                      msg.isOwn
                        ? "bg-[#EEDCFF]"
                        : senderStyle?.bubble ?? "bg-white border border-[#BDBDBD]"
                    }`}
                  >
                    {msg.text}
                    <div className={`text-[10px] text-[#828282] mt-1 ${msg.isOwn ? "text-right" : "text-left"}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>

                {!msg.isOwn && (
                  <div className="relative self-start mt-6 shrink-0">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#828282] hover:text-[#333333]"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === msg.id && (
                      <MessageMenu isOwn={false} onClose={closeMenu} />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {chat.connecting && (
        <div className="flex items-center gap-3 bg-[#E9F3FF] px-5 py-3 shrink-0">
          <div className="w-4 h-4 border-2 border-[#2F80ED] border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="text-xs text-[#4F4F4F]">
            Please wait while we connect you with one of our team ...
          </span>
        </div>
      )}

      <div className="px-5 py-3 border-t border-[#BDBDBD] flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a new message"
          className="flex-1 border border-[#BDBDBD] rounded px-3 py-2 text-sm outline-none focus:border-[#2F80ED] transition-colors"
        />
        <button
          className="bg-[#2F80ED] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#2567c4] transition-colors disabled:opacity-50"
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

function InboxList({
  chats,
  onSelect,
  loading,
  search,
  onSearch,
}: {
  chats: Chat[];
  onSelect: (chat: Chat) => void;
  loading: boolean;
  search: string;
  onSearch: (v: string) => void;
}) {
  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search"
            className="w-full border border-[#BDBDBD] rounded px-3 py-2 pr-9 text-sm outline-none focus:border-[#2F80ED] transition-colors"
          />
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#828282]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-[#828282]">
            <div className="w-8 h-8 border-2 border-[#C4C4C4] border-t-[#828282] rounded-full animate-spin" />
            <span className="text-sm">Loading Chats ...</span>
          </div>
        ) : (
          filtered.map((chat, idx) => (
            <div key={chat.id}>
              <button
                onClick={() => onSelect(chat)}
                className="w-full px-5 py-4 flex items-start gap-3 hover:bg-[#F5F5F5] transition-colors text-left"
              >
                {chat.avatarLetter ? (
                  <LetterAvatar letter={chat.avatarLetter} title={chat.title} />
                ) : (
                  <ChatAvatar title={chat.title} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[#2F80ED] font-bold text-sm leading-tight line-clamp-1">
                      {chat.title}
                    </span>
                    <span className="text-[#828282] text-xs whitespace-nowrap flex-shrink-0">
                      {chat.lastDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="min-w-0">
                      <p className="text-[#333333] text-xs font-semibold truncate">
                        {chat.lastSender} :
                      </p>
                      <p className="text-[#828282] text-xs truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                    {chat.unread && (
                      <div className="w-2 h-2 rounded-full bg-[#EB5757] flex-shrink-0 ml-2 mt-1" />
                    )}
                  </div>
                </div>
              </button>
              {idx < filtered.length - 1 && (
                <div className="mx-5 border-b border-[#BDBDBD]" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function InboxPanel({ onClose }: { onClose: () => void }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/chats")
      .then((r) => r.json())
      .then(setChats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-[500px] h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
      {selectedChat ? (
        <ChatDetail
          chat={selectedChat}
          onBack={() => setSelectedChat(null)}
        />
      ) : (
        <InboxList
          chats={chats}
          onSelect={setSelectedChat}
          loading={loading}
          search={search}
          onSearch={setSearch}
        />
      )}
    </div>
  );
}
