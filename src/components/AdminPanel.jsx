import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Activity, Eye, TrendingUp } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Connecting your database!

const AdminPanel = () => {
  // We start at 0 while the data loads
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    totalVisits: 0
  });

  // We will make this chart dynamic later, keeping it static for now so the design stays intact
  const chartData = [
    { name: 'Mon', users: 2 },
    { name: 'Tue', users: 5 },
    { name: 'Wed', users: 3 },
    { name: 'Thu', users: 8 },
    { name: 'Fri', users: 4 },
    { name: 'Sat', users: 7 },
    { name: 'Sun', users: 9 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Ask Supabase for the total number of users
        // Note: Assuming your user table is called 'profiles'. 
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // 2. Ask Supabase for the total number of active listings
        // Note: Assuming your listings table is called 'listings'.
        const { count: listingsCount, error: listingsError } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true });

        // 3. Update the dashboard with the real numbers!
        setStats({
          totalUsers: usersCount || 0,
          activeListings: listingsCount || 0,
          totalVisits: 1205 // Page views usually require a separate analytics tool, so we leave this static for now
        });

      } catch (err) {
        console.log("Error fetching data. Database tables might not be set up yet.");
      }
    };

    fetchDashboardData();
  }, []); // The empty brackets mean this runs once when the dashboard loads

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', paddingTop: '80px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Admin Dashboard</h1>
      
      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, color: '#666' }}>Total Users</h3>
            <Users size={24} color="#0088FE" />
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{stats.totalUsers}</p>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, color: '#666' }}>Active Listings</h3>
            <Activity size={24} color="#00C49F" />
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{stats.activeListings}</p>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, color: '#666' }}>Page Views</h3>
            <Eye size={24} color="#FFBB28" />
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{stats.totalVisits}</p>
        </div>
      </div>

      {/* Analytics Chart */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={20} /> New Users This Week
        </h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#0088FE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 










