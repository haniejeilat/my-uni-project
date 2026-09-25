export default function Aim() {
        return (
          <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 20,
          height: 20,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 9,
            left: 0,
            width: 20,
            height: 2,
            background: '#fff',
            boxShadow: '0 0 2px #000'
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 9,
            top: 0,
            width: 2,
            height: 20,
            background: '#fff',
            boxShadow: '0 0 2px #000'
          }}
        />
      </div>
    );
}