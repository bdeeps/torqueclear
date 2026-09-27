// Chapter 4: torque in everyday things. In each, a job needs a certain torque, and the size of the thing
// you grip sets how much force that takes: F = τ ÷ r.
//  - steer: a steering wheel is turned by two hands pushing in opposite directions, a couple, so
//    τ = 2 F r. Turning the wheels of a parked car with no assist can take about 25–30 N·m at the
//    steering wheel (an estimate from published parking-effort studies; power steering is designed so
//    that the driver supplies only a few N·m, and evaluation targets ask for under about 4.5 N·m).
//    We use 30 N·m unassisted and 4 N·m with assist. Car wheels are about 37 cm across; old trucks and
//    buses without power steering had wheels of 50 cm or more.
//  - screw: a hand turns a handle by gripping its surface, and the tangential force it can apply before
//    slipping is limited by grip. We take about 200 N at the surface (a rough figure), so the most torque
//    is about 200 N × d/2: fatter handles give more torque, as grip studies such as Pheasant & O'Neill
//    (1975) found for handles up to about 50 mm. A long wood screw driven home needs about 3 N·m (estimate).
//  - crack: a nutcracker is a lever with the hinge at one end (class 2). Moments about the hinge:
//    F_hand × b = F_nut × a, so the nut feels F b ÷ a. Walnuts crack at about 150–250 N depending on the
//    direction of the squeeze (Koyuncu et al., Biosystems Engineering 87, 2004); we use 200 N. a = 3 cm.
//  - brace: a wheel brace 35 cm long on a rusted wheel nut needing 180 N·m (an estimate; nuts are usually
//    tightened to about 80–130 N·m). A pipe slid over the handle lengthens the lever arm. A torque wrench
//    (45 cm) clicks when the torque reaches its setting, here 110 N·m.
//  - arm: the forearm as a lever with the elbow as pivot. The biceps attaches about 4.5 cm from the elbow;
//    its moment arm is largest near 90° and falls at full stretch, modelled as 4.5 cm × (0.35 + 0.65 sin θ)
//    (after Murray et al., J Biomech 28:513, 1995). The load in the hand is 35 cm out; the forearm and
//    hand weigh about 1.4 kg with their centre about 17 cm out (Winter's segment tables). The same model as
//    SkeletonClear's levers chapter.
import { THREE, M, box, sphere, clamp, approach } from '../kit.js';
import {
  G, D2R, TAU, board, panelBg, title, axes, dot, line, COL, HEX, force, stick, twist, makeNut,
  fitNarrow, reelBoards, homeBoard, inReel, fmtN, fmtNm, niceMax,
} from '../torque.js';

const SX = 30, CX = 60, BX = 90, AX = 120;
const VIEWS = {
  steer: { pos: [0.15, 1.2, 1.6], target: [-0.02, 1.02, 0] },
  screw: { pos: [SX + 0.05, 0.42, 0.62], target: [SX + 0.02, 0.28, 0] },
  crack: { pos: [CX + 0.06, 0.45, 0.55], target: [CX + 0.04, 0.33, 0] },
  brace: { pos: [BX - 0.05, 0.85, 1.9], target: [BX - 0.12, 0.5, 0] },
  arm: { pos: [AX + 0.2, 1.36, 1.55], target: [AX + 0.12, 1.2, 0] },
};
const GRIP = 200, NEED_SCREW = 3, CRACK = 200, NUT_A = 0.03, RUST = 180, SET = 110, BRACE = 0.35, TWL = 0.45;
export const steer = (s) => { const r = s.dia / 200, tau = s.ps ? 4 : 30; return { r, tau, F: tau / (2 * r) }; };
export const screw = (s) => { const tmax = (GRIP * s.hd) / 2000; return { tmax, ok: tmax >= NEED_SCREW, Fneed: (NEED_SCREW / (s.hd / 2000)) }; };
export const crack = (s) => { const Fn = (s.sq * s.hb) / 100 / NUT_A; return { Fn, ok: Fn >= CRACK, Fneed: (CRACK * NUT_A) / (s.hb / 100) }; };
export function brace(s) {
  const L = s.twr ? TWL : BRACE + s.ext, tau = s.bp * L;
  return { L, tau, ok: s.twr ? tau >= SET : tau >= RUST, need: s.twr ? SET : RUST, Fneed: (s.twr ? SET : RUST) / L };
}
export function arm(s) {
  const sn = Math.sin(s.ang * D2R), rb = 0.045 * (0.35 + 0.65 * sn);
  const tau = (s.kg * 0.35 + 1.4 * 0.17) * G * sn;
  return { rb, tau, F: tau / rb, ratio: s.kg > 0 ? tau / rb / (s.kg * G) : 0 };
}

export default {
  id: 'everyday',
  short: 'Everyday',
  title: 'Torque in your hands',
  subtitle: 'Steering wheels, screwdrivers, nutcrackers, wheel braces and your own forearm.',
  view: VIEWS.steer,
  learn: `<p>Once you know τ = F × r, you see it everywhere. When a job needs a certain torque, a <b>bigger radius means a smaller force</b>.</p>
    <p>A <b>steering wheel</b> is big so your hands work far from the column. Old lorries and buses without power steering had huge wheels for exactly this reason. A <b>screwdriver</b> with a fat handle lets your grip act further from the screw’s axis, so the same grip gives more torque.</p>
    <p>A <b>nutcracker</b> is a lever with its hinge at one end. Squeeze far from the hinge and the nut, close to it, feels many times your squeeze: F<sub>nut</sub> × a = F<sub>hand</sub> × b. A <b>wheel brace</b> works the same way. Slide a pipe over its handle and your push acts twice as far out, so it makes twice the torque. <b>Your force doesn’t grow, the torque does.</b> A <b>torque wrench</b> goes the other way: it clicks when you reach the right torque, so a nut is tight but not over-tight. Never extend a torque wrench with a pipe.</p>
    <p>Your <b>forearm</b> is a lever too, but a backwards one. The biceps pulls only about 4.5 cm from the elbow, while a load sits about 35 cm out in your hand. So the muscle must pull about <b>8 to 9 times</b> the load. You trade force for speed and reach (see SkeletonClear).</p>
    <p class="tip"><b>Try it:</b> switch power steering off and shrink the wheel. Find the thinnest screwdriver handle that still drives the screw. Then slide the pipe onto the wheel brace until the rusty nut gives.</p>`,
  terms: [
    { t: 'Couple', d: 'Two equal forces pushing opposite ways on either side of a pivot. It turns without pushing: τ = F × the distance between them.' },
    { t: 'Wheel and axle', d: 'A big wheel fixed to a thin shaft: a small force at the rim makes a big torque on the shaft.' },
    { t: 'Class 2 lever', d: 'Pivot at one end, load in the middle, effort at the far end: a nutcracker or wheelbarrow.' },
    { t: 'Class 3 lever', d: 'Pivot at one end, effort in the middle, load at the far end: your forearm or tweezers.' },
    { t: 'Torque wrench', d: 'A spanner that shows or clicks at a set torque, so bolts are tightened just right.' },
  ],
  defaults: { focus: 'steer', dia: 37, ps: false, hd: 25, hb: 16, sq: 40, ext: 0, bp: 350, twr: false, kg: 5, ang: 90 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'steer', label: 'Steering' }, { v: 'screw', label: 'Screwdriver' }, { v: 'crack', label: 'Nutcracker' }, { v: 'brace', label: 'Wheel brace' }, { v: 'arm', label: 'Forearm' }] },
    { key: 'dia', type: 'range', label: 'Steering: wheel diameter', min: 28, max: 55, step: 1, ends: ['28 cm', '55 cm'], fmt: (v) => v + ' cm' },
    { key: 'ps', type: 'toggle', label: 'Steering: power steering', hint: 'A motor supplies most of the 30 N·m needed to turn a parked car’s wheels.' },
    { key: 'hd', type: 'range', label: 'Screwdriver: handle diameter', min: 12, max: 50, step: 1, ends: ['12 mm', '50 mm'], fmt: (v) => v + ' mm' },
    { key: 'hb', type: 'range', label: 'Nutcracker: hand distance from hinge', min: 6, max: 20, step: 0.5, ends: ['6 cm', '20 cm'], fmt: (v) => v + ' cm' },
    { key: 'sq', type: 'range', label: 'Nutcracker: squeeze', min: 10, max: 150, step: 1, ends: ['10 N', '150 N'], fmt: (v) => v + ' N' },
    { key: 'ext', type: 'range', label: 'Wheel brace: pipe extension', min: 0, max: 0.45, step: 0.01, ends: ['none', '45 cm'], fmt: (v) => (v * 100).toFixed(0) + ' cm' },
    { key: 'bp', type: 'range', label: 'Wheel brace: your push', min: 50, max: 700, step: 10, ends: ['50 N', '700 N'], fmt: (v) => v + ' N' },
    { key: 'twr', type: 'toggle', label: 'Wheel brace: use a torque wrench', hint: 'Tightening to 110 N·m. It clicks when you get there.' },
    { key: 'kg', type: 'range', label: 'Forearm: load in the hand', min: 0, max: 12, step: 0.5, ends: ['0 kg', '12 kg'], fmt: (v) => v + ' kg' },
    { key: 'ang', type: 'range', label: 'Forearm: elbow angle', min: 30, max: 170, step: 1, ends: ['bent', 'straight'], fmt: (v) => v + '°' },
  ],
  onChange(s, key) {
    const map = { dia: 'steer', ps: 'steer', hd: 'screw', hb: 'crack', sq: 'crack', ext: 'brace', bp: 'brace', twr: 'brace', kg: 'arm', ang: 'arm' };
    if (map[key]) s.focus = map[key];
    if (key === 'ext' && s.ext > 0) s.twr = false;
  },
  quiz: [
    { q: 'You need 180 N·m to undo a wheel nut. With a 0.35 m brace you can only push 350 N. How long must the lever be?', options: ['About 0.35 m', 'About 0.51 m', 'About 1.8 m', 'About 3.5 m'], answer: 1, why: 'r = τ ÷ F = 180 ÷ 350 ≈ 0.51 m. A pipe about 16 cm long over the handle will do it.' },
    { q: 'Does a longer spanner make your push stronger?', options: ['Yes, it doubles your force', 'No: your force stays the same, but the torque grows because it acts further out', 'No, it makes the torque smaller', 'Only if the spanner is heavier'], answer: 1, why: 'Your hand pushes just as hard. What grows is the lever arm, and with it the torque on the nut.' },
    { q: 'The biceps pulls 4.5 cm from the elbow to hold 5 kg (about 49 N) 35 cm out. Roughly how hard does it pull?', options: ['About 49 N', 'About 100 N', 'About 380 N', 'About 4,900 N'], answer: 2, why: 'Moments: F × 0.045 = 49 × 0.35, so F ≈ 380 N (more with the forearm’s own weight). The arm trades force for speed and reach.' },
  ],
  reel: [
    { ms: 5600, caption: 'A pipe on a wheel brace doesn’t make you stronger. It moves your push further out, so the torque grows.', set: { focus: 'brace', bp: 350, twr: false, ext: 0 }, anim: { ext: [0, 0.3] }, view: { pos: [BX, 0.6, 1.3], target: [BX, 0.45, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gSt = new THREE.Group(), gSc = new THREE.Group(), gCr = new THREE.Group(), gBr = new THREE.Group(), gAr = new THREE.Group();
    gSc.position.x = SX; gCr.position.x = CX; gBr.position.x = BX; gAr.position.x = AX; root.add(gSt, gSc, gCr, gBr, gAr);
    const steel = M.metal(0x9aa3b2), dark = M.matte(0x22252c), skin = M.matte(0xc68b64), wood = M.matte(0xc8995a, { roughness: 0.7 });

    // ================================================================ steering wheel
    const wheelG = new THREE.Group(); wheelG.position.set(0, 1.0, 0); wheelG.rotation.x = -0.35; gSt.add(wheelG);
    const rimT = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.018, 12, 64), M.matte(0x1b1d22)); wheelG.add(rimT);
    let rimD = 37;
    const spin = new THREE.Group(); wheelG.add(spin);
    const hubS = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 24), M.matte(0x2b2f36)); hubS.rotation.x = Math.PI / 2; spin.add(hubS);
    const spokes = [0, 1, 2].map((i) => { const sp = stick(0.012, M.matte(0x2b2f36)); spin.add(sp); return [sp, (i * TAU) / 3 - Math.PI / 2]; });
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 16), dark); column.rotation.x = Math.PI / 2; column.position.z = -0.3; wheelG.add(column);
    const hands = [sphere(0.035, skin), sphere(0.035, skin)]; hands.forEach((h) => wheelG.add(h));
    const aH = [force(HEX.push, 0.008, 0.035), force(HEX.push, 0.008, 0.035)]; aH.forEach((a) => wheelG.add(a));
    const twS = twist(HEX.acc, 0.1, 0.006); twS.start = Math.PI * 0.3; twS.position.z = 0.05; wheelG.add(twS);
    const lHS = stage.label('', [0, 0, 0], gSt, 'hot'), lDia = stage.label('', [0, 0, 0], gSt);
    lHS.element.style.setProperty('--c', COL.push);

    // ================================================================ screwdriver into wood
    const block = box(0.1, 0.08, 0.08, M.matte(0xc8995a, { roughness: 0.7, transparent: true, opacity: 0.55, depthWrite: false })); block.position.set(0.11, 0.28, 0); gSc.add(block);
    const scr = new THREE.Group(); scr.position.set(0.06, 0.28, 0); gSc.add(scr);                  // the screw's axis is along x
    const scrShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.0015, 0.05, 12), steel); scrShaft.rotation.z = Math.PI / 2; scrShaft.position.x = 0.025; scr.add(scrShaft);
    const scrHead = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.004, 0.004, 20), steel); scrHead.rotation.z = Math.PI / 2; scr.add(scrHead);
    const drv = new THREE.Group(); drv.position.set(0.058, 0.28, 0); gSc.add(drv);
    const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.1, 12), steel); blade.rotation.z = Math.PI / 2; blade.position.x = -0.05; drv.add(blade);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.1, 32), M.plastic(0xd8332f, { roughness: 0.5 })); handle.rotation.z = Math.PI / 2; handle.position.x = -0.15; drv.add(handle);
    const ribs = new THREE.Mesh(new THREE.CylinderGeometry(1.03, 1.03, 0.08, 8, 1, true), M.plastic(0x7a1a18)); ribs.rotation.z = Math.PI / 2; ribs.position.x = -0.15; drv.add(ribs);
    const aSc = force(HEX.push, 0.003, 0.014); gSc.add(aSc);
    const twSc = twist(HEX.acc, 0.03, 0.002); twSc.rotation.y = -Math.PI / 2; twSc.position.set(-0.13, 0.28, 0); gSc.add(twSc);
    const lSc = stage.label('', [0, 0, 0], gSc, 'hot'), lHd = stage.label('', [0, 0, 0], gSc);
    lSc.element.style.setProperty('--c', COL.acc);

    // ================================================================ nutcracker (hinge at the left)
    const HIN = [-0.08, 0.3, 0];
    const armT = new THREE.Group(), armB = new THREE.Group(); armT.position.set(...HIN); armB.position.set(...HIN); gCr.add(armT, armB);
    const crM = M.metal(0xc9ced8, { roughness: 0.3 });
    for (const [a, sgn] of [[armT, 1], [armB, -1]]) { const bar = box(0.21, 0.008, 0.014, crM); bar.position.set(0.105, sgn * 0.004, 0); a.add(bar); const grip = box(0.08, 0.012, 0.018, M.matte(0x3a3f4b)); grip.position.set(0.17, sgn * 0.004, 0); a.add(grip); }
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 12), steel); pin.rotation.x = Math.PI / 2; pin.position.set(...HIN); gCr.add(pin);
    const shellM = M.matte(0xa9824f, { roughness: 0.9 });
    const halves = [0, 1].map((i) => { const h = new THREE.Mesh(new THREE.SphereGeometry(0.016, 20, 10, 0, TAU, i ? Math.PI / 2 : 0, Math.PI / 2), shellM); h.castShadow = true; gCr.add(h); return h; });
    const aSqT = force(HEX.push, 0.003, 0.014), aSqB = force(HEX.push, 0.003, 0.014), aNut = force(HEX.net, 0.003, 0.014); gCr.add(aSqT, aSqB, aNut);
    const lSq = stage.label('', [0, 0, 0], gCr, 'hot'), lNut = stage.label('', [0, 0, 0], gCr, 'hot'), lHinge = stage.label('hinge', [HIN[0] - 0.02, HIN[1] - 0.035, 0], gCr);
    lSq.element.style.setProperty('--c', COL.push); lNut.element.style.setProperty('--c', COL.net);

    // ================================================================ wheel brace on a rusty wheel nut
    const P = [0.15, 0.35, 0.06];
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.085, 16, 48), M.matte(0x16181d)); tyre.position.set(P[0], P[1], -0.06); tyre.castShadow = true; gBr.add(tyre);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 40), M.metal(0x7a6a58, { roughness: 0.7 })); rim.rotation.x = Math.PI / 2; rim.position.set(P[0], P[1], -0.04); gBr.add(rim);
    const nut = makeNut(0.05, 0x8a6a48); nut.position.set(...P); gBr.add(nut);
    const tool = new THREE.Group(); tool.position.set(P[0], P[1], P[2] + 0.04); gBr.add(tool);
    const braceG = new THREE.Group(); tool.add(braceG);
    const bRing = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.05, 6, 1, true), steel); bRing.rotation.x = Math.PI / 2; braceG.add(bRing);
    const bBar = box(BRACE, 0.024, 0.024, M.metal(0x2b2f36, { roughness: 0.4 })); bBar.position.x = -BRACE / 2; braceG.add(bBar);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 16, 1, true), M.metal(0x9aa3b2, { side: THREE.DoubleSide })); pipe.rotation.z = Math.PI / 2; braceG.add(pipe);
    const twrG = new THREE.Group(); tool.add(twrG);
    const twBar = box(TWL, 0.026, 0.02, M.metal(0xc9ced8, { roughness: 0.3 })); twBar.position.x = -TWL / 2; twrG.add(twBar);
    const twGrip = box(0.12, 0.034, 0.03, M.matte(0x1b1d22)); twGrip.position.x = -TWL + 0.06; twrG.add(twGrip);
    const twScale = box(0.08, 0.03, 0.022, M.glow(0xf2d24b)); twScale.position.x = -TWL + 0.17; twrG.add(twScale);
    const twHead = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 20), M.metal(0xc9ced8)); twHead.rotation.x = Math.PI / 2; twrG.add(twHead);
    const handB = sphere(0.035, skin); gBr.add(handB);
    const aB = force(HEX.push, 0.012, 0.05); gBr.add(aB);
    const twB = twist(HEX.acc, 0.1, 0.008); twB.start = Math.PI * 0.5; twB.position.set(P[0], P[1], 0.14); gBr.add(twB);
    const lB = stage.label('', [0, 0, 0], gBr, 'hot'), lBt = stage.label('', [0, 0, 0], gBr, 'hot'), lClick = stage.label('CLICK', [0, 0, 0], gBr, 'hot');
    lB.element.style.setProperty('--c', COL.push); lClick.element.style.setProperty('--c', COL.net);

    // ================================================================ forearm
    const E = [0, 1.1, 0];
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.26, 6, 12), skin); upper.position.set(0, 1.26, -0.02); upper.castShadow = true; gAr.add(upper);
    const shoulder = sphere(0.06, M.matte(0x3b6fd8)); shoulder.position.set(0, 1.45, -0.02); gAr.add(shoulder);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.08, 6, 12), M.matte(0x3b6fd8)); sleeve.position.set(0, 1.42, -0.02); gAr.add(sleeve);
    const fore = new THREE.Group(); fore.position.set(...E); gAr.add(fore);                      // forearm along the group's −y, turned about z
    const foreM = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.26, 6, 12), skin); foreM.position.y = -0.16; foreM.castShadow = true; fore.add(foreM);
    const handA = sphere(0.04, skin); handA.position.y = -0.35; fore.add(handA);
    const weight = new THREE.Group(); gAr.add(weight);
    const dbBar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 12), steel); dbBar.rotation.x = Math.PI / 2; weight.add(dbBar);
    const plates = [-0.08, 0.08].map((z) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.03, 24), M.matte(0x2b2f36)); p.rotation.x = Math.PI / 2; p.position.z = z; weight.add(p); return p; });
    const biceps = stick(0.02, M.matte(0xd8574a)); gAr.add(biceps);
    const elbowDot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 10), M.glow(0x5ce1a9)); elbowDot.position.set(E[0], E[1], 0.05); gAr.add(elbowDot);
    const aBi = force(HEX.net, 0.01, 0.04), aLoad = force(HEX.weight, 0.01, 0.04); gAr.add(aBi, aLoad);
    const lBi = stage.label('', [0, 0, 0], gAr, 'hot'), lLoad = stage.label('', [0, 0, 0], gAr), lElbow = stage.label('elbow: the pivot', [E[0] - 0.12, E[1] - 0.04, 0.06], gAr);
    lBi.element.style.setProperty('--c', COL.net);

    // ================================================================ board
    let cur = null;
    const bd = board(root, 1.6, 0.95, 900, 520, (g, w, h) => {
      panelBg(g, w, h); if (!cur) return;
      const { s } = cur;
      const plotF = (ttl, sub, xMin, xMax, xTicks, xFmt, xLabel, fn, xNow, fNow, yCap, extra) => {
        title(g, ttl, sub);
        let fMax = 0; const pts = []; for (let k = 0; k <= 60; k++) { const x = xMin + ((xMax - xMin) * k) / 60, f = fn(x); pts.push([x, f]); fMax = Math.max(fMax, f); }
        const yMax = niceMax(Math.min(yCap, fMax) * 1.05);
        const { X, Y } = axes(g, w, h, { x0: 100, y1: 100, xMin, xMax, yMax, xTicks, yTicks: [0, yMax / 2, yMax], xFmt, yFmt: (v) => fmtN(v), xLabel, yLabel: 'force you need ↑' });
        line(g, pts.map(([x, f]) => [x, Math.min(f, yMax)]), X, Y, COL.push, 5);
        extra?.(X, Y, yMax);
        dot(g, X(xNow), Y(Math.min(fNow, yMax)), COL.push, 10);
        g.fillStyle = '#fff'; g.font = 'bold 22px sans-serif'; const t = fmtN(fNow); g.fillText(t, Math.min(X(xNow) + 14, w - 40 - g.measureText(t).width), Math.max(120, Y(Math.min(fNow, yMax)) - 14));
      };
      if (s.focus === 'steer') plotF('Force on each hand', `τ = 2 F r, ${s.ps ? '4 N·m with power steering' : '30 N·m unassisted'}`, 28, 55, [30, 40, 50], (v) => v + ' cm', 'wheel diameter →', (d) => (s.ps ? 4 : 30) / (d / 100), s.dia, steer(s).F, 1e9);
      else if (s.focus === 'screw') plotF('Force to drive the screw', `3 N·m; your grip gives about ${GRIP} N`, 12, 50, [12, 25, 38, 50], (v) => v + ' mm', 'handle diameter →', (d) => NEED_SCREW / (d / 2000), s.hd, screw(s).Fneed, 800, (X, Y) => {
        g.strokeStyle = COL.net; g.lineWidth = 3; g.setLineDash([10, 6]); g.beginPath(); g.moveTo(X(12), Y(GRIP)); g.lineTo(X(50), Y(GRIP)); g.stroke(); g.setLineDash([]); g.fillStyle = COL.net; g.font = 'bold 17px sans-serif'; g.fillText('most your grip can give', X(30), Y(GRIP) - 8); });
      else if (s.focus === 'crack') plotF('Squeeze to crack a walnut', 'F × b = 200 N × 3 cm', 6, 20, [6, 10, 15, 20], (v) => v + ' cm', 'hand distance from the hinge →', (b) => (CRACK * NUT_A) / (b / 100), s.hb, crack(s).Fneed, 1e9);
      else if (s.focus === 'brace') {
        const need = s.twr ? SET : RUST;
        plotF(s.twr ? 'Push to reach 110 N·m' : 'Push to free a rusty nut', s.twr ? 'torque wrench, 45 cm' : `${RUST} N·m ÷ lever length`, 0.3, 0.85, [0.3, 0.45, 0.6, 0.75], (v) => Math.round(v * 100) + ' cm', 'lever length →', (L) => need / L, brace(s).L, brace(s).Fneed, 1e9, (X, Y) => {
          g.strokeStyle = COL.acc; g.lineWidth = 3; g.setLineDash([10, 6]); g.beginPath(); g.moveTo(X(0.3), Y(s.bp)); g.lineTo(X(0.85), Y(s.bp)); g.stroke(); g.setLineDash([]); g.fillStyle = COL.acc; g.font = 'bold 17px sans-serif'; g.fillText(`your push ${s.bp} N`, X(0.62), Y(s.bp) - 8); });
      } else plotF('Biceps pull', `load ${s.kg} kg in the hand, 35 cm from the elbow`, 30, 170, [30, 60, 90, 120, 150], (v) => v + '°', 'elbow angle →', (a) => arm({ ...s, ang: a }).F, s.ang, arm(s).F, 1e9);
    }, [0, 0, 0]);

    let focus = '', key = '', t = 0, braceA = 0, click = 0, crackK = 0;
    const place = () => {
      const p = { steer: [[0.55, 1.2, -0.3], -0.35, 0.42], screw: [[SX + 0.27, 0.4, -0.16], -0.4, 0.14], crack: [[CX + 0.25, 0.4, -0.15], -0.4, 0.14], brace: [[BX + 0.6, 0.72, -0.35], -0.4, 0.5], arm: [[AX + 0.62, 1.32, -0.35], -0.4, 0.36] }[focus];
      homeBoard(bd, ...p);
    };
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        const narrow = fitNarrow(stage, [lDia, lHd, lHinge, lElbow, lLoad]);
        if (s.focus !== focus) {
          focus = s.focus;
          gSt.visible = focus === 'steer'; gSc.visible = focus === 'screw'; gCr.visible = focus === 'crack'; gBr.visible = focus === 'brace'; gAr.visible = focus === 'arm';
          place(); braceA = 0; click = 0; crackK = 0;
          if (!inReel()) { const v = VIEWS[focus]; stage.setView(v.pos, v.target, 1.0); }
        }
        const rp = { steer: [[-0.02, 1.42, -0.2], 0.36], screw: [[SX + 0.02, 0.4, -0.1], 0.14], crack: [[CX + 0.04, 0.44, -0.1], 0.13], brace: [[BX - 0.05, 1.12, -0.3], 0.55], arm: [[AX + 0.02, 1.68, -0.2], 0.4] }[focus];
        reelBoards([[bd, rp[0], rp[1]]]);

        if (focus === 'steer') {
          const r = steer(s), R = r.r;
          if (s.dia !== rimD) { rimD = s.dia; rimT.geometry.dispose(); rimT.geometry = new THREE.TorusGeometry(R, 0.018, 12, 64); }
          const turn = 0.6 * Math.sin(t * 0.9); spin.rotation.z = turn;
          spokes.forEach(([sp, a]) => sp.between([0, 0, 0], [Math.cos(a) * R, Math.sin(a) * R, 0]));
          const dir = Math.sign(Math.cos(t * 0.9)) || 1;                            // which way the hands are turning it
          [[Math.PI, 0], [0, 1]].forEach(([a0, i]) => {
            const a = a0 + turn, p = [Math.cos(a) * R, Math.sin(a) * R, 0.02], tg = [-Math.sin(a) * dir, Math.cos(a) * dir, 0];
            hands[i].position.set(...p);
            const L = r.F * 0.0015;
            aH[i].aim([p[0] - tg[0] * (L + 0.04), p[1] - tg[1] * (L + 0.04), 0.04], tg, L);
          });
          twS.set(dir * 1.2 * Math.PI * clamp(r.tau / 30, 0.15, 1));
          lHS.position.set(-R - 0.08, 1.0 + 0.12, 0.05); lHS.element.innerHTML = `each hand <b>${fmtN(r.F)}</b>`;
          lDia.position.set(0, 1.0 - R * 0.95 - 0.08, 0.1); lDia.element.innerHTML = `${s.dia} cm wheel · needs ${r.tau} N·m`;
        }

        if (focus === 'screw') {
          const r = screw(s), R = s.hd / 2000;
          handle.scale.set(R, 1, R); ribs.scale.set(R, 1, R);
          if (r.ok) { const d = (t * 0.01) % 0.035; scr.position.x = 0.06 + d; drv.position.x = 0.058 + d; scr.rotation.x = -t * 4; drv.rotation.x = -t * 4; }
          else { scr.rotation.x = 0; drv.rotation.x = 0; }
          twSc.position.set(drv.position.x - 0.15 - 0.055, 0.28, 0); twSc.set(-1.4 * Math.PI * clamp(r.tmax / 5, 0.1, 1));
          const top = [drv.position.x - 0.15, 0.28 + R, 0];
          aSc.aim([top[0], top[1] + 0.005, 0.05], [0, 0, -1], 0.04);
          lSc.position.set(drv.position.x - 0.15, 0.28 + R + 0.04, 0); lSc.element.innerHTML = r.ok ? `grip gives <b>${fmtNm(r.tmax)}</b>: it drives` : `grip gives <b>${fmtNm(r.tmax)}</b>: slips`;
          lSc.element.style.setProperty('--c', r.ok ? COL.acc : COL.net);
          lHd.position.set(drv.position.x - 0.15, 0.28 - R - 0.03, 0.02); lHd.element.innerHTML = `handle ${s.hd} mm`;
        }

        if (focus === 'crack') {
          const r = crack(s);
          crackK = r.ok ? Math.min(1, crackK + dt * 2) : Math.max(0, crackK - dt * 2);
          const ang = Math.atan2(0.016 - 0.006 * crackK, NUT_A);                                 // arms rest on the nut, then close a little as it cracks
          armT.rotation.z = ang; armB.rotation.z = -ang;
          const cx = HIN[0] + NUT_A;
          halves[0].position.set(cx, HIN[1] + 0.004 * crackK, 0); halves[1].position.set(cx, HIN[1] - 0.004 * crackK, 0);
          halves[0].scale.set(1, 1 - 0.3 * crackK, 1); halves[1].scale.set(1, 1 - 0.3 * crackK, 1);
          const hx = HIN[0] + s.hb / 100, hy = Math.tan(ang) * (s.hb / 100);
          const L = s.sq * 0.0006;
          aSqT.aim([hx, HIN[1] + hy + 0.01 + L, 0.012], [0, -1, 0], L); aSqB.aim([hx, HIN[1] - hy - 0.01 - L, 0.012], [0, 1, 0], L);
          aNut.aim([cx, HIN[1] + 0.03 + Math.min(0.05, r.Fn * 0.0001), 0.02], [0, -1, 0], Math.min(0.05, r.Fn * 0.0001));
          lSq.position.set(hx, HIN[1] + hy + 0.03 + L, 0); lSq.element.innerHTML = `squeeze <b>${fmtN(s.sq)}</b>`;
          lNut.position.set(cx, HIN[1] + 0.1, 0); lNut.element.innerHTML = r.ok ? `nut feels <b>${fmtN(r.Fn)}</b>: crack!` : `nut feels <b>${fmtN(r.Fn)}</b>`;
        }

        if (focus === 'brace') {
          const r = brace(s);
          braceG.visible = !s.twr; twrG.visible = s.twr;
          pipe.visible = s.ext > 0.005; pipe.scale.y = Math.max(0.01, s.ext + 0.15); pipe.position.x = -(BRACE - 0.15) - (s.ext + 0.15) / 2;
          if (!s.twr) {
            if (r.ok) { braceA += dt * 0.9; if (braceA > 1.1) braceA = 0; } else braceA = Math.max(0, braceA - dt * 2);
            tool.rotation.z = braceA; nut.rotation.z = braceA; lClick.visible = false;
          } else {
            // Tightening: turn clockwise; the wrench clicks and flicks as it reaches its setting.
            if (r.ok) { click += dt; if (click > 1.2) click = 0; } else click = 0;
            tool.rotation.z = -Math.min(0.4, click * 0.6) + (click > 0.6 && click < 0.75 ? 0.05 : 0); nut.rotation.z = tool.rotation.z;
            lClick.visible = r.ok && click > 0.6; lClick.position.set(P[0] - 0.25, P[1] + 0.22, 0.1);
          }
          const a = tool.rotation.z, u = [-Math.cos(a), -Math.sin(a)];
          const H = [P[0] + u[0] * r.L, P[1] + u[1] * r.L, P[2] + 0.06];
          handB.position.set(...H);
          const dir = s.twr ? [u[1], -u[0]] : [-u[1], u[0]];                                  // push down to undo, lift up to tighten (handle on the left)
          const L = s.bp * 0.0007;
          aB.aim([H[0] - dir[0] * (L + 0.04), H[1] - dir[1] * (L + 0.04), H[2]], [dir[0], dir[1], 0], L);
          twB.set((s.twr ? -1 : 1) * 1.6 * Math.PI * clamp(r.tau / 250, 0.05, 1));
          lB.position.set(H[0] - dir[0] * (L + 0.08), H[1] - dir[1] * (L + 0.08) + 0.03, H[2]); lB.element.innerHTML = `push <b>${fmtN(s.bp)}</b> at ${Math.round(r.L * 100)} cm`;
          lBt.position.set(P[0] + 0.1, P[1] + 0.2, 0.1); lBt.element.innerHTML = `τ <b>${fmtNm(r.tau)}</b> ${s.twr ? (r.ok ? '≥ 110: done' : '< 110') : r.ok ? '> 180: it gives!' : '< 180: stuck'}`;
          lBt.element.style.setProperty('--c', r.ok ? COL.acc : COL.net);
        }

        if (focus === 'arm') {
          const r = arm(s), th = s.ang * D2R;
          fore.rotation.z = Math.PI - th;                                       // forearm along −y, turned so the elbow angle is θ (towards +x)
          const dirF = [Math.sin(th), Math.cos(th)];                           // from elbow towards the hand
          const hand = [E[0] + dirF[0] * 0.35, E[1] + dirF[1] * 0.35, 0];
          weight.position.set(hand[0], hand[1] - 0.02, 0); weight.visible = s.kg > 0;
          const pr = 0.03 + 0.012 * Math.cbrt(s.kg); plates.forEach((p) => p.scale.set(pr, 1, pr));
          const ins = [E[0] + dirF[0] * 0.045, E[1] + dirF[1] * 0.045, 0.03];
          biceps.between([0.035, 1.42, 0.03], ins);
          biceps.scale.x = biceps.scale.z = 1 + Math.min(1.2, r.F / 600);
          aBi.aim([ins[0] + 0.01, ins[1] + 0.02, 0.07], [0, 1, 0], Math.min(0.25, r.F * 0.0004));
          aLoad.aim([hand[0], hand[1] - 0.06, 0.12], [0, -1, 0], Math.max(0.02, s.kg * G * 0.0012)); aLoad.visible = s.kg > 0;
          lBi.position.set(ins[0] + 0.1, ins[1] + 0.2, 0.07); lBi.element.innerHTML = `biceps <b>${fmtN(r.F)}</b>`;
          lLoad.position.set(hand[0] + 0.06, hand[1] - 0.14, 0.1); lLoad.element.innerHTML = `${s.kg} kg = ${fmtN(s.kg * G)}, 35 cm out`;
        }

        cur = { s };
        const kk = `${focus}|${s.dia}|${s.ps}|${s.hd}|${s.hb}|${s.sq}|${s.ext}|${s.bp}|${s.twr}|${s.kg}|${s.ang}`;
        if (kk !== key) { key = kk; bd.redraw(); }
        void narrow;
      },
      readout: (s) => {
        if (s.focus === 'steer') {
          const r = steer(s);
          return `<div class="big">Each hand: ${fmtN(r.F)}</div>
            <div class="row"><span>Torque to turn the wheels (parked)</span><b>${r.tau} N·m${s.ps ? ' from you' : ''}</b></div>
            <div class="row"><span>Wheel radius r</span><b>${(r.r * 100).toFixed(1)} cm</b></div>
            <div class="row"><span>Two hands: τ = 2 F r</span><b>F = ${r.tau} ÷ ${(2 * r.r).toFixed(2)} m</b></div>
            <small>${s.ps ? 'The motor adds about 26 N·m.' : 'No assist: that’s why old buses had huge wheels.'}</small>`;
        }
        if (s.focus === 'screw') {
          const r = screw(s);
          return `<div class="big">Most torque: ${fmtNm(r.tmax)}</div>
            <div class="row"><span>Grip force at the surface</span><b>about ${GRIP} N</b></div>
            <div class="row"><span>Handle radius</span><b>${(s.hd / 2).toFixed(1)} mm</b></div>
            <div class="row"><span>Screw needs</span><b>${NEED_SCREW} N·m</b></div>
            ${r.ok ? '<div class="ok">It drives the screw.</div>' : `<div class="no">Your hand slips. It would need ${fmtN(r.Fneed)} of grip.</div>`}`;
        }
        if (s.focus === 'crack') {
          const r = crack(s);
          return `<div class="big">Nut feels ${fmtN(r.Fn)}</div>
            <div class="row"><span>Squeeze × hand distance</span><b>${s.sq} N × ${s.hb} cm</b></div>
            <div class="row"><span>Nut distance from hinge</span><b>3 cm</b></div>
            <div class="row"><span>Force multiplied by b ÷ a</span><b>× ${(s.hb / 3).toFixed(1)}</b></div>
            <div class="row"><span>Walnut cracks at</span><b>about 200 N</b></div>
            ${r.ok ? '<div class="ok">Crack!</div>' : `<div class="no">Squeeze ${fmtN(r.Fneed)} here to crack it.</div>`}`;
        }
        if (s.focus === 'brace') {
          const r = brace(s);
          return `<div class="big">τ = ${s.bp} N × ${Math.round(r.L * 100)} cm = ${fmtNm(r.tau)}</div>
            <div class="row"><span>${s.twr ? 'Torque wrench setting' : 'Rusty nut needs'}</span><b>${r.need} N·m</b></div>
            <div class="row"><span>Your push (it doesn’t change)</span><b>${fmtN(s.bp)}</b></div>
            <div class="row"><span>Push needed at this length</span><b>${fmtN(r.Fneed)}</b></div>
            ${s.twr ? (r.ok ? '<div class="ok">Click: tight enough, and not too tight.</div>' : '<div class="no">No click yet.</div>') : r.ok ? '<div class="ok">The nut gives.</div>' : '<div class="no">Still stuck. Add a pipe.</div>'}`;
        }
        const r = arm(s);
        return `<div class="big">Biceps pulls ${fmtN(r.F)}</div>
          <div class="row"><span>Load torque about the elbow</span><b>${fmtNm(r.tau)}</b></div>
          <div class="row"><span>Biceps lever arm</span><b>${(r.rb * 100).toFixed(1)} cm</b></div>
          <div class="row"><span>Load lever arm</span><b>${(35 * Math.sin(s.ang * D2R)).toFixed(1)} cm</b></div>
          ${s.kg > 0 ? `<div class="row"><span>Pull ÷ load</span><b>× ${r.ratio.toFixed(1)}</b></div>` : ''}
          <small>Includes the forearm’s own 1.4 kg.</small>`;
      },
    };
  },
};
