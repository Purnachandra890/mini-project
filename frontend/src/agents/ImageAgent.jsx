import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../index.css";

const ImageAgent = () => {
  const [messages, setMessages] = useState([]); // Array of { type: 'user' | 'image', prompt: '', imageUrl: '' }
  const [userInput, setUserInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Decode token and extract user ID
  useEffect(() => {
    const storedToken = localStorage.getItem("Authorization");
    if (!storedToken) return;
    try {
      const decoded = jwtDecode(storedToken);
      setUserId(decoded.userId);
      setToken(storedToken);
    } catch (err) {
      console.error("Token decode error:", err);
    }
  }, []);

  useEffect(() => {
    if (!userId || !token) return;

    axios
      .get(
        `${import.meta.env.VITE_API_BASE_URL}/generate-image/history/${userId}`,
        {
          headers: { Authorization: token },
        }
      )
      .then((res) => {
        const history = res.data.flatMap((entry) => [
          { type: "user", prompt: entry.prompt },
          { type: "image", prompt: entry.prompt, imageUrl: entry.imageUrl },
        ]);
        setMessages(history);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch image history:", err);
      });
  }, [userId, token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle send
  const handleSend = async () => {
    if (!userInput.trim() || !userId || !token) return;
    const prompt = userInput.trim();

    setMessages((prev) => [...prev, { type: "user", prompt }]);
    setUserInput("");
    setLoading(true);

    try {
      console.log("sending reques..");
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/generate-image/${userId}`,
        { prompt },
        { headers: { Authorization: token } }
      );

      setMessages((prev) => [
        ...prev,
        {
          type: "image",
          prompt,
          imageUrl: res.data.imageUrl,
        },
      ]);
    } catch (err) {
      console.error("❌ Image generation failed:", err);
      alert("Image generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userId || !token) return;
    const confirmed = window.confirm(
      "Are you sure you want to clear image history?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/generate-image/history/${userId}`,
        {
          headers: { Authorization: token },
        }
      );
      setMessages([]);
    } catch (err) {
      console.error("❌ Failed to delete image history:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      <h1 className="text-white text-lg font-semibold mt-4">
        Text-to-Image Generator 🖼️
      </h1>

      {/* Chat Area */}
      <div className="flex-1 w-full max-w-2xl px-4 py-6 space-y-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            } w-full`}
          >
            {msg.type === "user" ? (
              <div className="bg-white text-black px-4 py-3 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl whitespace-pre-line max-w-[70%]">
                {msg.prompt}
              </div>
            ) : (
              <div className="bg-white px-3 py-2 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl max-w-[70%]">
                <img
                  src={msg.imageUrl}
                  alt="Generated"
                  className="rounded-lg border border-gray-300 mb-2 max-w-xs"
                />
                
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="w-full max-w-2xl px-4 py-4 sticky bottom-0 bg-black space-y-2">
        <div
          onClick={scrollToBottom}
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white text-2xl animate-bounce cursor-pointer z-10"
        >
          ⬇
        </div>

        <div className="bg-zinc-900 text-white rounded-3xl px-4 py-0.1">
          <textarea
            placeholder="Describe your image..."
            className="w-full px-4 py-6 bg-zinc-900 text-white rounded-3xl focus:outline-none"
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
          <span className="text-xs text-gray-300">Tokens required: 20</span>
          <div className="flex space-x-2">
            <button
              onClick={handleSend}
              disabled={loading}
              className="text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full"
            >
              {loading ? "⏳" : "📤 Generate"}
            </button>
            <button
              onClick={handleDelete}
              className="text-white bg-red-600 hover:bg-red-500 px-3 py-2 rounded-full"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAgent;
