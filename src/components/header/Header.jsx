import './Header.css'
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function generateMemberId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function getCurrentDateString() {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'short' });
  const year = now.getFullYear();
  return `${month} ${year}`;
}

export default function Header() {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        name: '',
        sapId: '',
        personalEmail: '',
        collegeEmail: '',
        batch: '',
        year: '',
        course: '',
        phone: '',
    });
    const [memberId, setMemberId] = useState('');
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const id = generateMemberId();
        // joinDate and status are set automatically
        setMemberId(id);
        setSuccess(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setForm({
            name: '',
            sapId: '',
            personalEmail: '',
            collegeEmail: '',
            batch: '',
            year: '',
            course: '',
            phone: '',
        });
        setMemberId('');
        setSuccess(false);
    };

    return (
        <div className="main header">
            <div className="logo">
                <Link to="/">
                    <img src="/download.jpeg" alt="The Echo Community Logo, TEC logo"/>
                </Link>
            </div>
            <div className="navlinks">
                {/* <a href="#">Certificates</a> */}
                <a href="/#about">About</a>
                <a href="/#projects">Projects</a>
                <a href="#">Partners</a>
                <a href="/member">Members</a>
                <a href="/admin">Admin</a>
            </div>

            <div className="cta">
                <a href="#" onClick={e => { e.preventDefault(); setShowModal(true); }}>Join Us</a>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: '#fff',
                        color: '#222',
                        borderRadius: 10,
                        padding: 32,
                        minWidth: 340,
                        textAlign: 'center',
                        position: 'relative',
                    }}>
                        {!success ? (
                            <form onSubmit={handleSubmit}>
                                <h3>Become a Member</h3>
                                <div style={{ marginBottom: 12 }}>
                                    <input
                                        name="name"
                                        placeholder="Your Name"
                                        value={form.name}
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: 8, width: '90%', borderRadius: 6, border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <input
                                        name="sapId"
                                        placeholder="College SAP ID"
                                        value={form.sapId}
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: 8, width: '90%', borderRadius: 6, border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <input
                                        name="personalEmail"
                                        placeholder="Personal Email"
                                        type="email"
                                        value={form.personalEmail}
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: 8, width: '90%', borderRadius: 6, border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <input
                                        name="collegeEmail"
                                        placeholder="College Email"
                                        type="email"
                                        value={form.collegeEmail}
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: 8, width: '90%', borderRadius: 6, border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <input
                                        name="batch"
                                        placeholder="Batch"
                                        value={form.batch}
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: 8, width: '90%', borderRadius: 6, border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <input
                                        name="year"
                                        placeholder="Year"
                                        value={form.year}
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: 8, width: '90%', borderRadius: 6, border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <input
                                        name="course"
                                        placeholder="Course"
                                        value={form.course}
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: 8, width: '90%', borderRadius: 6, border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <input
                                        name="phone"
                                        placeholder="Phone Number"
                                        type="tel"
                                        value={form.phone}
                                        onChange={handleInputChange}
                                        required
                                        style={{ padding: 8, width: '90%', borderRadius: 6, border: '1px solid #ccc' }}
                                    />
                                </div>
                                <button type="submit" style={{ padding: '10px 24px', background: '#1de9b6', color: '#222', border: 'none', borderRadius: 6, fontWeight: 'bold', marginRight: 12 }}>Join</button>
                                <button type="button" onClick={handleClose} style={{ padding: '10px 24px', background: '#ff4081', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>Cancel</button>
                            </form>
                        ) : (
                            <div>
                                <h3>Welcome, {form.name}!</h3>
                                <p>Your Member ID is:</p>
                                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1de9b6', margin: '16px 0' }}>{memberId}</div>
                                <p>Save this ID to view your details and certificates.</p>
                                <div style={{ margin: '16px 0', textAlign: 'left', fontSize: 14, color: '#333' }}>
                                    <div><b>College SAP ID:</b> {form.sapId}</div>
                                    <div><b>Personal Email:</b> {form.personalEmail}</div>
                                    <div><b>College Email:</b> {form.collegeEmail}</div>
                                    <div><b>Batch:</b> {form.batch}</div>
                                    <div><b>Year:</b> {form.year}</div>
                                    <div><b>Course:</b> {form.course}</div>
                                    <div><b>Phone:</b> {form.phone}</div>
                                    <div><b>Join Date:</b> {getCurrentDateString()}</div>
                                    <div><b>Status:</b> Active Member</div>
                                </div>
                                <button onClick={handleClose} style={{ padding: '10px 24px', background: '#1de9b6', color: '#222', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>Close</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}