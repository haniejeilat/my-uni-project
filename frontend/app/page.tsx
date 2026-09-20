//@ts-nocheck
'use client'
import { useEffect, useRef } from "react";

export default function VRScence() {
  const walkref = useRef(null);
  const camref = useRef(null);

  useEffect(() => {
    require('aframe');
    require('aframe-extras');

    const SPEED = 3;
    const SENS = 0.0022;
    const keys = {};
    let yaw = 0;
    let pitch = 0;

    const down = (e) => (keys[e.code] = true);
    const up = (e) => (keys[e.code] = false);

    const onMouseMove = (e) => {
      if (!document.pointerLockElement) return;
      yaw -= e.movementX * SENS;
      pitch -= e.movementY * SENS;
      pitch = Math.max(-1.55, Math.min(1.55, pitch));
      if (walkref.current?.object3D) walkref.current.object3D.rotation.y = yaw;
      if (camref.current?.object3D) camref.current.object3D.rotation.x = pitch;
    };

    const onClick = () => {
      const canvas = document.querySelector('a-scene canvas');
      if (canvas && document.pointerLockElement !== canvas) canvas.requestPointerLock();
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    let raf;
    let last = 0;

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      let dt;
      if(last !== 0){
        dt =  Math.min((now - last) / 1000, 0.1)
      }
      else {
         dt = 0;
      }
      last = now;

      const el = walkref.current;
      const x = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
      const z = (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0); 
      if (!el?.object3D || (!x && !z)) return;

      
      const len = Math.hypot(x, z);
      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);
      el.object3D.position.x += ((x * cos + z * sin) / len) * SPEED * dt;
      el.object3D.position.z += ((-x * sin + z * cos) / len) * SPEED * dt;
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <a-scene embedded renderer="colorManagement: true">
        <a-assets>
          <a-asset-item id="landModel" src="/assets/landframe.glb"></a-asset-item>
          <a-asset-item id="characterModel" src="/assets/prisoner/prisoner.glb"></a-asset-item>
        </a-assets>

        <a-sky color="#87CEED"></a-sky>

        <a-entity position="-19 0 6" ref={walkref}>
          <a-entity camera="" ref={camref} position="0 3.54 -0.3"></a-entity>
          <a-entity
            scale="0.016 0.016 0.016"
            gltf-model="#characterModel"
            position="0.23 1 0"
            rotation="0 180 0"
            animation-mixer
          ></a-entity>
        </a-entity>

        <a-entity
          gltf-model="#landModel"
          position="0 0 0"
          scale="1 1 1"
        ></a-entity>
      </a-scene>

      {/* crosshair */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: 20, height: 20, transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 10 }}>
        <div style={{ position: 'absolute', top: 9, left: 0, width: 20, height: 2, background: '#fff', boxShadow: '0 0 2px #000' }} />
        <div style={{ position: 'absolute', left: 9, top: 0, width: 2, height: 20, background: '#fff', boxShadow: '0 0 2px #000' }} />
      </div>
    </div>
  );
}