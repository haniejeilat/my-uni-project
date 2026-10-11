//@ts-nocheck
'use client'
import { useEffect } from "react";
import {
  wallslimiter,
  NpcMovement,
  GravityAndWithJump,
  isPlayerInNpcFOV,
  hasLineOfSight,
  WallCollision,
} from "@/app/utils/vrPhysics/page";

export function useVRGameLoop(refs, itemsref, setItems, pauseRef, timerRef, setPause, setinterialtimer) {
  useEffect(() => {
    require('aframe');
    require('aframe-extras');

    const THREE = window.AFRAME.THREE;

    const {
      walkref, camref, inventoryref,
      landref, saveRef, chooseref
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

    
    /*--------------------Subclips setup & animation-mixer-----------------*/
    let clipsReady = false;
    let currentClip = '';
    let animationRetry = 0;

       const setupSubclips = () => {
      const el = chooseref?.current;
      if (!el) return false;

      const model = el.getObject3D('mesh');
      if (!model) return false;

      const gltfComponent = el.components['gltf-model'];
      const animations =
        gltfComponent?.model?.animations ?? model.animations;

      if (!animations || animations.length === 0) return false;

      if (clipsReady) return true;

      const mainClip = animations[0];
      const FPS = 30;

     

      const idleClip = 
        THREE.AnimationUtils.subclip(mainClip, 'idle', 1, 67, FPS)
      

      const walkClip = 
        THREE.AnimationUtils.subclip(mainClip, 'walk', 68, 99, FPS)
    

      const jumpClip = THREE.AnimationUtils.subclip(
        mainClip, 'jump', 101, 142, FPS
      );

      const runClip = THREE.AnimationUtils.subclip(
        mainClip, 'run' , 178 , 206 , FPS
      );

      const clips = [idleClip, walkClip, jumpClip , runClip];

      model.animations = clips;

      if (gltfComponent?.model) {
        gltfComponent.model.animations = clips;
      }

      clipsReady = true;
      animationRetry = 0;

      return true;
    };

    const setAnimation = (clipName, crossFade = 0.2) => {
      const targetEntity = chooseref?.current;
      if (!targetEntity) return;

      if (!clipsReady && !setupSubclips()) return;

      currentClip = clipName;

      targetEntity.setAttribute('animation-mixer', {
        clip: clipName,
        crossFadeDuration: crossFade,
        loop: clipName === 'jump' ? 'once' : 'repeat',
        clampWhenFinished: clipName === 'jump',
      });
    };
    /*--------------------first-person configs-----------------*/
    const raycaster = new THREE.Raycaster();
    let SPEED = 9;
    const SENS = 0.0022;
    const keys = {};
    let yaw = 0;
    let pitch = 0;
    let doorOpen = false;
    const playerPhysics = { vy: 0, onGround: false, nx: 0, ny: 0 };

    /*--------------------sound loop---------------------*/
    let stepIndex = 0;
    let stepTimer = 0;
    const STEP_INTERVAL = 0.4;

    /*-------------------gravity configs------------------*/
    const GRAVITY = 30;
    const STEP = 1;
    const MAX_STEP = 0.4;
    const DOWN = new THREE.Vector3(0, -1, 0);
    const PlayerRay = new THREE.Raycaster();
    const WallRay = new THREE.Raycaster();
    const WALL_RADIUS = 0.35;
    const WALL_HEIGHTS = [STEP + 0.05];
    let landPrepared = false;
    const JUMP = 12;
    let JumpEffects = false;

    /*-------------------run configs------------------*/
    let runEffect = false;

    /*-------------input event handlers-------------*/
    const down = (e) => {
      keys[e.code] = true;
      if(e.code === 'ShiftLeft'){
        setAnimation('run' , 0.0001);
        SPEED = 18;
        runEffect = true;
        }
      
      if (e.code === 'KeyG' && inventoryref.current) {
        inventoryref.current.style.display = 'grid';
      }

      if (e.code === 'Space' && playerPhysics.onGround) {
        setAnimation('jump', 0.1);
        playerPhysics.vy = JUMP;
        JumpEffects = true;
      }

      if (e.code === 'Escape') {
        menuSounds[0].play();
        setPause((p) => !p);
      }
    };

    const up = (e) => {
      keys[e.code] = false;

      if(e.code === 'ShiftLeft'){
        setAnimation('walk' , 0.0001);
        SPEED = 9;
        runEffect = false;
        }

      if (e.code === 'KeyG' && inventoryref.current) {
        inventoryref.current.style.display = 'none';
      }
    };

    const onMouseMovenormal = (e) => {
      if (!document.pointerLockElement) return;

      yaw -= e.movementX * SENS;
      yaw = ((yaw + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      pitch = Math.max(-1.55, Math.min(1.55, pitch - e.movementY * SENS));

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

      if (!cam) return;

      raycaster.setFromCamera({ x: 0, y: 0 }, cam);
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('mousemove', onMouseMovenormal);
    window.addEventListener('click', onClick);

    /*-------------------save / load------------------*/
    const SAVE_KEY = 'prison_breakout_save';
    const save = () => {
      try {
        const p = walkref.current.object3D;
        localStorage.setItem(SAVE_KEY, JSON.stringify({
          player: { x: p.position.x, y: p.position.y, z: p.position.z, yaw, pitch },
          timer: timerRef.current,
        }));
        return true;
      } catch { return false; }
    };

    const load = () => {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const s = JSON.parse(raw);
        const p = walkref.current.object3D;
        yaw = s.player.yaw;
        pitch = s.player.pitch;
        p.position.set(s.player.x, s.player.y, s.player.z);
        p.rotation.y = yaw;
        camref.current.object3D.rotation.x = pitch;
        playerPhysics.vy = 0;
        setItems(s.items);
        if (typeof s.timer === "number") setinterialtimer(s.timer);
        return true;
      } catch { return false; }
    };

    saveRef.current = { save, load };  
    let pendingLoad = new URLSearchParams(window.location.search).get('continue') === '1';

    let raf;
    let last = 0;

    const loop = (now) => {
      raf = requestAnimationFrame(loop);

      const dt = last !== 0 ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      if (pauseRef.current) return;
      if (!walkref.current?.object3D) return;

  
      if (!clipsReady && animationRetry < 300) {
        animationRetry++;

        if (setupSubclips()) {
          currentClip = '';
          setAnimation('idle', 0.0001);
        }
      }

      if (pendingLoad && camref.current?.object3D) {
        pendingLoad = false;
        load();
      }

      const land = landref.current?.getObject3D('mesh');

      if (land && !landPrepared) {
      landPrepared = true;
      land.traverse((o) => {
        if (o.isMesh) [].concat(o.material).forEach((m) => (m.side = THREE.DoubleSide));
      });
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

        const hit = PlayerRay.intersectObjects([land].filter(Boolean), true)[0];

        GravityAndWithJump(hit, walkref.current, playerPhysics, dt, GRAVITY, MAX_STEP);

        
        if (JumpEffects && playerPhysics.onGround) {
          JumpEffects = false;
          footstepSounds[2].play();
        }
      }

      const X = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
      const Z = (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0);

      
      if (playerPhysics.onGround && !JumpEffects) {
        if (!X && !Z) {
          setAnimation('idle', 0.0001);
          stepTimer = STEP_INTERVAL;
        } else {
          if(runEffect){
            setAnimation('run', 0.0001);
          }
          else{
            setAnimation('walk', 0.0001);
          }
          
        }
      }

      if (X || Z) {
        if (playerPhysics.onGround) {
          stepTimer += dt;
          if (stepTimer >= STEP_INTERVAL) {
            stepTimer = 0;
            const s = footstepSounds[stepIndex];
            s.currentTime = 0;
            s.play();
            stepIndex = (stepIndex + 1) % 4;
          }
        }

        const len = Math.sqrt(X ** 2 + Z ** 2);
        const sin = Math.sin(yaw);
        const cos = Math.cos(yaw);
        const dx = (X * cos + Z * sin) / len;
        const dz = (-X * sin + Z * cos) / len;

        const p = walkref.current.object3D.position;
let mx = dx * SPEED * dt;
let mz = dz * SPEED * dt;

if (land) {
  const m = WallCollision(THREE, WallRay, land, p, mx, mz, WALL_RADIUS, WALL_HEIGHTS);
  mx = m.x;
  mz = m.z;
}

playerPhysics.nx = p.x + mx;
playerPhysics.nz = p.z + mz;
p.x = playerPhysics.nx;
p.z = playerPhysics.nz;
      }
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('mousemove', onMouseMovenormal);
      window.removeEventListener('click', onClick);
    };
  }, []);
}