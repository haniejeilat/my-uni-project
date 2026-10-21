//@ts-nocheck
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';

/*------------------------------------------------------------------
  Root-motion neutraliser  (fixes the body spinning / drifting when the
  clip changes idle <-> walk <-> run)

  - animated position / rotation on the NON-bone parents of the skeleton
    (Armature, wrapper nodes) are removed
  - root bone (Hips) position : x / z locked to the first clip's first frame (y is kept)
  - root bone (Hips) rotation : locked to the first clip's first frame
    (set LOCK_ROOT_ROTATION = false to keep the pelvis sway)
------------------------------------------------------------------*/
const LOCK_ROOT_ROTATION = true;

const splitTrackName = (name) => {
  const i = name.indexOf('.');
  return i < 0 ? [name, ''] : [name.slice(0, i), name.slice(i + 1)];
};

const neutralizeRootMotion = (THREE, model, clips) => {
  const clean = (n) =>
    THREE.PropertyBinding && THREE.PropertyBinding.sanitizeNodeName
      ? THREE.PropertyBinding.sanitizeNodeName(n)
      : n.replace(/\s/g, '_').replace(/[\[\].:\/]/g, '');

  const rootBones = [];
  model.traverse((o) => {
    if (o.isBone && !(o.parent && o.parent.isBone)) rootBones.push(o);
  });
  if (!rootBones.length) return;

  const rootNames = new Set(rootBones.map((b) => clean(b.name)));
  const rigidNames = new Set();
  rootBones.forEach((b) => {
    for (let a = b.parent; a && a !== model; a = a.parent) rigidNames.add(clean(a.name));
  });

  const first = {};
  const removed = [];
  const locked = [];

  clips.forEach((clip) => {
    clip.tracks = clip.tracks.filter((t) => {
      const [node, prop] = splitTrackName(t.name);
      const rigid =
        rigidNames.has(node) && (prop === 'position' || prop === 'quaternion' || prop === 'rotation');
      if (rigid) removed.push(clip.name + ':' + t.name);
      return !rigid;
    });

    clip.tracks.forEach((t) => {
      const [node, prop] = splitTrackName(t.name);
      if (!rootNames.has(node)) return;
      const v = t.values;

      if (prop === 'position') {
        if (!first[t.name]) first[t.name] = [v[0], v[2]];
        const f = first[t.name];
        for (let i = 0; i < v.length; i += 3) {
          v[i] = f[0];
          v[i + 2] = f[1];
        }
        locked.push(clip.name + ':' + t.name);
      } else if (LOCK_ROOT_ROTATION && prop === 'quaternion') {
        if (!first[t.name]) first[t.name] = [v[0], v[1], v[2], v[3]];
        const f = first[t.name];
        for (let i = 0; i < v.length; i += 4) {
          v[i] = f[0];
          v[i + 1] = f[1];
          v[i + 2] = f[2];
          v[i + 3] = f[3];
        }
        locked.push(clip.name + ':' + t.name);
      }
    });

    clip.resetDuration();
  });

  console.info('[rootmotion]', { roots: [...rootNames], rigid: [...rigidNames], removed, locked });
};
export const PRISONER_RANGES = { idle: [1, 108], walk: [110, 180], run: [182, 242] };
export const POLICE_RANGES = { idle: [1, 115], walk: [121, 144], run: [146, 168] };

export const setupSubclips = (ref, ranges = PRISONER_RANGES) => {
  const THREE = window.AFRAME.THREE;
  const el = ref?.current;
  if (!el) return false;

  const model = el.getObject3D('mesh');
  if (!model) return false;
  if (model.userData.clipsReady) return true;

  const gltfComponent = el.components['gltf-model'];
  const animations =
    gltfComponent?.model?.animations ?? model.animations;

  if (!animations || animations.length === 0) return false;

  const mainClip = animations[0];
  const FPS = 30;

  const clips = Object.entries(ranges).map(([name, [from, to]]) =>
    THREE.AnimationUtils.subclip(mainClip, name, from, to, FPS)
  );

  neutralizeRootMotion(THREE, model, clips);

  model.animations = clips;

  if (gltfComponent?.model) {
    gltfComponent.model.animations = clips;
  }

  model.userData.clipsReady = true;

  return true;
};

/* setAnimation is called every frame by the game loop: only touch the
   animation-mixer when the clip really changes (no per-frame setAttribute,
   no timers, no console spam). */
const currentClip = new WeakMap();

export const setAnimation = (ref, clipName, crossFade = 0.2, ranges) => {
  const targetEntity = ref?.current;
  if (!targetEntity) return;

  if (!setupSubclips(ref, ranges)) return;

  const model = targetEntity.getObject3D('mesh');
  const state = currentClip.get(targetEntity);
  if (state && state.model === model && state.clip === clipName) return;
  currentClip.set(targetEntity, { model, clip: clipName });

  targetEntity.setAttribute('animation-mixer', {
    clip: clipName,
    crossFadeDuration: crossFade,
    loop: 'repeat',
  });
};

/*------------------------------------------------------------------
  WallCollision - ray fan in front of the player.

  The fan is SYMMETRIC around the player: lateral offsets -0.9 .. +0.9 * radius.
  (Before it was Array.from({ length: 17 }) -> offsets -0.9 .. +3.9, i.e. rays that
  started up to 1.4 m to the RIGHT of the player, inside / behind the walls, so
  every doorway was blocked.)

  Nothing is allocated per call: vectors, offsets and the hit array are reused and
  the returned object is reused too (read x / z immediately).
------------------------------------------------------------------*/
const WALL_OFFSETS = Array.from({ length: 17 }, (_, i) => -0.3 + i * 0.3);
const WALL_MIN_COS = 0.2;
const _wcHits = [];
let _wc = null;

export function WallCollision(THREE, ray, land, pos, mx, mz, radius, heights, front = radius) {
  const c = (_wc = _wc || {
    origin: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    out: { x: 0, z: 0 },
  });
  const origin = c.origin;
  const dir = c.dir;
  const normal = c.normal;
  let ox = 0;
  let oz = 0;

  for (let pass = 0; pass < 2; pass++) {
    const dist = Math.hypot(mx, mz);
    if (dist < 1e-6) break;

    dir.set(mx / dist, 0, mz / dist);
    const sx = -dir.z;
    const sz = dir.x;
    ray.far = dist + front / WALL_MIN_COS;

    let allowed = dist;
    let nx = 0;
    let nz = 0;

    for (let hi = 0; hi < heights.length; hi++) {
      const h = heights[hi];
      for (let oi = 0; oi < WALL_OFFSETS.length; oi++) {
        const o = WALL_OFFSETS[oi];
        origin.set(pos.x + ox + sx * o * radius, pos.y + h, pos.z + oz + sz * o * radius);
        ray.set(origin, dir);

        _wcHits.length = 0;
        ray.intersectObjects(land, false, _wcHits);
        const hit = _wcHits[0];
        if (!hit || !hit.face) continue;

        normal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
        if (Math.abs(normal.y) > 0.7) continue;
        normal.y = 0;
        normal.normalize();
        if (normal.x * dir.x + normal.z * dir.z > 0) normal.negate();

        const cos = Math.max(-(normal.x * dir.x + normal.z * dir.z), WALL_MIN_COS);
        const free = hit.distance - front / cos;
        if (free < allowed) {
          allowed = Math.max(free, 0);
          nx = normal.x;
          nz = normal.z;
        }
      }
    }

    ox += dir.x * allowed;
    oz += dir.z * allowed;
    if (allowed >= dist) break;

    const rem = dist - allowed;
    const d = dir.x * nx + dir.z * nz;
    mx = (dir.x - nx * d) * rem;
    mz = (dir.z - nz * d) * rem;
  }

  c.out.x = ox;
  c.out.z = oz;
  return c.out;
}

export function wallslimiter(object3D, objectBox, physics) {
  return (
    object3D.position.y < objectBox.max.y &&
    physics.nx > objectBox.min.x &&
    physics.nx < objectBox.max.x &&
    physics.nz > objectBox.min.z &&
    physics.nz < objectBox.max.z
  );
}

export function NpcMovement(npcmovestates, object3D, Aside, Bside, startnpc, endnpc, npcSpeed, dt) {
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

export function GravityAndWithJump(landObjecthit, Objectref, physics, dt, GRAVITY, MAX_STEP) {
 
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

export function isPlayerInNpcFOV(THREE, npcObject, playerPos, fovDegrees = 90, maxDistance = 30) {
  const npcPos = npcObject.position;
  const dx = playerPos.x - npcPos.x;
  const dz = playerPos.z - npcPos.z;
  const distance = Math.hypot(dx, dz);

  if (distance > maxDistance) return false;

  const forward = new THREE.Vector3(Math.sin(npcObject.rotation.y), 0, Math.cos(npcObject.rotation.y)).normalize();
  const toPlayer = new THREE.Vector3(dx, 0, dz);

  if (toPlayer.lengthSq() === 0) return true;

  toPlayer.normalize();

  const dot = forward.dot(toPlayer);
  const halfFov = THREE.MathUtils.degToRad(fovDegrees / 2);

  return dot >= Math.cos(halfFov);
}

export function segmentIntersectsBox(THREE, from, to, box) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const ray = new THREE.Ray(from, dir.clone().normalize());
  const hit = new THREE.Vector3();

  if (!ray.intersectBox(box, hit)) return false;

  return hit.distanceTo(from) < dir.length() - 0.15;
}

export function hasLineOfSight(THREE, fromPos, toPos, boxes, heights = [0.3, 1.0, 1.6]) {
  for (const h of heights) {
    const from = new THREE.Vector3(fromPos.x, fromPos.y + h, fromPos.z);
    const to = new THREE.Vector3(toPos.x, toPos.y + h, toPos.z);
    const blocked = boxes.some((box) => segmentIntersectsBox(THREE, from, to, box));

    if (!blocked) return true;
  }

  return false;
}

/*------------------------------------------------------------------
  CapsuleCollide  -  the ONE function that keeps the player out of geometry.

  THREE   : window.AFRAME.THREE
  meshes  : array of THREE.Mesh that already have geometry.boundsTree (three-mesh-bvh)
  pos     : walkref.current.object3D.position (the FEET). x / z are corrected in place
  radius  : body radius.  Doorways must be wider than 2 * radius
  bottom  : height above the feet where the body starts. Anything lower is a STEP (ground code climbs it)
  top     : height above the feet of the top of the head
  returns : true if the player was pushed out of something

  Meshes (or parents) with visible = false are ignored -> hide a door to "open" it.
------------------------------------------------------------------*/
let _cc = null;
export function CapsuleCollide(THREE, meshes, pos, radius, bottom, top, iterations = 4) {
  const c = (_cc = _cc || {
    inv: new THREE.Matrix4(),
    box: new THREE.Box3(),
    seg: new THREE.Line3(new THREE.Vector3(), new THREE.Vector3()),
    ws: new THREE.Line3(new THREE.Vector3(), new THREE.Vector3()),
    wb: new THREE.Box3(),
    wt: null,
    a: new THREE.Vector3(),
    b: new THREE.Vector3(),
    n: new THREE.Vector3(),
    m: new THREE.Vector3(),
  });

  const y0 = pos.y + bottom + radius;
  const y1 = Math.max(pos.y + top - radius, y0);
  let moved = false;

  for (let it = 0; it < iterations; it++) {
    let best = 1e-8;
    let bx = 0;
    let bz = 0;

    for (const mesh of meshes) {
      const tree = mesh.geometry && mesh.geometry.boundsTree;
      if (!tree) continue;

      let visible = true;
      for (let o = mesh; o; o = o.parent) {
        if (!o.visible) { visible = false; break; }
      }
      if (!visible) continue;

      const mw = mesh.matrixWorld;

      /* stretched meshes (node scale like 16 x 3 x 0.2): the local-space maths below is wrong
         for them, so they are solved in WORLD space. Uniform meshes keep the fast path. */
      const e = mw.elements;
      const lx = Math.hypot(e[0], e[1], e[2]);
      const ly = Math.hypot(e[4], e[5], e[6]);
      const lz = Math.hypot(e[8], e[9], e[10]);
      const smax = Math.max(lx, ly, lz);
      if (smax - Math.min(lx, ly, lz) > smax * 1e-3) {
        if (!mesh.userData.nuLogged) {
          mesh.userData.nuLogged = true;
          console.info('[collision] stretched mesh (world-space path):', mesh.name, [lx, ly, lz]);
        }
        c.inv.copy(mw).invert();
        c.ws.start.set(pos.x, y0, pos.z);
        c.ws.end.set(pos.x, y1, pos.z);
        c.wb.makeEmpty().expandByPoint(c.ws.start).expandByPoint(c.ws.end);
        c.wb.min.addScalar(-radius);
        c.wb.max.addScalar(radius);
        c.box.copy(c.wb).applyMatrix4(c.inv);

        tree.shapecast({
          intersectsBounds: (b) => b.intersectsBox(c.box),
          intersectsTriangle: (tri) => {
            const wt = (c.wt = c.wt || new tri.constructor());
            wt.a.copy(tri.a).applyMatrix4(mw);
            wt.b.copy(tri.b).applyMatrix4(mw);
            wt.c.copy(tri.c).applyMatrix4(mw);
            wt.update();

            const d = wt.closestPointToSegment(c.ws, c.a, c.b);
            if (d >= radius) return;

            if (d > 1e-6) {
              c.n.subVectors(c.b, c.a).divideScalar(d);
            } else {
              wt.getNormal(c.n);
              c.m.subVectors(c.ws.start, c.a);
              if (c.n.dot(c.m) < 0) c.n.negate();
            }

            const depth = radius - d;
            const hx = c.n.x * depth;
            const hz = c.n.z * depth;
            const sq = hx * hx + hz * hz;
            if (sq > best) { best = sq; bx = hx; bz = hz; }
          },
        });
        continue;
      }

      const s = mw.getMaxScaleOnAxis();
      const r = radius / s;
      c.inv.copy(mw).invert();
      c.seg.start.set(pos.x, y0, pos.z).applyMatrix4(c.inv);
      c.seg.end.set(pos.x, y1, pos.z).applyMatrix4(c.inv);
      c.box.makeEmpty().expandByPoint(c.seg.start).expandByPoint(c.seg.end);
      c.box.min.addScalar(-r);
      c.box.max.addScalar(r);

      tree.shapecast({
        intersectsBounds: (b) => b.intersectsBox(c.box),
        intersectsTriangle: (tri) => {
          const d = tri.closestPointToSegment(c.seg, c.a, c.b);
          if (d >= r) return;

          if (d > 1e-6) {
            c.n.subVectors(c.b, c.a).divideScalar(d);
          } else {
            tri.getNormal(c.n);
            c.m.subVectors(c.seg.start, c.a);
            if (c.n.dot(c.m) < 0) c.n.negate();
          }

          c.n.transformDirection(mw);
          const depth = (r - d) * s;
          const hx = c.n.x * depth;
          const hz = c.n.z * depth;
          const sq = hx * hx + hz * hz;
          if (sq > best) { best = sq; bx = hx; bz = hz; }
        },
      });
    }

    if (best <= 1e-8) break;
    pos.x += bx;
    pos.z += bz;
    moved = true;
  }

  return moved;
}

/*------------------------------------------------------------------
  MoveCollide  -  ONE movement function for EVERY character (player, police NPC, ...)

  meshes : BVH meshes near the character (player: `nearby`, NPC: NearMeshes(...))
  pos    : the character's object3D.position (FEET). x / z are moved in place
  mx, mz : wanted displacement this frame (already multiplied by speed * dt)
  radius : body radius.  A doorway is passable only if it is wider than 2 * radius
  bottom : anything lower than this above the feet is a STEP (ground code climbs it)
  top    : height of the head
  returns: true if a wall blocked / pushed the character this frame

  The move is cut into slices of radius / 2, so a fast character (18 m/s,
  dt = 0.1) can never jump over a wall. Sliding along walls / corners is automatic.
------------------------------------------------------------------*/
export function MoveCollide(THREE, meshes, pos, mx, mz, radius, bottom, top) {
  const n = Math.max(1, Math.ceil(Math.hypot(mx, mz) / (radius * 0.5)));
  const sx = mx / n;
  const sz = mz / n;
  let blocked = false;

  for (let i = 0; i < n; i++) {
    pos.x += sx;
    pos.z += sz;
    if (CapsuleCollide(THREE, meshes, pos, radius, bottom, top, 6)) blocked = true;
  }

  return blocked;
}

/*------------------------------------------------------------------
  NearMeshes - meshes of `entries` ({ mesh, box }) close to x / z.
  Use it for every NPC. The returned array is reused: read it before the next call.
------------------------------------------------------------------*/
const _near = [];
export function NearMeshes(entries, x, z, r = 4) {
  _near.length = 0;
  for (let i = 0; i < entries.length; i++) {
    const box = entries[i].box;
    if (x > box.min.x - r && x < box.max.x + r && z > box.min.z - r && z < box.max.z + r) {
      _near.push(entries[i].mesh);
    }
  }
  return _near;
}

/*------------------------------------------------------------------
  spawnNpc - brand-new NPC cloned from an already loaded animated model.
  sourceRef : ref of the entity that already ran setupSubclips (chooseref)
  returns   : { el, mesh, mixer, play, dispose }  (this object IS the NPC "ref")
------------------------------------------------------------------*/
export const spawnNpc = (THREE, sourceRef, sceneEl, { x, y, z, yaw = 0, scale = 0.9, clip = 'idle' }, ranges) => {
  const src = sourceRef?.current?.getObject3D('mesh');
  if (!src || !sceneEl || !setupSubclips(sourceRef, ranges) || !src.animations?.length) return null;

  const mesh = cloneSkinned(src);
  mesh.animations = src.animations;

  const mixer = new THREE.AnimationMixer(mesh);
  const actions = {};
  src.animations.forEach((c) => {
    actions[c.name] = mixer.clipAction(c);
  });

  let current = null;
  const play = (name, fade = 0.2) => {
    const next = actions[name];
    if (!next || next === current) return;
    next.reset().fadeIn(fade).play();
    if (current) current.fadeOut(fade);
    current = next;
  };
  console.log('[spawnNpc]', clip, src.animations.map((c) => c.name));
  play(actions[clip] ? clip : src.animations[0].name, 0);
  play(clip, 0);
  current.time = Math.random() * current.getClip().duration;
  mixer.update(0);

  mesh.updateMatrixWorld(true);
  mesh.traverse((o) => {
    if (o.isSkinnedMesh) o.skeleton.update();
  });
  const box = new THREE.Box3().setFromObject(mesh, true);
  const c = box.getCenter(new THREE.Vector3());
  mesh.position.x -= c.x;
  mesh.position.y -= box.min.y;
  mesh.position.z -= c.z;

  const el = document.createElement('a-entity');
  el.setAttribute('position', { x, y, z });
  el.setAttribute('rotation', { x: 0, y: yaw, z: 0 });
  el.setAttribute('scale', { x: scale, y: scale, z: scale });
  sceneEl.appendChild(el);
  el.setObject3D('mesh', mesh);

    return {
    el,
    mesh,
    mixer,
    play,
    physics: { vy: 0, onGround: false },
    dispose: () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(mesh);
      el.remove();
    },
  };
};