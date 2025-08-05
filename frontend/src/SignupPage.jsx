// SignupPage.jsx
import { useState, useRef } from "react";
import { FaEye, FaEyeSlash, FaPlus, FaTimes, FaGithub, FaGoogle } from "react-icons/fa";

const SKILL_SUGGESTIONS = [
  "React",
  "Node.js",
  "MongoDB",
  "TypeScript",
  "Design",
  "DevOps",
  "Python",
  "Docker",
];

const PROJECT_INTERESTS = [
  "Collaboration Tools",
  "Open Source",
  "AI/ML",
  "Real-time Systems",
  "UX/UI",
  "Blockchain",
];

function SignupPage() {
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    skills: [],
    projectInterests: [],
    bio: "",
    reputationOptIn: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [profilePreview, setProfilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "projectInterests") {
      setForm((f) => {
        const arr = new Set(f.projectInterests);
        if (checked) arr.add(value);
        else arr.delete(value);
        return { ...f, projectInterests: Array.from(arr) };
      });
      return;
    }
    if (name === "reputationOptIn") {
      setForm((f) => ({ ...f, reputationOptIn: checked }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const addSkill = (skill) => {
    if (!skill) return;
    setForm((f) => {
      if (f.skills.includes(skill)) return f;
      return { ...f, skills: [...f.skills, skill] };
    });
  };

  const removeSkill = (skill) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required";
    if (!form.displayName.trim()) errs.displayName = "Display name is required";
    if (!form.email.match(/^\S+@\S+\.\S+$/)) errs.email = "Valid email required";
    if (form.password.length < 8) errs.password = "Password must be 8+ characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (form.skills.length === 0) errs.skills = "Add at least one skill";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    // TODO: replace with actual API call
    console.log("Submitting", form);
    alert("Signup submitted (stub). Wire to backend.");
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfilePreview(url);
    // In real: upload file or keep in form data
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0D0D0D" }}>
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left graphic / info panel */}
        <div className="hidden md:flex flex-col justify-center px-6 py-8 rounded-2xl" style={{ background: "#1A1A1A" }}>
          <h2 className="text-4xl font-bold mb-4" style={{ color: "#A259FF" }}>
            Join SkillBridge
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "#B3B3B3" }}>
            Collaborate on projects, build your verifiable resume, earn badges, and connect with developers matching your
            skills. Start your project party and invite others to build together in real-time.
          </p>
          <div className="mt-6">
            <div className="flex gap-3">
              <div className="p-3 bg-[#222] rounded-lg flex-1">
                <p className="text-xs uppercase mb-1" style={{ color: "#7C3AED" }}>
                  Skill-based Match
                </p>
                <p className="text-sm" style={{ color: "#fff" }}>
                  Discover collaborators tailored to your stack.
                </p>
              </div>
              <div className="p-3 bg-[#222] rounded-lg flex-1">
                <p className="text-xs uppercase mb-1" style={{ color: "#7C3AED" }}>
                  Real-time Sync
                </p>
                <p className="text-sm" style={{ color: "#fff" }}>
                  Code, chat, and whiteboard with your team live.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Signup form */}
        <div className="bg-[#1A1A1A] rounded-2xl p-8 shadow-xl relative">
          <h1 className="text-2xl font-semibold mb-1" style={{ color: "#FFFFFF" }}>
            Create your account
          </h1>
          <p className="text-sm mb-6" style={{ color: "#B3B3B3" }}>
            Start building, collaborating, and earning reputation.
          </p>

          {/* OAuth section */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-[#333]"
              style={{ background: "#1F1F1F", color: "#fff" }}
            >
              <FaGithub /> Continue with GitHub
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-[#333]"
              style={{ background: "#1F1F1F", color: "#fff" }}
            >
              <FaGoogle /> Continue with Google
            </button>
          </div>

          <div className="relative flex items-center before:content-[''] before:h-px before:bg-[#444] before:absolute before:left-0 before:right-0 before:top-1/2 mb-6">
            <div className="relative mx-auto px-3 bg-[#1A1A1A] text-xs" style={{ color: "#B3B3B3" }}>
              or sign up with email
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-4">
              {/* Username / Display name */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: "#B3B3B3" }}>
                    Username
                  </label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="yourhandle"
                    className="w-full px-4 py-2 rounded-lg bg-[#0F0F0F] border border-[#2C2C2C] outline-none focus:ring-2"
                    style={{
                      color: "#fff",
                      borderColor: errors.username ? "#EF4444" : "#2C2C2C",
                      boxShadow: errors.username ? "0 0 8px rgba(239,68,68,0.6)" : "none",
                    }}
                  />
                  {errors.username && (
                    <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
                      {errors.username}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: "#B3B3B3" }}>
                    Display Name
                  </label>
                  <input
                    name="displayName"
                    value={form.displayName}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full px-4 py-2 rounded-lg bg-[#0F0F0F] border border-[#2C2C2C] outline-none focus:ring-2"
                    style={{
                      color: "#fff",
                      borderColor: errors.displayName ? "#EF4444" : "#2C2C2C",
                      boxShadow: errors.displayName ? "0 0 8px rgba(239,68,68,0.6)" : "none",
                    }}
                  />
                  {errors.displayName && (
                    <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
                      {errors.displayName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#B3B3B3" }}>
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@domain.com"
                  className="w-full px-4 py-2 rounded-lg bg-[#0F0F0F] border border-[#2C2C2C] outline-none focus:ring-2"
                  style={{
                    color: "#fff",
                    borderColor: errors.email ? "#EF4444" : "#2C2C2C",
                    boxShadow: errors.email ? "0 0 8px rgba(239,68,68,0.6)" : "none",
                  }}
                />
                {errors.email && (
                  <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-medium mb-1" style={{ color: "#B3B3B3" }}>
                    Password
                  </label>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg bg-[#0F0F0F] border border-[#2C2C2C] outline-none focus:ring-2 pr-10"
                    style={{
                      color: "#fff",
                      borderColor: errors.password ? "#EF4444" : "#2C2C2C",
                      boxShadow: errors.password ? "0 0 8px rgba(239,68,68,0.6)" : "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-8 text-sm"
                    style={{ color: "#B3B3B3" }}
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.password && (
                    <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-xs font-medium mb-1" style={{ color: "#B3B3B3" }}>
                    Confirm Password
                  </label>
                  <input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg bg-[#0F0F0F] border border-[#2C2C2C] outline-none focus:ring-2 pr-10"
                    style={{
                      color: "#fff",
                      borderColor: errors.confirmPassword ? "#EF4444" : "#2C2C2C",
                      boxShadow: errors.confirmPassword
                        ? "0 0 8px rgba(239,68,68,0.6)"
                        : "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-8 text-sm"
                    style={{ color: "#B3B3B3" }}
                    aria-label="toggle confirm password visibility"
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Skills input */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#B3B3B3" }}>
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: "#2C2C2C", color: "#fff" }}
                    >
                      {skill}
                      <button
                        aria-label={`remove ${skill}`}
                        onClick={() => removeSkill(skill)}
                        className="ml-1"
                        style={{ color: "#B3B3B3" }}
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                  <div className="relative flex-1 min-w-[120px]">
                    <input
                      placeholder="Add skill"
                      className="w-full px-3 py-2 rounded-lg bg-[#0F0F0F] border border-[#2C2C2C] outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill(e.target.value.trim());
                          e.target.value = "";
                        }
                      }}
                      style={{ color: "#fff" }}
                    />
                    <div className="absolute top-full mt-1 flex gap-1 flex-wrap">
                      {SKILL_SUGGESTIONS.slice(0, 5).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => addSkill(s)}
                          className="text-[10px] px-2 py-1 rounded bg-[#292929] hover:bg-[#3a3a3a]"
                          style={{ color: "#A259FF" }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {errors.skills && (
                  <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
                    {errors.skills}
                  </p>
                )}
              </div>

              {/* Project interests */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "#B3B3B3" }}>
                  Project Interests
                </p>
                <div className="flex flex-wrap gap-3">
                  {PROJECT_INTERESTS.map((pi) => (
                    <label
                      key={pi}
                      className="flex items-center gap-2 cursor-pointer select-none"
                      style={{ color: "#fff" }}
                    >
                      <input
                        type="checkbox"
                        name="projectInterests"
                        value={pi}
                        checked={form.projectInterests.includes(pi)}
                        onChange={handleChange}
                        className="accent-[#A259FF] h-4 w-4"
                      />
                      <span className="text-sm">{pi}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bio + reputation opt-in */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block text-xs font-medium mb-1" style={{ color: "#B3B3B3" }}>
                    Short Bio
                  </label>
                  <textarea
                    name="bio"
                    rows="4"
                    maxLength={160}
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Full-stack dev, loves real-time systems, open source contributor..."
                    className="w-full resize-none px-4 py-2 rounded-lg bg-[#0F0F0F] border border-[#2C2C2C] outline-none"
                    style={{ color: "#fff" }}
                  />
                  <div className="text-[10px] self-end mt-1" style={{ color: "#B3B3B3" }}>
                    {form.bio.length}/160
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: "#B3B3B3" }}>
                      Reputation
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-sm" style={{ color: "#fff" }}>
                        Enable on-chain reputation tracking & contributions to build a verifiable resume.
                      </div>
                      <label className="relative inline-block w-12 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          name="reputationOptIn"
                          checked={form.reputationOptIn}
                          onChange={handleChange}
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-[#1A1A1A] border border-[#444] appearance-none cursor-pointer"
                          style={{ accentColor: "#A259FF" }}
                        />
                        <span
                          className="block overflow-hidden h-6 rounded-full bg-[#2C2C2C] transition-all"
                          style={{ width: 48 }}
                        ></span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4 items-center">
                    <div className="w-20 h-20 relative rounded-full overflow-hidden bg-gradient-to-br from-[#7C3AED] to-[#A259FF] flex items-center justify-center">
                      {profilePreview ? (
                        <img
                          src={profilePreview}
                          alt="profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-xs text-center px-1" style={{ color: "#fff" }}>
                          Profile Photo
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg font-medium"
                        style={{
                          background: "#A259FF",
                          color: "#0D0D0D",
                        }}
                      >
                        Upload Photo
                      </button>
                      <div className="text-[11px] mt-1" style={{ color: "#B3B3B3" }}>
                        JPG/PNG up to 2MB
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileUpload}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-shadow"
                  style={{
                    background: "#A259FF",
                    color: "#0D0D0D",
                    boxShadow: "0 10px 30px -10px rgba(162,89,255,0.6)",
                  }}
                >
                  Create Account
                </button>
                <p className="text-center text-xs mt-3" style={{ color: "#B3B3B3" }}>
                  Already have an account?{" "}
                  <span className="underline cursor-pointer" style={{ color: "#A259FF" }}>
                    Log in
                  </span>
                </p>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center text-[10px]" style={{ color: "#B3B3B3" }}>
            By signing up you agree to our <span style={{ color: "#A259FF" }}>Terms of Service</span> and{" "}
            <span style={{ color: "#A259FF" }}>Privacy Policy</span>.
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;