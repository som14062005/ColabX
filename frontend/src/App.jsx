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
import CommitGraphReactFlow from "./CommitGraphReactFlow";
import Notification from "./Notification";

// New imports for dashboard & subpages
import ProjectDashboard from "./ProjectDashboard/ProjectDashboard";
import TasksLead from "./ProjectDashboard/LeadTasksPage";
import TasksMember from "./ProjectDashboard/MemberTaskPage";


function App() {
  return (
    <React.Fragment>
      <Router>
        <Routes>
          <Route path="/" element={<SignupPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/devs" element={<UserCatalogueFriendsList />} />
          <Route path="/community" element={<CommunitiesPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/projects" element={<ProjectCard />} />
          <Route path="/host-project" element={<HostProject />} /> {/* ✅ Host project route */}
          <Route path="/workspace" element={<WorkspaceHub />} /> {/* ✅ Workspace route */}
          <Route path="/whiteboard" element={<Whiteboard />} />
          <Route path="/git" element={<CommitGraphReactFlow owner="som14062005" repo="NAMMA_THA" branch="main" maxCommitsPerBranch={80}/>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notification />} /> {/* ✅ New Notification route */}
        </Routes>
      </Router>
    </React.Fragment>
  );
}

export default App;
