// Shared parts for TorqueClear: constants, number formatting, chart boards, straight force arrows that
// point anywhere, curled torque arrows, a looping timer, people, and small models (hex nut, spanner,
// seated child, gear wheel). Chart and arrow helpers follow ForceClear and WorkClear, so the boxes look alike.
// Scenes are built in metres unless a chapter says otherwise: +x to the right, +y up, +z towards you.
import { THREE, M, box, beam, sphere, torus, arrow, clamp } from './kit.js';

// ---------------------------------------------------------------- constants
export const G = 9.81;                 // m/s², Earth's surface gravity (standard gravity 9.80665)
export const KMH = 3.6;
export const TAU = Math.PI * 2;
export const D2R = Math.PI / 180;

export const fmt = (v, d = 1) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-IN') : v.toFixed(d));
// Forces with sensible units: 0.52 N, 18 N, 1,340 N, 7.5 kN, 2.5 MN.
export function fmtN(F, big = 1e4) {
  const a = Math.abs(F), s = F < 0 ? '−' : '';
  if (a >= 1e6) return s + (a / 1e6).toFixed(a >= 1e7 ? 0 : 1) + ' MN';
  if (a >= big) return s + (a / 1000).toFixed(a >= 1e5 ? 0 : 1) + ' kN';
  if (a >= 100) return s + Math.round(a).toLocaleString('en-IN') + ' N';
  if (a >= 10) return s + a.toFixed(0) + ' N';
  return s + a.toFixed(a >= 1 ? 1 : 2) + ' N';
}

// ---------------------------------------------------------------- boards
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = () => { draw(g, pxW, pxH); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return { tex, redraw, canvas: c, mesh: m };
}
export function title(g, text, sub = '') {
  g.fillStyle = '#e8eef8'; g.font = 'bold 24px sans-serif'; g.fillText(text, 20, 34);
  if (sub) { const x = 34 + g.measureText(text).width; g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(sub, x, 34); }
}
// Axes with a grid. Returns X(x) and Y(y) for the plot area.
export function axes(g, w, h, { x0 = 84, x1 = w - 28, y0 = h - 64, y1 = 70, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '', log = false }) {
  const X = (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = log ? (y) => y0 - ((Math.log10(y) - yMin) / (yMax - yMin)) * (y0 - y1) : (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '19px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 26); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 6); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '18px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 52);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function dot(g, x, y, col, r = 10) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function line(g, pts, X, Y, col, wdt = 5, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
// A flat 2D arrow on a canvas from (x, y) by (dx, dy) pixels, with an optional label at its tip.
export function arrow2d(g, x, y, dx, dy, col, label = '', { w = 6, dash = null, head = 16, font = 'bold 19px sans-serif', lx = 8, ly = 0 } = {}) {
  const L = Math.hypot(dx, dy);
  if (L < 2) return;
  const ux = dx / L, uy = dy / L, hl = Math.min(head, L * 0.6);
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = w; g.setLineDash(dash || []);
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + dx - ux * hl * 0.8, y + dy - uy * hl * 0.8); g.stroke(); g.setLineDash([]);
  g.beginPath(); g.moveTo(x + dx, y + dy); g.lineTo(x + dx - ux * hl - uy * hl * 0.55, y + dy - uy * hl + ux * hl * 0.55); g.lineTo(x + dx - ux * hl + uy * hl * 0.55, y + dy - uy * hl - ux * hl * 0.55); g.closePath(); g.fill();
  if (label) { g.font = font; g.fillText(label, x + dx + (ux >= -0.3 ? lx : -lx - g.measureText(label).width), y + dy + (uy > 0.3 ? 20 : uy < -0.3 ? -6 : 6) + ly); }
}
export const COL = { push: '#ffb547', pull: '#8ef0ff', net: '#ff5a8a', fric: '#ff7a59', weight: '#c49bff', normal: '#7be08c', acc: '#5ce1a9', soft: 'rgba(255,255,255,.55)' };
export const HEX = { push: 0xffb547, pull: 0x8ef0ff, net: 0xff5a8a, fric: 0xff7a59, weight: 0xc49bff, normal: 0x7be08c, acc: 0x5ce1a9 };

// ---------------------------------------------------------------- stage helpers
export const inReel = () => document.body.classList.contains('gb-reel');
// On a phone-width stage: hide the minor labels and nudge the picture down, clear of the readout.
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow && !inReel() ? -0.12 : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  return narrow;
}
// Boards sit beside the model on a wide screen. In the tall reel video they move to 'reelPos'.
// A chapter that moves a board between scenes calls homeBoard(b, pos, rotY, scale) to set its wide-screen spot.
export function homeBoard(b, pos, rotY = 0, scale = 1) {
  b.home = { p: new THREE.Vector3(...pos), r: rotY, s: scale };
  if (!inReel()) { b.mesh.position.set(...pos); b.mesh.rotation.set(0, rotY, 0); b.mesh.scale.setScalar(scale); }
}
export function reelBoards(list) {
  const r = inReel();
  list.forEach(([b, pos, scale = 1]) => {
    if (!b.home) b.home = { p: b.mesh.position.clone(), r: b.mesh.rotation.y, s: b.mesh.scale.x };
    if (r) { b.mesh.position.set(...pos); b.mesh.scale.setScalar(scale); b.mesh.rotation.set(0, 0, 0); }
    else { b.mesh.position.copy(b.home.p); b.mesh.scale.setScalar(b.home.s); b.mesh.rotation.set(0, b.home.r, 0); }
  });
}
// Set a chapter control from code (after dragging, say) so its slider and every readout follow.
export function setControl(label, value) {
  const el = [...document.querySelectorAll('#panel .controls input[type=range]')].find((i) => i.getAttribute('aria-label') === label);
  if (!el) return false;
  el.value = value; el.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

// ---------------------------------------------------------------- arrows
// A kit arrow that can point any way: aim(from, dir, len). dir is a unit-ish [x, y, z].
const UP = new THREE.Vector3(0, 1, 0), tmpV = new THREE.Vector3();
export function force(color, r = 0.035, head = 0.2) {
  const a = arrow(color, 1, head, r);
  a.renderOrder = 10;
  a.traverse((o) => { if (o.material) { o.material.depthTest = false; o.material.transparent = true; o.renderOrder = 10; } });
  a.aim = (from, dir, len) => {
    a.position.set(...from);
    tmpV.set(...dir); if (tmpV.lengthSq() < 1e-9) tmpV.set(1, 0, 0);
    a.quaternion.setFromUnitVectors(UP, tmpV.normalize());
    a.set(Math.max(0.001, len));
    if (len < 0.03) a.visible = false;
  };
  return a;
}

// ---------------------------------------------------------------- people and machines
// A person standing with feet at the origin, facing +x. pose({ arm, lean, stride }).
export function makePerson({ shirt = 0x3b6fd8, pants = 0x2b3242, skin = 0xc68b64, hair = 0x1b1410, s = 1 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const cloth = M.matte(shirt), jeans = M.matte(pants), sk = M.matte(skin);
  const hipY = 0.92 * s;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.16 * s, 0.38 * s, 6, 14), cloth); torso.position.y = 0.3 * s; torso.scale.z = 1.25; torso.castShadow = true; body.add(torso);
  const head = sphere(0.11 * s, sk, 24); head.position.y = 0.74 * s; body.add(head);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.115 * s, 20, 10, 0, Math.PI * 2, 0, 1.3), M.matte(hair)); hairM.position.copy(head.position); hairM.rotation.z = 0.35; body.add(hairM);
  const limb = (len, r, mat) => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len - 2 * r, 4, 10), mat); m.position.y = -len / 2; m.castShadow = true; p.add(m); return p; };
  const arms = [-1, 1].map((z) => { const a = limb(0.62 * s, 0.05 * s, cloth); a.position.set(0, 0.52 * s, z * 0.22 * s); body.add(a); const hand = sphere(0.05 * s, sk, 12); hand.position.y = -0.62 * s; a.add(hand); return a; });
  const legs = [-1, 1].map((z) => { const l = limb(0.88 * s, 0.065 * s, jeans); l.position.set(0, hipY, z * 0.1 * s); g.add(l); const shoe = box(0.22 * s, 0.07 * s, 0.1 * s, M.matte(0x1b1d22)); shoe.position.set(0.05 * s, -0.88 * s, 0); l.add(shoe); return l; });
  body.position.y = hipY;
  g.pose = ({ arm = 0, lean = 0, stride = 0 } = {}) => {
    arms.forEach((a) => { a.rotation.z = arm; });
    body.rotation.z = -lean;
    legs[0].rotation.z = stride; legs[1].rotation.z = -stride;
  };
  g.arms = arms; g.legs = legs; g.body = body;
  return g;
}
// Many small glowing dots. place(i, x, y, z, s) then done().
export function dots(n, r, color = 0xffffff, seg = 8) {
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity: 0.8 }), n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const o = new THREE.Object3D();
  mesh.place = (i, x, y, z, s = 1) => { o.position.set(x, y, z); o.scale.setScalar(Math.max(0.0001, s)); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); };
  mesh.done = () => { mesh.instanceMatrix.needsUpdate = true; };
  return mesh;
}
// Deterministic pseudo-random numbers so every run (and every video frame) looks the same.
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ---------------------------------------------------------------- energy and power
// Work and energy with sensible units: 12 J, 1,000 J, 24.5 kJ, 8.4 MJ.
export function fmtJ(E, big = 1e4) {
  const a = Math.abs(E), s = E < 0 ? '−' : '';
  if (a >= 1e9) return s + (a / 1e9).toFixed(1) + ' GJ';
  if (a >= 1e6) return s + (a / 1e6).toFixed(a >= 1e8 ? 0 : 1) + ' MJ';
  if (a >= big) return s + (a / 1000).toFixed(a >= 1e5 ? 0 : 1) + ' kJ';
  if (a >= 100) return s + Math.round(a).toLocaleString('en-IN') + ' J';
  if (a >= 10) return s + a.toFixed(0) + ' J';
  return s + a.toFixed(a >= 1 ? 1 : 2) + ' J';
}
// Power: 9 W, 353 W, 1.5 kW, 67 kW, 2.1 MW.
export function fmtW(P) {
  const a = Math.abs(P), s = P < 0 ? '−' : '';
  if (a >= 1e6) return s + (a / 1e6).toFixed(1) + ' MW';
  if (a >= 1e4) return s + (a / 1000).toFixed(0) + ' kW';
  if (a >= 1000) return s + (a / 1000).toFixed(a >= 1e4 ? 0 : 2).replace(/\.?0+$/, '') + ' kW';
  if (a >= 10) return s + Math.round(a) + ' W';
  return s + a.toFixed(1) + ' W';
}
export const HP = 745.7;               // W in one mechanical horsepower: 33,000 ft·lbf per minute (Watt, 1783)

// A looping clock for "do it, pause, do it again": returns progress 0→1 over dur seconds, then holds 1.
export function looper(dur = 4, pause = 1.4) {
  let t = 0;
  const L = {
    k: 0, speed: 1,
    reset() { t = 0; L.k = 0; },
    tick(dt, d = dur) { t += dt; if (t > d + pause) t = 0; L.k = clamp(t / d, 0, 1); return L.k; },
  };
  return L;
}

// A rope or rod that can be re-aimed every frame: between([x,y,z], [x,y,z]).
export function stick(r, mat, seg = 8) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, seg), mat);
  m.castShadow = true;
  const A = new THREE.Vector3(), B = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  m.between = (a, b) => {
    A.set(...a); B.set(...b);
    const L = A.distanceTo(B); m.visible = L > 1e-3; if (!m.visible) return;
    m.position.copy(A).add(B).multiplyScalar(0.5); m.scale.set(1, L, 1);
    m.quaternion.setFromUnitVectors(Y, B.sub(A).normalize());
  };
  return m;
}
// A round number at or above v for a chart axis: 1, 2, 2.5, 5 × 10ⁿ.
export function niceMax(v) {
  v = Math.max(1e-9, v); const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const k of [1, 2, 2.5, 5, 10]) if (k * p >= v * 0.999) return k * p;
  return 10 * p;
}



// ---------------------------------------------------------------- torque
// Torque with sensible units: 0.36 N·m, 4.2 N·m, 113 N·m, 1,340 N·m.
export function fmtNm(t) {
  const a = Math.abs(t), s = t < 0 ? '−' : '';
  if (a >= 1000) return s + Math.round(a).toLocaleString('en-IN') + ' N·m';
  if (a >= 100) return s + Math.round(a) + ' N·m';
  if (a >= 10) return s + a.toFixed(a >= 20 ? 0 : 1) + ' N·m';
  if (a >= 0.1) return s + a.toFixed(a >= 1 ? 1 : 2) + ' N·m';
  return s + a.toFixed(3) + ' N·m';
}
export const rpmToW = (rpm) => (rpm * TAU) / 60;           // rpm → rad/s
export const PS = 735.5;                                    // W in one metric horsepower (PS), used for Indian engine specs

// A curled arrow round the local Z axis: set(arc) with arc in radians, + for anticlockwise seen from +z,
// − for clockwise. Geometries are cached every 5°, so it can change every frame without garbage.
export function twist(color = 0xffb547, R = 0.3, r = 0.022) {
  const g = new THREE.Group(), mat = M.glow(color, { side: THREE.DoubleSide, transparent: true, depthTest: false });
  const cache = new Map();
  const arcMesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(r * 3, r * 8, 16), mat);
  arcMesh.renderOrder = tip.renderOrder = 11;
  g.add(arcMesh, tip);
  g.start = 0.3;                                           // where the arc starts, radians from +x
  g.set = (arc) => {
    const a = Math.abs(arc);
    g.visible = a > 0.05;
    if (!g.visible) return;
    const q = Math.max(1, Math.min(72, Math.round((a * 180) / Math.PI / 5)));
    if (!cache.has(q)) cache.set(q, new THREE.TorusGeometry(R, r, 8, Math.max(6, q * 2), (q * 5 * Math.PI) / 180));
    arcMesh.geometry = cache.get(q);
    const end = (q * 5 * Math.PI) / 180;
    arcMesh.rotation.z = g.start;
    tip.position.set(R * Math.cos(g.start + end), R * Math.sin(g.start + end), 0);
    tip.rotation.z = g.start + end;                        // cone points along +y locally: tangent of the arc
    g.scale.x = arc < 0 ? -1 : 1;
  };
  g.set(1);
  return g;
}

// A hexagonal nut on a short bolt; its axis is along Z, the flat face towards +z. size = across the corners.
export function makeNut(size = 0.05, color = 0xc9ced8) {
  const g = new THREE.Group();
  const nut = new THREE.Mesh(new THREE.CylinderGeometry(size / 2, size / 2, size * 0.8, 6), M.metal(color, { roughness: 0.35 }));
  nut.rotation.x = Math.PI / 2; nut.castShadow = true; g.add(nut);
  const stud = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.28, size * 0.28, size * 1.3, 20), M.metal(0x8c95a3));
  stud.rotation.x = Math.PI / 2; stud.position.z = size * 0.3; g.add(stud);
  const mark = box(size * 0.08, size * 0.3, 0.004, M.glow(0xff7a59)); mark.position.set(0, size * 0.28, size * 0.41); g.add(mark);
  g.nut = nut;
  return g;
}

// A ring spanner lying in the XY plane: the ring round the origin, the handle running out along −x to 'len'.
export function makeSpanner(len = 0.45, color = 0xb9bec8) {
  const g = new THREE.Group(), mat = M.metal(color, { roughness: 0.3 });
  const ring = torus(0.042, 0.014, mat, 32); g.add(ring);
  const handle = box(len - 0.03, 0.032, 0.014, mat); handle.position.x = -(len + 0.03) / 2; g.add(handle);
  const grip = box(0.12, 0.042, 0.03, M.matte(0x22252c)); grip.position.x = -len + 0.06; g.add(grip);
  g.len = len;
  return g;
}

// A seated child facing +z, hips at the origin. s scales the whole child (1 ≈ a 10-year-old).
export function makeKid({ shirt = 0x3b6fd8, pants = 0x2b3242, skin = 0xc68b64, hair = 0x1b1410, s = 1 } = {}) {
  const g = new THREE.Group(), cloth = M.matte(shirt), jeans = M.matte(pants), sk = M.matte(skin);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.12 * s, 0.26 * s, 6, 12), cloth); torso.position.y = 0.26 * s; torso.castShadow = true; g.add(torso);
  const head = sphere(0.09 * s, sk, 20); head.position.y = 0.6 * s; g.add(head);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.095 * s, 16, 8, 0, Math.PI * 2, 0, 1.3), M.matte(hair)); hairM.position.copy(head.position); hairM.rotation.x = -0.3; g.add(hairM);
  for (const x of [-0.07, 0.07]) {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.05 * s, 0.24 * s, 4, 8), jeans); thigh.rotation.x = Math.PI / 2; thigh.position.set(x * s, 0.02 * s, 0.14 * s); g.add(thigh);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.045 * s, 0.24 * s, 4, 8), jeans); shin.position.set(x * s, -0.16 * s, 0.3 * s); g.add(shin);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.035 * s, 0.26 * s, 4, 8), cloth); arm.position.set(x * 2.1 * s, 0.24 * s, 0.08 * s); arm.rotation.x = -0.9; g.add(arm);
  }
  return g;
}

// A spur gear with its axis along Z. r = pitch radius.
export function makeGear(r, teeth, width = 0.02, color = 0x9aa3b2) {
  const g = new THREE.Group(), mat = M.metal(color, { roughness: 0.35 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.93, r * 0.93, width, 48), mat); disc.rotation.x = Math.PI / 2; disc.castShadow = true; g.add(disc);
  const tw = Math.min(r * 0.2, (TAU * r) / teeth * 0.5);
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(tw, r * 0.07 + 0.012, width), mat, teeth);
  const o = new THREE.Object3D();
  for (let i = 0; i < teeth; i++) { const a = (i / teeth) * TAU; o.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); o.rotation.set(0, 0, a - Math.PI / 2); o.updateMatrix(); inst.setMatrixAt(i, o.matrix); }
  g.add(inst);
  const mark = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.1, r * 0.1, width + 0.004, 12), M.glow(0xff7a59)); mark.rotation.x = Math.PI / 2; mark.position.set(r * 0.6, 0, 0); g.add(mark);
  return g;
}

// A dashed-looking line between two points, drawn as a row of short sticks (lever arms, lines of action).
export function dashes(n, r, mat) {
  const g = new THREE.Group(), bits = Array.from({ length: n }, () => { const b = stick(r, mat, 6); g.add(b); return b; });
  const A = new THREE.Vector3(), B = new THREE.Vector3(), P = new THREE.Vector3(), Q = new THREE.Vector3();
  g.between = (a, b) => {
    A.set(...a); B.set(...b);
    const L = A.distanceTo(B); g.visible = L > 0.01; if (!g.visible) return;
    bits.forEach((bit, i) => { P.lerpVectors(A, B, i / n); Q.lerpVectors(A, B, (i + 0.55) / n); bit.between(P.toArray(), Q.toArray()); });
  };
  return g;
}

export { clamp, THREE, M, box, beam, sphere, torus };
