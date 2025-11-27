'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function TestPage() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('test').select('*');

      if (error) {
        setStatus('✅ Connected to Supabase!');
        setMessage(`(${error.message} - this is normal, table does not exist yet)`);
      } else {
        setStatus('✅ Success! Supabase is working');
        setMessage(JSON.stringify(data));
      }
    } catch (err) {
      setStatus('❌ Connection failed');
      setMessage('Check your .env.local file and Supabase keys.');
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>🧪 Jotter - Supabase Test</h1>

      <button
        onClick={testConnection}
        style={{
          padding: '15px 30px',
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Test Supabase Connection
      </button>

      {status && (
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            background: '#000',
            borderRadius: '5px'
          }}
        >
          <h2>{status}</h2>
          <p style={{ wordBreak: 'break-all' }}>{message}</p>
        </div>
      )}
    </div>
  );
}
