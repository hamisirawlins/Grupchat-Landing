import React, { useEffect, useState } from 'react';

export default function InviteTokenPage({ token }) {
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function validate() {
      setLoading(true);
      setError(null);
      setInvitation(null);
      try {
        const res = await fetch('https://api.grupchat.info/notificationsinvitation/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.valid) {
          setInvitation(data.invitation);
        } else {
          setError(data.reason || 'Invalid or expired invitation.');
        }
      } catch (e) {
        setError('Error validating invitation.');
      } finally {
        setLoading(false);
      }
    }
    validate();
  }, [token]);

  function openApp() {
    window.location.href = `grupchat://invite/${token}`;
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem' }}>
      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <div className="loader" />
          <p>Validating invitation...</p>
        </div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center' }}>
          <h2>Invitation Error</h2>
          <p>{error}</p>
        </div>
      ) : invitation ? (
        <div style={{ textAlign: 'center' }}>
          <img src="/logos/logo-clear.png" alt="GrupChat Logo" style={{ height: '60px', marginBottom: '16px' }} />
          <h2>You're invited to join {invitation.poolName}!</h2>
          <p>Invited by: <b>{invitation.inviterName}</b></p>
          {invitation.expiresAt && (
            <p style={{ color: '#b91c1c' }}>Expires: {new Date(invitation.expiresAt).toLocaleString()}</p>
          )}
          <button style={{ margin: '24px 0', padding: '12px 32px', background: '#fbbf24', color: '#222', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }} onClick={openApp}>
            Open in GrupChat App
          </button>
          <div style={{ marginTop: '16px' }}>
            <a href="https://play.google.com/apps/testing/com.grupchat" target="_blank" rel="noopener">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" style={{ height: '40px', marginRight: '8px' }} />
            </a>
          </div>
          <p style={{ fontSize: '12px', color: '#aaa', marginTop: '24px' }}>
            If you have the app installed, the link above will open it. Otherwise, download GrupChat from the Play Store.
          </p>
        </div>
      ) : null}
    </div>
  );
} 