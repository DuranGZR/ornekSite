import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { studentObjects } from './student-objects';
export function createCampusScene(host: HTMLElement) {
  const canvas = host.querySelector('canvas')!;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x898084, 2));
  const light = new THREE.DirectionalLight(0xffffff, 4);
  light.position.set(3, 6, 5);
  scene.add(light);
  const root = new THREE.Group();
  scene.add(root);
  const objects = studentObjects();
  const poses: [THREE.Object3D, number[], number[]][] = [
    [objects.laptop, [0.5, -0.5, 0], [0, -0.65, 0]],
    [objects.notebook, [-2.2, 1.4, -0.7], [-2.55, -0.65, 0.5]],
    [objects.badge, [2.8, 1.25, 0.4], [2.55, -0.2, 0.2]],
    [objects.pencil, [-2.9, -0.25, 1.2], [-2.5, -0.36, 0.4]],
    [objects.keycap, [2.4, -1.9, 1.4], [1.7, -0.62, 1.65]],
  ];
  poses.forEach(([object]) => root.add(object));
  let progress = 0,
    mobile = false,
    paused = false,
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches,
    visible = true,
    frame = 0,
    dead = false;
  const pointer = new THREE.Vector2();
  const button = document.querySelector<HTMLButtonElement>('.campus-motion');
  function draw(time = 0) {
    const a = THREE.MathUtils.smoothstep(progress, 0.08, 0.85);
    root.position.set(mobile ? 0 : 1.9 * (1 - a), mobile ? -0.35 : 0, 0);
    root.scale.setScalar(mobile ? 0.77 : 1);
    root.rotation.set(
      -0.025 + pointer.y * 0.025,
      -0.28 + a * 0.55 + pointer.x * 0.08,
      0,
    );
    poses.forEach(([object, from, to], i) => {
      object.position.set(
        ...(from.map((value, k) => THREE.MathUtils.lerp(value, to[k], a)) as [
          number,
          number,
          number,
        ]),
      );
      if (!reduced && !paused)
        object.position.y += Math.sin(time * 0.00065 + i) * 0.09 * (1 - a);
    });
    objects.laptop.rotation.set(
      0.18 + a * 0.12,
      -0.16 + a * 0.14,
      -0.08 * (1 - a),
    );
    objects.hinge.rotation.x = -0.18 - a * 0.18;
    objects.notebook.rotation.set(0.62 + a * 0.12, -0.32, -0.35 + a * 0.2);
    objects.badge.rotation.set(0.1 - a * 0.5, -0.25, 0.18 * (1 - a));
    objects.pencil.rotation.set(0.7, 0, 0.45 + a * 0.7);
    objects.keycap.rotation.set(-0.15, 0.25, -0.3 + a * 0.25);
    renderer.render(scene, camera);
  }
  function animate(time: number) {
    frame = 0;
    draw(time);
    if (visible && !document.hidden && !reduced && !paused && !dead)
      frame = requestAnimationFrame(animate);
  }
  function update() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (dead) return;
    draw();
    if (visible && !document.hidden && !reduced && !paused)
      frame = requestAnimationFrame(animate);
  }
  function resize() {
    mobile = innerWidth <= 700;
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.4 : 1.8));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.position.set(0, 3.1, mobile ? 16.5 : 13.8);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    update();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  });
  intersection.observe(host);
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || reduced) return;
    pointer.set(
      (event.clientX / innerWidth) * 2 - 1,
      (event.clientY / innerHeight) * 2 - 1,
    );
  };
  const toggle = () => {
    paused = !paused;
    button?.setAttribute('aria-pressed', String(paused));
    if (button)
      button.textContent = paused
        ? 'Canlı hareketi başlat ▷'
        : 'Canlı hareketi durdur Ⅱ';
    update();
  };
  const onLost = (event: Event) => {
    event.preventDefault();
    host.classList.remove('scene-ready');
    if (button) button.hidden = true;
    cancelAnimationFrame(frame);
    dead = true;
  };
  canvas.addEventListener('webglcontextlost', onLost);
  window.addEventListener('pointermove', onPointer);
  document.addEventListener('visibilitychange', update);
  button?.addEventListener('click', toggle);
  resize();
  host.classList.add('scene-ready');
  return {
    setProgress(value: number) {
      progress = value;
      if (!frame && !dead) draw();
    },
    setReduced(value: boolean) {
      reduced = value;
      update();
    },
    dispose() {
      dead = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', update);
      button?.removeEventListener('click', toggle);
      canvas.removeEventListener('webglcontextlost', onLost);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((material) => material.dispose());
        }
      });
      objects.textures.forEach((texture) => texture.dispose());
      environment.dispose();
      renderer.dispose();
    },
  };
}
