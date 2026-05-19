'use client';

import { useState } from 'react';
import { sendOtp, verifyOtp } from '@/lib/auth';

type Step = 'email' | 'code';

export function SignIn() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const handleSendCode = async () => {
    setErr('');
    setBusy(true);
    const { error } = await sendOtp(email.trim());
    setBusy(false);
    if (error) setErr(error);
    else {
      setStep('code');
      setInfo(`Code sent to ${email.trim()}. Check your inbox.`);
    }
  };

  const handleVerify = async () => {
    setErr('');
    setBusy(true);
    const { error } = await verifyOtp(email.trim(), code.trim());
    setBusy(false);
    if (error) setErr(error);
  };

  return (
    <div className="onb">
      <div className="onb-hero">
        <div className="brand">
          Good<span className="brand-bolt">⚡</span>Morning
        </div>
        <div className="brand-flourish" />

        {step === 'email' && (
          <>
            <p
              className="lede"
              style={{ marginTop: 18, maxWidth: 320, textAlign: 'center' }}
            >
              Seventy-five days, every morning, the habits you choose — held by
              the community who shows up with you.
            </p>
            <p
              style={{
                marginTop: 10,
                fontSize: 12.5,
                color: 'var(--ink-3)',
                fontFamily: "'Inter',sans-serif",
                textAlign: 'center',
              }}
            >
              Sign in with your email — we&apos;ll send a 6-digit code. No
              password. Your data follows you across devices.
            </p>

            <div style={{ width: '100%', marginTop: 18 }}>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && email.includes('@'))
                    handleSendCode();
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  fontFamily: "'Fraunces',serif",
                  fontSize: 17,
                  color: 'var(--ink)',
                  textAlign: 'center',
                }}
              />
            </div>

            <div style={{ flex: 1 }} />
            <button
              className="btn btn-accent btn-lg btn-block"
              disabled={!email.includes('@') || busy}
              onClick={handleSendCode}
            >
              {busy ? 'Sending…' : 'Send Code'}
            </button>
          </>
        )}

        {step === 'code' && (
          <>
            <p
              className="lede"
              style={{ marginTop: 18, maxWidth: 320, textAlign: 'center' }}
            >
              We sent a 6-digit code to{' '}
              <em style={{ color: 'var(--terracotta)' }}>{email}</em>. Enter it
              below.
            </p>

            <div style={{ width: '100%', marginTop: 18 }}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && code.length === 6) handleVerify();
                }}
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  fontFamily: "'Fraunces',serif",
                  fontSize: 24,
                  letterSpacing: 8,
                  color: 'var(--ink)',
                  textAlign: 'center',
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
            </div>

            <div style={{ flex: 1 }} />
            <button
              className="btn btn-accent btn-lg btn-block"
              disabled={code.length !== 6 || busy}
              onClick={handleVerify}
            >
              {busy ? 'Verifying…' : 'Verify & Sign In'}
            </button>
            <button
              className="btn btn-ghost btn-block"
              style={{ marginTop: 6, fontSize: 13 }}
              onClick={() => {
                setStep('email');
                setCode('');
                setInfo('');
                setErr('');
              }}
            >
              Use a different email
            </button>
          </>
        )}

        {err && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              background: 'rgba(255,107,71,0.12)',
              border: '1px solid var(--terracotta)',
              borderRadius: 12,
              color: 'var(--terracotta)',
              fontSize: 13,
              fontFamily: "'Inter',sans-serif",
              textAlign: 'center',
            }}
          >
            {err}
          </div>
        )}
        {info && !err && step === 'code' && (
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              color: 'var(--muted)',
              fontStyle: 'italic',
              fontFamily: "'Fraunces',serif",
              textAlign: 'center',
            }}
          >
            {info}
          </div>
        )}
      </div>
    </div>
  );
}
