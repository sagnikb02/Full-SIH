import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function OnlineStatusPill() {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const containerStyle = {
    gap: '10px',
    padding: '10px 20px',
    borderRadius: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: online
      ? 'rgba(22, 163, 74, 0.18)'        // GREEN when online
      : 'rgba(239, 68, 68, 0.15)',       // original RED when offline
    border: online
      ? '1px solid rgba(22, 163, 74, 0.5)'
      : '1px solid rgba(239, 68, 68, 0.3)',
  };

  const textStyle = {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: online ? '#bbf7d0' : '#fca5a5', // light green vs original pink
  };

  const Icon = online ? Wifi : WifiOff;
  const iconColor = online ? '#4ade80' : '#f87171';

  return (
    <div className="flex-center" style={containerStyle}>
      <Icon size={18} color={iconColor} />
      <span style={textStyle}>
        {online ? 'ONLINE MODE' : 'OFFLINE MODE'}
      </span>
    </div>
  );
}