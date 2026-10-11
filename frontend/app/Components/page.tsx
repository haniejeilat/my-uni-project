//@ts-nocheck
import React,{useRef} from 'react';
export default function MainComponents({ walkref , chooseref, camref , landref}: any) {
    return (
        <a-scene
        embedded
        renderer="colorManagement: true"
        >
        <a-assets>
      <a-asset-item
        id="landModel"
        src="/assets/finalmap.glb"
      ></a-asset-item>

      <a-asset-item
        id="prisonerModel"
        src="/assets/prisoner/prisoner.glb"
      ></a-asset-item>

      <a-asset-item
        id="nestedprisonerModel"
        src="/assets/prisoner/nestedactions.glb"
      ></a-asset-item>

      <a-asset-item
        id="idleprisonerModel"
        src="/assets/prisoner/idle.glb"
      ></a-asset-item>
    </a-assets>

        <a-sky color="#87CEED"></a-sky>

        <a-entity
          position="-19 0 6"
          ref={walkref}
        >
          <a-entity
            camera=""
            ref={camref}
            position="0 5.54 5.5"
          ></a-entity>

          <a-entity
          scale = '0.3 0.3 0.3'
          ref = {chooseref}
          gltf-model="#nestedprisonerModel"
          rotation="0 180 0"
        ></a-entity>
       </a-entity>

        <a-entity
          ref={landref}
          gltf-model="#landModel"
          position="0 0 0"
          scale="1 1 1"
          matrixAutoUpdate="false"
        ></a-entity>
      </a-scene>
      
      
    );
}