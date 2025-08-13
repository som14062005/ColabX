import React, { useState, useEffect } from 'react';
import { Edit2, Check, X, Shield, ExternalLink, Plus, Trash2, MapPin, Mail, Phone, Github, Linkedin, Globe, Wallet, ArrowLeft } from 'lucide-react';
import { Contract, ethers } from 'ethers';
import axios from 'axios';
import contractData from './contract.json';


// Replace these with your deployed contract address and ABI (or set via env and read at runtime)
const CONTRACT_ADDRESS = contractData.contract;
const CONTRACT_ABI = contractData.abi;

const UserProfile = ({ userData, onBack, isOwnProfile = true }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showResume, setShowResume] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [showSkillInput, setShowSkillInput] = useState(false);
    const [newSkill, setNewSkill] = useState('');


    const [showProjectModal, setShowProjectModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectCommitsLoading, setProjectCommitsLoading] = useState(false);

    // NEW: Add project modal state
    const [showAddProject, setShowAddProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectRepoUrl, setNewProjectRepoUrl] = useState('');
    const [isAddingProject, setIsAddingProject] = useState(false);
    const [chainLoading, setChainLoading] = useState(false);

    // NEW: Loaded projects from chain (ids) and details
    const [onchainProjectIds, setOnchainProjectIds] = useState([]);
    const [onchainProjects, setOnchainProjects] = useState({}); // id => project

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
        projects: []
    };

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
            projects: user.projects || []
        };
    };

    const [profile, setProfile] = useState(convertUserDataToProfile(userData));
    const [editingProfile, setEditingProfile] = useState({ ...profile });

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

    useEffect(() => {
        // whenever wallet changes load on-chain project ids
        if (walletAddress) fetchOnChainProjects(walletAddress);
    }, [walletAddress]);

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
            if (isEditing) setEditingProfile(prev => ({ ...prev, walletAddress: address }));
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
        setIsConnecting(false);
    };

    const disconnectWallet = () => {
        setWalletAddress('');
        setProfile(prev => ({ ...prev, walletAddress: '' }));
        if (isEditing) setEditingProfile(prev => ({ ...prev, walletAddress: '' }));
        setOnchainProjectIds([]);
        setOnchainProjects({});
    };

    const fetchCommitDetailsByShas = async (owner, repo, shas = []) => {
    if (!owner || !repo || !Array.isArray(shas) || shas.length === 0) return [];
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const headers = token ? { Authorization: `token ${token}` } : {};
    const results = [];
    // fetch sequentially to be a bit gentler on rate limits; can be changed to Promise.all
    for (const sha of shas) {
        try {
            const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
            const resp = await axios.get(url, { headers });
            if (resp.status === 200 && resp.data) {
                const c = resp.data;
                results.push({ sha: c.sha, message: c.commit?.message || '', date: c.commit?.author?.date || '', url: c.html_url });
            }
        } catch (err) {
            console.warn('Failed to fetch commit', sha, err?.response?.data || err.message || err);
            // push a minimal record so UI can show the sha
            results.push({ sha, message: '(details unavailable)', date: '', url: `https://github.com/${owner}/${repo}/commit/${sha}` });
        }
    }
    return results;
};

    const getGithubUsernameFromProfile = () => {
        // expects profile.links.github to be like https://github.com/username or https://github.com/username/
        try {
            const url = profile.links.github;
            if (!url) return null;
            const m = url.match(/github.com\/(?!.*\/.+)([A-Za-z0-9-]+)/);
            if (m && m[1]) return m[1];
            // fallback: try splitting
            const parts = url.split('/').filter(Boolean);
            return parts[parts.length - 1];
        } catch (e) {
            return null;
        }
    };

    const parseRepoUrl = (url) => {
        // accepts https://github.com/owner/repo or owner/repo
        if (!url) return null;
        let cleaned = url.trim();
        if (cleaned.startsWith('http')) {
            try {
                const u = new URL(cleaned);
                const parts = u.pathname.split('/').filter(Boolean);
                if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
            } catch (err) {
                return null;
            }
        }
        const parts = cleaned.split('/').filter(Boolean);
        if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
        return null;
    };

    const fetchCommitsForUser = async (owner, repo, username) => {
        // Use GitHub commits endpoint with author query to get commits by author login
        // This returns commits where author.login == username
        // If that fails or returns empty, we fallback to fetching many commits and filtering by commit.commit.author.email
        const token = import.meta.env.VITE_GITHUB_TOKEN || null;
        const headers = token ? { Authorization: `token ${token}` } : {};
        try {
            const url = `https://api.github.com/repos/${owner}/${repo}/commits?author=${username}&per_page=100`;
            const resp = await axios.get(url, { headers });
            if (resp.status === 200 && Array.isArray(resp.data) && resp.data.length > 0) {
                // map to light commit info
                return resp.data.map(c => ({ sha: c.sha, message: c.commit.message, date: c.commit.author.date, url: c.html_url }));
            }
            // fallback: fetch recent commits and filter locally
            const fallbackUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`;
            const resp2 = await axios.get(fallbackUrl, { headers });
            const list = (resp2.data || []).filter(c => {
                if (c.author && c.author.login) return c.author.login.toLowerCase() === username.toLowerCase();
                const email = c.commit && c.commit.author && c.commit.author.email;
                // optionally compare email to user's profile email? We'll skip that automatic step.
                return false;
            }).map(c => ({ sha: c.sha, message: c.commit.message, date: c.commit.author.date, url: c.html_url }));
            return list;
        } catch (err) {
            console.error('Error fetching commits from GitHub:', err?.response?.data || err.message || err);
            return [];
        }
    };

    const handleAddProjectClick = () => {
        setShowAddProject(true);
        setNewProjectName('');
        setNewProjectRepoUrl('');
    };

    const addProjectOnChain = async (owner, repo, projectName, commits) => {
    if (!window.ethereum) throw new Error('MetaMask not found');
    setChainLoading(true);
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const address = await signer.getAddress();

        // Prepare commit arrays
        const commitsData = commits.map(c => ({
            sha: c.sha,
            message: c.message,
            date: new Date(c.date).getTime()
        }));
        const commitShas = commitsData.map(c => c.sha);
        const commitMessages = commitsData.map(c => c.message);
        const commitDates = commitsData.map(c => Math.floor(c.date / 1000)); // seconds

        // Call contract with all arrays
        const tx = await contract.addProject(address, owner, repo, projectName, commitShas, commitMessages, commitDates);
        const receipt = await tx.wait();

        // Parse ProjectAdded event for projectId
        let projectId = null;
        if (receipt && receipt.events) {
            for (const ev of receipt.events) {
                try {
                    const iface = new ethers.utils.Interface(CONTRACT_ABI);
                    const parsed = (() => {
                        try { return iface.parseLog(ev); } catch(e) { return null; }
                    })();
                    if (parsed && parsed.name === 'ProjectAdded') {
                        projectId = parsed.args[0].toNumber ? parsed.args[0].toNumber() : Number(parsed.args[0]);
                        break;
                    }
                } catch (e) {}
            }
        }
        setChainLoading(false);
        return projectId !== null ? projectId : true;
    } catch (err) {
        setChainLoading(false);
        console.error('On-chain addProject failed:', err);
        throw err;
    }
};

    const handleSubmitAddProject = async (e) => {
    e.preventDefault();
    if (!newProjectRepoUrl || !newProjectName) return alert('Please add project name and repo url');
    if (!walletAddress) return alert('Connect MetaMask first');

    const ownerRepo = parseRepoUrl(newProjectRepoUrl);
    if (!ownerRepo) return alert('Invalid GitHub repo URL. Expected https://github.com/owner/repo or owner/repo');
    const githubUsername = getGithubUsernameFromProfile();
    if (!githubUsername) return alert('Your GitHub username is not available in your profile links. Please add it to your profile links.github');

    setIsAddingProject(true);
    try {
        // Fetch commits by that user
        const commits = await fetchCommitsForUser(ownerRepo.owner, ownerRepo.repo, githubUsername);

        // Call contract and get on-chain project id (if available)
        const returned = await addProjectOnChain(ownerRepo.owner, ownerRepo.repo, newProjectName, commits);
        const onchainId = (typeof returned === 'number') ? returned : null;

        // Update local profile.projects (so UI shows immediately)
        const newProj = {
            id: Date.now(),
            onchainId,
            name: newProjectName,
            githublink: `https://github.com/${ownerRepo.owner}/${ownerRepo.repo}`,
            owner: ownerRepo.owner,
            repo: ownerRepo.repo,
            commitsFull: commits
        };
        setProfile(prev => ({ ...prev, projects: [...prev.projects, newProj] }));

        // Refresh on-chain projects list
        await fetchOnChainProjects(walletAddress);

        setShowAddProject(false);
        setNewProjectName('');
        setNewProjectRepoUrl('');
    } catch (err) {
        alert('Failed to add project: ' + (err.message || err));
    }
    setIsAddingProject(false);
};


    // Fetch projects when profile owner or viewer loads the page
useEffect(() => {
    const isOwner =
        walletAddress?.toLowerCase() === userData?.walletAddress?.toLowerCase();
    const targetWallet = userData?.walletAddress;

    if (targetWallet) {
        fetchOnChainProjects(targetWallet, isOwner);
    }
}, [userData?.walletAddress, walletAddress]);

useEffect(() => {
    const init = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                const address = accounts[0];
                setWalletAddress(address);
                await fetchOnChainProjects(address);
            }
        }
    };
    init();
}, []);

// Fetch whenever wallet changes
useEffect(() => {
    if (walletAddress) {
        fetchOnChainProjects(walletAddress);
    }
}, [walletAddress]);


useEffect(() => {
    const init = async () => {
        const targetWallet = userData?.walletAddress || walletAddress;
        if (targetWallet) {
            await fetchOnChainProjects(targetWallet);
        }
    };
    init();
}, [userData?.walletAddress]);


const fetchOnChainProjects = async (wallet) => {
    if (!window.ethereum) return;
    try {
        setChainLoading(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const ids = await contract.getUserProjectIds(wallet);
        const numericIds = ids.map(i => i.toNumber());

        const projectList = [];

        for (const id of numericIds) {
            const p = await contract.getProject(id);

            let commits = [];
            if (Array.isArray(p[4]) && p[4].length > 0 && typeof p[4][0] === 'object') {
                commits = p[4].map(c => ({
                    sha: c.sha,
                    message: c.message,
                    date: c.date,
                    url: `https://github.com/${p[0]}/${p[1]}/commit/${c.sha}`
                }));
            } else if (Array.isArray(p[4])) {
                commits = p[4].map(sha => ({
                    sha,
                    message: '',
                    date: '',
                    url: 'https://github.com/${p[0]}/${p[1]}/commit/${sha}'
                }));
            }

            // Ensure project name is clean
            const safeName = p[3] && !p[3].startsWith("0x") ? p[3] : p[1];

            projectList.push({
                id,
                onchainId: id,
                name: safeName, // Use entered name or fallback to repo name
                githublink: 'https://github.com/${p[0]}/${p[1]}',
                owner: p[0],
                repo: p[1],
                commits
            });
        }

        setProfile(prev => ({ ...prev, projects: projectList }));

    } catch (err) {
        console.error('Failed to fetch onchain projects', err);
    } finally {
        setChainLoading(false);
    }
};




    const viewProjectCommits = async (project) => {
    setSelectedProject(null);
    setShowProjectModal(true);
    setProjectCommitsLoading(true);

    try {
        // If it's an on-chain project object with commit structs
        if (project.commits && Array.isArray(project.commits) && project.commits.length > 0 && typeof project.commits[0] === 'object' && project.commits[0].sha) {
            setSelectedProject({ ...project, commits: project.commits });
            setProjectCommitsLoading(false);
            return;
        }

        // If the clicked project is a local entry that references onchainId, attempt to find onchain details
        if (project.onchainId && onchainProjects[project.onchainId]) {
            const p = onchainProjects[project.onchainId];
            if (p.commits && p.commits.length > 0) {
                setSelectedProject({ ...p, commits: p.commits });
                setProjectCommitsLoading(false);
                return;
            }
        }

        // Fallback: fetch commit details by SHAs if available
        if (project.commits && Array.isArray(project.commits) && project.commits.length > 0) {
            const details = await fetchCommitDetailsByShas(project.owner, project.repo, project.commits);
            setSelectedProject({ ...project, commits: details });
            setProjectCommitsLoading(false);
            return;
        }

        // Default fallback: fetch commits by author from the repo
        const githubUsername = getGithubUsernameFromProfile();
        if (project.owner && project.repo && githubUsername) {
            const fetched = await fetchCommitsForUser(project.owner, project.repo, githubUsername);
            setSelectedProject({ ...project, commits: fetched });
            setProjectCommitsLoading(false);
            return;
        }

        setSelectedProject({ ...project, commits: [] });
    } catch (err) {
        console.error('Failed to load project commits', err);
        setSelectedProject({ ...project, commits: [] });
    } finally {
        setProjectCommitsLoading(false);
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

    const handleEdit = () => {
    setIsEditing(true);
};

const handleSave = () => {
    setProfile(editingProfile);
    setIsEditing(false);
    // optionally trigger a save to backend here
};

const handleCancel = () => {
    setEditingProfile(profile);
    setIsEditing(false);
};

const handleInputChange = (field, value) => {
    // Supports nested fields like 'links.github'
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
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowResume(!showResume)}
                                    className="flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-all transform hover:scale-105"
                                    style={{backgroundColor: '#A259FF', color: '#FFFFFF'}}
                                >
                                    <Shield size={20} />
                                    On-Chain Verifiable Resume
                                    <ExternalLink size={16} />
                                </button>
                                {/* Add Project Button */}
                                <button
                                    onClick={handleAddProjectClick}
                                    className="px-4 py-3 rounded-lg"
                                    style={{backgroundColor: '#111111', color: '#FFFFFF', border: '1px solid #333'}}
                                >
                                    <Plus size={16} /> Add Project
                                </button>
                            </div>

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
                                                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                                    <span style={{ color: '#FFFFFF' }}>{project.name}</span>
                                                    <a href={project.githublink} target="_blank" rel="noreferrer" style={{color: '#A259FF'}}>
                                                        <Github size={14} />
                                                    </a>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => viewProjectCommits(project)} className="px-3 py-1 rounded bg-gray-800 text-white">View Commits</button>
                                                </div>
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
                                    <div key={index} className="px-3 py-1 rounded-full border flex items-center gap-2" style={{backgroundColor: '#A259FF20', color: '#A259FF', borderColor: '#A259FF40'}}>
                                        <span>{skill}</span>
                                        {isEditing && isOwnProfile && (
                                            <button onClick={() => removeSkill(skill)} className="hover:text-red-300" style={{color: '#EF4444'}}>
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isEditing && isOwnProfile && (
                                    <button onClick={() => setShowSkillInput(true)} className="px-3 py-1 rounded-full border transition-colors flex items-center gap-1" style={{backgroundColor: '#1A1A1A', color: '#B3B3B3', borderColor: '#333333'}}>
                                        <Plus size={14} />
                                        Add Skill
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-xl p-6 border text-center" style={{backgroundColor: '#1A1A1A', borderColor: '#333333'}}>
                                <div className="text-3xl font-bold mb-2" style={{color: '#A259FF'}}>{currentProfile.projects.length}</div>
                                <div style={{color: '#B3B3B3'}}>Total Projects</div>
                            </div>
                            <div className="rounded-xl p-6 border text-center" style={{backgroundColor: '#1A1A1A', borderColor: '#333333'}}>
                                <div className="text-3xl font-bold mb-2" style={{color: '#10B981'}}>{currentProfile.experience || '5+'}</div>
                                <div style={{color: '#B3B3B3'}}>Years Experience</div>
                            </div>
                            <div className="rounded-xl p-6 border text-center" style={{backgroundColor: '#1A1A1A', borderColor: '#333333'}}>
                                <div className="text-3xl font-bold mb-2" style={{color: '#7C3AED'}}>{currentProfile.skills.length}</div>
                                <div style={{color: '#B3B3B3'}}>Skills</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Project Modal */}
                {showAddProject && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <form onSubmit={handleSubmitAddProject} className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333333] w-96">
                            <h4 className="text-lg font-semibold mb-4" style={{color:'#FFFFFF'}}>Add Project (verifiable)</h4>
                            <label className="text-sm" style={{color:'#B3B3B3'}}>Project Display Name</label>
                            <input value={newProjectName} onChange={(e)=>setNewProjectName(e.target.value)} className="w-full rounded px-3 py-2 mb-3" style={{background:'#0D0D0D', color:'#FFF'}} />
                            <label className="text-sm" style={{color:'#B3B3B3'}}>GitHub Repo URL (https://github.com/owner/repo)</label>
                            <input value={newProjectRepoUrl} onChange={(e)=>setNewProjectRepoUrl(e.target.value)} className="w-full rounded px-3 py-2 mb-4" style={{background:'#0D0D0D', color:'#FFF'}} />

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={()=>setShowAddProject(false)} className="px-4 py-2 rounded" style={{background:'#EF4444', color:'#FFF'}}>Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded" style={{background:'#A259FF', color:'#FFF'}} disabled={isAddingProject || chainLoading}>{isAddingProject || chainLoading ? 'Adding...' : 'Add Project'}</button>
                            </div>
                        </form>
                    </div>
                )}

                {showProjectModal && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333333] w-11/12 max-w-3xl">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-lg font-semibold" style={{color:'#FFFFFF'}}>{selectedProject?.name || selectedProject?.onchainId ? `Project ${selectedProject?.onchainId || ''}` : 'Project Details'}</h4>
                    <div className="text-sm" style={{color:'#B3B3B3'}}>{selectedProject?.owner}/{selectedProject?.repo}</div>
                </div>
                <div>
                    <button onClick={() => { setShowProjectModal(false); setSelectedProject(null); }} className="px-3 py-1 rounded bg-red-600 text-white">Close</button>
                </div>
            </div>

            {projectCommitsLoading ? (
                <div style={{color:'#B3B3B3'}}>Loading commits...</div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-auto">
                    {selectedProject && Array.isArray(selectedProject.commits) && selectedProject.commits.length > 0 ? (
                        selectedProject.commits.map((c, idx) => (
                            <div key={c.sha || idx} className="p-3 rounded border" style={{background:'#0D0D0D', borderColor:'#333'}}>
                                <div>
                                    <p style={{color:'#A259FF', fontWeight:700}}>
                                        <b>{c.message}</b> ({c.sha ? c.sha.slice(0,7) : ''})
                                    </p>
                                    <p style={{color:'#B3B3B3', fontSize:'12px'}}>
                                        {c.date ? new Date(Number(c.date) * 1000).toLocaleString() : ''}
                                    </p>
                                </div>
                                {c.url && (
                                    <div className="mt-2">
                                        <a href={c.url} target="_blank" rel="noreferrer" style={{color:'#A259FF'}}>View on GitHub</a>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{color:'#B3B3B3'}}>No commits found for this project.</div>
                    )}
                </div>
            )}
        </div>
    </div>
)}

            </div>
        </div>
    );
};

export default UserProfile;

