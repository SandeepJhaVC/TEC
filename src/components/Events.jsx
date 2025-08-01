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
    return <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading events...</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <h1>Upcoming Events</h1>
      {events.length === 0 ? (
        <p>No upcoming events found.</p>
      ) : (
        <div>
          {events.map((event) => (
            <div key={event.id} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ marginTop: 0 }}>{event.title}</h2>
              <p><strong>When:</strong> {formatDate(event.start_time)}</p>
              <p><strong>Where:</strong> {event.location}</p>
              <p>{event.description}</p>

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
                options={['Apple','Google','Outlook.com']}
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