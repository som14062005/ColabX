import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./SignupPage";
import Login from "./Login";
import HostProject from "./HostProject";
import UserCatalogueFriendsList from "./UserCatalogueFriendsList";
import CommunitiesPage from "./CommunitiesPage";
import { abi, contract } from "./contract.json";
import MainPage from "./MainPage";
import { useFriend } from "./context/FriendContext";
import FriendRequestPopup from "./FriendRequestPopup";
import { FriendProvider } from "./context/FriendContext";
import Notification from "./Notification"; // ✅ New Notification page

function App() {
  // TEMP: Dummy fallback in case context is not fully wired up yet
  const { incomingRequests = [], handleRespond = () => {} } = useFriend?.() || {};

  return (
    <FriendProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SignupPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/devs" element={<UserCatalogueFriendsList />} />
          <Route path="/community" element={<CommunitiesPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/notifications" element={<Notification />} /> {/* ✅ New route */}
        </Routes>

        {/* Friend request popups */}
        {incomingRequests.map((request) => (
          <FriendRequestPopup
            key={request._id}
            request={request}
            onRespond={handleRespond}
          />
        ))}
      </Router>
    </FriendProvider>
  );
}

export default App;
