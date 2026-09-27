// Chapter 5: where the simple picture gets surprising.
//  - spin: torque makes things spin faster, τ = I α, the turning form of F = m a (Euler, 1750s–1760s).
//    A light rotor (I₀ = 0.01 kg·m²) carries two 1 kg masses at radius r, I = I₀ + 2 m r². The same
//    torque spins it up far faster with the masses near the axle. Run for 3 s from rest. (InertiaClear
//    explores the moment of inertia itself.)
//  - gyro: a toy gyroscope. Brass rotor 0.1 kg, radius 3.5 cm, I = ½ m r² ≈ 6.1 × 10⁻⁵ kg·m². Rotor and
//    frame 0.13 kg with the centre 4.5 cm from the pivot, so gravity's torque τ = m g d ≈ 0.057 N·m.
//    It swings the spin (angular momentum L = I ω) sideways instead of toppling it: precession
//    Ω = τ ÷ (I ω). That simple rule needs a fast spin: the rotor must beat ω² > 4 m g d I⊥ ÷ I², with
//    I⊥ ≈ m d² + ¼ m r² about the pivot, about 134 rad/s (1,300 rpm) here. Slower than that, it falls.
//  - units: torque and energy share the unit N·m, but torque is a turning force and energy is work done.
//    Work by a torque turning through an angle θ (in radians) is W = τ θ, in joules. A stuck nut under
//    100 N·m (400 N on a 25 cm spanner) gets 0 J. The SI Brochure says to write N·m for torque, never J.
//  - gears: a 1.2 L petrol engine at 4,400 rpm (113 N·m, about 52 kW) through typical five-speed ratios
//    for a small hatchback (rounded): 3.55, 1.90, 1.28, 0.97, 0.76, final drive 4.1, 90% through the
//    drivetrain, tyre radius 0.29 m (175/65 R14). Low gears give huge wheel torque and low speed; top
//    gear little torque and high speed. The power is the same in every gear: speed comes from power.
import { THREE, M, box, sphere, clamp, approach } from '../kit.js';
import {
  G, D2R, TAU, KMH, board, panelBg, title, axes, dot, line, COL, HEX, force, stick, twist, makeNut, makeSpanner, makeGear,
  fitNarrow, reelBoards, homeBoard, inReel, fmtN, fmtNm, fmtJ, fmtW, niceMax,
} from '../torque.js';

const GX = 30, UX = 60, RX = 90;
const VIEWS = {
  spin: { pos: [0.2, 1.65, 2.3], target: [0.02, 1.05, 0] },
  gyro: { pos: [GX + 0.08, 0.42, 0.52], target: [GX + 0.06, 0.25, 0] },
  units: { pos: [UX - 0.12, 0.72, 1.35], target: [UX - 0.06, 0.6, 0] },
  gears: { pos: [RX + 0.05, 0.75, 1.9], target: [RX + 0.05, 0.42, 0] },
};
const SPIN = { I0: 0.01, m: 1, T: 3 };
const GYRO = { m: 0.1, r: 0.035, mt: 0.13, d: 0.045, H: 0.25 };
GYRO.I = 0.5 * GYRO.m * GYRO.r * GYRO.r;
GYRO.tau = GYRO.mt * G * GYRO.d;
GYRO.Ip = GYRO.mt * GYRO.d * GYRO.d + 0.25 * GYRO.m * GYRO.r * GYRO.r;
GYRO.wc = Math.sqrt(4 * GYRO.tau * GYRO.Ip) / GYRO.I;
const UNIT = { F: 400, r: 0.25 };
const CAR = { T: 113, rpm: 4400, g: [3.55, 1.9, 1.28, 0.97, 0.76], fd: 4.1, eta: 0.9, R: 0.29 };

export const spin = (s) => { const I = SPIN.I0 + 2 * SPIN.m * s.rr * s.rr, al = s.tq / I; return { I, al, w3: al * SPIN.T, rpm3: (al * SPIN.T * 60) / TAU }; };
export function gyro(s) {
  const w = (s.rpm * TAU) / 60, L = GYRO.I * w, Om = GYRO.tau / L;
  return { w, L, Om, period: TAU / Om, ok: w > GYRO.wc };
}
export function gear(n) {
  const k = CAR.g[n - 1] * CAR.fd, wheelT = CAR.T * k * CAR.eta, push = wheelT / CAR.R;
  const wheelW = (CAR.rpm * TAU) / 60 / k, v = wheelW * CAR.R;
  return { ratio: CAR.g[n - 1], k, wheelT, push, v, P: push * v };
}

export default {
  id: 'limits',
  short: 'Surprises',
  title: 'Spin, wobble and three myths',
  subtitle: 'Torque makes things spin up, gyroscopes that refuse to fall, and what torque is not.',
  view: VIEWS.spin,
  learn: `<p>A torque that isn’t balanced doesn’t just hold things: it makes them <b>spin faster</b>. <b>τ = I α</b> is Newton’s second law for turning (see NewtonClear). Here α is the angular acceleration, and I, the <b>moment of inertia</b>, is how hard the thing is to spin. Mass far from the axis counts much more than mass near it (see InertiaClear).</p>
    <p>A spinning <b>gyroscope</b> is the big surprise. Rest one end on a post and gravity’s torque should tip it over. Instead it swings slowly round the post. The torque changes the <b>direction</b> of its spin rather than tipping it. This is <b>precession</b>. Spin it slower and it precesses faster, until the spin is too slow and it falls.</p>
    <p><b>Myth: “torque and work are the same, because both are N·m.”</b> No. Torque is a turning force; work is energy. A torque only does work when it turns something: W = τ × angle (in radians), in joules. Lean 100 N·m on a stuck nut and you do no work at all. That’s why torque is always written N·m and never J.</p>
    <p><b>Myth: “a longer spanner gives more force.”</b> Your push stays the same. What grows is the lever arm, and so the torque.</p>
    <p><b>Myth: “more torque means faster.”</b> First gear gives the wheels about five times the torque of fifth gear, yet the car is slow in first. Gears trade torque for turning speed. Top speed comes from <b>power</b>, P = τ ω, and the power is the same in every gear.</p>
    <p class="tip"><b>Try it:</b> slide the masses out and watch the spin-up slow down. Spin the gyroscope slower and slower until it falls. Free the stuck nut and count the joules. Then step through the gears and watch the dots follow one power curve.</p>`,
  terms: [
    { t: 'τ = I α', d: 'Torque = moment of inertia × angular acceleration: Newton’s second law for turning.' },
    { t: 'Moment of inertia (I)', d: 'How hard something is to spin up: mass × distance² from the axis, added up.' },
    { t: 'Angular momentum (L)', d: 'Spin that keeps going: L = I ω. Only a torque can change it.' },
    { t: 'Precession', d: 'The slow swing of a spinning object’s axis, caused by a torque at right angles to its spin.' },
    { t: 'Work by a torque', d: 'W = τ θ, with the angle θ in radians. No turning, no work.' },
  ],
  defaults: { focus: 'spin', tq: 0.5, rr: 0.35, rpm: 5000, free: false, turns: 1, gear: 1 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'spin', label: 'Spin up' }, { v: 'gyro', label: 'Gyroscope' }, { v: 'units', label: 'N·m vs J' }, { v: 'gears', label: 'Torque vs power' }] },
    { key: 'tq', type: 'range', label: 'Spin up: torque', min: 0.1, max: 2, step: 0.05, ends: ['0.1 N·m', '2 N·m'], fmt: (v) => v.toFixed(2) + ' N·m' },
    { key: 'rr', type: 'range', label: 'Spin up: masses’ distance from the axle', min: 0.05, max: 0.42, step: 0.01, ends: ['close in', 'far out'], fmt: (v) => (v * 100).toFixed(0) + ' cm' },
    { key: 'rpm', type: 'range', label: 'Gyroscope: spin', min: 500, max: 8000, step: 50, ends: ['500 rpm', '8,000 rpm'], fmt: (v) => v.toLocaleString('en-IN') + ' rpm' },
    { key: 'free', type: 'toggle', label: 'Stuck nut: let it break free', hint: '400 N on a 25 cm spanner: 100 N·m either way.' },
    { key: 'turns', type: 'range', label: 'Stuck nut: turns once free', min: 0.25, max: 3, step: 0.25, ends: ['¼ turn', '3 turns'], fmt: (v) => v + (v === 1 ? ' turn' : ' turns') },
    { key: 'gear', type: 'seg', label: 'Car gear (engine at 4,400 rpm, 113 N·m)', options: [1, 2, 3, 4, 5].map((v) => ({ v, label: String(v) })) },
  ],
  onChange(s, key) {
    if (['tq', 'rr'].includes(key)) s.focus = 'spin';
    if (key === 'rpm') s.focus = 'gyro';
    if (['free', 'turns'].includes(key)) s.focus = 'units';
    if (key === 'gear') s.focus = 'gears';
  },
  quiz: [
    { q: 'The same torque acts on two wheels of equal mass. One has its mass at the rim, one near the hub. Which spins up faster?', options: ['The rim one', 'The hub one', 'Both the same', 'Neither moves'], answer: 1, why: 'α = τ ÷ I, and mass far out makes I much bigger (it counts as distance²). The hub-heavy wheel has the smaller I, so it spins up faster.' },
    { q: 'A stuck nut resists 100 N·m of torque and doesn’t move. How much work do you do on it?', options: ['100 J', '100 N·m of work', '0 J', '628 J'], answer: 2, why: 'Work needs turning: W = τ × angle. No angle, no work. Torque and work share N·m, but they are different things.' },
    { q: 'In first gear the wheels get about five times the torque of fifth gear. Why is fifth gear faster?', options: ['Fifth gear has more power', 'Gears trade torque for speed; the power is the same, and at speed you need speed, not torque', 'Fifth gear is lighter', 'First gear wastes the torque'], answer: 1, why: 'P = τ ω. The gearbox can turn the same power into big torque and slow wheels, or small torque and fast wheels. Top speed is set by power.' },
  ],
  reel: [
    { ms: 5200, caption: 'A spinning gyroscope doesn’t fall. Gravity’s torque swings its spin round the post instead.', set: { focus: 'gyro', rpm: 5000 }, view: { pos: [GX + 0.05, 0.3, 0.26], target: [GX + 0.02, 0.2, 0] }, spin: 0 },
    { ms: 5400, caption: 'Myth: torque and work are the same. 100 N·m on a stuck nut does 0 joules of work.', set: { focus: 'units', free: false, turns: 1 }, act: (s) => { s.free = false; }, view: { pos: [UX + 0.05, 0.62, 0.68], target: [UX + 0.05, 0.5, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gS = new THREE.Group(), gG = new THREE.Group(), gU = new THREE.Group(), gR = new THREE.Group();
    gG.position.x = GX; gU.position.x = UX; gR.position.x = RX; root.add(gS, gG, gU, gR);
    const steel = M.metal(0x9aa3b2), dark = M.matte(0x22252c), brass = M.metal(0xc9a46a, { roughness: 0.3 });

    // ================================================================ spin up
    const baseS = box(0.5, 0.04, 0.5, M.matte(0x3a3f4b)); baseS.position.y = 0.02; gS.add(baseS);
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 16), steel); axle.position.y = 0.52; gS.add(axle);
    const rotor = new THREE.Group(); rotor.position.y = 1.0; gS.add(rotor);
    const bar = box(0.9, 0.025, 0.025, M.metal(0x6b7280)); rotor.add(bar);
    const hubS = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 20), M.plastic(0x3b6fd8)); rotor.add(hubS);
    const masses = [-1, 1].map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.07, 24), brass); m.castShadow = true; rotor.add(m); return m; });
    const twSp = twist(HEX.acc, 0.14, 0.01); twSp.rotation.x = -Math.PI / 2; twSp.position.y = 1.12; gS.add(twSp);
    const lSp = stage.label('', [0.5, 1.28, 0], gS, 'hot'), lR = stage.label('', [0, 0, 0], gS);
    lSp.element.style.setProperty('--c', COL.acc);

    // ================================================================ gyroscope on a post
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, GYRO.H, 16), steel); post.position.y = GYRO.H / 2; gG.add(post);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 24), dark); foot.position.y = 0.005; gG.add(foot);
    const prec = new THREE.Group(); prec.position.y = GYRO.H; gG.add(prec);
    const droopG = new THREE.Group(); prec.add(droopG);
    const gAx = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.1, 10), steel); gAx.rotation.z = Math.PI / 2; gAx.position.x = GYRO.d; droopG.add(gAx);
    const cage1 = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.0025, 8, 48), steel); cage1.position.x = GYRO.d; droopG.add(cage1);
    const cage2 = cage1.clone(); cage2.rotation.x = Math.PI / 2; droopG.add(cage2);
    const spinner = new THREE.Group(); spinner.position.x = GYRO.d; droopG.add(spinner);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(GYRO.r, GYRO.r, 0.012, 40), brass); disc.rotation.z = Math.PI / 2; disc.castShadow = true; spinner.add(disc);
    const dmark = box(0.014, 0.02, 0.05, M.glow(0xff7a59)); dmark.position.set(0, 0.018, 0); spinner.add(dmark);
    const aWg = force(HEX.weight, 0.003, 0.012), aL = force(HEX.pull, 0.003, 0.012), aTau = force(HEX.acc, 0.003, 0.012); gG.add(aWg, aL, aTau);
    const lL = stage.label('spin L', [0, 0, 0], gG, 'hot'), lTau = stage.label('torque τ', [0, 0, 0], gG, 'hot'), lWg = stage.label('weight', [0, 0, 0], gG), lG = stage.label('', [0, 0, 0], gG, 'hot');
    lL.element.style.setProperty('--c', COL.pull); lTau.element.style.setProperty('--c', COL.acc);

    // ================================================================ N·m vs J: a stuck nut
    const P = [0.12, 0.5, 0.06];
    const plate = box(0.5, 0.5, 0.04, M.matte(0x5b6270)); plate.position.set(P[0], P[1], -0.02); gU.add(plate);
    const nutU = makeNut(0.05, 0x8a6a48); nutU.position.set(...P); gU.add(nutU);
    const spU = new THREE.Group(); spU.position.set(P[0], P[1], P[2] + 0.04); gU.add(spU);
    spU.add(makeSpanner(UNIT.r + 0.03));
    const handU = sphere(0.03, M.matte(0xc68b64)); gU.add(handU);
    const aU = force(HEX.push, 0.01, 0.045); gU.add(aU);
    const trail = twist(HEX.acc, 0.2, 0.006); trail.start = Math.PI; trail.position.set(P[0], P[1], 0.1); gU.add(trail);
    const lU = stage.label('', [0, 0, 0], gU, 'hot'), lJ = stage.label('', [0, 0, 0], gU, 'hot');
    lU.element.style.setProperty('--c', COL.push); lJ.element.style.setProperty('--c', COL.acc);

    // ================================================================ gearbox: torque vs power
    const eng = box(0.26, 0.26, 0.2, M.metal(0x7a8290, { roughness: 0.5 })); eng.position.set(-0.3, 0.35, -0.05); gR.add(eng);
    const r1 = 0.05;
    const gIn = makeGear(r1, 14, 0.03, 0xc9ced8); gIn.position.set(-0.12, 0.35, 0.08); gR.add(gIn);
    let gOut = null, curGear = 0;
    const wheelR = new THREE.Group(); gR.add(wheelR);
    const tyreR = new THREE.Mesh(new THREE.TorusGeometry(CAR.R - 0.05, 0.05, 12, 48), M.matte(0x16181d)); wheelR.add(tyreR);
    const rimR = new THREE.Mesh(new THREE.CylinderGeometry(CAR.R - 0.09, CAR.R - 0.09, 0.08, 32), M.metal(0xb7bfcc)); rimR.rotation.x = Math.PI / 2; wheelR.add(rimR);
    const rimMark = box(0.03, CAR.R - 0.1, 0.09, M.glow(0xff7a59)); rimMark.position.y = (CAR.R - 0.1) / 2; wheelR.add(rimMark);
    const roadR = box(1.6, 0.02, 0.6, M.matte(0x2b2f36)); roadR.position.set(0.2, 0.0, -0.2); gR.add(roadR);
    const aPush = force(HEX.acc, 0.012, 0.05); gR.add(aPush);
    const twIn = twist(HEX.push, 0.08, 0.005), twOut = twist(HEX.acc, 0.1, 0.007); twIn.start = twOut.start = Math.PI * 0.6; gR.add(twIn, twOut);
    const lIn = stage.label('', [0, 0, 0], gR, 'hot'), lOut = stage.label('', [0, 0, 0], gR, 'hot'), lV = stage.label('', [0, 0, 0], gR, 'hot');
    lIn.element.style.setProperty('--c', COL.push); lOut.element.style.setProperty('--c', COL.acc); lV.element.style.setProperty('--c', COL.pull);

    // ================================================================ board
    let cur = null;
    const bd = board(root, 1.6, 0.95, 900, 520, (g, w, h) => {
      panelBg(g, w, h); if (!cur) return;
      const { s } = cur;
      if (s.focus === 'spin') {
        title(g, 'Spin-up for the same torque', 'α = τ ÷ I');
        const pts = []; let aMax = 0; for (let r = 0.05; r <= 0.42001; r += 0.01) { const a = spin({ ...s, rr: r }).al; pts.push([r, a]); aMax = Math.max(aMax, a); }
        const yMax = niceMax(aMax * 1.05);
        const { X, Y } = axes(g, w, h, { x0: 100, y1: 100, xMin: 0, xMax: 0.45, yMax, xTicks: [0, 0.15, 0.3, 0.45], yTicks: [0, yMax / 2, yMax], xFmt: (v) => Math.round(v * 100) + ' cm', yFmt: (v) => String(+v.toFixed(1)), xLabel: 'masses’ distance from the axle →', yLabel: 'angular acceleration, rad/s² ↑' });
        line(g, pts, X, Y, COL.acc, 5);
        const r = spin(s); dot(g, X(s.rr), Y(r.al), COL.acc, 10);
        g.fillStyle = '#fff'; g.font = 'bold 22px sans-serif'; g.fillText(`${r.al.toFixed(1)} rad/s²`, X(s.rr) + 14, Math.max(120, Y(r.al) - 14));
      } else if (s.focus === 'gyro') {
        title(g, 'Precession speed', 'Ω = τ ÷ (I ω)');
        const { X, Y } = axes(g, w, h, { x0: 100, y1: 100, xMin: 0, xMax: 8000, yMax: 10, xTicks: [0, 2000, 4000, 6000, 8000], yTicks: [0, 5, 10], xFmt: (v) => v.toLocaleString('en-IN'), yFmt: (v) => v + '', xLabel: 'spin, rpm →', yLabel: 'precession, rad/s ↑' });
        const rc = (GYRO.wc * 60) / TAU;
        g.fillStyle = 'rgba(255,90,138,.18)'; g.fillRect(X(0), Y(10), X(rc) - X(0), Y(0) - Y(10));
        g.fillStyle = COL.net; g.font = 'bold 17px sans-serif'; g.fillText('too slow:', X(40), Y(8)); g.fillText('it falls', X(40), Y(8) + 22);
        const pts = []; for (let n = rc; n <= 8000; n += 50) pts.push([n, Math.min(10, gyro({ rpm: n }).Om)]);
        line(g, pts, X, Y, COL.acc, 5);
        const r = gyro(s); dot(g, X(s.rpm), Y(Math.min(10, r.Om)), r.ok ? COL.acc : COL.net, 10);
        g.fillStyle = '#fff'; g.font = 'bold 22px sans-serif'; g.fillText(r.ok ? `${r.Om.toFixed(1)} rad/s: once round in ${r.period.toFixed(1)} s` : 'falls over', Math.min(X(s.rpm) + 14, w - 380), Math.max(120, Y(Math.min(10, r.Om)) - 14));
      } else if (s.focus === 'units') {
        const tau = UNIT.F * UNIT.r, th = s.free ? s.turns * TAU : 0;
        title(g, 'Work done by 100 N·m', 'W = τ × angle turned');
        const yMax = niceMax(tau * 3 * TAU);
        const { X, Y } = axes(g, w, h, { x0: 110, y1: 100, xMax: 3, yMax, xTicks: [0, 1, 2, 3], yTicks: [0, yMax / 2, yMax], xFmt: (v) => v + ' turns', yFmt: (v) => fmtJ(v), xLabel: 'angle turned →', yLabel: 'work, joules ↑' });
        line(g, [[0, 0], [3, tau * 3 * TAU]], X, Y, COL.acc, 5, [10, 6]);
        const k = cur.k ?? 0, t = th * k / TAU;
        dot(g, X(t), Y(tau * th * k), COL.acc, 10);
        g.fillStyle = '#fff'; g.font = 'bold 24px sans-serif'; g.fillText(s.free ? `${fmtJ(tau * th * k)} of work` : 'stuck: 100 N·m, 0 J', X(0) + 20, 140);
      } else {
        title(g, 'Push at the road in each gear', 'same power: F × v = P');
        const pts = CAR.g.map((_, i) => gear(i + 1));
        const P = pts[0].P;
        const xMax = 50, yMax = niceMax(pts[0].push * 1.1);
        const { X, Y } = axes(g, w, h, { x0: 110, y1: 100, xMax, yMax, xTicks: [0, 10, 20, 30, 40, 50], yTicks: [0, yMax / 2, yMax], xFmt: (v) => Math.round(v * KMH) + ' km/h', yFmt: (v) => fmtN(v), xLabel: 'road speed →', yLabel: 'push at the road ↑' });
        const hyp = []; for (let v = P / yMax; v <= xMax; v += 0.5) hyp.push([v, P / v]);
        line(g, hyp, X, Y, 'rgba(255,181,71,.7)', 3, [8, 6]);
        pts.forEach((p, i) => { dot(g, X(p.v), Y(p.push), i + 1 === s.gear ? COL.acc : COL.soft, i + 1 === s.gear ? 12 : 8); g.fillStyle = 'rgba(255,255,255,.8)'; g.font = 'bold 17px sans-serif'; g.fillText(String(i + 1), X(p.v) + 12, Y(p.push) - 8); });
        g.fillStyle = COL.push; g.font = '17px sans-serif'; g.fillText(`power at the wheels ≈ ${fmtW(P)} in every gear`, X(18), Y(yMax * 0.7));
      }
    }, [0, 0, 0]);

    let focus = '', key = '', t = 0, spinW = 0, spinA = 0, spinT = 0, psi = 0, droop = 0, fallHold = 0, rotA = 0, unitK = 0, unitHold = 0, rin = 0, rout = 0;
    const place = () => {
      const p = { spin: [[1.05, 1.1, -0.4], -0.35, 0.6], gyro: [[GX + 0.25, 0.3, -0.12], -0.4, 0.13], units: [[UX + 0.6, 0.6, -0.3], -0.4, 0.4], gears: [[RX + 0.95, 0.65, -0.4], -0.4, 0.55] }[focus];
      homeBoard(bd, ...p);
    };
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        const narrow = fitNarrow(stage, [lR, lWg]);
        if (s.focus !== focus) {
          focus = s.focus;
          gS.visible = focus === 'spin'; gG.visible = focus === 'gyro'; gU.visible = focus === 'units'; gR.visible = focus === 'gears';
          place(); spinW = 0; spinT = 0; droop = 0; fallHold = 0; unitK = 0; unitHold = 0;
          if (!inReel()) { const v = VIEWS[focus]; stage.setView(v.pos, v.target, 1.0); }
        }
        const rp = { spin: [[0.2, 1.72, -0.3], 0.62], gyro: [[GX + 0.04, 0.37, -0.1], 0.12], units: [[UX + 0.1, 0.9, -0.2], 0.35], gears: [[RX + 0.05, 0.95, -0.3], 0.55] }[focus];
        reelBoards([[bd, rp[0], rp[1]]]);

        if (focus === 'spin') {
          const r = spin(s);
          masses.forEach((m, i) => { m.position.x = (i ? 1 : -1) * s.rr; });
          spinT += dt;
          if (spinT <= SPIN.T) spinW = r.al * spinT; else if (spinT > SPIN.T + 1.2) { spinT = 0; spinW = 0; }
          spinA += Math.min(spinW, 18) * dt; rotor.rotation.y = spinA;
          twSp.set(1.5 * Math.PI * clamp(s.tq / 2, 0.08, 1));
          lSp.element.innerHTML = `ω after ${Math.min(spinT, SPIN.T).toFixed(1)} s: <b>${Math.round((spinW * 60) / TAU)} rpm</b>`;
          lR.position.set(s.rr, 1.12, 0.1); lR.element.innerHTML = `1 kg at ${(s.rr * 100).toFixed(0)} cm`;
        }

        if (focus === 'gyro') {
          const r = gyro(s);
          if (r.ok) { droop = approach(droop, 3 * D2R, 3, dt); psi += r.Om * dt; fallHold = 0; }
          else if (fallHold > 0) { fallHold -= dt; if (fallHold <= 0) droop = 0; }
          else { droop += dt * (0.4 + droop * 3); psi += Math.min(r.Om, 3) * dt; if (droop > 70 * D2R) { droop = 70 * D2R; fallHold = 1.2; } }
          prec.rotation.y = psi; droopG.rotation.z = -droop;
          spinner.rotation.x += Math.min(r.w, 30) * dt;
          // Vectors in the gyroscope group's frame: axis direction, torque direction (horizontal, at right angles).
          const ax = new THREE.Vector3(Math.cos(droop), -Math.sin(droop), 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), psi);
          const tz = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), psi);
          const c = new THREE.Vector3(0, GYRO.H, 0).addScaledVector(ax, GYRO.d);
          aWg.aim([c.x, c.y - 0.04, c.z], [0, -1, 0], 0.05);
          const tip = c.clone().addScaledVector(ax, 0.055);
          aL.aim(tip.toArray(), ax.toArray(), r.ok ? 0.06 : 0.02);
          aTau.aim([c.x, c.y, c.z], tz.toArray(), 0.07); aTau.visible = true;
          lL.position.copy(tip.clone().addScaledVector(ax, 0.075)); lTau.position.copy(c.clone().addScaledVector(tz, 0.09));
          lWg.position.set(c.x, c.y - 0.11, c.z);
          lG.position.set(0, GYRO.H + 0.1, 0); lG.element.innerHTML = r.ok ? `${s.rpm.toLocaleString('en-IN')} rpm: circles in <b>${r.period.toFixed(1)} s</b>` : '<b>Too slow: it falls</b>';
          lG.element.style.setProperty('--c', r.ok ? COL.acc : COL.net);
        }

        if (focus === 'units') {
          const tau = UNIT.F * UNIT.r, th = s.turns * TAU;
          if (s.free) { if (unitHold > 0) { unitHold -= dt; if (unitHold <= 0) unitK = 0; } else { unitK += dt / (1.5 * s.turns); if (unitK >= 1) { unitK = 1; unitHold = 1.2; } } }
          else { unitK = 0; unitHold = 0; }
          const a = s.free ? th * unitK : 0;
          spU.rotation.z = a; nutU.rotation.z = a;
          const u = [-Math.cos(a), -Math.sin(a)], d = [-u[1], u[0]];
          const H = [P[0] + u[0] * UNIT.r, P[1] + u[1] * UNIT.r, P[2] + 0.06];
          handU.position.set(...H);
          aU.aim([H[0] - d[0] * 0.2, H[1] - d[1] * 0.2, H[2]], [d[0], d[1], 0], 0.16);
          trail.set(Math.max(0.06, Math.min(a, TAU * 0.97))); trail.visible = s.free && a > 0.05;
          lU.position.set(H[0] + d[0] * 0.08, H[1] + d[1] * 0.08 - 0.04, H[2]); lU.element.innerHTML = `${UNIT.F} N × ${UNIT.r * 100} cm = <b>${tau} N·m</b>`;
          lJ.position.set(P[0] + 0.02, P[1] + 0.3, 0.1); lJ.element.innerHTML = s.free ? `turned ${(a / TAU).toFixed(2)} turns: work <b>${fmtJ(tau * a)}</b>` : 'stuck: work <b>0 J</b>';
          cur = { s, k: unitK };
        }

        if (focus === 'gears') {
          const n = s.gear, gr = gear(n);
          if (n !== curGear) {
            if (gOut) gR.remove(gOut);
            const r2 = r1 * CAR.g[n - 1];
            gOut = makeGear(r2, Math.round(14 * CAR.g[n - 1]), 0.03, 0x9aa3b2); gOut.position.set(-0.12 + r1 + r2 + 0.004, 0.35, 0.08); gR.add(gOut);
            wheelR.position.set(gOut.position.x, CAR.R, -0.25);
            twOut.position.set(gOut.position.x, 0.35, 0.13); curGear = n;
          }
          rin -= dt * 6; rout += (dt * 6) / CAR.g[n - 1];
          gIn.rotation.z = rin; gOut.rotation.z = rout + Math.PI / Math.round(14 * CAR.g[n - 1]); wheelR.rotation.z = -rout / CAR.fd * 3;
          twIn.position.set(-0.12, 0.35, 0.13); twIn.set(-0.9 * Math.PI);
          twOut.set(1.7 * Math.PI * clamp(gr.wheelT / 1500, 0.15, 1));
          aPush.aim([wheelR.position.x - 0.1 - Math.min(0.5, gr.push * 0.0001), 0.02, 0.1], [1, 0, 0], Math.min(0.5, gr.push * 0.0001) + 0.03);
          lIn.position.set(-0.3, 0.16, 0.15); lIn.element.innerHTML = `engine <b>113 N·m</b> at 4,400 rpm`;
          lOut.position.set(gOut.position.x, 0.35 + r1 * CAR.g[n - 1] + 0.1, 0.1); lOut.element.innerHTML = `wheels <b>${fmtNm(gr.wheelT)}</b>`;
          lV.position.set(wheelR.position.x + 0.1, -0.08, 0.2); lV.element.innerHTML = `${Math.round(gr.v * KMH)} km/h · push ${fmtN(gr.push)}`;
        }

        if (focus !== 'units') cur = { s };
        const kk = `${focus}|${s.tq}|${s.rr}|${s.rpm}|${s.free}|${s.turns}|${s.gear}|${focus === 'units' ? Math.round(unitK * 40) : 0}`;
        if (kk !== key) { key = kk; bd.redraw(); }
        void narrow;
      },
      readout: (s) => {
        if (s.focus === 'spin') {
          const r = spin(s);
          return `<div class="big">α = τ ÷ I = ${r.al.toFixed(1)} rad/s²</div>
            <div class="row"><span>Torque τ</span><b>${fmtNm(s.tq)}</b></div>
            <div class="row"><span>I = I₀ + 2 m r²</span><b>${r.I.toFixed(3)} kg·m²</b></div>
            <div class="row"><span>Speed after 3 s</span><b>${Math.round(r.rpm3)} rpm</b></div>
            <small>Twice as far out: about four times harder to spin.</small>`;
        }
        if (s.focus === 'gyro') {
          const r = gyro(s);
          return `<div class="big">${r.ok ? `Precesses at ${r.Om.toFixed(1)} rad/s` : 'Falls over'}</div>
            <div class="row"><span>Gravity’s torque, m g d</span><b>${fmtNm(GYRO.tau)}</b></div>
            <div class="row"><span>Spin ω</span><b>${Math.round(r.w)} rad/s</b></div>
            <div class="row"><span>Spin L = I ω</span><b>${r.L.toFixed(4)} kg·m²/s</b></div>
            <div class="row"><span>Needs at least</span><b>${Math.round((GYRO.wc * 60) / TAU).toLocaleString('en-IN')} rpm</b></div>
            ${r.ok ? `<div class="row"><span>Once round the post</span><b>${r.period.toFixed(1)} s</b></div>` : '<div class="no">Too slow to hold itself up.</div>'}`;
        }
        if (s.focus === 'units') {
          const tau = UNIT.F * UNIT.r, th = s.free ? s.turns * TAU : 0;
          return `<div class="big">Torque ${tau} N·m, work ${fmtJ(tau * th)}</div>
            <div class="row"><span>Torque, F × r</span><b>${tau} N·m</b></div>
            <div class="row"><span>Angle turned</span><b>${s.free ? `${s.turns} × 2π = ${th.toFixed(2)} rad` : '0 rad'}</b></div>
            <div class="row"><span>Work, τ × angle</span><b>${fmtJ(tau * th)}</b></div>
            <small>Same N·m on paper, different things: write torque in N·m, never J.</small>`;
        }
        const gr = gear(s.gear), g5 = gear(5);
        return `<div class="big">Gear ${s.gear}: ${Math.round(gr.v * KMH)} km/h</div>
          <div class="row"><span>Gear × final drive</span><b>${gr.ratio.toFixed(2)} × 4.1 = ${gr.k.toFixed(1)}</b></div>
          <div class="row"><span>Torque at the wheels</span><b>${fmtNm(gr.wheelT)}</b></div>
          <div class="row"><span>Push at the road</span><b>${fmtN(gr.push)}</b></div>
          <div class="row"><span>Power, push × speed</span><b>${fmtW(gr.P)}</b></div>
          <small>${s.gear === 1 ? `${(gr.wheelT / g5.wheelT).toFixed(1)}× the torque of fifth, but the slowest.` : 'Torque traded for speed. Power unchanged.'}</small>`;
      },
    };
  },
};
