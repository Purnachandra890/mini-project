import React from "react";
import { FaRobot, FaExchangeAlt, FaMagic, FaServer, FaDatabase } from "react-icons/fa";

const HowItWorks = () => {
  const steps = [
    {
      icon: <FaRobot className="text-blue-500 text-3xl" />,
      title: "You Give a Prompt",
      description:
        "Start by entering an idea or prompt. Whether it's a script, caption, image request, or translation — you provide the creative spark!",
      color: "blue-500",
    },
    {
      icon: <FaExchangeAlt className="text-pink-500 text-3xl" />,
      title: "Agent Picks It Up",
      description:
        "The relevant AI Agent (like ScriptWriter, Translator, ThumbnailBot) is triggered. It prepares to process your request using its predefined logic.",
      color: "pink-500",
    },
    {
      icon: <FaMagic className="text-lime-500 text-3xl" />,
      title: "ChatGPT Processes",
      description:
        "Behind the scenes, ChatGPT understands your input and formulates responses in natural language or generates structured content.",
      color: "lime-500",
    },
    {
      icon: <FaServer className="text-blue-500 text-3xl" />,
      title: "API Execution",
      description:
        "If required, the agent connects to real-world APIs like Stability AI or Translation APIs to fetch actual content/data/images.",
      color: "blue-500",
    },
    {
      icon: <FaDatabase className="text-pink-500 text-3xl" />,
      title: "Response Beautified",
      description:
        "The response is formatted, styled, and prepared to be shown back to you in an easy-to-use UI.",
      color: "pink-500",
    },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white px-6 py-16 overflow-hidden">
      {/* Background floating icons */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
        <div className="absolute top-10 left-10 text-blue-500 text-6xl animate-spin-slow">
          <FaRobot />
        </div>
        <div className="absolute bottom-20 right-10 text-pink-500 text-6xl animate-pulse">
          <FaMagic />
        </div>
        <div className="absolute top-1/2 right-1/4 text-lime-500 text-6xl animate-bounce">
          <FaDatabase />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-16 relative z-10">⚙️ How AI Agents Work</h1>

      {/* Timeline */}
      <div className="relative max-w-5xl mx-auto z-10">
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-500 via-pink-500 to-lime-500 h-full"></div>

        <div className="flex flex-col gap-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center ${index % 2 !== 0 ? "md:flex-row-reverse" : ""} relative`}
            >
              <div className="md:w-1/2 p-6">
                <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-white/10 p-4 rounded-full">{step.icon}</div>
                    <h2 className="text-xl font-bold text-white">{step.title}</h2>
                  </div>
                  <p className="text-sm text-gray-300">{step.description}</p>
                </div>
              </div>
              <div className="hidden md:flex md:w-1/2 justify-center relative">
                <div className="w-6 h-6 bg-white rounded-full border-4 border-black z-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;

