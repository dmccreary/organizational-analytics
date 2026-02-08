// Graph Scalability Strategies MicroSim
// Interactive infographic showing 3 scalability strategies with org size slider

let containerWidth;
let canvasWidth = 400;
let drawHeight = 500;
let controlHeight = 0;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 25;

// Aria color scheme
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_LIGHT = '#F5C14B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';
const BG_COLOR = '#F0F8FF'; // aliceblue

// Slider state
let sliderX;
let sliderValue = 0.0; // 0.0 to 1.0
let isDraggingSlider = false;
let sliderY;
let sliderWidth;
let sliderHeight = 8;
let handleRadius = 12;

// Org size range: 1K to 1M (logarithmic)
let minEmployees = 1000;
let maxEmployees = 1000000;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  var mainElement = document.querySelector('main');
  canvas.parent(mainElement);
  textFont('Arial');
  sliderValue = 0.0;
}

function draw() {
  updateCanvasSize();
  background(BG_COLOR);

  let employeeCount = getEmployeeCount();

  // Title
  drawTitle();

  // Three cards
  drawCards(employeeCount);

  // Slider area
  drawSlider(employeeCount);

  // Estimated nodes/edges
  drawEstimates(employeeCount);
}

function drawTitle() {
  fill(INDIGO_DARK);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(Math.max(16, Math.min(22, canvasWidth * 0.035)));
  textStyle(BOLD);
  text('Graph Scalability Strategies', canvasWidth / 2, 12);
  textStyle(NORMAL);
}

function drawCards(employeeCount) {
  let cardAreaTop = 48;
  let cardAreaBottom = drawHeight - 140;
  let cardHeight = cardAreaBottom - cardAreaTop;
  let totalCardWidth = canvasWidth - margin * 2;
  let gap = Math.max(8, totalCardWidth * 0.025);
  let cardWidth = (totalCardWidth - gap * 2) / 3;

  // Determine which cards are highlighted
  let highlight = [false, false, false];
  let emphasized = -1;

  if (employeeCount < 50000) {
    highlight[0] = true; // Scale Up
  } else if (employeeCount < 200000) {
    highlight[0] = true; // Scale Up
    highlight[2] = true; // Query Optimization
  } else {
    highlight[0] = true;
    highlight[1] = true;
    highlight[2] = true;
    emphasized = 1; // Scale Out emphasized
  }

  let cards = [
    {
      title: 'Scale Up',
      subtitle: '(Vertical)',
      bestFor: 'Graphs up to ~100M nodes',
      example: '10K-employee company',
      advantage: 'Simple deployment',
      limitation: 'Hardware ceiling',
      iconType: 'server'
    },
    {
      title: 'Scale Out',
      subtitle: '(Horizontal)',
      bestFor: 'Graphs over ~100M nodes',
      example: '500K employees with\nyears of history',
      advantage: 'Nearly unlimited capacity',
      limitation: 'Cross-partition latency',
      iconType: 'cluster'
    },
    {
      title: 'Query Optimization',
      subtitle: '',
      bestFor: 'Any size graph',
      example: 'Limit traversal depth\nto 3 hops',
      advantage: 'Free performance gain',
      limitation: 'Requires expertise',
      iconType: 'magnifier'
    }
  ];

  for (let i = 0; i < 3; i++) {
    let x = margin + i * (cardWidth + gap);
    let y = cardAreaTop;
    drawCard(x, y, cardWidth, cardHeight, cards[i], highlight[i], emphasized === i);
  }
}

function drawCard(x, y, w, h, card, isHighlighted, isEmphasized) {
  let cornerRadius = 10;
  let headerHeight = Math.min(70, h * 0.18);
  let fontSize = Math.max(10, Math.min(14, w * 0.09));
  let titleSize = Math.max(12, Math.min(16, w * 0.11));
  let iconAreaHeight = Math.min(70, h * 0.2);

  // Card shadow
  noStroke();
  fill(0, 0, 0, 20);
  rect(x + 2, y + 2, w, h, cornerRadius);

  // Card border
  if (isEmphasized) {
    stroke(AMBER);
    strokeWeight(4);
  } else if (isHighlighted) {
    stroke(AMBER);
    strokeWeight(3);
  } else {
    stroke(200);
    strokeWeight(1.5);
  }

  // Card body (white)
  fill(255);
  rect(x, y, w, h, cornerRadius);

  // Card header
  noStroke();
  fill(INDIGO);
  rect(x, y, w, headerHeight, cornerRadius, cornerRadius, 0, 0);

  // Header text
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(titleSize);
  textStyle(BOLD);
  let titleText = card.title;
  if (card.subtitle) {
    text(titleText, x + w / 2, y + headerHeight / 2 - (titleSize * 0.6));
    textSize(fontSize * 0.9);
    textStyle(NORMAL);
    text(card.subtitle, x + w / 2, y + headerHeight / 2 + (titleSize * 0.5));
  } else {
    text(titleText, x + w / 2, y + headerHeight / 2);
  }
  textStyle(NORMAL);

  // Icon area
  let iconY = y + headerHeight + iconAreaHeight / 2;
  drawIcon(card.iconType, x + w / 2, iconY, w);

  // Content area
  let contentTop = y + headerHeight + iconAreaHeight + 5;
  let contentPadding = Math.max(6, w * 0.06);
  let lineHeight = fontSize * 1.35;
  let cy = contentTop;

  // Best for
  textAlign(LEFT, TOP);
  textSize(fontSize * 0.85);
  fill(INDIGO_LIGHT);
  textStyle(BOLD);
  text('Best for:', x + contentPadding, cy);
  cy += lineHeight * 0.9;
  fill(60);
  textStyle(NORMAL);
  textSize(fontSize * 0.8);
  drawWrappedText(card.bestFor, x + contentPadding, cy, w - contentPadding * 2, fontSize * 0.8);
  cy += lineHeight * 1.2;

  // Example
  fill(INDIGO_LIGHT);
  textSize(fontSize * 0.85);
  textStyle(BOLD);
  text('Example:', x + contentPadding, cy);
  cy += lineHeight * 0.9;
  fill(80);
  textStyle(ITALIC);
  textSize(fontSize * 0.78);
  drawWrappedText(card.example, x + contentPadding, cy, w - contentPadding * 2, fontSize * 0.78);
  cy += lineHeight * 1.5;

  // Advantage (green check)
  textStyle(NORMAL);
  fill(34, 139, 34);
  textSize(fontSize * 0.85);
  text('\u2713', x + contentPadding, cy);
  fill(60);
  textSize(fontSize * 0.8);
  drawWrappedText(card.advantage, x + contentPadding + fontSize, cy, w - contentPadding * 2 - fontSize, fontSize * 0.8);
  cy += lineHeight * 1.2;

  // Limitation (red x)
  fill(200, 50, 50);
  textSize(fontSize * 0.85);
  text('\u2717', x + contentPadding, cy);
  fill(100);
  textSize(fontSize * 0.8);
  drawWrappedText(card.limitation, x + contentPadding + fontSize, cy, w - contentPadding * 2 - fontSize, fontSize * 0.8);

  // Highlight glow if emphasized
  if (isEmphasized) {
    noFill();
    stroke(AMBER_LIGHT);
    strokeWeight(2);
    rect(x - 3, y - 3, w + 6, h + 6, cornerRadius + 2);
  }
}

function drawWrappedText(txt, x, y, maxWidth, size) {
  // Handle newline characters
  let lines = txt.split('\n');
  let cy = y;
  for (let line of lines) {
    text(line, x, cy);
    cy += size * 1.3;
  }
}

function drawIcon(type, cx, cy, cardWidth) {
  let scale = Math.max(0.5, Math.min(1.0, cardWidth / 160));

  if (type === 'server') {
    // Single server: rectangle with horizontal lines
    let sw = 36 * scale;
    let sh = 44 * scale;
    stroke(INDIGO);
    strokeWeight(2);
    fill(230, 235, 255);
    rectMode(CENTER);
    rect(cx, cy, sw, sh, 4);
    // Internal lines (drive bays)
    let lineGap = sh / 5;
    for (let i = 1; i < 5; i++) {
      stroke(INDIGO_LIGHT);
      strokeWeight(1);
      line(cx - sw / 2 + 4, cy - sh / 2 + i * lineGap, cx + sw / 2 - 4, cy - sh / 2 + i * lineGap);
    }
    // Power LED
    fill(AMBER);
    noStroke();
    ellipse(cx + sw / 2 - 7, cy + sh / 2 - 6, 4 * scale, 4 * scale);
    rectMode(CORNER);
  } else if (type === 'cluster') {
    // Three servers connected with lines
    let sw = 22 * scale;
    let sh = 28 * scale;
    let spacing = 32 * scale;
    let positions = [
      { x: cx - spacing, y: cy },
      { x: cx, y: cy },
      { x: cx + spacing, y: cy }
    ];
    // Connection lines
    stroke(AMBER);
    strokeWeight(2);
    line(positions[0].x, positions[0].y, positions[1].x, positions[1].y);
    line(positions[1].x, positions[1].y, positions[2].x, positions[2].y);

    // Servers
    rectMode(CENTER);
    for (let pos of positions) {
      stroke(INDIGO);
      strokeWeight(2);
      fill(230, 235, 255);
      rect(pos.x, pos.y, sw, sh, 3);
      // Drive line
      stroke(INDIGO_LIGHT);
      strokeWeight(1);
      line(pos.x - sw / 2 + 3, pos.y - 2, pos.x + sw / 2 - 3, pos.y - 2);
      line(pos.x - sw / 2 + 3, pos.y + 5, pos.x + sw / 2 - 3, pos.y + 5);
      // LED
      fill(AMBER);
      noStroke();
      ellipse(pos.x + sw / 2 - 5, pos.y + sh / 2 - 5, 3 * scale, 3 * scale);
    }
    rectMode(CORNER);
  } else if (type === 'magnifier') {
    // Magnifying glass
    let r = 16 * scale;
    stroke(INDIGO);
    strokeWeight(2.5);
    noFill();
    ellipse(cx - 4 * scale, cy - 4 * scale, r * 2, r * 2);
    // Handle
    strokeWeight(3);
    let angle = PI / 4;
    let hx1 = cx - 4 * scale + cos(angle) * r;
    let hy1 = cy - 4 * scale + sin(angle) * r;
    let hx2 = hx1 + cos(angle) * 14 * scale;
    let hy2 = hy1 + sin(angle) * 14 * scale;
    stroke(INDIGO_LIGHT);
    line(hx1, hy1, hx2, hy2);
    // Query lines inside lens
    stroke(AMBER);
    strokeWeight(1.5);
    let lx = cx - 4 * scale;
    let ly = cy - 4 * scale;
    line(lx - 7 * scale, ly - 3 * scale, lx + 7 * scale, ly - 3 * scale);
    line(lx - 5 * scale, ly + 2 * scale, lx + 5 * scale, ly + 2 * scale);
  }
}

function drawSlider(employeeCount) {
  sliderY = drawHeight - 80;
  let sliderPadding = margin + 20;
  sliderWidth = canvasWidth - sliderPadding * 2;
  let sliderStartX = sliderPadding;

  // Label
  fill(INDIGO_DARK);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(Math.max(12, Math.min(15, canvasWidth * 0.025)));
  textStyle(BOLD);
  text('Organization Size', canvasWidth / 2, sliderY - 22);
  textStyle(NORMAL);

  // Track background
  stroke(200);
  strokeWeight(1);
  fill(220);
  rect(sliderStartX, sliderY - sliderHeight / 2, sliderWidth, sliderHeight, sliderHeight / 2);

  // Filled portion
  let handleX = sliderStartX + sliderValue * sliderWidth;
  noStroke();
  fill(INDIGO);
  rect(sliderStartX, sliderY - sliderHeight / 2, handleX - sliderStartX, sliderHeight, sliderHeight / 2, 0, 0, sliderHeight / 2);

  // Tick marks and labels
  let ticks = [
    { val: 0.0, label: '1K' },
    { val: 0.25, label: '10K' },
    { val: 0.5, label: '50K' },
    { val: 0.75, label: '200K' },
    { val: 1.0, label: '1M' }
  ];

  textSize(Math.max(9, Math.min(11, canvasWidth * 0.018)));
  fill(120);
  textAlign(CENTER, TOP);
  for (let t of ticks) {
    let tx = sliderStartX + t.val * sliderWidth;
    stroke(180);
    strokeWeight(1);
    line(tx, sliderY + sliderHeight / 2 + 2, tx, sliderY + sliderHeight / 2 + 7);
    noStroke();
    text(t.label, tx, sliderY + sliderHeight / 2 + 9);
  }

  // Handle
  stroke(INDIGO_DARK);
  strokeWeight(2);
  fill(255);
  ellipse(handleX, sliderY, handleRadius * 2, handleRadius * 2);
  // Inner dot
  noStroke();
  fill(AMBER);
  ellipse(handleX, sliderY, handleRadius * 0.8, handleRadius * 0.8);

  // Current value display
  fill(INDIGO_DARK);
  textAlign(CENTER, BOTTOM);
  textSize(Math.max(12, Math.min(15, canvasWidth * 0.025)));
  textStyle(BOLD);
  text(formatNumber(employeeCount) + ' employees', canvasWidth / 2, sliderY - 26);
  textStyle(NORMAL);
}

function drawEstimates(employeeCount) {
  let estY = drawHeight - 18;
  let nodes = estimateNodes(employeeCount);
  let edges = estimateEdges(employeeCount);

  fill(80);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(Math.max(11, Math.min(13, canvasWidth * 0.022)));

  let estText = 'Estimated Nodes: ' + formatNumber(nodes) + '  |  Estimated Edges: ' + formatNumber(edges);
  text(estText, canvasWidth / 2, estY);
}

function getEmployeeCount() {
  // Logarithmic mapping: slider 0-1 maps to 1K-1M on log scale
  let logMin = Math.log10(minEmployees);
  let logMax = Math.log10(maxEmployees);
  let logVal = logMin + sliderValue * (logMax - logMin);
  return Math.round(Math.pow(10, logVal));
}

function estimateNodes(employees) {
  // Nodes: employees + departments (~emp/20) + teams (~emp/8) + projects (~emp/3)
  let departments = Math.ceil(employees / 20);
  let teams = Math.ceil(employees / 8);
  let projects = Math.ceil(employees / 3);
  return employees + departments + teams + projects;
}

function estimateEdges(employees) {
  // Edges: reports_to (~emp), member_of (~emp), works_on (~emp*1.5), communicates (~emp*5)
  let reportsTo = employees;
  let memberOf = employees;
  let worksOn = Math.ceil(employees * 1.5);
  let communicates = Math.ceil(employees * 5);
  return reportsTo + memberOf + worksOn + communicates;
}

function formatNumber(n) {
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1) + 'M';
  } else if (n >= 1000) {
    return (n / 1000).toFixed(n >= 100000 ? 0 : 1) + 'K';
  }
  return n.toString();
}

function mousePressed() {
  if (isOverSlider(mouseX, mouseY)) {
    isDraggingSlider = true;
    updateSliderValue(mouseX);
  }
}

function mouseDragged() {
  if (isDraggingSlider) {
    updateSliderValue(mouseX);
  }
}

function mouseReleased() {
  isDraggingSlider = false;
}

function isOverSlider(mx, my) {
  let sliderPadding = margin + 20;
  let sliderStartX = sliderPadding;
  let handleX = sliderStartX + sliderValue * sliderWidth;

  // Check if near the handle
  let d = dist(mx, my, handleX, sliderY);
  if (d < handleRadius + 5) return true;

  // Check if on the track
  if (mx >= sliderStartX && mx <= sliderStartX + sliderWidth &&
      my >= sliderY - 15 && my <= sliderY + 15) {
    return true;
  }
  return false;
}

function updateSliderValue(mx) {
  let sliderPadding = margin + 20;
  let sliderStartX = sliderPadding;
  sliderValue = constrain((mx - sliderStartX) / sliderWidth, 0, 1);
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
