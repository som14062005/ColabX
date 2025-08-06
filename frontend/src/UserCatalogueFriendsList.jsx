import React, { useState } from "react";

const usersData = [
  { username: "alice", skills: ["React", "HTML", "Blockchain"] },
  { username: "bob", skills: ["CSS", "Node.js"] },
  { username: "charlie", skills: ["React", "Solidity"] },
  { username: "david", skills: ["JavaScript", "HTML"] },
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

  const filteredUsers = usersData.filter((user) => {
    const matchesUsername = user.username.toLowerCase().includes(searchUsername.toLowerCase());
    const matchesSkill = searchSkill
      ? user.skills.some((skill) => skill.toLowerCase().includes(searchSkill.toLowerCase()))
      : true;
    return matchesUsername && matchesSkill;
  });

  return (
    <div className="min-h-screen w-full flex justify-center items-start py-10 px-4" style={{ backgroundColor: '#0D0D0D', color: '#FFFFFF' }}>
      <div className="w-full max-w-4xl">
        <div className="flex gap-4 mb-6 border-b pb-2 border-[#1A1A1A]">
          <button
            className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ${
              activeTab === "catalogue" ? "bg-[#A259FF] text-white" : "bg-[#1A1A1A] text-[#B3B3B3] hover:bg-[#2A2A2A]"
            }`}
            onClick={() => setActiveTab("catalogue")}
          >
            User Catalogue
          </button>
          <button
            className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ${
              activeTab === "friends" ? "bg-[#A259FF] text-white" : "bg-[#1A1A1A] text-[#B3B3B3] hover:bg-[#2A2A2A]"
            }`}
            onClick={() => setActiveTab("friends")}
          >
            Friends List
          </button>
        </div>

        {activeTab === "catalogue" && (
          <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Search by username"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="bg-[#1A1A1A] border border-[#333] text-white p-3 rounded w-full placeholder-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#A259FF]"
              />
              <select
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                className="bg-[#1A1A1A] border border-[#333] text-white p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-[#A259FF] appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23B3B3B3' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="" style={{ color: '#B3B3B3' }}>Filter by CS skill</option>
                {csSkills.map((skill) => (
                  <option key={skill} value={skill} className="bg-[#1A1A1A] text-white">
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <div key={user.username} className="p-5 rounded-xl shadow flex justify-between items-center transition-all duration-300 hover:bg-[#2a2a2a]" style={{ backgroundColor: '#1A1A1A' }}>
                  <div>
                    <h3 className="text-xl font-semibold">{user.username}</h3>
                    <p className="text-sm mt-1" style={{ color: '#B3B3B3' }}>{user.skills.join(", ")}</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <button className="px-4 py-2 rounded bg-[#333] hover:bg-[#444] text-white text-sm transition-all">View Profile</button>
                    {friends.includes(user.username) ? (
                      <span className="text-sm font-medium text-[#A259FF]">Friend Added</span>
                    ) : (
                      <button
                        className="px-4 py-2 rounded bg-[#7C3AED] hover:bg-[#6B21A8] text-white text-sm transition-all"
                        onClick={() => handleAddFriend(user.username)}
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "friends" && (
          <div className="grid gap-4">
            {friends.map((username) => {
              const user = usersData.find((u) => u.username === username);
              return (
                <div key={username} className="p-5 rounded-xl shadow flex justify-between items-center hover:bg-[#2a2a2a]" style={{ backgroundColor: '#1A1A1A' }}>
                  <div>
                    <h3 className="text-xl font-semibold">{user.username}</h3>
                    <p className="text-sm mt-1" style={{ color: '#B3B3B3' }}>{user.skills.join(", ")}</p>
                  </div>
                  <div>
                    <button className="px-4 py-2 rounded bg-[#333] hover:bg-[#444] text-white text-sm transition-all">View Profile</button>
                  </div>
                </div>
              );
            })}
            {friends.length === 0 && <p className="text-center text-[#B3B3B3]">No friends added yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}