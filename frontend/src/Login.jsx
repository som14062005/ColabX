import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Add authentication logic here later
    navigate('/dashboard'); // You can change this route as per your project
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-100">
          Login to <span className="text-purple-400 font-extrabold tracking-wide">ColabX</span>
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm text-gray-300">Email</label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">Password</label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 transition-all text-white py-2 rounded-lg font-semibold"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <span
            className="text-purple-400 cursor-pointer hover:underline"
            onClick={() => navigate('/signup')}
          >
            Sign up here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
