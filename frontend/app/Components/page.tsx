//@ts-nocheck
import React,{useRef} from 'react';
export default function MainComponents({ walkref, camref, inventoryref, Doorref, landref, wallref, wallref1, wallref2, smallwallref, wallwithdoorref, npcpoliceref,keyref, showKey}: any) {
    return (
        
        <a-scene
        embedded
        renderer="colorManagement: true"
      >
        <a-assets>
          <a-asset-item
            id="landModel"
            src="/assets/landframe.glb"
          ></a-asset-item>

          <a-asset-item
            id="prisonerModel"
            src="/assets/prisoner/prisoner.glb"
          ></a-asset-item>

          <a-asset-item
            id="standarddoorModel"
            src="/assets/standarddoor.glb"
          ></a-asset-item>

          <a-asset-item
            id="celldoorModel"
            src="/assets/celldoor.glb"
          ></a-asset-item>

          <a-asset-item
            id="cellwallModel"
            src="/assets/cellwall.glb"
          ></a-asset-item>

          <a-asset-item
            id="cellwallwithdoorModel"
            src="/assets/cellwallwithdoor.glb"
          ></a-asset-item>

          <a-asset-item
            id="policeModel"
            src="/assets/prisoner/prisoner.glb"
          ></a-asset-item>

            <a-asset-item 
            id="keyModel" src="/assets/old_key.glb"
            ></a-asset-item>

          <a-asset-item
            id="smallwallModel"
            src="/assets/smallwall.glb"
          ></a-asset-item>

          <a-asset-item
            id="ladderModel"
            src="/assets/ladder.glb"
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
            position="0 3.54 -0.5"
          ></a-entity>

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

        

        <a-entity
          ref={wallref}
          position="20 0 21"
          scale="2 2 2"
          rotation="0 0 0"
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
          rotation="0 0 0"
          gltf-model="#cellwallModel"
          matrixAutoUpdate="false"
        ></a-entity>

        <a-entity
          ref={wallwithdoorref}
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
          ref={npcpoliceref}
          gltf-model="#policeModel"
          position="50.97 0 57"
          rotation="0 90 0"
          scale="0.026 0.026 0.026"
        ></a-entity>

        <a-entity
          ref={smallwallref}
          gltf-model="#smallwallModel"
          matrixAutoUpdate="false"
          position="50 -0.5 0"
          rotation="0 0 0"
          scale="1 3 1"
        ></a-entity>
      
        {showKey && (
     <a-entity
    ref={keyref}
    gltf-model="#keyModel"
    position="0 2 30"
    scale="1 1 1"
    matrixAutoUpdate="false"
     ></a-entity>
    )}

    
      </a-scene>
      
      
    );
}