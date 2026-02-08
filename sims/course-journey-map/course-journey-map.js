// Course Journey Map MicroSim
// Interactive roadmap showing the 5 phases of the course

let canvasWidth = 400;
let drawHeight = 350;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;

// Aria color theme
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const AMBER_LIGHT = '#F5C14B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';

// Phase data
const phases = [
  {
    label: 'Foundations',
    chapters: 'Chapters 1-3',
    color: INDIGO,
    tooltip: 'Ch 1-3: Learn what organizational\nanalytics is, why graphs matter,\nand how to model people data'
  },
  {
    label: 'Data Pipeline',
    chapters: 'Chapters 4-5',
    color: INDIGO_LIGHT,
    tooltip: 'Ch 4-5: Capture employee event\nstreams and load them\ninto your graph'
  },
  {
    label: 'Algorithms',
    chapters: 'Chapters 6-7',
    color: AMBER,
    tooltip: 'Ch 6-7: Apply centrality, community\ndetection, pathfinding, and\nsimilarity algorithms'
  },
  {
    label: 'Intelligence',
    chapters: 'Chapters 8-11',
    color: AMBER_DARK,
    tooltip: 'Ch 8-11: Add language understanding\nand machine learning, tackle real\norganizational questions'
  },
  {
    label: 'Application',
    chapters: 'Chapters 12-15',
    color: GOLD,
    tooltip: 'Ch 12-15: Build reporting tools,\nnavigate ethics, create reusable\nanalytics libraries'
  }
];

let hoveredPhase = -1;
let phasePositions = [];
let pulseAngle = 0;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));
  describe('A course journey map showing five phases of the organizational analytics course connected by a winding path, from Foundations through Application.', LABEL);
  textFont('Arial');
}

function draw() {
  updateCanvasSize();
  pulseAngle += 0.05;

  // Draw area background
  fill(CHAMPAGNE);
  noStroke();
  rect(0, 0, canvasWidth, drawHeight);

  // Control area background
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  let fontSize = constrain(canvasWidth * 0.025, 10, 14);

  // Title
  fill(INDIGO_DARK);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(min(20, canvasWidth * 0.04));
  textStyle(BOLD);
  text('Your Course Journey', canvasWidth / 2, 12);
  textStyle(NORMAL);

  // Compute phase positions
  computePhasePositions();

  // Draw the path (S-curve through phases)
  drawPath();

  // Draw phase nodes
  for (let i = 0; i < phases.length; i++) {
    drawPhaseNode(i, fontSize);
  }

  // Draw "You Are Here" marker at phase 1
  drawYouAreHere(fontSize);

  // Draw star at the end
  drawExpertStar(fontSize);

  // Draw tooltip for hovered phase
  if (hoveredPhase >= 0) {
    drawTooltip(hoveredPhase, fontSize);
  }

  // Control area caption
  fill('#666');
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(constrain(canvasWidth * 0.025, 10, 13));
  textStyle(ITALIC);
  text('Hover over each phase to see chapter details', canvasWidth / 2, drawHeight + controlHeight / 2);
  textStyle(NORMAL);
}

function computePhasePositions() {
  phasePositions = [];
  let pathStartX = margin + 40;
  let pathEndX = canvasWidth - margin - 40;
  let centerY = drawHeight * 0.52;
  let waveAmp = 35;
  let count = phases.length;

  for (let i = 0; i < count; i++) {
    let t = i / (count - 1);
    let px = lerp(pathStartX, pathEndX, t);
    // Gentle S-wave
    let py = centerY + sin(t * PI * 1.5 - PI * 0.3) * waveAmp;
    phasePositions.push({ x: px, y: py });
  }
}

function drawPath() {
  // Draw a smooth curved path through phase positions
  stroke(220, 220, 230);
  strokeWeight(6);
  noFill();

  // Draw thick background path
  beginShape();
  curveVertex(phasePositions[0].x - 30, phasePositions[0].y);
  for (let pos of phasePositions) {
    curveVertex(pos.x, pos.y);
  }
  curveVertex(phasePositions[phasePositions.length - 1].x + 30, phasePositions[phasePositions.length - 1].y);
  endShape();

  // Draw thinner colored path on top
  stroke(INDIGO_LIGHT);
  strokeWeight(3);
  strokeWeight(3);
  beginShape();
  curveVertex(phasePositions[0].x - 30, phasePositions[0].y);
  for (let pos of phasePositions) {
    curveVertex(pos.x, pos.y);
  }
  curveVertex(phasePositions[phasePositions.length - 1].x + 30, phasePositions[phasePositions.length - 1].y);
  endShape();

  // Draw dashed direction arrows along the path
  for (let i = 0; i < phasePositions.length - 1; i++) {
    let midX = (phasePositions[i].x + phasePositions[i + 1].x) / 2;
    let midY = (phasePositions[i].y + phasePositions[i + 1].y) / 2;
    let angle = atan2(phasePositions[i + 1].y - phasePositions[i].y,
                       phasePositions[i + 1].x - phasePositions[i].x);
    fill(INDIGO_LIGHT);
    noStroke();
    push();
    translate(midX, midY);
    rotate(angle);
    triangle(8, 0, -4, -5, -4, 5);
    pop();
  }
}

function drawPhaseNode(idx, fontSize) {
  let pos = phasePositions[idx];
  let phase = phases[idx];
  let isHovered = idx === hoveredPhase;
  let nodeR = constrain(canvasWidth * 0.045, 22, 38);
  if (isHovered) nodeR *= 1.15;

  // Node shadow
  noStroke();
  fill(0, 0, 0, 20);
  ellipse(pos.x + 2, pos.y + 2, nodeR * 2 + 4);

  // Outer ring
  if (isHovered) {
    stroke(GOLD);
    strokeWeight(4);
  } else {
    stroke(255, 255, 255, 180);
    strokeWeight(2);
  }
  fill(phase.color);
  ellipse(pos.x, pos.y, nodeR * 2);

  // Phase number inside
  noStroke();
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(nodeR * 0.7);
  textStyle(BOLD);
  text(idx + 1, pos.x, pos.y);
  textStyle(NORMAL);

  // Label below
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  textSize(constrain(fontSize * 0.9, 9, 13));
  textStyle(BOLD);
  text(phase.label, pos.x, pos.y + nodeR + 6);
  textStyle(NORMAL);

  // Chapter range below label
  fill('#666');
  textSize(constrain(fontSize * 0.7, 7, 10));
  text(phase.chapters, pos.x, pos.y + nodeR + 6 + fontSize + 2);
}

function drawYouAreHere(fontSize) {
  let pos = phasePositions[0];
  let nodeR = constrain(canvasWidth * 0.045, 22, 38);
  let markerY = pos.y - nodeR - 25;

  // Pulsing effect
  let pulse = sin(pulseAngle) * 3;

  // Triangle pointer
  fill(AMBER);
  noStroke();
  triangle(pos.x, pos.y - nodeR - 4,
           pos.x - 8, markerY + pulse,
           pos.x + 8, markerY + pulse);

  // Label
  fill(AMBER_DARK);
  textAlign(CENTER, BOTTOM);
  textSize(constrain(fontSize * 0.8, 8, 11));
  textStyle(BOLD);
  text('You Are Here', pos.x, markerY - 2 + pulse);
  textStyle(NORMAL);
}

function drawExpertStar(fontSize) {
  let lastPos = phasePositions[phasePositions.length - 1];
  let nodeR = constrain(canvasWidth * 0.045, 22, 38);
  let starX = lastPos.x;
  let starY = lastPos.y - nodeR - 30;

  // Pulsing star
  let pulse = sin(pulseAngle * 0.7) * 2;
  let starSize = 12 + pulse;

  // Draw 5-point star
  fill(GOLD);
  stroke(AMBER_DARK);
  strokeWeight(1);
  drawStar(starX, starY, starSize * 0.5, starSize, 5);

  // Label
  noStroke();
  fill(AMBER_DARK);
  textAlign(CENTER, BOTTOM);
  textSize(constrain(fontSize * 0.8, 8, 11));
  textStyle(BOLD);
  text('Expert', starX, starY - starSize - 2);
  textStyle(NORMAL);
}

function drawStar(cx, cy, innerR, outerR, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = -HALF_PI; a < TWO_PI - HALF_PI; a += angle) {
    let sx = cx + cos(a) * outerR;
    let sy = cy + sin(a) * outerR;
    vertex(sx, sy);
    sx = cx + cos(a + halfAngle) * innerR;
    sy = cy + sin(a + halfAngle) * innerR;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function drawTooltip(idx, fontSize) {
  let phase = phases[idx];
  let pos = phasePositions[idx];
  let lines = phase.tooltip.split('\n');
  let tipFontSize = constrain(fontSize * 0.85, 9, 12);

  // Measure tooltip dimensions
  textSize(tipFontSize);
  let maxLineW = 0;
  for (let line of lines) {
    let lw = textWidth(line);
    if (lw > maxLineW) maxLineW = lw;
  }
  let tipW = maxLineW + 24;
  let tipH = lines.length * (tipFontSize + 4) + 16;

  // Position tooltip - prefer above, shift if near edges
  let nodeR = constrain(canvasWidth * 0.045, 22, 38);
  let tipX = pos.x - tipW / 2;
  let tipY = pos.y + nodeR + 45;

  // Keep within canvas bounds
  tipX = constrain(tipX, 5, canvasWidth - tipW - 5);
  if (tipY + tipH > drawHeight - 10) {
    tipY = pos.y - nodeR - tipH - 35;
  }

  // Background with shadow
  noStroke();
  fill(0, 0, 0, 30);
  rect(tipX + 3, tipY + 3, tipW, tipH, 8);

  fill(INDIGO_DARK);
  rect(tipX, tipY, tipW, tipH, 8);

  // Pointer triangle
  let triX = constrain(pos.x, tipX + 15, tipX + tipW - 15);
  if (tipY > pos.y) {
    // Tooltip is below, pointer points up
    triangle(triX, tipY - 6, triX - 6, tipY, triX + 6, tipY);
  } else {
    // Tooltip is above, pointer points down
    triangle(triX, tipY + tipH + 6, triX - 6, tipY + tipH, triX + 6, tipY + tipH);
  }

  // Text
  fill('white');
  textAlign(LEFT, TOP);
  textSize(tipFontSize);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], tipX + 12, tipY + 8 + i * (tipFontSize + 4));
  }
}

function mouseMoved() {
  hoveredPhase = -1;
  let nodeR = constrain(canvasWidth * 0.045, 22, 38);

  for (let i = 0; i < phasePositions.length; i++) {
    let pos = phasePositions[i];
    if (dist(mouseX, mouseY, pos.x, pos.y) < nodeR * 1.5) {
      hoveredPhase = i;
      break;
    }
  }
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

function updateCanvasSize() {
  const container = document.querySelector('main');
  if (container) {
    canvasWidth = container.offsetWidth;
  }
  canvasHeight = drawHeight + controlHeight;
}
