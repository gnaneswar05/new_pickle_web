'use client';
import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/settingsStore';

export default function LoadingLogo({ message = "Loading..." }: { message?: string }) {
  const { logoUrl, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <div style={{ padding: '100px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
      <style>{`
        @keyframes pulse-logo {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
      
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt="Loading..." 
          style={{ width: '80px', height: '80px', objectFit: 'contain', animation: 'pulse-logo 1.5s infinite ease-in-out', marginBottom: '20px' }} 
        />
      ) : (
        <div style={{ width: '60px', height: '60px', background: '#2d5a27', color: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', animation: 'pulse-logo 1.5s infinite ease-in-out', marginBottom: '20px' }}>
          K
        </div>
      )}
      
      <p style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: '600', letterSpacing: '0.05em' }}>
        {message}
      </p>
    </div>
  );
}

