import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

function SignupPage() {
  const navigate = useNavigate();

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

  // Load Unicorn Studio script once
  useEffect(() => {
    if (!window.UnicornStudio) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js";
      script.onload = () => {
        if (!window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init();
          window.UnicornStudio.isInitialized = true;
        }
      };
      document.body.appendChild(script);
    } else if (!window.UnicornStudio.isInitialized) {
      window.UnicornStudio.init();
      window.UnicornStudio.isInitialized = true;
    }
  }, []);

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
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      errs.email = "Valid email required";
    if (form.password.length < 8)
      errs.password = "Password must be 8+ characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (!form.bio.trim()) errs.bio = "Short bio is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      const response = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      alert("Signup successful!");
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* 3D background */}
      <div
        data-us-project="gU9UDRjzAi3KR2v1146M"
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      ></div>

      {/* Signup form container */}
      <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
        <div className="bg-gray-800 bg-opacity-40 p-10 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-md">

          <h1 className="text-3xl font-bold mb-6 text-gray-100">
            Welcome to{" "}
            <span className="text-purple-400 font-extrabold tracking-wide">
              ColabX
            </span>
            !
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
                {errors.username && (
                  <p className="text-xs text-red-500">{errors.username}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-300">Display Name</label>
                <input
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#0F0F0F] border border-gray-700 text-white rounded"
                />
                {errors.displayName && (
                  <p className="text-xs text-red-500">{errors.displayName}</p>
                )}
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
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
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
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
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
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                )}
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
              <div className="text-right text-xs text-gray-500">
                {form.bio.length}/160
              </div>
              {errors.bio && (
                <p className="text-xs text-red-500">{errors.bio}</p>
              )}
            </div>

            {/* Skills */}
            <div>
              <label className="text-sm text-gray-300">
                Skills (optional)
              </label>
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
              <label className="text-sm text-gray-300">
                GitHub Profile (optional)
              </label>
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
            <p className="text-center text-sm text-black-400 mt-2">
              Already have an account?{" "}
              <span
                className="text-purple-900 underline cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Log in
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
