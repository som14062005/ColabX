import React, { useState } from 'react';
import { FaPlus, FaSearch, FaArrowLeft, FaComments, FaPaperPlane, FaChevronDown, FaChevronUp, FaHeart, FaShare, FaImage, FaTimes } from 'react-icons/fa';
import { CgProfile } from "react-icons/cg";

const CommunitiesPage = () => {
  const [communities, setCommunities] = useState([
    {
      name: 'Blockchain Builders',
      description: 'Discuss, build, and launch Web3 projects.',
      rules: 'Be respectful. No spam. Keep it on-topic.',
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
    }
    setPendingJoinCommunity(null);
  };

  const handleCreateCommunity = () => {
    if (!newCommunity.name || !newCommunity.description || !newCommunity.rules) return;
    const newComm = { ...newCommunity, posts: [] };
    setCommunities([...communities, newComm]);
    setJoinedCommunities([...joinedCommunities, newCommunity.name]);
    setNewCommunity({ name: '', description: '', rules: '' });
    setView('community');
    setCurrentCommunity(newComm);
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !joinedCommunities.includes(c.name)
  );

  const handleSwitchView = (newView) => {
    setView(newView);
    setPendingJoinCommunity(null);
  };

  return (
    <div className="flex h-screen bg-[#0D0D0D] text-white relative">
      {/* Sidebar */}
      <div className="w-20 bg-[#1A1A1A] flex flex-col items-center p-4 space-y-6 border-r border-[#333]">
        <div className="text-2xl font-bold text-[#A259FF] mb-4"><CgProfile /></div>
        {joinedCommunities.map(name => (
          <button
            key={name}
            onClick={() => {
              setCurrentCommunity(communities.find(c => c.name === name));
              setView('community');
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
              <h2 className="text-3xl font-bold mb-2">{currentCommunity.name}</h2>
              <p className="text-[#B3B3B3] text-lg">{currentCommunity.description}</p>
              <div className="flex items-center mt-4 space-x-4 text-sm text-[#B3B3B3]">
                <span>{currentCommunity.posts.length} posts</span>
                <span>•</span>
                <span>{joinedCommunities.length} communities joined</span>
              </div>
            </div>

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
                          <div className="font-semibold">{post.user}</div>
                          <div className="text-sm text-[#B3B3B3]">2 hours ago</div>
                        </div>
                      </div>
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
                                <div className="font-medium text-[#A259FF] text-sm mb-1">{comment.user}</div>
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
                      <div className="text-sm text-[#B3B3B3]">{c.posts.length} posts</div>
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