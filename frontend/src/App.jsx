import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./SignupPage";
import Login from "./Login";
import UserCatalogueFriendsList from "./UserCatalogueFriendsList";
import CommunitiesPage from "./CommunitiesPage";
import { abi, contract } from "./contract.json";
import MainPage from "./MainPage";
import ProjectCard from "./ProjectCard";
import Whiteboard from "./Whiteboard";
import WorkspaceHub from "./WorkspaceHub";
import CommitGraphReactFlow from "./CommitGraphReactFlow";
import Notification from "./Notification";
import CodeEditor from "./CodeEditor";
import ProjectNotes from "./ProjectNotes";
import UserProfile from "./profile_onchain_resume";

// New imports for dashboard & subpages
import ProjectDashboard from "./ProjectDashboard/ProjectDashboard";
import TasksLead from "./ProjectDashboard/LeadTasksPage";
import TasksMember from "./ProjectDashboard/MemberTaskPage";
import ProjectDetailsPage from "./projectone";
import IssueBoard from "./IssueBoard";
import ChatRoom from "./ChatRoom";
import "./App.css"; // Assuming you have some global styles


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
          
          <Route path="/workspace" element={<WorkspaceHub />} /> {/* ✅ Workspace route */}
          <Route path="/whiteboard" element={<Whiteboard />} />
          <Route path="/git" element={<CommitGraphReactFlow owner="som14062005" repo="NAMMA_THA" branch="main" maxCommitsPerBranch={80}/>} />          <Route path="/notifications" element={<Notification />} /> {/* ✅ New Notification route */}
          <Route path="/project-dashboard" element={<ProjectDashboard />} />
          <Route path="/tasks-lead" element={<TasksLead />} />
          <Route path="/tasks-member" element={<TasksMember />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/issues" element={<IssueBoard />} />
          <Route path="/code" element={<CodeEditor/>} />
          <Route path="/notes" element={<ProjectNotes />} />
          <Route path="/chat" element={<ChatRoom />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </Router>
    </React.Fragment>
  );
}

export default App;
