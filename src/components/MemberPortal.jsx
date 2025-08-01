import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Import the Supabase client

const MemberPortal = () => {
  const [memberId, setMemberId] = useState('');
  const [member, setMember] = useState(null);
  const [error, setError] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(false); // Add a loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMember(null);
    setError('');

    try {
      // Fetch data from the 'members' table in Supabase
      const { data, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId.trim().toUpperCase()) // Ensure ID case matches what's in DB
        .single(); // .single() returns one object or null

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows were found, which we handle as "Member not found"
        throw fetchError;
      }
      
      if (data) {
        setMember(data);
      } else {
        setError('Member not found. Please check your Member ID.');
      }
    } catch (err) {
      setError('An error occurred while fetching data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCertClick = (cert) => {
    // For a real app, you'd get a public URL from Supabase Storage
    // For example: const { data } = supabase.storage.from('certificates').getPublicUrl(cert.file);
    setSelectedCert(cert);
  };

  const handleCloseModal = () => {
    setSelectedCert(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
      <h2>Member Portal</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Enter your Member ID"
          value={memberId}
          onChange={e => setMemberId(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', marginRight: 8 }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', borderRadius: 6, background: '#1de9b6', border: 'none', color: '#222', fontWeight: 'bold' }}>
          {loading ? 'Checking...' : 'Check Details'}
        </button>
      </form>
      {error && <div style={{ color: 'crimson', marginBottom: 16 }}>{error}</div>}
      
      {/* The rest of your component's JSX remains the same */}
      {member && (
        <div style={{
          border: '2px solid #1de9b6',
          borderRadius: 12,
          padding: 28,
          minWidth: 340,
          background: '#101c1c',
          color: '#1de9b6',
          fontFamily: 'monospace',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}>
          {/* ... Your existing member card JSX ... */}
           <div style={{ marginBottom: 8, fontWeight: 'bold', fontSize: 18 }}>
            TEC/25 ★ {member.id} ★ ECHO
          </div>
          <div style={{ margin: '16px 0' }}>
            <div style={{ color: '#ffb300', marginBottom: 4 }}>🧑‍💻 <span style={{ color: '#ff4081' }}>Name:</span> <span style={{ color: '#fff' }}>{member.name}</span></div>
            <div style={{ color: '#00bcd4', marginBottom: 4 }}>🔗 <span style={{ color: '#ff4081' }}>Join Date:</span> <span style={{ color: '#fff' }}>{member.joined_at}</span></div>
            <div style={{ color: '#00e676', marginBottom: 4 }}>🪪 <span style={{ color: '#ff4081' }}>Status:</span> <span style={{ color: '#fff' }}>{member.status}</span></div>
            <div style={{ color: '#ffd600', marginBottom: 4 }}>
              📜 <span style={{ color: '#ff4081' }}>Certificates:</span> {' '}
              <span style={{ color: '#fff' }}>
                {member.certificates.length > 0 ? (
                  member.certificates.map((cert, idx) => (
                    <span key={idx}>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1de9b6',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          marginRight: 8,
                        }}
                        onClick={() => handleCertClick(cert)}
                        type="button"
                      >
                        {cert.name}
                      </button>
                    </span>
                  ))
                ) : 'None yet'}
              </span>
            </div>
          </div>
          <div style={{ color: '#1de9b6', marginTop: 16, fontStyle: 'italic', fontSize: 15 }}>
            {member.tagline}
          </div>
        </div>
      )}
      {/* ... Your existing modal JSX ... */}
      {selectedCert && (
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
            minWidth: 320,
            textAlign: 'center',
            position: 'relative',
          }}>
            <h3>{selectedCert.name}</h3>
            <div style={{ margin: '24px 0' }}>
              <div style={{
                width: 260,
                height: 180,
                background: '#e0f7fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                margin: '0 auto',
                fontSize: 18,
                color: '#00838f',
                fontWeight: 'bold',
              }}>
                Certificate Preview
              </div>
            </div>
            <a
              href={selectedCert.file} // This would be a public URL from Supabase Storage
              download={selectedCert.name.replace(/\s+/g, '_') + '.pdf'}
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                background: '#1de9b6',
                color: '#222',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 'bold',
                marginRight: 12,
              }}
            >
              Download PDF
            </a>
            <button
              onClick={handleCloseModal}
              style={{
                padding: '10px 24px',
                background: '#ff4081',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberPortal;