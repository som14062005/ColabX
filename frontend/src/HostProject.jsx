import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HostProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    tags: '',
    techStack: '',
    difficulty: '',
    duration: '',
    roles: '',
    members: [],
    repoInitialized: false
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState([
    'john_doe',
    'jane_smith',
    'ravi_dev',
    'meena_ui',
    'rahul_fullstack'
  ]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAddMember = (member) => {
    if (!formData.members.includes(member)) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, member]
      }));
    }
    setSearchTerm('');
  };

  const handleInitRepo = () => {
    // Fake GitHub repo init
    alert("GitHub repository initialized for your project.");
    setFormData(prev => ({ ...prev, repoInitialized: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Project Data Submitted:", formData);
    alert("Project hosted successfully!");
    navigate('/dashboard');
  };

  const filteredUsers = availableUsers.filter(user =>
    user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-100">
          Host a <span className="text-purple-400 font-extrabold tracking-wide">Project</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Project Name *</label>
            <input
              type="text"
              required
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="Awesome Open Source Tool"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Description *</label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly explain the project goals and details..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Tags / Skills Required</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="React, Node.js, UI/UX"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Technology Stack</label>
            <input
              type="text"
              name="techStack"
              value={formData.techStack}
              onChange={handleChange}
              placeholder="MERN, Flutter, Firebase, etc."
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Difficulty and Duration */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm text-gray-300 mb-1">Difficulty Level</label>
              <input
                type="text"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                placeholder="Easy / Medium / Hard"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm text-gray-300 mb-1">Expected Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 2 weeks, 1 month"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Roles */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Roles Needed / Looking For</label>
            <input
              type="text"
              name="roles"
              value={formData.roles}
              onChange={handleChange}
              placeholder="Frontend Dev, Backend Dev, Designer"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Repository Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleInitRepo}
              className={`px-5 py-2 rounded-lg font-medium ${
                formData.repoInitialized
                  ? 'bg-green-600 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
              disabled={formData.repoInitialized}
            >
              {formData.repoInitialized ? 'Repository Initialized' : 'Initialize GitHub Repository'}
            </button>
          </div>

          {/* Member Search */}
          <div>
            <label className="block text-sm text-gray-300 mb-1 mt-4">Add Members</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username"
              className="w-full px-4 py-2 mb-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchTerm &&
              filteredUsers.map((user, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAddMember(user)}
                  className="cursor-pointer p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition"
                >
                  {user}
                </div>
              ))}
            <div className="text-sm text-gray-300 mt-2">
              <strong>Selected Members:</strong> {formData.members.join(', ') || 'None'}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 transition-all text-white py-2 rounded-lg font-semibold"
          >
            Host Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default HostProject;
