'use client';

import { useEffect, useState } from 'react';
import { useUi } from '@/lib/storeActions';
import { getMyInviteCode, addFriendByCode } from '@/lib/friends';

/**
 * Shows the signed-in user's invite code + an input to enter someone else's.
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

  const copy = () => {
    if (!myCode) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(myCode);
      setMsg({ text: 'Copied.', kind: 'ok' });
      setTimeout(() => setMsg(null), 1500);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="sheet-bd open" onClick={close} />
      <div className="sheet open">
        <div className="sheet-handle" />
        <h2>
          <em>Friends</em>
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
              onClick={copy}
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
          <small
            style={{
              fontFamily: "'Fraunces',serif",
              fontStyle: 'italic',
              fontSize: 12.5,
              color: 'var(--muted)',
              marginTop: 6,
            }}
          >
            Share this with a friend. When they paste it on their phone, you'll
            connect.
          </small>
        </div>

        <div className="form-divider">
          <span>or</span>
        </div>

        <div className="form-section">
          <label>Enter their code</label>
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
