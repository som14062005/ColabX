import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // ✅ Store token and user ID correctly
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("userId", data.user.id);
    sessionStorage.setItem("username", data.user.username); // <-- add this
    console.log("Token:", sessionStorage.getItem("token"));
console.log("UserId:", sessionStorage.getItem("userId"));
console.log("Username:", sessionStorage.getItem("username"));

    alert("Login successful!");
    navigate("/main");
  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong.");
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-100">
          Login to <span className="text-purple-400">ColabX</span>
        </h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter email"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-400">
          Don’t have an account?{" "}
          <span
            className="text-purple-400 cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign up here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
