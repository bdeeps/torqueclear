// Chapter 3: machines that turn.
//  - bike: the foot pushes straight down on a 170 mm crank. Only the part at right angles to the crank
//    turns it, so τ = F L sin φ (φ measured from the top), and each leg drives for half a turn. Averaged
//    over a turn, the two legs give F L × 2/π. The chain carries the torque to the rear cog: the same
//    chain pull acts on both sprockets, so wheel torque = crank torque × (cog teeth ÷ ring teeth), less
//    about 3% chain loss (chain drives are 95–98% efficient). The tyre pushes on the road with wheel
//    torque ÷ 0.34 m (a 700c wheel with its tyre). Sprocket pitch radius r = p ÷ (2 sin(π ÷ N)),
//    p = 12.7 mm (ISO 606 roller chain). The same drivetrain as CycleClear and ForceClear.
//  - bench: every machine drives a Prony brake (Gaspard de Prony, 1821): a band clamped on a drum, with
//    an arm 0.5 m long pressing on a scale. The arm can't turn, so the scale feels F = τ ÷ 0.5 m.
//      car: a representative 1.2 L petrol four, like Maruti Suzuki's K12 family: about 113 N·m at
//      4,400 rpm and about 66 kW (90 PS) at 6,000 rpm (maker specs, rounded). The curve between the
//      published points is typical, not measured.
//      motorcycle: MotorcycleClear's 150 cc single: 13.25 N·m at 6,500 rpm, 10.3 kW at 8,500 rpm.
//      mixer: a 750 W universal motor on speed 3 (see MixerClear): torque falls about in a straight line
//      from about 1 N·m at stall to 0 at 20,000 rpm; about 0.36 N·m at 12,800 rpm on a full jar.
//      ceiling fan: a 16-pole induction motor on 50 Hz, field speed 375 rpm (see FanClear). Kloss's
//      formula T = 2 T_max ÷ (s/s_m + s_m/s) with T_max 2.5 N·m and s_m 0.3, which gives about 1.1 N·m
//      at 350 rpm, about 40 W at the shaft from about 75 W at the plug (an estimate).
//  - power P = τ ω, with ω in rad/s = rpm × 2π ÷ 60. kW = N·m × rpm ÷ 9,549.
import { THREE, M, box, clamp } from '../kit.js';
import {
  D2R, TAU, board, panelBg, title, axes, dot, line, COL, HEX, force, stick, twist, makeGear, dashes,
  fitNarrow, reelBoards, homeBoard, inReel, fmtN, fmtNm, fmtW, niceMax, PS,
} from '../torque.js';

const EX = 40, CR = 0.17, WR = 0.34, ETA = 0.97, ARM = 0.5, SF = 0.0004;
const pitchR = (n) => 0.0127 / (2 * Math.sin(Math.PI / n));
const C = [0, 0.3, 0], HUB = [-0.43, WR, 0];
const VIEWS = {
  bike: { pos: [-0.3, 0.85, 2.15], target: [-0.38, 0.56, 0] },
  bench: { pos: [EX + 0.0, 1.25, 2.45], target: [EX - 0.08, 0.74, 0] },
};
function interp(table, x) {
  if (x <= table[0][0]) return table[0][1];
  const n = table.length; if (x >= table[n - 1][0]) return table[n - 1][1];
  let i = 1; while (table[i][0] < x) i++;
  const [x0, y0] = table[i - 1], [x1, y1] = table[i], k = (x - x0) / (x1 - x0);
  return y0 + (y1 - y0) * (k * k * (3 - 2 * k) * 0.35 + k * 0.65);
}
const CAR = [[1000, 80], [1500, 88], [2000, 96], [2500, 102], [3000, 106], [3500, 109], [4000, 112], [4400, 113], [5000, 111], [5500, 108], [6000, 105], [6500, 97]];
const MOTO = [[1500, 9.0], [2500, 10.3], [3500, 11.4], [4500, 12.3], [5500, 12.9], [6500, 13.25], [7500, 12.7], [8500, 11.57], [9500, 10.0], [10000, 9.0]];
export const MACHINES = {
  car: { name: '1.2 L car engine', lo: 1000, hi: 6500, T: (n) => interp(CAR, n), drum: 0.16, ref: 120 },
  moto: { name: '150 cc motorcycle', lo: 1500, hi: 10000, T: (n) => interp(MOTO, n), drum: 0.11, ref: 14 },
  mixer: { name: '750 W mixer motor', lo: 2000, hi: 19500, T: (n) => 1.0 * (1 - n / 20000), drum: 0.05, ref: 1 },
  fan: { name: 'ceiling fan motor', lo: 100, hi: 370, T: (n) => { const sl = Math.max(1e-3, 1 - n / 375); return (2 * 2.5) / (sl / 0.3 + 0.3 / sl); }, drum: 0.09, ref: 2.5 },
};
export const rpmOf = (s) => { const m = MACHINES[s.mach]; return m.lo + (m.hi - m.lo) * s.sp; };
export function bench(s) {
  const m = MACHINES[s.mach], n = rpmOf(s), T = m.T(n), w = (n * TAU) / 60;
  return { m, n, T, w, P: T * w, F: T / ARM };
}
export function bike(s, phi) {
  const ratio = s.cog / s.ring, peak = s.F * CR, now = s.F * CR * Math.abs(Math.sin(phi));
  const wheel = (t) => t * ratio * ETA;
  return { ratio, peak, avg: (peak * 2) / Math.PI, now, wheelNow: wheel(now), wheelAvg: wheel((peak * 2) / Math.PI), push: wheel(now) / WR, pushAvg: wheel((peak * 2) / Math.PI) / WR };
}

export default {
  id: 'machines',
  short: 'Machines',
  title: 'Machines that turn',
  subtitle: 'Pedals and gears, engines on a test bench, a mixer and a ceiling fan.',
  view: VIEWS.bike,
  learn: `<p>Most machines deliver their work by <b>turning</b>, so their strength is a torque. On a bicycle your foot pushes on a <b>crank</b> 17 cm long. Push down with 400 N when the crank is level and you apply 400 × 0.17 = <b>68 N·m</b>. At the top and bottom the crank points along your push, so the torque drops to zero: that’s why your legs take turns.</p>
    <p>The chain carries that torque to the back wheel. The <b>gears</b> change it: a rear cog with more teeth than the chainring turns the wheel with <b>more torque but fewer turns</b>. That is why a low gear helps you climb (see CycleClear). The wheel’s torque divided by its radius is the push of the tyre on the road.</p>
    <p>Engines are tested on a <b>brake</b>: a band grips a drum on the shaft and a lever arm presses on a scale. Torque = scale force × arm length. A typical <b>1.2 litre car engine</b> makes about <b>113 N·m</b>, a 150 cc motorcycle about 13 N·m, a mixer grinder’s motor under 1 N·m and a ceiling fan’s about 1 N·m.</p>
    <p>So why is the mixer so powerful? <b>Power = torque × spin speed</b>, P = τ ω, with ω in radians per second. The mixer spins at over 12,000 rpm, so a small torque still gives hundreds of watts. The car engine’s power peaks at about 66 kW near 6,000 rpm, even though its torque peaks lower down (see CarClear, MotorcycleClear, MixerClear and FanClear).</p>
    <p class="tip"><b>Try it:</b> watch the torque board as the crank goes round, then change gears and see the push at the road change. On the test bench, sweep the speed and find where the torque peaks and where the power peaks.</p>`,
  terms: [
    { t: 'Crank', d: 'An arm that turns a push into a torque on a shaft: the pedal arm, or the crankshaft in an engine.' },
    { t: 'Gear ratio', d: 'Teeth on the driven gear ÷ teeth on the driving gear. It multiplies torque and divides speed.' },
    { t: 'Angular speed (ω)', d: 'How fast something turns, in radians per second. 1 rpm = 2π ÷ 60 rad/s.' },
    { t: 'Power = τ ω', d: 'For anything that turns, power is torque × angular speed.' },
    { t: 'Dynamometer', d: 'A test machine that measures an engine’s torque, often with a brake and a lever arm on a scale.' },
    { t: 'rpm', d: 'Revolutions per minute: how many times a shaft turns each minute.' },
  ],
  defaults: { focus: 'bike', F: 400, ring: 42, cog: 20, mach: 'car', sp: 0.6 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'bike', label: 'Bicycle' }, { v: 'bench', label: 'Test bench' }] },
    { key: 'F', type: 'range', label: 'Bicycle: foot pushes down', min: 0, max: 800, step: 10, ends: ['0 N', '800 N'], fmt: (v) => v + ' N', hint: 'Standing on the pedal gives about your weight: 500–700 N.' },
    { key: 'ring', type: 'seg', label: 'Bicycle: chainring teeth', options: [34, 42, 50].map((v) => ({ v, label: String(v) })) },
    { key: 'cog', type: 'seg', label: 'Bicycle: rear cog teeth', options: [14, 20, 28, 34].map((v) => ({ v, label: String(v) })) },
    { key: 'mach', type: 'seg', label: 'Test bench: machine', options: [{ v: 'car', label: 'Car' }, { v: 'moto', label: 'Motorcycle' }, { v: 'mixer', label: 'Mixer' }, { v: 'fan', label: 'Ceiling fan' }] },
    { key: 'sp', type: 'range', label: 'Test bench: speed', min: 0, max: 1, step: 0.01, ends: ['slow', 'fast'], fmt: (v, s) => Math.round(rpmOf(s)).toLocaleString('en-IN') + ' rpm' },
    { key: 'go', type: 'buttons', label: 'Try these', items: [
      { label: 'Climbing gear, 34 : 34', act: (s) => Object.assign(s, { focus: 'bike', ring: 34, cog: 34 }) },
      { label: 'Racing gear, 50 : 14', act: (s) => Object.assign(s, { focus: 'bike', ring: 50, cog: 14 }) },
      { label: 'Car at peak torque', act: (s) => Object.assign(s, { focus: 'bench', mach: 'car', sp: (4400 - 1000) / 5500 }) },
      { label: 'Car at peak power', act: (s) => Object.assign(s, { focus: 'bench', mach: 'car', sp: 5000 / 5500 }) },
    ] },
  ],
  onChange(s, key) {
    if (['F', 'ring', 'cog'].includes(key)) s.focus = 'bike';
    if (['mach', 'sp'].includes(key)) s.focus = 'bench';
  },
  quiz: [
    { q: 'You stand with 600 N on a 0.17 m crank when it is level. What torque do you apply?', options: ['102 N·m', '600 N·m', '3,529 N·m', '17 N·m'], answer: 0, why: 'τ = F × r = 600 N × 0.17 m = 102 N·m. At the top or bottom of the turn it would be zero.' },
    { q: 'A 34-tooth chainring drives a 34-tooth rear cog. What happens compared with a 14-tooth cog?', options: ['Less torque at the wheel, more speed', 'About 2.4 times the torque at the wheel, but the wheel turns 2.4 times fewer times', 'The same torque and speed', 'The chain gets shorter'], answer: 1, why: 'Wheel torque = crank torque × cog ÷ ring. 34 ÷ 14 ≈ 2.4, so a bigger cog multiplies torque, and you pay with fewer wheel turns per pedal turn.' },
    { q: 'A mixer motor makes only 0.36 N·m but runs at 12,800 rpm (about 1,340 rad/s). About how much power is that?', options: ['0.36 W', '36 W', 'About 480 W', '12,800 W'], answer: 2, why: 'P = τ ω = 0.36 × 1,340 ≈ 480 W. Small torque, huge speed.' },
  ],
  reel: [
    { ms: 5400, caption: 'Push down on a 17 cm crank and you make torque. A bigger rear cog multiplies it at the wheel.', set: { focus: 'bike', ring: 34, cog: 28 }, anim: { F: [200, 650] }, view: { pos: [-0.25, 0.7, 1.15], target: [-0.25, 0.4, 0] }, spin: 0 },
    { ms: 5600, caption: 'Power is torque times spin speed: a 1.2 litre engine peaks at 113 N·m, and about 66 kW near 6,000 rpm.', set: { focus: 'bench', mach: 'car' }, anim: { sp: [0.05, 0.92] }, view: { pos: [EX + 0.15, 0.95, 1.55], target: [EX + 0.1, 0.55, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gB = new THREE.Group(), gE = new THREE.Group(); gE.position.x = EX; root.add(gB, gE);
    const steel = M.metal(0x9aa3b2), dark = M.matte(0x22252c);

    // ================================================================ bicycle drivetrain (right side view)
    const road = box(2.2, 0.02, 0.6, M.matte(0x2b2f36)); road.position.set(-0.2, -0.01, 0); gB.add(road);
    const wheel = new THREE.Group(); wheel.position.set(...HUB); gB.add(wheel);
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(WR - 0.016, 0.016, 10, 64), M.matte(0x16181d)); wheel.add(tyre);
    const rimW = new THREE.Mesh(new THREE.TorusGeometry(WR - 0.04, 0.008, 8, 64), M.metal(0x9aa3b2)); wheel.add(rimW);
    for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; const sp = stick(0.0015, steel); sp.between([0, 0, 0], [Math.cos(a) * (WR - 0.045), Math.sin(a) * (WR - 0.045), 0]); wheel.add(sp); }
    const stays = [stick(0.012, M.plastic(0x3b6fd8)), stick(0.012, M.plastic(0x3b6fd8)), stick(0.014, M.plastic(0x3b6fd8))]; stays.forEach((st) => gB.add(st));
    stays[0].between([HUB[0], HUB[1], -0.05], [C[0], C[1], -0.05]); stays[1].between([HUB[0], HUB[1], -0.05], [-0.1, 0.8, -0.05]); stays[2].between([C[0], C[1], -0.05], [-0.1, 0.8, -0.05]);
    let ringG = null, cogG = null, ringN = 0, cogN = 0;
    const chainTop = stick(0.004, M.metal(0x6b7280)), chainBot = stick(0.004, M.metal(0x6b7280)); gB.add(chainTop, chainBot);
    const cranks = new THREE.Group(); cranks.position.set(C[0], C[1], 0); gB.add(cranks);
    const armR = box(0.022, CR, 0.012, steel); armR.position.set(0, CR / 2, 0.05); cranks.add(armR);
    const armL = box(0.022, CR, 0.012, M.metal(0x6b7280)); armL.position.set(0, -CR / 2, -0.07); cranks.add(armL);
    const pedR = box(0.1, 0.02, 0.08, dark), pedL = box(0.1, 0.02, 0.08, dark); gB.add(pedR, pedL);
    const shoe = box(0.26, 0.06, 0.09, M.matte(0xd8332f)); gB.add(shoe);
    const aFR = force(HEX.push, 0.01, 0.045), aFL = force(HEX.push, 0.01, 0.045); gB.add(aFR, aFL);
    const armDash = dashes(10, 0.003, M.glow(0x5ce1a9)); gB.add(armDash);
    const twC = twist(HEX.acc, 0.07, 0.006); twC.start = Math.PI * 0.4; twC.position.set(C[0], C[1], 0.1); gB.add(twC);
    const twW = twist(HEX.pull, 0.08, 0.006); twW.start = Math.PI * 0.4; twW.position.set(HUB[0], HUB[1], 0.08); gB.add(twW);
    const aRoad = force(HEX.acc, 0.01, 0.045); gB.add(aRoad);
    const lF = stage.label('', [0, 0, 0], gB, 'hot'), lC = stage.label('', [0, 0, 0], gB, 'hot'), lW = stage.label('', [0, 0, 0], gB, 'hot'), lRoad = stage.label('', [0, 0, 0], gB, 'hot');
    lF.element.style.setProperty('--c', COL.push); lC.element.style.setProperty('--c', COL.acc); lW.element.style.setProperty('--c', COL.pull); lRoad.element.style.setProperty('--c', COL.acc);
    const setGears = (ring, cog) => {
      if (ringG) { gB.remove(ringG); gB.remove(cogG); }
      ringG = makeGear(pitchR(ring), ring, 0.004, 0xb9bec8); ringG.position.set(C[0], C[1], 0.03); gB.add(ringG);
      cogG = makeGear(pitchR(cog), cog, 0.004, 0x8c95a3); cogG.position.set(HUB[0], HUB[1], 0.03); gB.add(cogG);
      const r1 = pitchR(ring), r2 = pitchR(cog);
      chainTop.between([C[0], C[1] + r1, 0.03], [HUB[0], HUB[1] + r2, 0.03]);
      chainBot.between([C[0], C[1] - r1, 0.03], [HUB[0], HUB[1] - r2, 0.03]);
      ringN = ring; cogN = cog;
    };

    // ================================================================ test bench: a Prony brake
    const bed = box(1.5, 0.06, 0.7, M.matte(0x3a3f4b)); bed.position.set(0.1, 0.03, -0.1); gE.add(bed);
    const bodies = {
      car: (() => { const g = new THREE.Group(); const b = box(0.55, 0.45, 0.42, M.metal(0x7a8290, { roughness: 0.5 })); b.position.set(0, 0.5, -0.35); g.add(b); const head = box(0.5, 0.12, 0.36, M.metal(0x4a5260)); head.position.set(0, 0.78, -0.35); g.add(head); return g; })(),
      moto: (() => { const g = new THREE.Group(); const b = box(0.28, 0.3, 0.3, M.metal(0x7a8290, { roughness: 0.5 })); b.position.set(0, 0.5, -0.3); g.add(b); for (let i = 0; i < 6; i++) { const f = box(0.34, 0.012, 0.34, M.metal(0x9aa3b2)); f.position.set(0, 0.68 + i * 0.03, -0.3); g.add(f); } return g; })(),
      mixer: (() => { const g = new THREE.Group(); const b = box(0.24, 0.18, 0.2, M.plastic(0xf2f2f2)); b.position.set(0, 0.55, -0.22); g.add(b); return g; })(),
      fan: (() => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 32), M.plastic(0xe8e2c8)); b.rotation.x = Math.PI / 2; b.position.set(0, 0.55, -0.18); g.add(b); return g; })(),
    };
    Object.values(bodies).forEach((b) => gE.add(b));
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 16), steel); shaft.rotation.x = Math.PI / 2; shaft.position.set(0, 0.55, -0.05); gE.add(shaft);
    const drum = new THREE.Group(); drum.position.set(0, 0.55, 0.1); gE.add(drum);
    const drumM = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.06, 40), M.metal(0xb9bec8)); drumM.rotation.x = Math.PI / 2; drum.add(drumM);
    const stripe = box(0.2, 1.6, 0.064, M.glow(0xff7a59)); drum.add(stripe);
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.05, 8, 40), M.matte(0x5a3a22)); gE.add(band);
    const brakeArm = box(1, 0.03, 0.03, M.metal(0x6b7280)); gE.add(brakeArm);
    const scaleB = box(0.16, 0.12, 0.16, M.plastic(0x3b82f6)); gE.add(scaleB);
    const dialC = document.createElement('canvas'); dialC.width = 256; dialC.height = 128;
    const dialT = new THREE.CanvasTexture(dialC); dialT.colorSpace = THREE.SRGBColorSpace;
    const dial = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.075), new THREE.MeshBasicMaterial({ map: dialT, toneMapped: false })); gE.add(dial);
    const post = box(0.03, 0.4, 0.03, dark); gE.add(post);
    const twE = twist(HEX.acc, 0.2, 0.01); twE.start = Math.PI * 0.6; gE.add(twE);
    const aScale = force(HEX.push, 0.012, 0.05); gE.add(aScale);
    const lT = stage.label('', [0, 0, 0], gE, 'hot'), lS = stage.label('', [0, 0, 0], gE, 'hot'), lArmE = stage.label('arm 0.5 m', [0, 0, 0], gE), lName = stage.label('', [0, 0, 0], gE);
    lT.element.style.setProperty('--c', COL.acc); lS.element.style.setProperty('--c', COL.push);

    // ================================================================ board
    let cur = null;
    const bd = board(root, 1.6, 0.95, 900, 520, (g, w, h) => {
      panelBg(g, w, h); if (!cur) return;
      const { s } = cur;
      if (s.focus === 'bike') {
        const b = bike(s, cur.phi);
        title(g, 'Crank torque through one turn', 'both legs, τ = F L |sin φ|');
        const yMax = niceMax(Math.max(20, s.F * CR * 1.15));
        const { X, Y } = axes(g, w, h, { x0: 90, xMax: 360, yMax, xTicks: [0, 90, 180, 270, 360], yTicks: [0, yMax / 2, yMax], y1: 110, xFmt: (v) => v + '°', yFmt: (v) => String(Math.round(v)), xLabel: 'crank angle from the top →', yLabel: 'torque, N·m ↑' });
        const pts = []; for (let a = 0; a <= 360; a += 4) pts.push([a, s.F * CR * Math.abs(Math.sin(a * D2R))]);
        line(g, pts, X, Y, COL.acc, 5);
        g.strokeStyle = 'rgba(255,255,255,.5)'; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(0), Y(b.avg)); g.lineTo(X(360), Y(b.avg)); g.stroke(); g.setLineDash([]);
        g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '17px sans-serif'; g.fillText(`average ${fmtNm(b.avg)}`, X(270) + 8, Y(b.avg) - 8);
        const a = ((cur.phi / D2R) % 360 + 360) % 360;
        dot(g, X(a), Y(b.now), COL.acc, 10);
        g.fillStyle = '#fff'; g.font = 'bold 22px sans-serif'; g.fillText(`wheel torque ${fmtNm(b.wheelNow)} · road push ${fmtN(b.push)}`, 100, 66);
      } else {
        const r = bench(s), m = r.m;
        title(g, `${m.name}: torque and power`, 'P = τ ω');
        let tMax = 0, pMax = 0; const pts = [], pp = [];
        for (let k = 0; k <= 60; k++) { const n = m.lo + ((m.hi - m.lo) * k) / 60, T = m.T(n), P = (T * n * TAU) / 60; pts.push([n, T]); pp.push([n, P]); tMax = Math.max(tMax, T); pMax = Math.max(pMax, P); }
        const yMax = niceMax(tMax * 1.15), pScale = yMax / niceMax(pMax * 1.15), pTop = niceMax(pMax * 1.15);
        const { X, Y } = axes(g, w, h, { x0: 90, x1: w - 100, y1: 110, xMin: 0, xMax: niceMax(m.hi), yMax, xTicks: [0, niceMax(m.hi) / 2, niceMax(m.hi)], yTicks: [0, yMax / 2, yMax], xFmt: (v) => Math.round(v).toLocaleString('en-IN'), yFmt: (v) => (yMax < 5 ? v.toFixed(1) : String(Math.round(v))), xLabel: 'rpm →', yLabel: 'torque, N·m ↑' });
        line(g, pts, X, Y, COL.acc, 5);
        line(g, pp.map(([n, P]) => [n, P * pScale]), X, Y, COL.push, 4, [10, 6]);
        g.fillStyle = COL.push; g.font = '17px sans-serif';
        for (const t of [0, 0.5, 1]) { const v = pTop * t, s2 = fmtW(v); g.fillText(s2, w - 92, Y(v * pScale) + 6); }
        g.fillText('power ↑', w - 92, 84);
        dot(g, X(r.n), Y(r.T), COL.acc, 10); dot(g, X(r.n), Y(r.P * pScale), COL.push, 8);
        g.fillStyle = '#fff'; g.font = 'bold 22px sans-serif'; g.fillText(`${fmtNm(r.T)} × ${Math.round(r.w)} rad/s = ${fmtW(r.P)}`, 100, 66);
      }
    }, [0, 0, 0]);

    let focus = '', mach = '', key = '', phi = 0, spinA = 0;
    return {
      update(dt, s) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, [lW, lArmE, lName]);
        if (s.focus !== focus) {
          focus = s.focus; gB.visible = focus === 'bike'; gE.visible = focus === 'bench';
          if (focus === 'bike') homeBoard(bd, [0.5, 0.82, -0.5], -0.35, 0.6); else homeBoard(bd, [EX + 0.85, 1.0, -0.6], -0.35, 0.7);
          if (!inReel()) { const v = VIEWS[focus]; stage.setView(v.pos, v.target, 1.0); }
        }
        reelBoards([[bd, focus === 'bike' ? [-0.2, 1.2, -0.3] : [EX + 0.1, 1.5, -0.4], focus === 'bike' ? 0.6 : 0.85]]);

        if (focus === 'bike') {
          if (s.ring !== ringN || s.cog !== cogN) setGears(s.ring, s.cog);
          phi += dt * Math.PI * 0.6;                                     // shown slowly: about 18 rpm
          cranks.rotation.z = -phi; ringG.rotation.z = -phi;
          const wA = -phi * (s.ring / s.cog); cogG.rotation.z = wA; wheel.rotation.z = wA;
          const pR = [C[0] + CR * Math.sin(phi), C[1] + CR * Math.cos(phi)], pL = [C[0] - CR * Math.sin(phi), C[1] - CR * Math.cos(phi)];
          pedR.position.set(pR[0], pR[1], 0.1); pedL.position.set(pL[0], pL[1], -0.12);
          const drive = Math.sin(phi) >= 0 ? pR : pL, zR = Math.sin(phi) >= 0 ? 0.1 : -0.12;
          shoe.position.set(drive[0] + 0.04, drive[1] + 0.04, zR);
          const L = s.F * SF;
          aFR.aim([pR[0], pR[1] + 0.07 + L, 0.1], [0, -1, 0], L); aFR.visible = Math.sin(phi) > 0.02 && s.F > 5;
          aFL.aim([pL[0], pL[1] + 0.07 + L, -0.12], [0, -1, 0], L); aFL.visible = Math.sin(phi) < -0.02 && s.F > 5;
          armDash.between([C[0], C[1], 0.12], [drive[0], C[1], 0.12]);
          const b = bike(s, phi);
          twC.set(-(b.now / 200) * 1.6 * Math.PI);
          twW.set(-(b.wheelNow / 300) * 1.6 * Math.PI);
          aRoad.aim([HUB[0] - 0.05, 0.02, 0.12], [1, 0, 0], b.push * 0.0006); aRoad.visible = b.push > 5;
          lF.position.set(drive[0] + 0.06, drive[1] + 0.12 + L, zR); lF.element.innerHTML = `foot <b>${fmtN(s.F)}</b>`; lF.visible = s.F > 5;
          lC.position.set(C[0] + 0.05, C[1] - 0.2, 0.1); lC.element.innerHTML = `crank <b>${fmtNm(b.now)}</b>`;
          lW.position.set(HUB[0], HUB[1] + WR + 0.07, 0.05); lW.element.innerHTML = `wheel ${fmtNm(b.wheelNow)}`;
          lRoad.position.set(HUB[0] + 0.12, -0.06, 0.12); lRoad.element.innerHTML = `road push <b>${fmtN(b.push)}</b>`;
          cur = { s, phi };
          const kk = `b|${s.F}|${s.ring}|${s.cog}|${Math.round(phi * 20)}`;
          if (kk !== key) { key = kk; bd.redraw(); }
        } else {
          const r = bench(s), m = r.m;
          if (s.mach !== mach) { mach = s.mach; Object.entries(bodies).forEach(([k, b]) => { b.visible = k === mach; }); key = ''; }
          const R = m.drum;
          drum.scale.set(R, R, 1); band.scale.setScalar(R); band.position.set(0, 0.55, 0.1);
          spinA -= dt * Math.min(r.w, 40) * 0.25;                          // shown far slower than real
          drum.rotation.z = spinA;
          const armY = 0.55 + R + 0.02;
          brakeArm.scale.x = ARM; brakeArm.position.set(ARM / 2, armY, 0.1);
          const sx = ARM, sy = 0.06 + 0.06;
          scaleB.position.set(sx, sy + 0.0, 0.1); post.scale.y = (armY - sy - 0.08) / 0.4; post.position.set(sx, sy + 0.06 + (armY - sy - 0.08) / 2, 0.1);
          dial.position.set(sx, sy, 0.181);
          twE.position.set(0, 0.55, 0.16); twE.set(-1.3 * Math.PI * clamp(r.T / m.ref, 0.05, 1));
          aScale.aim([sx - 0.04, armY + 0.02 + 0.15, 0.14], [0, -1, 0], 0.15);
          const kg = r.F / 9.81;
          { const x = dialC.getContext('2d'); x.fillStyle = '#e8f0ff'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#111'; x.font = 'bold 44px sans-serif'; const t = kg >= 1 ? kg.toFixed(1) + ' kg' : Math.round(kg * 1000) + ' g'; x.fillText(t, 128 - x.measureText(t).width / 2, 80); dialT.needsUpdate = true; }
          lT.position.set(0.05, 0.3, 0.3); lT.element.innerHTML = `torque <b>${fmtNm(r.T)}</b> at ${Math.round(r.n).toLocaleString('en-IN')} rpm`;
          lS.position.set(sx + 0.05, armY + 0.25, 0.1); lS.element.innerHTML = `scale feels <b>${fmtN(r.F)}</b>`;
          lArmE.position.set(ARM / 2, armY - 0.07, 0.15);
          lName.position.set(-0.1, 0.12, 0.35); lName.element.innerHTML = m.name;
          cur = { s };
          const kk = `e|${s.mach}|${s.sp}`;
          if (kk !== key) { key = kk; bd.redraw(); }
        }
        void narrow;
      },
      readout: (s) => {
        if (s.focus === 'bike') {
          const b = bike(s, Math.PI / 2);
          return `<div class="big">Crank: up to ${fmtNm(b.peak)}</div>
            <div class="row"><span>Foot push × crank, level</span><b>${s.F} N × 0.17 m</b></div>
            <div class="row"><span>Average over a turn, × 2/π</span><b>${fmtNm(b.avg)}</b></div>
            <div class="row"><span>Gear: cog ÷ ring</span><b>${s.cog} ÷ ${s.ring} = ${b.ratio.toFixed(2)}</b></div>
            <div class="row"><span>Wheel torque, average</span><b>${fmtNm(b.wheelAvg)}</b></div>
            <div class="row"><span>Tyre push on the road, average</span><b>${fmtN(b.pushAvg)}</b></div>
            <small>Bigger cog: more wheel torque, fewer wheel turns.</small>`;
        }
        const r = bench(s), kw = r.P / 1000;
        return `<div class="big">P = τ ω = ${fmtW(r.P)}</div>
          <div class="row"><span>Torque τ</span><b>${fmtNm(r.T)}</b></div>
          <div class="row"><span>Speed</span><b>${Math.round(r.n).toLocaleString('en-IN')} rpm = ${Math.round(r.w).toLocaleString('en-IN')} rad/s</b></div>
          <div class="row"><span>Scale, τ ÷ 0.5 m</span><b>${fmtN(r.F)}</b></div>
          ${kw > 1 ? `<div class="row"><span>In horsepower (PS)</span><b>${((r.P) / PS).toFixed(0)} PS</b></div>` : ''}
          <small>${s.mach === 'car' ? 'Peak torque 113 N·m near 4,400 rpm; peak power 66 kW near 6,000 rpm.' : s.mach === 'moto' ? 'Peak torque 13.25 N·m at 6,500 rpm; peak power 10.3 kW at 8,500 rpm.' : s.mach === 'mixer' ? 'Tiny torque, huge speed: hundreds of watts.' : 'About 1 N·m at 350 rpm moves a roomful of air.'}</small>`;
      },
    };
  },
};
