import React from "react";
import AgentCard from "../components/AgentCard";
const Agents = () => {
  return (
    <div className="bg-black min-h-screen text-white py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Meet Your Creative Agents</h1>
      <div className="flex flex-wrap justify-center gap-6">
        <AgentCard
          title="Script Writer"
          description="Generates beautiful scripts for your videos"
          tokens={30}
          image="https://png.pngtree.com/png-vector/20220625/ourmid/pngtree-movie-scripts-chalk-icon-png-image_5434183.png" // Replace with your image path
          route="/agents/script"
          buttonColor="blue"
        />
        <AgentCard
          title="Captions maker"
          description="Generate beautiful captions for your images"
          tokens={10}
          image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKlrzG1HEqHLMq1BmaW95BUP95LAh2dZdOBaCgCgbW-1WcAtZ0u727i2XsR_luJqKnZoQ&usqp=CAU"
          route="/agents/caption"
          buttonColor="pink"
        />
        <AgentCard
          title="Lingua-AI"
          description="translate any language text to English Language"
          tokens={5}
          image="https://cdn-icons-png.flaticon.com/512/2201/2201566.png"
          route="/agents/translate"
          buttonColor="green"
        />
        <AgentCard
          title="ThumbnailAgent"
          description="Create Beautiful Thumbnails for your Videos"
          tokens={400}
          image="https://cdn-icons-png.flaticon.com/512/2201/2201566.png"
          route="/agents/thumbnail"
          buttonColor="blue"
        />
        {/* Add more <AgentCard />s as needed */}
      </div>
    </div>
  );
};

export default Agents;
