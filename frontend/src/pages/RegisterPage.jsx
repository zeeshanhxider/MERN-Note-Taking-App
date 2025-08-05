import { useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { username, password });
      toast.success("Registered successfully!");
      navigate("/login");
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
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
              Welcome to Scribbly AI
            </span>
          </h1>
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Register</h2>

              <form onSubmit={handleRegister}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Username</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Choose a username"
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
                    placeholder="Create a password"
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
                    {loading ? "Registering..." : "Register"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;