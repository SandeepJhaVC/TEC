import React from 'react';

const footerStyle = {
  background: '#101c1c',
  color: '#1de9b6',
  padding: '32px 0 16px 0',
  textAlign: 'center',
  fontFamily: 'monospace',
  marginTop: 40,
};

const linkStyle = {
  color: '#1de9b6',
  margin: '0 18px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: 16,
};

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>
        The Echo Community (TEC)
      </div>
      <div style={{ marginBottom: 12 }}>
        <a href="/#about" style={linkStyle}>About</a>
        <a href="/#projects" style={linkStyle}>Projects</a>
        <a href="/#partners" style={linkStyle}>Partners</a>
        <a href="/member" style={linkStyle}>Members</a>
      </div>
      <div style={{ fontSize: 14, color: '#fff', opacity: 0.7 }}>
        &copy; {new Date().getFullYear()} The Echo Community. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;