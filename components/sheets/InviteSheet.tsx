'use client';

import { useEffect, useState } from 'react';
import { useUi } from '@/lib/storeActions';
import { getMyInviteCode, addFriendByCode } from '@/lib/friends';

/**
 * Shows the signed-in user's invite code + ways to share it.
 */
export function InviteSheet() {
  const open = useUi((s) => s.inviteSheetOpen);
  const close = useUi((s) => s.closeInviteSheet);

  const [myCode, setMyCode] = useState<string>('');
  const [enterCode, setEnterCode] = useState('');
  const [msg, setMsg] = useState<{ text: string; kind: 'ok' | 'err' } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMsg(null);
    setEnterCode('');
    getMyInviteCode().then((c) => setMyCode(c ?? '—'));
  }, [open]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteUrl = origin && myCode ? `${origin}/?invite=${myCode}` : origin;
  const inviteText =
    `Join me on GoodMorning ⚡ — my invite code is ${myCode}.\n${inviteUrl}`;

  const handleAdd = async () => {
    setBusy(true);
    setMsg(null);
    const { friend, error } = await addFriendByCode(enterCode);
    setBusy(false);
    if (error) setMsg({ text: error, kind: 'err' });
    else if (friend) {
      setMsg({ text: `Connected with ${friend.name}.`, kind: 'ok' });
      setEnterCode('');
    }
  };

  const copyCode = () => {
    if (!myCode || myCode === '—') return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(myCode);
      setMsg({ text: 'Code copied.', kind: 'ok' });
      setTimeout(() => setMsg(null), 1500);
    }
  };

  const copyLink = () => {
    if (!myCode || myCode === '—') return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteText);
      setMsg({ text: 'Invite link copied. Paste it anywhere.', kind: 'ok' });
      setTimeout(() => setMsg(null), 2000);
    }
  };

  const shareNative = async () => {
    if (!myCode || myCode === '—') return;
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: 'Join me on GoodMorning',
          text: inviteText,
          url: inviteUrl,
        });
      } catch {
        // user dismissed — ignore
      }
    } else {
      // Fallback for browsers without Web Share — drop to copy
      copyLink();
    }
  };

  const textInvite = () => {
    if (!myCode || myCode === '—') return;
    // `sms:&body=...` opens iOS Messages with the body prefilled, contact picker
    // appears so you pick who to send to.
    const smsUrl = `sms:&body=${encodeURIComponent(inviteText)}`;
    window.location.href = smsUrl;
  };

  if (!open) return null;

  return (
    <>
      <div className="sheet-bd open" onClick={close} />
      <div className="sheet open">
        <div className="sheet-handle" />
        <h2>
          <em>Invite a friend</em>
        </h2>

        <div className="form-section">
          <label>Your code</label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '18px 20px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
            }}
          >
            <span
              style={{
                flex: 1,
                fontFamily: "'Fraunces',serif",
                fontStyle: 'italic',
                fontSize: 32,
                fontWeight: 600,
                letterSpacing: 6,
                color: 'var(--terracotta)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {myCode || '—'}
            </span>
            <button
              onClick={copyCode}
              style={{
                padding: '10px 16px',
                background: 'var(--ink)',
                color: 'var(--bg-2)',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 12,
                fontFamily: "'Inter',sans-serif",
              }}
            >
              Copy
            </button>
          </div>
        </div>

        <div className="form-section">
          <label>Share an invite link</label>
          <div className="invite-actions">
            <button className="inv-action primary" onClick={textInvite}>
              <div className="inv-ico">
                <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.7}>
                  <path d="M21 11.5c0 4.14-4.03 7.5-9 7.5a9.7 9.7 0 0 1-3.6-.69L3 20l1.27-3.62A7.5 7.5 0 0 1 3 11.5C3 7.36 7.03 4 12 4s9 3.36 9 7.5z" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="inv-body">
                <b>Send a text</b>
                <small>Opens Messages with the link prefilled</small>
              </div>
            </button>
            <button className="inv-action" onClick={shareNative}>
              <div className="inv-ico">
                <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.7}>
                  <path d="M12 4v12M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="inv-body">
                <b>Share…</b>
                <small>Messages, mail, AirDrop, anywhere</small>
              </div>
            </button>
            <button className="inv-action" onClick={copyLink}>
              <div className="inv-ico">
                <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.7}>
                  <path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" strokeLinecap="round"/>
                  <path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="inv-body">
                <b>Copy invite link</b>
                <small>Paste it in DMs, group chats, anywhere</small>
              </div>
            </button>
          </div>
        </div>

        <div className="form-divider">
          <span>or enter their code</span>
        </div>

        <div className="form-section">
          <label>Their code</label>
          <input
            type="text"
            placeholder="ABC123"
            value={enterCode}
            onChange={(e) => setEnterCode(e.target.value.toUpperCase().slice(0, 6))}
            maxLength={6}
            style={{
              letterSpacing: 6,
              textAlign: 'center',
              fontSize: 22,
              fontVariantNumeric: 'tabular-nums',
            }}
          />
        </div>

        <div className="sheet-actions">
          <button className="btn btn-secondary" onClick={close}>
            Close
          </button>
          <button
            className="btn btn-accent"
            disabled={enterCode.length !== 6 || busy}
            onClick={handleAdd}
          >
            {busy ? 'Adding…' : 'Add Friend'}
          </button>
        </div>

        {msg && (
          <div
            style={{
              margin: '0 22px 16px',
              padding: '10px 14px',
              background:
                msg.kind === 'err'
                  ? 'rgba(255,107,71,0.12)'
                  : 'rgba(168,224,96,0.16)',
              border:
                '1px solid ' +
                (msg.kind === 'err' ? 'var(--terracotta)' : '#A8E060'),
              borderRadius: 12,
              fontSize: 13,
              color: msg.kind === 'err' ? 'var(--terracotta)' : 'var(--ink)',
              fontFamily: "'Inter',sans-serif",
              textAlign: 'center',
            }}
          >
            {msg.text}
          </div>
        )}

        <div style={{ height: 30 }} />
      </div>
    </>
  );
}
