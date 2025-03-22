
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface FloorPlanViewerProps {
  className?: string;
}

const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({ className = "" }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 15);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Create a simple floor plan
    createFloorPlan(scene);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (cameraRef.current && rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Window resize handler
    const handleResize = () => {
      if (
        mountRef.current &&
        cameraRef.current &&
        rendererRef.current
      ) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const createFloorPlan = (scene: THREE.Scene) => {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 15);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Outer walls
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xe0e0e0,
      roughness: 0.7,
      metalness: 0.1,
    });
    
    // Wall thickness and height
    const wallThickness = 0.2;
    const wallHeight = 3;

    // North wall
    const northWallGeometry = new THREE.BoxGeometry(20, wallHeight, wallThickness);
    const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
    northWall.position.set(0, wallHeight / 2, -7.5);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    scene.add(northWall);

    // South wall
    const southWallGeometry = new THREE.BoxGeometry(20, wallHeight, wallThickness);
    const southWall = new THREE.Mesh(southWallGeometry, wallMaterial);
    southWall.position.set(0, wallHeight / 2, 7.5);
    southWall.castShadow = true;
    southWall.receiveShadow = true;
    scene.add(southWall);

    // East wall
    const eastWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, 15);
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    eastWall.position.set(10, wallHeight / 2, 0);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    scene.add(eastWall);

    // West wall with door opening
    const westWallGeometry1 = new THREE.BoxGeometry(wallThickness, wallHeight, 6);
    const westWall1 = new THREE.Mesh(westWallGeometry1, wallMaterial);
    westWall1.position.set(-10, wallHeight / 2, -4.5);
    westWall1.castShadow = true;
    westWall1.receiveShadow = true;
    scene.add(westWall1);

    const westWallGeometry2 = new THREE.BoxGeometry(wallThickness, wallHeight, 6);
    const westWall2 = new THREE.Mesh(westWallGeometry2, wallMaterial);
    westWall2.position.set(-10, wallHeight / 2, 4.5);
    westWall2.castShadow = true;
    westWall2.receiveShadow = true;
    scene.add(westWall2);

    // Interior walls
    const interiorWall1Geometry = new THREE.BoxGeometry(10, wallHeight, wallThickness);
    const interiorWall1 = new THREE.Mesh(interiorWall1Geometry, wallMaterial);
    interiorWall1.position.set(-5, wallHeight / 2, 0);
    interiorWall1.castShadow = true;
    interiorWall1.receiveShadow = true;
    scene.add(interiorWall1);

    const interiorWall2Geometry = new THREE.BoxGeometry(wallThickness, wallHeight, 7.5);
    const interiorWall2 = new THREE.Mesh(interiorWall2Geometry, wallMaterial);
    interiorWall2.position.set(5, wallHeight / 2, -3.75);
    interiorWall2.castShadow = true;
    interiorWall2.receiveShadow = true;
    scene.add(interiorWall2);

    // Add fire safety elements
    addFireSafetyElements(scene, wallHeight);
  };

  const addFireSafetyElements = (scene: THREE.Scene, wallHeight: number) => {
    // Fire alarm
    const alarmGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
    const alarmMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    
    const alarm1 = new THREE.Mesh(alarmGeometry, alarmMaterial);
    alarm1.position.set(8, wallHeight - 0.5, -7.4);
    scene.add(alarm1);
    
    const alarm2 = new THREE.Mesh(alarmGeometry, alarmMaterial);
    alarm2.position.set(-8, wallHeight - 0.5, 7.4);
    scene.add(alarm2);

    // Fire extinguishers
    const extinguisherGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 12);
    const extinguisherMaterial = new THREE.MeshStandardMaterial({ color: 0xff3333 });
    
    const extinguisher1 = new THREE.Mesh(extinguisherGeometry, extinguisherMaterial);
    extinguisher1.position.set(-9.8, 0.4, 0);
    scene.add(extinguisher1);
    
    const extinguisher2 = new THREE.Mesh(extinguisherGeometry, extinguisherMaterial);
    extinguisher2.position.set(9.8, 0.4, -5);
    scene.add(extinguisher2);

    // Exit signs
    const exitSignGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.05);
    const exitSignMaterial = new THREE.MeshStandardMaterial({ color: 0x33cc33 });
    
    const exitSign1 = new THREE.Mesh(exitSignGeometry, exitSignMaterial);
    exitSign1.position.set(-10, wallHeight - 0.5, 0);
    exitSign1.rotation.y = Math.PI / 2;
    scene.add(exitSign1);

    // Add evacuation route (visualization as a line)
    const routeMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 3 });
    const routePoints = [
      new THREE.Vector3(8, 0.1, 5),
      new THREE.Vector3(0, 0.1, 5),
      new THREE.Vector3(-5, 0.1, 3),
      new THREE.Vector3(-9, 0.1, 0)
    ];
    
    const routeGeometry = new THREE.BufferGeometry().setFromPoints(routePoints);
    const evacuationRoute = new THREE.Line(routeGeometry, routeMaterial);
    scene.add(evacuationRoute);

    // Add sprinkler heads
    const sprinklerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const sprinklerMaterial = new THREE.MeshStandardMaterial({ color: 0x3366ff });
    
    // Create a grid of sprinklers
    for (let x = -8; x <= 8; x += 4) {
      for (let z = -6; z <= 6; z += 4) {
        const sprinkler = new THREE.Mesh(sprinklerGeometry, sprinklerMaterial);
        sprinkler.position.set(x, wallHeight, z);
        scene.add(sprinkler);
      }
    }

    // Add compliance marker (green for compliant areas, red for non-compliant)
    const compliantMarker = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 16),
      new THREE.MeshBasicMaterial({ color: 0x00cc00, transparent: true, opacity: 0.5 })
    );
    compliantMarker.rotation.x = -Math.PI / 2;
    compliantMarker.position.set(7, 0.01, -5);
    scene.add(compliantMarker);
    
    const nonCompliantMarker = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 16),
      new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 })
    );
    nonCompliantMarker.rotation.x = -Math.PI / 2;
    nonCompliantMarker.position.set(-7, 0.01, -5);
    scene.add(nonCompliantMarker);
  };

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-full min-h-[400px] rounded-xl overflow-hidden ${className}`}
    />
  );
};

export default FloorPlanViewer;
