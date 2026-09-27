//@ts-nocheck
'use client'
import { useEffect, useRef, useState } from "react";
import Menu from '@/app/Menu/page.tsx';
import Aim from "../Components/aim/page.tsx";
import MainComponents from "@/app/Components/page.tsx";
export default function VRScence() {
  const walkref = useRef(null)
    , camref = useRef(null)
    , inventoryref = useRef(null)
    , keyref = useRef(null)
    , Doorref = useRef(null)
    , landref = useRef(null)
    , wallref = useRef(null)
    , wallref1 = useRef(null)
    , wallref2 = useRef(null)
    , smallwallref = useRef(null)
    , wallwithdoorref = useRef(null)
    , npcpoliceref = useRef(null)
    , ladderref = useRef(null)
    , stairref = useRef(null)
    , secondfloorref= useRef(null); 
    
  const [pause, setPause] = useState(false);
  const pauseRef = useRef(false);

  useEffect(() => {
    pauseRef.current = pause;
  }, [pause]);

  const [items, setItems] = useState<string[]>([]);
  const itemsref = useRef([]);
  itemsref.current = items;

  useEffect(() => {
    /*--------------------------main imports----------------------*/
    require('aframe');
    require('aframe-extras');

    const THREE = window.AFRAME.THREE;

    /*--------------------first-person configs-----------------*/
    const raycaster = new THREE.Raycaster();
    const SPEED = 20;
    const NPCSPEED = 3;
    const SENS = 0.0022;
    const keys = {};

    let yaw = 0;
    let pitch = 0;
    let doorOpen = false;
    const playerPhysics = { vy: 0, onGround: false , nx: 0, ny: 0};
    
    /*-------------------gravity configs------------------*/
    const GRAVITY = 30;
    const STEP = 1;
    const MAX_STEP = 0.4; 
    const DOWN = new THREE.Vector3(0, -1, 0);
    const PlayerRay = new THREE.Raycaster();
    const JUMP = 12;

    /*-------------------walls configs------------------*/
    const doorRay = new THREE.Raycaster();
    const wallBox1 = new THREE.Box3();
    const wallBox2 = new THREE.Box3();
    const wallBox3 = new THREE.Box3();
    const wallwithdoorBox = new THREE.Box3();
    const doorHoleBox = new THREE.Box3();
    const smallwallBox = new THREE.Box3();
    const ladderBox = new THREE.Box3();
    const stairtBox = new THREE.Box3();
    let doorHoleCaptured = false;

    /*-------------------ladder configs------------------*/
    let onLadder = false;
    const LADDER_DISMOUNT_PUSH = 1;

    /*-------------npc movement-------------*/
    const NPCRay = new THREE.Raycaster();
    const npcPhysics = { vy: 0 };

    /*-------------npc look-----------*/
    const MAX_BLOCKS_NPC = 30;
    const npcmoveStates = { firstdone: false };
    let caught = false;
    const LADDER_WRONG_WAY_TOLERANCE = 0.5
    
    function wallslimiter(object3D , objectBox ,  physics){
          if(object3D.position.y < objectBox.max.y &&
          physics.nx > objectBox.min.x &&
          physics.nx < objectBox.max.x &&
          physics.nz > objectBox.min.z &&
          physics.nz < objectBox.max.z
          ){
            return true;
          }
          return false;
    }
    
    function NpcMovement(npcmovestates, object3D, Aside, Bside, startnpc, endnpc, npcSpeed, dt) {
      if (!npcmovestates.firstdone) {
        if (object3D.position.x >= endnpc) {
          object3D.position.x = endnpc;
          object3D.rotation.y = Bside;
          npcmovestates.firstdone = true;
        } else {
          object3D.position.x += npcSpeed * dt;
          object3D.rotation.y = Aside;
        }
      } else {
        if (object3D.position.x <= startnpc) {
          object3D.position.x = startnpc;
          object3D.rotation.y = Aside;
          npcmovestates.firstdone = false;
        } else {
          object3D.position.x -= npcSpeed * dt;
          object3D.rotation.y = Bside;
        }
      }
    }

    function GravityAndWithJump(landObjecthit, Objectref, physics, dt) {
      if (
        landObjecthit &&
        physics.vy <= 0 &&
        Objectref.object3D.position.y - landObjecthit.point.y <= MAX_STEP
      ) {
        Objectref.object3D.position.y = landObjecthit.point.y;
        physics.vy = 0;
        physics.onGround = true;
      } else {
        physics.vy -= GRAVITY * dt;
        Objectref.object3D.position.y += physics.vy * dt;
        physics.onGround = false;
      }
    }

    function isPlayerInNpcFOV(
      npcObject,
      playerPos,
      fovDegrees = 90,
      maxDistance = 30
    ) {
      const npcPos = npcObject.position;

      const dx = playerPos.x - npcPos.x;
      const dz = playerPos.z - npcPos.z;

      const distance = Math.hypot(dx, dz);

      if (distance > maxDistance) {
        return false;
      }

      const npcRotation = npcObject.rotation.y;

      const forward = new THREE.Vector3(
        Math.sin(npcRotation),
        0,
        Math.cos(npcRotation)
      );

      forward.normalize();

      const toPlayer = new THREE.Vector3(dx, 0, dz);

      if (toPlayer.lengthSq() === 0) {
        return true;
      }

      toPlayer.normalize();

      const dot = forward.dot(toPlayer);

      const halfFov = THREE.MathUtils.degToRad(fovDegrees / 2);

      return dot >= Math.cos(halfFov);
    }

    function segmentIntersectsBox(from, to, box) {
      const dir = new THREE.Vector3().subVectors(to, from);

      const ray = new THREE.Ray(from, dir.clone().normalize());

      const hit = new THREE.Vector3();

      const result = ray.intersectBox(box, hit);

      if (!result) {
        return false;
      }

      const hitDist = hit.distanceTo(from);

      return hitDist < dir.length() - 0.15;
    }

    function hasLineOfSight(
      fromPos,
      toPos,
      boxes,
      heights = [0.3, 1.0, 1.6]
    ) {
      for (const h of heights) {
        const from = new THREE.Vector3(fromPos.x, fromPos.y + h, fromPos.z);

        const to = new THREE.Vector3(toPos.x, toPos.y + h, toPos.z);

        const blocked = boxes.some(box => segmentIntersectsBox(from, to, box));

        if (!blocked) {
          return true;
        }
      }

      return false;
    }

    const down = (e) => {
      keys[e.code] = true;

      if (e.code === 'KeyG' && inventoryref.current) {
        inventoryref.current.style.display = 'grid';
      }

      if (
        e.code === 'KeyE' &&
        itemsref.current.includes('old_key') &&
        !doorOpen
      ) {
        doorOpen = true;

        Doorref.current?.setAttribute('gltf-model', '#celldoorModel');

        Doorref.current?.setAttribute(
          'animation-mixer',
          'loop: once; clampWhenFinished: true'
        );

        Doorref.current?.setAttribute('position', '14.97 0 26.2');
      }

      if (e.code === 'Space' && playerPhysics.onGround) {
        playerPhysics.vy = JUMP;
      }

      
if (onLadder && e.code === 'Space') {
  const forwardX = -Math.sin(yaw);
  const forwardZ = -Math.cos(yaw);


  const ladderSize = Math.max(
    ladderBox.max.x - ladderBox.min.x,
    ladderBox.max.z - ladderBox.min.z
  );
  const pushDist = 2;

 if( 0 <= walkref.current.object3D.rotation.y && Math.PI >= walkref.current.object3D.rotation.y){
  walkref.current.object3D.position.x += forwardX * pushDist;
  walkref.current.object3D.position.z += forwardZ * pushDist;
  }

  onLadder = false;
  window.removeEventListener('mousemove', onMouseMovefixed);
  window.addEventListener('mousemove', onMouseMovenormal);
}

      if (e.code === 'Escape') {
        setPause(p => !p);
      }
    };

    const up = (e) => {
      keys[e.code] = false;

      if (e.code === 'KeyG' && inventoryref.current) {
        inventoryref.current.style.display = 'none';
      }
    };

    const onMouseMovenormal = (e) => {
      if (!document.pointerLockElement) {
        return;
      }

      yaw -= e.movementX * SENS;
      yaw = ((yaw + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      pitch -= e.movementY * SENS;
      pitch = Math.max(-1.55, Math.min(1.55, pitch));

      if (walkref.current?.object3D) {
        walkref.current.object3D.rotation.y = yaw;
      }

      if (camref.current?.object3D) {
        camref.current.object3D.rotation.x = pitch;
      }
    };

    const onMouseMovefixed = (e) => {
      if (!document.pointerLockElement) {
        return;
      }

      yaw -= e.movementX * SENS;
      yaw = ((yaw + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      pitch -= e.movementY * SENS;

      pitch = Math.max(-1.55, Math.min(1.55, pitch));
      if (walkref.current?.object3D) {
        walkref.current.object3D.rotation.y = yaw;
      }

      if (camref.current?.object3D) {
        camref.current.object3D.rotation.x = pitch;
      }
    };

    const onClick = () => {
      const canvas = document.querySelector('a-scene canvas');

      if (canvas && document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
        return;
      }

      const cam = document.querySelector('a-scene')?.camera;

      const key = keyref.current;

      if (!cam || !key?.object3D) {
        return;
      }

      raycaster.setFromCamera({ x: 0, y: 0 }, cam);

      if (raycaster.intersectObject(key.object3D, true).length) {
        setItems((prev) =>
          prev.includes('old_key') ? prev : [...prev, 'old_key']
        );
      }
    };

    let blockedwall1 = false,
      blockedwall2 = false,
      blockedwall3 = false,
      blockedwallwithdoor = false,
      blockedsmallwall = false,
      onStaircase = false;

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up)
    window.addEventListener('mousemove', onMouseMovenormal);
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

      if (pauseRef.current) {
        return;
      }
      /*------------------------first-person configs------------------------*/
      if (!walkref.current?.object3D || !npcpoliceref.current?.object3D) {
        return;
      }

      const distNpcPlayer = Math.hypot(
        walkref.current.object3D.position.x - npcpoliceref.current.object3D.position.x,
        walkref.current.object3D.position.z - npcpoliceref.current.object3D.position.z
      );

      /*------------------gravity configs------------------*/
      const land = landref.current?.getObject3D('mesh');
      const stairsMesh = stairref.current?.getObject3D('mesh');
      const secondMesh = secondfloorref.current?.getObject3D('mesh');

      /*------------wall boxes------------*/
      let wallsReady = false;

      if (
        wallref.current?.object3D &&
        wallref1.current?.object3D &&
        wallref2.current?.object3D &&
        wallwithdoorref.current?.object3D &&
        smallwallref.current?.object3D &&
        ladderref.current?.object3D &&
        stairref.current?.object3D
        ) {
        wallsReady = true;

        wallBox1.setFromObject(wallref.current.object3D).expandByScalar(0.5);
        wallBox2.setFromObject(wallref1.current.object3D).expandByScalar(0.5);
        wallBox3.setFromObject(wallref2.current.object3D).expandByScalar(0.5);
        wallwithdoorBox.setFromObject(wallwithdoorref.current.object3D);
        smallwallBox.setFromObject(smallwallref.current.object3D).expandByScalar(0.5);
        ladderBox.setFromObject(ladderref.current.object3D).expandByScalar(0.5);
        
        /*----------------------------door hole capture (retries until the gltf mesh is actually loaded)----------------------------*/
        if (!doorHoleCaptured && Doorref.current?.object3D) {
          const tempDoorHoleBox = new THREE.Box3().setFromObject(Doorref.current.object3D);

          if (!tempDoorHoleBox.isEmpty()) {
            doorHoleBox.copy(tempDoorHoleBox).expandByScalar(0.3);
            doorHoleCaptured = true;
          }
        }
      }

      /*----------------------------ladder zone detection (every frame)----------------------------*/
      if (wallsReady) {
        const isOnLadderNow = ladderBox.containsPoint(walkref.current.object3D.position);
        
        if (isOnLadderNow !== onLadder) {
          onLadder = isOnLadderNow;

          window.removeEventListener('mousemove', onMouseMovenormal);
          window.removeEventListener('mousemove', onMouseMovefixed);
          window.addEventListener('mousemove', onLadder ? onMouseMovefixed : onMouseMovenormal);
        }
       
      }

      /*----------------------------------------Gravity implemention----------------------------------*/
      if (land) {
        PlayerRay.set(
          new THREE.Vector3(
            walkref.current.object3D.position.x,
            walkref.current.object3D.position.y + STEP,
            walkref.current.object3D.position.z
          ),
          DOWN
        );

        const hit = PlayerRay.intersectObjects([land, stairsMesh , secondMesh].filter(Boolean), true)[0];
        
        if (onLadder) {
        playerPhysics.vy = 0;
        playerPhysics.onGround = true;
      } 
      if(hit) {
        GravityAndWithJump(hit, walkref.current, playerPhysics, dt);
        
        }
    
        /*----------------------------NPC implemention-----------------------------*/
        NPCRay.set(
          new THREE.Vector3(
            npcpoliceref.current.object3D.position.x,
            npcpoliceref.current.object3D.position.y + STEP,
            npcpoliceref.current.object3D.position.z
          ),
          DOWN
        );

        const connect = NPCRay.intersectObject(land, true)[0];

        GravityAndWithJump(connect, npcpoliceref.current, npcPhysics, dt);

        /*----------------------------NPC VISION-----------------------------*/
        if (wallsReady && !caught) {
          const obstacleBoxes = [
            wallBox1,
            wallBox2,
            wallBox3,
            wallwithdoorBox,
            smallwallBox
          ];

          const playerInFOV = isPlayerInNpcFOV(
            npcpoliceref.current.object3D,
            walkref.current.object3D.position,
            90,
            MAX_BLOCKS_NPC
          );

          const playerVisible =
            playerInFOV &&
            hasLineOfSight(
              npcpoliceref.current.object3D.position,
              walkref.current.object3D.position,
              obstacleBoxes
            );

          if (playerVisible && distNpcPlayer <= MAX_BLOCKS_NPC) {
            caught = true;
          }
        }

        /*----------------------------NPC movement-----------------------------*/
        if (!caught) {
          NpcMovement(npcmoveStates, npcpoliceref.current.object3D, Math.PI / 2, -Math.PI / 2, 0, 50, 10, dt);
        }
      }

      /*------------------------------first-personwalk configs---------------------------------------*/
      const X = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);

      const Z = (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0);

      if (!X && !Z) {
        return;
      }

      const len = Math.sqrt(X ** 2 + Z ** 2);

      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);

      const dx = (X * cos + Z * sin) / len;

      const dz = (-X * sin + Z * cos) / len;

      playerPhysics.nx = walkref.current.object3D.position.x + dx * SPEED * dt;

       playerPhysics.nz = walkref.current.object3D.position.z + dz * SPEED * dt;

      /*---------------------------first-person walk && walls implementation--------------------------*/

      if (wallsReady) {
        blockedwall1 = wallslimiter(walkref.current.object3D , wallBox1 , playerPhysics);
        blockedwall2 = wallslimiter(walkref.current.object3D , wallBox2 , playerPhysics);
        blockedwall3 =  wallslimiter(walkref.current.object3D , wallBox3 , playerPhysics);
          
    const inholedoor = doorHoleCaptured &&
          playerPhysics.nx > doorHoleBox.min.x &&
          playerPhysics.nx < doorHoleBox.max.x &&
          playerPhysics.nz > doorHoleBox.min.z &&
          playerPhysics.nz < doorHoleBox.max.z;

        blockedwallwithdoor = wallslimiter(walkref.current.object3D , wallwithdoorBox , playerPhysics) 
        && !(doorOpen && inholedoor);

        blockedsmallwall = wallslimiter(walkref.current.object3D , smallwallBox , playerPhysics);
          }

      /*--------------------------first-person walk allowed condition------------------------------------*/
      if (!onLadder && !blockedwall1 && !blockedwall2 && !blockedwall3 && !blockedwallwithdoor && !blockedsmallwall) {
        walkref.current.object3D.position.x = playerPhysics.nx;
        walkref.current.object3D.position.z = playerPhysics.nz;
      }

      /*--------------------------ladder climb------------------------------------*/
      if (onLadder) {
        const Y = keys.KeyW ? 1 : 0;

        const siny = Math.sin(pitch);

        const dy = Y * siny; 

        const ny = walkref.current.object3D.position.y + dy * SPEED * dt;

        walkref.current.object3D.position.y = ny;

        
      }
};
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);

      window.removeEventListener('keydown', down);

      window.removeEventListener('keyup', up);

      window.removeEventListener('mousemove', onMouseMovenormal);

      window.removeEventListener('mousemove', onMouseMovefixed);

      window.removeEventListener('click', onClick);
    };
  }, []);

  const GridShortCut = (
    url_newimg: string,
    order: number
  ) => {
    return (
      <img
        key={order}
        id={`box-${order}`}
        src={url_newimg}
        alt=""
      />
    );
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
    <MainComponents walkref = {walkref} camref = {camref} inventoryref = {inventoryref}  Doorref = {Doorref} landref = {landref} wallref = {wallref} wallref1 = {wallref1} wallref2 = {wallref2} smallwallref = {smallwallref} wallwithdoorref = {wallwithdoorref} npcpoliceref = {npcpoliceref} keyref={keyref} ladderref = {ladderref} stairref = {stairref} secondfloorref = {secondfloorref} showKey={!items.includes('old_key') }/>

      {/*----------------------aim templer-----------------*/}
      <Aim/>

      {/*---------------------inventory--------------------*/}
      <div
        ref={inventoryref}
        id="inventory-container"
      >
        {items.map((url, i) =>
          GridShortCut(
            `/assets/${url}.png`,
            i
          )
        )}
      </div>

      {/*---------------------pause--------------------*/}
      <Menu
        pausevalue={pause}
        onContinue={() => setPause(false)}
      />
    </div>
  );
}
