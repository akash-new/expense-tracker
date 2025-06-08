'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  // This component will appear when there's a critical app-level error
  // It uses minimal styling to ensure it displays even when style loading fails
  return (
    <html lang="en">
      <body>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh', 
          textAlign: 'center',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ 
            marginBottom: '24px',
            padding: '24px',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6' 
          }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: '#6b7280' }}
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px' 
          }}>
            We've encountered a problem
          </h2>
          <p style={{ 
            marginBottom: '24px',
            maxWidth: '500px',
            color: '#6b7280'
          }}>
            The application has encountered an unexpected error. We apologize for the inconvenience.
          </p>
          <button 
            onClick={reset}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
} 