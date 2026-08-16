// Deck visual-rendering math — shared verbatim with the groovemix-landing repo via
// sync-deck.mjs (see that script's header). Keep this file dependency-free: no chrome.*
// APIs, no references to sidepanel.js globals. Anything that touches live product state
// stays in sidepanel.js; only the pure knob/arc geometry lives here.
window.DeckRender = (function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  // No background track ring — at rest the arc is zero-length (nothing drawn).
  const ARC_R = 17;
  const ARC_CIRCUMFERENCE = 2 * Math.PI * ARC_R;

  // Neutral is at 12 o'clock; both directions reach ±135°. Tapered ranges (e.g. EQ's -40/+6)
  // give different degrees-per-unit each side, matching a real tapered-pot EQ knob.
  function tieredAngle(v, min, max) {
    return v >= 0 ? (v / max) * 135 : (v / min) * -135;
  }

  // Arc fills from NEUTRAL outward (not from absolute minimum) — empty at rest, grows in
  // whichever direction you turn, showing deviation rather than absolute position.
  function setKnobArc(knob, angle, neutralAngle) {
    const fill = knob.querySelector('.knobArcFill');
    if (!fill) return;
    const segStart = Math.min(angle, neutralAngle);
    const segLength = Math.abs(angle - neutralAngle);
    // SVG 0° = 3 o'clock; our angle system uses 12 o'clock = 0° — the -90° here corrects for that.
    fill.setAttribute('transform', `rotate(${segStart - 90} 20 20)`);
    fill.style.strokeDasharray = `${(segLength / 360) * ARC_CIRCUMFERENCE} ${ARC_CIRCUMFERENCE}`;
  }

  // Builds the arc-fill SVG for one .knob element and inserts it as its first child.
  function buildKnobArc(knob) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'knobArc');
    svg.setAttribute('viewBox', '0 0 40 40');
    const fill = document.createElementNS(SVG_NS, 'circle');
    fill.setAttribute('class', 'knobArcFill');
    fill.setAttribute('cx', '20');
    fill.setAttribute('cy', '20');
    fill.setAttribute('r', String(ARC_R));
    svg.appendChild(fill);
    knob.insertBefore(svg, knob.firstChild);
    return svg;
  }

  return { SVG_NS, ARC_R, ARC_CIRCUMFERENCE, tieredAngle, setKnobArc, buildKnobArc };
})();
