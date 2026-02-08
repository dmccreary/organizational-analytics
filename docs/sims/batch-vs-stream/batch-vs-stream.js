// Batch vs Stream Processing MicroSim
// Split-screen comparison of batch and stream processing pipelines
// Canvas-based controls only (no DOM elements)
// MicroSim template version 2026.02

let canvasWidth = 400;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;

// Aria color palette
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const AMBER_LIGHT = '#F5C14B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';

// Animation state
let isRunning = false;
let frameCounter = 0;

// Event rate: 0=Slow, 1=Medium, 2=Burst
let eventRate = 1;
let eventRateLabels = ['Slow', 'Medium', 'Burst'];
let spawnIntervals = [90, 45, 15]; // frames between spawns

// Failure simulation
let failureActive = false;
let failureTimer = 0;
let failureDuration = 180; // frames (about 3 seconds)

// Batch processing state
let batchBuffer = [];
let batchTimerMax = 300; // frames for one batch cycle (about 5 seconds)
let batchTimer = 300;
let batchProcessing = false;
let batchProcessingTimer = 0;
let batchProcessingDuration = 60; // frames for batch to move through pipeline
let batchTransformEvents = [];
let batchLoadEvents = [];
let batchEventsProcessed = 0;
let batchLatencySum = 0;
let batchErrors = 0;
let batchGraphNodes = 0;
let batchGraphEdges = 0;
let batchGraphAge = 0; // frames since last batch completed
let batchRollbackActive = false;
let batchRollbackTimer = 0;

// Stream processing state
let streamEvents = []; // events flowing through the pipeline
let streamEventsProcessed = 0;
let streamLatencySum = 0;
let streamErrors = 0;
let streamGraphNodes = 0;
let streamGraphEdges = 0;
let streamGraphAge = 0; // frames since last event loaded
let streamDeadLetterQueue = [];
let deadLetterFlash = 0;

// Event types with colors
let eventTypes = [
  { label: 'Email', color: '#303F9F' },
  { label: 'Chat', color: '#D4880F' },
  { label: 'Calendar', color: '#7B1FA2' },
  { label: 'Badge', color: '#2E7D32' },
  { label: 'App', color: '#C62828' }
];

// Button definitions (computed in draw based on canvasWidth)
let buttons = {};

// Next spawn timing
let nextSpawnTime = 0;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));
  textFont('Arial');
  describe('Split-screen comparison of batch and stream processing pipelines showing events flowing through transform and load stages, with controls for event rate, failure simulation, and metrics comparison.', LABEL);
}

function draw() {
  updateCanvasSize();

  // Draw area background
  fill(CHAMPAGNE);
  noStroke();
  rect(0, 0, canvasWidth, drawHeight);

  // Control area background
  fill('white');
  stroke('silver');
  strokeWeight(1);
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Layout calculations
  let halfHeight = (drawHeight - 60) / 2; // space for each half minus metrics
  let topY = 0;
  let dividerY = halfHeight + 2;
  let bottomY = dividerY + 4;
  let metricsY = drawHeight - 55;

  // Update animation
  if (isRunning) {
    frameCounter++;
    batchGraphAge++;
    streamGraphAge++;

    // Spawn events
    if (frameCounter >= nextSpawnTime) {
      spawnEvents();
      nextSpawnTime = frameCounter + spawnIntervals[eventRate];
    }

    // Update batch pipeline
    updateBatch();

    // Update stream pipeline
    updateStream();

    // Update failure
    if (failureActive) {
      failureTimer--;
      if (failureTimer <= 0) {
        failureActive = false;
        batchRollbackActive = false;
      }
    }

    // Dead letter flash decay
    if (deadLetterFlash > 0) deadLetterFlash--;
  }

  // Draw top half: Batch Processing
  drawBatchHalf(topY, halfHeight);

  // Draw divider
  drawDivider(dividerY);

  // Draw bottom half: Stream Processing
  drawStreamHalf(bottomY, halfHeight);

  // Draw metrics panel
  drawMetrics(metricsY);

  // Draw controls
  drawControls();
}

function spawnEvents() {
  let typeIdx = floor(random(eventTypes.length));
  let evt = {
    type: eventTypes[typeIdx],
    spawnFrame: frameCounter,
    id: frameCounter + random(1000)
  };

  // Add to batch buffer
  batchBuffer.push({ ...evt });

  // Add to stream pipeline (starts at progress 0)
  streamEvents.push({
    ...evt,
    progress: 0, // 0=source, 0.33=transform, 0.66=load, 1.0=done
    speed: 0.012 + random(0.004),
    yOffset: random(-4, 4),
    failed: false
  });
}

function updateBatch() {
  if (batchRollbackActive) {
    batchRollbackTimer--;
    if (batchRollbackTimer <= 0) {
      batchRollbackActive = false;
    }
    return;
  }

  if (!batchProcessing) {
    // Count down batch timer
    batchTimer--;
    if (batchTimer <= 0) {
      // Start batch processing
      batchProcessing = true;
      batchProcessingTimer = batchProcessingDuration;
      batchTransformEvents = batchBuffer.slice();
      batchBuffer = [];
    }
  } else {
    batchProcessingTimer--;

    // Move events through stages
    if (batchProcessingTimer <= batchProcessingDuration * 0.5 && batchTransformEvents.length > 0) {
      batchLoadEvents = batchTransformEvents.slice();
      batchTransformEvents = [];
    }

    if (batchProcessingTimer <= 0) {
      // Check for failure during batch
      if (failureActive && !batchRollbackActive) {
        // Rollback entire batch
        batchRollbackActive = true;
        batchRollbackTimer = 90;
        batchErrors += batchLoadEvents.length;
        batchLoadEvents = [];
        batchTransformEvents = [];
        batchProcessing = false;
        batchTimer = batchTimerMax;
        return;
      }

      // Batch complete
      let count = batchLoadEvents.length;
      batchEventsProcessed += count;
      for (let e of batchLoadEvents) {
        batchLatencySum += (frameCounter - e.spawnFrame);
      }
      batchGraphNodes += floor(count * 1.5);
      batchGraphEdges += count;
      batchGraphAge = 0;
      batchLoadEvents = [];
      batchProcessing = false;
      batchTimer = batchTimerMax;
    }
  }
}

function updateStream() {
  for (let i = streamEvents.length - 1; i >= 0; i--) {
    let evt = streamEvents[i];

    // Check failure at transform stage
    if (failureActive && !evt.failed && evt.progress > 0.25 && evt.progress < 0.45 && random() < 0.3) {
      evt.failed = true;
      streamDeadLetterQueue.push(evt.type);
      if (streamDeadLetterQueue.length > 8) streamDeadLetterQueue.shift();
      deadLetterFlash = 30;
      streamErrors++;
      streamEvents.splice(i, 1);
      continue;
    }

    evt.progress += evt.speed;

    if (evt.progress >= 1.0) {
      streamEventsProcessed++;
      streamLatencySum += (frameCounter - evt.spawnFrame);
      streamGraphNodes += floor(random(1, 3));
      streamGraphEdges++;
      streamGraphAge = 0;
      streamEvents.splice(i, 1);
    }
  }
}

function drawBatchHalf(y, h) {
  // Section background
  fill(255, 255, 255, 180);
  noStroke();
  rect(4, y + 2, canvasWidth - 8, h - 2, 6);

  // Section label
  fill(INDIGO_DARK);
  noStroke();
  textSize(constrain(canvasWidth * 0.032, 11, 15));
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('BATCH PROCESSING', margin, y + 6);
  textStyle(NORMAL);

  let pipeY = y + 28;
  let pipeH = h - 34;

  // Layout zones
  let zoneW = (canvasWidth - margin * 2) / 5;
  let sourceX = margin;
  let bufferX = margin + zoneW;
  let transformX = margin + zoneW * 2;
  let loadX = margin + zoneW * 3;
  let graphX = margin + zoneW * 4;

  let stageBoxH = pipeH * 0.55;
  let stageBoxY = pipeY + pipeH * 0.05;
  let stageBoxW = zoneW * 0.85;

  // Draw flow arrows
  stroke('#ccc');
  strokeWeight(2);
  let arrowY = stageBoxY + stageBoxH / 2;
  for (let i = 0; i < 4; i++) {
    let ax1 = margin + zoneW * (i + 0.85);
    let ax2 = margin + zoneW * (i + 1.08);
    line(ax1, arrowY, ax2, arrowY);
    // Arrowhead
    fill('#ccc');
    noStroke();
    triangle(ax2, arrowY - 4, ax2, arrowY + 4, ax2 + 5, arrowY);
    stroke('#ccc');
    strokeWeight(2);
  }

  // Source stage
  drawStageBox(sourceX + zoneW * 0.075, stageBoxY, stageBoxW, stageBoxH, 'Sources', INDIGO_LIGHT, false);
  // Draw source dots
  let dotSize = 6;
  for (let i = 0; i < min(3, eventTypes.length); i++) {
    fill(eventTypes[i].color);
    noStroke();
    let dx = sourceX + zoneW * 0.3 + (i % 2) * 14;
    let dy = stageBoxY + stageBoxH * 0.55 + floor(i / 2) * 12;
    ellipse(dx, dy, dotSize, dotSize);
  }

  // Buffer stage
  let bufferFill = batchBuffer.length > 10 ? '#FFF3E0' : '#FFFFFF';
  drawStageBox(bufferX + zoneW * 0.075, stageBoxY, stageBoxW, stageBoxH, 'Buffer', AMBER, false, bufferFill);

  // Draw buffer dots (accumulated events)
  let maxDotsShown = 12;
  let bufCount = min(batchBuffer.length, maxDotsShown);
  for (let i = 0; i < bufCount; i++) {
    let evt = batchBuffer[i];
    fill(evt.type.color);
    noStroke();
    let dx = bufferX + zoneW * 0.2 + (i % 4) * 10;
    let dy = stageBoxY + stageBoxH * 0.45 + floor(i / 4) * 10;
    ellipse(dx, dy, 6, 6);
  }
  if (batchBuffer.length > maxDotsShown) {
    fill('#999');
    noStroke();
    textSize(9);
    textAlign(CENTER, CENTER);
    text('+' + (batchBuffer.length - maxDotsShown), bufferX + zoneW * 0.5, stageBoxY + stageBoxH * 0.85);
  }

  // Batch timer
  if (!batchProcessing && !batchRollbackActive) {
    let timerSeconds = max(0, ceil(batchTimer / 60));
    fill(AMBER_DARK);
    noStroke();
    textSize(constrain(canvasWidth * 0.022, 8, 11));
    textAlign(CENTER, TOP);
    text('Next batch: ' + timerSeconds + 's', bufferX + zoneW * 0.5, stageBoxY + stageBoxH + 4);

    // Timer bar
    let barW = stageBoxW * 0.8;
    let barX = bufferX + zoneW * 0.075 + stageBoxW * 0.1;
    let barY = stageBoxY + stageBoxH + 16;
    stroke('#ddd');
    strokeWeight(1);
    fill('#eee');
    rect(barX, barY, barW, 5, 2);
    noStroke();
    fill(AMBER);
    let progress = 1 - (batchTimer / batchTimerMax);
    rect(barX, barY, barW * progress, 5, 2);
  }

  // Transform stage
  let transformHighlight = batchTransformEvents.length > 0;
  drawStageBox(transformX + zoneW * 0.075, stageBoxY, stageBoxW, stageBoxH, 'Transform', INDIGO, transformHighlight);
  if (batchTransformEvents.length > 0) {
    let tc = min(batchTransformEvents.length, 6);
    for (let i = 0; i < tc; i++) {
      fill(batchTransformEvents[i].type.color);
      noStroke();
      let dx = transformX + zoneW * 0.25 + (i % 3) * 10;
      let dy = stageBoxY + stageBoxH * 0.5 + floor(i / 3) * 10;
      ellipse(dx, dy, 6, 6);
    }
  }

  // Load stage
  let loadHighlight = batchLoadEvents.length > 0;
  drawStageBox(loadX + zoneW * 0.075, stageBoxY, stageBoxW, stageBoxH, 'Load', INDIGO, loadHighlight);
  if (batchLoadEvents.length > 0) {
    let lc = min(batchLoadEvents.length, 6);
    for (let i = 0; i < lc; i++) {
      fill(batchLoadEvents[i].type.color);
      noStroke();
      let dx = loadX + zoneW * 0.25 + (i % 3) * 10;
      let dy = stageBoxY + stageBoxH * 0.5 + floor(i / 3) * 10;
      ellipse(dx, dy, 6, 6);
    }
  }

  // Graph DB stage
  drawStageBox(graphX + zoneW * 0.075, stageBoxY, stageBoxW, stageBoxH, 'Graph DB', INDIGO_DARK, false);
  // Node/edge counts
  fill(INDIGO_DARK);
  noStroke();
  textSize(constrain(canvasWidth * 0.02, 7, 10));
  textAlign(CENTER, CENTER);
  text('N:' + batchGraphNodes, graphX + zoneW * 0.5, stageBoxY + stageBoxH * 0.5);
  text('E:' + batchGraphEdges, graphX + zoneW * 0.5, stageBoxY + stageBoxH * 0.65);

  // Freshness indicator
  let batchAgeStr = formatAge(batchGraphAge);
  fill(batchGraphAge > 180 ? '#C62828' : '#666');
  textSize(constrain(canvasWidth * 0.02, 7, 10));
  textAlign(CENTER, TOP);
  text('Age: ' + batchAgeStr, graphX + zoneW * 0.5, stageBoxY + stageBoxH + 4);

  // Rollback indicator
  if (batchRollbackActive) {
    fill(255, 0, 0, 150 + sin(frameCount * 0.2) * 100);
    noStroke();
    textSize(constrain(canvasWidth * 0.028, 10, 14));
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text('ROLLBACK!', transformX + zoneW, stageBoxY + stageBoxH + 20);
    textStyle(NORMAL);
  }
}

function drawStreamHalf(y, h) {
  // Section background
  fill(255, 255, 255, 180);
  noStroke();
  rect(4, y + 2, canvasWidth - 8, h - 58, 6);

  // Section label
  fill(INDIGO_DARK);
  noStroke();
  textSize(constrain(canvasWidth * 0.032, 11, 15));
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('STREAM PROCESSING', margin, y + 6);
  textStyle(NORMAL);

  let pipeY = y + 28;
  let pipeH = h - 88;

  // Layout zones
  let zoneW = (canvasWidth - margin * 2) / 4;
  let sourceX = margin;
  let transformX = margin + zoneW;
  let loadX = margin + zoneW * 2;
  let graphX = margin + zoneW * 3;

  let stageBoxH = pipeH * 0.6;
  let stageBoxY = pipeY + pipeH * 0.05;
  let stageBoxW = zoneW * 0.82;

  // Draw flow track
  let trackY = stageBoxY + stageBoxH / 2;
  stroke('#e0e0e0');
  strokeWeight(3);
  line(sourceX + zoneW * 0.5, trackY, graphX + zoneW * 0.5, trackY);

  // Draw flow arrows
  stroke('#ccc');
  strokeWeight(2);
  for (let i = 0; i < 3; i++) {
    let ax1 = margin + zoneW * (i + 0.85);
    let ax2 = margin + zoneW * (i + 1.08);
    line(ax1, trackY, ax2, trackY);
    fill('#ccc');
    noStroke();
    triangle(ax2, trackY - 4, ax2, trackY + 4, ax2 + 5, trackY);
    stroke('#ccc');
    strokeWeight(2);
  }

  // Source stage
  drawStageBox(sourceX + zoneW * 0.09, stageBoxY, stageBoxW, stageBoxH, 'Sources', INDIGO_LIGHT, false);

  // Transform stage
  drawStageBox(transformX + zoneW * 0.09, stageBoxY, stageBoxW, stageBoxH, 'Transform', INDIGO, false);

  // Load stage
  drawStageBox(loadX + zoneW * 0.09, stageBoxY, stageBoxW, stageBoxH, 'Load', INDIGO, false);

  // Graph DB stage
  drawStageBox(graphX + zoneW * 0.09, stageBoxY, stageBoxW, stageBoxH, 'Graph DB', INDIGO_DARK, false);

  // Node/edge counts
  fill(INDIGO_DARK);
  noStroke();
  textSize(constrain(canvasWidth * 0.02, 7, 10));
  textAlign(CENTER, CENTER);
  text('N:' + streamGraphNodes, graphX + zoneW * 0.5, stageBoxY + stageBoxH * 0.5);
  text('E:' + streamGraphEdges, graphX + zoneW * 0.5, stageBoxY + stageBoxH * 0.65);

  // Freshness indicator
  let streamAgeStr = formatAge(streamGraphAge);
  fill(streamGraphAge > 60 ? '#C62828' : '#2E7D32');
  textSize(constrain(canvasWidth * 0.02, 7, 10));
  textAlign(CENTER, TOP);
  text('Age: ' + streamAgeStr, graphX + zoneW * 0.5, stageBoxY + stageBoxH + 4);

  // Draw flowing event tokens
  let trackStartX = sourceX + zoneW * 0.5;
  let trackEndX = graphX + zoneW * 0.5;
  let trackLen = trackEndX - trackStartX;

  for (let evt of streamEvents) {
    let tx = trackStartX + evt.progress * trackLen;
    let ty = trackY + evt.yOffset;
    fill(evt.type.color);
    noStroke();
    ellipse(tx, ty, 8, 8);

    // Glow effect for moving events
    if (isRunning) {
      fill(red(color(evt.type.color)), green(color(evt.type.color)), blue(color(evt.type.color)), 60);
      ellipse(tx, ty, 14, 14);
    }
  }

  // Dead letter queue indicator
  if (streamDeadLetterQueue.length > 0) {
    let dlqX = transformX + zoneW * 0.5;
    let dlqY = stageBoxY + stageBoxH + 14;

    fill(deadLetterFlash > 0 ? '#FFCDD2' : '#FFF');
    stroke('#C62828');
    strokeWeight(1);
    rect(dlqX - 30, dlqY - 8, 60, 18, 4);

    fill('#C62828');
    noStroke();
    textSize(constrain(canvasWidth * 0.018, 7, 9));
    textAlign(CENTER, CENTER);
    text('DLQ: ' + streamDeadLetterQueue.length, dlqX, dlqY);
  }
}

function drawStageBox(x, y, w, h, label, borderColor, highlight, bgFill) {
  stroke(borderColor);
  strokeWeight(highlight ? 3 : 1.5);
  fill(bgFill || (highlight ? lerpColor(color(borderColor), color(255), 0.85) : '#FFFFFF'));
  rect(x, y, w, h, 6);

  fill(borderColor);
  noStroke();
  textSize(constrain(canvasWidth * 0.022, 8, 11));
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  text(label, x + w / 2, y + 5);
  textStyle(NORMAL);
}

function drawDivider(y) {
  // Horizontal divider line
  stroke(INDIGO);
  strokeWeight(2);
  line(margin, y, canvasWidth - margin, y);

  // Labels on divider
  noStroke();
  fill('white');
  rect(canvasWidth * 0.5 - 50, y - 8, 100, 16, 8);
  fill(INDIGO);
  textSize(constrain(canvasWidth * 0.022, 8, 11));
  textAlign(CENTER, CENTER);
  text('vs', canvasWidth * 0.5, y);
}

function drawMetrics(y) {
  // Metrics background
  fill(255, 255, 255, 220);
  stroke(INDIGO_LIGHT);
  strokeWeight(1);
  rect(4, y, canvasWidth - 8, 52, 6);

  let colW = (canvasWidth - margin * 2) / 3;
  let labelY = y + 6;
  let batchValY = y + 22;
  let streamValY = y + 36;

  // Headers
  fill(INDIGO_DARK);
  noStroke();
  textSize(constrain(canvasWidth * 0.022, 8, 11));
  textStyle(BOLD);
  textAlign(CENTER, TOP);

  let col1X = margin + colW * 0.5;
  let col2X = margin + colW * 1.5;
  let col3X = margin + colW * 2.5;

  text('Processed', col1X, labelY);
  text('Avg Latency', col2X, labelY);
  text('Errors', col3X, labelY);

  textStyle(NORMAL);
  textSize(constrain(canvasWidth * 0.02, 7, 10));

  // Batch values
  fill(AMBER_DARK);
  let batchAvgLat = batchEventsProcessed > 0 ? (batchLatencySum / batchEventsProcessed / 60).toFixed(1) + 's' : '--';
  text('Batch: ' + batchEventsProcessed, col1X, batchValY);
  text('Batch: ' + batchAvgLat, col2X, batchValY);
  text('Batch: ' + batchErrors, col3X, batchValY);

  // Stream values
  fill(INDIGO);
  let streamAvgLat = streamEventsProcessed > 0 ? (streamLatencySum / streamEventsProcessed / 60).toFixed(1) + 's' : '--';
  text('Stream: ' + streamEventsProcessed, col1X, streamValY);
  text('Stream: ' + streamAvgLat, col2X, streamValY);
  text('Stream: ' + streamErrors, col3X, streamValY);
}

function drawControls() {
  let btnY = drawHeight + 8;
  let btnH = 30;
  let gap = 8;

  // Compute button positions based on canvas width
  let btnW = constrain((canvasWidth - margin * 2 - gap * 5) / 6, 40, 85);
  let startX = margin;

  // Start/Pause button
  let startBtnX = startX;
  buttons.start = { x: startBtnX, y: btnY, w: btnW, h: btnH };
  drawButton(startBtnX, btnY, btnW, btnH, isRunning ? 'Pause' : 'Start', INDIGO, true);

  // Event rate buttons
  let rateX = startBtnX + btnW + gap;
  let rateBtnW = constrain(btnW * 0.75, 35, 60);
  buttons.rates = [];
  for (let i = 0; i < 3; i++) {
    let bx = rateX + i * (rateBtnW + 4);
    buttons.rates.push({ x: bx, y: btnY, w: rateBtnW, h: btnH });
    let isActive = eventRate === i;
    drawButton(bx, btnY, rateBtnW, btnH, eventRateLabels[i], isActive ? AMBER : '#888', isActive);
  }

  // Failure button
  let failX = rateX + 3 * (rateBtnW + 4) + gap;
  let failW = constrain(btnW * 1.0, 45, 70);
  buttons.failure = { x: failX, y: btnY, w: failW, h: btnH };
  drawButton(failX, btnY, failW, btnH, 'Fail', failureActive ? '#C62828' : '#888', failureActive);

  // Reset button
  let resetX = failX + failW + gap;
  let resetW = constrain(btnW * 0.8, 40, 65);
  buttons.reset = { x: resetX, y: btnY, w: resetW, h: btnH };
  drawButton(resetX, btnY, resetW, btnH, 'Reset', AMBER_DARK, true);
}

function drawButton(x, y, w, h, label, col, active) {
  // Button background
  if (active) {
    fill(col);
    stroke(col);
  } else {
    fill('#e0e0e0');
    stroke('#bbb');
  }
  strokeWeight(1);
  rect(x, y, w, h, 5);

  // Button label
  fill(active ? 'white' : '#666');
  noStroke();
  textSize(constrain(w * 0.2, 8, 12));
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
  textStyle(NORMAL);
}

function formatAge(frames) {
  let seconds = floor(frames / 60);
  if (seconds < 60) return seconds + 's';
  let minutes = floor(seconds / 60);
  let secs = seconds % 60;
  return minutes + 'm ' + (secs < 10 ? '0' : '') + secs + 's';
}

function mousePressed() {
  // Check Start/Pause
  if (buttons.start && hitTest(buttons.start)) {
    isRunning = !isRunning;
    return;
  }

  // Check rate buttons
  if (buttons.rates) {
    for (let i = 0; i < buttons.rates.length; i++) {
      if (hitTest(buttons.rates[i])) {
        eventRate = i;
        return;
      }
    }
  }

  // Check Failure button
  if (buttons.failure && hitTest(buttons.failure)) {
    if (!failureActive) {
      failureActive = true;
      failureTimer = failureDuration;
    }
    return;
  }

  // Check Reset button
  if (buttons.reset && hitTest(buttons.reset)) {
    resetAll();
    return;
  }
}

function hitTest(btn) {
  return mouseX >= btn.x && mouseX <= btn.x + btn.w &&
         mouseY >= btn.y && mouseY <= btn.y + btn.h;
}

function resetAll() {
  isRunning = false;
  frameCounter = 0;
  nextSpawnTime = 0;

  batchBuffer = [];
  batchTimer = batchTimerMax;
  batchProcessing = false;
  batchProcessingTimer = 0;
  batchTransformEvents = [];
  batchLoadEvents = [];
  batchEventsProcessed = 0;
  batchLatencySum = 0;
  batchErrors = 0;
  batchGraphNodes = 0;
  batchGraphEdges = 0;
  batchGraphAge = 0;
  batchRollbackActive = false;

  streamEvents = [];
  streamEventsProcessed = 0;
  streamLatencySum = 0;
  streamErrors = 0;
  streamGraphNodes = 0;
  streamGraphEdges = 0;
  streamGraphAge = 0;
  streamDeadLetterQueue = [];
  deadLetterFlash = 0;

  failureActive = false;
  failureTimer = 0;
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
}
