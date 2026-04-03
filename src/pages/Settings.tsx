import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Not authenticated. Please log in again.");
      return;
    }

    if (!currentPassword || !newPassword) {
      setError("Please fill out both current and new password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.put(
        "/api/auth/me/password",
        { currentPassword, newPassword }
      );

      setMessage(res.data?.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to update password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );
    if (!confirm) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await api.delete("/api/auth/me");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Unable to delete your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <button
                className="flex items-center justify-center w-10 h-10 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                onClick={() => navigate("/")}
                aria-label="Back to home"
              >
                <i className="fas fa-arrow-left"></i>
              </button>

              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/")}
              >
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <i className="fas fa-compass text-white text-xl"></i>
                </div>
                <span className="text-xl font-bold text-slate-900">
                  FuturePath <span className="text-indigo-600 italic">AI</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Settings</h1>
        <p className="text-sm text-slate-600 mb-10">
          Update your password or delete your account. Your changes will take effect immediately.
        </p>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            {message}
          </div>
        )}

        <section className="bg-white shadow-sm rounded-xl border border-slate-200 p-8 mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Change Password</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </section>

        <section className="bg-white shadow-sm rounded-xl border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Danger Zone</h2>

          <p className="text-sm text-slate-600 mb-4">
            Delete your account and all associated data from FuturePath. This action cannot be undone.
          </p>
          <button
            className="inline-flex items-center justify-center px-6 py-2 rounded-md border border-red-200 bg-red-50 text-red-700 font-semibold hover:bg-red-100 disabled:opacity-50"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? "Deleting…" : "Delete Account"}
          </button>
        </section>
      </main>
    </div>
  );
};

export default Settings;
