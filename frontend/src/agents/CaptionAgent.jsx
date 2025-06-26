import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../index.css";

const CaptionAgent = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);

  const messagesEndRef = useRef(null); // ✅ scroll target

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("Authorization");
    if (!storedToken) {
      console.error("No token found");
      return;
    }
    try {
      const decoded = jwtDecode(storedToken);
      setUserId(decoded.userId);
      setToken(storedToken);
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, []);

  useEffect(() => {
    if (!userId || !token) return;

    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/captions/content/${userId}`, {
        headers: { Authorization: `${token}` },
      })
      .then((res) => {
        const formattedMessages = res.data.flatMap((chat) => [
          { sender: "user", text: chat.prompt },
          { sender: "bot", text: chat.response },
        ]);
        setMessages(formattedMessages);
      })
      .catch((err) => {
        console.error("Failed to load history:", err);
      });
  }, [userId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim() || !userId || !token) return;

    const userMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/captions/content/${userId}`,
        { prompt: userInput },
        { headers: { Authorization: `${token}` } }
      );

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.data.captions || res.data.response },
      ]);
    } catch (err) {
      console.error("❌ Error sending prompt:", err);
    }
  };

  const handleDelete = async () => {
    if (!userId || !token) return;

    const confirmed = window.confirm(
      "Are you sure you want to start a new chat? This will delete your current chat history."
    );
    if (!confirmed) return;

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/captions/content/${userId}`,
        {
          headers: { Authorization: `${token}` },
          data: { title: "New Chat Session" }, // optional title
        }
      );

      console.log(res.data.message);
      setMessages([]); // Clear chat messages on frontend
    } catch (err) {
      console.error("❌ Error deleting chats:", err);
    }
  };
  // handle rewrite
  const handleRewrite = async () => {
    if (!userInput.trim() || !token) return;
    setIsRewriting(true); // start loading

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/rewrite`,
        { text: userInput },
        { headers: { Authorization: `${token}` } }
      );

      if (res.data && res.data.rewrittenText) {
        // Remove surrounding quotes if present
        const cleaned = res.data.rewrittenText.trim().replace(/^"(.*)"$/, "$1");
        setUserInput(cleaned);
      }
    } catch (err) {
      console.error("❌ Error rewriting text:", err);
    } finally {
      setIsRewriting(false); // stop loading
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      <h1 className="text-white text-lg font-semibold mt-4">
        Captions Generator
      </h1>

      {/* Chat Messages */}
      <div className="flex-1 w-full max-w-2xl px-4 py-6 space-y-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`px-4 py-3 text-black whitespace-pre-line max-w-[75%] ${
              msg.sender === "user"
                ? "bg-white ml-auto rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                : "bg-white mr-auto rounded-tr-2xl rounded-tl-2xl rounded-br-2xl"
            }`}
          >
            <div className="whitespace-pre-line">{msg.text}</div>
          </div>
        ))}
        {/* ✅ Scroll target at bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Bar */}
      <div className="w-full max-w-2xl px-4 py-4 sticky bottom-0 bg-black space-y-2">
        {/* ⬇ Arrow */}
        <div
          onClick={scrollToBottom} // ✅ handle click
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-black text-2xl animate-bounce cursor-pointer z-10"
          title="Scroll to latest"
        >
          ⬇
        </div>

        {/* Input Box */}
        <div className="bg-zinc-900 text-white rounded-3xl px-4 py-0.1">
          <textarea
            placeholder="Describe your image..."
            className="flex-1 w-full max-w-2xl px-4 py-6 space-y-4 overflow-y-auto custom-scroll bg-zinc-900 text-white rounded-3xl focus:outline-none focus:ring-0"
            rows={1}
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(
                e.target.scrollHeight,
                150
              )}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center px-1">
          <button
            onClick={handleRewrite}
            disabled={isRewriting}
            className={`text-sm ${
              isRewriting
                ? "text-yellow-300 cursor-not-allowed"
                : "text-yellow-400"
            }`}
            title="Rewrite your prompt"
          >
            ✍️ Rewrite
          </button>

          <div className="flex space-x-2">
            <button
              onClick={handleSend}
              className="text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full"
              title="Send"
            >
              📤
            </button>
            <button
              onClick={handleDelete}
              className="text-white bg-red-600 hover:bg-red-500 px-3 py-2 rounded-full"
              title="New Chat"
            >
              🔄
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptionAgent;
