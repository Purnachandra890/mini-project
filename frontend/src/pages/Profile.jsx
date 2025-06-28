import React, { useEffect, useState } from "react";
import axios from "axios";
import "../index.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const profileImage =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"; // you can replace this

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const stored = localStorage.getItem("Authorization");
        if (!stored) return;
        const token = stored.replace("Bearer ", "");

        const res = await axios.get("http://localhost:3060/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(res.data.user);
      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleChangePassword = async () => {
    try {
      const stored = localStorage.getItem("Authorization");
      const token = stored.replace("Bearer ", "");

      const res = await axios.post(
        "http://localhost:3060/profile/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message);
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error changing password.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center text-white px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">👤 Profile Overview</h1>
  
      <div className="bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl px-6 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={profileImage}
            alt="Profile"
            className="w-28 h-28 rounded-full ring-4 ring-white shadow-xl"
          />
  
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold tracking-wide">
              {profile?.username || "Username"}
            </h2>
            <p className="text-sm text-gray-400">
              📧 {profile?.email || "Email"}
            </p>
            <p className="text-sm text-green-400 font-medium">
              🪙 Tokens Left: {profile?.tokens ?? "N/A"}
            </p>
          </div>
        </div>
  
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-4 mt-8">
          <button
            onClick={() => alert("Add Tokens functionality coming soon!")}
            className="transition bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium"
          >
            ➕ Add Tokens
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="transition bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium"
          >
            🔒 Reset Password
          </button>
        </div>
      </div>
  
      {/* Password Modal remains the same */}
      {showPasswordModal && (
        <div className="mt-6 bg-zinc-900 w-full max-w-md p-6 rounded-3xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">🔐 Change Password</h2>
          <input
            type="password"
            placeholder="Current Password"
            className="w-full mb-3 p-3 rounded bg-zinc-800 text-white placeholder-gray-400 focus:outline-none"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full mb-3 p-3 rounded bg-zinc-800 text-white placeholder-gray-400 focus:outline-none"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div className="flex justify-between mt-4">
            <button
              onClick={handleChangePassword}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full"
            >
              ✅ Submit
            </button>
            <button
              onClick={() => setShowPasswordModal(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full"
            >
              ❌ Cancel
            </button>
          </div>
          {message && (
            <p className="mt-3 text-sm text-yellow-400 text-center">{message}</p>
          )}
        </div>
      )}
    </div>
  );
  
};

export default Profile;
