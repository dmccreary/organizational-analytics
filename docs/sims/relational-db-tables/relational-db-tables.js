// Relational Database Tables MicroSim
// Shows two linked tables with foreign key relationships

let canvasWidth = 400;
let drawHeight = 400;
let controlHeight = 40;
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

// Table data
const empTable = {
  name: 'Employees',
  columns: ['emp_id', 'name', 'dept_id', 'title'],
  colTypes: ['PK', '', 'FK', ''],
  rows: [
    ['101', 'Maria Chen', 'D10', 'Senior Engineer'],
    ['102', 'James Park', 'D10', 'Eng. Director'],
    ['103', 'Aisha Patel', 'D20', 'Product Manager']
  ]
};

const deptTable = {
  name: 'Departments',
  columns: ['dept_id', 'dept_name', 'head_id'],
  colTypes: ['PK', '', 'FK'],
  rows: [
    ['D10', 'Engineering', '102'],
    ['D20', 'Product', '104']
  ]
};

let hoveredRow = null;  // { table: 'emp'|'dept', rowIdx: 0-based }
let hoveredArrow = null; // 'dept_fk' or 'head_fk'
let tooltipText = '';
let tooltipX = 0;
let tooltipY = 0;

// Computed table positions (recalculated each frame)
let empX, empY, empW, empH;
let deptX, deptY, deptW, deptH;
let rowH = 28;
let headerH = 32;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));
  describe('Two relational database tables showing Employees and Departments with foreign key arrows connecting them.', LABEL);
  textFont('Arial');
}

function draw() {
  updateCanvasSize();

  // Draw area background
  fill(CHAMPAGNE);
  noStroke();
  rect(0, 0, canvasWidth, drawHeight);

  // Control area background
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  fill(INDIGO_DARK);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(min(18, canvasWidth * 0.035));
  textStyle(BOLD);
  text('Relational Database Tables', canvasWidth / 2, 10);
  textStyle(NORMAL);

  // Compute table sizes based on canvas width
  let gap = max(60, canvasWidth * 0.08);
  let totalTableW = canvasWidth - margin * 2 - gap;
  empW = totalTableW * 0.55;
  deptW = totalTableW * 0.45;

  let tableTop = 45;
  empX = margin;
  empY = tableTop;
  empH = headerH + empTable.rows.length * rowH;

  deptX = canvasWidth - margin - deptW;
  deptY = tableTop;
  deptH = headerH + deptTable.rows.length * rowH;

  // Adjust row height for small canvases
  let fontSize = constrain(canvasWidth * 0.022, 10, 14);
  rowH = fontSize * 2.2;
  headerH = fontSize * 2.6;
  empH = headerH + empTable.rows.length * rowH;
  deptH = headerH + deptTable.rows.length * rowH;

  // Draw tables
  drawTable(empTable, empX, empY, empW, empH, 'emp', fontSize);
  drawTable(deptTable, deptX, deptY, deptW, deptH, 'dept', fontSize);

  // Draw FK arrows
  drawForeignKeyArrows(fontSize);

  // Draw tooltip
  if (tooltipText) {
    drawTooltip();
  }

  // Draw control area caption
  fill('#666');
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(constrain(canvasWidth * 0.025, 10, 13));
  textStyle(ITALIC);
  text('Hover over rows and arrows to explore relationships', canvasWidth / 2, drawHeight + controlHeight / 2);
  textStyle(NORMAL);
}

function drawTable(tbl, tx, ty, tw, th, tableId, fontSize) {
  let colW = tw / tbl.columns.length;

  // Table shadow
  noStroke();
  fill(0, 0, 0, 20);
  rect(tx + 3, ty + 3, tw, th, 6);

  // Table border
  stroke('#ccc');
  strokeWeight(1);
  fill('white');
  rect(tx, ty, tw, th, 6);

  // Table name header
  noStroke();
  fill(INDIGO);
  rect(tx, ty, tw, headerH, 6, 6, 0, 0);
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(fontSize + 2);
  textStyle(BOLD);
  text(tbl.name, tx + tw / 2, ty + headerH / 2);
  textStyle(NORMAL);

  // Column headers
  let colY = ty + headerH;
  noStroke();
  fill('#E8EAF6');
  rect(tx, colY, tw, rowH);

  textSize(fontSize);
  textStyle(BOLD);
  for (let c = 0; c < tbl.columns.length; c++) {
    let cx = tx + c * colW;

    // PK/FK badge
    if (tbl.colTypes[c] === 'PK') {
      fill(GOLD);
      noStroke();
      rect(cx + 2, colY + 2, colW - 4, rowH - 4, 3);
    } else if (tbl.colTypes[c] === 'FK') {
      fill(AMBER_LIGHT);
      noStroke();
      rect(cx + 2, colY + 2, colW - 4, rowH - 4, 3);
    }

    fill(INDIGO_DARK);
    textAlign(CENTER, CENTER);
    text(tbl.columns[c], cx + colW / 2, colY + rowH / 2);

    // Type label
    if (tbl.colTypes[c]) {
      fill(tbl.colTypes[c] === 'PK' ? AMBER_DARK : AMBER);
      textSize(fontSize * 0.7);
      textAlign(CENTER, TOP);
      text(tbl.colTypes[c], cx + colW / 2, colY + rowH - fontSize * 0.7);
      textSize(fontSize);
    }
  }
  textStyle(NORMAL);

  // Separator line under column headers
  stroke('#ccc');
  strokeWeight(1);
  line(tx, colY + rowH, tx + tw, colY + rowH);

  // Data rows
  for (let r = 0; r < tbl.rows.length; r++) {
    let ry = colY + rowH + r * rowH;
    let isHovered = hoveredRow && hoveredRow.table === tableId && hoveredRow.rowIdx === r;

    // Row background
    noStroke();
    if (isHovered) {
      fill(255, 215, 0, 60); // Gold highlight
    } else if (r % 2 === 1) {
      fill(248, 248, 255);
    } else {
      fill('white');
    }

    // Round bottom corners for last row
    if (r === tbl.rows.length - 1) {
      rect(tx, ry, tw, rowH, 0, 0, 6, 6);
    } else {
      rect(tx, ry, tw, rowH);
    }

    // Row separator
    if (r < tbl.rows.length - 1) {
      stroke('#eee');
      strokeWeight(0.5);
      line(tx, ry + rowH, tx + tw, ry + rowH);
    }

    // Cell values
    noStroke();
    textAlign(CENTER, CENTER);
    for (let c = 0; c < tbl.rows[r].length; c++) {
      let cx = tx + c * colW;

      // Highlight PK column cells
      if (tbl.colTypes[c] === 'PK') {
        fill(GOLD + '30');
        noStroke();
        rect(cx, ry, colW, rowH);
      }

      fill(isHovered ? INDIGO_DARK : '#333');
      textSize(fontSize * 0.9);
      text(tbl.rows[r][c], cx + colW / 2, ry + rowH / 2);
    }
  }

  // Column separators
  stroke('#e0e0e0');
  strokeWeight(0.5);
  for (let c = 1; c < tbl.columns.length; c++) {
    let cx = tx + c * colW;
    line(cx, colY, cx, colY + rowH + tbl.rows.length * rowH);
  }
}

function drawForeignKeyArrows(fontSize) {
  let empColW = empW / empTable.columns.length;
  let deptColW = deptW / deptTable.columns.length;

  // Arrow 1: Employees.dept_id -> Departments.dept_id
  let arrow1StartX = empX + empW;
  let arrow1StartY = empY + headerH + rowH + 0.5 * rowH; // Middle of column header row for dept_id
  let arrow1EndX = deptX;
  let arrow1EndY = deptY + headerH + 0.5 * rowH; // dept_id column header

  let isArrow1Hovered = hoveredArrow === 'dept_fk';

  // Draw dashed arrow
  strokeWeight(isArrow1Hovered ? 3 : 2);
  stroke(isArrow1Hovered ? AMBER_DARK : AMBER);
  drawDashedArrow(arrow1StartX, arrow1StartY, arrow1EndX, arrow1EndY, isArrow1Hovered);

  // Label for arrow 1
  let midX1 = (arrow1StartX + arrow1EndX) / 2;
  let midY1 = (arrow1StartY + arrow1EndY) / 2 - 12;
  noStroke();
  fill(isArrow1Hovered ? AMBER_DARK : AMBER);
  textAlign(CENTER, CENTER);
  textSize(fontSize * 0.85);
  textStyle(BOLD);
  text('Foreign Key', midX1, midY1);
  textStyle(NORMAL);

  // Arrow 2: Departments.head_id -> Employees.emp_id
  let arrow2StartX = deptX;
  let arrow2StartY = deptY + headerH + rowH + 1.5 * rowH; // Below dept rows
  let arrow2EndX = empX + empW;
  let arrow2EndY = empY + headerH + 2.5 * rowH; // Point toward emp_id area

  // Curve the second arrow below
  let isArrow2Hovered = hoveredArrow === 'head_fk';

  strokeWeight(isArrow2Hovered ? 3 : 2);
  stroke(isArrow2Hovered ? AMBER_DARK : AMBER);

  // Draw curved arrow below tables
  let curveY = max(empY + empH, deptY + deptH) + 40;
  drawDashedCurvedArrow(arrow2StartX + deptColW * 1.5, arrow2StartY, empX + empColW * 0.5, empY + empH, curveY, isArrow2Hovered);

  // Label for arrow 2
  let midX2 = (arrow2StartX + empX + empW) / 2;
  noStroke();
  fill(isArrow2Hovered ? AMBER_DARK : AMBER);
  textAlign(CENTER, CENTER);
  textSize(fontSize * 0.85);
  textStyle(BOLD);
  text('Foreign Key', midX2, curveY + 12);
  textStyle(NORMAL);

  // Store arrow hitboxes for hover detection
  // (done in mouseMoved)
}

function drawDashedArrow(x1, y1, x2, y2, isHovered) {
  let d = dist(x1, y1, x2, y2);
  let dashLen = 8;
  let gapLen = 5;
  let steps = floor(d / (dashLen + gapLen));
  let dx = (x2 - x1) / d;
  let dy = (y2 - y1) / d;

  for (let i = 0; i < steps; i++) {
    let sx = x1 + (dashLen + gapLen) * i * dx;
    let sy = y1 + (dashLen + gapLen) * i * dy;
    let ex = sx + dashLen * dx;
    let ey = sy + dashLen * dy;
    line(sx, sy, ex, ey);
  }

  // Arrowhead
  let angle = atan2(y2 - y1, x2 - x1);
  let arrowSize = isHovered ? 12 : 10;
  fill(isHovered ? AMBER_DARK : AMBER);
  noStroke();
  push();
  translate(x2, y2);
  rotate(angle);
  triangle(0, 0, -arrowSize, -arrowSize / 2.5, -arrowSize, arrowSize / 2.5);
  pop();
}

function drawDashedCurvedArrow(x1, y1, x2, y2, curveYPos, isHovered) {
  // Draw a path that goes down, across, and up
  let segments = [
    { x1: x1, y1: y1, x2: x1, y2: curveYPos },
    { x1: x1, y1: curveYPos, x2: x2, y2: curveYPos },
    { x1: x2, y1: curveYPos, x2: x2, y2: y2 }
  ];

  for (let seg of segments) {
    drawDashedLine(seg.x1, seg.y1, seg.x2, seg.y2);
  }

  // Arrowhead pointing up
  let arrowSize = isHovered ? 12 : 10;
  fill(isHovered ? AMBER_DARK : AMBER);
  noStroke();
  triangle(x2, y2, x2 - arrowSize / 2.5, y2 + arrowSize, x2 + arrowSize / 2.5, y2 + arrowSize);
}

function drawDashedLine(x1, y1, x2, y2) {
  let d = dist(x1, y1, x2, y2);
  if (d === 0) return;
  let dashLen = 8;
  let gapLen = 5;
  let steps = floor(d / (dashLen + gapLen));
  let dx = (x2 - x1) / d;
  let dy = (y2 - y1) / d;

  for (let i = 0; i < steps; i++) {
    let sx = x1 + (dashLen + gapLen) * i * dx;
    let sy = y1 + (dashLen + gapLen) * i * dy;
    let ex = sx + dashLen * dx;
    let ey = sy + dashLen * dy;
    line(sx, sy, ex, ey);
  }
}

function drawTooltip() {
  let tw = textWidth(tooltipText) + 20;
  let th = 28;
  let tx = constrain(tooltipX + 15, 5, canvasWidth - tw - 5);
  let ty = constrain(tooltipY - 35, 5, drawHeight - th - 5);

  // Background
  noStroke();
  fill(0, 0, 0, 180);
  rect(tx, ty, tw, th, 5);

  // Text
  fill('white');
  textAlign(LEFT, CENTER);
  textSize(12);
  text(tooltipText, tx + 10, ty + th / 2);
}

function mouseMoved() {
  hoveredRow = null;
  hoveredArrow = null;
  tooltipText = '';
  tooltipX = mouseX;
  tooltipY = mouseY;

  if (mouseY < 0 || mouseY > drawHeight) return;

  let empColW = empW / empTable.columns.length;
  let deptColW = deptW / deptTable.columns.length;

  // Check employee table rows
  let empDataTop = empY + headerH + rowH;
  for (let r = 0; r < empTable.rows.length; r++) {
    let ry = empDataTop + r * rowH;
    if (mouseX >= empX && mouseX <= empX + empW && mouseY >= ry && mouseY <= ry + rowH) {
      hoveredRow = { table: 'emp', rowIdx: r };
      let row = empTable.rows[r];
      tooltipText = `Employee: ${row[1]} (ID: ${row[0]}) - Dept: ${row[2]}`;
      return;
    }
  }

  // Check department table rows
  let deptDataTop = deptY + headerH + rowH;
  for (let r = 0; r < deptTable.rows.length; r++) {
    let ry = deptDataTop + r * rowH;
    if (mouseX >= deptX && mouseX <= deptX + deptW && mouseY >= ry && mouseY <= ry + rowH) {
      hoveredRow = { table: 'dept', rowIdx: r };
      let row = deptTable.rows[r];
      tooltipText = `Department: ${row[1]} (ID: ${row[0]}) - Head: emp ${row[2]}`;
      return;
    }
  }

  // Check FK arrow regions
  let arrowMidX = (empX + empW + deptX) / 2;
  let arrowMidY1 = (empY + headerH + rowH * 1.5 + deptY + headerH + rowH * 0.5) / 2;
  if (dist(mouseX, mouseY, arrowMidX, arrowMidY1) < 40) {
    hoveredArrow = 'dept_fk';
    tooltipText = 'FK: Employees.dept_id references Departments.dept_id';
    return;
  }

  let curveY = max(empY + empH, deptY + deptH) + 40;
  if (mouseY > max(empY + empH, deptY + deptH) - 10 && mouseY < curveY + 25) {
    hoveredArrow = 'head_fk';
    tooltipText = 'FK: Departments.head_id references Employees.emp_id';
    return;
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
