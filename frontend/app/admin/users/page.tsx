'use client';

import { useEffect, useState } from 'react';
import { userApi, externalApi } from '@/lib/api';
import { useNotificationStore } from '@/lib/store';
import { 
  Users, 
  Search, 
  Loader2, 
  Edit, 
  Trash2, 
  ShieldAlert, 
  Save, 
  X, 
  Trophy, 
  Globe,
  Ban,
  UserCheck,
  Filter,
  Calendar,
  AlertCircle,
  Clock,
  Shield,
  UserMinus
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  points: number;
  country?: string;
  status: 'ACTIVE' | 'BANNED' | 'TEMP_BANNED';
  bannedUntil?: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { addNotification } = useNotificationStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await userApi.getUsers();
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const { data } = await externalApi.getCountries();
      setCountries(data.sort((a: any, b: any) => a.name.common.localeCompare(b.name.common)));
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCountries();
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('PROTOCOL_WARNING: Irreversible user deletion requested. Proceed?')) return;
    try {
      await userApi.deleteUser(id);
      addNotification({ type: 'success', message: 'USER_TERMINATED: Account purged.' });
      fetchUsers();
    } catch (error: any) {
      addNotification({ type: 'error', message: error.response?.data?.error || 'DELETE_FAILED.' });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);

    try {
      await userApi.updateUser(editingUser.id, {
        role: editingUser.role,
        points: editingUser.points,
        country: editingUser.country,
        status: editingUser.status,
        bannedUntil: editingUser.status === 'TEMP_BANNED' ? editingUser.bannedUntil : null,
      });
      addNotification({ type: 'success', message: 'USER_UPDATED: Privileges/Stats synchronized.' });
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      addNotification({ type: 'error', message: 'UPDATE_FAILED: System rejection.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-500 font-mono text-xs mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>/root/admin/operator_control</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-purple-500">Personnel_Management</h1>
          <p className="text-muted-foreground max-w-2xl font-medium">
            Monitor and manage active system operators. Enforce security protocols, adjust clearance levels, and execute account restrictions.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            placeholder="LOCATE_OPERATOR_BY_IDENTITY..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d0e12] border border-purple-500/10 rounded-xl pl-12 h-12 text-sm font-mono text-purple-500 focus:outline-none focus:border-purple-500/30 transition-all"
          />
        </div>

        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-[#0d0e12] border border-purple-500/10 rounded-xl px-4 h-12 text-xs font-bold text-purple-500/60 uppercase tracking-widest appearance-none cursor-pointer focus:border-purple-500/30 focus:text-purple-500 outline-none"
          >
            <option value="ALL">All_Roles</option>
            <option value="USER">User_Operators</option>
            <option value="ADMIN">Root_Admins</option>
          </select>
          <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/20 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#0d0e12] border border-purple-500/10 rounded-xl px-4 h-12 text-xs font-bold text-purple-500/60 uppercase tracking-widest appearance-none cursor-pointer focus:border-purple-500/30 focus:text-purple-500 outline-none"
          >
            <option value="ALL">All_Statuses</option>
            <option value="ACTIVE">Active_Only</option>
            <option value="BANNED">Terminated</option>
            <option value="TEMP_BANNED">Suspended</option>
          </select>
          <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/20 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-purple-500 font-mono text-xs tracking-widest animate-pulse">RETRIVING_OPERATOR_REGISTRY...</p>
        </div>
      ) : (
        <div className="htb-card p-0 overflow-hidden border-purple-500/10 shadow-2xl">
          <table className="w-full">
            <thead>
              <tr className="bg-purple-500/5 border-b border-purple-500/10">
                <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Operator</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Clearance</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Points</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Status</th>
                <th className="text-right py-4 px-6 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`hover:bg-purple-500/5 transition-colors group ${user.status !== 'ACTIVE' ? 'opacity-60 bg-red-950/5' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-htb-border text-sm font-bold transition-colors ${user.status === 'BANNED' ? 'bg-red-600 text-white border-red-500' : 'bg-secondary text-purple-500 group-hover:border-purple-500/30'}`}>
                          {user.username[0].toUpperCase()}
                       </div>
                       <div>
                          <div className={`font-bold text-sm uppercase tracking-tight group-hover:text-purple-500 transition-colors ${user.status === 'BANNED' ? 'line-through text-red-500' : ''}`}>{user.username}</div>
                          <div className="text-[10px] font-mono text-muted-foreground lowercase">{user.email}</div>
                       </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${
                      user.role === 'ADMIN' ? 'bg-purple-500/10 border-purple-500/30 text-purple-500' : 'bg-muted border-htb-border text-muted-foreground'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                       <Trophy className="w-3 h-3 text-purple-500/50" />
                       <span className="font-mono text-sm font-bold">{user.points}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                       {user.status === 'ACTIVE' ? (
                         <div className="flex items-center gap-1.5 text-green-500 text-[9px] font-bold uppercase">
                            <UserCheck className="w-3.5 h-3.5" /> Operational
                         </div>
                       ) : user.status === 'BANNED' ? (
                         <div className="flex items-center gap-1.5 text-red-600 text-[9px] font-bold uppercase">
                            <Ban className="w-3.5 h-3.5" /> Terminated
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 text-yellow-500 text-[9px] font-bold uppercase">
                            <Clock className="w-3.5 h-3.5" /> Suspended
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 bg-secondary border border-border rounded-lg hover:border-purple-500/50 hover:text-purple-500 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 bg-secondary border border-border rounded-lg hover:border-purple-500/50 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="htb-card max-w-lg w-full border-purple-500/30 shadow-purple-500/10 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                    <Shield className="w-5 h-5 text-purple-500" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-purple-500">Operator_Access</h2>
                    <p className="text-[10px] font-mono text-purple-500/60 uppercase tracking-widest leading-none">Security_Override_Console</p>
                 </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors">
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Clearance_Level</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50 focus:text-purple-500"
                  >
                    <option value="USER">USER_OPERATOR</option>
                    <option value="ADMIN">ROOT_ADMINISTRATOR</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Account_Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="htb-input h-12 border-purple-500/10 bg-background focus:border-purple-500/50 focus:text-purple-500"
                  >
                    <option value="ACTIVE">ACTIVE_OPERATIONAL</option>
                    <option value="BANNED">PERMANENT_TERMINATION</option>
                    <option value="TEMP_BANNED">TEMPORARY_SUSPENSION</option>
                  </select>
                </div>
              </div>

              {editingUser.status === 'TEMP_BANNED' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Suspension_Expiry</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40" />
                    <input
                      type="datetime-local"
                      value={editingUser.bannedUntil ? new Date(editingUser.bannedUntil).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditingUser({ ...editingUser, bannedUntil: e.target.value })}
                      className="htb-input h-12 pl-12 border-purple-500/10 bg-background focus:border-purple-500/50"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Credit_Balance</label>
                  <div className="relative group">
                    <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40" />
                    <input
                      type="number"
                      value={editingUser.points}
                      onChange={(e) => setEditingUser({ ...editingUser, points: parseInt(e.target.value) })}
                      className="htb-input h-12 pl-12 font-mono border-purple-500/10 bg-background focus:border-purple-500/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Regional_Assignment</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500/40" />
                    <select
                      value={editingUser.country || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, country: e.target.value })}
                      className="htb-input h-12 pl-12 border-purple-500/10 bg-background focus:border-purple-500/50"
                    >
                      <option value="">NOT_ASSIGNED</option>
                      {countries.map((c) => (
                        <option key={c.cca2} value={c.cca2}>{c.name.common}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 htb-button-secondary border-purple-500/10 hover:bg-purple-500/5 text-purple-500 uppercase"
                >
                  Abort_Transaction
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 htb-button-primary bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/20 uppercase"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Commit_Status</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
