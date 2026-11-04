import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

interface GridScanProps {
  sensitivity?: number;
  lineThickness?: number;
  linesColor?: string;
  gridScale?: number;
  scanColor?: string;
  scanOpacity?: number;
  enablePost?: boolean;
  bloomIntensity?: number;
  chromaticAberration?: number;
  noiseIntensity?: number;
}

const GridScan: React.FC<GridScanProps> = ({
  sensitivity = 0.55,
  lineThickness = 1,
  linesColor = '#351d10',
  gridScale = 0.1,
  scanColor = '#fc6723',
  scanOpacity = 0.4,
  enablePost = true,
  bloomIntensity = 0.6,
  chromaticAberration = 0.002,
  noiseIntensity = 0.01,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create grid
    const gridSize = 50;
    const gridHelper = new THREE.GridHelper(gridSize, gridSize / gridScale, linesColor, linesColor);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // Create scan line
    const scanGeometry = new THREE.PlaneGeometry(gridSize, 0.5);
    const scanMaterial = new THREE.MeshBasicMaterial({
      color: scanColor,
      transparent: true,
      opacity: scanOpacity,
      side: THREE.DoubleSide,
    });
    const scanLine = new THREE.Mesh(scanGeometry, scanMaterial);
    scanLine.position.z = -gridSize / 2;
    scene.add(scanLine);

    // Post-processing
    if (enablePost) {
      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight),
        bloomIntensity,
        0.4,
        0.85
      );
      composer.addPass(bloomPass);

      composerRef.current = composer;
    }

    // Animation
    let scanPosition = -gridSize / 2;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Animate scan line
      scanPosition += 0.1;
      if (scanPosition > gridSize / 2) {
        scanPosition = -gridSize / 2;
      }
      scanLine.position.z = scanPosition;

      // Rotate grid slightly
      gridHelper.rotation.z += 0.001;

      // Render
      if (enablePost && composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);

      if (enablePost && composerRef.current) {
        composerRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scanGeometry.dispose();
      scanMaterial.dispose();
    };
  }, [
    sensitivity,
    lineThickness,
    linesColor,
    gridScale,
    scanColor,
    scanOpacity,
    enablePost,
    bloomIntensity,
    chromaticAberration,
    noiseIntensity,
  ]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default GridScan;