// @ts-nocheck
'use client';

import { useEffect } from 'react';

export default function VRScene() {
  useEffect(() => {
    require('aframe');
    require('aframe-extras');
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <a-scene embedded renderer="colorManagement: true">
        <a-assets>
          <a-asset-item id="landModel" src="/assets/landframe.glb"></a-asset-item>
          <a-asset-item id="characterModel" src="/assets/police/5.glb"></a-asset-item>
        </a-assets>

        <a-sky color="#87CEEB"></a-sky>

        <a-entity light="type: ambient; color: #FFF; intensity: 1.5"></a-entity>
        <a-entity light="type: directional; intensity: 1" position="5 20 10"></a-entity>
        <a-entity light="type: hemisphere; color: #bde; groundColor: #666; intensity: 1.2"></a-entity>

        <a-entity camera position="0 2 5" look-controls wasd-controls></a-entity>

        <a-entity
          id="characterEntity"
          gltf-model="#characterModel"
          position="-10 0 5"
          scale="1 1 1"
          rotation="0 0 0"
          animation-mixer
        ></a-entity>

        <a-entity
          gltf-model="#landModel"
          position="0 0 0"
          scale="1 1 1"
        ></a-entity>
      </a-scene>
    </div>
  );
}