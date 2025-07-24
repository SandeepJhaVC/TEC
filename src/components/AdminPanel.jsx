import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Make sure this path is correct

// ADDED: New fields to match the schema
const emptyMember = {
  name: '',
  joined_at: null,
  status: 'Active Member',
  certificates: [],
  sap_id: '',
  pers_email: '',
  clg_email: '',
  batch: '',
  year: '',
  course: '',
};

const AdminPanel = () => {
  const [members, setMembers] = useState([]);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [form, setForm] = useState(emptyMember);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMembers();
  }, []);

  const getMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCertChange = (e) => {
    setForm({ ...form, certificates: e.target.value });
  };

  const handleAdd = () => {
    setForm(emptyMember);
    setEditingMemberId(null);
    setShowForm(true);
  };

  const handleEdit = (member) => {
    const certString = member.certificates.join(', ');
    setForm({ ...member, certificates: certString });
    setEditingMemberId(member.id);
    setShowForm(true);
  };
  
  const handleDelete = async (memberId) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        const { error } = await supabase.from('members').delete().eq('id', memberId);
        if (error) throw error;
        getMembers();
      } catch (error) {
        console.error("Error deleting member:", error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const certNames = typeof form.certificates === 'string'
      ? form.certificates.split(',').map(s => s.trim()).filter(Boolean)
      : [];
      
    // ADDED: New fields to the payload sent to Supabase
    const payload = {
      name: form.name,
      status: form.status,
      certificates: certNames,
      sap_id: form.sap_id,
      pers_email: form.pers_email,
      clg_email: form.clg_email,
      batch: form.batch,
      year: form.year,
      course: form.course,
    };

    if (editingMemberId) {
      payload.joined_at = form.joined_at;
    }

    try {
      let error;
      if (editingMemberId) {
        ({ error } = await supabase.from('members').update(payload).eq('id', editingMemberId));
      } else {
        ({ error } = await supabase.from('members').insert([payload]));
      }
      
      if (error) throw error;
      getMembers();
      setShowForm(false);
      setForm(emptyMember);
      setEditingMemberId(null);
    } catch (error) {
        alert(error.message);
        console.error("Error saving member:", error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      timeZone: 'UTC', // Handle date as UTC to avoid timezone shifts
      month: 'short', year: 'numeric', day: 'numeric'
    });
  };

  if (loading) return <div>Loading members...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: 24, background: '#f5f5f5', borderRadius: 12 }}>
      {/* <h2>Admin Panel</h2> */}
      <button onClick={handleAdd} style={{ marginBottom: 20, padding: '8px 16px', borderRadius: 6, background: '#1de9b6', border: 'none', color: '#222', fontWeight: 'bold', marginRight: 12 }}>Add New Member</button>
      
      <div style={{overflowX: 'auto'}}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#e0f7fa' }}>
              <th style={{padding: 8}}>ID</th>
              <th style={{padding: 8}}>Name</th>
              <th style={{padding: 8}}>SAP ID</th>
              <th style={{padding: 8}}>Course</th>
              <th style={{padding: 8}}>Joined At</th>
              <th style={{padding: 8}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
                <td style={{padding: 8}}>{m.id}</td>
                <td style={{padding: 8}}>{m.name}</td>
                <td style={{padding: 8}}>{m.sap_id}</td>
                <td style={{padding: 8}}>{m.course}</td>
                <td style={{padding: 8}}>{formatDate(m.joined_at)}</td>
                <td style={{padding: 8}}>
                  <button onClick={() => handleEdit(m)} style={{ padding: '8px 16px', borderRadius: 6, background: '#1de9b6', border: 'none', color: '#222', fontWeight: 'bold', marginRight: 12 }}>Edit</button>
                  <button onClick={() => handleDelete(m.id)} style={{ padding: '8px 16px', borderRadius: 6, background: '#ccc', border: 'none', color: '#222', fontWeight: 'bold' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <h3 style={{gridColumn: '1 / -1'}}>{editingMemberId ? 'Edit Member' : 'Add Member'}</h3>
          
          {/* Column 1 */}
          <div>
            <div style={{ marginBottom: 12 }}>
              <label>Name: <input name="name" value={form.name} onChange={handleInputChange} required /></label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>SAP ID: <input type="number" name="sap_id" value={form.sap_id} onChange={handleInputChange} /></label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Course: <input name="course" value={form.course} onChange={handleInputChange} /></label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Batch: <input type="number" name="batch" value={form.batch} onChange={handleInputChange} /></label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Year: <input type="number" name="year" value={form.year} onChange={handleInputChange} /></label>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <div style={{ marginBottom: 12 }}>
              <label>Personal Email: <input type="email" name="pers_email" value={form.pers_email} onChange={handleInputChange} /></label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>College Email: <input type="email" name="clg_email" value={form.clg_email} onChange={handleInputChange} /></label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Status: <input name="status" value={form.status} onChange={handleInputChange} required /></label>
            </div>
            {editingMemberId && (
              <div style={{ marginBottom: 12 }}>
                <label>Joined At: <input type="date" name="joined_at" value={form.joined_at || ''} onChange={handleInputChange} required /></label>
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <label>Certificates (comma separated): <input name="certificates" value={form.certificates} onChange={handleCertChange} /></label>
            </div>
          </div>
          
          <div style={{gridColumn: '1 / -1'}}>
            <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, background: '#1de9b6', border: 'none', color: '#222', fontWeight: 'bold', marginRight: 12 }}>Save</button>
          <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', borderRadius: 6, background: '#ccc', border: 'none', color: '#222', fontWeight: 'bold' }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminPanel;