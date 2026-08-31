"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

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
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 bg-[#F8FAFC] min-h-screen">
        {/* ─── PAGE HEADER & ACTIONS ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              OIL INDIA LIMITED · ACCESS CONTROL &amp; WORKFORCE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              User &amp; Employee Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create and manage authorized field operators, crew members, and HSE safety officers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActionError("");
                setShowAddModal(true);
              }}
              className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              <span>+ Add User</span>
            </button>
          </div>
        </div>

        {/* Global Action Success Alert */}
        {actionSuccess && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess("")} className="text-xs uppercase font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* ─── 3 SUMMARY STAT CARDS ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Registered Users
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {users.length}
              </div>
              <div className="text-[11px] font-semibold text-blue-600 mt-1">
                Authorized company profiles
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Field Employees
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 3a9 9 0 00-9 9v1a2 2 0 002 2h14a2 2 0 002-2v-1a9 9 0 00-9-9zm-1 3h2v4h-2V6zm-5 8c.36-2.83 2.5-5.11 5.3-5.69.17-.03.35-.05.53-.06.18.01.36.03.53.06 2.8 1.58 4.94 3.86 5.3 5.69H6z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {totalEmployees}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                Frontline hazard reporters
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Safety Officers / Admins
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {totalOfficers}
              </div>
              <div className="text-[11px] font-semibold text-purple-600 mt-1">
                Triage review &amp; verifiers
              </div>
            </div>
          </div>
        </div>

        {/* ─── MAIN USER CATALOG CARD ──────────────────────────── */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Filter Bar */}
            <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A] mr-2">Personnel List</h2>
                <div className="flex bg-[#F1F5F9] p-1 rounded-xl border border-slate-200">
                  {[
                    { key: "all", label: "All Users" },
                    { key: "employee", label: "Employees" },
                    { key: "officer", label: "Officers" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setRoleFilter(tab.key as "all" | "employee" | "officer")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        roleFilter === tab.key
                          ? "bg-white text-[#2563EB] shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, ID, site..."
                  className="w-full h-9 pl-9 pr-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Username / ID</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Site Location</th>
                    <th className="py-3 px-4">Assigned Crew</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Loading user directory...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No user accounts found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelf = currentUser?.id === u.id;
                      const isOfficer = u.role === "officer";

                      return (
                        <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                          {/* User */}
                          <td className="py-3.5 px-4 font-semibold">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                                  isOfficer
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {u.displayName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                                  {u.displayName}
                                  {isSelf && (
                                    <span className="bg-blue-100 text-[#2563EB] text-[9px] font-bold px-1.5 py-0.2 rounded">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Username */}
                          <td className="py-3.5 px-4 font-mono text-slate-500">
                            @{u.username}
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                isOfficer
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isOfficer ? "bg-purple-600" : "bg-blue-600"
                                }`}
                              ></span>
                              {isOfficer ? "Safety Officer" : "Field Employee"}
                            </span>
                          </td>

                          {/* Site */}
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            {u.site || "All Sites"}
                          </td>

                          {/* Crew */}
                          <td className="py-3.5 px-4 text-slate-500">
                            {u.crew || "—"}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(u)}
                                className="h-7 px-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-[11px] font-bold text-slate-700 inline-flex items-center gap-1 shadow-xs transition-colors"
                              >
                                Edit
                              </button>

                              {!isSelf && (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                  className="h-7 px-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-bold transition-colors"
                                  title="Delete user"
                                >
                                  ✕
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

          {/* Table Footer */}
          <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500 bg-[#F8FAFC]/50">
            <div>Showing {filteredUsers.length} of {users.length} users</div>
            <div className="flex items-center gap-1">
              <button disabled className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40">
                ‹
              </button>
              <span className="px-2 font-bold text-slate-700">1 / 1</span>
              <button disabled className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40">
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ADD USER MODAL ─────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#031B3D] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider">Create Authorized Account</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4">
              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold">
                  {actionError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Full Name / Employee Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Bora"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Username / ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. r.bora"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#2563EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  System Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "employee" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.role === "employee"
                        ? "border-[#2563EB] bg-blue-50/70 text-[#2563EB] ring-1 ring-[#2563EB]"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold">Field Employee</div>
                    <div className="text-[10px] text-slate-500">Hazard reporting</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "officer" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.role === "officer"
                        ? "border-purple-600 bg-purple-50/70 text-purple-700 ring-1 ring-purple-600"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold">Safety Officer</div>
                    <div className="text-[10px] text-slate-500">Triage &amp; management</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Assigned Site
                  </label>
                  <select
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#2563EB] focus:outline-none"
                  >
                    {AVAILABLE_SITES.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Assigned Crew
                  </label>
                  <select
                    value={formData.crew}
                    onChange={(e) => setFormData({ ...formData, crew: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#2563EB] focus:outline-none"
                  >
                    {AVAILABLE_CREWS.map((crew) => (
                      <option key={crew} value={crew}>
                        {crew}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 border border-slate-200 rounded-xl text-xs font-bold uppercase hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 bg-[#2563EB] text-white rounded-xl text-xs font-bold uppercase hover:bg-[#1D4ED8] transition-colors shadow-xs"
                >
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT USER MODAL ─────────────────────────────────────── */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#031B3D] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Edit User: @{editingUser.username}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 flex flex-col gap-4">
              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold">
                  {actionError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.displayName}
                  onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: "employee" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editFormData.role === "employee"
                        ? "border-[#2563EB] bg-blue-50 text-[#2563EB] ring-1 ring-[#2563EB]"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold">Field Employee</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, role: "officer" })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editFormData.role === "officer"
                        ? "border-purple-600 bg-purple-50 text-purple-700 ring-1 ring-purple-600"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold">Safety Officer</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Assigned Site
                  </label>
                  <select
                    value={editFormData.site}
                    onChange={(e) => setEditFormData({ ...editFormData, site: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#2563EB] focus:outline-none"
                  >
                    {AVAILABLE_SITES.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Assigned Crew
                  </label>
                  <select
                    value={editFormData.crew}
                    onChange={(e) => setEditFormData({ ...editFormData, crew: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#2563EB] focus:outline-none"
                  >
                    {AVAILABLE_CREWS.map((crew) => (
                      <option key={crew} value={crew}>
                        {crew}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Reset Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password to reset"
                  value={editFormData.newPassword}
                  onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 h-10 border border-slate-200 rounded-xl text-xs font-bold uppercase hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 bg-[#2563EB] text-white rounded-xl text-xs font-bold uppercase hover:bg-[#1D4ED8] transition-colors shadow-xs"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
