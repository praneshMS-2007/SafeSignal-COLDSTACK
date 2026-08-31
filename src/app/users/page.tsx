"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/components/AuthProvider";

interface UserItem {
  id: string;
  username: string;
  displayName: string;
  role: "employee" | "officer";
  site: string | null;
  crew: string | null;
  createdAt: string;
  _count?: {
    reports: number;
  };
}

const AVAILABLE_SITES = [
  "Rig 4",
  "Bay 3",
  "Rig 7",
  "Bay 1",
  "Platform 2",
  "Store shed",
  "Duliajan HQ",
  "Moran Yard",
  "Digboi Station",
];

const AVAILABLE_CREWS = [
  "Workover crew B",
  "Maintenance A",
  "Wellhead crew",
  "Crane crew C",
  "Scaffolding team",
  "Logistics team",
  "Electrical & Instrumentation",
  "HSE Inspection Team",
];

export default function UsersManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "employee" | "officer">("all");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    displayName: "",
    role: "employee" as "employee" | "officer",
    site: "Rig 4",
    crew: "Workover crew B",
  });

  const [editFormData, setEditFormData] = useState({
    displayName: "",
    role: "employee" as "employee" | "officer",
    site: "Rig 4",
    crew: "Workover crew B",
    newPassword: "",
  });

  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to create user");
        return;
      }

      setActionSuccess(`User "${formData.displayName}" created successfully`);
      setShowAddModal(false);
      setFormData({
        username: "",
        password: "",
        displayName: "",
        role: "employee",
        site: "Rig 4",
        crew: "Workover crew B",
      });
      fetchUsers();
    } catch {
      setActionError("Network error while creating user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (userItem: UserItem) => {
    setEditingUser(userItem);
    setEditFormData({
      displayName: userItem.displayName,
      role: userItem.role,
      site: userItem.site || "Rig 4",
      crew: userItem.crew || "Workover crew B",
      newPassword: "",
    });
    setShowEditModal(true);
    setActionError("");
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setActionError("");
    setActionSuccess("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to update user");
        return;
      }

      setActionSuccess(`User "${editFormData.displayName}" updated successfully`);
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch {
      setActionError("Network error while updating user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to remove user "${username}"? They will no longer be able to log in.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete user");
        return;
      }

      setActionSuccess(`User "${username}" deleted`);
      fetchUsers();
    } catch {
      alert("Network error while deleting user");
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.site && u.site.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.crew && u.crew.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const totalEmployees = users.filter((u) => u.role === "employee").length;
  const totalOfficers = users.filter((u) => u.role === "officer").length;

  return (
    <AppLayout>
      <div className="p-4 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* Header and Add Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-outline-variant pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-secondary text-sm">manage_accounts</span>
              Administration & Access Control
            </div>
            <h1 className="text-display-lg text-on-surface font-bold">User & Employee Management</h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Create and manage authorized field workers and HSE safety officers for SafeSignal.
            </p>
          </div>

          <button
            onClick={() => {
              setActionError("");
              setShowAddModal(true);
            }}
            className="h-[52px] px-6 bg-primary hover:bg-[#021838] text-on-primary rounded-lg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shrink-0"
          >
            <span className="material-symbols-outlined text-xl">person_add</span>
            Add New User
          </button>
        </div>

        {/* Global Notifications / Alerts */}
        {actionSuccess && (
          <div className="bg-tertiary-container text-on-tertiary-container border-2 border-[#1E5023] p-4 rounded-lg text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              {actionSuccess}
            </div>
            <button onClick={() => setActionSuccess("")} className="text-xs uppercase font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border-2 border-outline-variant rounded-lg p-5">
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Registered Accounts</span>
              <span className="material-symbols-outlined text-primary">groups</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">{users.length}</div>
            <div className="text-xs text-on-surface-variant mt-1">Authorized company profiles</div>
          </div>

          <div className="bg-surface border-2 border-outline-variant rounded-lg p-5 border-l-4 border-l-primary">
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Field Employees</span>
              <span className="material-symbols-outlined text-primary">hard_hat</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">{totalEmployees}</div>
            <div className="text-xs text-on-surface-variant mt-1">Hazard reporters & field crews</div>
          </div>

          <div className="bg-surface border-2 border-outline-variant rounded-lg p-5 border-l-4 border-l-secondary">
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Safety Officers</span>
              <span className="material-symbols-outlined text-secondary">shield_person</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">{totalOfficers}</div>
            <div className="text-xs text-on-surface-variant mt-1">Triage review & verification officers</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-surface border-2 border-outline-variant rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, username, site, or crew..."
              className="w-full h-11 pl-11 pr-4 border-2 border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Role Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden sm:inline">Role:</span>
            <div className="flex bg-surface-container-low border-2 border-outline-variant rounded-lg p-1 w-full md:w-auto">
              <button
                onClick={() => setRoleFilter("all")}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${
                  roleFilter === "all" ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter("employee")}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${
                  roleFilter === "employee" ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Employees ({totalEmployees})
              </button>
              <button
                onClick={() => setRoleFilter("officer")}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${
                  roleFilter === "officer" ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Officers ({totalOfficers})
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface border-2 border-outline-variant rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b-2 border-outline-variant text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Username / ID</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Site Location</th>
                  <th className="py-3.5 px-4">Assigned Crew</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-surface-container-highest text-sm text-on-surface">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                      <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        <span>Loading user directory...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">person_off</span>
                      No user accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                        {/* Name & Avatar */}
                        <td className="py-4 px-4 font-semibold">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                                u.role === "officer"
                                  ? "bg-secondary-container text-on-secondary-container"
                                  : "bg-primary-container text-on-primary-container"
                              }`}
                            >
                              {u.displayName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-on-surface flex items-center gap-1.5">
                                {u.displayName}
                                {isSelf && (
                                  <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-1.5 py-0.2 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Username */}
                        <td className="py-4 px-4 font-mono text-xs text-on-surface-variant">
                          @{u.username}
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border ${
                              u.role === "officer"
                                ? "bg-secondary-fixed text-on-secondary-fixed-variant border-secondary/30"
                                : "bg-primary-fixed text-on-primary-fixed-variant border-primary/30"
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">
                              {u.role === "officer" ? "shield_person" : "hard_hat"}
                            </span>
                            {u.role === "officer" ? "Safety Officer" : "Field Employee"}
                          </span>
                        </td>

                        {/* Site */}
                        <td className="py-4 px-4 text-on-surface-variant font-medium">
                          {u.site || "All Sites"}
                        </td>

                        {/* Crew */}
                        <td className="py-4 px-4 text-on-surface-variant">
                          {u.crew || "—"}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              title="Edit user details or reset password"
                              className="h-8 px-3 border border-outline-variant bg-surface hover:bg-surface-container-high rounded text-xs font-bold text-on-surface flex items-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-xs">edit</span>
                              Edit
                            </button>

                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                title="Delete user account"
                                className="h-8 px-2.5 border border-error/30 text-error hover:bg-error-container hover:text-on-error-container rounded text-xs font-bold flex items-center transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── ADD USER MODAL ─────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface w-full max-w-lg rounded-xl border-2 border-outline-variant shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#03224D] text-white px-6 py-4 flex items-center justify-between border-b-2 border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">person_add</span>
                <h2 className="text-base font-bold uppercase tracking-wider">Create Authorized Account</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white material-symbols-outlined text-xl"
              >
                close
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4">
              {actionError && (
                <div className="bg-error-container border border-error text-on-error-container p-3 rounded text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {actionError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Full Name / Employee Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Bora"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full h-11 px-3.5 border-2 border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Username / ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. r.bora"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full h-11 px-3.5 border-2 border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-11 px-3.5 border-2 border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  System Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "employee" })}
                    className={`p-3 rounded-lg border-2 text-left flex items-center gap-2.5 transition-colors ${
                      formData.role === "employee"
                        ? "border-primary bg-primary-fixed text-on-primary-fixed"
                        : "border-outline-variant bg-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary text-xl">hard_hat</span>
                    <div>
                      <div className="text-xs font-bold">Field Employee</div>
                      <div className="text-[10px] opacity-75">Hazard reporting & alerts</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "officer" })}
                    className={`p-3 rounded-lg border-2 text-left flex items-center gap-2.5 transition-colors ${
                      formData.role === "officer"
                        ? "border-secondary bg-secondary-fixed text-on-secondary-fixed"
                        : "border-outline-variant bg-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <span className="material-symbols-outlined text-secondary text-xl">shield_person</span>
                    <div>
                      <div className="text-xs font-bold">Safety Officer</div>
                      <div className="text-[10px] opacity-75">Triage, barriers & tickets</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Site & Crew */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Assigned Site
                  </label>
                  <select
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    className="w-full h-11 px-3 border-2 border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:outline-none"
                  >
                    {AVAILABLE_SITES.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Assigned Crew
                  </label>
                  <select
                    value={formData.crew}
                    onChange={(e) => setFormData({ ...formData, crew: e.target.value })}
                    className="w-full h-11 px-3 border-2 border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:outline-none"
                  >
                    {AVAILABLE_CREWS.map((crew) => (
                      <option key={crew} value={crew}>
                        {crew}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-outline-variant mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-11 border-2 border-outline-variant rounded-lg text-xs font-bold uppercase hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 bg-primary text-on-primary rounded-lg text-xs font-bold uppercase hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  ) : (
                    "Create User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT USER MODAL ─────────────────────────────────────── */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface w-full max-w-lg rounded-xl border-2 border-outline-variant shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#03224D] text-white px-6 py-4 flex items-center justify-between border-b-2 border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">manage_accounts</span>
                <h2 className="text-base font-bold uppercase tracking-wider">
                  Edit User: @{editingUser.username}
                </h2>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/80 hover:text-white material-symbols-outlined text-xl"
              >
                close
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 flex flex-col gap-4">
              {actionError && (
                <div className="bg-error-container border border-error text-on-error-container p-3 rounded text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {actionError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.displayName}
                  onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                  className="w-full h-11 px-3.5 border-2 border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: "employee" })}
                    className={`p-3 rounded-lg border-2 text-left flex items-center gap-2.5 transition-colors ${
                      editFormData.role === "employee"
                        ? "border-primary bg-primary-fixed text-on-primary-fixed"
                        : "border-outline-variant bg-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary text-xl">hard_hat</span>
                    <div>
                      <div className="text-xs font-bold">Field Employee</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: "officer" })}
                    className={`p-3 rounded-lg border-2 text-left flex items-center gap-2.5 transition-colors ${
                      editFormData.role === "officer"
                        ? "border-secondary bg-secondary-fixed text-on-secondary-fixed"
                        : "border-outline-variant bg-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <span className="material-symbols-outlined text-secondary text-xl">shield_person</span>
                    <div>
                      <div className="text-xs font-bold">Safety Officer</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Site & Crew */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Assigned Site
                  </label>
                  <select
                    value={editFormData.site}
                    onChange={(e) => setEditFormData({ ...editFormData, site: e.target.value })}
                    className="w-full h-11 px-3 border-2 border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:outline-none"
                  >
                    {AVAILABLE_SITES.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Assigned Crew
                  </label>
                  <select
                    value={editFormData.crew}
                    onChange={(e) => setEditFormData({ ...editFormData, crew: e.target.value })}
                    className="w-full h-11 px-3 border-2 border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:outline-none"
                  >
                    {AVAILABLE_CREWS.map((crew) => (
                      <option key={crew} value={crew}>
                        {crew}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset Password Optional */}
              <div className="bg-surface-container-low p-3.5 rounded-lg border border-outline-variant">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Reset Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={editFormData.newPassword}
                  onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                  className="w-full h-10 px-3 border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-outline-variant mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 h-11 border-2 border-outline-variant rounded-lg text-xs font-bold uppercase hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 bg-primary text-on-primary rounded-lg text-xs font-bold uppercase hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
