import React, { useState } from "react";
import { X, User, UserPlus, UserCheck } from "lucide-react";

const usersData = [
  { 
    username: "alice", 
    skills: ["React", "HTML", "Blockchain"],
    description: "Full-stack developer passionate about blockchain technology and modern web development"
  },
  { 
    username: "bob", 
    skills: ["CSS", "Node.js"],
    description: "Frontend specialist with expertise in responsive design and server-side JavaScript"
  },
  { 
    username: "charlie", 
    skills: ["React", "Solidity"],
    description: "Blockchain developer focused on decentralized applications and smart contracts"
  },
  { 
    username: "david", 
    skills: ["JavaScript", "HTML"],
    description: "Web developer with strong foundation in vanilla JavaScript and semantic HTML"
  },
];

const csSkills = [
  "React", "JavaScript", "HTML", "CSS", "Node.js", "Python", "Java", 
  "C++", "C#", "TypeScript", "Angular", "Vue.js", "PHP", "Ruby", 
  "Go", "Rust", "Swift", "Kotlin", "Solidity", "Blockchain", 
  "Machine Learning", "Data Science", "DevOps", "AWS", "Docker"
];

export default function UserCatalogueFriendsList() {
  const [searchUsername, setSearchUsername] = useState("");
  const [searchSkill, setSearchSkill] = useState("");
  const [activeTab, setActiveTab] = useState("catalogue");
  const [friends, setFriends] = useState([]);

  const handleAddFriend = (username) => {
    if (!friends.includes(username)) {
      setFriends([...friends, username]);
    }
  };

  const handleRemoveFriend = (username) => {
    setFriends(friends.filter(friend => friend !== username));
  };

  const filteredUsers = usersData.filter((user) => {
    const matchesUsername = user.username.toLowerCase().includes(searchUsername.toLowerCase());
    const matchesSkill = searchSkill
      ? user.skills.some((skill) => skill.toLowerCase().includes(searchSkill.toLowerCase()))
      : true;
    return matchesUsername && matchesSkill;
  });

  return (
    <div className="min-h-screen w-full flex justify-center items-start py-12 px-4" style={{ backgroundColor: '#0D0D0D', color: '#FFFFFF' }}>
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Developer Network</h1>
          <p className="text-lg" style={{ color: '#B3B3B3' }}>Connect with talented developers and expand your professional network</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 p-1 rounded-lg" style={{ backgroundColor: '#1A1A1A' }}>
          <button
            className={`flex-1 px-6 py-3 rounded-md font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "catalogue" 
                ? "bg-[#A259FF] text-white shadow-lg" 
                : "text-[#B3B3B3] hover:text-white hover:bg-[#2A2A2A]"
            }`}
            onClick={() => setActiveTab("catalogue")}
          >
            <User size={18} />
            Developers
          </button>
          <button
            className={`flex-1 px-6 py-3 rounded-md font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "friends" 
                ? "bg-[#A259FF] text-white shadow-lg" 
                : "text-[#B3B3B3] hover:text-white hover:bg-[#2A2A2A]"
            }`}
            onClick={() => setActiveTab("friends")}
          >
            <UserCheck size={18} />
            Your Network ({friends.length})
          </button>
        </div>

        {activeTab === "catalogue" && (
          <div>
            {/* Search Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 p-6 rounded-xl" style={{ backgroundColor: '#1A1A1A' }}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#B3B3B3]">Search by Username</label>
                <input
                  type="text"
                  placeholder="Enter username..."
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  className="bg-[#0D0D0D] border border-[#333] text-white p-3 rounded-lg w-full placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#B3B3B3]">Filter by Skill</label>
                <select
                  value={searchSkill}
                  onChange={(e) => setSearchSkill(e.target.value)}
                  className="bg-[#0D0D0D] border border-[#333] text-white p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:border-transparent appearance-none cursor-pointer transition-all"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23B3B3B3' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25em 1.25em',
                    paddingRight: '2.75rem'
                  }}
                >
                  <option value="">All Skills</option>
                  {csSkills.map((skill) => (
                    <option key={skill} value={skill} className="bg-[#0D0D0D] text-white">
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm" style={{ color: '#B3B3B3' }}>
                Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'developer' : 'developers'}
              </p>
            </div>

            {/* User Cards */}
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div 
                  key={user.username} 
                  className="p-6 rounded-xl border border-[#333] transition-all duration-300 hover:border-[#A259FF] hover:shadow-lg group" 
                  style={{ backgroundColor: '#1A1A1A' }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-[#A259FF] flex items-center justify-center text-white font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-xl font-semibold">{user.username}</h3>
                      </div>
                      <p className="text-[#B3B3B3] mb-3 leading-relaxed">{user.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill) => (
                          <span 
                            key={skill}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-[#0D0D0D] text-[#A259FF] border border-[#333]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center shrink-0">
                      <button className="px-4 py-2 rounded-lg bg-[#333] hover:bg-[#444] text-white text-sm font-medium transition-all border border-[#444] hover:border-[#555] min-w-[100px]">
                        View Profile
                      </button>
                      {friends.includes(user.username) ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0D0D0D] border border-[#A259FF] min-w-[100px] justify-center">
                          <UserCheck size={16} className="text-[#A259FF]" />
                          <span className="text-sm font-medium text-[#A259FF]">Friend</span>
                        </div>
                      ) : (
                        <button
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A259FF] hover:bg-[#8B3EF2] text-white text-sm font-medium transition-all min-w-[100px] justify-center"
                          onClick={() => handleAddFriend(user.username)}
                        >
                          <UserPlus size={16} />
                          Add Friend
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <User size={48} className="mx-auto mb-4 text-[#333]" />
                  <p className="text-xl font-medium mb-2">No developers found</p>
                  <p className="text-[#B3B3B3]">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "friends" && (
          <div>
            {friends.length > 0 && (
              <div className="mb-6">
                <p className="text-sm" style={{ color: '#B3B3B3' }}>
                  You have {friends.length} {friends.length === 1 ? 'friend' : 'friends'} in your network
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              {friends.map((username) => {
                const user = usersData.find((u) => u.username === username);
                return (
                  <div 
                    key={username} 
                    className="p-6 rounded-xl border border-[#333] transition-all duration-300 hover:border-[#A259FF] hover:shadow-lg group" 
                    style={{ backgroundColor: '#1A1A1A' }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-[#A259FF] flex items-center justify-center text-white font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <h3 className="text-xl font-semibold">{user.username}</h3>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#0D0D0D] text-[#A259FF] border border-[#A259FF]">
                            Friend
                          </span>
                        </div>
                        <p className="text-[#B3B3B3] mb-3 leading-relaxed">{user.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {user.skills.map((skill) => (
                            <span 
                              key={skill}
                              className="px-3 py-1 text-xs font-medium rounded-full bg-[#0D0D0D] text-[#A259FF] border border-[#333]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center shrink-0">
                        <button className="px-4 py-2 rounded-lg bg-[#333] hover:bg-[#444] text-white text-sm font-medium transition-all border border-[#444] hover:border-[#555] min-w-[100px]">
                          View Profile
                        </button>
                        <button
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-[#2A2A2A] text-[#B3B3B3] hover:text-white text-sm font-medium transition-all border border-[#333] hover:border-[#555] min-w-[100px] justify-center"
                          onClick={() => handleRemoveFriend(user.username)}
                        >
                          <X size={16} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {friends.length === 0 && (
                <div className="text-center py-16">
                  <UserCheck size={64} className="mx-auto mb-6 text-[#333]" />
                  <p className="text-2xl font-semibold mb-3">No friends yet</p>
                  <p className="text-[#B3B3B3] mb-6 max-w-md mx-auto">
                    Start building your professional network by adding developers from the catalogue
                  </p>
                  <button
                    className="px-6 py-3 rounded-lg bg-[#A259FF] hover:bg-[#8B3EF2] text-white font-medium transition-all"
                    onClick={() => setActiveTab("catalogue")}
                  >
                    Browse Catalogue
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}