export default function Thermometer({ fillref, color, label, left }:any) {
  return (
    <div style={{ position: 'absolute', top: 20, left, zIndex: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', color: 'orange', fontFamily: 'Courier New, monospace', fontSize: 12 }}>
      <div style={{ width: 18, height: 160, background: 'rgba(0,0,0,0.4)', border: '2px solid #fff', borderRadius: '9px 9px 0 0', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
        <div ref={fillref} style={{ width: '100%', height: '0%', background: color, transition: 'height 0.15s linear' }} />
      </div>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: color, border: '2px solid #fff', marginTop: -4 }} />
      <span>{label}</span>
    </div>
  );
}