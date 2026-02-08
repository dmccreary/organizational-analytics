// Alert System Architecture MicroSim
// 5-stage workflow diagram with animated alert flow

const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';

let canvasW = 900;
const canvasH = 520;
let selectedStage = -1;
let isAnimating = false;
let animProgress = 0;
let stressMode = false;
let animBtn, stressBtn;
let hoveredStage = -1;
let particles = [];

const STAGES = [
  { name: 'Metric\nSources', color: INDIGO, desc: 'Graph algorithm outputs feed the alerting pipeline. Centrality scores, community assignments, sentiment scores, flight risk scores, and communication volume are computed on tiered refresh schedules (hourly to weekly).' },
  { name: 'Threshold\nEvaluation', color: INDIGO_LIGHT, desc: 'Each metric is compared against calibrated thresholds. Green means within acceptable range, Amber signals a warning requiring monitoring, Red signals a critical breach requiring action. Thresholds are calibrated against historical baselines.' },
  { name: 'Aggregation\nEngine', color: AMBER, desc: 'Multiple threshold breaches are grouped by organizational unit and timeframe. 12 individual sentiment drops become 1 department alert. Cooldown logic prevents repeat alerts for the same ongoing issue (30-day suppression with escalation on worsening).' },
  { name: 'Routing\nMatrix', color: GOLD, desc: 'Different alert types route to different recipients. Team alerts go to Manager + HRBP. Department alerts go to Department Head + CHRO. Organization alerts go to the Executive Team. Individual risk alerts route ONLY to Direct Manager (privacy-protected).' },
  { name: 'Delivery &\nFeedback', color: INDIGO, desc: 'Alerts are delivered via the configured channel. A feedback loop tracks: Was action taken? Did the metric change? Over time, this refines thresholds -- alerts that drive action are kept, alerts that get ignored are refined or removed.' }
];

const METRICS_LIST = [
  'Centrality Scores',
  'Community Assignments',
  'Sentiment Scores',
  'Flight Risk Scores',
  'Communication Volume'
];

const ROUTING_RULES = [
  { type: 'Team Alert', recipients: 'Manager + HRBP', icon: '\u{1F465}' },
  { type: 'Department Alert', recipients: 'Dept Head + CHRO', icon: '\u{1F3E2}' },
  { type: 'Organization Alert', recipients: 'Executive Team', icon: '\u{1F30D}' },
  { type: 'Individual Risk', recipients: 'Direct Manager only \u{1F512}', icon: '\u{1F464}' }
];

function updateCanvasSize() {
  let container = document.getElementById('canvas-container');
  if (container) canvasW = container.offsetWidth;
}

function setup() {
  updateCanvasSize();
  let canvas = createCanvas(canvasW, canvasH);
  canvas.parent('canvas-container');
  textFont('Arial');

  animBtn = createButton('\u25B6 Animate Alert');
  animBtn.parent('canvas-container');
  animBtn.style('font-size', '11px');
  animBtn.style('padding', '4px 14px');
  animBtn.style('border', 'none');
  animBtn.style('border-radius', '4px');
  animBtn.style('cursor', 'pointer');
  animBtn.style('font-weight', 'bold');
  animBtn.style('background', INDIGO);
  animBtn.style('color', 'white');
  animBtn.mousePressed(() => {
    if (!isAnimating) {
      isAnimating = true;
      animProgress = 0;
      particles = [];
      spawnParticle();
    }
  });

  stressBtn = createButton('Normal State');
  stressBtn.parent('canvas-container');
  stressBtn.style('font-size', '11px');
  stressBtn.style('padding', '4px 14px');
  stressBtn.style('border', 'none');
  stressBtn.style('border-radius', '4px');
  stressBtn.style('cursor', 'pointer');
  stressBtn.style('font-weight', 'bold');
  stressBtn.style('background', '#ddd');
  stressBtn.style('color', '#333');
  stressBtn.mousePressed(() => {
    stressMode = !stressMode;
    stressBtn.elt.textContent = stressMode ? 'Stress State' : 'Normal State';
    stressBtn.style('background', stressMode ? '#C83232' : '#ddd');
    stressBtn.style('color', stressMode ? 'white' : '#333');
  });

  positionUI();
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasW, canvasH);
  positionUI();
}

function positionUI() {
  let y = canvasH + 6;
  animBtn.position(15, y);
  stressBtn.position(animBtn.elt.offsetWidth + 30, y);
}

function spawnParticle() {
  let sColor = stressMode ? color(200, 50, 50) : color(60, 160, 60);
  particles.push({ x: 0, stage: 0, progress: 0, col: sColor, active: true });
  if (stressMode) {
    // Spawn extra particles in stress mode
    setTimeout(() => particles.push({ x: 0, stage: 0, progress: 0, col: color(210, 160, 0), active: true }), 300);
    setTimeout(() => particles.push({ x: 0, stage: 0, progress: 0, col: color(200, 50, 50), active: true }), 600);
  }
}

function getStagePositions() {
  let margin = 30;
  let stageW = (canvasW - margin * 2 - 40) / 5;
  let positions = [];
  for (let i = 0; i < 5; i++) {
    positions.push({
      x: margin + i * (stageW + 10),
      y: 60,
      w: stageW,
      h: 100
    });
  }
  return positions;
}

function draw() {
  background(245);
  drawTitle();

  let positions = getStagePositions();
  drawConnections(positions);
  drawStages(positions);
  drawDetailPanel(positions);
  drawMetricSources(positions[0]);
  drawRoutingDetail(positions[3]);
  updateParticles(positions);
  drawParticles(positions);

  // Check hover
  hoveredStage = -1;
  for (let i = 0; i < 5; i++) {
    let p = positions[i];
    if (mouseX >= p.x && mouseX <= p.x + p.w && mouseY >= p.y && mouseY <= p.y + p.h) {
      hoveredStage = i;
    }
  }
}

function drawTitle() {
  fill(INDIGO_DARK);
  textSize(15);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('Alert System Architecture', 15, 24);
  textStyle(NORMAL);

  fill('#666');
  textSize(10);
  textAlign(RIGHT, CENTER);
  text(stressMode ? 'Mode: Stress (multiple breaches)' : 'Mode: Normal operation', canvasW - 15, 24);
}

function drawConnections(positions) {
  // Flow arrows between stages
  for (let i = 0; i < 4; i++) {
    let from = positions[i];
    let to = positions[i + 1];
    let fromX = from.x + from.w;
    let toX = to.x;
    let midY = from.y + from.h / 2;

    stroke(180);
    strokeWeight(2);
    line(fromX, midY, toX, midY);

    // Arrowhead
    fill(180);
    noStroke();
    triangle(toX, midY, toX - 8, midY - 5, toX - 8, midY + 5);
  }

  // Feedback loop (curved arrow from stage 5 back to stage 2)
  let s5 = positions[4];
  let s2 = positions[1];
  noFill();
  stroke(AMBER);
  strokeWeight(1.5);
  drawingContext.setLineDash([6, 4]);

  let feedbackY = positions[0].y + positions[0].h + 120;
  // Down from stage 5
  line(s5.x + s5.w / 2, s5.y + s5.h, s5.x + s5.w / 2, feedbackY);
  // Across
  line(s5.x + s5.w / 2, feedbackY, s2.x + s2.w / 2, feedbackY);
  // Up to stage 2
  line(s2.x + s2.w / 2, feedbackY, s2.x + s2.w / 2, s2.y + s2.h);

  drawingContext.setLineDash([]);

  // Arrowhead
  fill(AMBER);
  noStroke();
  triangle(s2.x + s2.w / 2, s2.y + s2.h, s2.x + s2.w / 2 - 5, s2.y + s2.h + 8, s2.x + s2.w / 2 + 5, s2.y + s2.h + 8);

  // Feedback label
  fill(AMBER_DARK);
  textSize(9);
  textStyle(ITALIC);
  textAlign(CENTER, CENTER);
  text('Feedback Loop: Action Taken? Metric Changed? Refine Thresholds', (s5.x + s2.x + s2.w) / 2, feedbackY - 10);
  textStyle(NORMAL);
}

function drawStages(positions) {
  for (let i = 0; i < 5; i++) {
    let p = positions[i];
    let s = STAGES[i];
    let isSelected = (i === selectedStage);
    let isHovered = (i === hoveredStage);

    // Stage box
    if (isSelected) {
      fill(s.color);
      stroke(INDIGO_DARK);
      strokeWeight(3);
    } else if (isHovered) {
      fill(255);
      stroke(s.color);
      strokeWeight(2);
    } else {
      fill(255);
      stroke(s.color);
      strokeWeight(1.5);
    }
    rect(p.x, p.y, p.w, p.h, 10);
    noStroke();

    // Stage number
    fill(isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.06)');
    textSize(32);
    textStyle(BOLD);
    textAlign(RIGHT, BOTTOM);
    text(i + 1, p.x + p.w - 8, p.y + p.h - 4);

    // Stage name
    fill(isSelected ? 255 : s.color);
    textSize(11);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    let lines = s.name.split('\n');
    for (let l = 0; l < lines.length; l++) {
      text(lines[l], p.x + p.w / 2, p.y + p.h / 2 - 6 + l * 14);
    }

    // Threshold indicators for stage 2
    if (i === 1) {
      let indicators = stressMode ?
        [{ col: color(60, 160, 60), n: 2 }, { col: color(210, 160, 0), n: 2 }, { col: color(200, 50, 50), n: 1 }] :
        [{ col: color(60, 160, 60), n: 4 }, { col: color(210, 160, 0), n: 1 }, { col: color(200, 50, 50), n: 0 }];
      let ix = p.x + 8;
      let iy = p.y + p.h - 18;
      for (let ind of indicators) {
        for (let j = 0; j < ind.n; j++) {
          fill(ind.col);
          ellipse(ix, iy, 8, 8);
          ix += 12;
        }
      }
    }
  }
  textStyle(NORMAL);
}

function drawMetricSources(pos) {
  // Small icons for metric inputs on the left of stage 1
  let sx = pos.x - 6;
  let sy = pos.y + pos.h + 10;

  fill(INDIGO_DARK);
  textSize(9);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('Input Metrics:', sx, sy);
  textStyle(NORMAL);

  textSize(8);
  fill('#555');
  for (let i = 0; i < METRICS_LIST.length; i++) {
    let my = sy + 14 + i * 12;
    fill(INDIGO_LIGHT);
    noStroke();
    rect(sx, my, 4, 4, 1);
    fill('#555');
    text(METRICS_LIST[i], sx + 8, my - 2);
  }
}

function drawRoutingDetail(pos) {
  // Routing rules below stage 4
  let rx = pos.x - 10;
  let ry = pos.y + pos.h + 10;

  fill(INDIGO_DARK);
  textSize(9);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('Routing Rules:', rx, ry);
  textStyle(NORMAL);

  textSize(8);
  for (let i = 0; i < ROUTING_RULES.length; i++) {
    let r = ROUTING_RULES[i];
    let my = ry + 14 + i * 13;
    fill('#555');
    text(r.type + ' \u2192 ' + r.recipients, rx, my);
  }
}

function drawDetailPanel(positions) {
  if (selectedStage < 0) return;

  let py = 320;
  let ph = canvasH - py - 10;
  let px = 15;
  let pw = canvasW - 30;

  fill(CHAMPAGNE);
  noStroke();
  rect(px, py, pw, ph, 8);

  let s = STAGES[selectedStage];
  fill(INDIGO_DARK);
  textSize(12);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('Stage ' + (selectedStage + 1) + ': ' + s.name.replace('\n', ' '), px + 12, py + 10);

  // Close
  fill('#999');
  textSize(14);
  textAlign(RIGHT, TOP);
  text('\u00D7', px + pw - 10, py + 8);

  // Description
  fill('#333');
  textSize(10);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);

  // Word wrap
  let words = s.desc.split(' ');
  let line = '';
  let maxW = pw - 24;
  let ty = py + 30;
  for (let w of words) {
    let test = line ? line + ' ' + w : w;
    if (textWidth(test) > maxW && line) {
      text(line, px + 12, ty);
      ty += 14;
      line = w;
    } else {
      line = test;
    }
  }
  if (line) text(line, px + 12, ty);
}

function updateParticles(positions) {
  for (let p of particles) {
    if (!p.active) continue;
    p.progress += 0.015;
    if (p.progress >= 5) {
      p.active = false;
      continue;
    }
    p.stage = Math.floor(p.progress);
  }

  particles = particles.filter(p => p.active);
  if (isAnimating && particles.length === 0) {
    isAnimating = false;
  }
}

function drawParticles(positions) {
  for (let p of particles) {
    if (!p.active) continue;
    let stageIdx = Math.floor(p.progress);
    let frac = p.progress - stageIdx;

    if (stageIdx >= 5) continue;

    let pos = positions[stageIdx];
    let nextPos = stageIdx < 4 ? positions[stageIdx + 1] : null;

    let px, py;
    if (nextPos && frac > 0.5) {
      // Moving between stages
      let t = (frac - 0.5) * 2;
      px = lerp(pos.x + pos.w, nextPos.x, t);
      py = pos.y + pos.h / 2;
    } else {
      // Within stage
      let t = frac * 2;
      px = pos.x + t * pos.w;
      py = pos.y + pos.h / 2 + sin(frameCount * 0.1 + p.progress * 10) * 5;
    }

    // Glow
    noStroke();
    fill(red(p.col), green(p.col), blue(p.col), 60);
    ellipse(px, py, 18, 18);
    fill(p.col);
    ellipse(px, py, 10, 10);
    fill(255);
    ellipse(px, py, 4, 4);
  }
}

function mousePressed() {
  let positions = getStagePositions();

  // Check stage clicks
  for (let i = 0; i < 5; i++) {
    let p = positions[i];
    if (mouseX >= p.x && mouseX <= p.x + p.w && mouseY >= p.y && mouseY <= p.y + p.h) {
      selectedStage = (selectedStage === i) ? -1 : i;
      return;
    }
  }

  // Check close button
  if (selectedStage >= 0) {
    let closeX = canvasW - 25;
    let closeY = 328;
    if (dist(mouseX, mouseY, closeX, closeY) < 15) {
      selectedStage = -1;
    }
  }
}
