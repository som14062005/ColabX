import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./SignupPage";
import Login from "./Login";
import HostProject from "./HostProject";
import UserCatalogueFriendsList from "./UserCatalogueFriendsList";
import CommunitiesPage from "./CommunitiesPage";
import MainPage from "./MainPage";

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
        {/* You can add dashboard route later */}
      </Routes>
    </Router>
  );
}

export default App;