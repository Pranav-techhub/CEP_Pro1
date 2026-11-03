/**
 * TeaRoute 3D Hero Experience
 * Built with Three.js: Futuristic delivery scooter, glowing thermal box, floating pins, and dynamic speed grid.
 * Optimized with IntersectionObserver to conserve GPU and battery when off-screen.
 */
import * as THREE from 'three';

export function initThreeHero(canvasId = 'three-hero-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  // Scene setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050811, 0.035);

  const container = canvas.parentElement;
  const width = container.clientWidth || 600;
  const height = container.clientHeight || 500;

  // Camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(4.5, 3.2, 5.5);
  camera.lookAt(0, 0.6, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xF59E0B, 2.5); // Warm gold keylight
  keyLight.position.set(6, 8, 4);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xFF6B00, 2.0); // Electric orange rim light
  rimLight.position.set(-6, 3, -4);
  scene.add(rimLight);

  const underglowLight = new THREE.PointLight(0x10B981, 2.0, 6); // Emerald ground underglow
  underglowLight.position.set(0, 0.2, 0);
  scene.add(underglowLight);

  // Root vehicle group
  const vehicleGroup = new THREE.Group();
  scene.add(vehicleGroup);

  // Materials
  const charcoalMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.3,
    metalness: 0.8
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0xF59E0B,
    emissiveIntensity: 0.15
  });
  const orangeMat = new THREE.MeshStandardMaterial({
    color: 0xFF6B00,
    roughness: 0.3,
    metalness: 0.5
  });
  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x050811,
    roughness: 0.8,
    metalness: 0.1
  });
  const neonGlowMat = new THREE.MeshBasicMaterial({
    color: 0xF59E0B
  });

  // 1. Scooter Main Chassis / Deck
  const deckGeo = new THREE.BoxGeometry(0.8, 0.18, 2.2);
  const deck = new THREE.Mesh(deckGeo, charcoalMat);
  deck.position.set(0, 0.5, 0);
  deck.castShadow = true;
  vehicleGroup.add(deck);

  // Accent side strips
  const stripGeo = new THREE.BoxGeometry(0.84, 0.04, 2.1);
  const strip = new THREE.Mesh(stripGeo, goldMat);
  strip.position.set(0, 0.5, 0);
  vehicleGroup.add(strip);

  // 2. Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 24);
  wheelGeo.rotateZ(Math.PI / 2);

  const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.24, 16);
  rimGeo.rotateZ(Math.PI / 2);

  // Rear Wheel
  const rearWheelGroup = new THREE.Group();
  rearWheelGroup.position.set(0, 0.38, -0.9);
  const rearTire = new THREE.Mesh(wheelGeo, rubberMat);
  rearTire.castShadow = true;
  const rearRim = new THREE.Mesh(rimGeo, goldMat);
  rearWheelGroup.add(rearTire);
  rearWheelGroup.add(rearRim);
  vehicleGroup.add(rearWheelGroup);

  // Front Wheel
  const frontWheelGroup = new THREE.Group();
  frontWheelGroup.position.set(0, 0.38, 0.9);
  const frontTire = new THREE.Mesh(wheelGeo, rubberMat);
  frontTire.castShadow = true;
  const frontRim = new THREE.Mesh(rimGeo, goldMat);
  frontWheelGroup.add(frontTire);
  frontWheelGroup.add(frontRim);
  vehicleGroup.add(frontWheelGroup);

  // 3. Steering Column & Handlebars
  const columnGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.3, 16);
  columnGeo.rotateX(-0.15);
  const column = new THREE.Mesh(columnGeo, charcoalMat);
  column.position.set(0, 1.1, 0.75);
  vehicleGroup.add(column);

  const barGeo = new THREE.BoxGeometry(0.9, 0.05, 0.05);
  const handlebar = new THREE.Mesh(barGeo, goldMat);
  handlebar.position.set(0, 1.7, 0.65);
  vehicleGroup.add(handlebar);

  // Headlight beam
  const lightConeGeo = new THREE.ConeGeometry(0.8, 2.5, 16, 1, true);
  lightConeGeo.rotateX(Math.PI / 2);
  const lightConeMat = new THREE.MeshBasicMaterial({
    color: 0xF59E0B,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide
  });
  const headlightBeam = new THREE.Mesh(lightConeGeo, lightConeMat);
  headlightBeam.position.set(0, 1.35, 2.2);
  vehicleGroup.add(headlightBeam);

  // 4. Insulated Thermal Delivery Box (The TeaRoute Box)
  const boxGeo = new THREE.BoxGeometry(0.75, 0.85, 0.85);
  const deliveryBox = new THREE.Mesh(boxGeo, orangeMat);
  deliveryBox.position.set(0, 1.05, -0.6);
  deliveryBox.castShadow = true;
  vehicleGroup.add(deliveryBox);

  // Neon band on delivery box
  const bandGeo = new THREE.BoxGeometry(0.78, 0.08, 0.88);
  const boxBand = new THREE.Mesh(bandGeo, neonGlowMat);
  boxBand.position.set(0, 1.05, -0.6);
  vehicleGroup.add(boxBand);

  // 5. Floating GPS Waypoint Pin above vehicle
  const pinGroup = new THREE.Group();
  pinGroup.position.set(0, 2.3, 0);

  const pinHeadGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const pinHead = new THREE.Mesh(pinHeadGeo, goldMat);
  pinHead.position.set(0, 0.4, 0);
  pinGroup.add(pinHead);

  const pinConeGeo = new THREE.ConeGeometry(0.2, 0.4, 16);
  pinConeGeo.rotateX(Math.PI);
  const pinCone = new THREE.Mesh(pinConeGeo, goldMat);
  pinCone.position.set(0, 0.15, 0);
  pinGroup.add(pinCone);

  // Pulsing holographic ring around pin
  const ringGeo = new THREE.RingGeometry(0.35, 0.4, 32);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xF59E0B,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7
  });
  const holoRing = new THREE.Mesh(ringGeo, ringMat);
  holoRing.position.set(0, 0.35, 0);
  pinGroup.add(holoRing);

  vehicleGroup.add(pinGroup);

  // 6. Ground Speed Grid
  const gridHelper = new THREE.GridHelper(24, 32, 0xF59E0B, 0x1E293B);
  gridHelper.position.y = 0;
  scene.add(gridHelper);

  // 7. Ambient Floating Particles (Sparks & Tea Aroma)
  const particleCount = 80;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 8;
    particlePositions[i + 1] = Math.random() * 3.5 + 0.2;
    particlePositions[i + 2] = (Math.random() - 0.5) * 8;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0xF59E0B,
    size: 0.05,
    transparent: true,
    opacity: 0.75
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Mouse Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationY = 0;
  let targetRotationX = 0;

  function onMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    targetRotationY = x * 0.45;
    targetRotationX = y * 0.25;
  }
  window.addEventListener('mousemove', onMouseMove);

  // Handle Resize
  function onResize() {
    const w = container.clientWidth || 600;
    const h = container.clientHeight || 500;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // Pause when off-screen
  let isVisible = true;
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(canvas);

  // Animation Loop
  let clock = new THREE.Clock();
  let animId = null;

  function animate() {
    animId = requestAnimationFrame(animate);
    if (!isVisible) return;

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    // Wheel rotation to simulate road travel
    rearTire.rotation.x += delta * 12;
    frontTire.rotation.x += delta * 12;

    // Road grid backward translation to simulate forward velocity
    gridHelper.position.z = (elapsed * 2.8) % 0.75;

    // Hover floating bounce of the vehicle
    vehicleGroup.position.y = Math.sin(elapsed * 4) * 0.035;

    // Floating pin animation
    pinGroup.position.y = 2.3 + Math.sin(elapsed * 2.5) * 0.08;
    pinGroup.rotation.y += delta * 1.5;
    holoRing.scale.setScalar(1 + Math.sin(elapsed * 3) * 0.15);

    // Smooth mouse tilt
    vehicleGroup.rotation.y += (targetRotationY - vehicleGroup.rotation.y) * 0.05;
    vehicleGroup.rotation.x += (targetRotationX - vehicleGroup.rotation.x) * 0.05;

    // Subtle particle drift
    const positions = particles.geometry.attributes.position.array;
    for (let i = 2; i < positions.length; i += 3) {
      positions[i] -= delta * 3.5;
      if (positions[i] < -4) positions[i] = 4;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();

  return {
    destroy() {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      renderer.dispose();
    }
  };
}
