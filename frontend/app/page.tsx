//@ts-nocheck
'use client'
import { useEffect, useRef, useState } from "react";

export default function VRScence() {
  const walkref = useRef(null);
  const camref = useRef(null);
  const inventoryref = useRef(null);
  const keyref = useRef(null);
  const Doorref = useRef(null);
  const [items, setItems] = useState([]);
  const itemsref = useRef([]);
  itemsref.current = items;

  useEffect(() => {
    require('aframe');
    require('aframe-extras');
    const THREE = window.AFRAME.THREE;
    const raycaster = new THREE.Raycaster();

    const SPEED = 20;
    const SENS = 0.0022;
    const keys = {};
    let yaw = 0;
    let pitch = 0;

    const down = (e) => {
      keys[e.code] = true;
      if (e.code === 'KeyG' && inventoryref.current) inventoryref.current.style.display = 'grid';
      if (e.code === 'KeyE' && itemsref.current.includes('old_key')) {
        Doorref.current?.setAttribute('gltf-model' , '#celldoorModel');
        Doorref.current?.setAttribute('animation-mixer', 'loop: once; clampWhenFinished: true');
      }
    };
    const up = (e) => {
      keys[e.code] = false;
      if (e.code === 'KeyG' && inventoryref.current) inventoryref.current.style.display = 'none';
      };

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
      if (canvas && document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
        return;
      }

      
      const cam = document.querySelector('a-scene')?.camera;
      const key = keyref.current;
      if (!cam || !key?.object3D) return;
      raycaster.setFromCamera({ x: 0, y: 0 }, cam);
      if (raycaster.intersectObject(key.object3D, true).length) {
        setItems((prev) => (prev.includes('old_key') ? prev : [...prev, 'old_key']));
      }
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

      const len = Math.sqrt(x**2 + z**2);
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

  const GridShortCut = (url_newimg: string , order : number) => {
    return <img key={order} id = {`box-${order}`} src={url_newimg} alt="" />;
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <a-scene embedded renderer="colorManagement: true">
        <a-assets>
          <a-asset-item id="landModel" src="/assets/landframe.glb"></a-asset-item>
          <a-asset-item id="characterModel" src="/assets/prisoner/prisoner.glb"></a-asset-item>
          <a-asset-item id="keyModel" src="/assets/old_key.glb"></a-asset-item>
          <a-asset-item id = "standarddoorModel" src = "/assets/standarddoor.glb"></a-asset-item>
          <a-asset-item id = "celldoorModel" src = "/assets/celldoor.glb"></a-asset-item>
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

        {!items.includes('old_key') && (
          <a-entity
            ref={keyref}
            gltf-model="#keyModel"
            position="0 2 30"
            scale="1 1 1"
          ></a-entity>
        )}
      
         <a-entity
          ref = {Doorref}
          gltf-model = "#standarddoorModel"
          position = "0 0 32"
          scale = "1 1 1"
          ></a-entity>
      </a-scene>

      <div style={{ position: 'absolute', top: '50%', left: '50%', width: 20, height: 20, transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 10 }}>
        <div style={{ position: 'absolute', top: 9, left: 0, width: 20, height: 2, background: '#fff', boxShadow: '0 0 2px #000' }} />
        <div style={{ position: 'absolute', left: 9, top: 0, width: 2, height: 20, background: '#fff', boxShadow: '0 0 2px #000' }} />
      </div>

      <div
        ref={inventoryref}
        id="inventory-container"
      >
        {items.map((url, i) => GridShortCut(`/assets/${url}.png`, i))}
      </div>
    </div>
  );
}