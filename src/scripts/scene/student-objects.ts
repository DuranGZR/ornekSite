import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export function studentObjects() {
  const textures: THREE.Texture[] = [];
  const silver = new THREE.MeshStandardMaterial({
    color: '#c4c6cc',
    metalness: 0.8,
    roughness: 0.28,
  });
  const ink = new THREE.MeshStandardMaterial({
    color: '#202329',
    roughness: 0.5,
  });
  const wine = new THREE.MeshStandardMaterial({
    color: '#851c40',
    roughness: 0.4,
  });
  const paper = new THREE.MeshStandardMaterial({
    color: '#f4f0e8',
    roughness: 0.7,
  });
  const box = (
    w: number,
    h: number,
    d: number,
    material: THREE.Material,
    r = 0.06,
  ) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), material);
  function label(
    lines: string[],
    background: string,
    color: string,
    width: number,
    height: number,
  ) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 1024, 640);
    ctx.strokeStyle = color + '22';
    for (let x = 0; x < 1024; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 640);
      ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.font = 'bold 110px sans-serif';
    lines.forEach((line, i) => ctx.fillText(line, 65, 180 + i * 140));
    ctx.font = '22px monospace';
    ctx.fillText('HSD INONU / BUILD TOGETHER', 65, 590);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
    return new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture }),
    );
  }
  const laptop = new THREE.Group();
  laptop.add(box(3.8, 0.16, 2.5, silver));
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 12; c++) {
      const key = box(0.235, 0.035, 0.23, ink, 0.025);
      key.position.set(-1.57 + c * 0.285, 0.1, -0.78 + r * 0.28);
      laptop.add(key);
    }
  const trackpad = box(1.25, 0.012, 0.65, silver);
  trackpad.position.set(0, 0.089, 0.65);
  laptop.add(trackpad);
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.13, -1.16);
  laptop.add(hinge);
  const lid = box(3.82, 2.4, 0.12, silver);
  lid.position.y = 1.2;
  hinge.add(lid);
  const screen = label(
    ['hello,', 'together.'],
    '#191c26',
    '#ffb1c8',
    3.55,
    2.17,
  );
  screen.position.set(0, 1.21, 0.069);
  hinge.add(screen);
  const notebook = new THREE.Group();
  notebook.add(box(1.65, 0.24, 2.3, wine));
  const pages = box(1.58, 0.15, 2.2, paper);
  pages.position.y = 0.02;
  notebook.add(pages);
  const cover = box(1.65, 0.035, 2.3, wine);
  cover.position.y = 0.15;
  notebook.add(cover);
  const title = label(
    ['ideas', 'start here.'],
    '#851c40',
    '#f4eddf',
    1.55,
    2.2,
  );
  title.rotation.x = -Math.PI / 2;
  title.position.y = 0.171;
  notebook.add(title);
  const badge = new THREE.Group();
  badge.add(box(1.3, 1.82, 0.08, paper));
  const pass = label(['hsd', 'inonu.'], '#f4f0e8', '#851c40', 1.2, 1.72);
  pass.position.z = 0.046;
  badge.add(pass);
  const strap = box(0.18, 1.2, 0.045, wine);
  strap.position.y = 1.4;
  badge.add(strap);
  const pencil = new THREE.Group();
  pencil.add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2, 12), wine),
  );
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.2, 12), paper);
  tip.position.y = 1.1;
  pencil.add(tip);
  const keycap = new THREE.Group();
  keycap.add(box(0.85, 0.85, 0.26, paper));
  const symbol = label(['</>'], '#f4f0e8', '#851c40', 0.76, 0.76);
  symbol.position.z = 0.14;
  keycap.add(symbol);
  return { laptop, hinge, notebook, badge, pencil, keycap, textures };
}
