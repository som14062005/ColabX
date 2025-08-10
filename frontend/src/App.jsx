import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./SignupPage";
import Login from "./Login";
import HostProject from "./HostProject";
import UserCatalogueFriendsList from "./UserCatalogueFriendsList";
import CommunitiesPage from "./CommunitiesPage";
import { abi, contract } from "./contract.json";
import MainPage from "./MainPage";
import ProjectCard from "./ProjectCard";
import Whiteboard from "./Whiteboard";
import WorkspaceHub from "./WorkspaceHub";
import Profile from "./Profile";
import Notification from "./Notification";

// New imports for dashboard & subpages
import ProjectDashboard from "./ProjectDashboard/ProjectDashboard";
import TasksLead from "./ProjectDashboard/LeadTasksPage";
import TasksMember from "./ProjectDashboard/MemberTaskPage";


function App() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<SignupPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<Login />} />

        {/* Main features */}
        <Route path="/devs" element={<UserCatalogueFriendsList />} />
        <Route path="/community" element={<CommunitiesPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/projects" element={<ProjectCard />} />
        <Route path="/host-project" element={<HostProject />} />
        <Route path="/workspace" element={<WorkspaceHub />} />
        <Route path="/whiteboard" element={<Whiteboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notification />} />

        {/* Project Dashboard and its features */}
        <Route path="/project-dashboard" element={<ProjectDashboard />} />
        <Route path="/tasks-lead" element={<TasksLead />} />
        <Route path="/tasks-member" element={<TasksMember />} />
       
      </Routes>
    </Router>
  );
}

export default App;
