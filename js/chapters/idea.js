// Chapter 1: torque as a quantity.
// Torque τ = F × r × sin θ: the force times its distance from the pivot, counting only the part of the
// force at right angles to the lever (equally, F times the perpendicular distance from the pivot to the
// force's line of action, r sin θ). SI unit the newton-metre, N·m (SI Brochure, BIPM, 9th ed. 2019,
// table 4, which notes the N·m is not written as J for torque).
//  - spanner: a ring spanner, 45 cm long, on a stuck wheel nut. Car wheel nuts are typically tightened
//    to about 80–130 N·m (owner's manuals: e.g. Honda 108 N·m, Toyota 103 N·m, Maruti Suzuki about
//    85–100 N·m); undoing one takes a little more than it was tightened to, so the default breakaway
//    torque is 110 N·m. Below it the nut does not move; above it the nut turns.
//  - door: a 25 kg door 0.9 m wide swinging on its hinges. As a flat slab about one edge,
//    I = m w² ÷ 3 = 6.75 kg·m². Hinge friction is taken as about 1 N·m (an estimate). With the push
//    kept at right angles as it swings, α = (τ − τ_f) ÷ I, so the time to open 90° is √(2 × π/2 ÷ α).
//    (τ = I α is the turning version of F = m a; chapter 5 and InertiaClear say more.)
import { THREE, M, box, clamp } from '../kit.js';
import {
  D2R, board, panelBg, title, axes, dot, COL, HEX, force, stick, twist, makeNut, makeSpanner, makePerson, dashes,
  fitNarrow, reelBoards, homeBoard, inReel, fmtN, fmtNm, niceMax,
} from '../torque.js';

const DX = 40, P = [0.12, 0.35, 0.06], S = 0.0008, SD = 0.02;
const DOOR = { m: 25, w: 0.9, h: 2.0, fr: 1.0 };
DOOR.I = (DOOR.m * DOOR.w * DOOR.w) / 3;
const VIEWS = {
  spanner: { pos: [-0.02, 0.78, 1.4], target: [0.08, 0.5, 0] },
  door: { pos: [DX + 1.3, 2.9, 3.4], target: [DX + 0.05, 0.9, -0.35] },
};
export const tauOf = (s) => (s.mode === 'door' ? s.Fd * s.rd : s.F * s.r) * Math.sin(s.th * D2R);
const doorTime = (tau) => (tau > DOOR.fr ? Math.sqrt((2 * (Math.PI / 2) * DOOR.I) / (tau - DOOR.fr)) : Infinity);

export default {
  id: 'idea',
  short: 'Force × distance',
  title: 'Torque is a turning force',
  subtitle: 'Undo a stuck nut and open a door, and see why the distance matters as much as the push.',
  view: VIEWS.spanner,
  learn: `<p>A force can push something along, but it can also make it <b>turn</b>. The turning effect of a force is called <b>torque</b> (also the <b>moment</b> of a force). It depends on two things: how hard you push, and <b>how far from the pivot</b> you push. <b>τ = F × r</b>.</p>
    <p>Torque is measured in <b>newton-metres</b> (N·m). Push with 100 N on a spanner 0.5 m from the nut and you apply 50 N·m. Push with the same 100 N only 0.1 m from the nut and you get just 10 N·m. That is why spanners have long handles and door handles sit far from the hinges.</p>
    <p>Only the part of the push <b>at right angles</b> to the spanner turns it. Push at an angle θ and <b>τ = F r sin θ</b>. Push straight along the handle, towards or away from the nut, and there is no torque at all. Another way to see it: torque is the force times the <b>lever arm</b>, the shortest distance from the pivot to the line the force acts along.</p>
    <p>A stuck nut is held by friction in its threads. It won’t move until your torque beats its <b>breakaway torque</b>. Then it turns. Torque is to turning what force is to moving, so it sits right next to Newton’s laws (see NewtonClear and ForceClear).</p>
    <p class="tip"><b>Try it:</b> slide your hand towards the nut and watch the torque fall until the nut stops turning. Then tilt the push and see the green lever arm shrink. On the door, push with the same force near the hinge and at the handle, and time the swing.</p>`,
  terms: [
    { t: 'Torque (τ)', d: 'The turning effect of a force: force × distance from the pivot, at right angles.' },
    { t: 'Newton-metre (N·m)', d: 'The unit of torque: 1 newton pushing at right angles 1 metre from the pivot.' },
    { t: 'Pivot (axis)', d: 'The point or line that something turns about: a nut’s bolt, a door’s hinges.' },
    { t: 'Lever arm', d: 'The shortest distance from the pivot to the line of the force, r sin θ.' },
    { t: 'Moment', d: 'Another name for the turning effect of a force, used in school physics and engineering.' },
    { t: 'Breakaway torque', d: 'The torque needed to start a stuck nut or bolt turning.' },
  ],
  defaults: { mode: 'spanner', F: 250, r: 0.4, th: 90, brk: 110, Fd: 20, rd: 0.8 },
  controls: [
    { key: 'mode', type: 'seg', label: 'Experiment', options: [{ v: 'spanner', label: 'Spanner on a nut' }, { v: 'door', label: 'Open a door' }] },
    { key: 'F', type: 'range', label: 'Spanner: your push F', min: 0, max: 600, step: 10, ends: ['0 N', '600 N'], fmt: (v) => v + ' N', hint: 'About 250 N is a firm push. 600 N is standing on it.' },
    { key: 'r', type: 'range', label: 'Spanner: hand distance r', min: 0.05, max: 0.43, step: 0.01, ends: ['near the nut', 'end of the handle'], fmt: (v) => (v * 100).toFixed(0) + ' cm' },
    { key: 'th', type: 'range', label: 'Angle of the push θ', min: 5, max: 90, step: 1, ends: ['along the handle', 'right angles'], fmt: (v) => v + '°' },
    { key: 'brk', type: 'range', label: 'Spanner: nut’s breakaway torque', min: 20, max: 200, step: 5, ends: ['20 N·m', '200 N·m'], fmt: (v) => v + ' N·m' },
    { key: 'Fd', type: 'range', label: 'Door: your push', min: 2, max: 60, step: 1, ends: ['2 N', '60 N'], fmt: (v) => v + ' N' },
    { key: 'rd', type: 'range', label: 'Door: distance from the hinge', min: 0.05, max: 0.85, step: 0.01, ends: ['at the hinge', 'at the handle'], fmt: (v) => (v * 100).toFixed(0) + ' cm' },
    { key: 'go', type: 'buttons', label: 'Try these', items: [
      { label: 'Hand at the end', act: (s) => Object.assign(s, { mode: 'spanner', F: 250, r: 0.43, th: 90 }) },
      { label: 'Hand near the nut', act: (s) => Object.assign(s, { mode: 'spanner', F: 250, r: 0.15, th: 90 }) },
      { label: 'Push at a slant', act: (s) => Object.assign(s, { mode: 'spanner', F: 300, r: 0.43, th: 40 }) },
      { label: 'Door at the handle', act: (s) => Object.assign(s, { mode: 'door', Fd: 20, rd: 0.8, th: 90 }) },
      { label: 'Door near the hinge', act: (s) => Object.assign(s, { mode: 'door', Fd: 20, rd: 0.1, th: 90 }) },
    ] },
  ],
  onChange(s, key) {
    if (['F', 'r', 'brk'].includes(key)) s.mode = 'spanner';
    if (['Fd', 'rd'].includes(key)) s.mode = 'door';
  },
  quiz: [
    { q: 'You push with 200 N at right angles on a spanner, 0.3 m from the nut. What torque do you apply?', options: ['60 N·m', '666 N·m', '200 N·m', '0.0015 N·m'], answer: 0, why: 'Torque = force × distance = 200 N × 0.3 m = 60 N·m.' },
    { q: 'Why is a door handle put on the side far from the hinges?', options: ['It looks better', 'The same push gives more torque further from the pivot', 'Doors are heavier near the hinges', 'So the door opens more slowly'], answer: 1, why: 'τ = F × r. Pushing about 8 times further from the hinge gives about 8 times the torque for the same force, so the door swings open easily.' },
    { q: 'You push along the spanner’s handle, straight towards the nut. What happens?', options: ['Maximum torque', 'Half the torque', 'No torque: the force points through the pivot', 'The nut tightens'], answer: 2, why: 'The force’s line passes through the pivot, so its lever arm is zero. τ = F r sin 0° = 0. Only the part at right angles turns anything.' },
  ],
  reel: [
    { ms: 5400, caption: 'Torque is force times distance: push harder, or further from the nut, and it turns.', set: { mode: 'spanner', r: 0.43, th: 90, brk: 110 }, anim: { F: [60, 330] }, view: { pos: [0.02, 0.66, 1.2], target: [0.02, 0.5, 0] }, spin: 0 },
    { ms: 5400, caption: 'The same push near a door’s hinge barely moves it. At the handle, it swings.', set: { mode: 'door', Fd: 15, th: 90, rd: 0.08 }, anim: { rd: [0.08, 0.85] }, view: { pos: [DX + 0.8, 2.6, 1.7], target: [DX + 0.3, 1.1, -0.3] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gS = new THREE.Group(), gD = new THREE.Group();
    gD.position.x = DX; root.add(gS, gD);
    const steel = M.metal(0x9aa3b2), dark = M.matte(0x22252c);

    // ================================================================ spanner on a wheel nut
    const P3 = new THREE.Vector3(...P);
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.085, 16, 48), M.matte(0x16181d)); tyre.position.set(P[0], P[1], -0.06); tyre.castShadow = true; gS.add(tyre);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 40), M.metal(0x6b7280, { roughness: 0.4 })); rim.rotation.x = Math.PI / 2; rim.position.set(P[0], P[1], -0.04); gS.add(rim);
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; const n = makeNut(0.028, 0x8c95a3); n.position.set(P[0] + Math.cos(a) * 0.1, P[1] + Math.sin(a) * 0.1, -0.005); gS.add(n); }
    const hubNut = makeNut(0.05); hubNut.position.set(...P); gS.add(hubNut);
    const spin = new THREE.Group(); spin.position.set(...P); spin.position.z += 0.04; gS.add(spin);
    const span = makeSpanner(0.45); spin.add(span);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 10), M.matte(0xc68b64)); gS.add(hand);
    const aF = force(HEX.push, 0.012, 0.05); gS.add(aF);
    const act = dashes(14, 0.004, M.glow(0xffb547, { transparent: true, opacity: 0.5 })); gS.add(act);
    const arm = stick(0.007, M.glow(0x5ce1a9)); gS.add(arm);
    const tw = twist(HEX.acc, 0.1, 0.008); tw.start = Math.PI * 0.5; tw.position.set(P[0], P[1], 0.1); gS.add(tw);
    const lF = stage.label('', [0, 0, 0], gS, 'hot'), lR = stage.label('', [0, 0, 0], gS), lArm = stage.label('', [0, 0, 0], gS, 'hot'), lT = stage.label('', [0, 0, 0], gS, 'hot');
    lF.element.style.setProperty('--c', COL.push); lArm.element.style.setProperty('--c', COL.acc); lT.element.style.setProperty('--c', COL.acc);

    // ================================================================ a door
    const floorD = box(3, 0.02, 3, M.matte(0x3a3f4b)); floorD.position.set(0.3, 0.01, -0.6); gD.add(floorD);
    const wallM = M.matte(0x5b6270);
    const wL = box(0.6, 2.3, 0.12, wallM); wL.position.set(-0.75, 1.15, 0); gD.add(wL);
    const wR = box(0.6, 2.3, 0.12, wallM); wR.position.set(1.35, 1.15, 0); gD.add(wR);
    const wT = box(1.5, 0.3, 0.12, wallM); wT.position.set(0.3, 2.15, 0); gD.add(wT);
    const hinge = new THREE.Group(); hinge.position.set(-0.43, 0, 0); gD.add(hinge);
    const slab = box(DOOR.w - 0.02, DOOR.h - 0.02, 0.045, M.matte(0xa97a42, { roughness: 0.7 })); slab.position.set(DOOR.w / 2, DOOR.h / 2 + 0.01, 0); hinge.add(slab);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), M.metal(0xd8c28a)); knob.position.set(DOOR.w - 0.08, 1.0, 0.05); hinge.add(knob);
    for (const y of [0.3, 1.7]) { const hg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 10), steel); hg.position.set(0, y, 0.02); hinge.add(hg); }
    const axisLine = stick(0.006, M.glow(0x8ef0ff, { transparent: true, opacity: 0.6 })); axisLine.between([-0.43, 0, 0.03], [-0.43, 2.1, 0.03]); gD.add(axisLine);
    const pusher = makePerson({ shirt: 0x7a4fd8, s: 0.95 }); gD.add(pusher);
    const aFd = force(HEX.push, 0.02, 0.09); gD.add(aFd);
    const twD = twist(HEX.acc, 0.25, 0.012); twD.rotation.x = -Math.PI / 2; twD.start = -Math.PI / 2 - 0.3; twD.position.set(-0.43, 2.05, 0.03); gD.add(twD);
    const lFd = stage.label('', [0, 0, 0], gD, 'hot'), lRd = stage.label('', [0, 0, 0], gD), lHinge = stage.label('hinges: the pivot', [-0.43, 2.35, 0.1], gD), lTd = stage.label('', [0, 0, 0], gD, 'hot');
    lFd.element.style.setProperty('--c', COL.push); lTd.element.style.setProperty('--c', COL.acc);
    const ruler = stick(0.008, M.glow(0xf2d24b)); gD.add(ruler);

    // ================================================================ board: τ against r
    let cur = null;
    const bd = board(root, 1.5, 0.9, 900, 540, (g, w, h) => {
      panelBg(g, w, h); if (!cur) return;
      const { s, tau } = cur, door = s.mode === 'door';
      const F = door ? s.Fd : s.F, rMax = door ? 0.9 : 0.45, sn = Math.sin(s.th * D2R);
      title(g, 'Torque against distance', `τ = F r sin θ, push ${F} N at ${s.th}°`);
      const yMax = niceMax(Math.max(F * rMax * 1.05, door ? 1 : s.brk * 1.25, 1));
      const { X, Y } = axes(g, w, h, { x0: 100, y1: 92, xMax: rMax, yMax, xTicks: door ? [0, 0.3, 0.6, 0.9] : [0, 0.15, 0.3, 0.45], yTicks: [0, yMax / 2, yMax], xFmt: (v) => Math.round(v * 100) + ' cm', yFmt: (v) => fmtNm(v).replace(' N·m', ''), xLabel: 'distance from the pivot, r →', yLabel: 'torque, N·m ↑' });
      if (s.th < 89) { g.strokeStyle = 'rgba(255,181,71,.7)'; g.lineWidth = 3; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(rMax), Y(Math.min(yMax, F * rMax))); g.stroke(); g.setLineDash([]);
        g.fillStyle = COL.push; g.font = '17px sans-serif'; g.fillText('at right angles', X(rMax * 0.62), Y(Math.min(yMax * 0.95, F * rMax * 0.62)) - 10); }
      g.strokeStyle = COL.acc; g.lineWidth = 5; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(rMax), Y(Math.min(yMax, F * rMax * sn))); g.stroke();
      if (!door) {
        g.strokeStyle = COL.net; g.lineWidth = 3; g.setLineDash([10, 6]); g.beginPath(); g.moveTo(X(0), Y(s.brk)); g.lineTo(X(rMax), Y(s.brk)); g.stroke(); g.setLineDash([]);
        g.fillStyle = COL.net; g.font = 'bold 18px sans-serif'; g.fillText(`nut breaks free: ${s.brk} N·m`, X(0) + 12, Y(s.brk) - 10);
      }
      const r = door ? s.rd : s.r;
      dot(g, X(r), Y(Math.min(yMax, tau)), door || tau > s.brk ? COL.acc : COL.soft, 11);
      g.fillStyle = '#fff'; g.font = 'bold 26px sans-serif';
      const t = `${fmtNm(tau)}`; g.fillText(t, Math.min(X(r) + 16, w - 40 - g.measureText(t).width), Math.max(110, Y(Math.min(yMax, tau)) - 14));
      g.font = '18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.75)';
      g.fillText('twice as far from the pivot: twice the torque', X(rMax) - g.measureText('twice as far from the pivot: twice the torque').width, Y(0) - 14);
    }, [0, 0, 0]);

    let mode = '', key = '', phi = 0, hold = 0, a = 0, w = 0, dHold = 0, dT = 0;
    return {
      update(dt, s) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, [lR, lHinge, lRd]);
        if (s.mode !== mode) {
          mode = s.mode; phi = 0; hold = 0; a = 0; w = 0; dHold = 0; dT = 0;
          gS.visible = mode === 'spanner'; gD.visible = mode === 'door';
          if (mode === 'spanner') homeBoard(bd, [0.74, 0.8, -0.3], -0.36, 0.62); else homeBoard(bd, [DX + 1.7, 1.9, -1.2], -0.25, 1.15);
          if (!inReel()) { const v = VIEWS[mode]; stage.setView(v.pos, v.target, 1.0); }
        }
        reelBoards([[bd, mode === 'spanner' ? [0.05, 1.12, -0.2] : [DX + 0.25, 2.6, -1.2], mode === 'spanner' ? 0.55 : 1.0]]);
        const tau = tauOf(s), sn = Math.sin(s.th * D2R), cs = Math.cos(s.th * D2R);

        if (mode === 'spanner') {
          // Turn the nut while the torque beats the breakaway torque; after 70° re-seat the spanner.
          if (tau > s.brk && hold <= 0) { phi += dt * clamp(0.6 + (1.6 * (tau - s.brk)) / s.brk, 0.6, 2.2); if (phi > 70 * D2R) hold = 0.8; }
          else if (hold > 0) { hold -= dt; if (hold <= 0) phi = 0; }
          else phi = Math.max(0, phi - dt * 2);
          spin.rotation.z = phi; hubNut.rotation.z = phi;
          const u = [-Math.cos(phi), -Math.sin(phi)], d = [u[0] * cs - u[1] * sn, u[0] * sn + u[1] * cs];
          const H = [P[0] + u[0] * s.r, P[1] + u[1] * s.r, P[2] + 0.04];
          hand.position.set(...H);
          const L = s.F * S;
          aF.aim([H[0] - d[0] * (L + 0.04), H[1] - d[1] * (L + 0.04), H[2] + 0.02], [d[0], d[1], 0], L); aF.visible = s.F > 5;
          const k = (P[0] - H[0]) * d[0] + (P[1] - H[1]) * d[1];
          const foot = [H[0] + d[0] * k, H[1] + d[1] * k, H[2] + 0.02];
          act.between([H[0] - d[0] * 0.5, H[1] - d[1] * 0.5, H[2] + 0.02], [foot[0] + d[0] * 0.06 * Math.sign(k || 1), foot[1] + d[1] * 0.06 * Math.sign(k || 1), H[2] + 0.02]);
          act.visible = s.th < 88 && s.F > 5;
          arm.between([P[0], P[1], H[2] + 0.03], foot);
          tw.set(clamp((tau / 200) * 1.6 * Math.PI, 0, 1.8 * Math.PI));
          lF.position.set(H[0] - d[0] * (L + 0.1), H[1] - d[1] * (L + 0.1) + 0.03, H[2]); lF.element.innerHTML = `push F <b>${fmtN(s.F)}</b>`; lF.visible = s.F > 5;
          lR.position.set((P[0] + H[0]) / 2 - u[1] * 0.06, (P[1] + H[1]) / 2 - 0.06, H[2]); lR.element.innerHTML = `r = ${(s.r * 100).toFixed(0)} cm`;
          lArm.position.set((P[0] + foot[0]) / 2 + 0.02, (P[1] + foot[1]) / 2 - 0.05, H[2]); lArm.element.innerHTML = `lever arm ${(s.r * sn * 100).toFixed(0)} cm`; lArm.visible = s.th < 88 && !narrow;
          lT.position.set(P[0] + 0.13, P[1] + 0.17, P[2]); lT.element.innerHTML = tau > s.brk ? `τ <b>${fmtNm(tau)}</b>: it turns` : `τ <b>${fmtNm(tau)}</b>: stuck`;
        }

        if (mode === 'door') {
          // Swing the door open with τ = I α; hold it open for a moment, then close it and push again.
          if (dHold > 0) { dHold -= dt; if (dHold <= 0) { a = 0; w = 0; dT = 0; } }
          else if (tau > DOOR.fr) { const al = (tau - DOOR.fr) / DOOR.I; w += al * dt; a += w * dt; dT += dt; if (a >= Math.PI / 2) { a = Math.PI / 2; dHold = 1.2; } }
          else { dT += dt; if (dT > 4) dT = 0; }
          hinge.rotation.y = a;
          const ca = Math.cos(a), sa = Math.sin(a);
          const along = [ca, -sa], nrm = [-sa, -ca];                        // along the door (xz), and the push direction (into the room)
          const dir = [along[0] * cs + nrm[0] * sn, along[1] * cs + nrm[1] * sn];
          const hx = -0.43 + along[0] * s.rd, hz = along[1] * s.rd, y = 1.0;
          const L = s.Fd * SD;
          aFd.aim([hx - dir[0] * (L + 0.05), y, hz - dir[1] * (L + 0.05)], [dir[0], 0, dir[1]], L);
          pusher.position.set(hx - dir[0] * (L + 0.55), 0, hz - dir[1] * (L + 0.55)); pusher.rotation.y = Math.atan2(-dir[1], dir[0]); pusher.pose({ arm: 1.35, lean: 0.12, stride: 0.2 });
          ruler.between([-0.43, 0.05, 0.08], [-0.43 + along[0] * s.rd, 0.05, 0.08 + along[1] * s.rd]);
          twD.set(clamp((tau / 50) * 1.6 * Math.PI, 0, 1.8 * Math.PI));
          lFd.position.set(hx - dir[0] * (L + 0.1), y + 0.35, hz - dir[1] * (L + 0.1)); lFd.element.innerHTML = `push <b>${fmtN(s.Fd)}</b>`;
          lRd.position.set(-0.43 + (along[0] * s.rd) / 2, 0.2, 0.25 + (along[1] * s.rd) / 2); lRd.element.innerHTML = `${(s.rd * 100).toFixed(0)} cm from the hinge`;
          const t90 = doorTime(tau);
          lTd.position.set(-0.43, 2.55, 0.1); lTd.element.innerHTML = `τ <b>${fmtNm(tau)}</b> · ${isFinite(t90) ? `opens in ${t90.toFixed(1)} s` : 'too weak to beat the hinges'}`;
        }

        cur = { s, tau };
        const kk = `${mode}|${s.F}|${s.r}|${s.th}|${s.brk}|${s.Fd}|${s.rd}`;
        if (kk !== key) { key = kk; bd.redraw(); }
      },
      readout: (s) => {
        const tau = tauOf(s), sn = Math.sin(s.th * D2R);
        if (s.mode === 'door') {
          const t90 = doorTime(tau);
          return `<div class="big">τ = F r sin θ = ${fmtNm(tau)}</div>
            <div class="row"><span>Push F</span><b>${s.Fd} N at ${s.th}°</b></div>
            <div class="row"><span>Distance from the hinge r</span><b>${(s.rd * 100).toFixed(0)} cm</b></div>
            <div class="row"><span>Door: 25 kg, 90 cm, I = m w² ÷ 3</span><b>${DOOR.I.toFixed(2)} kg·m²</b></div>
            <div class="row"><span>Time to swing open 90°</span><b>${isFinite(t90) ? t90.toFixed(1) + ' s' : 'never'}</b></div>
            <small>Hinge friction takes about 1 N·m. The rest spins the door up: τ = I α.</small>`;
        }
        const ok = tau > s.brk;
        return `<div class="big">τ = F r sin θ = ${fmtNm(tau)}</div>
          <div class="row"><span>Push F</span><b>${fmtN(s.F)}</b></div>
          <div class="row"><span>Hand distance r</span><b>${(s.r * 100).toFixed(0)} cm</b></div>
          <div class="row"><span>Angle θ, sin θ</span><b>${s.th}°, ${sn.toFixed(2)}</b></div>
          <div class="row"><span>Lever arm r sin θ</span><b>${(s.r * sn * 100).toFixed(1)} cm</b></div>
          <div class="row"><span>Nut needs</span><b>${s.brk} N·m</b></div>
          ${ok ? '<div class="ok">The nut turns.</div>' : `<div class="no">Stuck. At this spot you need ${fmtN(s.brk / (s.r * sn))}.</div>`}`;
      },
    };
  },
};
