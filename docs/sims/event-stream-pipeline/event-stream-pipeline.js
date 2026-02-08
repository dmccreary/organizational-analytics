// Complete Event Stream Pipeline MicroSim
// End-to-end visualization of the 5-stage event stream pipeline
// with animated event tokens and speed control
// Built-in p5.js controls
// MicroSim template version 2026.02

let canvasWidth = 400;
let drawHeight = 440;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let sliderLeftMargin = 200;
let defaultTextSize = 16;

// Pipeline stages
let stages = [
  {
    label: 'Capture',
    color: '#D4880F',
    icon: '📥',
    description: 'Events flow from email, chat, calendar, devices, apps',
    sources: ['Email', 'Chat', 'Calendar', 'Devices', 'Apps']
  },
  {
    label: 'Timestamp',
    color: '#5C6BC0',
    icon: '🕐',
    description: 'Convert all timestamps to UTC ISO 8601'
  },
  {
    label: 'Normalize',
    color: '#303F9F',
    icon: '⚙️',
    description: 'Standardize schema, vocabulary, identities'
  },
  {
    label: 'Enrich',
    color: '#303F9F',
    icon: '➕',
    description: 'Add org, temporal, and relationship context'
  },
  {
    label: 'Graph-Ready',
    color: '#B8860B',
    icon: '🔗',
    description: 'Actors → nodes, interactions → edges'
  }
];

// Animation state
let isRunning = false;
let eventTokens = [];
let eventsProcessed = 0;
let nextSpawnTime = 0;
let spawnInterval = 60; // frames between spawns

// Event types with colors
let eventTypes = [
  { label: 'Email', color: '#303F9F' },
  { label: 'Chat', color: '#D4880F' },
  { label: 'Calendar', color: '#B8860B' },
  { label: 'Device', color: '#5C6BC0' },
  { label: 'App', color: '#7B1FA2' }
];

// Interaction state
let expandedStage = -1;

// Controls
let startButton, resetButton;
let speedSlider;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  startButton = createButton('Start');
  startButton.position(10, drawHeight + 10);
  startButton.mousePressed(toggleRunning);
  startButton.style('font-size', '13px');
  startButton.style('padding', '4px 14px');
  startButton.style('border-radius', '6px');
  startButton.style('cursor', 'pointer');
  startButton.style('background-color', '#303F9F');
  startButton.style('color', 'white');
  startButton.style('border', '1px solid #303F9F');

  resetButton = createButton('Reset');
  resetButton.position(80, drawHeight + 10);
  resetButton.mousePressed(resetPipeline);
  resetButton.style('font-size', '13px');
  resetButton.style('padding', '4px 14px');
  resetButton.style('border-radius', '6px');
  resetButton.style('cursor', 'pointer');
  resetButton.style('background-color', '#D4880F');
  resetButton.style('color', 'white');
  resetButton.style('border', '1px solid #D4880F');

  speedSlider = createSlider(1, 5, 2, 1);
  speedSlider.position(sliderLeftMargin, drawHeight + 10);
  speedSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('Interactive animation of the complete event stream pipeline showing events flowing through 5 stages: Capture, Timestamp, Normalize, Enrich, and Graph-Ready.', LABEL);
}

function toggleRunning() {
  isRunning = !isRunning;
  startButton.html(isRunning ? 'Pause' : 'Start');
}

function resetPipeline() {
  isRunning = false;
  eventTokens = [];
  eventsProcessed = 0;
  nextSpawnTime = 0;
  startButton.html('Start');
}

function draw() {
  updateCanvasSize();

  // Background
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);

  // Control area
  fill('white');
  stroke('silver');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(18);
  text('Complete Event Stream Pipeline', canvasWidth / 2, 8);

  // Speed label
  noStroke();
  fill('black');
  textSize(13);
  textAlign(LEFT, CENTER);
  text('Speed: ' + speedSlider.value() + 'x', 150, drawHeight + 22);

  // Pipeline layout
  let pipeY = 38;
  let stageGap = 6;
  let totalGaps = (stages.length - 1) * stageGap;
  let arrowW = 12;
  let totalArrows = (stages.length - 1) * arrowW;
  let stageW = (canvasWidth - margin * 2 - totalGaps - totalArrows) / stages.length;
  let stageH = 70;

  // Draw stages and arrows
  for (let i = 0; i < stages.length; i++) {
    let sx = margin + i * (stageW + stageGap + arrowW);
    let sy = pipeY;
    let stage = stages[i];
    let isExpanded = expandedStage === i;

    // Check hover
    let isHovered = mouseX > sx && mouseX < sx + stageW &&
                    mouseY > sy && mouseY < sy + stageH;

    // Stage box
    stroke(stage.color);
    strokeWeight(isHovered || isExpanded ? 3 : 2);
    fill(isHovered ? lerpColor(color(stage.color), color(255), 0.85) : 'white');
    rect(sx, sy, stageW, stageH, 8);

    // Icon
    noStroke();
    textSize(20);
    textAlign(CENTER, CENTER);
    text(stage.icon, sx + stageW / 2, sy + 22);

    // Label
    fill(stage.color);
    textSize(stageW > 80 ? 11 : 9);
    textStyle(BOLD);
    text(stage.label, sx + stageW / 2, sy + stageH - 16);
    textStyle(NORMAL);

    // Arrow
    if (i < stages.length - 1) {
      let ax = sx + stageW + stageGap / 2;
      let ay = sy + stageH / 2;
      stroke('#bbb');
      strokeWeight(2);
      line(ax, ay, ax + arrowW, ay);
      fill('#bbb');
      noStroke();
      triangle(ax + arrowW - 2, ay - 4, ax + arrowW - 2, ay + 4, ax + arrowW + 2, ay);
    }
  }

  // Draw expanded detail panel
  if (expandedStage >= 0) {
    let stage = stages[expandedStage];
    let panelY = pipeY + stageH + 10;
    let panelH = 55;

    fill(255, 255, 255, 240);
    stroke(stage.color);
    strokeWeight(2);
    rect(margin, panelY, canvasWidth - margin * 2, panelH, 6);

    noStroke();
    fill(stage.color);
    textSize(13);
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    text(stage.label, margin + 10, panelY + 8);

    textStyle(NORMAL);
    fill('#444');
    textSize(12);
    text(stage.description, margin + 10, panelY + 28);
  }

  // Token track
  let trackY = pipeY + stageH + (expandedStage >= 0 ? 78 : 18);
  let trackStartX = margin + stageW / 2;
  let trackEndX = margin + (stages.length - 1) * (stageW + stageGap + arrowW) + stageW / 2;
  let trackLen = trackEndX - trackStartX;

  // Draw track
  stroke('#e0e0e0');
  strokeWeight(4);
  line(trackStartX, trackY, trackEndX, trackY);

  // Draw stage markers on track
  for (let i = 0; i < stages.length; i++) {
    let mx = trackStartX + i * trackLen / (stages.length - 1);
    fill(stages[i].color);
    noStroke();
    ellipse(mx, trackY, 10, 10);
  }

  // Track label
  noStroke();
  fill('#888');
  textSize(10);
  textAlign(CENTER, TOP);
  text('Event Flow', canvasWidth / 2, trackY + 10);

  // Spawn and animate tokens
  let speed = speedSlider.value();
  spawnInterval = max(15, 60 - speed * 10);

  if (isRunning) {
    // Spawn new tokens
    if (frameCount >= nextSpawnTime) {
      let typeIdx = floor(random(eventTypes.length));
      eventTokens.push({
        progress: 0,
        type: eventTypes[typeIdx],
        yOffset: random(-12, 12),
        speed: random(0.005, 0.008) * speed
      });
      nextSpawnTime = frameCount + spawnInterval;
    }

    // Update tokens
    for (let t = eventTokens.length - 1; t >= 0; t--) {
      let token = eventTokens[t];
      token.progress += token.speed;

      if (token.progress >= 1) {
        eventTokens.splice(t, 1);
        eventsProcessed++;
      }
    }
  }

  // Draw tokens
  for (let token of eventTokens) {
    let tx = trackStartX + token.progress * trackLen;
    let ty = trackY + token.yOffset;

    fill(token.type.color);
    noStroke();
    ellipse(tx, ty, 10, 10);

    // Small label on hover
    if (dist(mouseX, mouseY, tx, ty) < 8) {
      fill(50, 50, 50, 200);
      noStroke();
      rect(tx + 8, ty - 12, textWidth(token.type.label) + 10, 18, 4);
      fill(255);
      textSize(10);
      textAlign(LEFT, CENTER);
      text(token.type.label, tx + 13, ty - 3);
    }
  }

  // Events processed counter
  let counterY = trackY + 30;
  noStroke();
  fill('#303F9F');
  textSize(14);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  text('Events Processed: ' + eventsProcessed, canvasWidth / 2, counterY);
  textStyle(NORMAL);

  // Legend
  let legendY = counterY + 25;
  let legendTotalW = eventTypes.length * 75;
  let legendStartX = (canvasWidth - legendTotalW) / 2;

  for (let i = 0; i < eventTypes.length; i++) {
    let lx = legendStartX + i * 75;
    fill(eventTypes[i].color);
    noStroke();
    ellipse(lx, legendY + 6, 8, 8);
    fill('#555');
    textSize(10);
    textAlign(LEFT, CENTER);
    text(eventTypes[i].label, lx + 7, legendY + 6);
  }

  // Source icons at start
  let sourceY = trackY - 35;
  noStroke();
  textSize(12);
  textAlign(CENTER, CENTER);
  let sourceIcons = ['📧', '💬', '📅', '💻', '📱'];
  for (let i = 0; i < sourceIcons.length; i++) {
    let sy = sourceY + i * 14 - 28;
    let sx = trackStartX - 20;
    text(sourceIcons[i], sx, sy);
    // Tiny arrow to track
    stroke('#ccc');
    strokeWeight(1);
    line(sx + 8, sy, trackStartX - 5, trackY);
  }

  // Graph icon at end
  noStroke();
  textSize(24);
  textAlign(CENTER, CENTER);
  text('🔗', trackEndX + 25, trackY);

  // Instruction
  noStroke();
  fill('#777');
  textSize(11);
  textAlign(CENTER, BOTTOM);
  text('Click a stage for details | Press Start to animate', canvasWidth / 2, drawHeight - 5);
}

function mousePressed() {
  // Check stage clicks
  let stageGap = 6;
  let arrowW = 12;
  let stageW = (canvasWidth - margin * 2 - (stages.length - 1) * (stageGap + arrowW)) / stages.length;
  let stageH = 70;
  let pipeY = 38;

  for (let i = 0; i < stages.length; i++) {
    let sx = margin + i * (stageW + stageGap + arrowW);
    if (mouseX > sx && mouseX < sx + stageW &&
        mouseY > pipeY && mouseY < pipeY + stageH) {
      expandedStage = expandedStage === i ? -1 : i;
      break;
    }
  }
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  speedSlider.size(canvasWidth - sliderLeftMargin - margin);
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
}
