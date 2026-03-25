import { useNavigate } from "react-router-dom";
import React from "react";
import { useState } from "react";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Store token / user info in localStorage so other pages can read it
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      console.log("Registration successful:", data);

      // After registering we can take them straight into the app
      navigate("/");
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Register</h2>

        {/* greet as soon as the user starts typing their name */}
        {formData.name && (
          <p className="text-sm text-green-600 mb-2">Hi, {formData.name}! 👋</p>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          className="w-full mb-3 p-2 border rounded"
          onChange={handleChange}
          disabled={loading}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          className="w-full mb-3 p-2 border rounded"
          onChange={handleChange}
          disabled={loading}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          className="w-full mb-3 p-2 border rounded"
          onChange={handleChange}
          disabled={loading}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-3 text-sm text-center">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-500 cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
