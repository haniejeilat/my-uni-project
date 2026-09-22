//@ts-nocheck
'use client'
import { useEffect, useRef, useState } from "react";

export default function VRScence() {
  const walkref = useRef(null)
  , camref = useRef(null)
  ,inventoryref = useRef(null)
  ,keyref = useRef(null)
  ,Doorref = useRef(null)
  ,landref = useRef(null)
  ,wallref = useRef(null)
  ,wallref1 = useRef(null)
  ,wallref2 = useRef(null)
  ,wallwithdoor = useRef(null)
  ,npcpolice = useRef(null);

  const [items, setItems] = useState<string[]>([]);
  const itemsref = useRef([]);
  itemsref.current = items;

  useEffect(() => {
    require('aframe');
    require('aframe-extras');
    const THREE = window.AFRAME.THREE;
    const raycaster = new THREE.Raycaster();

    const SPEED = 20;
    const NPCSPEED = 7;
    const SENS = 0.0022;
    const keys = {};
    let yaw = 0;
    let pitch = 0;
    let doorOpen = false;

    const GRAVITY = 30;
    const STEP = 1;
    const DOWN = new THREE.Vector3(0, -1, 0);
    const groundRay = new THREE.Raycaster();
    const doorRay = new THREE.Raycaster();
    const wallBox1 = new THREE.Box3();
    const wallBox2 = new THREE.Box3();
    const wallBox3 = new THREE.Box3();
    const wallwithdoorBox = new THREE.Box3();
    const doorHoleBox = new THREE.Box3();
    let doorHoleCaptured = false;
    let vy = 0;
    let npcvy = 0;
    const JUMP = 12;
    let onGround = false;

    const moveRay = new THREE.Raycaster(); 
    const FRONT = new THREE.Vector3(0 , 0 , 1);
    const ENDNPC = -20;
    const STARTNPC = 20;
   let firstdone = false;
   
    const down = (e) => {
      keys[e.code] = true;
      if (e.code === 'KeyG' && inventoryref.current) inventoryref.current.style.display = 'grid';
      if (e.code === 'KeyE' && itemsref.current.includes('old_key') && !doorOpen) {
        doorOpen = true;
        Doorref.current?.setAttribute('gltf-model', '#celldoorModel');
        Doorref.current?.setAttribute('animation-mixer', 'loop: once; clampWhenFinished: true');
        Doorref.current?.setAttribute('position', '14.97 0 26.2');
      }
      if (e.code === 'Space' && onGround) {
        vy = JUMP;
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
      if (last !== 0) {
        dt = Math.min((now - last) / 1000, 0.1);
      } else {
        dt = 0;
      }
      last = now;

      const el = walkref.current;
      const doorel = Doorref.current;
      const Wallrel = wallref.current;
      const Wallrel1 = wallref1.current;
      const Wallrel2 = wallref2.current;
      const Wallrelwithdoor = wallwithdoor.current;
      const npcrel = npcpolice.current;
      if (!el?.object3D) return;

      const pos = el.object3D.position;
      const land = landref.current?.getObject3D('mesh');
      const NPCpos = npcrel.object3D.position;
      if (land) {
        groundRay.set(new THREE.Vector3(pos.x, pos.y + STEP, pos.z), DOWN);
        const hit = groundRay.intersectObject(land, true)[0];
        if (hit && vy <= 0 && pos.y <= hit.point.y + 0.05) {
          pos.y = hit.point.y;
          vy = 0;
          onGround = true;
        } else {
          vy -= GRAVITY * dt;
          pos.y += vy * dt;
          onGround = false;
        }
      
       moveRay.set(new THREE.Vector3(NPCpos.x , NPCpos.y + STEP, NPCpos.z ), DOWN);
      const connect = moveRay.intersectObject(land,true)[0];
      if(connect && npcvy <= 0 && NPCpos.y <= connect.point.y + 0.05){
       NPCpos.y = connect.point.y;
       npcvy = 0;
      }
      else {
        npcvy -= GRAVITY * dt;
        NPCpos.y += npcvy * dt;
      }
      if(!firstdone){
        if(NPCpos.z <= ENDNPC){
        NPCpos.z = ENDNPC;
        npcrel.object3D.rotation.y = 0;
        firstdone = true;
      }
     else {
        NPCpos.z -= NPCSPEED * dt;
        }
      }
    
      else{
        if(NPCpos.z >= STARTNPC){
          NPCpos.z = STARTNPC;
          npcrel.object3D.rotation.y = Math.PI;
          firstdone = false;
          }
        else {
          NPCpos.z += NPCSPEED * dt;
        }  
      }
}

      
      
     

      const x = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
      const z = (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0);
      if (!x && !z) return;

      const len = Math.sqrt(x ** 2 + z ** 2);
      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);
      const dx = (x * cos + z * sin) / len;
      const dz = (-x * sin + z * cos) / len;
      const nx = pos.x + dx * SPEED * dt;
      const nz = pos.z + dz * SPEED * dt;

      let blockedwall1 = false;
      let blockedwall2 = false;
      let blockedwall3 = false;
      let blockedwallwithdoor = false;

      if (
        Wallrel?.object3D &&
        Wallrel1?.object3D &&
        Wallrel2?.object3D &&
        Wallrelwithdoor?.object3D
      ) {
        wallBox1.setFromObject(Wallrel.object3D).expandByScalar(0.5);
        wallBox2.setFromObject(Wallrel1.object3D).expandByScalar(0.5);
        wallBox3.setFromObject(Wallrel2.object3D).expandByScalar(0.5);
        wallwithdoorBox.setFromObject(Wallrelwithdoor.object3D);

        
        if (!doorHoleCaptured && doorel?.object3D) {
          doorHoleBox.setFromObject(doorel.object3D);
          doorHoleCaptured = true;
        }

        blockedwall1 =
          pos.y < wallBox1.max.y &&
          nx > wallBox1.min.x && nx < wallBox1.max.x &&
          nz > wallBox1.min.z && nz < wallBox1.max.z;

        blockedwall2 =
          pos.y < wallBox2.max.y &&
          nx > wallBox2.min.x && nx < wallBox2.max.x &&
          nz > wallBox2.min.z && nz < wallBox2.max.z;

        blockedwall3 =
          pos.y < wallBox3.max.y &&
          nx > wallBox3.min.x && nx < wallBox3.max.x &&
          nz > wallBox3.min.z && nz < wallBox3.max.z;

        const inholedoor =
          doorHoleCaptured &&
          nx > doorHoleBox.min.x && nx < doorHoleBox.max.x &&
          nz > doorHoleBox.min.z && nz < doorHoleBox.max.z;

        blockedwallwithdoor =
          pos.y < wallwithdoorBox.max.y &&
          nx > wallwithdoorBox.min.x && nx < wallwithdoorBox.max.x &&
          nz > wallwithdoorBox.min.z && nz < wallwithdoorBox.max.z &&
          !(doorOpen && inholedoor);
      }

      if (!blockedwall1 && !blockedwall2 && !blockedwall3 && !blockedwallwithdoor) {
        pos.x = nx;
        pos.z = nz;
      }
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

  const GridShortCut = (url_newimg: string, order: number) => {
    return <img key={order} id={`box-${order}`} src={url_newimg} alt="" />;
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <a-scene embedded renderer="colorManagement: true">
        <a-assets>
          <a-asset-item id="landModel" src="/assets/landframe.glb"></a-asset-item>
          <a-asset-item id="prisonerModel" src="/assets/prisoner/prisoner.glb"></a-asset-item>
          <a-asset-item id="keyModel" src="/assets/old_key.glb"></a-asset-item>
          <a-asset-item id="standarddoorModel" src="/assets/standarddoor.glb"></a-asset-item>
          <a-asset-item id="celldoorModel" src="/assets/celldoor.glb"></a-asset-item>
          <a-asset-item id="cellwallModel" src="/assets/cellwall.glb"></a-asset-item>
          <a-asset-item id="cellwallwithdoorModel" src="/assets/cellwallwithdoor.glb"></a-asset-item>
          <a-asset-item id = "policeModel" src = "/assets/prisoner/prisoner.glb"></a-asset-item>
        </a-assets>

        <a-sky color="#87CEED"></a-sky>

        <a-entity position="-19 0 6" ref={walkref}>
          <a-entity camera="" ref={camref} position="0 3.54 -0.5"></a-entity>
          <a-entity
            scale="0.016 0.016 0.016"
            gltf-model="#prisonerModel"
            position="0.23 1 0"
            rotation="0 180 0"
            animation-mixer
          ></a-entity>
        </a-entity>

        <a-entity
          ref={landref}
          gltf-model="#landModel"
          position="0 0 0"
          scale="1 1 1"
          matrixAutoUpdate="false"
        ></a-entity>

        {!items.includes('old_key') && (
          <a-entity
            ref={keyref}
            gltf-model="#keyModel"
            position="0 2 30"
            scale="1 1 1"
            matrixAutoUpdate="false"
          ></a-entity>
        )}

        <a-entity
          ref={wallref}
          position="20 0 21"
          scale="2 2 2"
          rotation="0 90 0"
          gltf-model="#cellwallModel"
          matrixAutoUpdate="false"
        ></a-entity>

        <a-entity
          ref={wallref1}
          position="20 0 31.4"
          scale="2 2 2"
          rotation="0 90 0"
          gltf-model="#cellwallModel"
          matrixAutoUpdate="false"
        ></a-entity>

        <a-entity
          ref={wallref2}
          position="25.9 0 26"
          scale="2 2 2"
          gltf-model="#cellwallModel"
          matrixAutoUpdate="false"
        ></a-entity>

        <a-entity
          ref={wallwithdoor}
          position="15 -0.1 26.2"
          scale="2 1.75 1.6"
          matrixAutoUpdate="false"
          rotation="0 180 0"
          gltf-model="#cellwallwithdoorModel"
        ></a-entity>

        <a-entity
          ref={Doorref}
          gltf-model="#standarddoorModel"
          position="14.97 0 26.2"
          rotation="0 180 0"
          scale="1 0.8 0.72"
        ></a-entity>

        <a-entity
          ref={npcpolice}
          gltf-model="#policeModel"
          position="14.97 0 40.2"
          rotation="0 180 0"
          scale="0.026 0.026 0.026"
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
