import React, { useState, useEffect } from 'react';
import { Edit2, Check, X, Shield, ExternalLink, Plus, Trash2, MapPin, Mail, Phone, Github, Linkedin, Globe, Wallet, ArrowLeft } from 'lucide-react';

const UserProfile = ({ userData, onBack, isOwnProfile = true }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showResume, setShowResume] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [showSkillInput, setShowSkillInput] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    
    // Default profile data - will be overridden by userData prop
    const defaultProfile = {
        name: 'Alex Johnson',
        title: 'Full Stack Developer',
        location: 'San Francisco, CA',
        email: 'alex.johnson@email.com',
        phone: '+1 (555) 123-4567',
        bio: 'Passionate developer with 5+ years of experience in building scalable web applications. Love working with modern technologies and contributing to open-source projects.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        skills: ['React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'Docker'],
        walletAddress: '',
        links: {
            github: 'https://github.com/alexjohnson',
            linkedin: 'https://linkedin.com/in/alexjohnson',
            website: 'https://alexjohnson.dev'
        },
        projects: [
            { id: 1, name: 'E-commerce Platform', githublink: 'https://github.com/example/ecommerce' },
            { id: 2, name: 'Social Media Dashboard', githublink: 'https://github.com/example/social-media' },
            { id: 3, name: 'AI Chat Application', githublink: 'https://github.com/example/ai-chat' },
            { id: 4, name: 'Blockchain Voting System', githublink: 'https://github.com/example/blockchain-voting' },
            { id: 5, name: 'Task Management App', githublink: 'https://github.com/example/task-manager' }
        ]
    };

    // Convert userData from notification format to profile format
    const convertUserDataToProfile = (user) => {
        if (!user) return defaultProfile;
        
        return {
            name: user.displayName || user.username || 'Unknown User',
            title: user.title || 'Developer',
            location: user.location || 'Unknown Location',
            email: user.email || 'Not provided',
            phone: user.phone || 'Not provided',
            bio: user.bio || 'No bio available',
            avatar: user.avatar || 'https://i.pravatar.cc/150?img=1',
            skills: user.skills || [],
            walletAddress: user.walletAddress || '',
            links: {
                github: user.github || '',
                linkedin: user.linkedin || '',
                website: user.website || ''
            },
            projects: user.projects || [
                { id: 1, name: 'Project 1', githublink: 'https://github.com/example/project1' },
                { id: 2, name: 'Project 2', githublink: 'https://github.com/example/project2' }
            ]
        };
    };

    const [profile, setProfile] = useState(convertUserDataToProfile(userData));
    const [editingProfile, setEditingProfile] = useState({ ...profile });

    // Update profile when userData changes
    useEffect(() => {
        const newProfile = convertUserDataToProfile(userData);
        setProfile(newProfile);
        setEditingProfile(newProfile);
    }, [userData]);

    useEffect(() => {
        if (window.ethereum && window.ethereum.selectedAddress) {
            setWalletAddress(window.ethereum.selectedAddress);
            setProfile(prev => ({ ...prev, walletAddress: window.ethereum.selectedAddress }));
        }
    }, []);

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert('Please install MetaMask to connect your wallet!');
            return;
        }
        
        setIsConnecting(true);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];
            setWalletAddress(address);
            setProfile(prev => ({ ...prev, walletAddress: address }));
            if (isEditing) {
                setEditingProfile(prev => ({ ...prev, walletAddress: address }));
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
        setIsConnecting(false);
    };

    const disconnectWallet = () => {
        setWalletAddress('');
        setProfile(prev => ({ ...prev, walletAddress: '' }));
        if (isEditing) {
            setEditingProfile(prev => ({ ...prev, walletAddress: '' }));
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditingProfile({...profile});
    };

    const handleSave = () => {
        setProfile({...editingProfile});
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditingProfile({...profile});
        setIsEditing(false);
    };

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setEditingProfile(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setEditingProfile(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const addSkill = (skill) => {
        if (skill && !editingProfile.skills.includes(skill)) {
            setEditingProfile(prev => ({
                ...prev,
                skills: [...prev.skills, skill]
            }));
        }
    };

    const removeSkill = (skillToRemove) => {
        setEditingProfile(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const currentProfile = isEditing ? editingProfile : profile;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6" style={{background: '#0D0D0D'}}>
            <div className="max-w-4xl mx-auto">
                {/* Header with back button and edit controls */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                                style={{backgroundColor: '#2A2A2A', color: '#FFFFFF'}}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#3A3A3A'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#2A2A2A'}
                            >
                                <ArrowLeft size={16} />
                                Back
                            </button>
                        )}
                        <h1 className="text-3xl font-bold" style={{color: '#FFFFFF'}}>
                            {isOwnProfile ? 'Profile' : `${currentProfile.name}'s Profile`}
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        {!isEditing && isOwnProfile ? (
                            <button
                                onClick={handleEdit}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                                style={{backgroundColor: '#A259FF', color: '#FFFFFF'}}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#7C3AED'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#A259FF'}
                            >
                                <Edit2 size={16} />
                                Edit Profile
                            </button>
                        ) : isEditing ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Check size={16} />
                                    Save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                                    style={{backgroundColor: '#EF4444', color: '#FFFFFF'}}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#DC2626'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#EF4444'}
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl p-6 border" style={{backgroundColor: '#1A1A1A', borderColor: '#333333'}}>
                            {/* Avatar */}
                            <div className="text-center mb-6">
                                <img
                                    src={currentProfile.avatar}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4"
                                    style={{borderColor: '#A259FF'}}
                                />
                                {isEditing && isOwnProfile ? (
                                    <input
                                        type="text"
                                        value={currentProfile.avatar}
                                        onChange={(e) => handleInputChange('avatar', e.target.value)}
                                        className="w-full rounded-lg px-3 py-2 mb-2 text-sm"
                                        style={{backgroundColor: '#0D0D0D', color: '#FFFFFF', borderColor: '#333333'}}
                                        placeholder="Avatar URL"
                                    />
                                ) : null}
                                
                                {isEditing && isOwnProfile ? (
                                    <input
                                        type="text"
                                        value={currentProfile.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="text-xl font-bold rounded-lg px-3 py-2 w-full mb-2"
                                        style={{backgroundColor: '#0D0D0D', color: '#FFFFFF'}}
                                    />
                                ) : (
                                    <h2 className="text-xl font-bold mb-2" style={{color: '#FFFFFF'}}>{currentProfile.name}</h2>
                                )}
                                
                                {isEditing && isOwnProfile ? (
                                    <input
                                        type="text"
                                        value={currentProfile.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        className="rounded-lg px-3 py-2 w-full"
                                        style={{backgroundColor: '#0D0D0D', color: '#A259FF'}}
                                    />
                                ) : (
                                    <p style={{color: '#A259FF'}}>{currentProfile.title}</p>
                                )}
                            </div>

                            {/* Wallet Section - Only show if it's own profile */}
                            {isOwnProfile && (
                                <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: '#0D0D0D', borderColor: '#333333', border: '1px solid'}}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold flex items-center gap-2" style={{color: '#FFFFFF'}}>
                                            <Wallet size={16} />
                                            Wallet
                                        </h3>
                                        {currentProfile.walletAddress && (
                                            <button
                                                onClick={disconnectWallet}
                                                className="text-xs px-2 py-1 rounded transition-colors"
                                                style={{backgroundColor: '#EF4444', color: '#FFFFFF'}}
                                            >
                                                Disconnect
                                            </button>
                                        )}
                                    </div>
                                    {currentProfile.walletAddress ? (
                                        <div className="text-xs break-all p-2 rounded" style={{backgroundColor: '#1A1A1A', color: '#B3B3B3'}}>
                                            {currentProfile.walletAddress}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={connectWallet}
                                            disabled={isConnecting}
                                            className="w-full py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            style={{backgroundColor: '#A259FF', color: '#FFFFFF'}}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#7C3AED'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#A259FF'}
                                        >
                                            <Wallet size={16} />
                                            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Contact Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3" style={{color: '#B3B3B3'}}>
                                    <MapPin size={16} />
                                    {isEditing && isOwnProfile ? (
                                        <input
                                            type="text"
                                            value={currentProfile.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            className="flex-1 rounded px-2 py-1"
                                            style={{backgroundColor: '#0D0D0D', color: '#FFFFFF'}}
                                        />
                                    ) : (
                                        <span>{currentProfile.location}</span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-3" style={{color: '#B3B3B3'}}>
                                    <Mail size={16} />
                                    {isEditing && isOwnProfile ? (
                                        <input
                                            type="email"
                                            value={currentProfile.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="flex-1 rounded px-2 py-1"
                                            style={{backgroundColor: '#0D0D0D', color: '#FFFFFF'}}
                                        />
                                    ) : (
                                        <span>{currentProfile.email}</span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-3" style={{color: '#B3B3B3'}}>
                                    <Phone size={16} />
                                    {isEditing && isOwnProfile ? (
                                        <input
                                            type="tel"
                                            value={currentProfile.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="flex-1 rounded px-2 py-1"
                                            style={{backgroundColor: '#0D0D0D', color: '#FFFFFF'}}
                                        />
                                    ) : (
                                        <span>{currentProfile.phone}</span>
                                    )}
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="mt-6 pt-6" style={{borderTop: '1px solid #333333'}}>
                                <h3 className="font-semibold mb-3" style={{color: '#FFFFFF'}}>Links</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Github size={16} style={{color: '#B3B3B3'}} />
                                        {isEditing && isOwnProfile ? (
                                            <input
                                                type="url"
                                                value={currentProfile.links.github}
                                                onChange={(e) => handleInputChange('links.github', e.target.value)}
                                                className="flex-1 rounded px-2 py-1"
                                                style={{backgroundColor: '#0D0D0D', color: '#FFFFFF'}}
                                            />
                                        ) : (
                                            <a href={currentProfile.links.github} className="transition-colors" style={{color: '#A259FF'}}>
                                                GitHub
                                            </a>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <Linkedin size={16} style={{color: '#B3B3B3'}} />
                                        {isEditing && isOwnProfile ? (
                                            <input
                                                type="url"
                                                value={currentProfile.links.linkedin}
                                                onChange={(e) => handleInputChange('links.linkedin', e.target.value)}
                                                className="flex-1 rounded px-2 py-1"
                                                style={{backgroundColor: '#0D0D0D', color: '#FFFFFF'}}
                                            />
                                        ) : (
                                            <a href={currentProfile.links.linkedin} className="transition-colors" style={{color: '#A259FF'}}>
                                                LinkedIn
                                            </a>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <Globe size={16} style={{color: '#B3B3B3'}} />
                                        {isEditing && isOwnProfile ? (
                                            <input
                                                type="url"
                                                value={currentProfile.links.website}
                                                onChange={(e) => handleInputChange('links.website', e.target.value)}
                                                className="flex-1 rounded px-2 py-1"
                                                style={{backgroundColor: '#0D0D0D', color: '#FFFFFF'}}
                                            />
                                        ) : (
                                            <a href={currentProfile.links.website} className="transition-colors" style={{color: '#A259FF'}}>
                                                Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* On-Chain Resume Button */}
                        <div className="rounded-xl p-6 border" style={{backgroundColor: '#1A1A1A', borderColor: '#333333'}}>
                            <button
                                onClick={() => setShowResume(!showResume)}
                                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-all transform hover:scale-105"
                                style={{backgroundColor: '#A259FF', color: '#FFFFFF'}}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#7C3AED'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#A259FF'}
                            >
                                <Shield size={20} />
                                On-Chain Verifiable Resume
                                <ExternalLink size={16} />
                            </button>
                            
                            {showResume && (
                                <div className="mt-4 rounded-lg p-4 border" style={{backgroundColor: '#0D0D0D', borderColor: '#A259FF40'}}>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2" style={{color: '#A259FF'}}>
                                        <Shield size={16} />
                                        Verified Projects
                                    </h3>
                                    <div className="space-y-2">
                                        {currentProfile.projects.map(project => (
                                            <div
                                                key={project.id}
                                                className="flex items-center justify-between rounded-lg p-3"
                                                style={{ backgroundColor: '#1A1A1A' }}
                                            >
                                                <span style={{ color: '#FFFFFF' }}>{project.name}</span>
                                                {project.githublink && (
                                                    <a
                                                        href={project.githublink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-sm"
                                                        style={{ color: '#A259FF' }}
                                                    >
                                                        <Github size={14} />
                                                        GitHub
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bio Section */}
                        <div className="rounded-xl p-6 border" style={{backgroundColor: '#1A1A1A', borderColor: '#333333'}}>
                            <h3 className="text-xl font-bold mb-4" style={{color: '#FFFFFF'}}>About</h3>
                            {isEditing && isOwnProfile ? (
                                <textarea
                                    value={currentProfile.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    className="w-full rounded-lg px-4 py-3 h-32 resize-none"
                                    style={{backgroundColor: '#0D0D0D', color: '#FFFFFF'}}
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <p className="leading-relaxed" style={{color: '#B3B3B3'}}>{currentProfile.bio}</p>
                            )}
                        </div>

                        {/* Skills Section */}
                        <div className="rounded-xl p-6 border" style={{backgroundColor: '#1A1A1A', borderColor: '#333333'}}>
                            <h3 className="text-xl font-bold mb-4" style={{color: '#FFFFFF'}}>Skills</h3>
                            
                            <div className="flex flex-wrap gap-2">
                                {currentProfile.skills.map((skill, index) => (
                                    <div 
                                        key={index} 
                                        className="px-3 py-1 rounded-full border flex items-center gap-2" 
                                        style={{backgroundColor: '#A259FF20', color: '#A259FF', borderColor: '#A259FF40'}}
                                    >
                                        <span>{skill}</span>
                                        {isEditing && isOwnProfile && (
                                            <button
                                                onClick={() => removeSkill(skill)}
                                                className="hover:text-red-300"
                                                style={{color: '#EF4444'}}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                
                                {isEditing && isOwnProfile && (
                                    <button
                                        onClick={() => setShowSkillInput(true)}
                                        className="px-3 py-1 rounded-full border transition-colors flex items-center gap-1"
                                        style={{backgroundColor: '#1A1A1A', color: '#B3B3B3', borderColor: '#333333'}}
                                    >
                                        <Plus size={14} />
                                        Add Skill
                                    </button>
                                )}
                            </div>

                            {/* Skill Input Modal */}
                            {showSkillInput && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                    <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333333] w-80">
                                        <h4 className="text-lg font-semibold mb-4" style={{color: '#FFFFFF'}}>Add New Skill</h4>
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            className="w-full rounded-lg px-3 py-2 mb-4"
                                            style={{backgroundColor: '#0D0D0D', color: '#FFFFFF', border: '1px solid #333333'}}
                                            placeholder="Enter skill..."
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setShowSkillInput(false);
                                                    setNewSkill('');
                                                }}
                                                className="px-4 py-2 rounded-lg"
                                                style={{backgroundColor: '#EF4444', color: '#FFFFFF'}}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (newSkill.trim()) addSkill(newSkill.trim());
                                                    setShowSkillInput(false);
                                                    setNewSkill('');
                                                }}
                                                className="px-4 py-2 rounded-lg"
                                                style={{backgroundColor: '#A259FF', color: '#FFFFFF'}}
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-xl p-6 border text-center" style={{backgroundColor: '#1A1A1A', borderColor: '#333333'}}>
                                <div className="text-3xl font-bold mb-2" style={{color: '#A259FF'}}>{currentProfile.projects.length}</div>
                                <div style={{color: '#B3B3B3'}}>Total Projects</div>
                            </div>
                            <div className="rounded-xl p-6 border text-center" style={{backgroundColor: '#1A1A1A', borderColor: '#333333'}}>
                                <div className="text-3xl font-bold mb-2" style={{color: '#10B981'}}>
                                    {currentProfile.experience || '5+'}
                                </div>
                                <div style={{color: '#B3B3B3'}}>Years Experience</div>
                            </div>
                            <div className="rounded-xl p-6 border text-center" style={{backgroundColor: '#1A1A1A', borderColor: '#333333'}}>
                                <div className="text-3xl font-bold mb-2" style={{color: '#7C3AED'}}>{currentProfile.skills.length}</div>
                                <div style={{color: '#B3B3B3'}}>Skills</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
