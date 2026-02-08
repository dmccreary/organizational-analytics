// Event Log Anatomy MicroSim
// Shows the anatomy of a single event log record with required and optional fields
// Toggle between Email Event and Chat Event examples
// MicroSim template version 2026.02

// Canvas dimensions
let canvasWidth = 400;
let drawHeight = 440;
let controlHeight = 45;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let sliderLeftMargin = 160;
let defaultTextSize = 16;

// Data for the two event types
let emailEvent = {
  required: [
    { name: 'Event ID', value: 'EMAIL-2026-0315-0847-A1', tip: 'Unique identifier for deduplication and tracing each event' },
    { name: 'Timestamp', value: '2026-03-15T13:47:22Z', tip: 'When the event occurred, in UTC ISO 8601 format' },
    { name: 'Actor', value: 'EMP-00147 (m.chen)', tip: 'Who performed the action — the canonical employee identifier' },
    { name: 'Action', value: 'EMAIL_SEND', tip: 'What happened — a controlled vocabulary action type' },
    { name: 'Target', value: 'EMP-00203 (a.patel)', tip: 'What or who the action was directed at' },
    { name: 'Source System', value: 'Outlook', tip: 'Which tool or platform generated this event' }
  ],
  optional: [
    { name: 'Thread ID', value: 'THR-88421', tip: 'Links related messages into a conversation thread' },
    { name: 'Subject Hash', value: 'SHA256(subject)', tip: 'Privacy-preserving hash of subject line for thread detection' },
    { name: 'Attachment Count', value: '2', tip: 'Number of files attached — a proxy for content richness' },
    { name: 'Recipients (CC)', value: 'EMP-00089', tip: 'Additional recipients reveal broader communication patterns' },
    { name: 'Size (bytes)', value: '34,200', tip: 'Message size indicates content complexity' }
  ]
};

let chatEvent = {
  required: [
    { name: 'Event ID', value: 'CHAT-2026-0315-1347-B2', tip: 'Unique identifier for deduplication and tracing each event' },
    { name: 'Timestamp', value: '2026-03-15T13:47:02Z', tip: 'When the event occurred, in UTC ISO 8601 format' },
    { name: 'Actor', value: 'EMP-00147 (m.chen)', tip: 'Who performed the action — the canonical employee identifier' },
    { name: 'Action', value: 'CHAT_SEND', tip: 'What happened — a controlled vocabulary action type' },
    { name: 'Target', value: 'CHANNEL-engineering', tip: 'What or who the action was directed at — a channel or person' },
    { name: 'Source System', value: 'Slack', tip: 'Which tool or platform generated this event' }
  ],
  optional: [
    { name: 'Channel Name', value: 'engineering', tip: 'The human-readable channel name for context' },
    { name: 'Content Length', value: '39 chars', tip: 'Message length without storing content — a privacy-preserving measure' },
    { name: 'Thread ID', value: 'null', tip: 'Null indicates a top-level message, not a thread reply' },
    { name: 'Mentions', value: '0', tip: 'Number of @mentions signals directed attention to specific people' },
    { name: 'Reactions', value: '0', tip: 'Emoji reactions are lightweight engagement signals' }
  ]
};

// State
let activeType = 'email'; // 'email' or 'chat'
let hoveredField = null;

// DOM buttons
let emailButton;
let chatButton;

// Colors
let indigo = '#303F9F';
let indigoLight = '#5C6BC0';
let amber = '#D4880F';
let amberLight = '#F5C14B';

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  // Create toggle buttons
  emailButton = createButton('Email Event');
  emailButton.position(canvasWidth / 2 - 135, drawHeight + 8);
  emailButton.mousePressed(() => { activeType = 'email'; updateButtonStyles(); });
  emailButton.style('font-size', '14px');
  emailButton.style('padding', '5px 16px');
  emailButton.style('border-radius', '6px');
  emailButton.style('cursor', 'pointer');
  emailButton.style('font-weight', 'bold');

  chatButton = createButton('Chat Event');
  chatButton.position(canvasWidth / 2 + 10, drawHeight + 8);
  chatButton.mousePressed(() => { activeType = 'chat'; updateButtonStyles(); });
  chatButton.style('font-size', '14px');
  chatButton.style('padding', '5px 16px');
  chatButton.style('border-radius', '6px');
  chatButton.style('cursor', 'pointer');
  chatButton.style('font-weight', 'bold');

  updateButtonStyles();

  describe('Interactive diagram showing the anatomy of an event log record with required and optional fields. Toggle between Email and Chat event examples.', LABEL);
}

function updateButtonStyles() {
  if (activeType === 'email') {
    emailButton.style('background-color', indigo);
    emailButton.style('color', 'white');
    emailButton.style('border', '2px solid ' + indigo);
    chatButton.style('background-color', '#FFF3E0');
    chatButton.style('color', amber);
    chatButton.style('border', '2px solid ' + amber);
  } else {
    chatButton.style('background-color', amber);
    chatButton.style('color', 'white');
    chatButton.style('border', '2px solid ' + amber);
    emailButton.style('background-color', '#E8EAF6');
    emailButton.style('color', indigo);
    emailButton.style('border', '2px solid ' + indigo);
  }
}

function draw() {
  updateCanvasSize();

  // Draw background
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
  textSize(20);
  text('Event Log Anatomy', canvasWidth / 2, 10);

  // Subtitle
  textSize(14);
  fill('#555');
  let currentData = activeType === 'email' ? emailEvent : chatEvent;
  let subtitle = activeType === 'email' ? 'Email Event Example' : 'Chat Event Example';
  text(subtitle, canvasWidth / 2, 34);

  // Layout calculations
  let cardX = margin;
  let cardW = canvasWidth - margin * 2;
  let fieldHeight = 32;
  let sectionGap = 12;
  let labelWidth = 130;
  let startY = 58;

  // Draw required fields section
  noStroke();
  fill(indigo);
  textAlign(LEFT, TOP);
  textSize(14);
  textStyle(BOLD);
  text('Required Fields', cardX + 4, startY);
  textStyle(NORMAL);
  let reqY = startY + 20;

  hoveredField = null;

  for (let i = 0; i < currentData.required.length; i++) {
    let field = currentData.required[i];
    let fy = reqY + i * (fieldHeight + 4);

    // Check hover
    let isHovered = mouseX > cardX && mouseX < cardX + cardW &&
                    mouseY > fy && mouseY < fy + fieldHeight;
    if (isHovered) {
      hoveredField = field;
    }

    // Field background
    stroke(indigo);
    strokeWeight(2);
    fill(isHovered ? '#E8EAF6' : 'white');
    rect(cardX, fy, cardW, fieldHeight, 4);

    // Field name
    noStroke();
    fill(indigo);
    textSize(13);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    text(field.name, cardX + 8, fy + fieldHeight / 2);

    // Field value
    textStyle(NORMAL);
    fill('#333');
    textSize(12);
    let valueX = cardX + labelWidth;
    let maxValueW = cardW - labelWidth - 12;
    let displayValue = field.value;
    while (textWidth(displayValue) > maxValueW && displayValue.length > 3) {
      displayValue = displayValue.slice(0, -4) + '...';
    }
    text(displayValue, valueX, fy + fieldHeight / 2);
  }

  // Draw optional fields section
  let optStartY = reqY + currentData.required.length * (fieldHeight + 4) + sectionGap;
  noStroke();
  fill(amber);
  textAlign(LEFT, TOP);
  textSize(14);
  textStyle(BOLD);
  text('Optional Metadata', cardX + 4, optStartY);
  textStyle(NORMAL);
  let optY = optStartY + 20;

  for (let i = 0; i < currentData.optional.length; i++) {
    let field = currentData.optional[i];
    let fy = optY + i * (fieldHeight + 4);

    // Check hover
    let isHovered = mouseX > cardX && mouseX < cardX + cardW &&
                    mouseY > fy && mouseY < fy + fieldHeight;
    if (isHovered) {
      hoveredField = field;
    }

    // Field background with dashed border
    drawingContext.setLineDash([6, 4]);
    stroke(amber);
    strokeWeight(2);
    fill(isHovered ? '#FFF3E0' : 'white');
    rect(cardX, fy, cardW, fieldHeight, 4);
    drawingContext.setLineDash([]);

    // Field name
    noStroke();
    fill(amber);
    textSize(13);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    text(field.name, cardX + 8, fy + fieldHeight / 2);

    // Field value
    textStyle(NORMAL);
    fill('#555');
    textSize(12);
    let valueX = cardX + labelWidth;
    let maxValueW = cardW - labelWidth - 12;
    let displayValue = field.value;
    while (textWidth(displayValue) > maxValueW && displayValue.length > 3) {
      displayValue = displayValue.slice(0, -4) + '...';
    }
    text(displayValue, valueX, fy + fieldHeight / 2);
  }

  // Draw tooltip if hovering
  if (hoveredField) {
    drawTooltip(hoveredField.tip, mouseX, mouseY);
  }
}

function drawTooltip(tipText, mx, my) {
  textSize(12);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  let tw = min(textWidth(tipText) + 16, canvasWidth - 20);
  let lines = wrapText(tipText, tw - 16);
  let th = lines.length * 16 + 12;

  // Position tooltip above cursor, keeping on screen
  let tx = mx + 10;
  let ty = my - th - 10;
  if (tx + tw > canvasWidth - 5) tx = canvasWidth - tw - 5;
  if (ty < 5) ty = my + 20;
  if (tx < 5) tx = 5;

  // Draw tooltip background
  fill(50, 50, 50, 230);
  noStroke();
  rect(tx, ty, tw, th, 6);

  // Draw tooltip text
  fill(255);
  textSize(12);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], tx + 8, ty + 6 + i * 16);
  }
}

function wrapText(txt, maxW) {
  let words = txt.split(' ');
  let lines = [];
  let currentLine = '';
  textSize(12);
  for (let w of words) {
    let testLine = currentLine.length === 0 ? w : currentLine + ' ' + w;
    if (textWidth(testLine) > maxW && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = w;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine);
  return lines;
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  // Reposition buttons
  emailButton.position(canvasWidth / 2 - 135, drawHeight + 8);
  chatButton.position(canvasWidth / 2 + 10, drawHeight + 8);
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
}
