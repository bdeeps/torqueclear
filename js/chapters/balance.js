// Chapter 2: balance. An object stays still when the turning effects on it cancel: the principle of
// moments, Σ clockwise moments = Σ anticlockwise moments (Archimedes' law of the lever, m₁ d₁ = m₂ d₂).
//  - seesaw: two children on a 4.2 m plank, pivot in the middle 0.45 m up. Each child's weight m g acts
//    at its seat distance d. Net torque m₂ g d₂ − m₁ g d₁ decides which way it tips; the plank's own
//    weight acts at the pivot, so it adds no torque. The ends touch the ground at asin(0.45 ÷ 2.1) ≈ 12°.
//  - metre rule: the school moment balance, a 1 m rule on a knife edge at 50 cm with slotted 50 g masses
//    on thread loops. The same sliders as the seesaw, read as grams (× 10) and centimetres (× 25).
//  - topple: something stands while the vertical line through its centre of gravity (CG) stays inside
//    its base. Tipped past that, gravity's own torque about the edge turns it over.
//      cupboard: 0.5 m deep, 1.8 m tall, 40 kg empty (a typical steel almirah is 35–60 kg), CG 0.9 m;
//      things on the top shelf sit at 1.6 m. Pushed at the top (1.7 m), it starts to tip when
//      F × 1.7 > m g × 0.25. The critical tilt is atan(0.25 ÷ h_CG).
//      bus: a double-decker on a tilt table. UK and Hong Kong rules require a fully laden double-decker
//      (top deck loaded) to lean to 28° without tipping (tilt test). Track about 2.1 m, so each wheel
//      line is 1.05 m from the centre; CG height 1.35 m empty to 1.9 m with a full top deck (rough
//      figures for a rigid model with no suspension roll; real tests include the springs' lean).
//  - pole: a tightrope walker is an upside-down pendulum. Leaning by θ, gravity's torque m g h θ grows
//    the lean as e^(λt) with λ = √(Σ m g h ÷ I), I about the rope. Body: 65 kg, CG 1.0 m above the
//    rope, a 1.75 m rod about its end, I = m L² ÷ 3 ≈ 66 kg·m². Pole: Philippe Petit's pole was about
//    8 m and 25 kg (1974), so 3.1 kg/m. Held 1.1 m above the rope, it sags by about 0.5 m × (L ÷ 8)²
//    at the ends, lowering its CG by a third of the sag. I_pole = m (L² ÷ 12 + y²).
//    The time to go from a 2° lean to 20° is ln(10) ÷ λ: the pole buys time to correct.
import { THREE, M, box, clamp, approach } from '../kit.js';
import {
  G, D2R, board, panelBg, title, axes, dot, line, COL, HEX, force, stick, twist, makeKid, makePerson,
  fitNarrow, reelBoards, homeBoard, inReel, fmtN, fmtNm, niceMax,
} from '../torque.js';

const RX = 30, TX = 60, PX = 90, SW = 0.002, PIV = 0.45, HALF = 2.1;
const VIEWS = {
  seesaw: { pos: [0.3, 2.3, 5.8], target: [0.2, 1.15, 0] },
  rule: { pos: [RX + 0.15, 1.45, 1.9], target: [RX + 0.1, 0.92, 0] },
  topple: { pos: [TX + 1.2, 4.0, 15], target: [TX + 0.3, 3.0, 0] },
  cup: { pos: [TX + 0.2, 1.7, 4.3], target: [TX + 0.35, 1.3, 0] },
  pole: { pos: [PX - 0.5, 3.2, 6.2], target: [PX - 0.9, 3.3, 0] },
};
const viewOf = (s) => (s.focus === 'topple' ? (s.what === 'bus' ? VIEWS.topple : VIEWS.cup) : VIEWS[s.focus]);
const CUP = { b: 0.5, H: 1.8, m: 40, h: 0.9, top: 1.6, push: 1.7 };
const BUS = { b: 2.1, H: 4.3, m: 18000 };
const WALK = { m: 65, h: 1.0, I: (65 * 1.75 * 1.75) / 3, hands: 1.1, kgPerM: 25 / 8 };

// Moments on the seesaw (kg, m) or the metre rule (g, cm), in N·m. + means the right side wins.
export function moments(s) {
  const k = s.focus === 'rule' ? 0.01 * 0.25 : 1;          // rule: ×10 g = ×0.01 kg, ×25 cm = ×0.25 m
  const L = s.m1 * s.d1 * G * k, R = s.m2 * s.d2 * G * k;
  return { L, R, net: R - L };
}
export function cupboard(s) {
  const m = CUP.m + s.load, h = (CUP.m * CUP.h + s.load * CUP.top) / m;
  return { m, h, crit: Math.atan(CUP.b / 2 / h), Fneed: (m * G * CUP.b) / 2 / CUP.push };
}
export function bus(s) { const h = 1.35 + 0.55 * s.high; return { h, crit: Math.atan(BUS.b / 2 / h) }; }
export function walker(L) {
  const mp = WALK.kgPerM * L, sag = 0.5 * (L / 8) ** 2, y = WALK.hands - sag / 3;
  const I = WALK.I + mp * (L * L / 12 + y * y), K = WALK.m * G * WALK.h + mp * G * y;
  const lam = Math.sqrt(K / I);
  return { mp, sag, y, I, lam, t: Math.log(10) / lam };
}

export default {
  id: 'balance',
  short: 'Balance',
  title: 'Balancing turning effects',
  subtitle: 'Seesaws, a school moment balance, a toppling cupboard, a tilted bus and a tightrope walker.',
  view: VIEWS.seesaw,
  learn: `<p>When two torques twist in opposite directions, they can <b>cancel</b>. Then nothing turns: the object is <b>balanced</b>. This is the <b>principle of moments</b>: for balance, the clockwise moments equal the anticlockwise moments.</p>
    <p>On a <b>seesaw</b>, each child’s weight pulls down at their seat. A heavy child near the middle can balance a light child far out: <b>m₁ × d₁ = m₂ × d₂</b>. A 40 kg child 1.5 m from the pivot balances a 30 kg child 2 m out. Archimedes wrote this down about 2,250 years ago. The <b>metre rule</b> balance in your school lab is the same thing with grams and centimetres.</p>
    <p>Gravity pulls on every bit of an object, but it acts as if all the weight sits at one point, the <b>centre of gravity</b> (CG). An object stands as long as the line straight down from its CG falls <b>inside its base</b>. Tip it past that and its own weight makes a torque that turns it over. Heavy things on a cupboard’s top shelf raise its CG, so it topples at a smaller tilt. Double-decker buses are tilted to <b>28°</b> in a test to prove they won’t roll over.</p>
    <p>A <b>tightrope walker</b> is balancing on a line, so any lean grows. A long pole spreads mass far from the rope, which raises the <b>moment of inertia</b>: the same gravity torque turns the walker more slowly, and that buys time to correct (see InertiaClear).</p>
    <p class="tip"><b>Try it:</b> put a heavy child near the middle and slide the light one out until the plank levels. Then tilt the bus and fill the top deck. On the tightrope, lengthen the pole and watch the fall slow down.</p>`,
  terms: [
    { t: 'Principle of moments', d: 'For balance, the clockwise moments about a pivot equal the anticlockwise moments.' },
    { t: 'Law of the lever', d: 'Weights balance when weight × distance from the pivot is the same on both sides.' },
    { t: 'Centre of gravity (CG)', d: 'The point where an object’s whole weight seems to act.' },
    { t: 'Stable', d: 'Tipped a little, it falls back, because the line down from its CG still lands inside its base.' },
    { t: 'Toppling', d: 'Once the CG passes outside the base, gravity’s torque turns the object over.' },
    { t: 'Tilt test', d: 'A bus is tilted on a platform to check it won’t roll over. Double-deckers must reach 28° fully laden.' },
  ],
  defaults: { focus: 'seesaw', m1: 40, d1: 1.5, m2: 30, d2: 1.2, what: 'bus', tilt: 0, high: 1, push: 0, load: 0, L: 8 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'seesaw', label: 'Seesaw' }, { v: 'rule', label: 'Metre rule' }, { v: 'topple', label: 'Toppling' }, { v: 'pole', label: 'Tightrope' }] },
    { key: 'm1', type: 'range', label: 'Left: mass', min: 15, max: 60, step: 1, fmt: (v, s) => (s.focus === 'rule' ? v * 10 + ' g' : v + ' kg') },
    { key: 'd1', type: 'range', label: 'Left: distance from the pivot', min: 0.2, max: 2, step: 0.1, fmt: (v, s) => (s.focus === 'rule' ? (v * 25).toFixed(1) + ' cm' : v.toFixed(1) + ' m') },
    { key: 'm2', type: 'range', label: 'Right: mass', min: 15, max: 60, step: 1, fmt: (v, s) => (s.focus === 'rule' ? v * 10 + ' g' : v + ' kg') },
    { key: 'd2', type: 'range', label: 'Right: distance from the pivot', min: 0.2, max: 2, step: 0.1, fmt: (v, s) => (s.focus === 'rule' ? (v * 25).toFixed(1) + ' cm' : v.toFixed(1) + ' m') },
    { key: 'what', type: 'seg', label: 'Toppling: what', options: [{ v: 'cup', label: 'Cupboard' }, { v: 'bus', label: 'Double-decker bus' }] },
    { key: 'push', type: 'range', label: 'Cupboard: push at the top', min: 0, max: 120, step: 1, ends: ['0 N', '120 N'], fmt: (v) => v + ' N' },
    { key: 'load', type: 'range', label: 'Cupboard: things on the top shelf', min: 0, max: 40, step: 1, ends: ['empty', '40 kg'], fmt: (v) => v + ' kg' },
    { key: 'tilt', type: 'range', label: 'Bus: tilt table', min: 0, max: 45, step: 0.5, ends: ['flat', '45°'], fmt: (v) => v + '°' },
    { key: 'high', type: 'range', label: 'Bus: passengers upstairs', min: 0, max: 1, step: 0.05, ends: ['empty', 'top deck full'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'L', type: 'range', label: 'Tightrope: pole length', min: 0, max: 10, step: 0.5, ends: ['no pole', '10 m'], fmt: (v) => (v ? v + ' m, ' + Math.round(v * WALK.kgPerM) + ' kg' : 'no pole') },
    { key: 'go', type: 'buttons', label: 'Try these', items: [
      { label: '40 kg at 1.5 m vs 30 kg at 2 m', act: (s) => Object.assign(s, { focus: 'seesaw', m1: 40, d1: 1.5, m2: 30, d2: 2 }) },
      { label: '400 g vs 300 g on the rule', act: (s) => Object.assign(s, { focus: 'rule', m1: 40, d1: 1.5, m2: 30, d2: 2 }) },
      { label: 'Bus tilt test, 28°', act: (s) => Object.assign(s, { focus: 'topple', what: 'bus', tilt: 28, high: 1 }) },
      { label: 'Petit’s 8 m pole', act: (s) => Object.assign(s, { focus: 'pole', L: 8 }) },
    ] },
  ],
  onChange(s, key) {
    if (['m1', 'd1', 'm2', 'd2'].includes(key) && !['seesaw', 'rule'].includes(s.focus)) s.focus = 'seesaw';
    if (['what', 'tilt', 'high', 'push', 'load'].includes(key)) s.focus = 'topple';
    if (['tilt', 'high'].includes(key)) s.what = 'bus';
    if (['push', 'load'].includes(key)) s.what = 'cup';
    if (key === 'L') s.focus = 'pole';
  },
  quiz: [
    { q: 'A 50 kg adult sits 1 m from a seesaw’s pivot. Where must a 25 kg child sit to balance?', options: ['0.5 m out', '1 m out', '2 m out', '25 m out'], answer: 2, why: 'Moments must match: 50 × 1 = 25 × d, so d = 2 m. Half the weight needs twice the distance.' },
    { q: 'Why is a cupboard with heavy things on its top shelf more dangerous?', options: ['It weighs less', 'Its centre of gravity is higher, so a smaller tilt takes it outside the base', 'The shelves bend', 'Its base gets smaller'], answer: 1, why: 'A higher CG means the line straight down from it leaves the base at a smaller tilt, and then its weight turns it over.' },
    { q: 'How does a long pole help a tightrope walker?', options: ['It makes them lighter', 'It adds moment of inertia, so a lean grows more slowly and they have time to correct', 'It pushes on the air', 'It holds them up like a crutch'], answer: 1, why: 'The pole’s mass sits far from the rope, so it is hard to set turning. Gravity’s tipping torque turns the walker more slowly.' },
  ],
  reel: [
    { ms: 5400, caption: 'A seesaw balances when the moments match: 40 kg at 1.5 m equals 30 kg at 2 m.', set: { focus: 'seesaw', m1: 40, d1: 1.5, m2: 30, d2: 0.8 }, anim: { d2: [0.8, 2.0] }, view: { pos: [0.1, 2.2, 4.4], target: [0, 1.0, 0] }, spin: 0 },
    { ms: 5600, caption: 'Tilt a full double-decker past about 29° and its centre of gravity leaves the wheels: over it goes.', set: { focus: 'topple', what: 'bus', high: 1, tilt: 0 }, anim: { tilt: [0, 33] }, view: { pos: [TX + 1.6, 5.2, 11.5], target: [TX + 0.5, 3.0, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gS = new THREE.Group(), gR = new THREE.Group(), gT = new THREE.Group(), gP = new THREE.Group();
    gR.position.x = RX; gT.position.x = TX; gP.position.x = PX; root.add(gS, gR, gT, gP);
    const wood = M.matte(0xc8995a, { roughness: 0.7 }), steel = M.metal(0x9aa3b2), dark = M.matte(0x3a3f4b);
    const thread = M.matte(0xe8e2c8);

    // ================================================================ seesaw
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.32, PIV, 3), M.plastic(0xd8332f)); base.rotation.y = Math.PI / 6; base.position.y = PIV / 2; gS.add(base);
    const plank = new THREE.Group(); plank.position.y = PIV; gS.add(plank);
    const pb = box(HALF * 2, 0.06, 0.34, M.plastic(0xf2c230)); pb.position.y = 0.03; plank.add(pb);
    for (const x of [-HALF + 0.12, HALF - 0.12]) { const h = box(0.04, 0.22, 0.3, steel); h.position.set(x, 0.14, 0); plank.add(h); }
    const kids = [makeKid({ shirt: 0x3b6fd8 }), makeKid({ shirt: 0xd8332f, pants: 0x3a3f4b, hair: 0x3a2414 })];
    kids[0].rotation.y = Math.PI / 2; kids[1].rotation.y = -Math.PI / 2; kids.forEach((k) => plank.add(k));
    const aW = [force(HEX.weight, 0.03, 0.14), force(HEX.weight, 0.03, 0.14)]; aW.forEach((a) => gS.add(a));
    const twL = twist(HEX.pull, 0.32, 0.018), twR = twist(HEX.push, 0.42, 0.018);
    twL.start = Math.PI / 2 + 0.2; twR.start = Math.PI / 2 - 0.2; twL.position.set(0, PIV, 0.3); twR.position.set(0, PIV, 0.3); gS.add(twL, twR);
    const lK = [stage.label('', [0, 0, 0], gS, 'hot'), stage.label('', [0, 0, 0], gS, 'hot')], lPiv = stage.label('pivot', [0, 0.1, 0.5], gS);
    lK[0].element.style.setProperty('--c', COL.pull); lK[1].element.style.setProperty('--c', COL.push);

    // ================================================================ metre rule on a knife edge
    const stand = box(0.3, 0.02, 0.2, dark); stand.position.set(0, 0.01, 0); gR.add(stand);
    const post = box(0.025, 0.6, 0.025, steel); post.position.set(0, 0.31, -0.05); gR.add(post);
    const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.02, 0.03, 3), steel); edge.position.set(0, 0.6, -0.01); gR.add(edge);
    const rule = new THREE.Group(); rule.position.y = 0.62; gR.add(rule);
    const rc = document.createElement('canvas'); rc.width = 2048; rc.height = 64;
    { const x = rc.getContext('2d'); x.fillStyle = '#f2e6c4'; x.fillRect(0, 0, 2048, 64); x.fillStyle = '#222'; x.strokeStyle = '#222'; x.font = 'bold 22px sans-serif';
      for (let c = 0; c <= 100; c++) { const px = (c / 100) * 2048; x.lineWidth = c % 10 === 0 ? 3 : 1.2; x.beginPath(); x.moveTo(px, 0); x.lineTo(px, c % 10 === 0 ? 30 : c % 5 === 0 ? 20 : 12); x.stroke(); if (c % 10 === 0 && c > 0 && c < 100) x.fillText(String(c), px - 12, 56); } }
    const rt = new THREE.CanvasTexture(rc); rt.colorSpace = THREE.SRGBColorSpace; rt.anisotropy = 4;
    const rb = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.03, 0.006), [M.matte(0xd8c8a0), M.matte(0xd8c8a0), M.matte(0xd8c8a0), M.matte(0xd8c8a0), new THREE.MeshBasicMaterial({ map: rt, toneMapped: false }), M.matte(0xd8c8a0)]);
    rb.position.y = 0.015; rule.add(rb);
    const hangers = [0, 1].map(() => {
      const g = new THREE.Group(); gR.add(g);
      const th = stick(0.0015, thread); g.add(th);
      const hook = box(0.004, 0.03, 0.004, steel); g.add(hook);
      const discs = Array.from({ length: 12 }, (_, i) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.008, 20), M.metal(i % 2 ? 0xb08d57 : 0xc9a46a, { roughness: 0.4 })); g.add(d); return d; });
      return { g, th, hook, discs };
    });
    const lRu = [stage.label('', [0, 0, 0], gR, 'hot'), stage.label('', [0, 0, 0], gR, 'hot')];
    lRu[0].element.style.setProperty('--c', COL.pull); lRu[1].element.style.setProperty('--c', COL.push);

    // ================================================================ toppling: cupboard and bus on a tilt table
    const table = new THREE.Group(); table.position.set(-1.6, 0.3, 0); gT.add(table);        // hinge at the table's left end
    const deck = box(4.4, 0.12, 10.6, M.matte(0x5b6270)); deck.position.set(2.2, -0.06, 0); table.add(deck);
    const legT = box(0.3, 0.3, 10.2, dark); legT.position.set(-1.6, 0.15, 0); gT.add(legT);
    const jack = stick(0.06, M.metal(0x6b7280)); gT.add(jack);
    // The body pivots about its downhill (right) edge E. Local frame: origin at E, body to −x and up.
    const E = new THREE.Group(); table.add(E);
    const tipper = new THREE.Group(); E.add(tipper);
    const busG = new THREE.Group(), cupG = new THREE.Group(); tipper.add(busG, cupG);
    const red = M.plastic(0xd8332f, { roughness: 0.4 }), glassM = M.plastic(0x1a2230, { roughness: 0.1, metalness: 0.3 });
    { // double-decker, seen from the back: 2.5 m wide, 4.3 m tall, 10 m long
      const bx = -BUS.b / 2;
      const body = box(2.5, 4.0, 10, red); body.position.set(bx, 0.3 + 2.0, 0); busG.add(body);
      for (const y of [1.6, 3.35]) { const w = box(2.52, 0.8, 9.2, glassM); w.position.set(bx, y, 0); busG.add(w); }
      const band = box(2.54, 0.12, 10.02, M.plastic(0xf2e6c4)); band.position.set(bx, 2.62, 0); busG.add(band);
      for (const x of [-1.05, 1.05]) for (const z of [-3.2, 3.2]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.32, 24), M.matte(0x16181d)); t.rotation.z = Math.PI / 2; t.position.set(bx + x * 0.92, 0.5, z); busG.add(t); }
    }
    { // steel cupboard (almirah), side on: 0.5 m deep, 1.8 m tall, 0.9 m wide
      const body = box(CUP.b, CUP.H, 0.9, M.metal(0x7a8fa8, { roughness: 0.5, metalness: 0.4 })); body.position.set(-CUP.b / 2, CUP.H / 2, 0); cupG.add(body);
      const door = box(0.01, CUP.H - 0.1, 0.86, M.metal(0x8ea3bc, { roughness: 0.45, metalness: 0.4 })); door.position.set(0.005, CUP.H / 2, 0); cupG.add(door);
      const handleC = box(0.03, 0.2, 0.03, steel); handleC.position.set(0.03, 1.0, 0.3); cupG.add(handleC);
    }
    const loadBox = box(0.4, 0.25, 0.7, M.matte(0xa97a42)); cupG.add(loadBox);
    const cg = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 12), M.glow(0xffffff)); tipper.add(cg);
    const cgRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 24), M.glow(0x22252c)); cg.add(cgRing);
    const plumb = stick(0.012, M.glow(0xc49bff)); gT.add(plumb);
    const edgeMark = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 10.6, 12), M.glow(0x5ce1a9)); edgeMark.rotation.x = Math.PI / 2; E.add(edgeMark);
    const aPush = force(HEX.push, 0.03, 0.14); gT.add(aPush);
    const lCG = stage.label('', [0, 0, 0], gT, 'hot'), lEdge = stage.label('tipping edge', [0, 0, 0], gT), lTip = stage.label('', [0, 0, 0], gT, 'hot'), lPushT = stage.label('', [0, 0, 0], gT, 'hot');
    lCG.element.style.setProperty('--c', COL.weight); lPushT.element.style.setProperty('--c', COL.push);

    // ================================================================ tightrope
    const RY = 2.0;
    for (const z of [-6, 14]) { const p = box(0.12, RY + 0.3, 0.12, dark); p.position.set(0, (RY + 0.3) / 2, z); gP.add(p); }
    const rope = stick(0.012, M.matte(0xe8e2c8)); rope.between([0, RY, -6], [0, RY, 14]); gP.add(rope);
    const leanG = new THREE.Group(); leanG.position.set(0, RY, 0); gP.add(leanG);
    const walkerM = makePerson({ shirt: 0xf2f2f2, pants: 0x1b1d22, s: 0.97 }); walkerM.rotation.y = -Math.PI / 2; leanG.add(walkerM);
    walkerM.arms.forEach((a, i) => { a.rotation.set((i ? -1 : 1) * 0.55, 0, 1.0); });
    let poleMesh = null, poleL = -1;
    const poleMat = M.matte(0xd8c28a);
    const buildPole = (L) => {
      if (poleMesh) { leanG.remove(poleMesh); poleMesh.geometry.dispose(); poleMesh = null; }
      poleL = L; if (L <= 0) return;
      const sag = 0.5 * (L / 8) ** 2, pts = [];
      for (let i = 0; i <= 24; i++) { const x = -L / 2 + (L * i) / 24, u = (2 * x) / L; pts.push(new THREE.Vector3(x, WALK.hands - sag * u * u, 0.32)); }
      poleMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.025, 8), poleMat); poleMesh.castShadow = true; leanG.add(poleMesh);
    };
    const aG = force(HEX.weight, 0.03, 0.14); gP.add(aG);
    const lLean = stage.label('', [0, 0, 0], gP, 'hot'), lPole = stage.label('', [0, 0, 0], gP);
    lLean.element.style.setProperty('--c', COL.net);

    // ================================================================ one board, drawn for each set-up
    let cur = null;
    const bd = board(root, 2.4, 1.3, 900, 500, (g, w, h) => {
      panelBg(g, w, h); if (!cur) return;
      const { s } = cur;
      if (s.focus === 'seesaw' || s.focus === 'rule') {
        const m = moments(s), rule = s.focus === 'rule';
        title(g, 'Moments about the pivot', rule ? 'weight × distance, N·m' : 'm g × d, N·m');
        const mx = niceMax(Math.max(m.L, m.R) * 1.1);
        const bars = [[`anticlockwise (left): ${fmtNm(m.L)}`, m.L, COL.pull], [`clockwise (right): ${fmtNm(m.R)}`, m.R, COL.push]];
        bars.forEach(([t, v, c], i) => { const y = 110 + i * 120; g.fillStyle = c; g.font = 'bold 22px sans-serif'; g.fillText(t, 40, y); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(40, y + 16, w - 80, 48); g.fillStyle = c; g.fillRect(40, y + 16, (w - 80) * (v / mx), 48); });
        const bal = Math.abs(m.net) < 0.02 * Math.max(m.L, m.R);
        g.font = 'bold 30px sans-serif'; g.fillStyle = bal ? COL.acc : COL.net;
        g.fillText(bal ? 'Balanced: the moments match' : m.net > 0 ? 'The right side wins: it tips clockwise' : 'The left side wins: it tips anticlockwise', 40, 400);
        g.font = '19px sans-serif'; g.fillStyle = 'rgba(255,255,255,.7)';
        g.fillText(rule ? `${s.m1 * 10} g × ${(s.d1 * 25).toFixed(1)} cm  vs  ${s.m2 * 10} g × ${(s.d2 * 25).toFixed(1)} cm` : `${s.m1} kg × ${s.d1.toFixed(1)} m  vs  ${s.m2} kg × ${s.d2.toFixed(1)} m`, 40, 446);
      } else if (s.focus === 'topple') {
        const isBus = s.what === 'bus';
        title(g, 'How far it can tilt', 'critical angle = atan(half the base ÷ CG height)');
        const half = isBus ? BUS.b / 2 : CUP.b / 2, h0 = isBus ? 1.0 : 0.6, h1 = isBus ? 2.4 : 1.4;
        const { X, Y } = axes(g, w, h, { x0: 90, y1: 90, xMin: h0, xMax: h1, yMax: 50, xTicks: isBus ? [1, 1.5, 2, 2.5].filter((v) => v <= h1) : [0.6, 0.8, 1, 1.2, 1.4], yTicks: [0, 10, 20, 30, 40, 50], xFmt: (v) => v.toFixed(1) + ' m', yFmt: (v) => v + '°', xLabel: 'height of the CG →', yLabel: 'tilt before it tips ↑' });
        const pts = []; for (let k = 0; k <= 40; k++) { const hh = h0 + ((h1 - h0) * k) / 40; pts.push([hh, Math.atan(half / hh) / D2R]); }
        line(g, pts, X, Y, COL.weight, 5);
        if (isBus) { g.strokeStyle = COL.net; g.lineWidth = 3; g.setLineDash([10, 6]); g.beginPath(); g.moveTo(X(h0), Y(28)); g.lineTo(X(h1), Y(28)); g.stroke(); g.setLineDash([]); g.fillStyle = COL.net; g.font = 'bold 18px sans-serif'; g.fillText('tilt test: must reach 28°', X(h0) + 10, Y(28) - 10); }
        const r = isBus ? bus(s) : cupboard(s);
        dot(g, X(r.h), Y(r.crit / D2R), COL.weight, 11);
        g.fillStyle = '#fff'; g.font = 'bold 24px sans-serif'; g.fillText(`${(r.crit / D2R).toFixed(1)}° at CG ${r.h.toFixed(2)} m`, X(r.h) + 16, Y(r.crit / D2R) - 12);
      } else {
        title(g, 'Time to fall from 2° to 20°', 'a longer pole buys time');
        const { X, Y } = axes(g, w, h, { x0: 90, y1: 90, xMax: 10, yMax: 2, xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 0.5, 1, 1.5, 2], xFmt: (v) => v + ' m', yFmt: (v) => v + ' s', xLabel: 'pole length →', yLabel: 'seconds ↑' });
        const pts = []; for (let L = 0; L <= 10.001; L += 0.25) pts.push([L, walker(L).t]);
        line(g, pts, X, Y, COL.acc, 5);
        const r = walker(s.L); dot(g, X(s.L), Y(r.t), COL.acc, 11);
        g.fillStyle = '#fff'; g.font = 'bold 24px sans-serif'; g.fillText(`${r.t.toFixed(2)} s`, X(s.L) + (s.L > 7 ? -110 : 16), Y(r.t) - 16);
      }
    }, [0, 0, 0]);

    let focus = '', what = '', key = '', tilt = 0, tip = 0, tipW = 0, tipHold = 0, lean = 2 * D2R, leanSign = 1, leanHold = 0;
    const place = (s) => {
      const p = { seesaw: [[2.7, 2.3, -1.6], -0.35, 0.9], rule: [[RX + 0.8, 1.05, -0.4], -0.35, 0.36], topple: s.what === 'bus' ? [[TX + 4.9, 4.2, -2.5], -0.3, 1.5] : [[TX + 2.1, 1.6, -1.4], -0.3, 0.75], pole: [[PX + 2.4, 3.8, -2.4], -0.3, 1.3] }[s.focus];
      homeBoard(bd, ...p);
    };
    return {
      update(dt, s) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, [lPiv, lEdge, lPole]);
        if (s.focus !== focus || s.what !== what) {
          focus = s.focus; what = s.what; tip = 0; tipW = 0; tipHold = 0;
          gS.visible = focus === 'seesaw'; gR.visible = focus === 'rule'; gT.visible = focus === 'topple'; gP.visible = focus === 'pole';
          busG.visible = what === 'bus'; cupG.visible = what === 'cup';
          place(s);
          if (!inReel()) { const v = viewOf(s); stage.setView(v.pos, v.target, 1.0); }
        }
        const reelPos = { seesaw: [[0.1, 3.2, -1], 1.3], rule: [[RX + 0.1, 1.28, -0.3], 0.34], topple: s.what === 'bus' ? [[TX + 0.6, 7.6, -2], 2.4] : [[TX + 0.5, 3.1, -1], 1.0], pole: [[PX + 0.3, 5.6, -1.5], 1.6] }[focus];
        reelBoards([[bd, reelPos[0], reelPos[1]]]);

        if (focus === 'seesaw' || focus === 'rule') {
          const m = moments(s);
          if (focus === 'seesaw') {
            const maxT = Math.asin(PIV / HALF), target = -maxT * Math.tanh(m.net / 25);
            plank.rotation.z = approach(plank.rotation.z, target, 3, dt);
            const a = plank.rotation.z, c = Math.cos(a), sn = Math.sin(a);
            [[kids[0], -s.d1, s.m1], [kids[1], s.d2, s.m2]].forEach(([k, x, mm], i) => {
              const sc = Math.cbrt(mm / 35); k.scale.setScalar(sc); k.position.set(x, 0.06 + 0.16 * sc, 0);
              const wx = x * c, wy = PIV + x * sn;
              aW[i].aim([wx, wy - 0.05, 0.3], [0, -1, 0], mm * G * SW);
              lK[i].position.set(wx + (i ? 0.15 : -0.15), wy + 1.1 * sc, 0.2);
              lK[i].element.innerHTML = `${mm} kg × ${Math.abs(x).toFixed(1)} m = <b>${fmtNm(i ? m.R : m.L)}</b>`;
            });
            const mx = Math.max(m.L, m.R, 1);
            twL.set((m.L / 1500) * 1.4 * Math.PI); twR.set(-(m.R / 1500) * 1.4 * Math.PI);
            void mx;
          } else {
            const target = -10 * D2R * Math.tanh(m.net / 0.12);
            rule.rotation.z = approach(rule.rotation.z, target, 3, dt);
            const a = rule.rotation.z, c = Math.cos(a), sn = Math.sin(a);
            [[-s.d1 * 0.25, s.m1], [s.d2 * 0.25, s.m2]].forEach(([x, mm], i) => {
              const hh = hangers[i], top = [x * c, 0.62 + x * sn, 0.01], n = Math.round((mm * 10) / 50), bot = top[1] - 0.12;
              hh.th.between(top, [top[0], bot, 0.01]);
              hh.hook.position.set(top[0], bot - 0.015, 0.01);
              hh.discs.forEach((d, j) => { d.visible = j < n; d.position.set(top[0], bot - 0.034 - j * 0.0085, 0.01); });
              lRu[i].position.set(top[0], bot - 0.06 - n * 0.0085, 0.05);
              lRu[i].element.innerHTML = `${mm * 10} g × ${(Math.abs(x) * 100).toFixed(1)} cm`;
            });
          }
        }

        if (focus === 'topple') {
          const isBus = what === 'bus';
          const b = isBus ? BUS.b : CUP.b, Hh = isBus ? BUS.H : CUP.H;
          const r = isBus ? bus(s) : cupboard(s);
          tilt = approach(tilt, isBus ? s.tilt * D2R : 0, 3, dt);
          table.rotation.z = -tilt;                                        // the right end goes down
          const Ex = isBus ? 3.3 : 2.6; E.position.set(Ex, 0, 0);
          jack.between([Ex + 0.6, 0, 0.9], [-1.6 + (Ex + 0.6) * Math.cos(tilt), 0.3 - (Ex + 0.6) * Math.sin(tilt), 0.9]); jack.visible = isBus && tilt > 0.01;
          deck.scale.set(isBus ? 1 : 0.41, 1, isBus ? 1 : 0.14); deck.position.x = isBus ? 2.2 : 2.5; legT.visible = isBus; legT.scale.z = deck.scale.z; edgeMark.scale.y = isBus ? 1 : 0.1;
          if (!isBus) { loadBox.visible = s.load > 0; loadBox.scale.y = Math.max(0.2, s.load / 20); loadBox.position.set(-b / 2, CUP.top, 0); }
          cg.position.set(-b / 2, r.h, 0);
          // Torque about the edge: gravity (clockwise when the CG is beyond the edge) plus the push.
          const A = tilt + tip, xoff = -(b / 2) * Math.cos(A) + r.h * Math.sin(A);
          const mass = isBus ? BUS.m : r.m, I = (mass * (b * b + Hh * Hh)) / 3;
          const push = isBus ? 0 : s.push, net = mass * G * xoff + push * CUP.push * Math.cos(A);
          if (tipHold > 0) { tipHold -= dt; if (tipHold <= 0) { tip = 0; tipW = 0; } }
          else if (net > 0 || tip > 1e-4) {
            tipW += (net / I) * dt; tip += tipW * dt;
            if (tip <= 0) { tip = 0; tipW = 0; }
            const stop = (isBus ? 50 : 80) * D2R;
            if (tip >= stop) { tip = stop; tipW = 0; tipHold = 1.6; }
          }
          tipper.rotation.z = -tip;
          const cw = new THREE.Vector3(); cg.getWorldPosition(cw); gT.worldToLocal(cw);
          const ew = new THREE.Vector3(); E.getWorldPosition(ew); gT.worldToLocal(ew);
          plumb.between([cw.x, cw.y, cw.z + 0.2], [cw.x, Math.min(ew.y, cw.y) - 0.1, cw.z + 0.2]);
          const out = cw.x > ew.x + 1e-3;
          plumb.material.color.set(out ? 0xff5a8a : 0xc49bff);
          lCG.position.set(cw.x - 0.3, cw.y + (isBus ? 0.5 : 0.25), cw.z + 0.3); lCG.element.innerHTML = `CG ${r.h.toFixed(2)} m up`;
          lEdge.position.set(ew.x + 0.35, ew.y - 0.15, 1.6);
          lTip.position.set(isBus ? 0.4 : Ex - 1.6 + 0.3, isBus ? 6.2 : 2.45, 0);
          lTip.element.style.setProperty('--c', out || tip > 0.01 ? COL.net : COL.acc);
          lTip.element.innerHTML = isBus ? `table ${s.tilt.toFixed(0)}° · tips at <b>${(r.crit / D2R).toFixed(1)}°</b>${tip > 0.01 ? ': over it goes' : ''}` : tip > 0.01 ? '<b>It topples!</b>' : `needs <b>${fmtN(r.Fneed)}</b> at the top to tip`;
          const Lp = (push / 120) * 0.7;
          aPush.aim([-1.6 + Ex - b - Lp - 0.04, 0.3 + CUP.push, 0.2], [1, 0, 0], Lp); aPush.visible = !isBus && push > 1 && tip < 0.02;
          lPushT.position.set(-1.6 + Ex - b - Lp * 0.6, 0.3 + CUP.push + 0.22, 0.2); lPushT.element.innerHTML = `push ${push} N`; lPushT.visible = !isBus && push > 1;
        }

        if (focus === 'pole') {
          if (s.L !== poleL) buildPole(s.L);
          const r = walker(s.L);
          if (leanHold > 0) { leanHold -= dt; lean = approach(lean, 2 * D2R, 4, dt); if (leanHold <= 0) { lean = 2 * D2R; leanSign = -leanSign; } }
          else { lean *= Math.exp(r.lam * dt); if (lean >= 20 * D2R) { lean = 20 * D2R; leanHold = 1.0; } }
          leanG.rotation.z = -leanSign * lean;
          const cgx = leanSign * Math.sin(lean) * WALK.h, cgy = RY + Math.cos(lean) * WALK.h;
          aG.aim([cgx, cgy, 0.4], [0, -1, 0], 0.6);
          lLean.position.set(1.2, RY + 2.2, 0); lLean.element.innerHTML = `lean ${(lean / D2R).toFixed(0)}° · 2° to 20° in <b>${r.t.toFixed(2)} s</b>`;
          lPole.position.set(s.L / 2 + 0.3, RY + 1.0, 0.4); lPole.element.innerHTML = s.L ? `pole ${s.L} m, ${r.mp.toFixed(0)} kg` : 'no pole'; lPole.visible = !narrow;
        }

        cur = { s };
        const kk = `${focus}|${s.m1}|${s.d1}|${s.m2}|${s.d2}|${s.what}|${s.high}|${s.load}|${s.L}`;
        if (kk !== key) { key = kk; bd.redraw(); }
      },
      readout: (s) => {
        if (s.focus === 'seesaw' || s.focus === 'rule') {
          const m = moments(s), rule = s.focus === 'rule', bal = Math.abs(m.net) < 0.02 * Math.max(m.L, m.R);
          const need = (s.m1 * s.d1) / s.m2;
          const dist = (d) => (rule ? (d * 25).toFixed(1) + ' cm' : d.toFixed(2) + ' m');
          return `<div class="big">${bal ? 'Balanced' : m.net > 0 ? 'Tips clockwise' : 'Tips anticlockwise'}</div>
            <div class="row"><span>Left moment, m₁ g d₁</span><b>${fmtNm(m.L)}</b></div>
            <div class="row"><span>Right moment, m₂ g d₂</span><b>${fmtNm(m.R)}</b></div>
            <div class="row"><span>Net torque</span><b>${fmtNm(Math.abs(m.net))}</b></div>
            <div class="row"><span>Right side balances at</span><b>${need <= 2 ? dist(need) : 'off the end'}</b></div>
            <small>The plank’s own weight acts at the pivot: no torque.</small>`;
        }
        if (s.focus === 'topple') {
          if (s.what === 'bus') {
            const r = bus(s), ok = s.tilt < r.crit / D2R;
            return `<div class="big">Tips at ${(r.crit / D2R).toFixed(1)}°</div>
              <div class="row"><span>Half the track (wheel to centre)</span><b>${(BUS.b / 2).toFixed(2)} m</b></div>
              <div class="row"><span>Height of the CG</span><b>${r.h.toFixed(2)} m</b></div>
              <div class="row"><span>Table tilt</span><b>${s.tilt.toFixed(1)}°</b></div>
              <div class="row"><span>Tilt test</span><b>${r.crit / D2R >= 28 ? 'passes 28°' : 'fails 28°'}</b></div>
              ${ok ? '<div class="ok">The CG is still above the wheels.</div>' : '<div class="no">The CG has passed the wheels: gravity turns it over.</div>'}`;
          }
          const r = cupboard(s);
          return `<div class="big">Push to tip: ${fmtN(r.Fneed)}</div>
            <div class="row"><span>Mass, empty + top shelf</span><b>${r.m} kg</b></div>
            <div class="row"><span>Holding torque, m g × 25 cm</span><b>${fmtNm(r.m * G * 0.25)}</b></div>
            <div class="row"><span>Your torque, F × 1.7 m</span><b>${fmtNm(s.push * CUP.push)}</b></div>
            <div class="row"><span>Height of the CG</span><b>${r.h.toFixed(2)} m</b></div>
            <div class="row"><span>Topples if tilted past</span><b>${(r.crit / D2R).toFixed(1)}°</b></div>
            <small>A heavy top shelf makes it harder to start, but once tilted it goes over sooner. Fix tall furniture to the wall.</small>`;
        }
        const r = walker(s.L), r0 = walker(0);
        return `<div class="big">2° to 20° in ${r.t.toFixed(2)} s</div>
          <div class="row"><span>Pole</span><b>${s.L ? s.L + ' m, ' + r.mp.toFixed(0) + ' kg' : 'none'}</b></div>
          <div class="row"><span>Moment of inertia about the rope</span><b>${r.I.toFixed(0)} kg·m²</b></div>
          <div class="row"><span>Tipping torque per radian of lean</span><b>${fmtNm(WALK.m * G * WALK.h + r.mp * G * r.y)}</b></div>
          <div class="row"><span>Without a pole</span><b>${r0.t.toFixed(2)} s</b></div>
          <small>The pole slows the fall, so small moves can correct it.</small>`;
      },
    };
  },
};
