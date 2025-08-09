// src/context/FriendContext.jsx
import { createContext, useContext, useState } from "react";

const FriendContext = createContext();

export const FriendProvider = ({ children }) => {
  const [requests, setRequests] = useState([]); // [{from: user}]
  const [friends, setFriends] = useState([]);   // list of friend usernames

  const sendFriendRequest = (user) => {
    setRequests([...requests, { from: user }]);
  };

  const acceptRequest = (fromUser) => {
    setFriends([...friends, fromUser]);
    setRequests(requests.filter((r) => r.from !== fromUser));
  };

  return (
    <FriendContext.Provider value={{ requests, sendFriendRequest, acceptRequest }}>
      {children}
    </FriendContext.Provider>
  );
};

export const useFriend = () => useContext(FriendContext);
