// Data Consent Framework MicroSim
// CANVAS_HEIGHT: 515
// A five-stage consent workflow (Notice, Purpose, Scope, Access, Recourse) with a
// feedback loop. Learners pick an analytics scenario and click each stage to see
// how that component of consent applies to it.
// MicroSim template version 2026.03

// ===========================================
// CANVAS LAYOUT
// ===========================================
let containerWidth;
let canvasWidth = 800;
let drawHeight = 470;
let controlHeight = 45;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 10;
let defaultTextSize = 14;

const FLOW_TOP = 46;        // top of the first stage box
const BOX_H = 60;
const BOX_GAP = 21;

// ===========================================
// ARIA COLOR SCHEME
// ===========================================
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';

// ===========================================
// CONTENT
// ===========================================
const stages = [
  { name: 'Notice',
    desc: 'Communicate what data is collected in plain language',
    example: 'An all-staff memo and an intranet page list the data sources in use: email headers, calendar invitations, and chat metadata.',
    check: 'Could any employee say, in one sentence, what is being collected?' },
  { name: 'Purpose',
    desc: 'State explicitly why data is being analyzed',
    example: '"We analyze collaboration patterns to improve how teams work together, not to evaluate individuals."',
    check: 'Is the reason specific enough that a different use would clearly fall outside it?' },
  { name: 'Scope',
    desc: "Define boundaries: what will and won't be analyzed",
    example: '"We will measure communication between departments. We will not read message content."',
    check: 'Does the statement say what will NOT be analyzed, as well as what will?' },
  { name: 'Access',
    desc: 'Disclose who sees results and at what granularity',
    example: '"Analysts work with pseudonymized data. Managers see results only for groups of five or more."',
    check: 'Do employees know who sees results, and whether they are shown for people or for groups?' },
  { name: 'Recourse',
    desc: 'Provide channels for questions, objections, and exclusion',
    example: 'A named privacy contact and a short form for asking questions, objecting, or requesting exclusion.',
    check: 'Is there a real way to object, and does someone answer?' }
];

const scenarios = [
  { name: 'Cross-department collaboration study',
    summary: 'Email and calendar metadata are analyzed to see how well departments are connected.',
    scopeChange: false,
    apply: [
      'Tell all employees that email and calendar metadata (sender, recipient, time) will be analyzed. Message content is not read.',
      'Give the reason: to find where collaboration between departments is weak, so that teams can be better connected.',
      'Department-to-department patterns only. No individual productivity scores and no input to performance reviews.',
      'The analytics team works with pseudonymized data. Leaders see department-level results only.',
      'Name a contact for questions and offer a way to object or to ask to be excluded.'
    ] },
  { name: 'Adding sentiment analysis to email',
    summary: 'A program that covered metadata only now wants to analyze the tone of message text.',
    scopeChange: true,
    apply: [
      'The earlier notice covered metadata only. Issue a new notice explaining that message text will now be analyzed for tone.',
      'State the new reason, such as tracking overall morale after a reorganization. The old purpose statement does not cover it.',
      'Set new boundaries: tone is summarized by team. Individual messages are not read by people or reported.',
      'Disclose who can see sentiment results, and confirm that they are reported for teams and not for individuals.',
      'Reopen the channel for objections. Someone who accepted metadata analysis may object to content analysis.'
    ] },
  { name: 'Burnout pattern detection',
    summary: 'Message timestamps are used to spot after-hours work patterns across departments.',
    scopeChange: false,
    apply: [
      'Explain that message timestamps, not content, will be used to measure after-hours work.',
      'Give the reason: to spot departments where workloads are unsustainable, so that they can be adjusted.',
      'Patterns across departments only. The analysis will not single out individual at-risk employees or report them to managers.',
      'Aggregate results go to leadership and are shared back with the teams whose data contributed.',
      'Provide a way to raise concerns, including the concern that the data could be used to judge individuals.'
    ] }
];

// ===========================================
// STATE
// ===========================================
let scenarioIndex = 0;
let selectedStage = 0;                  // stage shown in the detail panel
let hoveredStage = -1;
let reviewed = [true, false, false, false, false];   // stages opened for this scenario
let scenarioSelect;

// Geometry, recomputed each frame
let flowX = 60, flowW = 300, panelX = 380, panelW = 410;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  const mainElement = document.querySelector('main');
  canvas.parent(mainElement);
  textSize(defaultTextSize);

  scenarioSelect = createSelect();
  scenarioSelect.parent(mainElement);
  scenarios.forEach((s, i) => scenarioSelect.option(s.name, String(i)));
  scenarioSelect.position(90, drawHeight + 11);
  scenarioSelect.changed(() => {
    scenarioIndex = parseInt(scenarioSelect.value(), 10);
    selectedStage = 0;
    reviewed = [true, false, false, false, false];
  });

  describe('Vertical flowchart of the five components of data consent: Notice, Purpose, Scope, Access and Recourse, with a feedback loop back to Notice when the scope changes. Choosing a scenario and clicking a stage shows how that component applies.', LABEL);
}

function draw() {
  updateCanvasSize();

  // Drawing region and control region backgrounds
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  noStroke();
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(canvasWidth < 480 ? 18 : 22);
  text('Data Consent Framework', canvasWidth / 2, 10);
  textStyle(NORMAL);

  computeLayout();
  hoveredStage = stageAt(mouseX, mouseY);

  drawFeedbackLoop();
  drawFlow();
  drawSideNote();
  drawDetailPanel();
  drawControlLabels();
  drawTooltip();

  cursor(hoveredStage >= 0 ? HAND : ARROW);
}

function computeLayout() {
  const narrow = canvasWidth < 560;
  flowX = narrow ? 48 : 60;
  flowW = narrow ? Math.max(120, canvasWidth * 0.34) : Math.min(300, canvasWidth * 0.38);
  panelX = flowX + flowW + (narrow ? 10 : 20);
  panelW = canvasWidth - panelX - margin;
}

function boxY(i) {
  return FLOW_TOP + i * (BOX_H + BOX_GAP);
}

function stageAt(mx, my) {
  for (let i = 0; i < stages.length; i++) {
    if (mx >= flowX && mx <= flowX + flowW && my >= boxY(i) && my <= boxY(i) + BOX_H) return i;
  }
  return -1;
}

// Split text into lines no wider than maxW (uses the current text settings)
function wrapLines(str, maxW) {
  const words = str.split(' ');
  const lines = [];
  let current = '';
  words.forEach(word => {
    const trial = current ? current + ' ' + word : word;
    if (textWidth(trial) > maxW && current) {
      lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  });
  if (current) lines.push(current);
  return lines;
}

// Draw wrapped text and return the y coordinate just below it
function drawWrapped(str, x, y, maxW, leading) {
  const lines = wrapLines(str, maxW);
  lines.forEach((ln, i) => text(ln, x, y + i * leading));
  return y + lines.length * leading;
}

// -------------------------------------------
// Flowchart
// -------------------------------------------
function drawFlow() {
  const showDesc = flowW >= 230;
  for (let i = 0; i < stages.length; i++) {
    const y = boxY(i);
    const isSelected = (i === selectedStage);
    const isHovered = (i === hoveredStage);

    // arrow to the next stage
    if (i < stages.length - 1) {
      const ax = flowX + flowW / 2;
      stroke(INDIGO_DARK);
      strokeWeight(2);
      line(ax, y + BOX_H + 2, ax, y + BOX_H + BOX_GAP - 7);
      noStroke();
      fill(INDIGO_DARK);
      triangle(ax, y + BOX_H + BOX_GAP - 1, ax - 6, y + BOX_H + BOX_GAP - 10, ax + 6, y + BOX_H + BOX_GAP - 10);
    }

    // soft shadow
    noStroke();
    fill(0, 0, 0, 30);
    rect(flowX + 3, y + 4, flowW, BOX_H, 12);

    // stage box
    fill(isHovered ? INDIGO_LIGHT : INDIGO);
    if (isSelected) {
      stroke(GOLD);
      strokeWeight(4);
    } else {
      stroke(INDIGO_DARK);
      strokeWeight(1.5);
    }
    rect(flowX, y, flowW, BOX_H, 12);

    // number badge
    noStroke();
    fill(reviewed[i] ? GOLD : 255);
    circle(flowX + 22, y + BOX_H / 2, 26);
    fill(INDIGO_DARK);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(14);
    text(String(i + 1), flowX + 22, y + BOX_H / 2);

    // name and description
    fill(255);
    textAlign(LEFT, TOP);
    if (showDesc) {
      textSize(16);
      text(stages[i].name, flowX + 44, y + 7);
      textStyle(NORMAL);
      textSize(12);
      drawWrapped(stages[i].desc, flowX + 44, y + 28, flowW - 54, 14);
    } else {
      textAlign(LEFT, CENTER);
      textSize(flowW < 135 ? 13 : 15);
      text(stages[i].name, flowX + 42, y + BOX_H / 2);
    }
    textStyle(NORMAL);
  }
}

// Amber loop from the last stage back up to the first
function drawFeedbackLoop() {
  const scopeChange = scenarios[scenarioIndex].scopeChange;
  const loopX = flowX - 24;
  const yTop = boxY(0) + BOX_H / 2;
  const yBottom = boxY(stages.length - 1) + BOX_H / 2;

  stroke(scopeChange ? AMBER_DARK : AMBER);
  strokeWeight(scopeChange ? 5 : 3);
  noFill();
  line(flowX, yBottom, loopX, yBottom);
  line(loopX, yBottom, loopX, yTop);
  line(loopX, yTop, flowX - 9, yTop);
  noStroke();
  fill(scopeChange ? AMBER_DARK : AMBER);
  triangle(flowX - 1, yTop, flowX - 12, yTop - 7, flowX - 12, yTop + 7);

  // vertical label beside the loop
  push();
  translate(loopX - 11, (yTop + yBottom) / 2);
  rotate(-HALF_PI);
  noStroke();
  fill(scopeChange ? AMBER_DARK : '#8A5508');
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(13);
  text('Review when scope changes', 0, 0);
  textStyle(NORMAL);
  pop();
}

// -------------------------------------------
// Side note and detail panel
// -------------------------------------------
function drawSideNote() {
  const y = FLOW_TOP;
  const h = 50;
  stroke(AMBER);
  strokeWeight(1);
  fill(CHAMPAGNE);
  rect(panelX, y, panelW, h, 8);
  noStroke();
  fill('#5D3A00');
  textAlign(LEFT, TOP);
  textStyle(ITALIC);
  const narrow = panelW < 300;
  textSize(narrow ? 11.5 : 13);
  drawWrapped("Consent is not a one-time checkbox. It's an ongoing relationship.",
    panelX + 10, y + (narrow ? 6 : 9), panelW - 20, narrow ? 13 : 16);
  textStyle(NORMAL);
}

function drawDetailPanel() {
  const y0 = FLOW_TOP + 58;
  const h = drawHeight - y0 - 8;
  const narrow = panelW < 300;
  const body = narrow ? 12 : 13;
  const lead = narrow ? 14.5 : 17;
  const pad = narrow ? 8 : 12;
  const innerW = panelW - 2 * pad;
  const scenario = scenarios[scenarioIndex];
  const stage = stages[selectedStage];

  stroke(INDIGO_LIGHT);
  strokeWeight(1);
  fill(255);
  rect(panelX, y0, panelW, h, 8);

  // header band
  noStroke();
  fill(INDIGO);
  rect(panelX, y0, panelW, 28, 8, 8, 0, 0);
  fill(255);
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(narrow ? 13 : 15);
  text('Stage ' + (selectedStage + 1) + ': ' + stage.name, panelX + pad, y0 + 14);
  textStyle(NORMAL);

  let y = y0 + 36;
  textAlign(LEFT, TOP);

  // what the component requires
  fill(30);
  textSize(body);
  textStyle(BOLD);
  y = drawWrapped(stage.desc + '.', panelX + pad, y, innerW, lead);
  textStyle(NORMAL);
  y += 7;

  // the scenario
  y = drawLabel('SCENARIO', panelX + pad, y);
  fill(60);
  textSize(body);
  y = drawWrapped(scenario.summary, panelX + pad, y, innerW, lead);
  y += 7;

  // how the component applies
  y = drawLabel('APPLY IT', panelX + pad, y);
  fill(20);
  textSize(body);
  y = drawWrapped(scenario.apply[selectedStage], panelX + pad, y, innerW, lead);
  y += 7;

  // self-check question
  y = drawLabel('SELF-CHECK', panelX + pad, y);
  fill(INDIGO_DARK);
  textSize(body);
  textStyle(ITALIC);
  y = drawWrapped(stage.check, panelX + pad, y, innerW, lead);
  textStyle(NORMAL);

  // scope-change reminder
  if (scenario.scopeChange) {
    const noteH = narrow ? 44 : 34;
    const ny = y0 + h - noteH - 30;
    if (ny > y + 2) {
      noStroke();
      fill('#FFE9B8');
      rect(panelX + pad - 4, ny, innerW + 8, noteH, 6);
      fill('#7A4A00');
      textStyle(BOLD);
      textSize(narrow ? 11.5 : 12.5);
      drawWrapped('The scope changed, so consent must be refreshed: follow the amber loop back to Notice.',
        panelX + pad + 2, ny + 4, innerW - 4, narrow ? 13 : 14);
      textStyle(NORMAL);
    }
  }

  // progress line
  const done = reviewed.filter(r => r).length;
  noStroke();
  fill(done === stages.length ? '#1B5E20' : 90);
  textSize(narrow ? 11.5 : 12.5);
  textAlign(LEFT, BOTTOM);
  const tail = (done === stages.length) ? ' Framework applied to this scenario.' : ' Click the next stage.';
  text('Stages reviewed: ' + done + ' of ' + stages.length + '.' + (narrow ? '' : tail), panelX + pad, y0 + h - 8);
}

function drawLabel(label, x, y) {
  noStroke();
  fill(AMBER_DARK);
  textStyle(BOLD);
  textSize(12);
  text(label, x, y);
  textStyle(NORMAL);
  return y + 15;
}

function drawControlLabels() {
  noStroke();
  fill(30);
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Scenario:', 12, drawHeight + 22);
}

// -------------------------------------------
// Hover tooltip: an example for the stage under the mouse
// -------------------------------------------
function drawTooltip() {
  if (hoveredStage < 0) return;
  const stage = stages[hoveredStage];
  const w = Math.min(270, canvasWidth - 20);
  textSize(12);
  textStyle(NORMAL);
  const lines = wrapLines(stage.example, w - 18);
  const h = 22 + lines.length * 15 + 6;
  let x = mouseX + 16;
  let y = mouseY + 14;
  if (x + w > canvasWidth - 4) x = canvasWidth - w - 4;
  if (y + h > drawHeight - 4) y = mouseY - h - 10;

  stroke(AMBER);
  strokeWeight(1.5);
  fill(CHAMPAGNE);
  rect(x, y, w, h, 8);
  noStroke();
  fill(AMBER_DARK);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  text('Example', x + 9, y + 6);
  textStyle(NORMAL);
  fill(30);
  lines.forEach((ln, i) => text(ln, x + 9, y + 23 + i * 15));
}

function mousePressed() {
  const i = stageAt(mouseX, mouseY);
  if (i >= 0) {
    selectedStage = i;
    reviewed[i] = true;
  }
}

// ===========================================
// RESPONSIVE SIZING
// ===========================================
function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
}

function updateCanvasSize() {
  const container = document.querySelector('main');
  if (container) {
    containerWidth = Math.floor(container.getBoundingClientRect().width);
    canvasWidth = containerWidth;
  }
}
