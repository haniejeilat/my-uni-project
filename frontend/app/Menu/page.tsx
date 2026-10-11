import { useState } from "react";
export default function Menu({ pausevalue, onContinue, onSave, onLoad }: {
  pausevalue: boolean;
  onContinue?: () => void;
  onSave?: () => boolean | undefined;
  onLoad?: () => boolean | undefined;
}) {
  const menulist = ["continue", "options", "save", "load", "leave"];
  const [msg, setMsg] = useState('');
  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 1200); };

  return (
    <>
    <div id="menu-container" style={{ display: pausevalue ? 'flex' : 'none' }}>
      {menulist.map((text, i) => (
        <button
          key={i}
          id={`menubtn-${i}`}
          onClick={(e) => {
            e.stopPropagation();
            if (text === 'continue') onContinue?.();
            if (text === 'save') flash(onSave?.() ? 'saved ✓' : 'save failed');
            if (text === 'load') flash(onLoad?.() ? 'loaded ✓' : 'no save found');
            if (text === 'leave') window.location.href = '/';
          }}
        >
          {text}
        </button>
      ))}
      <div style={{ color: 'orange', height: 24 }}>{msg}</div>
    </div>
    </>
  );
}