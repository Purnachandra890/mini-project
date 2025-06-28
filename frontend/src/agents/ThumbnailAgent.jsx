// File: /client/src/components/ThumbnailAgent.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../index.css";

const ThumbnailAgent = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("Authorization");
    if (!storedToken) return;
    try {
      const decoded = jwtDecode(storedToken);
      setUserId(decoded.userId);
      setToken(storedToken);
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, []);

  const handleGenerate = async () => {
    if (!userInput.trim()) return;
    const promptMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, promptMessage]);
    setUserInput("");
    setIsGenerating(true);

    try {
      const res = await axios.post(
        "https://api.stability.ai/v1/generation/stable-diffusion-v1-5/text-to-image",
        {
          text_prompts: [{ text: userInput }],
          cfg_scale: 7,
          height: 512,
          width: 512,
          samples: 1,
          steps: 30,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_STABILITY_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          responseType: "json",
        }
      );

      const imageBase64 = res.data.artifacts[0].base64;
      const generatedImageUrl = `data:image/png;base64,${imageBase64}`;
      setImageUrl(generatedImageUrl);
      setMessages((prev) => [...prev, { sender: "bot", text: "[Thumbnail generated]" }]);
    } catch (err) {
      console.error("❌ Error generating image:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      <h1 className="text-white text-lg font-semibold mt-4">Thumbnail Generator</h1>

      {/* Messages */}
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
            {msg.text}
          </div>
        ))}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Generated Thumbnail"
            className="rounded-lg mx-auto shadow-xl max-w-xs border"
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input */}
      <div className="w-full max-w-2xl px-4 py-4 sticky bottom-0 bg-black space-y-2">
        <div
          onClick={scrollToBottom}
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-black text-2xl animate-bounce cursor-pointer z-10"
          title="Scroll to latest"
        >
          ⬇
        </div>

        <div className="bg-zinc-900 text-white rounded-3xl px-4 py-0.1">
          <textarea
            placeholder="Describe your thumbnail..."
            className="flex-1 w-full max-w-2xl px-4 py-6 space-y-4 overflow-y-auto custom-scroll bg-zinc-900 text-white rounded-3xl focus:outline-none focus:ring-0"
            rows={1}
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
        </div>

        <div className="flex justify-end items-center px-1">
          <button
            onClick={handleGenerate}
            className="text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full"
            title="Generate"
            disabled={isGenerating}
          >
            {isGenerating ? "⏳" : "🎨 Generate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailAgent;
