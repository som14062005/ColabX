import React from "react";

const WorkspaceHub = () => {
  const features = [
    { name: "Version Control Graph" },
    { name: "Collaborative Whiteboard / Canvas" },
    { name: "Voice Rooms & Chatrooms" },
    { name: "Issue Management" },
    { name: "Project Notes" },
    { name: "Kanban View" },
    { name: "Live Common Code Editor" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-10">
      <h1 className="text-4xl font-bold text-purple-400 mb-10">
        Project Workspace
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {features.map((feature, idx) => (
          <button
            key={idx}
            className="bg-purple-500 hover:bg-purple-600 p-6 rounded-xl shadow-lg text-xl font-semibold transition duration-300"
          >
            {feature.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceHub;
