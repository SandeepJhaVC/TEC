import React, { useState } from 'react';

const initialMembers = [
  {
    id: 'M2K8N9',
    name: 'Tanvi Saini',
    joinDate: 'Aug 2025',
    status: 'Active Member',
    certificates: [
      {
        name: 'Certificate of Excellence',
        file: '/dummy-certificate.pdf',
      },
      {
        name: 'Tech Symposium 2025',
        file: '/dummy-certificate.pdf',
      },
    ],
    tagline: 'For those who echo change.'
  },
  // Add more members as needed
];

const emptyMember = {
  id: '',
  name: '',
  joinDate: '',
  status: '',
  certificates: [],
  tagline: '',
};

const AdminPanel = () => {
  const [members, setMembers] = useState(initialMembers);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(emptyMember);
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCertChange = (e) => {
    // Certificates as comma-separated names
    const certNames = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setForm({
      ...form,
      certificates: certNames.map(name => ({ name, file: '/dummy-certificate.pdf' })),
    });
  };

  const handleAdd = () => {
    setForm(emptyMember);
    setEditingIndex(null);
    setShowForm(true);
  };

  const handleEdit = (idx) => {
    setForm({
      ...members[idx],
      certificates: members[idx].certificates.map(c => c.name).join(', '),
    });
    setEditingIndex(idx);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const certNames = typeof form.certificates === 'string'
      ? form.certificates.split(',').map(s => s.trim()).filter(Boolean)
      : form.certificates;
    const memberData = {
      ...form,
      certificates: certNames.map(name => ({ name, file: '/dummy-certificate.pdf' })),
    };
    if (editingIndex !== null) {
      // Edit
      const updated = [...members];
      updated[editingIndex] = memberData;
      setMembers(updated);
    } else {
      // Add
      setMembers([...members, memberData]);
    }
    setShowForm(false);
    setForm(emptyMember);
    setEditingIndex(null);
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, background: '#f5f5f5', borderRadius: 12 }}>
      <h2>Admin Panel</h2>
      <button onClick={handleAdd} style={{ marginBottom: 20, padding: '8px 16px', borderRadius: 6, background: '#1de9b6', border: 'none', color: '#222', fontWeight: 'bold' }}>Add New Member</button>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ background: '#e0f7fa' }}>
            <th>Name</th>
            <th>Member ID</th>
            <th>Join Date</th>
            <th>Status</th>
            <th>Certificates</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, idx) => (
            <tr key={m.id} style={{ background: idx % 2 ? '#fff' : '#e0f7fa' }}>
              <td>{m.name}</td>
              <td>{m.id}</td>
              <td>{m.joinDate}</td>
              <td>{m.status}</td>
              <td>{m.certificates.map(c => c.name).join(', ')}</td>
              <td>
                <button onClick={() => handleEdit(idx)} style={{ padding: '4px 12px', borderRadius: 4, background: '#ffd600', border: 'none', color: '#222', fontWeight: 'bold' }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #ccc', marginBottom: 24 }}>
          <h3>{editingIndex !== null ? 'Edit Member' : 'Add Member'}</h3>
          <div style={{ marginBottom: 12 }}>
            <label>Name: <input name="name" value={form.name} onChange={handleInputChange} required style={{ marginLeft: 8 }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Member ID: <input name="id" value={form.id} onChange={handleInputChange} required style={{ marginLeft: 8 }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Join Date: <input name="joinDate" value={form.joinDate} onChange={handleInputChange} required style={{ marginLeft: 8 }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Status: <input name="status" value={form.status} onChange={handleInputChange} required style={{ marginLeft: 8 }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Certificates (comma separated): <input name="certificates" value={typeof form.certificates === 'string' ? form.certificates : form.certificates.map(c => c.name).join(', ')} onChange={handleCertChange} style={{ marginLeft: 8, width: 220 }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Tagline: <input name="tagline" value={form.tagline} onChange={handleInputChange} style={{ marginLeft: 8, width: 220 }} /></label>
          </div>
          <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, background: '#1de9b6', border: 'none', color: '#222', fontWeight: 'bold', marginRight: 12 }}>Save</button>
          <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', borderRadius: 6, background: '#ff4081', border: 'none', color: '#fff', fontWeight: 'bold' }}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default AdminPanel; 