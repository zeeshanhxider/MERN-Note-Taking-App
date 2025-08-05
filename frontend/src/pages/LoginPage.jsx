import { useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      toast.success("Logged in!");
      navigate("/");
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameKeyDown = (e) => {
    if (e.key === " ") {
      e.preventDefault();
      setUsername((prev) => prev + "_");
    }
  };

  const handleUsernameChange = (e) => {
    const clean = e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
    setUsername(clean);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-primary font-mono text-center py-8 mb-6">
            <span className="inline-block overflow-hidden whitespace-nowrap border-r-2 border-primary animate-typewriterBlink">
              Welcome to Scribbly
            </span>
          </h1>

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Login</h2>

              <form onSubmit={handleLogin}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Username</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    className="input input-bordered"
                    value={username}
                    onChange={handleUsernameChange}
                    onKeyDown={handleUsernameKeyDown}
                    disabled={loading}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="input input-bordered"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="card-actions justify-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <span>Don't have an account? </span>
                <a href="/register" className="text-primary hover:underline">
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;