import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import * as aiApi from "../api/ai";

// Floating AI assistant panel. Drop <AiChatPanel /> into any role layout —
// it talks to POST /api/ai/chat, which scopes tools to the logged-in user's
// role on the backend (brief M8: "the model picks a tool, the backend runs
// it with the user's scope"). History is kept in-memory only, per session.
export default function AiChatPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // [{ role: "user"|"assistant", content, toolsUsed? }]
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const chatMutation = useMutation({
    mutationFn: ({ message, history }) => aiApi.chat({ message, history }),
    onSuccess: (res) => {
      setMessages((m) => [...m, { role: "assistant", content: res.reply, toolsUsed: res.toolsUsed }]);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "The AI assistant is unavailable right now — please try again in a moment.";
      setMessages((m) => [...m, { role: "assistant", content: msg, isError: true }]);
    },
  });

  function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || chatMutation.isPending) return;

    // Build the history payload from what's on screen so far (role/content pairs only).
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    chatMutation.mutate({ message: text, history });
  }

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-3 text-sm font-medium shadow-lg hover:bg-slate-800"
        >
          <SparkleIcon />
          Ask the assistant
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] h-[32rem] max-h-[calc(100vh-3rem)] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SparkleIcon />
              AI Assistant
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-white text-lg leading-none">
              ×
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-sm text-gray-400 text-center mt-8 px-4">
                Ask about attendance, leave balances, payroll summaries, or company policy.
                <br />
                Answers are scoped to what you're allowed to see.
              </div>
            )}
            {messages.map((m, i) => (
              <ChatBubble key={i} message={m} />
            ))}
            {chatMutation.isPending && (
              <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                </span>
                Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-gray-200 p-3 flex gap-2 shrink-0 bg-white">
            <input
              className="input flex-1 text-sm"
              placeholder="e.g. How many sick leaves do I have left?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatMutation.isPending}
            />
            <button
              type="submit"
              disabled={chatMutation.isPending || !input.trim()}
              className="btn-primary text-sm whitespace-nowrap"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-line ${
          isUser
            ? "bg-slate-900 text-white"
            : message.isError
            ? "bg-red-50 text-red-700 border border-red-100"
            : "bg-white text-gray-800 border border-gray-200"
        }`}
      >
        {message.content}
        {!isUser && !message.isError && (
          <div className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1 flex-wrap">
            <span className="uppercase tracking-wide">AI-generated</span>
            {message.toolsUsed && message.toolsUsed.length > 0 && (
              <span className="text-gray-300">· {message.toolsUsed.join(", ")}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 1.5L9.3 5.7L13.5 7L9.3 8.3L8 12.5L6.7 8.3L2.5 7L6.7 5.7L8 1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}