import React, { useState, useRef, useEffect } from 'react';
import { Plus, Hash, Users, Send, Trash2, ChevronDown, Code, FileText, CheckSquare, GitBranch, PenTool, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatRoom = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([
    { id: 1, name: 'general', type: 'text' },
    { id: 2, name: 'development', type: 'text' },
    { id: 3, name: 'design', type: 'text' }
  ]);
  const [activeChannel, setActiveChannel] = useState(1);
  const [messages, setMessages] = useState({
    1: [
      { id: 1, user: 'Alice', content: 'Welcome to the project chat!', timestamp: new Date(Date.now() - 3600000) },
      { id: 2, user: 'Bob', content: 'Thanks for setting this up! 🚀', timestamp: new Date(Date.now() - 1800000) }
    ],
    2: [
      { id: 1, user: 'Charlie', content: 'Working on the new API endpoints', timestamp: new Date(Date.now() - 7200000) }
    ],
    3: [
      { id: 1, user: 'Diana', content: 'Updated the mockups, check them out!', timestamp: new Date(Date.now() - 3600000) }
    ]
  });
  const [currentMessage, setCurrentMessage] = useState('');
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [username, setUsername] = useState('You');
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  // Workspace features data
  const workspaceFeatures = [
    { id: 'chatroom', name: 'Chat Room', icon: MessageCircle, isActive: true, route: '/chat' },
    { id: 'code-editor', name: 'Code Editor', icon: Code, isActive: false, route: '/code' },
    { id: 'notes', name: 'Notes', icon: FileText, isActive: false, route: '/notes' },
    { id: 'issue-board', name: 'Issue Board', icon: CheckSquare, isActive: false, route: '/issues' },
    { id: 'git-commits', name: 'Git Commits', icon: GitBranch, isActive: false, route: '/git' },
    { id: 'whiteboard', name: 'Whiteboard', icon: PenTool, isActive: false, route: '/whiteboard' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWorkspaceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addChannel = () => {
    if (newChannelName.trim()) {
      const newChannel = {
        id: Date.now(),
        name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
        type: 'text'
      };
      setChannels([...channels, newChannel]);
      setMessages({ ...messages, [newChannel.id]: [] });
      setNewChannelName('');
      setShowAddChannel(false);
    }
  };

  const deleteChannel = (channelId) => {
    if (channels.length > 1) {
      setChannels(channels.filter(c => c.id !== channelId));
      const newMessages = { ...messages };
      delete newMessages[channelId];
      setMessages(newMessages);
      if (activeChannel === channelId) {
        setActiveChannel(channels.find(c => c.id !== channelId).id);
      }
    }
  };

  const sendMessage = () => {
    if (currentMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        user: username,
        content: currentMessage,
        timestamp: new Date()
      };
      
      setMessages({
        ...messages,
        [activeChannel]: [...(messages[activeChannel] || []), newMessage]
      });
      setCurrentMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  const handleWorkspaceFeatureClick = (feature) => {
    if (!feature.isActive) {
      // Navigate to the corresponding route
      navigate(feature.route);
    }
    setShowWorkspaceDropdown(false);
  };

  const activeChannelData = channels.find(c => c.id === activeChannel);

  return (
    <div className="flex h-screen text-white relative overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #0f0f0f 100%)'
    }}>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-gray-700" style={{
        background: 'linear-gradient(90deg, rgba(26,26,26,0.95) 0%, rgba(20,20,20,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            <span style={{ color: '#A259FF' }}>Colab</span>
            <span style={{ color: '#FFFFFF' }}>X</span>
          </h1>
          
          {/* Workspace Dropdown Button in Navbar */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                border: '1px solid rgba(168,85,247,0.3)',
                boxShadow: showWorkspaceDropdown 
                  ? '0 8px 32px rgba(168,85,247,0.4)' 
                  : '0 4px 20px rgba(168,85,247,0.2)',
              }}
            >
              <ChevronDown 
                size={18} 
                className={`transition-all duration-300 ${showWorkspaceDropdown ? 'rotate-180 text-purple-300' : 'text-white'}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showWorkspaceDropdown && (
              <div 
                className="absolute top-full left-0 mt-2 w-56 rounded-2xl overflow-hidden z-50"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,13,13,0.95) 0%, rgba(26,26,26,0.95) 100%)',
                  border: '1px solid rgba(168,85,247,0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 8px 32px rgba(168,85,247,0.1)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="p-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 py-2 mb-1">
                    Workspace Features
                  </div>
                  {workspaceFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <button
                        key={feature.id}
                        onClick={() => handleWorkspaceFeatureClick(feature)}
                        className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                          feature.isActive 
                            ? 'cursor-default' 
                            : 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                        }`}
                        style={{
                          background: feature.isActive 
                            ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                            : 'transparent',
                          color: feature.isActive ? '#FFFFFF' : '#B3B3B3',
                          boxShadow: feature.isActive ? '0 4px 20px rgba(124,58,237,0.4)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!feature.isActive) {
                            e.target.style.background = 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(59,130,246,0.1) 100%)';
                            e.target.style.color = '#FFFFFF';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!feature.isActive) {
                            e.target.style.background = 'transparent';
                            e.target.style.color = '#B3B3B3';
                          }
                        }}
                      >
                        <Icon size={18} className="mr-3 relative z-10" />
                        <span className="text-sm font-medium relative z-10">{feature.name}</span>
                        {feature.isActive && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div style={{ fontSize: '14px', color: '#B3B3B3' }}>
            Collaborative Workspace Platform
          </div>
          
          {/* Profile Navigation Button */}
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-[#A259FF] hover:bg-[#8B46FF] flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-[#A259FF]/25"
            aria-label="Go to Profile"
          >
            <User size={20} />
          </button>
        </div>
      </nav>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 rounded-full opacity-5 animate-pulse" style={{
          background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)'
        }}></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 rounded-full opacity-5 animate-pulse" style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          animationDelay: '2s'
        }}></div>
      </div>

      {/* Sidebar */}
      <div className="w-60 flex flex-col relative z-10 backdrop-blur-sm mt-16" style={{ 
        background: 'linear-gradient(180deg, rgba(26,26,26,0.95) 0%, rgba(20,20,20,0.95) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '4px 0 20px rgba(0,0,0,0.3)'
      }}>
        {/* Server Header - Simplified since dropdown moved to navbar */}
        <div className="p-4 border-b border-gray-700 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-t-lg"></div>
          <div className="relative">
            <h1 className="text-lg font-bold text-white mb-1" style={{
              textShadow: '0 2px 10px rgba(168,85,247,0.3)'
            }}>Project Chat</h1>
            <p className="text-sm" style={{ color: '#B3B3B3' }}>Team Workspace</p>
          </div>
        </div>

        {/* Channels */}
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#B3B3B3' }}>
                Text Channels
              </span>
              <button
                onClick={() => setShowAddChannel(true)}
                className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                  boxShadow: '0 2px 8px rgba(168,85,247,0.2)'
                }}
              >
                <Plus size={14} />
              </button>
            </div>
            
            {showAddChannel && (
              <div className="mb-3 p-3 rounded-lg backdrop-blur-sm" style={{ 
                background: 'linear-gradient(135deg, rgba(13,13,13,0.9) 0%, rgba(20,20,20,0.9) 100%)',
                border: '1px solid rgba(168,85,247,0.3)',
                boxShadow: '0 4px 20px rgba(168,85,247,0.1)'
              }}>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Channel name"
                  className="w-full p-2 text-sm rounded-lg border-none outline-none text-white placeholder-gray-400"
                  style={{
                    background: 'linear-gradient(135deg, rgba(55,65,81,0.8) 0%, rgba(75,85,99,0.8) 100%)'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addChannel()}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={addChannel}
                    className="px-3 py-1.5 text-xs rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                      boxShadow: '0 4px 15px rgba(168,85,247,0.3)'
                    }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddChannel(false);
                      setNewChannelName('');
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg text-white transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(75,85,99,0.8) 0%, rgba(55,65,81,0.8) 100%)'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`flex items-center justify-between group px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 mb-1 ${
                  activeChannel === channel.id 
                    ? 'text-white transform scale-105' 
                    : 'hover:scale-102'
                }`}
                style={{
                  background: activeChannel === channel.id 
                    ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' 
                    : 'transparent',
                  color: activeChannel === channel.id ? '#FFFFFF' : '#B3B3B3',
                  boxShadow: activeChannel === channel.id ? '0 4px 20px rgba(124,58,237,0.4)' : 'none'
                }}
                onClick={() => setActiveChannel(channel.id)}
              >
                <div className="flex items-center">
                  <Hash size={16} className="mr-2" />
                  <span className="text-sm font-medium">{channel.name}</span>
                </div>
                {channels.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChannel(channel.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, rgba(239,68,68,0.8) 0%, rgba(220,38,38,0.8) 100%)'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent"></div>
          <div className="flex items-center relative">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white relative" style={{ 
              background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
              boxShadow: '0 4px 15px rgba(168,85,247,0.3)'
            }}>
              {username[0]}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800" style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              }}></div>
            </div>
            <div className="ml-3 flex-1">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-sm font-semibold bg-transparent border-none outline-none text-white w-full"
              />
              <span className="text-xs" style={{ color: '#10b981' }}>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10 mt-16">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-700 flex items-center relative backdrop-blur-sm" style={{ 
          background: 'linear-gradient(90deg, rgba(26,26,26,0.95) 0%, rgba(20,20,20,0.95) 100%)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.2)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"></div>
          <Hash size={20} style={{ color: '#B3B3B3' }} className="mr-2 relative z-10" />
          <span className="font-semibold text-white relative z-10">{activeChannelData?.name}</span>
          <div className="ml-auto flex items-center gap-4 relative z-10">
            <Users size={18} style={{ color: '#B3B3B3' }} className="cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
          {(messages[activeChannel] || []).map((message, index) => (
            <div 
              key={message.id} 
              className="group p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: index % 2 === 0 
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(168,85,247,0.03) 0%, rgba(59,130,246,0.03) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white mr-3 flex-shrink-0" style={{ 
                  background: `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 0%, #${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')} 100%)`,
                  boxShadow: '0 4px 15px rgba(124,58,237,0.2)'
                }}>
                  {message.user[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-white">{message.user}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ 
                      color: '#B3B3B3',
                      background: 'rgba(255,255,255,0.1)'
                    }}>{formatTime(message.timestamp)}</span>
                  </div>
                  <div className="text-white leading-relaxed">{message.content}</div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 relative">
          <div className="flex items-center gap-3 p-4 rounded-2xl relative backdrop-blur-sm" style={{ 
            background: 'linear-gradient(135deg, rgba(26,26,26,0.9) 0%, rgba(20,20,20,0.9) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-50"></div>
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${activeChannelData?.name}`}
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 relative z-10"
            />
            <button
              onClick={sendMessage}
              disabled={!currentMessage.trim()}
              className="p-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative z-10 hover:scale-110"
              style={{ 
                background: currentMessage.trim() 
                  ? 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)'
                  : 'transparent',
                color: currentMessage.trim() ? '#FFFFFF' : '#B3B3B3',
                boxShadow: currentMessage.trim() ? '0 4px 20px rgba(168,85,247,0.4)' : 'none'
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
