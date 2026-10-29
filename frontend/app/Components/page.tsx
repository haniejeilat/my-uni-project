//@ts-nocheck
import React,{useRef} from 'react';
export default function MainComponents({ walkref , chooseref , npcref , camref , landref , solidbarref , solidbarref1 , solidbarref2 , rasptool , brokensolidref , brokensolidref1 , roperef , coverref ,chairref1 , chairref2 , chairref3 , npcpoliceref , npcsetref, celldoorref , sleepref , buildingdoorref}: any) {
    return (
        <a-scene
        embedded
        renderer="colorManagement: true"
        >
        <a-assets>
      <a-asset-item
        id="landModel"
        src="/assets/finalmap1.1.glb"
      ></a-asset-item>

      <a-asset-item
        id="prisonerModel"
        src="/assets/prisoner/prisoner.glb"
      ></a-asset-item>

      <a-asset-item
        id="nestedprisonerModel"
        src="/assets/prisoner/nestedActionFinalprisoner1.1.glb"
      ></a-asset-item>

      <a-asset-item
        id="idleprisonerModel"
        src="/assets/prisoner/idle.glb"
      ></a-asset-item>

        <a-asset-item
        id = "solidbarModel"
        src = "/assets/tools/solidwindow.glb"
        ></a-asset-item>

        <a-asset-item
        id = "solidbarModel1"
        src = "/assets/tools/solidwindow.glb"
        ></a-asset-item>

       <a-asset-item
         id = "solidbarModel2"
         src = "/assets/tools/solidwindow.glb"
        ></a-asset-item>

        <a-asset-item
        id = "raspModel"
        src = "/assets/tools/file_or_rasp.glb"
        ></a-asset-item>

        <a-asset-item
        id = "brokensolid"
        src = "/assets/tools/solid.glb"
        ></a-asset-item>

        <a-asset-item
         id = "brokensolid1"
         src = "/assets/tools/solid.glb"
        ></a-asset-item>

        <a-asset-item
         id = "ropeModel"
         src = "/assets/tools/coverrope.glb"
        ></a-asset-item>

        <a-asset-item
         id = "coverModel"
         src = "/assets/tools/cover.glb"
        ></a-asset-item>
        

        <a-asset-item
        id = "chairModel1"
        src = "/assets/tools/chair.glb"
        ></a-asset-item>
        
        <a-asset-item
        id = "chairModel2"
        src = "/assets/tools/chair.glb"
        ></a-asset-item>
        
        <a-asset-item
        id = "chairModel3"
        src = "/assets/tools/chair.glb"
        ></a-asset-item>

        <a-asset-item
        id = "nestedpoliceModel"
        src = "/assets/police/policenestedaction.glb"
        ></a-asset-item>

        
    
        <a-asset-item
        id = "settalkModel"
        src = "/assets/prisoner/settalk.glb"
        ></a-asset-item>

        <a-asset-item
          id = "celldoorModel"
          src = "/assets/Doors/movingcelldoor.glb"
        ></a-asset-item>

        <a-asset-item
        id = "sleepModel"
        src = "/assets/prisoner/sleep.glb"
        ></a-asset-item>

        <a-asset-item
          id = "buildingcelldoorModel"
          src = "/assets/Doors/outsidedoor1.glb"
        ></a-asset-item>
    </a-assets>

       <a-sky color="#87CEED"></a-sky>

        <a-entity
          position="3.4 2.6 0"
          ref={walkref}
        >
     <a-entity
  camera=""
  ref={camref}
  position="0 1.4 0"
></a-entity>

<a-entity
  scale='0.9 0.9 0.9'
  ref={chooseref}
  gltf-model="#nestedprisonerModel"
  rotation="0 180 0"
  position="0 0 0"
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
          ref={solidbarref}
          gltf-model="#solidbarModel"
           position="1.4 4.64 0.67"
          scale="1 1 1"
          matrixAutoUpdate="false"
        ></a-entity>

          <a-entity
          ref={solidbarref1}
          gltf-model="#solidbarModel1"
           position="1.57 4.64 0.779"
          scale="1 1 1"
          matrixAutoUpdate="false"
        ></a-entity>

        <a-entity
        ref = {solidbarref2}
        gltf-model = "#solidbarModel2"
        position = "1.73 4.64 0.929"
        scale="1 1 1"
        matrixAutoUpdate="false"
        ></a-entity>

        <a-entity
          ref={brokensolidref}
          gltf-model="#brokensolid"
          position="1.493 4.33 0.65"
          scale="1 1 1"
          matrixAutoUpdate="false"
        ></a-entity>

        <a-entity
          ref={brokensolidref1}
          gltf-model="#brokensolid1"
           position="1.66 4.33 0.759"
          scale="1 1 1"
          matrixAutoUpdate="false"
        ></a-entity>
        
        <a-entity
        ref={rasptool}
        gltf-model="#raspModel"
        position="3.4 2.6 0"
        scale = "0.0025 0.0025 0.0025"
        matrixAutoUpdate="false"
        >
        </a-entity>

       <a-entity
       ref = {roperef}
       gltf-model = "#ropeModel"
       scale = "1 1 1" 
       position = "1.72 1.23 1.15"
       rotation = "0 200 0"
       matrixAutoUpdate="false"
       visible="false"
       ></a-entity>
      
    
       <a-entity
       ref = {coverref}
       gltf-model = "#coverModel"
       scale = "1 1 1" 
       position="2.1 3 -0.5"
       rotation = "0 -35 0"
       ></a-entity>

      <a-entity
      ref = {chairref1}
      gltf-model = "#chairModel1"
      scale = "1 1 1"
      position = "-26.5 0 -26.1"
      rotation = "0 0 0"
      matrixAutoUpdate = "false"
      >
      </a-entity>

      <a-entity
      ref = {chairref2}
      gltf-model = "#chairModel2"
      scale = "1 1 1"
      position = "-22.5 0 -31.1"
      rotation = "0 0 0"
      matrixAutoUpdate = "false"
      >
      </a-entity>

      <a-entity
      ref = {chairref3}
      gltf-model = "#chairModel3"
      scale = "1 1 1"
      position = "-30.5 0 -31.1"
      rotation = "0 0 0"
      matrixAutoUpdate = "false"
      >
      </a-entity>
    
      <a-entity
      ref ={npcpoliceref}
      gltf-model = "#nestedpoliceModel"
      visible = "false"
      ></a-entity>
      
    <a-entity
    ref = {npcsetref}
    gltf-model = "#settalkModel"
    scale = "1 1 1"
    position = "-11.3 0 -24.61"
    rotation = "0 270 0"
    animation-mixer = "clip: set; loop: repeat"
    ></a-entity>

    <a-entity
      ref = {celldoorref}
      gltf-model = "#celldoorModel"
      
    ></a-entity>
    
      <a-entity
  ref = {sleepref}
  gltf-model = "#sleepModel"
  visible = "false"
></a-entity>

<a-entity
  ref = {buildingdoorref}
  gltf-model = "#buildingcelldoorModel"
  visible = "false"
></a-entity>
      </a-scene>
     
    );
}