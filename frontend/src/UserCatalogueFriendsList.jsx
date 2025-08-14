// src/components/UserCatalogueFriendsList.jsx
import React, { useEffect, useState } from "react";
import { X, User, UserPlus, UserCheck, Bell, Sparkles, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const csSkills = [
  "React","JavaScript","HTML","CSS","Node.js","Python","Java","C++","C#",
  "TypeScript","Angular","Vue.js","PHP","Ruby","Go","Rust","Swift","Kotlin",
  "Solidity","Blockchain","Machine Learning","Data Science","DevOps","AWS","Docker"
];

// Dummy data with mixed old and new users
const dummyUsersData = [
  {
    _id: "user1",
    username: "alex_dev",
    bio: "Full-stack developer passionate about React and Node.js. Building the future of web applications.",
    skills: ["React", "Node.js", "JavaScript", "MongoDB"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago (NEW)
  },
  {
    _id: "user2", 
    username: "sarah_blockchain",
    bio: "Blockchain enthusiast and smart contract developer. Working on DeFi protocols and NFT marketplaces.",
    skills: ["Solidity", "Blockchain", "JavaScript", "Web3"],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago (OLD)
  },
  {
    _id: "user3",
    username: "mike_python",
    bio: "Data scientist and machine learning engineer. Love working with Python and AI technologies.",
    skills: ["Python", "Machine Learning", "Data Science", "TensorFlow"],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago (NEW)
  },
  {
    _id: "user4",
    username: "emma_frontend",
    bio: "Frontend developer specializing in modern React applications and user experience design.",
    skills: ["React", "TypeScript", "CSS", "JavaScript"],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago (OLD)
  },
  {
    _id: "user5",
    username: "david_devops",
    bio: "DevOps engineer with expertise in cloud infrastructure, Docker, and CI/CD pipelines.",
    skills: ["AWS", "Docker", "DevOps", "Kubernetes"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (NEW)
  },
  {
    _id: "user6",
    username: "lisa_mobile",
    bio: "Mobile app developer creating cross-platform applications with React Native and Flutter.",
    skills: ["React Native", "Flutter", "JavaScript", "Dart"],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago (OLD)
  },
  {
    _id: "user7",
    username: "james_backend",
    bio: "Backend architect focusing on scalable microservices and database optimization.",
    skills: ["Node.js", "Python", "MongoDB", "PostgreSQL"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (NEW)
  },
  {
    _id: "user8",
    username: "nina_designer",
    bio: "UI/UX designer who codes. Creating beautiful and functional web interfaces.",
    skills: ["HTML", "CSS", "JavaScript", "Figma"],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago (OLD)
  },
  {
    _id: "user9",
    username: "ryan_fullstack",
    bio: "Full-stack engineer with 5+ years experience. Love building end-to-end solutions.",
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago (NEW)
  },
  {
    _id: "user10",
    username: "sophia_ai",
    bio: "AI researcher and developer working on cutting-edge machine learning applications.",
    skills: ["Python", "Machine Learning", "TensorFlow", "PyTorch"],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago (OLD)
  },
  {
    _id: "user11",
    username: "carlos_security",
    bio: "Cybersecurity specialist focusing on web application security and penetration testing.",
    skills: ["Security", "Python", "JavaScript", "Linux"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago (NEW)
  },
  {
    _id: "user12",
    username: "anna_gamedev",
    bio: "Game developer creating immersive experiences with Unity and Unreal Engine.",
    skills: ["C#", "Unity", "C++", "Game Development"],
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago (OLD)
  }
];

// Dummy notifications data
const dummyNotifications = [
  {
    _id: "notif1",
    message: "sarah_blockchain wants to connect with you",
    senderId: "user2",
    type: "friend_request"
  },
  {
    _id: "notif2", 
    message: "david_devops sent you a friend request",
    senderId: "user5",
    type: "friend_request"
  },
  {
    _id: "notif3",
    message: "nina_designer would like to be friends",
    senderId: "user8",
    type: "friend_request"
  }
];

// Dummy friends data  
const dummyFriends = [
  {
    _id: "user4",
    username: "emma_frontend",
    bio: "Frontend developer specializing in modern React applications and user experience design.",
    skills: ["React", "TypeScript", "CSS", "JavaScript"],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "user6",
    username: "lisa_mobile", 
    bio: "Mobile app developer creating cross-platform applications with React Native and Flutter.",
    skills: ["React Native", "Flutter", "JavaScript", "Dart"],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export default function UserCatalogueFriendsList() {
  const [usersData, setUsersData] = useState(dummyUsersData);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchSkill, setSearchSkill] = useState("");
  const [activeTab, setActiveTab] = useState("catalogue");
  const [friends, setFriends] = useState(dummyFriends);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sentRequests, setSentRequests] = useState({}); // map: receiverId -> true
  const [showNewUsersOnly, setShowNewUsersOnly] = useState(false); // New filter state

  const navigate = useNavigate();
  const loggedInUserId = sessionStorage.getItem("userId") || "currentUser";
  const token = sessionStorage.getItem("token") || "dummy-token";
  const currentUserId = String(loggedInUserId || "").trim();

  /** Check if user is "new" (registered within last 7 days) */
  const isNewUser = (user) => {
    if (!user.createdAt) return false;
    const userCreatedDate = new Date(user.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return userCreatedDate > sevenDaysAgo;
  };

  /** Navigate to user profile - simplified to just go to /profile */
  const handleViewProfile = (userId, username) => {
    navigate('/profile');
  };

  /** Fetch all users except self - now uses dummy data */
  const fetchUsers = async () => {
    try {
      // Simulate API call with dummy data
      setTimeout(() => {
        const filtered = dummyUsersData.filter((u) => String(u._id).trim() !== currentUserId);
        setUsersData(filtered);
      }, 100);
    } catch (err) {
      console.error("fetchUsers:", err);
      setError("Could not load users.");
      setUsersData([]);
    }
  };

  /** Fetch pending requests RECEIVED - now uses dummy data */
  const fetchNotifications = async () => {
    try {
      // Simulate API call with dummy data
      setTimeout(() => {
        setNotifications(dummyNotifications);
      }, 100);
    } catch (err) {
      console.error("fetchNotifications:", err);
    }
  };

  /** Fetch accepted friends - now uses dummy data */
  const fetchFriends = async () => {
    try {
      // Simulate API call with dummy data
      setTimeout(() => {
        setFriends(dummyFriends);
      }, 100);
    } catch (err) {
      console.error("fetchFriends failed", err);
    }
  };

  /** Fetch SENT requests (pending) - now uses dummy data */
  const fetchSentRequests = async () => {
    try {
      // Simulate API call with dummy data  
      setTimeout(() => {
        const sentMap = {
          "user2": true, // Already sent request to sarah_blockchain
          "user10": true // Already sent request to sophia_ai
        };
        setSentRequests(sentMap);
      }, 100);
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

  /** Send friend request - now simulates the action */
  const handleAddFriend = async (receiverId) => {
    try {
      if (!currentUserId || !receiverId) {
        alert("Invalid sender or receiver ID.");
        return;
      }
      
      // Simulate API call
      setTimeout(() => {
        alert("Friend request sent!");
        setSentRequests((prev) => ({ ...prev, [receiverId]: true }));
      }, 200);
    } catch (error) {
      console.error("Send friend request error:", error);
      alert("Could not send friend request.");
    }
  };

  /** Update notification status - now simulates the action */
  const updateNotificationStatus = async (notificationId, status) => {
    try {
      // Simulate API call
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        if (status === "accepted") {
          const acceptedNotif = notifications.find(n => n._id === notificationId);
          if (acceptedNotif) {
            const newFriend = dummyUsersData.find(u => u._id === acceptedNotif.senderId);
            if (newFriend) {
              setFriends(prev => [...prev, newFriend]);
            }
          }
        }
      }, 200);
    } catch (err) {
      console.error("updateNotificationStatus:", err);
      alert("Could not update the request.");
    }
  };

  const handleAcceptRequest = (notificationId) =>
    updateNotificationStatus(notificationId, "accepted");
  const handleRejectRequest = (notificationId) =>
    updateNotificationStatus(notificationId, "rejected");

  /** Remove friend - now simulates the action */
  const handleRemoveFriend = async (friendId) => {
    try {
      if (!currentUserId || !friendId) return;
      
      // Simulate API call
      setTimeout(() => {
        setFriends((prev) => prev.filter((f) => String(f._id) !== String(friendId) && f !== friendId));
        alert("Friend removed successfully!");
      }, 200);
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
        
        // Apply "new users only" filter
        const matchesNewFilter = showNewUsersOnly ? isNewUser(user) : true;
        
        return matchesUsername && matchesSkill && matchesNewFilter;
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 p-6 rounded-xl" style={{ backgroundColor: '#1A1A1A' }}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#B3B3B3]">Search by Username</label>
                  <input 
                    type="text" 
                    placeholder="Enter username..." 
                    value={searchUsername} 
                    onChange={(e) => setSearchUsername(e.target.value)} 
                    className="bg-[#0D0D0D] border border-[#333] text-white p-3 rounded-lg w-full placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#A259FF]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#B3B3B3]">Filter by Skill</label>
                  <select 
                    value={searchSkill} 
                    onChange={(e) => setSearchSkill(e.target.value)} 
                    className="bg-[#0D0D0D] border border-[#333] text-white p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#A259FF]"
                  >
                    <option value="">All Skills</option>
                    {csSkills.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#B3B3B3]">Filter Options</label>
                  <div className="flex items-center space-x-3 p-3 bg-[#0D0D0D] border border-[#333] rounded-lg">
                    <input
                      type="checkbox"
                      id="newUsersOnly"
                      checked={showNewUsersOnly}
                      onChange={(e) => setShowNewUsersOnly(e.target.checked)}
                      className="w-4 h-4 text-[#A259FF] bg-[#0D0D0D] border-[#333] rounded focus:ring-[#A259FF] focus:ring-2"
                    />
                    <label htmlFor="newUsersOnly" className="text-sm text-[#B3B3B3] flex items-center gap-2">
                      <Sparkles size={16} className="text-[#A259FF]" />
                      Show only new users
                    </label>
                  </div>
                </div>
              </div>

              {/* User cards */}
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="p-6 rounded-xl border border-[#333] hover:border-[#A259FF] transition-colors duration-200" style={{ backgroundColor: '#1A1A1A' }}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-[#A259FF] flex items-center justify-center text-white font-semibold">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 
                              className="text-xl font-semibold cursor-pointer hover:text-[#A259FF] transition-colors duration-200 flex items-center gap-2"
                              onClick={() => handleViewProfile(user._id, user.username)}
                            >
                              {user.username}
                              <ExternalLink size={16} className="text-[#B3B3B3] hover:text-[#A259FF]" />
                            </h3>
                            {isNewUser(user) && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[#A259FF] to-[#7C3AED] text-white animate-pulse">
                                <Sparkles size={12} />
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[#B3B3B3] mb-3">{user.bio || "No bio provided."}</p>
                        <div className="flex flex-wrap gap-2">
                          {user.skills?.map(s => (
                            <span key={s} className="px-3 py-1 text-xs font-medium rounded-full bg-[#0D0D0D] text-[#A259FF] border border-[#333]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border border-[#333] hover:border-[#A259FF] text-[#B3B3B3] hover:text-white text-sm transition-colors duration-200"
                          onClick={() => handleViewProfile(user._id, user.username)}
                        >
                          <User size={16} /> View Profile
                        </button>
                        <button
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A259FF] hover:bg-[#8B3EF2] text-white text-sm transition-colors duration-200"
                          onClick={() => handleAddFriend(user._id)}
                        >
                          <UserPlus size={16} /> Add Friend
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <User size={48} className="mx-auto mb-4 text-[#333]" />
                    <p className="text-xl font-medium mb-2">No developers found</p>
                    {showNewUsersOnly && (
                      <p className="text-sm text-[#B3B3B3]">Try unchecking "Show only new users" to see more results</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Friends Tab */}
          {activeTab === "friends" && (
            <div>
              {friends.length > 0 && (
                <p className="mb-6 text-sm text-[#B3B3B3]">You have {friends.length} friend(s) in your network</p>
              )}
              <div className="space-y-4">
                {friends.map((f) => {
                  const user = typeof f === "string" ? usersData.find((u) => u.username === f || u._id === f) : f;
                  return (
                    <div key={user?._id || user?.username} className="p-6 rounded-xl border border-[#333] hover:border-[#A259FF] transition-colors duration-200" style={{ backgroundColor: '#1A1A1A' }}>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-[#A259FF] flex items-center justify-center text-white font-semibold">
                              {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <h3 
                              className="text-xl font-semibold cursor-pointer hover:text-[#A259FF] transition-colors duration-200 flex items-center gap-2"
                              onClick={() => handleViewProfile(user?._id, user?.username)}
                            >
                              {user?.username}
                              <ExternalLink size={16} className="text-[#B3B3B3] hover:text-[#A259FF]" />
                            </h3>
                            <span className="px-2 py-1 text-xs rounded-full bg-[#0D0D0D] text-[#A259FF] border border-[#A259FF]">
                              Friend
                            </span>
                          </div>
                          <p className="text-[#B3B3B3] mb-3">{user?.bio}</p>
                          <div className="flex flex-wrap gap-2">
                            {user?.skills?.map(s => (
                              <span key={s} className="px-3 py-1 text-xs rounded-full bg-[#0D0D0D] text-[#A259FF] border border-[#333]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border border-[#333] hover:border-[#A259FF] text-[#B3B3B3] hover:text-white text-sm transition-colors duration-200"
                            onClick={() => handleViewProfile(user?._id, user?.username)}
                          >
                            <User size={16} /> View Profile
                          </button>
                          <button 
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-[#2A2A2A] text-[#B3B3B3] hover:text-white text-sm transition-colors duration-200" 
                            onClick={() => handleRemoveFriend(user?._id)}
                          >
                            <X size={16} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {friends.length === 0 && (
                <div className="text-center py-16">
                  <UserCheck size={64} className="mx-auto mb-6 text-[#333]" />
                  <p className="text-2xl mb-3">No friends yet</p>
                  <p className="text-[#B3B3B3]">Start connecting with other developers to build your network!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
