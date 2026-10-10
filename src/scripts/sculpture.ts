import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';

/** Decorative scene. Content/navigation never depend on WebGL. */
export function initSculpture() {
  const host = document.querySelector<HTMLElement>('#sculpture');
  const canvas = host?.querySelector('canvas');
  const button = host?.querySelector<HTMLButtonElement>('.scene-toggle');
  if (!host || !canvas || !button) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 700px)');
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !small.matches,
      alpha: true,
      powerPreference: 'low-power',
    });
  } catch {
    button.hidden = true;
    return;
  }
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, small.matches ? 1.35 : 1.8),
  );
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
  camera.position.set(0, 0, 13);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8e7b80, 3));
  const light = new THREE.DirectionalLight(0xffffff, 5);
  light.position.set(-3, 5, 6);
  scene.add(light);
  const group = new THREE.Group();
  scene.add(group);
  const wine = new THREE.MeshPhysicalMaterial({
    color: 0x861b3a,
    metalness: 0.55,
    roughness: 0.22,
    clearcoat: 1,
  });
  const porcelain = new THREE.MeshPhysicalMaterial({
    color: 0xf5f0eb,
    metalness: 0.06,
    roughness: 0.23,
    clearcoat: 1,
  });
  const chrome = new THREE.MeshStandardMaterial({
    color: 0xb5b3b9,
    metalness: 1,
    roughness: 0.16,
  });
  const segments = small.matches ? 64 : 110;
  const geometry = new THREE.TorusGeometry(
    1.32,
    0.41,
    small.matches ? 16 : 28,
    segments,
  );
  const objects: THREE.Mesh[] = [];
  const specs: [number, number, number, number, number, THREE.Material][] = [
    [-2.65, 0.42, -0.3, 0.3, 0.7, porcelain],
    [-1.24, -0.27, 0.5, 1.22, 0.2, wine],
    [0.28, 0.28, 0, 0.15, -0.7, chrome],
    [1.65, -0.22, 0.4, 1.14, 0.2, wine],
    [2.85, 0.48, -0.6, 0.3, 0.7, porcelain],
  ];
  specs.forEach(([x, y, z, rx, ry, material]) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, -0.27);
    group.add(mesh);
    objects.push(mesh);
  });
  const satelliteGeo = new THREE.SphereGeometry(0.25, 24, 16);
  const satellite = new THREE.Mesh(satelliteGeo, wine);
  satellite.position.set(-3.8, 1.8, 0);
  group.add(satellite);
  const satellite2 = new THREE.Mesh(satelliteGeo, chrome);
  satellite2.position.set(3.65, -1.65, 0);
  group.add(satellite2);
  let paused = reduced.matches,
    visible = true,
    frame = 0,
    disposed = false;
  const pointer = { x: 0, y: 0 };
  let last = 0,
    elapsed = 0;
  function resize() {
    if (!host) return;
    const w = host.clientWidth,
      h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 280 ? 21 : w < 700 ? 17 : 12.5;
    group.scale.setScalar(w < 700 ? 0.78 : 1);
    group.rotation.z = w < 700 ? -0.65 : -0.12;
    camera.updateProjectionMatrix();
    renderStill();
  }
  function renderStill() {
    if (!disposed) renderer.render(scene, camera);
  }
  function tick(time: number) {
    frame = 0;
    if (disposed || paused || !visible || document.hidden) return;
    const dt = Math.min((time - last) / 1000, 0.05);
    last = time;
    elapsed += dt;
    group.rotation.y += (pointer.x * 0.17 - group.rotation.y) * 0.035;
    group.rotation.x += (pointer.y * 0.1 - group.rotation.x) * 0.035;
    objects.forEach((mesh, i) => {
      mesh.position.y = specs[i][1] + Math.sin(elapsed * 0.5 + i * 0.8) * 0.1;
    });
    satellite.position.y = 1.65 + Math.sin(elapsed * 0.6) * 0.16;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  }
  function start() {
    if (!frame && !paused && visible && !document.hidden && !disposed) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  function updateButton() {
    button!.setAttribute('aria-pressed', String(paused));
    button!.textContent = paused ? 'Hareketi başlat ▷' : 'Hareketi durdur Ⅱ';
    button!.setAttribute(
      'aria-label',
      paused ? 'Sahne hareketini başlat' : 'Sahne hareketini durdur',
    );
  }
  button.addEventListener('click', () => {
    paused = !paused;
    updateButton();
    paused ? stop() : start();
  });
  host.addEventListener('pointermove', (event) => {
    const bounds = host.getBoundingClientRect();
    pointer.x = (event.clientX - bounds.left) / bounds.width - 0.5;
    pointer.y = (event.clientY - bounds.top) / bounds.height - 0.5;
  });
  host.addEventListener('pointerleave', () => {
    pointer.x = 0;
    pointer.y = 0;
  });
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    visible ? start() : stop();
  });
  observer.observe(host);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const visibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', visibility);
  const motion = () => {
    paused = reduced.matches;
    updateButton();
    paused ? stop() : start();
  };
  reduced.addEventListener('change', motion);
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    stop();
    host.classList.remove('scene-ready');
    button.hidden = true;
  });
  resize();
  host.classList.add('scene-ready');
  updateButton();
  if (!reduced.matches) {
    gsap.from(group.position, {
      y: -0.6,
      duration: 1.6,
      ease: 'power3.out',
      onUpdate: renderStill,
    });
  }
  start();
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) {
      stop();
      return;
    }
    disposed = true;
    stop();
    resizeObserver.disconnect();
    observer.disconnect();
    document.removeEventListener('visibilitychange', visibility);
    reduced.removeEventListener('change', motion);
    gsap.killTweensOf(group.position);
    geometry.dispose();
    satelliteGeo.dispose();
    wine.dispose();
    porcelain.dispose();
    chrome.dispose();
    environment.dispose();
    renderer.dispose();
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) start();
  });
}
