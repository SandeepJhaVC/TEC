// src/components/EventsPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AddToCalendarButton } from 'add-to-calendar-button-react';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('start_time', { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error.message);
      } finally {
        setLoading(false);
      }
    };

    getEvents();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '80px', color: '#8b949e', fontFamily: 'var(--font)' }}>Loading events...</div>;
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 20px 80px', background: '#0d1117', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#e6edf3', marginBottom: 4, fontFamily: '"Mona Sans", var(--font)' }}>Upcoming Events</h1>
      <p style={{ color: '#8b949e', marginBottom: 32, fontSize: 14 }}>Campus events near you — add to your calendar.</p>
      {events.length === 0 ? (
        <p style={{ color: '#8b949e', padding: '40px 0' }}>No upcoming events found.</p>
      ) : (
        <div>
          {events.map((event) => (
            <div key={event.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '24px', marginBottom: '16px' }}>
              <h2 style={{ marginTop: 0, color: '#e6edf3', fontSize: 18, fontWeight: 700 }}>{event.title}</h2>
              <p style={{ color: '#8b949e', fontSize: 13 }}><strong style={{ color: '#58a6ff' }}>When:</strong> {formatDate(event.start_time)}</p>
              <p style={{ color: '#8b949e', fontSize: 13 }}><strong style={{ color: '#58a6ff' }}>Where:</strong> {event.location}</p>
              <p style={{ color: '#8b949e', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{event.description}</p>

              {/* The magic button! */}
              <AddToCalendarButton
                name={event.title}
                description={event.description}
                startDate={event.start_time.split('T')[0]}
                endDate={event.end_time.split('T')[0]}
                startTime={event.start_time.split('T')[1].substring(0, 5)}
                endTime={event.end_time.split('T')[1].substring(0, 5)}
                timeZone="Asia/Kolkata" // Set to your event's timezone
                location={event.location}
                options={['Apple', 'Google', 'Outlook.com']}
                buttonStyle="round"
                styleLight="--btn-background: #1de9b6; --btn-text: #222;"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;