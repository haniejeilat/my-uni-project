//@ts-nocheck
'use client'
import { useEffect } from "react";
import {
  wallslimiter,
  NpcMovement,
  GravityAndWithJump,
  isPlayerInNpcFOV,
  hasLineOfSight,
} from "@/app/utils/vrPhysics/page";

export function useVRGameLoop(refs, itemsref, setItems, pauseRef, setPause) {
  useEffect(() => {
    require('aframe');
    require('aframe-extras');

    const THREE = window.AFRAME.THREE;

    const {
      walkref, camref, inventoryref, keyref, Doorref,
      landref, wallref, wallref1, wallref2, smallwallref,
      wallwithdoorref, npcpoliceref, ladderref, stairref, secondfloorref,
    } = refs;

        
      const footstepSounds = [
      new Audio('/assets/playeraudio/pl_step1.wav'),
      new Audio('/assets/playeraudio/pl_step2.wav'),
      new Audio('/assets/playeraudio/pl_step3.wav'),
      new Audio('/assets/playeraudio/pl_step4.wav'),
      new Audio('/assets/playeraudio/pl_jump1.wav'),
      new Audio('/assets/playeraudio/pl_jump2.wav'),
      new Audio('/assets/playeraudio/pl_ladder1.wav'),
      new Audio('/assets/playeraudio/pl_ladder2.wav'),
      new Audio('/assets/playeraudio/pl_ladder3.wav'),
      new Audio('/assets/playeraudio/pl_ladder4.wav'),
      ];

     const doorSounds = [
      new Audio('/assets/dooraudio/doormove9.wav'),
      new Audio('/assets/dooraudio/doormove10.wav'),
      new Audio('/assets/dooraudio/lockeddoor.flac'),
      ];

      const menuSounds = [
        new Audio('/assets/menuaudio/launch_upmenu1.wav'),
        new Audio('/assets/menuaudio/launch_dnmenu1.wav'),
      ];

    /*--------------------first-person configs-----------------*/
    const raycaster = new THREE.Raycaster();
    const SPEED = 20;
    const SENS = 0.0022;
    const keys = {};

    let yaw = 0;
    let pitch = 0;
    let doorOpen = false;
    const playerPhysics = { vy: 0, onGround: false, nx: 0, ny: 0 };


    /*-------------------footsteps configs------------------*/
      const STEP_COUNT = 4;         
      const STEP_INTERVAL = 0.4;     
      let stepIndex = 0;
      let stepTimer = STEP_INTERVAL;

    /*-------------------gravity configs------------------*/
    const GRAVITY = 30;
    const STEP = 1;
    const MAX_STEP = 0.4;
    const DOWN = new THREE.Vector3(0, -1, 0);
    const PlayerRay = new THREE.Raycaster();
    const JUMP = 12;
    let JumpEffects = false;

    /*-------------------walls configs------------------*/
    const wallBox1 = new THREE.Box3();
    const wallBox2 = new THREE.Box3();
    const wallBox3 = new THREE.Box3();
    const wallwithdoorBox = new THREE.Box3();
    const doorHoleBox = new THREE.Box3();
    const smallwallBox = new THREE.Box3();
    const ladderBox = new THREE.Box3();
    let doorHoleCaptured = false;

    /*-------------------ladder state------------------*/
    let onLadder = false;

    /*-------------npc movement / vision-------------*/
    const NPCRay = new THREE.Raycaster();
    const npcPhysics = { vy: 0 };
    const MAX_BLOCKS_NPC = 30;
    const npcmoveStates = { firstdone: false };
    let caught = false;

    const down = (e) => {
      keys[e.code] = true;

      if (e.code === 'KeyG' && inventoryref.current) {
        inventoryref.current.style.display = 'grid';
      }

      if (e.code === 'KeyE' && itemsref.current.includes('old_key') && !doorOpen) {
        doorOpen = true;
        doorSounds[1].play();
        Doorref.current?.setAttribute('gltf-model', '#celldoorModel');
        Doorref.current?.setAttribute('animation-mixer', 'loop: once; clampWhenFinished: true');
        Doorref.current?.setAttribute('position', '14.97 0 26.2');
      } 
       if (e.code === 'KeyE' && !itemsref.current.includes('old_key')){
        doorSounds[2].play();
      }

      if (e.code === 'Space' && playerPhysics.onGround) {
        playerPhysics.vy = JUMP;
        JumpEffects = true;
      }
      
      if (onLadder && e.code === 'Space') {
        const forwardX = -Math.sin(yaw);
        const forwardZ = -Math.cos(yaw);
        const pushDist = 2;

        if (0 <= walkref.current.object3D.rotation.y && Math.PI >= walkref.current.object3D.rotation.y) {
          walkref.current.object3D.position.x += forwardX * pushDist;
          walkref.current.object3D.position.z += forwardZ * pushDist;
        }

        onLadder = false;
        window.removeEventListener('mousemove', onMouseMovefixed);
        window.addEventListener('mousemove', onMouseMovenormal);
      }

      if (e.code === 'Escape') {
        menuSounds[0].play();
        setPause((p) => !p);
      }
    };

    const up = (e) => {
      keys[e.code] = false;

      if (e.code === 'KeyG' && inventoryref.current) {
        inventoryref.current.style.display = 'none';
      }
    };

    // was two identical functions (onMouseMovenormal / onMouseMovefixed) —
    // same body, so it's now one function under both names.
    const onMouseMovenormal = (e) => {
      if (!document.pointerLockElement) return;

      yaw -= e.movementX * SENS;
      yaw = ((yaw + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      pitch = Math.max(-1.55, Math.min(1.55, pitch - e.movementY * SENS));

      if (walkref.current?.object3D) walkref.current.object3D.rotation.y = yaw;
      if (camref.current?.object3D) camref.current.object3D.rotation.x = pitch;
    };
    const onMouseMovefixed = onMouseMovenormal;

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

    let blockedwall1 = false, blockedwall2 = false, blockedwall3 = false,
        blockedwallwithdoor = false, blockedsmallwall = false;

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('mousemove', onMouseMovenormal);
    window.addEventListener('click', onClick);

    let raf;
    let last = 0;

    const loop = (now) => {
      raf = requestAnimationFrame(loop);

      const dt = last !== 0 ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      if (pauseRef.current) 
      {
        return;
      }
       
      if (!walkref.current?.object3D || !npcpoliceref.current?.object3D) return;

      const distNpcPlayer = Math.hypot(
        walkref.current.object3D.position.x - npcpoliceref.current.object3D.position.x,
        walkref.current.object3D.position.z - npcpoliceref.current.object3D.position.z
      );

      const land = landref.current?.getObject3D('mesh');
      const stairsMesh = stairref.current?.getObject3D('mesh');
      const secondMesh = secondfloorref.current?.getObject3D('mesh');

      let wallsReady = false;

      if (
        wallref.current?.object3D && wallref1.current?.object3D && wallref2.current?.object3D &&
        wallwithdoorref.current?.object3D && smallwallref.current?.object3D &&
        ladderref.current?.object3D && stairref.current?.object3D
      ) {
        wallsReady = true;

        wallBox1.setFromObject(wallref.current.object3D).expandByScalar(0.5);
        wallBox2.setFromObject(wallref1.current.object3D).expandByScalar(0.5);
        wallBox3.setFromObject(wallref2.current.object3D).expandByScalar(0.5);
        wallwithdoorBox.setFromObject(wallwithdoorref.current.object3D);
        smallwallBox.setFromObject(smallwallref.current.object3D).expandByScalar(0.5);
        ladderBox.setFromObject(ladderref.current.object3D).expandByScalar(0.5);

        if (!doorHoleCaptured && Doorref.current?.object3D) {
          const tempDoorHoleBox = new THREE.Box3().setFromObject(Doorref.current.object3D);

          if (!tempDoorHoleBox.isEmpty()) {
            doorHoleBox.copy(tempDoorHoleBox).expandByScalar(0.3);
            doorHoleCaptured = true;
          }
        }
      }

      if (wallsReady) {
        const isOnLadderNow = ladderBox.containsPoint(walkref.current.object3D.position);

        if (isOnLadderNow !== onLadder) {
          onLadder = isOnLadderNow;
          window.removeEventListener('mousemove', onMouseMovenormal);
          window.removeEventListener('mousemove', onMouseMovefixed);
          window.addEventListener('mousemove', onLadder ? onMouseMovefixed : onMouseMovenormal);
        }
      }

      if (land) {
        PlayerRay.set(
          new THREE.Vector3(
            walkref.current.object3D.position.x,
            walkref.current.object3D.position.y + STEP,
            walkref.current.object3D.position.z
          ),
          DOWN
        );

        const hit = PlayerRay.intersectObjects([land, stairsMesh, secondMesh].filter(Boolean), true)[0];

        if (onLadder) {
          playerPhysics.vy = 0;
          playerPhysics.onGround = true;
        }
        if (hit) {
          GravityAndWithJump(hit, walkref.current, playerPhysics, dt, GRAVITY, MAX_STEP);
          if(JumpEffects && playerPhysics.onGround){
          JumpEffects = false;
          footstepSounds[2].play();
      }
        }

        NPCRay.set(
          new THREE.Vector3(
            npcpoliceref.current.object3D.position.x,
            npcpoliceref.current.object3D.position.y + STEP,
            npcpoliceref.current.object3D.position.z
          ),
          DOWN
        );

        const connect = NPCRay.intersectObject(land, true)[0];
        GravityAndWithJump(connect, npcpoliceref.current, npcPhysics, dt, GRAVITY, MAX_STEP);

        if (wallsReady && !caught) {
          const obstacleBoxes = [wallBox1, wallBox2, wallBox3, wallwithdoorBox, smallwallBox];

          const playerInFOV = isPlayerInNpcFOV(
            THREE,
            npcpoliceref.current.object3D,
            walkref.current.object3D.position,
            90,
            MAX_BLOCKS_NPC
          );

          const playerVisible = playerInFOV && hasLineOfSight(
            THREE,
            npcpoliceref.current.object3D.position,
            walkref.current.object3D.position,
            obstacleBoxes
          );

          if (playerVisible && distNpcPlayer <= MAX_BLOCKS_NPC) {
            caught = true;
          }
        }

        if (!caught) {
          NpcMovement(npcmoveStates, npcpoliceref.current.object3D, Math.PI / 2, -Math.PI / 2, 0, 50, 10, dt);
        }
      }

      const X = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
      const Z = (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0);

      if (!X && !Z) {
      stepIndex = 0;
      stepTimer = STEP_INTERVAL;
      return;
}

      const len = Math.sqrt(X ** 2 + Z ** 2);
      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);
      const dx = (X * cos + Z * sin) / len;
      const dz = (-X * sin + Z * cos) / len;

      playerPhysics.nx = walkref.current.object3D.position.x + dx * SPEED * dt;
      playerPhysics.nz = walkref.current.object3D.position.z + dz * SPEED * dt;

      if (wallsReady) {
        blockedwall1 = wallslimiter(walkref.current.object3D, wallBox1, playerPhysics);
        blockedwall2 = wallslimiter(walkref.current.object3D, wallBox2, playerPhysics);
        blockedwall3 = wallslimiter(walkref.current.object3D, wallBox3, playerPhysics);

        const inholedoor = doorHoleCaptured &&
          playerPhysics.nx > doorHoleBox.min.x && playerPhysics.nx < doorHoleBox.max.x &&
          playerPhysics.nz > doorHoleBox.min.z && playerPhysics.nz < doorHoleBox.max.z;

        blockedwallwithdoor = wallslimiter(walkref.current.object3D, wallwithdoorBox, playerPhysics) && !(doorOpen && inholedoor);
        blockedsmallwall = wallslimiter(walkref.current.object3D, smallwallBox, playerPhysics);
      }

      if (!onLadder && !blockedwall1 && !blockedwall2 && !blockedwall3 && !blockedwallwithdoor && !blockedsmallwall) {
        walkref.current.object3D.position.x = playerPhysics.nx;
        walkref.current.object3D.position.z = playerPhysics.nz;
         if (playerPhysics.onGround) {
          stepTimer += dt;
          if (stepTimer >= STEP_INTERVAL) {
            stepTimer = 0;
            const s = footstepSounds[stepIndex];
            s.currentTime = 0;
            s.play().catch(() => {});
            stepIndex = (stepIndex + 1) % STEP_COUNT;
          }
      }
      }

      if (onLadder) {
        const dy = (keys.KeyW ? 1 : 0) * Math.sin(pitch);
        walkref.current.object3D.position.y += dy * SPEED * dt;
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
}