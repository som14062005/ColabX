import React, { useState } from 'react';
import { FaPlus, FaSearch, FaArrowLeft, FaComments, FaPaperPlane, FaChevronDown, FaChevronUp, FaHeart, FaShare, FaImage, FaTimes, FaFlag, FaExclamationTriangle, FaUserTimes, FaBell, FaCrown, FaUserShield } from 'react-icons/fa';
import { CgProfile } from "react-icons/cg";
import { useNavigate } from 'react-router-dom';


const CommunitiesPage = () => {
  const navigate = useNavigate();

  const [communities, setCommunities] = useState([
    {
      name: 'Blockchain Builders',
      description: 'Discuss, build, and launch Web3 projects.',
      rules: 'Be respectful. No spam. Keep it on-topic.',
      lead: 'alice', // Original creator
      admins: ['alice'], // Array of admins (includes original lead)
      members: ['alice', 'bob', 'charlie', 'pranaav'],
      reports: [],
      posts: [
        {
          user: 'alice',
          title: 'Building a DeFi Protocol',
          content: 'Just launched my first DeFi protocol on Ethereum testnet. Looking for feedback and potential collaborators!',
          images: [],
          comments: [
            { user: 'bob', text: 'This looks amazing! What consensus mechanism are you using?' },
            { user: 'charlie', text: 'Great work! I\'d love to contribute to the frontend.' }
          ]
        }
      ]
    },
    {
      name: 'React Developers',
      description: 'React tips, tricks and projects.',
      rules: 'No job posts. Be kind. Help others.',
      lead: 'david',
      admins: ['david'],
      members: ['david', 'eve', 'pranaav'],
      reports: [],
      posts: [
        {
          user: 'david',
          title: 'React 19 Features You Should Know',
          content: 'The new React 19 beta introduces some game-changing features. Here are my top 5 favorites...',
          images: [],
          comments: [
            { user: 'eve', text: 'The new compiler optimizations are incredible!' }
          ]
        }
      ]
    }
  ]);
  
  const [joinedCommunities, setJoinedCommunities] = useState([communities[0].name]);
  const [currentCommunity, setCurrentCommunity] = useState(communities[0]);
  const [view, setView] = useState('community');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState([]);
  const [newComment, setNewComment] = useState({});
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', rules: '' });
  const [pendingJoinCommunity, setPendingJoinCommunity] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [username] = useState('pranaav');
  
  // Report system states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingUser, setReportingUser] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [showReportsPanel, setShowReportsPanel] = useState(false);
  const [showKickConfirmModal, setShowKickConfirmModal] = useState(false);
  const [userToKick, setUserToKick] = useState(null);
  
  // Admin management states
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showDemoteModal, setShowDemoteModal] = useState(false);
  const [userToPromote, setUserToPromote] = useState(null);
  const [userToDemote, setUserToDemote] = useState(null);

  const toggleComments = (postIndex) => {
    setExpandedComments(prev => ({
      ...prev,
      [postIndex]: !prev[postIndex]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setNewPostImages(prev => [...prev, {
            file: file,
            url: event.target.result,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    const updatedCommunities = communities.map(c => {
      if (c.name === currentCommunity.name) {
        return {
          ...c,
          posts: [...c.posts, { 
            user: username, 
            title: newPostTitle, 
            content: newPostContent, 
            images: newPostImages.map(img => img.url),
            comments: [] 
          }]
        };
      }
      return c;
    });
    setCommunities(updatedCommunities);
    setCurrentCommunity(updatedCommunities.find(c => c.name === currentCommunity.name));
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostImages([]);
    setShowPostModal(false);
  };

  const handleComment = (postIndex) => {
    if (!newComment[postIndex]?.trim()) return;
    const updatedCommunities = communities.map(c => {
      if (c.name === currentCommunity.name) {
        const updatedPosts = [...c.posts];
        updatedPosts[postIndex].comments.push({ user: username, text: newComment[postIndex] });
        return {
          ...c,
          posts: updatedPosts
        };
      }
      return c;
    });
    setCommunities(updatedCommunities);
    setCurrentCommunity(updatedCommunities.find(c => c.name === currentCommunity.name));
    setNewComment({ ...newComment, [postIndex]: '' });
  };

  const handleJoin = (community) => {
    setPendingJoinCommunity(community);
  };

  const confirmJoin = (accepted) => {
    if (accepted && pendingJoinCommunity) {
      setJoinedCommunities([...joinedCommunities, pendingJoinCommunity.name]);
      const updatedCommunities = communities.map(c => {
        if (c.name === pendingJoinCommunity.name) {
          return {
            ...c,
            members: [...c.members, username]
          };
        }
        return c;
      });
      setCommunities(updatedCommunities);
    }
    setPendingJoinCommunity(null);
  };

  const handleCreateCommunity = () => {
    if (!newCommunity.name || !newCommunity.description || !newCommunity.rules) return;
    const newComm = { 
      ...newCommunity, 
      posts: [], 
      lead: username, // Creator becomes the lead
      admins: [username], // Creator is the first admin
      members: [username],
      reports: []
    };
    setCommunities([...communities, newComm]);
    setJoinedCommunities([...joinedCommunities, newCommunity.name]);
    setNewCommunity({ name: '', description: '', rules: '' });
    setView('community');
    setCurrentCommunity(newComm);
  };

  // Report user functionality
  const handleReportUser = (reportedUser) => {
    if (reportedUser === username) return;
    setReportingUser(reportedUser);
    setShowReportModal(true);
  };

  const submitReport = () => {
    if (!reportReason.trim() || !reportingUser) return;
    
    const updatedCommunities = communities.map(c => {
      if (c.name === currentCommunity.name) {
        const existingReport = c.reports.find(r => r.reportedUser === reportingUser && r.reportedBy === username);
        if (existingReport) {
          return {
            ...c,
            reports: c.reports.map(r => 
              r.reportedUser === reportingUser && r.reportedBy === username 
                ? { ...r, reason: reportReason, timestamp: new Date().toISOString() }
                : r
            )
          };
        } else {
          return {
            ...c,
            reports: [...c.reports, {
              reportedUser: reportingUser,
              reportedBy: username,
              reason: reportReason,
              timestamp: new Date().toISOString(),
              status: 'pending'
            }]
          };
        }
      }
      return c;
    });
    
    setCommunities(updatedCommunities);
    setCurrentCommunity(updatedCommunities.find(c => c.name === currentCommunity.name));
    setShowReportModal(false);
    setReportingUser(null);
    setReportReason('');
  };

  // Kick user functionality (only for admins)
  const handleKickUser = (userToKickOut) => {
    setUserToKick(userToKickOut);
    setShowKickConfirmModal(true);
  };

  const confirmKickUser = () => {
    if (!userToKick) return;
    
    const updatedCommunities = communities.map(c => {
      if (c.name === currentCommunity.name) {
        return {
          ...c,
          members: c.members.filter(member => member !== userToKick),
          admins: c.admins.filter(admin => admin !== userToKick), // Remove from admins too if they were admin
          reports: c.reports.filter(r => r.reportedUser !== userToKick)
        };
      }
      return c;
    });
    
    setCommunities(updatedCommunities);
    setCurrentCommunity(updatedCommunities.find(c => c.name === currentCommunity.name));
    
    if (userToKick === username) {
      setJoinedCommunities(joinedCommunities.filter(name => name !== currentCommunity.name));
      const remainingCommunities = joinedCommunities.filter(name => name !== currentCommunity.name);
      if (remainingCommunities.length > 0) {
        const nextCommunity = communities.find(c => c.name === remainingCommunities[0]);
        setCurrentCommunity(nextCommunity);
      } else {
        setView('search');
      }
    }
    
    setShowKickConfirmModal(false);
    setUserToKick(null);
  };

  // Admin management functions
  const handlePromoteToAdmin = (userToPromoteToAdmin) => {
    setUserToPromote(userToPromoteToAdmin);
    setShowPromoteModal(true);
  };

  const confirmPromoteToAdmin = () => {
    if (!userToPromote) return;
    
    const updatedCommunities = communities.map(c => {
      if (c.name === currentCommunity.name) {
        return {
          ...c,
          admins: [...c.admins, userToPromote]
        };
      }
      return c;
    });
    
    setCommunities(updatedCommunities);
    setCurrentCommunity(updatedCommunities.find(c => c.name === currentCommunity.name));
    setShowPromoteModal(false);
    setUserToPromote(null);
  };

  const handleDemoteFromAdmin = (userToDemoteFromAdmin) => {
    if (userToDemoteFromAdmin === currentCommunity.lead) {
      alert("Cannot demote the original community creator!");
      return;
    }
    setUserToDemote(userToDemoteFromAdmin);
    setShowDemoteModal(true);
  };

  const confirmDemoteFromAdmin = () => {
    if (!userToDemote) return;
    
    const updatedCommunities = communities.map(c => {
      if (c.name === currentCommunity.name) {
        return {
          ...c,
          admins: c.admins.filter(admin => admin !== userToDemote)
        };
      }
      return c;
    });
    
    setCommunities(updatedCommunities);
    setCurrentCommunity(updatedCommunities.find(c => c.name === currentCommunity.name));
    setShowDemoteModal(false);
    setUserToDemote(null);
  };

  // Check if current user is admin
  const isCurrentUserAdmin = () => {
    return currentCommunity && currentCommunity.admins.includes(username);
  };

  // Check if current user is original creator
  const isCurrentUserOriginalCreator = () => {
    return currentCommunity && currentCommunity.lead === username;
  };

  // Get pending reports count
  const getPendingReportsCount = () => {
    return currentCommunity ? currentCommunity.reports.filter(r => r.status === 'pending').length : 0;
  };

  // Get unique reported users with report counts
  const getReportedUsers = () => {
    if (!currentCommunity) return [];
    
    const userReports = {};
    currentCommunity.reports.forEach(report => {
      if (!userReports[report.reportedUser]) {
        userReports[report.reportedUser] = [];
      }
      userReports[report.reportedUser].push(report);
    });
    
    return Object.entries(userReports).map(([user, reports]) => ({
      user,
      reports,
      count: reports.length
    }));
  };

  // Get regular members (non-admins)
  const getRegularMembers = () => {
    if (!currentCommunity) return [];
    return currentCommunity.members.filter(member => 
      !currentCommunity.admins.includes(member)
    );
  };

  // Get admin members (excluding current user if they want to see who else is admin)
  const getAdminMembers = () => {
    if (!currentCommunity) return [];
    return currentCommunity.admins;
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !joinedCommunities.includes(c.name)
  );

  const handleSwitchView = (newView) => {
    setView(newView);
    setPendingJoinCommunity(null);
    setShowReportsPanel(false);
    setShowAdminPanel(false);
  };

  return (
    <div className="flex h-screen bg-[#0D0D0D] text-white relative">
      {/* Sidebar */}
      <div className="w-20 bg-[#1A1A1A] flex flex-col items-center p-4 space-y-6 border-r border-[#333]">
        <button
  onClick={() => navigate('/profile')}
  className="text-2xl font-bold text-[#A259FF] mb-4 hover:text-white transition-colors"
  title="View Profile"
>
  <CgProfile />
</button>
        {joinedCommunities.map(name => (
          <button
            key={name}
            onClick={() => {
              setCurrentCommunity(communities.find(c => c.name === name));
              setView('community');
              setShowReportsPanel(false);
              setShowAdminPanel(false);
            }}
            className={`w-12 h-12 rounded-lg text-lg font-bold transition-all duration-200 flex items-center justify-center ${
              currentCommunity.name === name 
                ? 'bg-[#A259FF] text-white shadow-lg' 
                : 'bg-[#2A2A2A] text-[#B3B3B3] hover:bg-[#333] hover:text-white'
            }`}
          >
            {name[0].toUpperCase()}
          </button>
        ))}
        <div className="w-full h-px bg-[#333] my-4"></div>
        <button 
          onClick={() => handleSwitchView('search')} 
          className={`w-12 h-12 rounded-lg transition-all duration-200 flex items-center justify-center ${
            view === 'search' 
              ? 'bg-[#A259FF] text-white' 
              : 'bg-[#2A2A2A] text-[#B3B3B3] hover:bg-[#333] hover:text-white'
          }`}
        >
          <FaSearch />
        </button>
        <button 
          onClick={() => handleSwitchView('create')} 
          className={`w-12 h-12 rounded-lg transition-all duration-200 flex items-center justify-center ${
            view === 'create' 
              ? 'bg-[#A259FF] text-white' 
              : 'bg-[#2A2A2A] text-[#B3B3B3] hover:bg-[#333] hover:text-white'
          }`}
        >
          <FaPlus />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {view === 'community' && (
          <div className="p-6">
            {/* Community Header */}
            <div className="mb-8 pb-6 border-b border-[#333]">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{currentCommunity.name}</h2>
                  <p className="text-[#B3B3B3] text-lg">{currentCommunity.description}</p>
                  <div className="flex items-center mt-4 space-x-4 text-sm text-[#B3B3B3]">
                    <span>{currentCommunity.posts.length} posts</span>
                    <span>•</span>
                    <span>{currentCommunity.members.length} members</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <FaCrown className="text-[#FFD700]" />
                      <span>Creator: {currentCommunity.lead}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <FaUserShield className="text-[#A259FF]" />
                      <span>{currentCommunity.admins.length} admin(s)</span>
                    </span>
                  </div>
                </div>
                
                {/* Admin Actions */}
                {isCurrentUserAdmin() && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowReportsPanel(!showReportsPanel)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 relative ${
                        showReportsPanel 
                          ? 'bg-[#EF4444] text-white' 
                          : 'bg-[#2A2A2A] text-[#B3B3B3] hover:bg-[#333] hover:text-white'
                      }`}
                    >
                      <FaBell />
                      <span>Reports</span>
                      {getPendingReportsCount() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#EF4444] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {getPendingReportsCount()}
                        </span>
                      )}
                    </button>
                    
                    {/* Admin Management Button (Only for original creator) */}
                    {isCurrentUserOriginalCreator() && (
                      <button
                        onClick={() => setShowAdminPanel(!showAdminPanel)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                          showAdminPanel 
                            ? 'bg-[#A259FF] text-white' 
                            : 'bg-[#2A2A2A] text-[#B3B3B3] hover:bg-[#333] hover:text-white'
                        }`}
                      >
                        <FaUserShield />
                        <span>Manage Admins</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Admin Management Panel (Only visible to original creator) */}
            {showAdminPanel && isCurrentUserOriginalCreator() && (
              <div className="mb-6 bg-[#1A1A1A] border border-[#333] rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <FaUserShield className="text-[#A259FF]" />
                  <span>Admin Management</span>
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Current Admins */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-[#A259FF]">Current Admins ({currentCommunity.admins.length})</h4>
                    {getAdminMembers().length === 0 ? (
                      <p className="text-[#B3B3B3]">No admins assigned yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {getAdminMembers().map(admin => (
                          <div key={admin} className="flex items-center justify-between bg-[#0D0D0D] border border-[#333] rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-[#A259FF] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {admin[0].toUpperCase()}
                              </div>
                              <div>
                                <span className="font-medium">{admin}</span>
                                {admin === currentCommunity.lead && (
                                  <span className="ml-2 bg-[#FFD700] text-black text-xs px-2 py-1 rounded-full">Creator</span>
                                )}
                                {admin === username && (
                                  <span className="ml-2 bg-[#10b981] text-white text-xs px-2 py-1 rounded-full">You</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Only show demote button for non-creators */}
                            {admin !== currentCommunity.lead && (
                              <button
                                onClick={() => handleDemoteFromAdmin(admin)}
                                className="bg-[#EF4444] hover:bg-[#DC2626] px-3 py-1 rounded text-sm transition-colors duration-200"
                              >
                                Demote
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Regular Members */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-[#10b981]">Members ({getRegularMembers().length})</h4>
                    {getRegularMembers().length === 0 ? (
                      <p className="text-[#B3B3B3]">All members are admins.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {getRegularMembers().map(member => (
                          <div key={member} className="flex items-center justify-between bg-[#0D0D0D] border border-[#333] rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-[#10b981] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {member[0].toUpperCase()}
                              </div>
                              <span className="font-medium">{member}</span>
                              {member === username && (
                                <span className="ml-2 bg-[#10b981] text-white text-xs px-2 py-1 rounded-full">You</span>
                              )}
                            </div>
                            
                            <button
                              onClick={() => handlePromoteToAdmin(member)}
                              className="bg-[#A259FF] hover:bg-[#8B46FF] px-3 py-1 rounded text-sm transition-colors duration-200"
                            >
                              Promote to Admin
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reports Panel (Only visible to admins) */}
            {showReportsPanel && isCurrentUserAdmin() && (
              <div className="mb-6 bg-[#1A1A1A] border border-[#333] rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <FaExclamationTriangle className="text-[#EF4444]" />
                  <span>Reported Users</span>
                </h3>
                
                {getReportedUsers().length === 0 ? (
                  <p className="text-[#B3B3B3]">No reports at this time.</p>
                ) : (
                  <div className="space-y-4">
                    {getReportedUsers().map(({ user, reports, count }) => (
                      <div key={user} className="bg-[#0D0D0D] border border-[#333] rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-[#EF4444]">{user}</h4>
                            <p className="text-sm text-[#B3B3B3]">{count} report(s)</p>
                          </div>
                          <button
                            onClick={() => handleKickUser(user)}
                            className="flex items-center space-x-2 bg-[#EF4444] hover:bg-[#DC2626] px-3 py-1 rounded-lg text-sm transition-colors duration-200"
                          >
                            <FaUserTimes />
                            <span>Kick User</span>
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {reports.map((report, index) => (
                            <div key={index} className="bg-[#1A1A1A] border border-[#333] rounded p-3">
                              <div className="text-sm text-[#B3B3B3] mb-1">
                                Reported by: <span className="text-[#A259FF]">{report.reportedBy}</span>
                              </div>
                              <div className="text-sm">{report.reason}</div>
                              <div className="text-xs text-[#666] mt-1">
                                {new Date(report.timestamp).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Posts */}
            <div className="space-y-6">
              {currentCommunity.posts.map((post, i) => (
                <div key={i} className="bg-[#1A1A1A] rounded-xl border border-[#333] overflow-hidden hover:border-[#444] transition-colors duration-200">
                  {/* Post Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#A259FF] rounded-full flex items-center justify-center text-white font-bold">
                          {post.user[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{post.user}</span>
                            {post.user === currentCommunity.lead && (
                              <span className="bg-[#FFD700] text-black text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                                <FaCrown size={10} />
                                <span>Creator</span>
                              </span>
                            )}
                            {currentCommunity.admins.includes(post.user) && post.user !== currentCommunity.lead && (
                              <span className="bg-[#A259FF] text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                                <FaUserShield size={10} />
                                <span>Admin</span>
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-[#B3B3B3]">2 hours ago</div>
                        </div>
                      </div>
                      
                      {/* Report Button (Only for regular members, not for admins or yourself) */}
                      {post.user !== username && !isCurrentUserAdmin() && !currentCommunity.admins.includes(post.user) && (
                        <button
                          onClick={() => handleReportUser(post.user)}
                          className="flex items-center space-x-1 text-[#B3B3B3] hover:text-[#EF4444] transition-colors duration-200 text-sm"
                        >
                          <FaFlag />
                          <span>Report</span>
                        </button>
                      )}
                    </div>
                    <h3 className="font-bold text-xl mb-3">{post.title}</h3>
                    <p className="text-[#E0E0E0] leading-relaxed">{post.content}</p>
                    
                    {/* Post Images */}
                    {post.images && post.images.length > 0 && (
                      <div className="mt-4">
                        <div className={`grid gap-2 max-w-md ${
                          post.images.length === 1 
                            ? 'grid-cols-1' 
                            : 'grid-cols-2'
                        }`}>
                          {post.images.slice(0, 4).map((imageUrl, imgIndex) => (
                            <div key={imgIndex} className="relative group">
                              <img 
                                src={imageUrl} 
                                alt={`Post image ${imgIndex + 1}`}
                                className="w-full object-contain rounded-md border border-[#333] hover:border-[#444] transition-colors duration-200 cursor-pointer bg-[#0D0D0D]"
                                style={{ maxHeight: '400px', height: 'auto' }}
                              />
                              {imgIndex === 3 && post.images.length > 4 && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-md">
                                  <span className="text-white font-semibold">+{post.images.length - 4}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="px-6 pb-4">
                    <div className="flex items-center space-x-6 text-[#B3B3B3]">
                      <button className="flex items-center space-x-2 hover:text-[#A259FF] transition-colors duration-200">
                        <FaHeart className="text-sm" />
                        <span className="text-sm">Like</span>
                      </button>
                      <button 
                        onClick={() => toggleComments(i)}
                        className="flex items-center space-x-2 hover:text-[#A259FF] transition-colors duration-200"
                      >
                        <FaComments className="text-sm" />
                        <span className="text-sm">{post.comments.length} Comments</span>
                        {expandedComments[i] ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                      </button>
                      <button className="flex items-center space-x-2 hover:text-[#A259FF] transition-colors duration-200">
                        <FaShare className="text-sm" />
                        <span className="text-sm">Share</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {expandedComments[i] && (
                    <div className="border-t border-[#333] bg-[#0F0F0F]">
                      <div className="p-6 space-y-4">
                        {/* Existing Comments */}
                        {post.comments.map((comment, ci) => (
                          <div key={ci} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-[#7C3AED] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {comment.user[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#333]">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-[#A259FF] text-sm">{comment.user}</span>
                                    {comment.user === currentCommunity.lead && (
                                      <span className="bg-[#FFD700] text-black text-xs px-1 py-0.5 rounded flex items-center space-x-1">
                                        <FaCrown size={8} />
                                        <span>Creator</span>
                                      </span>
                                    )}
                                    {currentCommunity.admins.includes(comment.user) && comment.user !== currentCommunity.lead && (
                                      <span className="bg-[#A259FF] text-white text-xs px-1 py-0.5 rounded flex items-center space-x-1">
                                        <FaUserShield size={8} />
                                        <span>Admin</span>
                                      </span>
                                    )}
                                  </div>
                                  {/* Report Comment User */}
                                  {comment.user !== username && !isCurrentUserAdmin() && !currentCommunity.admins.includes(comment.user) && (
                                    <button
                                      onClick={() => handleReportUser(comment.user)}
                                      className="text-[#B3B3B3] hover:text-[#EF4444] transition-colors duration-200"
                                    >
                                      <FaFlag className="text-xs" />
                                    </button>
                                  )}
                                </div>
                                <div className="text-[#E0E0E0]">{comment.text}</div>
                              </div>
                              <div className="text-xs text-[#B3B3B3] mt-1 ml-3">Just now</div>
                            </div>
                          </div>
                        ))}

                        {/* Add Comment */}
                        <div className="flex items-start space-x-3 mt-4 pt-4 border-t border-[#333]">
                          <div className="w-8 h-8 bg-[#A259FF] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {username[0].toUpperCase()}
                          </div>
                          <div className="flex-1 flex items-end space-x-2">
                            <input
                              value={newComment[i] || ''}
                              onChange={e => setNewComment({ ...newComment, [i]: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && handleComment(i)}
                              placeholder="Write a comment..."
                              className="flex-1 p-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-white placeholder-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:border-transparent"
                            />
                            <button 
                              onClick={() => handleComment(i)} 
                              className="p-3 bg-[#A259FF] hover:bg-[#8B46FF] rounded-lg transition-colors duration-200 flex-shrink-0"
                              disabled={!newComment[i]?.trim()}
                            >
                              <FaPaperPlane className="text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {currentCommunity.posts.length === 0 && (
                <div className="text-center py-12 text-[#B3B3B3]">
                  <FaComments className="text-4xl mb-4 mx-auto opacity-50" />
                  <p className="text-lg">No posts yet in this community</p>
                  <p className="text-sm">Be the first to start a conversation!</p>
                </div>
              )}
            </div>

            {/* Floating Add Post Button */}
            <button 
              onClick={() => setShowPostModal(true)} 
              className="fixed bottom-6 right-6 bg-[#A259FF] hover:bg-[#8B46FF] rounded-full p-4 shadow-xl transition-all duration-200 hover:scale-110"
            >
              <FaPlus className="text-white text-xl" />
            </button>
          </div>
        )}

        {view === 'search' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Discover Communities</h2>
              <button 
                onClick={() => handleSwitchView('community')} 
                className="flex items-center space-x-2 text-[#A259FF] hover:text-[#8B46FF] transition-colors duration-200"
              >
                <FaArrowLeft />
                <span>Back</span>
              </button>
            </div>
            <div className="relative mb-6">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#B3B3B3]" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search communities..."
                className="w-full pl-12 pr-4 py-4 bg-[#1A1A1A] border border-[#333] rounded-xl text-white placeholder-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:border-transparent"
              />
            </div>
            <div className="space-y-4">
              {filteredCommunities.map((c, i) => (
                <div key={i} className="bg-[#1A1A1A] border border-[#333] p-6 rounded-xl hover:border-[#444] transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2">{c.name}</h3>
                      <p className="text-[#B3B3B3] mb-4">{c.description}</p>
                      <div className="text-sm text-[#B3B3B3] flex items-center space-x-4">
                        <span>{c.posts.length} posts</span>
                        <span>•</span>
                        <span>{c.members.length} members</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <FaCrown className="text-[#FFD700]" />
                          <span>Creator: {c.lead}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <FaUserShield className="text-[#A259FF]" />
                          <span>{c.admins.length} admin(s)</span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoin(c)}
                      className="bg-[#7C3AED] hover:bg-[#6B21A8] px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'create' && (
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Create New Community</h2>
                <button 
                  onClick={() => handleSwitchView('community')} 
                  className="flex items-center space-x-2 text-[#A259FF] hover:text-[#8B46FF] transition-colors duration-200"
                >
                  <FaArrowLeft />
                  <span>Back</span>
                </button>
              </div>
              <div className="bg-[#1A1A1A] border border-[#333] p-8 rounded-xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Community Name</label>
                    <input
                      value={newCommunity.name}
                      onChange={e => setNewCommunity({ ...newCommunity, name: e.target.value })}
                      placeholder="Enter community name"
                      className="w-full p-4 bg-[#0D0D0D] border border-[#333] rounded-lg text-white placeholder-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newCommunity.description}
                      onChange={e => setNewCommunity({ ...newCommunity, description: e.target.value })}
                      placeholder="Describe your community"
                      rows={4}
                      className="w-full p-4 bg-[#0D0D0D] border border-[#333] rounded-lg text-white placeholder-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:border-transparent resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Community Rules</label>
                    <textarea
                      value={newCommunity.rules}
                      onChange={e => setNewCommunity({ ...newCommunity, rules: e.target.value })}
                      placeholder="Set community guidelines"
                      rows={4}
                      className="w-full p-4 bg-[#0D0D0D] border border-[#333] rounded-lg text-white placeholder-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:border-transparent resize-none"
                    />
                  </div>
                  <div className="bg-[#0D0D0D] border border-[#333] rounded-lg p-4">
                    <p className="text-sm text-[#B3B3B3]">
                      <strong className="text-[#A259FF]">Note:</strong> As the community creator, you will become the original creator with full administrative privileges including the ability to assign other members as admins, review reports, and remove disruptive members.
                    </p>
                  </div>
                  <button 
                    onClick={handleCreateCommunity} 
                    className="w-full bg-[#A259FF] hover:bg-[#8B46FF] py-4 rounded-lg font-semibold transition-colors duration-200"
                    disabled={!newCommunity.name || !newCommunity.description || !newCommunity.rules}
                  >
                    Create Community
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Promote to Admin Modal */}
        {showPromoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] border border-[#333] p-8 rounded-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <FaUserShield className="text-[#A259FF]" />
                <span>Promote to Admin</span>
              </h3>
              <p className="text-[#B3B3B3] mb-6">
                Are you sure you want to promote <strong className="text-white">{userToPromote}</strong> to admin? They will have moderation privileges including the ability to review reports and kick users.
              </p>
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => {
                    setShowPromoteModal(false);
                    setUserToPromote(null);
                  }} 
                  className="px-6 py-2 text-[#B3B3B3] hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmPromoteToAdmin} 
                  className="bg-[#A259FF] hover:bg-[#8B46FF] px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Promote to Admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Demote from Admin Modal */}
        {showDemoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] border border-[#333] p-8 rounded-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <FaUserTimes className="text-[#EF4444]" />
                <span>Demote from Admin</span>
              </h3>
              <p className="text-[#B3B3B3] mb-6">
                Are you sure you want to demote <strong className="text-white">{userToDemote}</strong> from admin? They will lose all moderation privileges.
              </p>
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => {
                    setShowDemoteModal(false);
                    setUserToDemote(null);
                  }} 
                  className="px-6 py-2 text-[#B3B3B3] hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDemoteFromAdmin} 
                  className="bg-[#EF4444] hover:bg-[#DC2626] px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Demote from Admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report User Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] border border-[#333] p-8 rounded-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <FaFlag className="text-[#EF4444]" />
                <span>Report User: {reportingUser}</span>
              </h3>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Reason for reporting:</label>
                <textarea
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Please describe why you're reporting this user..."
                  rows={4}
                  className="w-full p-3 bg-[#0D0D0D] border border-[#333] rounded-lg text-white placeholder-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:border-transparent resize-none"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => {
                    setShowReportModal(false);
                    setReportingUser(null);
                    setReportReason('');
                  }} 
                  className="px-6 py-2 text-[#B3B3B3] hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitReport} 
                  className="bg-[#EF4444] hover:bg-[#DC2626] px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                  disabled={!reportReason.trim()}
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kick User Confirmation Modal */}
        {showKickConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] border border-[#333] p-8 rounded-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <FaUserTimes className="text-[#EF4444]" />
                <span>Kick User</span>
              </h3>
              <p className="text-[#B3B3B3] mb-6">
                Are you sure you want to kick <strong className="text-white">{userToKick}</strong> from the community? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => {
                    setShowKickConfirmModal(false);
                    setUserToKick(null);
                  }} 
                  className="px-6 py-2 text-[#B3B3B3] hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmKickUser} 
                  className="bg-[#EF4444] hover:bg-[#DC2626] px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Kick User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Community Modal */}
        {pendingJoinCommunity && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] border border-[#333] p-8 rounded-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Join {pendingJoinCommunity.name}</h3>
              <div className="mb-6">
                <h4 className="font-semibold mb-2 text-[#A259FF]">Community Rules:</h4>
                <p className="text-[#B3B3B3] leading-relaxed">{pendingJoinCommunity.rules}</p>
              </div>
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => confirmJoin(false)} 
                  className="px-6 py-2 text-[#EF4444] hover:bg-[#EF4444] hover:bg-opacity-10 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => confirmJoin(true)} 
                  className="bg-[#A259FF] hover:bg-[#8B46FF] px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Accept & Join
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Post Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] border border-[#333] p-8 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-6">Create New Post</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Post Title</label>
                  <input
                    value={newPostTitle}
                    onChange={e => setNewPostTitle(e.target.value)}
                    placeholder="Enter post title"
                    className="w-full p-4 bg-[#0D0D0D] border border-[#333] rounded-lg text-white placeholder-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    placeholder="What's on your mind?"
                    rows={6}
                    className="w-full p-4 bg-[#0D0D0D] border border-[#333] rounded-lg text-white placeholder-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#A259FF] focus:border-transparent resize-none"
                  />
                </div>
                
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">Images</label>
                  <div className="border-2 border-dashed border-[#333] rounded-lg p-6 text-center hover:border-[#A259FF] transition-colors duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <FaImage className="text-3xl text-[#B3B3B3] mb-2 mx-auto" />
                      <p className="text-[#B3B3B3] mb-1">Click to upload images</p>
                      <p className="text-sm text-[#666]">PNG, JPG, GIF up to 10MB</p>
                    </label>
                  </div>
                  
                  {/* Image Preview */}
                  {newPostImages.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-2 gap-2">
                        {newPostImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={image.url} 
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-[#333]"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button 
                  onClick={() => {
                    setShowPostModal(false);
                    setNewPostImages([]);
                  }} 
                  className="px-6 py-2 text-[#EF4444] hover:bg-[#EF4444] hover:bg-opacity-10 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePost} 
                  className="bg-[#A259FF] hover:bg-[#8B46FF] px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                  disabled={!newPostTitle.trim() || !newPostContent.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitiesPage;