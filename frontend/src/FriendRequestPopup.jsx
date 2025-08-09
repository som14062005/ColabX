// src/FriendRequestPopup.jsx
import React from "react";
import axios from "axios";

const FriendRequestPopup = ({ request, onRespond }) => {
  const handleResponse = async (response) => {
    await axios.post("/api/respondRequest", {
      requestId: request._id,
      response: response,
    });
    onRespond(request._id, response);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border shadow-lg">
      <p>{request.senderName} sent you a friend request!</p>
      <button onClick={() => handleResponse("accepted")} className="bg-green-500 text-white px-2 py-1 mr-2">Accept</button>
      <button onClick={() => handleResponse("rejected")} className="bg-red-500 text-white px-2 py-1">Reject</button>
    </div>
  );
};

export default FriendRequestPopup;
