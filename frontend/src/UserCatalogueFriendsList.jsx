// src/components/UserCatalogueFriendsList.jsx
import React, { useEffect, useState } from "react";
import { X, User, UserPlus, UserCheck, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const csSkills = [
  "React","JavaScript","HTML","CSS","Node.js","Python","Java","C++","C#",
  "TypeScript","Angular","Vue.js","PHP","Ruby","Go","Rust","Swift","Kotlin",
  "Solidity","Blockchain","Machine Learning","Data Science","DevOps","AWS","Docker"
];

export default function UserCatalogueFriendsList() {
  const [usersData, setUsersData] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchSkill, setSearchSkill] = useState("");
  const [activeTab, setActiveTab] = useState("catalogue");
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sentRequests, setSentRequests] = useState({}); // map: receiverId -> true

  const navigate = useNavigate();
  const loggedInUserId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");
  const currentUserId = String(loggedInUserId || "").trim();

  /** Fetch all users except self */
  const fetchUsers = async () => {
    try {
      if (!loggedInUserId) return;
      const res = await fetch("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      const filtered = Array.isArray(data)
        ? data.filter((u) => String(u._id).trim() !== currentUserId)
        : [];
      setUsersData(filtered);
    } catch (err) {
      console.error("fetchUsers:", err);
      setError("Could not load users.");
      setUsersData([]);
    }
  };

  /** Fetch pending requests RECEIVED */
  const fetchNotifications = async () => {
    try {
      if (!loggedInUserId) return;
      const res = await fetch(
        `http://localhost:3000/notifications/${loggedInUserId}?status=pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchNotifications:", err);
    }
  };

  /** Fetch accepted friends */
  const fetchFriends = async () => {
  try {
    if (!loggedInUserId) return;
    const res = await fetch(
      `http://localhost:3000/notifications/${currentUserId}?status=accepted`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("Failed to fetch friends");
    const data = await res.json();

    // Extract friend user objects
    const friendList = data.map(notif => {
      if (notif.senderId?._id === currentUserId) {
        return notif.receiverId;
      } else {
        return notif.senderId;
      }
    });

    // Remove duplicates by _id
    const uniqueFriends = [];
    const seen = new Set();
    for (const friend of friendList) {
      if (!seen.has(friend._id)) {
        seen.add(friend._id);
        uniqueFriends.push(friend);
      }
    }

    setFriends(uniqueFriends);
  } catch (err) {
    console.error("fetchFriends failed", err);
  }
};


  /** Fetch SENT requests (pending) so Add Friend does not reappear after refresh */
  const fetchSentRequests = async () => {
    try {
      if (!loggedInUserId) return;
      const res = await fetch(
        `http://localhost:3000/notifications/sent/${loggedInUserId}?status=pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;
      const data = await res.json();
      const sentMap = {};
      data.forEach(req => {
        if (req.receiverId?._id) {
          sentMap[req.receiverId._id] = true;
        }
      });
      setSentRequests(sentMap);
    } catch (err) {
      console.error("fetchSentRequests:", err);
    }
  };

  /** Initial load */
  useEffect(() => {
    fetchUsers();
    fetchNotifications();
    fetchFriends();
    fetchSentRequests();
  }, [loggedInUserId, token]);

  /** Send friend request */
  const handleAddFriend = async (receiverId) => {
    try {
      if (!currentUserId || !receiverId) {
        alert("Invalid sender or receiver ID.");
        return;
      }
      const payload = {
        senderId: currentUserId,
        receiverId,
        type: "friend_request",
        message: "Let's be friends!",
      };
      const response = await fetch("http://localhost:3000/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to send request");
      }
      await response.json();
      alert("Friend request sent!");
      setSentRequests((prev) => ({ ...prev, [receiverId]: true }));
    } catch (error) {
      console.error("Send friend request error:", error);
      alert("Could not send friend request.");
    }
  };

  /** Update notification status */
  const updateNotificationStatus = async (notificationId, status) => {
    try {
      const res = await fetch(
        `http://localhost:3000/notifications/${notificationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update status");
      }
      const data = await res.json().catch(() => null);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (data && data.updatedFriends && Array.isArray(data.updatedFriends)) {
        const usernames = data.updatedFriends.map((u) => u.username).filter(Boolean);
        setFriends(usernames);
      } else {
        fetchFriends();
      }
      fetchNotifications();
    } catch (err) {
      console.error("updateNotificationStatus:", err);
      alert("Could not update the request.");
    }
  };

  const handleAcceptRequest = (notificationId) =>
    updateNotificationStatus(notificationId, "accepted");
  const handleRejectRequest = (notificationId) =>
    updateNotificationStatus(notificationId, "rejected");

  /** Remove friend */
  const handleRemoveFriend = async (friendId) => {
    try {
      if (!currentUserId || !friendId) return;
      const res = await fetch(
        `http://localhost:3000/${currentUserId}/remove/${friendId}`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to remove friend");
      setFriends((prev) => prev.filter((f) => String(f._id) !== String(friendId) && f !== friendId));
      fetchFriends();
      fetchUsers();
    } catch (err) {
      console.error("removeFriend failed", err);
      alert("Could not remove friend.");
    }
  };

  /** Build a set of friend IDs for quick lookup */
  const friendIdsSet = new Set(
    friends.map(f => typeof f === "string" ? f : f?._id)
  );

  /** Filter users for Developers tab */
  const filteredUsers = Array.isArray(usersData)
    ? usersData.filter((user) => {
        if (!user) return false;
        const userId = user._id;
        if (friendIdsSet.has(userId)) return false;  // Hide accepted friends
        if (sentRequests[userId]) return false;      // Hide pending sent requests
        const matchesUsername = user.username
          ?.toLowerCase()
          .includes(searchUsername.toLowerCase());
        const matchesSkill = searchSkill
          ? user.skills?.some((skill) =>
              skill.toLowerCase().includes(searchSkill.toLowerCase())
            )
          : true;
        return matchesUsername && matchesSkill;
      })
    : [];

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: '#0D0D0D', color: '#FFFFFF' }}>
      {/* Navbar with Notifications */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#222]" style={{ backgroundColor: '#1A1A1A' }}>
        <h1 className="text-2xl font-bold">
          <span style={{ color: '#A259FF' }}>Colab</span><span style={{ color: '#FFFFFF' }}>X</span>
        </h1>
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <button
              className="relative p-2 rounded-md hover:bg-[#2A2A2A] transition"
              onClick={() => setShowNotifications((s) => !s)}
              aria-label="Notifications"
            >
              <Bell size={22} className="text-white" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-2">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-[#333] flex items-center justify-between">
                  <strong>Notifications</strong>
                  <button className="text-xs text-[#B3B3B3] hover:underline" onClick={() => navigate("/notifications")}>
                    View all
                  </button>
                </div>
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <p className="p-3 text-sm text-[#B3B3B3]">No new requests</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n._id} className="p-3 border-b border-[#333]">
                        <p className="text-sm mb-2">{n.message}</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleAcceptRequest(n._id)} className="px-3 py-1 bg-green-500 text-white rounded text-xs">Accept</button>
                          <button onClick={() => handleRejectRequest(n._id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs">Reject</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex justify-center items-start py-12 px-4 flex-1">
        <div className="w-full max-w-5xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1 rounded-lg" style={{ backgroundColor: '#1A1A1A' }}>
            <button
              className={`flex-1 px-6 py-3 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === "catalogue" ? "bg-[#A259FF] text-white" : "text-[#B3B3B3] hover:text-white hover:bg-[#2A2A2A]"}`}
              onClick={() => setActiveTab("catalogue")}
            >
              <User size={18} /> Developers
            </button>
            <button
              className={`flex-1 px-6 py-3 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === "friends" ? "bg-[#A259FF] text-white" : "text-[#B3B3B3] hover:text-white hover:bg-[#2A2A2A]"}`}
              onClick={() => { setActiveTab("friends"); fetchFriends(); }}
            >
              <UserCheck size={18} /> Your Network ({friends.length})
            </button>
          </div>

          {/* Developers Tab */}
          {activeTab === "catalogue" && (
            <div>
              {/* Search + Skill filters */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 p-6 rounded-xl" style={{ backgroundColor: '#1A1A1A' }}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#B3B3B3]">Search by Username</label>
                  <input type="text" placeholder="Enter username..." value={searchUsername} onChange={(e) => setSearchUsername(e.target.value)} className="bg-[#0D0D0D] border border-[#333] text-white p-3 rounded-lg w-full placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#A259FF]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#B3B3B3]">Filter by Skill</label>
                  <select value={searchSkill} onChange={(e) => setSearchSkill(e.target.value)} className="bg-[#0D0D0D] border border-[#333] text-white p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#A259FF]">
                    <option value="">All Skills</option>
                    {csSkills.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
                  </select>
                </div>
              </div>

              {/* User cards */}
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="p-6 rounded-xl border border-[#333] hover:border-[#A259FF]" style={{ backgroundColor: '#1A1A1A' }}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-[#A259FF] flex items-center justify-center text-white font-semibold">{user.username?.charAt(0).toUpperCase()}</div>
                          <h3 className="text-xl font-semibold">{user.username}</h3>
                        </div>
                        <p className="text-[#B3B3B3] mb-3">{user.bio || "No bio provided."}</p>
                        <div className="flex flex-wrap gap-2">{user.skills?.map(s => <span key={s} className="px-3 py-1 text-xs font-medium rounded-full bg-[#0D0D0D] text-[#A259FF] border border-[#333]">{s}</span>)}</div>
                      </div>
                      <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A259FF] hover:bg-[#8B3EF2] text-white text-sm"
                        onClick={() => handleAddFriend(user._id)}
                      >
                        <UserPlus size={16} /> Add Friend
                      </button>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && <div className="text-center py-12"><User size={48} className="mx-auto mb-4 text-[#333]" /><p className="text-xl font-medium mb-2">No developers found</p></div>}
              </div>
            </div>
          )}

          {/* Friends Tab */}
          {activeTab === "friends" && (
            <div>
              {friends.length > 0 && <p className="mb-6 text-sm text-[#B3B3B3]">You have {friends.length} friend(s) in your network</p>}
              {friends.map((f) => {
                const user = typeof f === "string" ? usersData.find((u) => u.username === f || u._id === f) : f;
                return (
                  <div key={user?._id || user?.username} className="p-6 rounded-xl border border-[#333] hover:border-[#A259FF]" style={{ backgroundColor: '#1A1A1A' }}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-[#A259FF] flex items-center justify-center text-white font-semibold">{user?.username?.charAt(0).toUpperCase()}</div>
                          <h3 className="text-xl font-semibold">{user?.username}</h3>
                          <span className="px-2 py-1 text-xs rounded-full bg-[#0D0D0D] text-[#A259FF] border border-[#A259FF]">Friend</span>
                        </div>
                        <p className="text-[#B3B3B3] mb-3">{user?.bio}</p>
                        <div className="flex flex-wrap gap-2">{user?.skills?.map(s => <span key={s} className="px-3 py-1 text-xs rounded-full bg-[#0D0D0D] text-[#A259FF] border border-[#333]">{s}</span>)}</div>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-[#2A2A2A] text-[#B3B3B3]" onClick={() => handleRemoveFriend(user?._id)}>
                        <X size={16} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
              {friends.length === 0 && <div className="text-center py-16"><UserCheck size={64} className="mx-auto mb-6 text-[#333]" /><p className="text-2xl mb-3">No friends yet</p></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
