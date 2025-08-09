import React from "react";
import project from "./assets/project.png";
import profileImg from "./assets/profile.png";
import devsImg from "./assets/devs.png";
import commuImg from "./assets/commu.png";
import './MainPage.css';
import { Link } from "react-router-dom";

const MainPage = () => {
  const username = sessionStorage.getItem("username"); // ✅ get username

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">ColabX</h1>
        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white">
            <i className="fas fa-bell"></i>
          </button>

          {/* ✅ Username + Avatar */}
          <div className="flex items-center space-x-2">
            {username && <span className="text-sm text-gray-300">{username}</span>}
            <img
              src={profileImg}
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </div>
      </header>

      {/* Welcome Message */}
      <div className="text-center mt-12">
        <h1 className="text-5xl font-bold">
          Welcome to{" "}
          <span className="gradient-text animate-shimmer">ColabX</span>
        </h1>
        <p className="text-[#B3B3B3] mt-2">
          Collaborate, Build, and Grow Together
        </p>
      </div>

      {/* Main Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8 mt-12">
        {/* Projects */}
        <div className="bg-[#1A1A1A] p-6 rounded-2xl shadow hover:shadow-lg hover:scale-105 transition-all duration-300 text-center">
          <img
            src={project}
            alt="Project"
            className="w-full h-68 object-cover rounded-xl mx-auto mb-4"
          />
          <h3 className="font-semibold text-lg">Project</h3>
          <p className="text-[#B3B3B3] text-sm mt-2">
            Manage your ongoing projects and contributions.
          </p>
        </div>

        {/* Profile */}
        <div className="bg-[#1A1A1A] p-6 rounded-2xl shadow hover:shadow-lg hover:scale-105 transition-all duration-300 text-center">
          <img
            src={profileImg}
            alt="Profile"
            className="w-full h-58 object-cover rounded-xl mx-auto mb-4"
          />
          <h3 className="font-semibold text-lg">Profile</h3>
          <p className="text-[#B3B3B3] text-sm mt-2">
            View and update your personal and professional details.
          </p>
        </div>

        {/* Devs */}
        <Link to="/devs">
          <div className="bg-[#1A1A1A] p-6 rounded-2xl shadow hover:shadow-lg hover:scale-105 transition-all duration-300 text-center cursor-pointer">
            <img
              src={devsImg}
              alt="Devs"
              className="w-full h-58 object-cover rounded-xl mx-auto mb-4"
            />
            <h3 className="font-semibold text-lg">Devs</h3>
            <p className="text-[#B3B3B3] text-sm mt-2">
              Discover and connect with other developers.
            </p>
          </div>
        </Link>

        {/* Communities */}
        <div className="bg-[#1A1A1A] p-6 rounded-2xl shadow hover:shadow-lg hover:scale-105 transition-all duration-300 text-center">
          <img
            src={commuImg}
            alt="Communities"
            className="w-full h-58 object-cover rounded-xl mx-auto mb-4"
          />
          <h3 className="font-semibold text-lg">Communities</h3>
          <p className="text-[#B3B3B3] text-sm mt-2">
            Join or create communities based on your interests.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center mt-10">
        <button className="bg-[#A259FF] hover:bg-[#7C3AED] text-white px-6 py-3 rounded-xl font-medium transition-all duration-300">
          Start Collaborating
        </button>
      </div>
    </div>
  );
};

export default MainPage;
