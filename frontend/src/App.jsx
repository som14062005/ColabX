import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./SignupPage";
import Login from "./Login";
import HostProject from "./HostProject";
import UserCatalogueFriendsList from "./UserCatalogueFriendsList";
import CommunitiesPage from "./CommunitiesPage";
import { abi , contract } from "./contract.json";
import MainPage from "./MainPage";
import ProjectCard from "./ProjectCard";
import Profile from "./Profile";
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/devs" element={<UserCatalogueFriendsList />} />
        <Route path="/community" element={<CommunitiesPage />} />
        <Route path="/main" element={<MainPage/>} />
        <Route path="/projects" element={<ProjectCard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;