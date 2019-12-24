import React, { Suspense } from 'react'
import { Canvas, useLoader } from 'react-three-fiber'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

import model from './mode2.ply'
import scan from './scan.obj'
import jam from './jam.gltf'

const Model = () => {
  const ply = useLoader(PLYLoader, model)

  return <primitive object={ply} />
}

const Test = () => {
  const gltf = useLoader(GLTFLoader, jam)

  return <primitive object={gltf} />
}

const Test2 = () => {
  return (
    <group>
      <Test />
      <meshStandardMaterial attach="material" />
    </group>
  )
}

const PointCloudObj = () => {
  const obj = useLoader(THREE.OBJLoader, scan)

  return <primitive object={obj} />
}

const PointCloud = () => {
  return (
    <Model>
      <pointsMaterial color="0xFFFFFF" size="50" attach="material" />
    </Model>
  )
}

const Loading = () => {
  return 'Loading...'
}

const Scene = () => {
  return (
    <Canvas>
      <Suspense fallback={<Loading />}>
        {/* <Test2 /> */}
        {/* <PointCloudObj /> */}
        {/* <PointCloud /> */}
      </Suspense>
    </Canvas>
  )
}

export default Scene
