import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

// API base: prefer VITE_API_URL; in development fallback to relative path '' so Vite dev proxy works;
// in production default to the admin domain.
const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://admin.parnanzonehomes.com');

export default function AdminsManager() {
  const { token } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch admins');
      setAdmins(data);
    } catch (e) {
      console.error(e);
      setAdmins([]);
    } finally { setLoading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await fetch(`${API}/api/admin/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password || undefined })
        });
        if (!res.ok) {
          const body = await res.json(); throw new Error(body.error || 'Update failed');
        }
      } else {
        const res = await fetch(`${API}/api/admin/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
        });
        if (!res.ok) {
          const body = await res.json(); throw new Error(body.error || 'Create failed');
        }
      }
      setForm({ name: '', email: '', password: '' });
      setEditingId(null);
      fetchAdmins();
    } catch (e) {
      alert(e.message);
    }
  };

  const onEdit = (a) => {
    setEditingId(a._id || a.id);
    setForm({ name: a.name || '', email: a.email || '', password: '' });
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this admin? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API}/api/admin/${id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (!res.ok) {
        const body = await res.json(); throw new Error(body.error || 'Delete failed');
      }
      fetchAdmins();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h3 className="text-lg font-bold mb-4">Admin Accounts</h3>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <input className="px-3 py-2 border rounded" placeholder="Full name" value={form.name} onChange={e=>setForm(prev=>({...prev,name:e.target.value}))} required />
          <input className="px-3 py-2 border rounded" placeholder="Email" type="email" value={form.email} onChange={e=>setForm(prev=>({...prev,email:e.target.value}))} required />
          <input className="px-3 py-2 border rounded" placeholder="Password" type="password" value={form.password} onChange={e=>setForm(prev=>({...prev,password:e.target.value}))} />
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-black text-white rounded" type="submit">{editingId ? 'Update' : 'Create'}</button>
            {editingId && <button type="button" onClick={()=>{setEditingId(null);setForm({name:'',email:'',password:''})}} className="px-4 py-2 border rounded">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <h4 className="font-semibold mb-4">Existing Admins</h4>
        {loading ? <div>Loading...</div> : (
          <div className="space-y-3">
            {admins.map(a => (
              <div key={a._id || a.id} className="flex items-center justify-between border p-3 rounded">
                <div>
                  <div className="font-medium">{a.name || '—'}</div>
                  <div className="text-sm text-gray-500">{a.email}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={()=>onEdit(a)} className="px-3 py-1 border rounded">Edit</button>
                  <button onClick={()=>onDelete(a._id || a.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
