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
import CommitGraphReactFlow from "./CommitGraphReactFlow";
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
        <Route path="/git" element={<CommitGraphReactFlow owner="som14062005" repo="NAMMA_THA" branch="main" token="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" maxCommitsPerBranch={80}/>} />
      </Routes>
    </Router>
  );
}

export default App;