//@ts-nocheck
'use client'
import {useEffect ,useRef} from "react";
import {
  wallslimiter,
  NpcMovement,
  GravityAndWithJump,
  isPlayerInNpcFOV,
  hasLineOfSight,
  MoveCollide,
  setupSubclips,
  setAnimation,
  POLICE_RANGES,
  spawnNpc,
  NearMeshes
} from "@/app/utils/vrPhysics/page";
import { computeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
export function useVRGameLoop(refs, itemsref, setItems, pauseRef, timerRef, setPause, setinterialtimer , setChatStep) {
  /*------------Thermometer-----------*/
    const progress_firstbar = useRef(0);
    const progress_secondbar = useRef(0);
  useEffect(() => {
    require('aframe');
    require('aframe-extras');

    const THREE = window.AFRAME.THREE;

    const {
      walkref, camref, inventoryref,
      landref, saveRef, chooseref ,solidbarref , solidbarref1 , solidbarref2 , rasptool , brokensolidref ,brokensolidref1,
      progressfillref , alertfillref , roperef , coverref , chairref1 , chairref2 , chairref3 , NPC1pressE , npcpoliceref
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
    let policeReady = false;
    let currentClip = '';
    let animationRetry = 0;

    const npcs = [];
    const policeNpcs = [];
    let npcsSpawned = false;
    const NPC_SPAWNS = [
      { x: 4.6, y: 2.6, z: 0, yaw: 180, clip: 'idle' },
    ];

    let policeSpawned = false;
    const POLICE_SPAWNS = [
      { x: 0.85, y: 2.6, z: -5.11, yaw: 50, scale: 0.9, clip: 'idle' },
      { x: 5.88, y: 2.6, z: -10.56, yaw: 50, scale: 0.9, clip: 'idle' },
      { x: 5.07, y: 0.09, z: -9.15, yaw: 50, scale: 0.9, clip: 'idle' },
      { x: 2.42, y: 0.09, z: -6.12, yaw: 50, scale: 0.9, clip: 'idle' },
    ];

    /*--------------------body auto-fit (feet on ground, centered under camera)-----------------*/
    const BODY_BACK = 0.3;
    let bodyFitted = false;
    let bodyFitTimer = 0;
    const bodyBox = new THREE.Box3();
    const bodyCenter = new THREE.Vector3();
    const bodyFoot = new THREE.Vector3();

    const fitBody = () => {
      const el = chooseref.current;
      const mesh = el?.getObject3D('mesh');
      const rig = walkref.current?.object3D;
      if (!mesh || !rig) return false;

      // measure with yaw = 0 so the fit does not depend on where the player is looking
      const savedYaw = rig.rotation.y;
      rig.rotation.y = 0;
      rig.updateMatrixWorld(true);

      bodyBox.setFromObject(mesh, true);
      const ok = !bodyBox.isEmpty();
      if (ok) {
        bodyBox.getCenter(bodyCenter);
        bodyFoot.set(bodyCenter.x, bodyBox.min.y, bodyCenter.z);
        rig.worldToLocal(bodyCenter);
        rig.worldToLocal(bodyFoot);
      }

      rig.rotation.y = savedYaw;
      rig.updateMatrixWorld(true);
      if (!ok) return false;

      el.object3D.position.x -= bodyCenter.x;
      el.object3D.position.z -= bodyCenter.z - BODY_BACK;
      el.object3D.position.y -= bodyFoot.y;
      return true;
    };

    chooseref.current?.setAttribute('visible', false);

    
    /*--------------------first-person configs-----------------*/
    const raycaster = new THREE.Raycaster();
    let sceneEl = null;
    const getCam = () => {
      sceneEl = sceneEl || document.querySelector('a-scene');
      return sceneEl?.camera;
    };
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
    // The old loop ran two ground blocks and integrated gravity TWICE per frame.
    // These are the single-step values that give the exact same jump as before.
    const GRAVITY = 120;
    const STEP = 1;
    const MAX_STEP = 0.4;
    const STEP_UP = MAX_STEP + 0.05; // highest ledge we walk onto (wall rays start just above it)
    const DOWN = new THREE.Vector3(0, -1, 0);
    const PlayerRay = new THREE.Raycaster();
    const WallRay = new THREE.Raycaster();
    WallRay.firstHitOnly = true;
    const GroundRay = new THREE.Raycaster();
    GroundRay.far = STEP + MAX_STEP + 0.1;
    const CAM_H = 1.7;
    const WALL_RADIUS = 0.25;
    const WALL_FRONT = 0.3;
    const WALL_HEIGHTS = [STEP_UP, 0.9, 1.3, CAM_H];
    const NEAR_R = 4;
    let landPrepared = false;

    let chairsPrepared = false;

    const prepareChairs = () => {
  const els = [chairref1, chairref2, chairref3].map((r) => r?.current);
  if (els.some((el) => !el?.getObject3D('mesh'))) return;
  chairsPrepared = true;
  els.forEach((el) => {
    el.object3D.updateMatrixWorld(true);
    el.getObject3D('mesh').traverse((o) => {
      if (!o.isMesh) return;
      [].concat(o.material).forEach((m) => (m.side = THREE.DoubleSide));
      if (!o.geometry.boundsTree) computeBoundsTree.call(o.geometry);
      o.raycast = acceleratedRaycast;
      landMeshes.push({ mesh: o, box: new THREE.Box3().setFromObject(o) });
    });
  });
  nx0 = Infinity;
};

    const JUMP = 24; // see GRAVITY
    let JumpEffects = false;

        /*-------------------window escape cutscene------------------*/
    let cine = null;
    let ladderTimer = 0;
    let ladderIndex = 6;
    const CINE_HANG = 1;
    const CINE_SPEED = 1.6;
    const smooth = (t) => t * t * (3 - 2 * t);
    const lerpAngle = (a, b, t) => a + ((((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI) * t;

    const startCine = () => {
      const ropeMesh = roperef.current.getObject3D('mesh');
      if (!ropeMesh) return;
      const box = new THREE.Box3().setFromObject(ropeMesh);
      const c = box.getCenter(new THREE.Vector3());
      const bar = solidbarref2.current.object3D.position;
      const land = landref.current?.getObject3D('mesh');
      let groundY = box.min.y;
      if (land) {
        PlayerRay.set(new THREE.Vector3(c.x, box.min.y + 0.5, c.z), DOWN);
        const h = PlayerRay.intersectObject(land, true)[0];
        if (h) groundY = h.point.y;
      }
      const topY = box.max.y - CINE_HANG;
      const A = walkref.current.object3D.position.clone();
      const B = new THREE.Vector3(bar.x, topY, bar.z);
      const C = new THREE.Vector3(c.x, topY, c.z);
      const D = new THREE.Vector3(c.x, groundY, c.z);
      cine = {
        t: 0, A, B, C, D,
        T1: 1, T2: 0.5, T3: Math.max((topY - groundY) / CINE_SPEED, 0.5),
        yaw0: yaw, yawT: Math.atan2(-(C.x - A.x), -(C.z - A.z)), pitch0: pitch,
      };
      setAnimation(chooseref,'idle', 0.0001);
    };

    /*-------------------run configs------------------*/
    let runEffect = false;
    const PICKUPDIST = 3;


    
    let alertLevel = 0;
    const ALERT_DECAY = 10;

    /*------------------pick up objects---------------*/
    const ispicked = false;

    /*-------------hover states------------------*/
    const HOVERDIST = 1;
    const NPC_HOVERDIST = 3;
    let hoverTimer = 0;

    /*-------------input event handlers-------------*/
    const down = (e) => {
      keys[e.code] = true;

      if (cine && e.code !== 'Escape') return;
      

      if (NPC1pressE.current && e.code !== 'Escape') return;

      if (e.code === 'KeyE' && npcs.some((n) => IsHovered({ current: n.el }, NPC_HOVERDIST))) {
        setChatStep(0);
        return;
      }

      if(e.code === 'KeyE' && !itemsref.current.includes("/assets/tools/rasp.png")) PickUp(rasptool , "/assets/tools/rasp.png" ,PICKUPDIST);
     
      if(e.code === 'KeyE' && !itemsref.current.includes("/assets/tools/cover.jpg")) PickUp(coverref , "/assets/tools/cover.jpg" ,PICKUPDIST);

      if(e.code === 'KeyE' && IsHovered(solidbarref, HOVERDIST) && itemsref.current.includes("/assets/tools/rasp.png")){
        setGauges(true);
        addProgress(1 ,progress_firstbar , solidbarref , brokensolidref);
        addAlert(2 , progress_firstbar);
        }
      
      if(e.code === 'KeyE' && IsHovered(solidbarref1, HOVERDIST) && itemsref.current.includes("/assets/tools/rasp.png")){
        setGauges(true);
        addProgress(1 ,progress_secondbar , solidbarref1 , brokensolidref1);
        addAlert(2 , progress_secondbar);
        }  
      
        if(e.code === 'KeyE' && IsHovered(solidbarref2 , HOVERDIST) && itemsref.current.includes("/assets/tools/cover.jpg")){
        roperef.current.object3D.visible = true;
        if (progress_firstbar.current >= 100 && progress_secondbar.current >= 100 && !cine) startCine();
      }

      if(e.code === 'ShiftLeft'){
        setAnimation(chooseref,'run' , 0.0001);
        SPEED = 18;
        runEffect = true;
        }

      if (e.code === 'KeyG' && inventoryref.current) {
        inventoryref.current.style.display = 'grid';
      }

     if (e.code === 'Space' && playerPhysics.onGround) {
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
        setAnimation(chooseref,'walk' , 0.0001);
        SPEED = 9;
        runEffect = false;
        }

      if (e.code === 'KeyG' && inventoryref.current) {
        inventoryref.current.style.display = 'none';
      }
    };

    const onMouseMovenormal = (e) => {
      if (!document.pointerLockElement || cine || NPC1pressE.current) return;

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

      const cam = getCam();

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
          items: itemsref.current,
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
        setItems(s.items ?? []);
        if (typeof s.timer === "number") setinterialtimer(s.timer);
        return true;
      } catch { return false; }
    };

    saveRef.current = { save, load };
    let pendingLoad = new URLSearchParams(window.location.search).get('continue') === '1';

    

    let raf;
    let last = 0;

    const landMeshes = [];
let nearby = [];
let nx0 = Infinity;
let nz0 = Infinity;

const prepareLand = (land) => {
  land.updateMatrixWorld(true);
  land.traverse((o) => {
    if (!o.isMesh) return;
    [].concat(o.material).forEach((m) => (m.side = THREE.DoubleSide));
    if (!o.geometry.boundsTree) computeBoundsTree.call(o.geometry);
    o.raycast = acceleratedRaycast;
    landMeshes.push({ mesh: o, box: new THREE.Box3().setFromObject(o) });
  });
  
};

const refreshNearby = (p) => {
  if (Math.hypot(p.x - nx0, p.z - nz0) < 1) return;
  nx0 = p.x;
  nz0 = p.z;
  nearby = landMeshes
    .filter(({ box }) =>
      p.x > box.min.x - NEAR_R && p.x < box.max.x + NEAR_R &&
      p.z > box.min.z - NEAR_R && p.z < box.max.z + NEAR_R)
    .map(({ mesh }) => mesh);
};

const PickUp = (ref, url, dist = PICKUPDIST) => {
  const el = ref.current;
  const mesh = el?.getObject3D('mesh');
  const cam = getCam();
  if (!mesh || !cam || !el.object3D.visible || pauseRef.current) return;

  raycaster.setFromCamera({ x: 0, y: 0 }, cam);
  const box = new THREE.Box3().setFromObject(mesh).expandByScalar(0.05);
  const point = raycaster.ray.intersectBox(box, new THREE.Vector3());
  if (!point || point.distanceTo(raycaster.ray.origin) > dist) return;

  el.object3D.visible = false;
  setItems((s) => [...(s ?? []), url]);
};

const IsHovered = (ref , dist = HOVERDIST) => {
  const el = ref.current;
  const mesh = el?.getObject3D('mesh');
  const cam = getCam();
  if(!mesh || !cam || !el.object3D.visible || pauseRef.current) return false;

  raycaster.setFromCamera({x : 0 , y : 0} , cam);
  const hit = raycaster.intersectObject(mesh , true)[0];
  return !!hit && hit.distance <= dist;
}

const drawGauges = (progressref) => {
  if (progressref && progressfillref.current)
    progressfillref.current.style.height = progressref.current + '%';
  if (alertfillref.current) alertfillref.current.style.height = alertLevel + '%';
};

const setGauges = (v) => {
  [progressfillref, alertfillref].forEach((r) => {
    const root = r.current?.parentElement?.parentElement;
    if (root) root.style.visibility = v ? 'visible' : 'hidden';
  });
};

const addProgress = (v , progressref , refbar , refbrokenbar) => {
  progressref.current = Math.min(100, Math.max(0, progressref.current + v));
  drawGauges(progressref);
  if (progressref.current >= 100) { 
    setGauges(false);
    refbar.current.object3D.visible = false;
    refbrokenbar.current.object3D.visible = true;
    
  }
};

const addAlert = (v , progressref) => {
  alertLevel = Math.min(100, Math.max(0, alertLevel + v));
  drawGauges(progressref);
  if (alertLevel >= 100) {
    return;
  }
};

const HeadRay = new THREE.Raycaster();
HeadRay.firstHitOnly = true;
const UP = new THREE.Vector3(0, 1, 0);
const HEAD = CAM_H;
const headOrigin = new THREE.Vector3();
const probeOrigin = new THREE.Vector3();
const probeHits = [];
const GROUND_PROBES = [[0, 0], [0.2, 0], [-0.2, 0], [0, 0.2], [0, -0.2]];

const npcGround = (npc, dt) => {
  const p = npc.el.object3D.position;
  const meshes = NearMeshes(landMeshes, p.x, p.z, NEAR_R);

  let hit = null;
  for (let i = 0; i < GROUND_PROBES.length; i++) {
    probeOrigin.set(p.x + GROUND_PROBES[i][0], p.y + STEP, p.z + GROUND_PROBES[i][1]);
    GroundRay.set(probeOrigin, DOWN);
    probeHits.length = 0;
    GroundRay.intersectObjects(meshes, false, probeHits);
    for (let j = 0; j < probeHits.length; j++) {
      if (probeHits[j].point.y <= p.y + STEP_UP) {
        if (!hit || probeHits[j].point.y > hit.point.y) hit = probeHits[j];
        break;
      }
    }
  }

  GravityAndWithJump(hit, npc.el, npc.physics, dt, GRAVITY, MAX_STEP);
};

    const loop = (now) => {
      raf = requestAnimationFrame(loop);

      const dt = last !== 0 ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      if (pauseRef.current) return;
      if (!walkref.current?.object3D) return;
      for (let i = 0; i < npcs.length; i++) npcs[i].mixer.update(dt);
      for (let i = 0; i < policeNpcs.length; i++) policeNpcs[i].mixer.update(dt);
            if (cine) {
        const s = cine;
        const p = walkref.current.object3D.position;
        s.t += dt;
        const { t, T1, T2, T3 } = s;
        const ease = smooth(Math.min(t / T1, 1));
        yaw = lerpAngle(s.yaw0, s.yawT, ease);

        if (t < T1) {
          p.lerpVectors(s.A, s.B, ease);
          pitch = s.pitch0 * (1 - ease);
        } else if (t < T1 + T2) {
          p.lerpVectors(s.B, s.C, smooth((t - T1) / T2));
          pitch = 0;
        } else if (t < T1 + T2 + T3) {
          const k = (t - T1 - T2) / T3;
          p.lerpVectors(s.C, s.D, k);
          pitch = -0.5 * Math.sin(k * Math.PI);
          
      
        } else {
          p.copy(s.D);
          pitch = 0;
          cine = null;
          playerPhysics.vy = 0;
          JumpEffects = false;
        }

        walkref.current.object3D.rotation.y = yaw;
        camref.current.object3D.rotation.x = pitch;
        refreshNearby(p);
        return;
      }

      if (!keys.KeyE && alertLevel > 0) addAlert(-ALERT_DECAY * dt);

      hoverTimer += dt;
      if (hoverTimer >= 0.1) {
        hoverTimer = 0;
        if (!IsHovered(solidbarref, HOVERDIST) && !IsHovered(solidbarref1, HOVERDIST)) setGauges(false);
      }

      if (!clipsReady && animationRetry < 300) {
        animationRetry++;

        if (setupSubclips(chooseref)) {
          currentClip = '';
          setAnimation(chooseref,'idle', 0.0001);
          clipsReady = true;
        }
      }

      if (!policeReady && setupSubclips(npcpoliceref, POLICE_RANGES)) {
        setAnimation(npcpoliceref, 'idle', 0.0001, POLICE_RANGES);
        policeReady = true;
      }

      if (policeReady && !policeSpawned) {
        const scn = document.querySelector('a-scene');
        if (scn) {
          policeSpawned = true;
            POLICE_SPAWNS.forEach((s) => {
            const npc = spawnNpc(THREE, npcpoliceref, scn, s, POLICE_RANGES);
            if (npc) policeNpcs.push(npc);
            console.log('[police] spawned', !!npc);
            if (npc) setTimeout(() => {
              npc.el.object3D.updateMatrixWorld(true);
              const b = new THREE.Box3().setFromObject(npc.mesh);
              console.log('[police] pos', npc.el.object3D.position.toArray(), 'min', b.min.toArray(), 'max', b.max.toArray());
            }, 2000);
          });
        }
      }

            if (clipsReady && !npcsSpawned) {
        const scn = document.querySelector('a-scene');
        if (scn) {
          npcsSpawned = true;
          NPC_SPAWNS.forEach((s) => {
            const npc = spawnNpc(THREE, chooseref, scn, s);
            if (npc) npcs.push(npc);
          });
        }
      }

      if (!bodyFitted && (clipsReady || animationRetry >= 300)) {
        bodyFitTimer += dt;
        if (bodyFitTimer > 0.4) {
          fitBody();
          bodyFitted = true;
          chooseref.current?.setAttribute('visible', true);
        }
      }

      if (pendingLoad && camref.current?.object3D) {
        pendingLoad = false;
        load();
      }

          const land = landref.current?.getObject3D('mesh');

          if (land && !landPrepared) {
        landPrepared = true;
        prepareLand(land);
      }
      if (!chairsPrepared) prepareChairs();

      if (land) {
        const p = walkref.current.object3D.position;
        refreshNearby(p);

        if (playerPhysics.vy > 0) {
          headOrigin.set(p.x, p.y + HEAD, p.z);
          HeadRay.set(headOrigin, UP);
          HeadRay.far = playerPhysics.vy * dt + 0.1;
          probeHits.length = 0;
          HeadRay.intersectObjects(nearby, false, probeHits);
          if (probeHits.length) playerPhysics.vy = 0;
        }

        let hit = null;
        for (let i = 0; i < GROUND_PROBES.length; i++) {
          probeOrigin.set(p.x + GROUND_PROBES[i][0], p.y + STEP, p.z + GROUND_PROBES[i][1]);
          GroundRay.set(probeOrigin, DOWN);
          probeHits.length = 0;
          GroundRay.intersectObjects(nearby, false, probeHits);
          for (let j = 0; j < probeHits.length; j++) {
            if (probeHits[j].point.y <= p.y + STEP_UP) {
              if (!hit || probeHits[j].point.y > hit.point.y) hit = probeHits[j];
              break;
            }
          }
        }

        GravityAndWithJump(hit, walkref.current, playerPhysics, dt, GRAVITY, MAX_STEP);

        if (JumpEffects && playerPhysics.onGround) {
          JumpEffects = false;
          footstepSounds[2].play();
        }
      }

      if (land) {
        for (let i = 0; i < npcs.length; i++) npcGround(npcs[i], dt);
        for (let i = 0; i < policeNpcs.length; i++) npcGround(policeNpcs[i], dt);
      }

      const X = NPC1pressE.current ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
      const Z = NPC1pressE.current ? 0 : (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0);


      if (playerPhysics.onGround && !JumpEffects) {
        if (!X && !Z) {
          setAnimation(chooseref,'idle', 0.0001);
          stepTimer = STEP_INTERVAL;
        } else {
          if(runEffect){
            setAnimation(chooseref,'run', 0.0001);
          }
          else{
            setAnimation(chooseref,'walk', 0.0001);
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
        const mx = dx * SPEED * dt;
        const mz = dz * SPEED * dt;

        if (land) {
          MoveCollide(THREE, nearby, p, mx, mz, WALL_RADIUS, STEP_UP, CAM_H);
        } else {
          p.x += mx;
          p.z += mz;
        }

        playerPhysics.nx = p.x;
        playerPhysics.nz = p.z;
      }
      console.log(walkref.current.object3D.position.x)
      console.log(walkref.current.object3D.position.y)
      console.log(walkref.current.object3D.position.z)
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      npcs.forEach((n) => n.dispose());
      policeNpcs.forEach((n) => n.dispose());
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('mousemove', onMouseMovenormal);
      window.removeEventListener('click', onClick);
    };
  }, []);
}