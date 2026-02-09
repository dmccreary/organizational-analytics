// AI Content Detection Pipeline MicroSim
// Flowchart showing a message passing through three parallel detection paths
// (Perplexity, Stylometric, Behavioral) converging to a weighted score and classification
// MicroSim template version 2026.02

// ---- Canvas dimensions ----
let canvasWidth = 400;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let sliderLeftMargin = 160;
let defaultTextSize = 16;

// ---- Aria palette ----
const INDIGO       = '#303F9F';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER        = '#D4880F';
const AMBER_DARK   = '#B06D0B';
const GOLD         = '#FFD700';

// ---- State ----
let thresholdSlider;
let hoveredPath = -1;      // 0,1,2 or -1
let expandedPath = -1;     // 0,1,2 or -1

// Simulated scores (fixed for visual clarity)
const pathScores = [0.72, 0.58, 0.41];
const pathWeights = [0.35, 0.40, 0.25];

// Path definitions
const paths = [
  {
    name: 'Perplexity\nAnalysis',
    color: INDIGO,
    steps: ['Tokenize text', 'Compute perplexity', 'Compare to baseline'],
    output: 'perplexity_delta',
    score: 0.72,
    weight: 0.35,
    detail: [
      'Measures how "surprised" a',
      'language model is by the text.',
      'Low perplexity = likely AI.'
    ]
  },
  {
    name: 'Stylometric\nAnalysis',
    color: AMBER,
    steps: ['Extract features', 'Compare to profile', 'Compute deviation'],
    output: 'style_deviation',
    score: 0.58,
    weight: 0.40,
    detail: [
      'Compares writing fingerprint',
      'against sender\'s historical',
      'communication patterns.'
    ]
  },
  {
    name: 'Behavioral\nSignals',
    color: INDIGO_LIGHT,
    steps: ['Check compose time', 'Check quality shift', 'Check volume anomaly'],
    output: 'behavioral_anomaly',
    score: 0.41,
    weight: 0.25,
    detail: [
      'Detects anomalies in timing,',
      'quality shifts, and sudden',
      'volume changes in messages.'
    ]
  }
];

// ---- Layout constants (computed in draw) ----
let pathBoxWidth, pathBoxHeight, pathStartX, pathStartY, pathGap;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  // Threshold slider
  thresholdSlider = createSlider(0, 100, 55, 1);
  thresholdSlider.parent(document.querySelector('main'));
  thresholdSlider.position(sliderLeftMargin, drawHeight + 12);
  thresholdSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('Flowchart showing three parallel AI content detection paths converging to a weighted score with adjustable threshold.', LABEL);
}

function draw() {
  updateCanvasSize();

  // Draw area background
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);

  // Control area background
  noStroke();
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  noStroke();
  fill(INDIGO);
  textAlign(CENTER, TOP);
  textSize(18);
  textStyle(BOLD);
  text('AI Content Detection Pipeline', canvasWidth / 2, 8);
  textStyle(NORMAL);

  // Get threshold
  let threshold = thresholdSlider.value() / 100;

  // Layout
  let contentW = canvasWidth - margin * 2;
  pathBoxWidth = (contentW - 20) / 3;
  pathBoxHeight = 160;
  pathStartX = margin;
  pathStartY = 70;
  pathGap = 10;

  // ---- Entry box: Incoming Communication ----
  let entryW = 200;
  let entryH = 30;
  let entryX = canvasWidth / 2 - entryW / 2;
  let entryY = 34;
  noStroke();
  fill(180);
  rect(entryX, entryY, entryW, entryH, 6);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(12);
  noStroke();
  text('Incoming Communication', entryX + entryW / 2, entryY + entryH / 2);

  // Arrow down from entry to paths
  stroke(120);
  strokeWeight(2);
  let arrowFromY = entryY + entryH;
  line(canvasWidth / 2, arrowFromY, canvasWidth / 2, pathStartY - 2);

  // Branch arrows to each path
  for (let i = 0; i < 3; i++) {
    let px = pathStartX + i * (pathBoxWidth + pathGap);
    let centerX = px + pathBoxWidth / 2;
    stroke(120);
    strokeWeight(1.5);
    line(canvasWidth / 2, pathStartY - 2, centerX, pathStartY);
  }

  // ---- Draw three parallel paths ----
  hoveredPath = -1;
  for (let i = 0; i < 3; i++) {
    let p = paths[i];
    let px = pathStartX + i * (pathBoxWidth + pathGap);
    let py = pathStartY;

    // Hit detection
    if (mouseX >= px && mouseX <= px + pathBoxWidth &&
        mouseY >= py && mouseY <= py + pathBoxHeight) {
      hoveredPath = i;
    }

    let isHovered = (hoveredPath === i);
    let isExpanded = (expandedPath === i);

    // Path box
    noStroke();
    fill(p.color);
    if (isHovered) fill(lerpColor(color(p.color), color(255), 0.2));
    rect(px, py, pathBoxWidth, pathBoxHeight, 8);

    // Path name
    noStroke();
    fill(255);
    textAlign(CENTER, TOP);
    textSize(constrain(pathBoxWidth * 0.12, 10, 13));
    textStyle(BOLD);
    let nameLines = p.name.split('\n');
    for (let li = 0; li < nameLines.length; li++) {
      text(nameLines[li], px + pathBoxWidth / 2, py + 8 + li * 14);
    }

    // Steps
    textStyle(NORMAL);
    textSize(constrain(pathBoxWidth * 0.1, 8, 11));
    fill(255, 255, 255, 220);
    noStroke();
    let stepY = py + 8 + nameLines.length * 14 + 10;
    for (let j = 0; j < p.steps.length; j++) {
      // Step number circle
      fill(255, 255, 255, 100);
      noStroke();
      ellipse(px + 14, stepY + j * 20 + 6, 14, 14);
      fill(p.color);
      textAlign(CENTER, CENTER);
      textSize(9);
      noStroke();
      text(j + 1, px + 14, stepY + j * 20 + 5);

      // Step text
      fill(255, 255, 255, 230);
      textAlign(LEFT, CENTER);
      textSize(constrain(pathBoxWidth * 0.1, 8, 11));
      noStroke();
      text(p.steps[j], px + 24, stepY + j * 20 + 6);
    }

    // Output label
    noStroke();
    fill(255, 255, 255, 160);
    textAlign(CENTER, BOTTOM);
    textSize(10);
    textStyle(ITALIC);
    text(p.output + ': ' + p.score.toFixed(2), px + pathBoxWidth / 2, py + pathBoxHeight - 4);
    textStyle(NORMAL);

    // Arrow down from path to convergence
    let arrowX = px + pathBoxWidth / 2;
    stroke(120);
    strokeWeight(1.5);
    line(arrowX, py + pathBoxHeight, arrowX, py + pathBoxHeight + 15);
  }

  // ---- Convergence: Weighted Score ----
  let convY = pathStartY + pathBoxHeight + 18;
  let convW = contentW * 0.5;
  let convH = 36;
  let convX = canvasWidth / 2 - convW / 2;

  // Convergence arrows
  stroke(120);
  strokeWeight(1.5);
  for (let i = 0; i < 3; i++) {
    let px = pathStartX + i * (pathBoxWidth + pathGap) + pathBoxWidth / 2;
    line(px, pathStartY + pathBoxHeight + 15, canvasWidth / 2, convY);
  }

  // Weighted score box
  let weightedScore = 0;
  for (let i = 0; i < 3; i++) {
    weightedScore += paths[i].score * paths[i].weight;
  }

  noStroke();
  fill(GOLD);
  rect(convX, convY, convW, convH, 6);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(13);
  textStyle(BOLD);
  noStroke();
  text('Weighted Score: ' + weightedScore.toFixed(3), convX + convW / 2, convY + convH / 2);
  textStyle(NORMAL);

  // ---- Decision diamond ----
  let diamY = convY + convH + 20;
  let diamSize = 42;
  let diamCx = canvasWidth / 2;
  let diamCy = diamY + diamSize / 2;

  // Arrow from convergence to diamond
  stroke(120);
  strokeWeight(1.5);
  line(diamCx, convY + convH, diamCx, diamY);

  // Diamond shape
  noStroke();
  fill(240, 230, 200);
  stroke(AMBER_DARK);
  strokeWeight(2);
  quad(diamCx, diamY, diamCx + diamSize / 2, diamCy,
       diamCx, diamY + diamSize, diamCx - diamSize / 2, diamCy);

  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(9);
  text('Score >\nThreshold?', diamCx, diamCy);

  // ---- Decision outcomes ----
  let outY = diamY + diamSize + 10;
  let isAI = weightedScore > threshold;

  // Left branch: AI_ASSISTED
  let leftX = canvasWidth / 2 - 100;
  stroke(120);
  strokeWeight(1.5);
  line(diamCx - diamSize / 2, diamCy, leftX + 50, outY);

  noStroke();
  fill(isAI ? AMBER : '#ccc');
  rect(leftX, outY, 100, 30, 6);
  fill(isAI ? 255 : 100);
  textAlign(CENTER, CENTER);
  textSize(11);
  textStyle(BOLD);
  noStroke();
  text('AI_ASSISTED', leftX + 50, outY + 15);

  // Yes label
  noStroke();
  fill(isAI ? AMBER_DARK : '#999');
  textSize(10);
  textStyle(BOLD);
  textAlign(RIGHT, CENTER);
  text('Yes', diamCx - diamSize / 2 - 4, diamCy);

  // Right branch: HUMAN_AUTHORED
  let rightX = canvasWidth / 2 + 10;
  stroke(120);
  strokeWeight(1.5);
  line(diamCx + diamSize / 2, diamCy, rightX + 50, outY);

  noStroke();
  fill(isAI ? '#ccc' : '#4CAF50');
  rect(rightX, outY, 110, 30, 6);
  fill(isAI ? 100 : 255);
  textAlign(CENTER, CENTER);
  textSize(11);
  textStyle(BOLD);
  noStroke();
  text('HUMAN_AUTHORED', rightX + 55, outY + 15);

  // No label
  noStroke();
  fill(isAI ? '#999' : '#2E7D32');
  textSize(10);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('No', diamCx + diamSize / 2 + 4, diamCy);
  textStyle(NORMAL);

  // ---- Graph Enrichment box ----
  let geY = outY + 40;
  let geW = 180;
  let geX = canvasWidth / 2 - geW / 2;
  let geH = 26;

  // Arrows from both outcomes to graph enrichment
  stroke(120);
  strokeWeight(1.5);
  line(leftX + 50, outY + 30, canvasWidth / 2, geY);
  line(rightX + 55, outY + 30, canvasWidth / 2, geY);

  noStroke();
  fill(INDIGO);
  rect(geX, geY, geW, geH, 6);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(11);
  noStroke();
  text('Graph Enrichment', geX + geW / 2, geY + geH / 2);

  // ---- Expanded detail panel ----
  if (expandedPath >= 0 && expandedPath < 3) {
    let p = paths[expandedPath];
    let panelW = 200;
    let panelH = 80;
    let px = pathStartX + expandedPath * (pathBoxWidth + pathGap);
    let panelX = px + pathBoxWidth / 2 - panelW / 2;
    let panelY = pathStartY - panelH - 8;

    panelX = constrain(panelX, margin, canvasWidth - margin - panelW);
    panelY = constrain(panelY, 4, drawHeight - panelH - 4);

    fill(255, 255, 255, 245);
    stroke(p.color);
    strokeWeight(2);
    rect(panelX, panelY, panelW, panelH, 8);

    noStroke();
    fill(p.color);
    textAlign(LEFT, TOP);
    textSize(11);
    textStyle(BOLD);
    text(p.name.replace('\n', ' '), panelX + 10, panelY + 8);
    textStyle(NORMAL);

    fill(60);
    textSize(10);
    for (let li = 0; li < p.detail.length; li++) {
      noStroke();
      text(p.detail[li], panelX + 10, panelY + 26 + li * 14);
    }
  }

  // ---- Slider label ----
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Threshold: ' + (threshold * 100).toFixed(0) + '%', 10, drawHeight + 25);

  // Reposition slider on resize
  thresholdSlider.position(sliderLeftMargin, drawHeight + 12);
  thresholdSlider.size(canvasWidth - sliderLeftMargin - margin);
}

function mousePressed() {
  // Toggle expanded path on click
  for (let i = 0; i < 3; i++) {
    let px = pathStartX + i * (pathBoxWidth + pathGap);
    if (mouseX >= px && mouseX <= px + pathBoxWidth &&
        mouseY >= pathStartY && mouseY <= pathStartY + pathBoxHeight) {
      expandedPath = (expandedPath === i) ? -1 : i;
      return;
    }
  }
  expandedPath = -1;
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  thresholdSlider.size(canvasWidth - sliderLeftMargin - margin);
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
}
