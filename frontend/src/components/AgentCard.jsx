import React from "react";
import { useNavigate } from "react-router-dom";

const AgentCard = ({ title, description, tokens, image, route, buttonColor }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-black text-white rounded-2xl w-64 p-4 shadow-lg flex flex-col items-center">
      <div className="w-full h-24 bg-gray-100 rounded-t-2xl flex items-center justify-center">
        <img
          src={image}
          alt="Agent"
          className="w-16 h-16 rounded-full object-cover"
        />
      </div>
      <div
        className="w-full p-4 rounded-b-2xl text-center"
        style={{ backgroundColor: "#151515" }}
      >
        <h2 className="text-lg font-semibold mb-1">{title}</h2>
        <p className="text-sm text-gray-300">{description}</p>
        <p className="text-sm mt-1 text-gray-400">{tokens} credits per task</p>
        <button
          onClick={() => navigate(route)}
          className={`mt-3 px-4 py-2 rounded-full text-white font-semibold ${
            buttonColor === "blue"
              ? "bg-blue-500"
              : buttonColor === "pink"
              ? "bg-pink-500"
              : "bg-lime-500"
          }`}
        >
          Go
        </button>
      </div>
    </div>
  );
};

export default AgentCard;
