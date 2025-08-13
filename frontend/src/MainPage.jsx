import React from "react";
import { motion } from "framer-motion";
import project from "./assets/project.png";
import profileImg from "./assets/profile.png";
import devsImg from "./assets/devs.png";
import commuImg from "./assets/commu.png";
import "./MainPage.css";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();

  // Animation variants for different corners
  const cornerVariants = {
    topLeft: {
      hidden: { x: -200, y: -200, opacity: 0 },
      visible: { x: 0, y: 0, opacity: 1 },
    },
    topRight: {
      hidden: { x: 200, y: -200, opacity: 0 },
      visible: { x: 0, y: 0, opacity: 1 },
    },
    bottomLeft: {
      hidden: { x: -200, y: 200, opacity: 0 },
      visible: { x: 0, y: 0, opacity: 1 },
    },
    bottomRight: {
      hidden: { x: 200, y: 200, opacity: 0 },
      visible: { x: 0, y: 0, opacity: 1 },
    },
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">
          <span style={{ color: "#A259FF" }}>Colab</span>
          <span style={{ color: "#FFFFFF" }}>X</span>
        </h1>
        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white">
            <i className="fas fa-bell"></i>
          </button>
          <img
            src={profileImg}
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </header>

      {/* Welcome Message */}
      <div className="text-center mt-12">
        <h1 className="text-5xl font-bold">
          Welcome to{" "}
          <span className="gradient-text animate-shimmer">ColabX</span>
        </h1>
        <p className="text-[#B3B3B3] mt-2">
          <span style={{ color: "#A259FF" }}>
            Collaborate, Build, and Grow Together
          </span>
        </p>
      </div>

      {/* Main Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8 mt-12">
        {/* Projects - Top Left */}
        <motion.div
          className="card-glow bg-[#1A1A1A] p-6 rounded-2xl shadow text-center cursor-pointer"
          variants={cornerVariants.topLeft}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, ease: "easeOut" }}
          onClick={() => navigate("/projects")}
        >
          <img
            src={project}
            alt="Project"
            className="w-full h-48 object-cover rounded-xl mx-auto mb-4"
          />
          <h3 className="font-semibold text-lg text-[#A259FF]">Project</h3>
          <p className="text-[#B3B3B3] text-sm mt-2">
            Manage your ongoing projects and contributions.
          </p>
        </motion.div>

        {/* Profile - Top Right */}
        <motion.div
          className="card-glow bg-[#1A1A1A] p-6 rounded-2xl shadow text-center cursor-pointer"
          variants={cornerVariants.topRight}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          onClick={() => navigate("/profile")}
        >
          <img
            src={profileImg}
            alt="Profile"
            className="w-full h-48 object-cover rounded-xl mx-auto mb-4"
          />
          <h3 className="font-semibold text-lg text-[#A259FF]">Profile</h3>
          <p className="text-[#B3B3B3] text-sm mt-2">
            View and update your personal and professional details.
          </p>
        </motion.div>

        {/* Devs - Bottom Left */}
        <motion.div
          className="card-glow bg-[#1A1A1A] p-6 rounded-2xl shadow text-center cursor-pointer"
          variants={cornerVariants.bottomLeft}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          onClick={() => navigate("/devs")}
        >
          <img
            src={devsImg}
            alt="Devs"
            className="w-full h-48 object-cover rounded-xl mx-auto mb-4"
          />
          <h3 className="font-semibold text-lg text-[#A259FF]">Devs</h3>
          <p className="text-[#B3B3B3] text-sm mt-2">
            Discover and connect with other developers.
          </p>
        </motion.div>

        {/* Communities - Bottom Right */}
        <motion.div
          className="card-glow bg-[#1A1A1A] p-6 rounded-2xl shadow text-center cursor-pointer"
          variants={cornerVariants.bottomRight}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          onClick={() => navigate("/community")}
        >
          <img
            src={commuImg}
            alt="Communities"
            className="w-full h-48 object-cover rounded-xl mx-auto mb-4"
          />
          <h3 className="font-semibold text-lg text-[#A259FF]">Communities</h3>
          <p className="text-[#B3B3B3] text-sm mt-2">
            Join or create communities based on your interests.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MainPage;
