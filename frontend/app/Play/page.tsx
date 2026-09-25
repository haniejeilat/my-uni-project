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

    /*-------------------gravity configs------------------*/
    const GRAVITY = 30;
    const STEP = 1;
    const DOWN = new THREE.Vector3(0, -1, 0);
    const groundRay = new THREE.Raycaster();

    let vy = 0;
    const JUMP = 12;
    let onGround = false;

    /*-------------------walls configs------------------*/
    const doorRay = new THREE.Raycaster();

    const wallBox1 = new THREE.Box3();
    const wallBox2 = new THREE.Box3();
    const wallBox3 = new THREE.Box3();
    const wallwithdoorBox = new THREE.Box3();
    const doorHoleBox = new THREE.Box3();
    const smallwallBox = new THREE.Box3();

    let doorHoleCaptured = false;

    /*-------------npc movement-------------*/
    const moveRay = new THREE.Raycaster();

    let npcvy = 0;
    let firstdone = false;

    /*-------------npc look-----------*/
    const MAX_BLOCKS_NPC = 30;
    const ENDNPC = 50;
    const STARTNPC = 0;
    let currentXnpc = 0;
    let caught = false;

    /*
      NPC FOV
      90 degrees = 45 degrees لكل جهة
    */
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

      /*
        A-Frame / Three.js forward direction
        مع تصحيح اتجاه الموديل + Math.PI
      */
      const npcRotation = npcObject.rotation.y ;

      const forward = new THREE.Vector3(
        Math.sin(npcRotation),
        0,
        Math.cos(npcRotation)
      );

      forward.normalize();

      const toPlayer = new THREE.Vector3(
        dx,
        0,
        dz
      );

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

      const ray = new THREE.Ray(
        from,
        dir.clone().normalize()
      );

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
        const from = new THREE.Vector3(
          fromPos.x,
          fromPos.y + h,
          fromPos.z
        );

        const to = new THREE.Vector3(
          toPos.x,
          toPos.y + h,
          toPos.z
        );

        const blocked = boxes.some(
          box => segmentIntersectsBox(from, to, box)
        );

        if (!blocked) {
          return true;
        }
      }

      return false;
    }

    const down = (e) => {
      keys[e.code] = true;

      if (
        e.code === 'KeyG' &&
        inventoryref.current
      ) {
        inventoryref.current.style.display = 'grid';
      }

      if (
        e.code === 'KeyE' &&
        itemsref.current.includes('old_key') &&
        !doorOpen
      ) {
        doorOpen = true;

        Doorref.current?.setAttribute(
          'gltf-model',
          '#celldoorModel'
        );

        Doorref.current?.setAttribute(
          'animation-mixer',
          'loop: once; clampWhenFinished: true'
        );

        Doorref.current?.setAttribute(
          'position',
          '14.97 0 26.2'
        );
      }

      if (
        e.code === 'Space' &&
        onGround
      ) {
        vy = JUMP;
      }

      if (e.code === 'Escape') {
        setPause(p => !p);
      }
    };

    const up = (e) => {
      keys[e.code] = false;

      if (
        e.code === 'KeyG' &&
        inventoryref.current
      ) {
        inventoryref.current.style.display = 'none';
      }
    };

    const onMouseMove = (e) => {
      if (!document.pointerLockElement) {
        return;
      }

      yaw -= e.movementX * SENS;
      pitch -= e.movementY * SENS;

      pitch = Math.max(
        -1.55,
        Math.min(1.55, pitch)
      );

      if (walkref.current?.object3D) {
        walkref.current.object3D.rotation.y = yaw;
      }

      if (camref.current?.object3D) {
        camref.current.object3D.rotation.x = pitch;
      }
    };

    const onClick = () => {
      const canvas = document.querySelector(
        'a-scene canvas'
      );

      if (
        canvas &&
        document.pointerLockElement !== canvas
      ) {
        canvas.requestPointerLock();
        return;
      }

      const cam =
        document.querySelector('a-scene')?.camera;

      const key = keyref.current;

      if (!cam || !key?.object3D) {
        return;
      }

      raycaster.setFromCamera(
        { x: 0, y: 0 },
        cam
      );

      if (
        raycaster.intersectObject(
          key.object3D,
          true
        ).length
      ) {
        setItems((prev) =>
          prev.includes('old_key')
            ? prev
            : [...prev, 'old_key']
        );
      }
    };

    window.addEventListener(
      'keydown',
      down
    );

    window.addEventListener(
      'keyup',
      up
    );

    window.addEventListener(
      'mousemove',
      onMouseMove
    );

    window.addEventListener(
      'click',
      onClick
    );

    let raf;
    let last = 0;

    const loop = (now) => {
      raf = requestAnimationFrame(loop);

      let dt;

      if (last !== 0) {
        dt = Math.min(
          (now - last) / 1000,
          0.1
        );
      } else {
        dt = 0;
      }

      last = now;

      if (pauseRef.current) {
        return;
      }

      /*------------------------first-person configs------------------------*/
      const el = walkref.current;
      const npcrel = npcpoliceref.current;

      if (
        !el?.object3D ||
        !npcrel?.object3D
      ) {
        return;
      }

      const pos = el.object3D.position;
      const NPCpos = npcrel.object3D.position;

      /*
        المسافة الحقيقية بين اللاعب والـNPC
      */
      const distNpcPlayer = Math.hypot(
        pos.x - NPCpos.x,
        pos.z - NPCpos.z
      );

      /*------------------gravity configs------------------*/
      const land =
        landref.current?.getObject3D('mesh');

      /*--------------walls configs---------------*/
      const doorel = Doorref.current;
      const Wallrel = wallref.current;
      const Wallrel1 = wallref1.current;
      const Wallrel2 = wallref2.current;
      const Wallrelwithdoor =
        wallwithdoorref.current;
      const SmallWallel =
        smallwallref.current;

      /*------------wall boxes------------*/
      let wallsReady = false;

      if (
        Wallrel?.object3D &&
        Wallrel1?.object3D &&
        Wallrel2?.object3D &&
        Wallrelwithdoor?.object3D &&
        SmallWallel?.object3D
      ) {
        wallsReady = true;

        wallBox1
          .setFromObject(Wallrel.object3D)
          .expandByScalar(0.5);

        wallBox2
          .setFromObject(Wallrel1.object3D)
          .expandByScalar(0.5);

        wallBox3
          .setFromObject(Wallrel2.object3D)
          .expandByScalar(0.5);

        wallwithdoorBox
          .setFromObject(
            Wallrelwithdoor.object3D
          );

        smallwallBox
          .setFromObject(
            SmallWallel.object3D
          )
          .expandByScalar(0.5);

        if (
          !doorHoleCaptured &&
          doorel?.object3D
        ) {
          doorHoleBox.setFromObject(
            doorel.object3D
          );

          doorHoleCaptured = true;
        }
      }

      /*----------------------------------------Gravity implemention----------------------------------*/
      if (land) {
        groundRay.set(
          new THREE.Vector3(
            pos.x,
            pos.y + STEP,
            pos.z
          ),
          DOWN
        );

        const hit =
          groundRay.intersectObject(
            land,
            true
          )[0];

        if (
          hit &&
          vy <= 0 &&
          pos.y <= hit.point.y + 0.05
        ) {
          pos.y = hit.point.y;
          vy = 0;
          onGround = true;
        } else {
          vy -= GRAVITY * dt;
          pos.y += vy * dt;
          onGround = false;
        }

        /*----------------------------NPC implemention-----------------------------*/
        moveRay.set(
          new THREE.Vector3(
            NPCpos.x,
            NPCpos.y + STEP,
            NPCpos.z
          ),
          DOWN
        );

        const connect =
          moveRay.intersectObject(
            land,
            true
          )[0];

        if (
          connect &&
          npcvy <= 0 &&
          NPCpos.y <= connect.point.y + 0.05
        ) {
          NPCpos.y = connect.point.y;
          npcvy = 0;
        } else {
          npcvy -= GRAVITY * dt;
          NPCpos.y += npcvy * dt;
        }

        /*----------------------------NPC VISION-----------------------------*/
        if (
          wallsReady &&
          !caught
        ) {
          const obstacleBoxes = [
            wallBox1,
            wallBox2,
            wallBox3,
            wallwithdoorBox,
            smallwallBox
          ];

          const playerInFOV =
            isPlayerInNpcFOV(
              npcrel.object3D,
              pos,
              90,
              MAX_BLOCKS_NPC
            );

          const playerVisible =
            playerInFOV &&
            hasLineOfSight(
              NPCpos,
              pos,
              obstacleBoxes
            );

          if (
            playerVisible &&
            distNpcPlayer <= MAX_BLOCKS_NPC
          ) {
            NPCpos.x = currentXnpc;
            caught = true;
          }
        }

        /*----------------------------NPC movement-----------------------------*/
        if (!caught) {
          if (!firstdone) {
            if (NPCpos.x >= ENDNPC) {
              NPCpos.x = ENDNPC;

              npcrel.object3D.rotation.y =
                -Math.PI / 2;

              firstdone = true;
            } else {
              NPCpos.x += NPCSPEED * dt;

              currentXnpc = NPCpos.x;

              if (
                npcrel.object3D.rotation.y !==
                Math.PI / 2
              ) {
                npcrel.object3D.rotation.y =
                  Math.PI / 2;
              }
            }
          } else {
            if (NPCpos.x <= STARTNPC) {
              NPCpos.x = STARTNPC;

              npcrel.object3D.rotation.y =
                Math.PI / 2;

              firstdone = false;
            } else {
              NPCpos.x -= NPCSPEED * dt;

              currentXnpc = NPCpos.x;

              if (
                npcrel.object3D.rotation.y !==
                -Math.PI / 2
              ) {
                npcrel.object3D.rotation.y =
                  -Math.PI / 2;
              }
            }
          }
        }
      }

      /*------------------------------first-personwalk configs---------------------------------------*/
      const x =
        (keys.KeyD ? 1 : 0) -
        (keys.KeyA ? 1 : 0);

      const z =
        (keys.KeyS ? 1 : 0) -
        (keys.KeyW ? 1 : 0);

      if (!x && !z) {
        return;
      }

      const len =
        Math.sqrt(
          x ** 2 + z ** 2
        );

      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);

      const dx =
        (x * cos + z * sin) / len;

      const dz =
        (-x * sin + z * cos) / len;

      const nx =
        pos.x + dx * SPEED * dt;

      const nz =
        pos.z + dz * SPEED * dt;

      /*---------------------------first-person walk && walls implementation--------------------------*/
      let blockedwall1 = false;
      let blockedwall2 = false;
      let blockedwall3 = false;
      let blockedwallwithdoor = false;
      let blockedsmallwall = false;

      if (wallsReady) {
        blockedwall1 =
          pos.y < wallBox1.max.y &&
          nx > wallBox1.min.x &&
          nx < wallBox1.max.x &&
          nz > wallBox1.min.z &&
          nz < wallBox1.max.z;

        blockedwall2 =
          pos.y < wallBox2.max.y &&
          nx > wallBox2.min.x &&
          nx < wallBox2.max.x &&
          nz > wallBox2.min.z &&
          nz < wallBox2.max.z;

        blockedwall3 =
          pos.y < wallBox3.max.y &&
          nx > wallBox3.min.x &&
          nx < wallBox3.max.x &&
          nz > wallBox3.min.z &&
          nz < wallBox3.max.z;

        const inholedoor =
          doorHoleCaptured &&
          nx > doorHoleBox.min.x &&
          nx < doorHoleBox.max.x &&
          nz > doorHoleBox.min.z &&
          nz < doorHoleBox.max.z;

        blockedwallwithdoor =
          pos.y < wallwithdoorBox.max.y &&
          nx > wallwithdoorBox.min.x &&
          nx < wallwithdoorBox.max.x &&
          nz > wallwithdoorBox.min.z &&
          nz < wallwithdoorBox.max.z &&
          !(doorOpen && inholedoor);

        blockedsmallwall =
          pos.y < smallwallBox.max.y &&
          nx > smallwallBox.min.x &&
          nx < smallwallBox.max.x &&
          nz > smallwallBox.min.z &&
          nz < smallwallBox.max.z;
      }

      /*--------------------------first-person walk allowed condition------------------------------------*/
      if (
        !blockedwall1 &&
        !blockedwall2 &&
        !blockedwall3 &&
        !blockedwallwithdoor &&
        !blockedsmallwall
      ) {
        pos.x = nx;
        pos.z = nz;
      }
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);

      window.removeEventListener('keydown',down);

      window.removeEventListener('keyup', up);

      window.removeEventListener('mousemove',onMouseMove);

      window.removeEventListener('click',onClick);
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
    
      <MainComponents walkref = {walkref} camref = {camref} inventoryref = {inventoryref}  Doorref = {Doorref} landref = {landref} wallref = {wallref} wallref1 = {wallref1} wallref2 = {wallref2} smallwallref = {smallwallref} wallwithdoorref = {wallwithdoorref} npcpoliceref = {npcpoliceref} keyref={keyref}  showKey={!items.includes('old_key')}/>
      

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