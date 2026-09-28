//@ts-nocheck


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