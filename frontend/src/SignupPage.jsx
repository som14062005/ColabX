import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 🚀 Import for routing
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

function SignupPage() {
  const navigate = useNavigate(); // 🚀 Used to redirect
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    skills: [],
    github: "",
    bio: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Valid email required";
    if (form.password.length < 8) errs.password = "Password must be 8+ characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!form.bio.trim()) errs.bio = "Short bio is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    console.log("Submitting", form);
    alert("Signup submitted (stub). Wire to backend.");
    navigate("/main");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0D0D0D]">
      <div className="w-full max-w-xl bg-[#1A1A1A] p-8 rounded-2xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-100">
          Welcome to <span className="text-purple-400 font-extrabold tracking-wide">ColabX</span>!
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username and Display Name */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-300">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full p-2 bg-[#0F0F0F] border border-gray-700 text-white rounded"
              />
              {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-300">Display Name</label>
              <input
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                className="w-full p-2 bg-[#0F0F0F] border border-gray-700 text-white rounded"
              />
              {errors.displayName && <p className="text-xs text-red-500">{errors.displayName}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 bg-[#0F0F0F] border border-gray-700 text-white rounded"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <label className="text-sm text-gray-300">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-2 bg-[#0F0F0F] border border-gray-700 text-white rounded"
              />
              <button
                type="button"
                className="absolute right-2 top-8 text-gray-400"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="flex-1 relative">
              <label className="text-sm text-gray-300">Confirm Password</label>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 bg-[#0F0F0F] border border-gray-700 text-white rounded"
              />
              <button
                type="button"
                className="absolute right-2 top-8 text-gray-400"
                onClick={() => setShowConfirm((s) => !s)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <label className="text-sm text-gray-300">Short Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows="3"
              maxLength="160"
              className="w-full p-2 bg-[#0F0F0F] border border-gray-700 text-white rounded"
              placeholder="Full-stack dev, loves open source..."
            ></textarea>
            <div className="text-right text-xs text-gray-500">{form.bio.length}/160</div>
            {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
          </div>

          {/* Skills */}
          <div>
            <label className="text-sm text-gray-300">Skills (optional)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {form.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center bg-gray-700 text-white text-sm px-2 py-1 rounded-full"
                >
                  {skill}
                  <button
                    type="button"
                    className="ml-1 text-gray-300"
                    onClick={() => removeSkill(skill)}
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder="Add skill"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(e.target.value.trim());
                    e.target.value = "";
                  }
                }}
                className="bg-[#0F0F0F] border border-gray-700 text-white p-1 px-2 rounded"
              />
            </div>
          </div>

          {/* GitHub link */}
          <div>
            <label className="text-sm text-gray-300">GitHub Profile (optional)</label>
            <input
              name="github"
              value={form.github}
              onChange={handleChange}
              placeholder="https://github.com/yourusername"
              className="w-full p-2 bg-[#0F0F0F] border border-gray-700 text-white rounded"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-black font-bold py-2 rounded-xl shadow-lg"
          >
            Create Account
          </button>

          {/* Log in link */}
          <p className="text-center text-sm text-gray-400 mt-2">
            Already have an account?{" "}
            <span
              className="text-purple-400 underline cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;