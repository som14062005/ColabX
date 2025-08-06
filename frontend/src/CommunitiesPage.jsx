import React, { useState } from 'react';
import { FaPlus, FaSearch, FaArrowLeft, FaComments, FaPaperPlane } from 'react-icons/fa';
import { CgProfile } from "react-icons/cg";

const CommunitiesPage = () => {
  const [communities, setCommunities] = useState([
    {
      name: 'Blockchain Builders',
      description: 'Discuss, build, and launch Web3 projects.',
      rules: 'Be respectful. No spam. Keep it on-topic.',
      posts: []
    },
    {
      name: 'React Developers',
      description: 'React tips, tricks and projects.',
      rules: 'No job posts. Be kind. Help others.',
      posts: []
    }
  ]);
  const [joinedCommunities, setJoinedCommunities] = useState([communities[0].name]);
  const [currentCommunity, setCurrentCommunity] = useState(communities[0]);
  const [view, setView] = useState('community');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newComment, setNewComment] = useState({});
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', rules: '' });
  const [pendingJoinCommunity, setPendingJoinCommunity] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [username] = useState('pranaav');

  const handlePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    const updatedCommunities = communities.map(c => {
      if (c.name === currentCommunity.name) {
        return {
          ...c,
          posts: [...c.posts, { user: username, title: newPostTitle, content: newPostContent, comments: [] }]
        };
      }
      return c;
    });
    setCommunities(updatedCommunities);
    setCurrentCommunity(updatedCommunities.find(c => c.name === currentCommunity.name));
    setNewPostTitle('');
    setNewPostContent('');
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
      <div className="w-20 bg-[#1A1A1A] flex flex-col items-center p-4 space-y-6">
        <div className="text-lg font-bold"><CgProfile /></div>
        {joinedCommunities.map(name => (
          <button
            key={name}
            onClick={() => {
              setCurrentCommunity(communities.find(c => c.name === name));
              setView('community');
            }}
            className={`text-sm hover:text-[#A259FF] ${currentCommunity.name === name ? 'text-[#A259FF]' : ''}`}
          >
            {name[0]}
          </button>
        ))}
        <button onClick={() => handleSwitchView('search')} className="hover:text-[#A259FF]">
          <FaSearch />
        </button>
        <button onClick={() => handleSwitchView('create')} className="hover:text-[#A259FF]">
          <FaPlus />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {view === 'community' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{currentCommunity.name}</h2>
            <p className="text-[#B3B3B3] mb-6">{currentCommunity.description}</p>

            {currentCommunity.posts.map((post, i) => (
              <div key={i} className="bg-[#1A1A1A] p-4 mb-4 rounded">
                <div className="font-semibold mb-1">{post.user}</div>
                <div className="font-bold text-lg">{post.title}</div>
                <div className="mb-2">{post.content}</div>
                <div className="mt-2">
                  {post.comments.map((comment, ci) => (
                    <div key={ci} className="ml-4 mt-1 text-sm text-[#B3B3B3]">
                      <span className="font-medium">{comment.user}:</span> {comment.text}
                    </div>
                  ))}
                  <div className="flex items-center mt-2">
                    <input
                      value={newComment[i] || ''}
                      onChange={e => setNewComment({ ...newComment, [i]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && handleComment(i)}
                      placeholder="Add a comment..."
                      className="flex-1 p-2 bg-[#0D0D0D] rounded"
                    />
                    <button onClick={() => handleComment(i)} className="ml-2 text-[#A259FF]">
                      <FaPaperPlane />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => setShowPostModal(true)} className="fixed bottom-6 right-6 bg-[#A259FF] rounded-full p-4 shadow-lg">
              <FaPlus className="text-white" />
            </button>
          </div>
        )}

        {view === 'search' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Search Communities</h2>
              <button onClick={() => handleSwitchView('community')} className="text-[#A259FF]">
                <FaArrowLeft /> Exit
              </button>
            </div>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full p-3 bg-[#1A1A1A] rounded text-white mb-4"
            />
            {filteredCommunities.map((c, i) => (
              <div key={i} className="bg-[#1A1A1A] p-4 mb-2 rounded">
                <div className="font-bold">{c.name}</div>
                <div className="text-sm text-[#B3B3B3]">{c.description}</div>
                <button
                  onClick={() => handleJoin(c)}
                  className="mt-2 bg-[#7C3AED] px-4 py-1 rounded"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )}

        {view === 'create' && (
          <div className="p-4 bg-[#1A1A1A] rounded max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create a Community</h2>
              <button onClick={() => handleSwitchView('community')} className="text-[#A259FF]">
                <FaArrowLeft /> Exit
              </button>
            </div>
            <input
              value={newCommunity.name}
              onChange={e => setNewCommunity({ ...newCommunity, name: e.target.value })}
              placeholder="Community Name"
              className="w-full p-3 mb-2 bg-[#0D0D0D] rounded text-white"
            />
            <textarea
              value={newCommunity.description}
              onChange={e => setNewCommunity({ ...newCommunity, description: e.target.value })}
              placeholder="Community Description"
              className="w-full p-3 mb-2 bg-[#0D0D0D] rounded text-white"
            />
            <textarea
              value={newCommunity.rules}
              onChange={e => setNewCommunity({ ...newCommunity, rules: e.target.value })}
              placeholder="Community Rules"
              className="w-full p-3 mb-4 bg-[#0D0D0D] rounded text-white"
            />
            <button onClick={handleCreateCommunity} className="bg-[#A259FF] px-4 py-2 rounded">Create</button>
          </div>
        )}

        {pendingJoinCommunity && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="bg-[#1A1A1A] p-6 rounded w-full max-w-md">
              <h3 className="text-xl font-bold mb-2">Rules for {pendingJoinCommunity.name}</h3>
              <p className="text-sm text-[#B3B3B3] mb-4">{pendingJoinCommunity.rules}</p>
              <div className="flex justify-end space-x-4">
                <button onClick={() => confirmJoin(false)} className="text-[#EF4444]">Reject</button>
                <button onClick={() => confirmJoin(true)} className="bg-[#A259FF] px-4 py-1 rounded">Accept</button>
              </div>
            </div>
          </div>
        )}

        {showPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-[#1A1A1A] p-6 rounded w-full max-w-lg">
              <h3 className="text-xl font-bold mb-4">Create Post</h3>
              <input
                value={newPostTitle}
                onChange={e => setNewPostTitle(e.target.value)}
                placeholder="Post Title"
                className="w-full p-3 mb-2 bg-[#0D0D0D] rounded text-white"
              />
              <textarea
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                placeholder="Post Content"
                className="w-full p-3 mb-4 bg-[#0D0D0D] rounded text-white"
              />
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowPostModal(false)} className="text-[#EF4444]">Cancel</button>
                <button onClick={handlePost} className="bg-[#A259FF] px-4 py-2 rounded">Post</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitiesPage;