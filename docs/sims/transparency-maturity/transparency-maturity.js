// Transparency Maturity Model MicroSim
// CANVAS_HEIGHT: 485
// Four maturity levels for analytics transparency (Opaque, Notified, Informed,
// Participatory) shown as cards from dark to bright. A six-question yes/no
// self-assessment, using the chapter's transparency checklist, highlights the
// approximate level of an organization and lists the steps to reach the next one.
// MicroSim template version 2026.03

// ===========================================
// CANVAS LAYOUT
// ===========================================
let containerWidth;
let canvasWidth = 800;
let drawHeight = 440;
let controlHeight = 45;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 10;
let defaultTextSize = 14;

const CARDS_Y = 46;
const CARDS_H = 206;
const ARROW_Y = 268;
const PANEL_Y = 285;

// ===========================================
// ARIA COLOR SCHEME
// ===========================================
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';

// ===========================================
// CONTENT
// The scenarios are illustrations written for this course, not real organizations.
// ===========================================
const levels = [
  { name: 'Opaque', bg: '#151A3C', fg: '#FFFFFF', soft: '#C5CAE9',
    bullets: ['Analytics happen in secret', 'Employees unaware data is collected'],
    risk: 'High', riskNote: 'trust erosion when discovered',
    scenario: 'A company quietly analyzes email metadata to study collaboration. Employees learn about it months later from a leaked slide deck, and a well-meant study now looks like covert surveillance.',
    moveUp: 'To move up: publish a clear, jargon-free description of the program.' },
  { name: 'Notified', bg: INDIGO, fg: '#FFFFFF', soft: '#E8EAF6',
    bullets: ['Employees told data is collected', 'Limited detail on methods or purpose'],
    risk: 'Medium', riskNote: 'compliance without buy-in',
    scenario: 'One sentence in the employee handbook says that communication systems may be analyzed. Nobody can say which data is used, which methods are applied, or who sees the results.',
    moveUp: 'To move up: document purpose, methods and access, and let employees see the data held about them.' },
  { name: 'Informed', bg: AMBER, fg: '#1A1A1A', soft: '#3E2700',
    bullets: ['Clear purpose, methods, and access documented', 'Employees can request their data'],
    risk: 'Low', riskNote: 'building trust',
    scenario: 'An intranet page explains what is collected, why, how it is processed and who sees the results. Any employee can ask for the data held about them.',
    moveUp: 'To move up: share aggregate findings with teams and open a feedback channel that shapes the program.' },
  { name: 'Participatory', bg: GOLD, fg: '#1A1A1A', soft: '#4A3B00',
    bullets: ['Employees co-design analytics goals', 'Results shared and discussed openly', 'Feedback loop drives program evolution'],
    risk: 'Minimal', riskNote: 'trust is an asset',
    scenario: 'An employee advisory group helps choose the questions the program investigates. Findings are presented at team meetings, and concerns raised there change the next plan.',
    moveUp: 'To stay here: repeat the conversation whenever the scope of the program changes.' }
];

// The six questions of the chapter's transparency checklist
const questions = [
  { q: 'Have you published a clear, jargon-free description of the analytics program?',
    action: 'Publish a clear, jargon-free description of the program' },
  { q: 'Can any employee find out what data about them is in the system?',
    action: 'Let employees see what data is held about them' },
  { q: 'Do employees know who has access to results?',
    action: 'Tell employees who has access to results' },
  { q: 'Are aggregate findings shared back with teams?',
    action: 'Share aggregate findings back with teams' },
  { q: 'Is there a feedback mechanism for employees to raise concerns?',
    action: 'Create a feedback channel for employee concerns' },
  { q: 'Are the limitations and assumptions of your analysis documented?',
    action: 'Document the limitations and assumptions of the analysis' }
];

// Which questions must be "yes" to reach each level (index = level reached)
const requirements = [
  [],                 // Level 1: no requirement
  [0],                // Level 2: employees have been told (Q1)
  [0, 1, 2, 5],       // Level 3: data access, result access and limits documented (Q2, Q3, Q6)
  [0, 1, 2, 3, 4, 5]  // Level 4: findings shared and feedback channel open (Q4, Q5)
];

// ===========================================
// STATE
// ===========================================
let quizState = 'idle';        // 'idle', 'running' or 'done'
let answers = [];              // true / false for each answered question
let resultLevel = -1;          // 0..3 once the quiz is done
let hoveredLevel = -1;
let pinnedLevel = -1;
let yesButton, noButton, startButton;
let cardRects = [];

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  const mainElement = document.querySelector('main');
  canvas.parent(mainElement);
  textSize(defaultTextSize);

  yesButton = createButton('Yes');
  yesButton.parent(mainElement);
  yesButton.position(10, drawHeight + 11);
  yesButton.mousePressed(() => answer(true));

  noButton = createButton('No');
  noButton.parent(mainElement);
  noButton.position(58, drawHeight + 11);
  noButton.mousePressed(() => answer(false));

  startButton = createButton('Start Self-Assessment');
  startButton.parent(mainElement);
  startButton.mousePressed(startQuiz);

  updateButtons();

  describe('Four cards showing transparency maturity levels from Opaque to Participatory, with a six-question yes or no self-assessment that highlights the approximate level and lists next steps.', LABEL);
}

// ===========================================
// SELF-ASSESSMENT
// ===========================================
function startQuiz() {
  quizState = 'running';
  answers = [];
  resultLevel = -1;
  pinnedLevel = -1;
  updateButtons();
}

function answer(value) {
  if (quizState !== 'running') return;
  answers.push(value);
  if (answers.length === questions.length) {
    resultLevel = levelFor(answers);
    quizState = 'done';
  }
  updateButtons();
}

// Highest level whose requirements are all met
function levelFor(ans) {
  let level = 0;
  for (let i = 1; i < requirements.length; i++) {
    if (requirements[i].every(q => ans[q])) level = i;
    else break;
  }
  return level;
}

function updateButtons() {
  if (quizState === 'running') {
    yesButton.show();
    noButton.show();
    startButton.html('Restart');
    startButton.position(104, drawHeight + 11);
  } else {
    yesButton.hide();
    noButton.hide();
    startButton.html(quizState === 'done' ? 'Restart Self-Assessment' : 'Start Self-Assessment');
    startButton.position(10, drawHeight + 11);
  }
}

// ===========================================
// DRAW
// ===========================================
function draw() {
  updateCanvasSize();

  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  noStroke();
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(canvasWidth < 480 ? 18 : 22);
  text('Transparency Maturity Model', canvasWidth / 2, 7);
  textStyle(NORMAL);

  computeCards();
  hoveredLevel = levelAt(mouseX, mouseY);

  for (let i = 0; i < levels.length; i++) drawCard(i);
  drawTrustArrow();
  drawPanel();
  drawControlLabels();

  cursor(hoveredLevel >= 0 ? HAND : ARROW);
}

function isGrid() {
  return canvasWidth < 640;       // 2 x 2 grid of compact cards on narrow screens
}

function computeCards() {
  cardRects = [];
  const gap = 10;
  if (isGrid()) {
    const w = (canvasWidth - 2 * margin - gap) / 2;
    const h = (CARDS_H - 8) / 2;
    for (let i = 0; i < 4; i++) {
      cardRects.push({
        x: margin + (i % 2) * (w + gap),
        y: CARDS_Y + Math.floor(i / 2) * (h + 8),
        w: w, h: h
      });
    }
  } else {
    const w = (canvasWidth - 2 * margin - 3 * gap) / 4;
    for (let i = 0; i < 4; i++) {
      cardRects.push({ x: margin + i * (w + gap), y: CARDS_Y, w: w, h: CARDS_H });
    }
  }
}

function levelAt(mx, my) {
  for (let i = 0; i < cardRects.length; i++) {
    const r = cardRects[i];
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return i;
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

// -------------------------------------------
// Level cards
// -------------------------------------------
function drawCard(i) {
  const lv = levels[i];
  const r = cardRects[i];
  const grid = isGrid();
  const isResult = (quizState === 'done' && resultLevel === i);
  const isFocus = (i === hoveredLevel) || (i === pinnedLevel && quizState !== 'running');
  const dimmed = (quizState === 'done' && !isResult);

  // shadow
  noStroke();
  fill(0, 0, 0, 30);
  rect(r.x + 3, r.y + 4, r.w, r.h, 12);

  // card body
  if (isResult) {
    stroke('#C62828');
    strokeWeight(5);
  } else if (isFocus) {
    stroke(INDIGO_DARK);
    strokeWeight(3);
  } else {
    stroke(90);
    strokeWeight(1);
  }
  fill(lv.bg);
  rect(r.x, r.y, r.w, r.h, 12);

  const pad = 10;
  const innerW = r.w - 2 * pad;
  noStroke();

  // openness meter: one more open square at each level
  for (let k = 0; k < 4; k++) {
    const sx = r.x + r.w - pad - (4 - k) * 12;
    stroke(lv.fg);
    strokeWeight(1);
    if (k <= i) fill(lv.fg); else noFill();
    rect(sx, r.y + 12, 8, 8, 2);
  }

  noStroke();
  fill(lv.soft);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(12);
  text('LEVEL ' + (i + 1), r.x + pad, r.y + 10);
  fill(lv.fg);
  textSize(grid && r.w < 160 ? 15 : 17);
  text(lv.name, r.x + pad, r.y + 25);
  textStyle(NORMAL);

  if (grid) {
    // compact card: risk only (characteristics appear in the panel below)
    textSize(12.5);
    textStyle(BOLD);
    text('Risk: ' + lv.risk, r.x + pad, r.y + 52);
    textStyle(NORMAL);
    textSize(12);
    wrapLines(lv.riskNote, innerW).slice(0, 2).forEach((ln, k) => text(ln, r.x + pad, r.y + 68 + k * 14));
  } else {
    // risk box at the bottom of the card (its note may wrap to two lines)
    textSize(12);
    const riskLines = wrapLines(lv.riskNote, innerW - 4).slice(0, 2);
    const rh = 24 + riskLines.length * 14 + 3;
    const ry = r.y + r.h - rh - 8;

    // pick the largest text size at which all the characteristics fit above it
    const sizes = [13, 12.5, 12];
    let fs = 12, bulletLines = [];
    for (let s = 0; s < sizes.length; s++) {
      fs = sizes[s];
      textSize(fs);
      bulletLines = lv.bullets.map(b => wrapLines(b, innerW - 12));
      const total = bulletLines.reduce((sum, ls) => sum + ls.length, 0);
      if (r.y + 54 + total * (fs + 3) + lv.bullets.length * 5 <= ry) break;
    }
    let y = r.y + 54;
    bulletLines.forEach(ls => {
      fill(lv.fg);
      circle(r.x + pad + 3, y + fs * 0.55, 4.5);
      ls.forEach((ln, k) => text(ln, r.x + pad + 12, y + k * (fs + 3)));
      y += ls.length * (fs + 3) + 5;
    });

    fill(255, 255, 255, i < 2 ? 40 : 110);
    rect(r.x + 6, ry, r.w - 12, rh, 7);
    fill(lv.fg);
    textStyle(BOLD);
    textSize(13);
    text('Risk: ' + lv.risk, r.x + pad + 2, ry + 5);
    textStyle(NORMAL);
    textSize(12);
    riskLines.forEach((ln, k) => text(ln, r.x + pad + 2, ry + 22 + k * 14));
  }

  // marker on the level picked out by the self-assessment
  if (isResult) {
    const tagW = 104, tagH = 18;
    const tx = r.x + (r.w - tagW) / 2;
    const ty = r.y - 9;             // sits on the top edge of the card
    noStroke();
    fill('#C62828');
    rect(tx, ty, tagW, tagH, 10);
    fill(255);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(12);
    text('YOU ARE HERE', tx + tagW / 2, ty + tagH / 2 + 0.5);
    textStyle(NORMAL);
  }

  // wash out the levels that were not picked
  if (dimmed && i !== hoveredLevel) {
    noStroke();
    fill(240, 248, 255, 120);
    rect(r.x - 1, r.y - 1, r.w + 2, r.h + 2, 12);
  }
}

function drawTrustArrow() {
  const x1 = margin + 6;
  const x2 = canvasWidth - margin - 6;
  stroke(INDIGO_DARK);
  strokeWeight(3);
  line(x1, ARROW_Y, x2 - 10, ARROW_Y);
  noStroke();
  fill(INDIGO_DARK);
  triangle(x2, ARROW_Y, x2 - 14, ARROW_Y - 8, x2 - 14, ARROW_Y + 8);

  // label on a patch of background so the line does not run through the text
  textStyle(BOLD);
  textSize(canvasWidth < 480 ? 12.5 : 14);
  const label = 'Increasing Trust and Sustainability';
  const tw = textWidth(label) + 20;
  fill('aliceblue');
  rect(canvasWidth / 2 - tw / 2, ARROW_Y - 10, tw, 20);
  fill(INDIGO_DARK);
  textAlign(CENTER, CENTER);
  text(label, canvasWidth / 2, ARROW_Y);
  textStyle(NORMAL);
}

// -------------------------------------------
// Bottom panel: quiz, result, or level details
// -------------------------------------------
function drawPanel() {
  const x = margin;
  const w = canvasWidth - 2 * margin;
  const h = drawHeight - PANEL_Y - 8;
  const narrow = canvasWidth < 560;

  stroke(AMBER);
  strokeWeight(1);
  fill(CHAMPAGNE);
  rect(x, PANEL_Y, w, h, 8);
  noStroke();
  fill(AMBER);
  rect(x, PANEL_Y, 5, h, 8, 0, 0, 8);

  const tx = x + 16;
  const tw = w - 30;
  const fs = narrow ? 12 : 13.5;
  const lead = narrow ? 14.5 : 17;
  textAlign(LEFT, TOP);

  if (quizState === 'running') {
    drawQuestion(tx, tw, fs, lead);
    return;
  }

  const focus = (hoveredLevel >= 0) ? hoveredLevel : (quizState === 'done' ? -1 : pinnedLevel);
  if (focus >= 0) {
    drawLevelDetails(focus, tx, tw, fs, lead);
    return;
  }

  if (quizState === 'done') {
    drawResult(tx, tw, fs, lead, h);
    return;
  }

  // default prompt
  fill(INDIGO_DARK);
  textStyle(BOLD);
  textSize(fs + 1.5);
  text('How open is your analytics program?', tx, PANEL_Y + 10);
  textStyle(NORMAL);
  fill(25);
  textSize(fs);
  const hint = 'Hover over or click a level to see what it looks like in practice and how to move up. ' +
    'Then press Start Self-Assessment and answer six yes or no questions about an analytics program you know. ' +
    'The diagram will mark its approximate level and list the next steps.';
  wrapLines(hint, tw).forEach((ln, k) => text(ln, tx, PANEL_Y + 34 + k * lead));
}

function drawQuestion(tx, tw, fs, lead) {
  const n = answers.length;
  fill(INDIGO_DARK);
  textStyle(BOLD);
  textSize(fs + 1);
  text('Self-assessment: question ' + (n + 1) + ' of ' + questions.length, tx, PANEL_Y + 10);
  textStyle(NORMAL);

  fill(20);
  textSize(fs + 2);
  const lines = wrapLines(questions[n].q, tw);
  lines.forEach((ln, k) => text(ln, tx, PANEL_Y + 36 + k * (lead + 3)));

  drawAnswerDots(tx, PANEL_Y + 44 + lines.length * (lead + 3) + 8);

  fill(70);
  textSize(fs - 0.5);
  text('Answer with the Yes and No buttons below.', tx + 6 * 22 + 14, PANEL_Y + 44 + lines.length * (lead + 3) + 9);
}

// One square for each question: green for yes, red for no, empty if unanswered
function drawAnswerDots(x, y) {
  for (let k = 0; k < questions.length; k++) {
    const answered = k < answers.length;
    stroke(90);
    strokeWeight(1);
    if (!answered) fill(255);
    else fill(answers[k] ? '#2E7D32' : '#C62828');
    rect(x + k * 22, y, 16, 16, 4);
    noStroke();
    fill(answered ? 255 : 90);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(11);
    text(answered ? (answers[k] ? 'Y' : 'N') : String(k + 1), x + k * 22 + 8, y + 8.5);
    textStyle(NORMAL);
  }
  textAlign(LEFT, TOP);
}

function drawLevelDetails(i, tx, tw, fs, lead) {
  const lv = levels[i];
  fill(INDIGO_DARK);
  textStyle(BOLD);
  textSize(fs + 1.5);
  text('Level ' + (i + 1) + ': ' + lv.name, tx, PANEL_Y + 9);
  textStyle(NORMAL);

  let y = PANEL_Y + 32;
  let body = lv.scenario;
  if (isGrid()) {
    // The compact cards do not list the characteristics, so the panel leads
    // with them and the scenario follows in the same paragraph.
    body = lv.bullets.join('. ') + '. Illustration: ' + lv.scenario;
  } else {
    fill(AMBER_DARK);
    textStyle(BOLD);
    textSize(12);
    text('ILLUSTRATIVE SCENARIO', tx, y);
    textStyle(NORMAL);
    y += 16;
  }
  fill(25);
  textSize(fs);
  // reserve room for the "move up" advice, then fit the scenario above it
  textStyle(BOLD);
  const adviceLines = wrapLines(lv.moveUp, tw).slice(0, 2);
  textStyle(NORMAL);
  const bottom = drawHeight - 8 - 6;
  const maxBody = Math.floor((bottom - y - 5 - adviceLines.length * lead) / lead);
  const allLines = wrapLines(body, tw);
  const bodyLines = allLines.slice(0, maxBody);
  if (allLines.length > maxBody && bodyLines.length > 0) {
    bodyLines[bodyLines.length - 1] += ' ...';      // text was cut to fit the panel
  }
  bodyLines.forEach((ln, k) => text(ln, tx, y + k * lead));
  y += bodyLines.length * lead + 5;
  fill(INDIGO_DARK);
  textStyle(BOLD);
  adviceLines.forEach((ln, k) => text(ln, tx, y + k * lead));
  textStyle(NORMAL);
}

function drawResult(tx, tw, fs, lead, h) {
  const lv = levels[resultLevel];
  const yesCount = answers.filter(a => a).length;

  fill('#C62828');
  textStyle(BOLD);
  textSize(fs + 2);
  text('Approximate level: ' + (resultLevel + 1) + ' - ' + lv.name, tx, PANEL_Y + 9);
  textStyle(NORMAL);

  drawAnswerDots(tx, PANEL_Y + 34);
  fill(40);
  textSize(fs);
  text(yesCount + ' of 6 answered yes', tx + 6 * 22 + 10, PANEL_Y + 35);

  let y = PANEL_Y + 58;
  fill(20);
  textSize(fs);
  let message;
  if (resultLevel === 3) {
    message = 'All six answers are yes, so there is no transparency gap on the checklist. ' +
      'The checklist cannot show whether employees truly help set the goals of the program, so confirm that before claiming Level 4.';
  } else {
    // steps needed for the next level
    const missing = requirements[resultLevel + 1].filter(q => !answers[q]).map(q => questions[q].action);
    message = 'To reach Level ' + (resultLevel + 2) + ' (' + levels[resultLevel + 1].name + '): ' +
      missing.join('; ') + '.';
    const otherGaps = answers.filter(a => !a).length - missing.length;
    if (otherGaps > 0) {
      message += ' ' + otherGaps + ' more "no" ' + (otherGaps === 1 ? 'answer remains' : 'answers remain') +
        ' beyond that. Every "no" is a transparency gap.';
    }
  }
  const maxLines = Math.floor((PANEL_Y + h - 8 - y) / lead);
  wrapLines(message, tw).slice(0, maxLines).forEach((ln, k) => text(ln, tx, y + k * lead));
}

function drawControlLabels() {
  // status text to the right of the buttons
  noStroke();
  fill(60);
  textAlign(RIGHT, CENTER);
  textSize(canvasWidth < 480 ? 12 : 13.5);
  let status = '';
  if (quizState === 'running') status = answers.length + ' of 6 answered';
  if (quizState === 'done') status = 'Hover a level to compare';
  if (quizState === 'idle' && canvasWidth >= 480) status = 'Six yes or no questions';
  text(status, canvasWidth - 14, drawHeight + 23);
}

// ===========================================
// INTERACTION
// ===========================================
function mousePressed() {
  if (mouseY > drawHeight) return;
  const i = levelAt(mouseX, mouseY);
  if (i >= 0) pinnedLevel = (pinnedLevel === i) ? -1 : i;
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
