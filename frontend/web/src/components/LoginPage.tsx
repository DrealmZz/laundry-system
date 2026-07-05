import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import LaundajaLogo from './LaundajaLogo';

interface LoginPageProps {
  onLogin: (identifier: string, password: string) => Promise<void>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const identifierRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    identifierRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Username atau email wajib diisi');
      return;
    }
    if (!password) {
      setError('Password wajib diisi');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(identifier.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Username/email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: '#f0f2f5'
      }}
    >
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        {/* Logo & Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <LaundajaLogo size={40} strokeWidth={7} className="text-[#4285f4]" />
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1a2e', letterSpacing: '-0.03em' }}>laundaja</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>Laundaja Group</p>
        </div>

        {/* Login Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 25px 50px rgba(15,23,42,0.08)'
        }}>
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>Login</h2>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            {/* Identifier (Username/Email) */}
            <div>
              <label htmlFor="login-identifier" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                Username atau Email
              </label>
              <input
                ref={identifierRef}
                id="login-identifier"
                type="text"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                placeholder="Masukkan username atau email"
                autoComplete="username"
                style={{
                  width: '100%',
                  height: '3rem',
                  borderRadius: '0.75rem',
                  border: error ? '1px solid #f87171' : '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  color: '#111827',
                  outline: 'none',
                  boxShadow: error ? '0 0 0 3px rgba(248,113,113,0.12)' : '0 0 0 0 rgba(0,0,0,0)',
                  transition: 'border-color 200ms, box-shadow 200ms'
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = '#60a5fa';
                  (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(96,165,250,0.18)';
                }}
                onBlur={(e) => {
                  if (!error) {
                    (e.target as HTMLInputElement).style.borderColor = '#d1d5db';
                    (e.target as HTMLInputElement).style.boxShadow = 'none';
                  }
                }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label htmlFor="login-password" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                  Password
                </label>
                <span style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>Lupa Password?</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    height: '3rem',
                    borderRadius: '0.75rem',
                    border: error ? '1px solid #f87171' : '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    padding: '0.75rem 1rem',
                    paddingRight: '3rem',
                    fontSize: '0.9375rem',
                    color: '#111827',
                    outline: 'none',
                    boxShadow: error ? '0 0 0 3px rgba(248,113,113,0.12)' : '0 0 0 0 rgba(0,0,0,0)',
                    transition: 'border-color 200ms, box-shadow 200ms'
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = '#60a5fa';
                    (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(96,165,250,0.18)';
                  }}
                  onBlur={(e) => {
                    if (!error) {
                      (e.target as HTMLInputElement).style.borderColor = '#d1d5db';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#dc2626',
                fontSize: '0.875rem',
                fontWeight: 600
              }} role="alert">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '3rem',
                borderRadius: '0.75rem',
                background: '#5b6abf',
                color: '#ffffff',
                fontSize: '0.9375rem',
                fontWeight: 700,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'background-color 200ms ease, transform 100ms ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.background = '#4a59ae';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.background = '#5b6abf';
                }
              }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin-slow mx-auto" /> : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
