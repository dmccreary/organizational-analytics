// Continuous Improvement Cycle MicroSim
// Circular diagram with four phases: Measure, Analyze, Intervene, Evaluate
// Click phases for details, animation rotates the cycle
// MicroSim template version 2026.02

// ---- Canvas dimensions ----
let canvasWidth = 400;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;

// ---- Aria palette ----
const INDIGO       = '#303F9F';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER        = '#D4880F';
const GOLD         = '#FFD700';

// ---- Phase definitions (clockwise from top) ----
const phases = [
  {
    name: 'Measure',
    color: INDIGO,
    icon: 'chart',
    angle: -Math.PI / 2,  // top
    example: 'Resilience score dropped to 55',
    detail: [
      'Run health score calculation',
      'Compare against benchmarks',
      'Identify dimension gaps',
      'Establish quantifiable baseline'
    ]
  },
  {
    name: 'Analyze',
    color: AMBER,
    icon: 'search',
    angle: 0,  // right
    example: '2 new SPOFs in Platform team',
    detail: [
      'Investigate root causes',
      'Drill into flagged dimensions',
      'Examine specific teams',
      'Identify structural changes'
    ]
  },
  {
    name: 'Intervene',
    color: INDIGO_LIGHT,
    icon: 'wrench',
    angle: Math.PI / 2,  // bottom
    example: 'Cross-train backup for key roles',
    detail: [
      'Design targeted changes',
      'Restructure teams if needed',
      'Add communication paths',
      'State clear hypothesis'
    ]
  },
  {
    name: 'Evaluate',
    color: GOLD,
    icon: 'check',
    angle: Math.PI,  // left
    example: 'Resilience recovered to 63 after 8 wks',
    detail: [
      'Re-run health score',
      'Compare to pre-intervention',
      'Assess if change held',
      'Feed results into next cycle'
    ]
  }
];

// ---- State ----
let rotationAngle = 0;
let selectedPhase = -1;
let mouseOverCanvas = false;
let resetBtn;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  resetBtn = createButton('Reset');
  resetBtn.parent(document.querySelector('main'));
  resetBtn.mousePressed(() => { selectedPhase = -1; });
  resetBtn.style('font-size', '14px');
  resetBtn.style('padding', '6px 16px');
  resetBtn.style('background', INDIGO);
  resetBtn.style('color', 'white');
  resetBtn.style('border', 'none');
  resetBtn.style('border-radius', '4px');
  resetBtn.style('cursor', 'pointer');

  describe('Circular continuous improvement cycle with four phases: Measure, Analyze, Intervene, Evaluate. Click phases for details.', LABEL);
}

function draw() {
  updateCanvasSize();

  // Draw area background
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);

  // Control area
  noStroke();
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Position reset button
  resetBtn.position(canvasWidth / 2 - 40, drawHeight + 10);

  // Animate rotation
  if (mouseOverCanvas) {
    rotationAngle += 0.005;
  }

  // Title
  noStroke();
  fill(INDIGO);
  textAlign(CENTER, TOP);
  textSize(18);
  textStyle(BOLD);
  text('Continuous Improvement Cycle', canvasWidth / 2, 8);
  textStyle(NORMAL);

  // Center of the cycle
  let cx = canvasWidth / 2;
  let cy = drawHeight / 2 + 5;
  let orbitRadius = min(canvasWidth, drawHeight) * 0.28;
  let phaseRadius = min(canvasWidth, drawHeight) * 0.1;

  // ---- Draw curved arrows between phases ----
  drawCurvedArrows(cx, cy, orbitRadius);

  // ---- Draw phase nodes ----
  for (let i = 0; i < 4; i++) {
    let p = phases[i];
    let a = p.angle;
    let px = cx + cos(a) * orbitRadius;
    let py = cy + sin(a) * orbitRadius;

    // Check hover
    let d = dist(mouseX, mouseY, px, py);
    let isHovered = d < phaseRadius;
    let isSelected = (selectedPhase === i);

    // Phase circle
    noStroke();
    fill(p.color);
    if (isHovered) {
      fill(lerpColor(color(p.color), color(255), 0.2));
    }
    if (isSelected) {
      stroke(255);
      strokeWeight(3);
    }
    ellipse(px, py, phaseRadius * 2, phaseRadius * 2);
    noStroke();

    // Icon (simplified)
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    noStroke();
    if (p.icon === 'chart') text('\u2261', px, py - 12);    // ≡ bars
    if (p.icon === 'search') text('\u2315', px, py - 12);   // search
    if (p.icon === 'wrench') text('\u2692', px, py - 12);   // tools
    if (p.icon === 'check') text('\u2713', px, py - 12);    // checkmark

    // Phase name
    textSize(constrain(phaseRadius * 0.38, 10, 14));
    textStyle(BOLD);
    noStroke();
    fill(p.color === GOLD ? 0 : 255);
    text(p.name, px, py + 10);
    textStyle(NORMAL);

    // Example text outside the circle
    noStroke();
    fill(100);
    textSize(9);
    textStyle(ITALIC);
    textAlign(CENTER, CENTER);
    let exX = cx + cos(a) * (orbitRadius + phaseRadius + 22);
    let exY = cy + sin(a) * (orbitRadius + phaseRadius + 22);
    text(p.example, exX, exY);
    textStyle(NORMAL);
  }

  // ---- Center: Organizational Health label + rotating indicator ----
  noStroke();
  fill(255, 255, 255, 200);
  ellipse(cx, cy, 70, 70);

  // Rotating ring
  stroke(AMBER);
  strokeWeight(2);
  noFill();
  arc(cx, cy, 78, 78, rotationAngle, rotationAngle + PI);
  noStroke();

  fill(INDIGO);
  textAlign(CENTER, CENTER);
  textSize(10);
  textStyle(BOLD);
  noStroke();
  text('Org\nHealth', cx, cy);
  textStyle(NORMAL);

  // ---- Selected phase detail panel ----
  if (selectedPhase >= 0) {
    drawDetailPanel(selectedPhase);
  }
}

// ---- Draw curved arrows between phase nodes ----
function drawCurvedArrows(cx, cy, orbitRadius) {
  stroke(180);
  strokeWeight(2);
  noFill();

  for (let i = 0; i < 4; i++) {
    let next = (i + 1) % 4;
    let a1 = phases[i].angle;
    let a2 = phases[next].angle;

    // Draw arc between phases
    let midAngle = (a1 + a2) / 2;
    // Handle wrap-around for last->first
    if (i === 3) midAngle = (a1 + a2 + TWO_PI) / 2;

    let arcR = orbitRadius * 1.05;

    // Draw a portion of the orbit arc
    let startA = a1 + 0.3;
    let endA = (i === 3) ? a2 + TWO_PI - 0.3 : a2 - 0.3;

    stroke(180);
    strokeWeight(2);
    noFill();
    arc(cx, cy, arcR * 2, arcR * 2, startA, endA);

    // Arrowhead at end
    let ahAngle = endA;
    let ahX = cx + cos(ahAngle) * arcR;
    let ahY = cy + sin(ahAngle) * arcR;
    let tangent = ahAngle + HALF_PI;

    fill(180);
    noStroke();
    let aSize = 8;
    triangle(
      ahX + cos(tangent) * aSize,
      ahY + sin(tangent) * aSize,
      ahX + cos(tangent + 2.5) * aSize * 0.6,
      ahY + sin(tangent + 2.5) * aSize * 0.6,
      ahX + cos(tangent - 2.5) * aSize * 0.6,
      ahY + sin(tangent - 2.5) * aSize * 0.6
    );
  }
}

// ---- Detail panel for selected phase ----
function drawDetailPanel(idx) {
  let p = phases[idx];
  let panelW = 220;
  let panelH = 100;
  let panelX = canvasWidth / 2 - panelW / 2;
  let panelY = drawHeight - panelH - 16;

  // Panel background
  fill(255, 255, 255, 240);
  stroke(p.color);
  strokeWeight(2);
  rect(panelX, panelY, panelW, panelH, 8);
  noStroke();

  // Title
  fill(p.color);
  textAlign(LEFT, TOP);
  textSize(13);
  textStyle(BOLD);
  noStroke();
  text(p.name, panelX + 12, panelY + 8);
  textStyle(NORMAL);

  // Detail steps
  fill(60);
  textSize(10);
  textAlign(LEFT, TOP);
  for (let i = 0; i < p.detail.length; i++) {
    noStroke();
    text('  \u2022 ' + p.detail[i], panelX + 12, panelY + 26 + i * 16);
  }
}

// ---- Click to select phase ----
function mousePressed() {
  let cx = canvasWidth / 2;
  let cy = drawHeight / 2 + 5;
  let orbitRadius = min(canvasWidth, drawHeight) * 0.28;
  let phaseRadius = min(canvasWidth, drawHeight) * 0.1;

  for (let i = 0; i < 4; i++) {
    let p = phases[i];
    let px = cx + cos(p.angle) * orbitRadius;
    let py = cy + sin(p.angle) * orbitRadius;
    if (dist(mouseX, mouseY, px, py) < phaseRadius) {
      selectedPhase = (selectedPhase === i) ? -1 : i;
      return;
    }
  }
  selectedPhase = -1;
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
}
