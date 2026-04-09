import React from "react";
import { useStateContext } from "../../../context/StateContext";

const UserProfile = () => {
  const { state } = useStateContext();
  const user = state.user || {
    id: 1,
    username: "superadmin",
    full_name: "Super Admin",
    roles: ["super_admin"],
    permissions: ["*.*"],
  };

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  const formatRole = (role) =>
    role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const isSuperAdmin = user.roles?.includes("super_admin");

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Banner */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-orange-500 via-yellow-500 to-pink-500" />

          {/* Avatar + Name */}
          <div className="px-4 sm:px-6 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 -mt-10 sm:-mt-12">
              {/* Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-600 border-4 border-white shadow-md flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0">
                {getInitials(user.username)}
              </div>

              {/* Badge */}
              {isSuperAdmin && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full w-fit">
                  <span className="text-amber-500">★</span> Super Admin
                </span>
              )}
            </div>

            <div className="mt-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user.full_name}</h1>
              <p className="text-sm text-gray-400 mt-0.5">@{user.username}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Account Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Account Details</h2>
            <div className="space-y-3">
              <InfoRow label="User ID" value={`#${user.id}`} />
              <InfoRow label="Username" value={user.username} mono />
              <InfoRow label="Full Name" value={user.full_name} />
            </div>
          </div>

          {/* Roles */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Roles</h2>
            <div className="flex flex-wrap gap-2">
              {user.roles?.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100"
                >
                  {formatRole(role)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Permissions</h2>
          <div className="flex flex-wrap gap-2">
            {user.permissions?.map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100"
              >
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                {perm === "*.*" ? "Full Access (All Permissions)" : perm}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const InfoRow = ({ label, value, mono }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm text-gray-400 flex-shrink-0">{label}</span>
    <span className={`text-sm font-medium text-gray-800 text-right truncate ${mono ? "font-mono bg-gray-50 px-2 py-0.5 rounded text-gray-600" : ""}`}>
      {value}
    </span>
  </div>
);

export default UserProfile;