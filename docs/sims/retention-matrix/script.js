// Retention Priority Matrix MicroSim
// Interactive 2x2 scatter plot of Flight Risk vs Organizational Impact

// Aria color scheme
const INDIGO = [48, 63, 159];
const INDIGO_DARK = [26, 35, 126];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// Department colors
const DEPT_COLORS = {
  Engineering: [48, 63, 159],    // indigo
  Product:     [0, 137, 123],    // teal
  Sales:       [56, 142, 60],    // green
  HR:          [212, 136, 15],   // amber
  Operations:  [106, 27, 154]    // purple
};

const DEPARTMENTS = ['All', 'Engineering', 'Product', 'Sales', 'HR', 'Operations'];

// Layout constants
let canvasW = 900;
const canvasH = 500;
const MARGIN = { top: 80, right: 200, bottom: 55, left: 65 };
let plotW, plotH;

// State
let employees = [];
let contagionPairs = [];
let activeDept = 'All';
let showContagion = false;
let hoveredEmp = null;
let pinnedEmp = null;

// Button geometry (computed in setup)
let deptButtons = [];
let contagionBtn = {};

function updateCanvasSize() {
  let container = document.getElementById('canvas-container');
  if (container) {
    canvasW = container.offsetWidth;
  }
}

function setup() {
  updateCanvasSize();
  let canvas = createCanvas(canvasW, canvasH);
  canvas.parent('canvas-container');
  textFont('Arial');

  plotW = canvasW - MARGIN.left - MARGIN.right;
  plotH = canvasH - MARGIN.top - MARGIN.bottom;

  generateEmployees();
  generateContagionPairs();
  computeButtons();
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasW, canvasH);
  plotW = canvasW - MARGIN.left - MARGIN.right;
  plotH = canvasH - MARGIN.top - MARGIN.bottom;
  computeButtons();
}

function computeButtons() {
  deptButtons = [];
  let bw = 90, bh = 24, gap = 6;
  let totalW = DEPARTMENTS.length * bw + (DEPARTMENTS.length - 1) * gap;
  let startX = MARGIN.left + (plotW - totalW) / 2;
  let by = 10;
  for (let i = 0; i < DEPARTMENTS.length; i++) {
    deptButtons.push({
      x: startX + i * (bw + gap),
      y: by,
      w: bw,
      h: bh,
      label: DEPARTMENTS[i]
    });
  }
  // Contagion toggle button
  let cbw = 170, cbh = 24;
  contagionBtn = {
    x: startX + totalW + 16,
    y: by,
    w: cbw,
    h: cbh
  };
}

// ---- Data generation ----

function generateEmployees() {
  const data = [
    // Engineering (7 employees)
    { name: 'Raj Patel', title: 'Principal Engineer', dept: 'Engineering', fr: 0.82, oi: 0.91, factors: 'Recruiter contact, below-market comp, key system architect' },
    { name: 'Mei Chen', title: 'Senior Engineer', dept: 'Engineering', fr: 0.71, oi: 0.78, factors: 'LinkedIn activity spike, owns critical microservices' },
    { name: 'Alex Rivera', title: 'Staff Engineer', dept: 'Engineering', fr: 0.35, oi: 0.88, factors: 'Stable but high-impact; mentors 4 junior devs' },
    { name: 'Jordan Lee', title: 'Junior Engineer', dept: 'Engineering', fr: 0.55, oi: 0.32, factors: 'Low engagement scores, first job out of school' },
    { name: 'Sam Okafor', title: 'DevOps Lead', dept: 'Engineering', fr: 0.63, oi: 0.72, factors: 'Team reorg frustration, owns CI/CD pipeline' },
    { name: 'Priya Sharma', title: 'Data Engineer', dept: 'Engineering', fr: 0.28, oi: 0.55, factors: 'Recently promoted, solid engagement' },
    { name: 'Tomasz Nowak', title: 'QA Engineer', dept: 'Engineering', fr: 0.42, oi: 0.25, factors: 'Moderate satisfaction, replaceable skill set' },

    // Product (7 employees)
    { name: 'Lisa Zhang', title: 'VP Product', dept: 'Product', fr: 0.75, oi: 0.95, factors: 'Executive recruiter contact, owns product roadmap' },
    { name: 'Carlos Mendez', title: 'Senior PM', dept: 'Product', fr: 0.48, oi: 0.70, factors: 'Passed over for promotion, strong client relationships' },
    { name: 'Aisha Johnson', title: 'Product Analyst', dept: 'Product', fr: 0.30, oi: 0.42, factors: 'Good work-life balance, moderate impact' },
    { name: 'Derek Wu', title: 'UX Designer', dept: 'Product', fr: 0.60, oi: 0.58, factors: 'Design portfolio updated, sole UX resource' },
    { name: 'Nina Petrov', title: 'Product Manager', dept: 'Product', fr: 0.22, oi: 0.65, factors: 'High engagement, leads key initiative' },
    { name: 'Ryan Foster', title: 'Junior PM', dept: 'Product', fr: 0.68, oi: 0.30, factors: 'Startup interest, limited institutional knowledge' },
    { name: 'Sophia Tran', title: 'UX Researcher', dept: 'Product', fr: 0.15, oi: 0.35, factors: 'New hire, still ramping up' },

    // Sales (7 employees)
    { name: 'Mike Harrison', title: 'Sales Director', dept: 'Sales', fr: 0.58, oi: 0.85, factors: 'Competitor offer rumored, manages top accounts' },
    { name: 'Kenji Tanaka', title: 'Enterprise AE', dept: 'Sales', fr: 0.80, oi: 0.76, factors: 'Missed quota bonus, strong client book' },
    { name: 'Laura Kim', title: 'Account Executive', dept: 'Sales', fr: 0.45, oi: 0.48, factors: 'Moderate performer, some key accounts' },
    { name: 'David Brown', title: 'Sales Engineer', dept: 'Sales', fr: 0.33, oi: 0.62, factors: 'Technical bridge role, hard to replace' },
    { name: 'Emma Scott', title: 'SDR Manager', dept: 'Sales', fr: 0.52, oi: 0.55, factors: 'Team morale issues, trains all new SDRs' },
    { name: 'Omar Hassan', title: 'SDR', dept: 'Sales', fr: 0.70, oi: 0.20, factors: 'High activity on job boards, entry-level role' },
    { name: 'Rachel Adams', title: 'Account Manager', dept: 'Sales', fr: 0.18, oi: 0.40, factors: 'Long tenure, loyal, moderate book' },

    // HR (7 employees)
    { name: 'Diana Torres', title: 'CHRO', dept: 'HR', fr: 0.40, oi: 0.90, factors: 'Headhunter approaches, institutional knowledge' },
    { name: 'James Wright', title: 'HR Business Partner', dept: 'HR', fr: 0.65, oi: 0.60, factors: 'Burnout signals, trusted advisor to engineering' },
    { name: 'Fatima Al-Rashid', title: 'Talent Acquisition Lead', dept: 'HR', fr: 0.72, oi: 0.52, factors: 'Overworked, market demand for TA leaders' },
    { name: 'Ben Cooper', title: 'Comp & Benefits Analyst', dept: 'HR', fr: 0.25, oi: 0.45, factors: 'Stable, specialized knowledge' },
    { name: 'Grace Obi', title: 'HRIS Manager', dept: 'HR', fr: 0.55, oi: 0.68, factors: 'System migration stress, sole admin' },
    { name: 'Tyler Morgan', title: 'L&D Specialist', dept: 'HR', fr: 0.38, oi: 0.28, factors: 'Adequate engagement, shared responsibilities' },
    { name: 'Hannah Park', title: 'HR Coordinator', dept: 'HR', fr: 0.48, oi: 0.18, factors: 'Career growth concerns, entry-level' },

    // Operations (7 employees)
    { name: 'Victor Reyes', title: 'COO', dept: 'Operations', fr: 0.30, oi: 0.92, factors: 'Stable but critical; succession plan needed' },
    { name: 'Karen Mitchell', title: 'Program Manager', dept: 'Operations', fr: 0.62, oi: 0.73, factors: 'Cross-functional connector, considering MBA' },
    { name: 'Andre Williams', title: 'Facilities Manager', dept: 'Operations', fr: 0.20, oi: 0.30, factors: 'Long tenure, content in role' },
    { name: 'Yuki Sato', title: 'Business Analyst', dept: 'Operations', fr: 0.75, oi: 0.55, factors: 'Skills in high demand, bored with current work' },
    { name: 'Chris Nguyen', title: 'IT Manager', dept: 'Operations', fr: 0.50, oi: 0.65, factors: 'Infrastructure knowledge, team friction' },
    { name: 'Monica Lewis', title: 'Procurement Specialist', dept: 'Operations', fr: 0.15, oi: 0.22, factors: 'Low risk, routine role' },
    { name: 'Ethan Clarke', title: 'Security Analyst', dept: 'Operations', fr: 0.58, oi: 0.48, factors: 'Cyber roles pay more, compliance knowledge' }
  ];

  employees = data.map((d, i) => ({
    id: i,
    name: d.name,
    title: d.title,
    dept: d.dept,
    flightRisk: d.fr,
    orgImpact: d.oi,
    factors: d.factors
  }));
}

function generateContagionPairs() {
  // Pairs of employees who communicate frequently and both have elevated risk
  contagionPairs = [
    [0, 1],   // Raj & Mei (Engineering seniors)
    [0, 4],   // Raj & Sam (Engineering infra)
    [1, 4],   // Mei & Sam (Engineering)
    [3, 6],   // Jordan & Tomasz (Engineering junior/QA)
    [7, 8],   // Lisa & Carlos (Product leadership)
    [10, 12], // Derek & Ryan (Product)
    [14, 15], // Kenji & Laura (Sales)
    [15, 17], // Laura & Emma (Sales)
    [22, 23], // Fatima & Ben (HR)
    [21, 24], // James & Grace (HR)
    [25, 26], // Tyler & Hannah (HR)
    [29, 30], // Yuki & Chris (Operations)
    [28, 30], // Karen & Chris (Operations)
    [4, 30],  // Sam & Chris (cross-dept DevOps-IT)
    [0, 7],   // Raj & Lisa (cross-dept tech-product leaders)
  ];
}

// ---- Coordinate mapping ----

function dataToScreen(fr, oi) {
  let x = MARGIN.left + fr * plotW;
  let y = MARGIN.top + (1 - oi) * plotH;
  return { x, y };
}

function screenToData(sx, sy) {
  let fr = (sx - MARGIN.left) / plotW;
  let oi = 1 - (sy - MARGIN.top) / plotH;
  return { fr, oi };
}

// ---- Drawing ----

function draw() {
  background(245);

  drawButtons();
  drawQuadrants();
  drawAxes();
  drawContagionLinks();
  drawEmployees();
  drawTooltip();
  drawPinnedPanel();
}

function drawButtons() {
  // Department filter buttons
  for (let btn of deptButtons) {
    let isActive = (activeDept === btn.label);
    if (isActive) {
      fill(INDIGO[0], INDIGO[1], INDIGO[2]);
    } else {
      fill(220);
    }
    noStroke();
    rect(btn.x, btn.y, btn.w, btn.h, 4);

    fill(isActive ? 255 : 60);
    textAlign(CENTER, CENTER);
    textSize(11);
    textStyle(BOLD);
    text(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
  }

  // Contagion toggle
  let cb = contagionBtn;
  if (showContagion) {
    fill(180, 40, 40);
  } else {
    fill(220);
  }
  noStroke();
  rect(cb.x, cb.y, cb.w, cb.h, 4);

  fill(showContagion ? 255 : 60);
  textAlign(CENTER, CENTER);
  textSize(10);
  textStyle(BOLD);
  text('Contagion Links ' + (showContagion ? 'ON' : 'OFF'), cb.x + cb.w / 2, cb.y + cb.h / 2);
  textStyle(NORMAL);
}

function drawQuadrants() {
  noStroke();
  let midX = MARGIN.left + 0.5 * plotW;
  let midY = MARGIN.top + 0.5 * plotH;
  let left = MARGIN.left;
  let top = MARGIN.top;
  let right = MARGIN.left + plotW;
  let bottom = MARGIN.top + plotH;

  // Bottom-left: Monitor (green tint)
  fill(200, 235, 200, 80);
  rect(left, midY, midX - left, bottom - midY);

  // Bottom-right: High (light amber tint)
  fill(255, 230, 180, 80);
  rect(midX, midY, right - midX, bottom - midY);

  // Top-left: Watch (amber tint)
  fill(255, 220, 160, 80);
  rect(left, top, midX - left, midY - top);

  // Top-right: Critical (red/pink tint)
  fill(255, 190, 190, 90);
  rect(midX, top, right - midX, midY - top);

  // Dividing lines
  stroke(120);
  strokeWeight(1);
  setLineDash([5, 5]);
  line(midX, top, midX, bottom);
  line(left, midY, right, midY);
  setLineDash([]);

  // Quadrant labels
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(12);
  textStyle(BOLD);

  // Top-right: Critical
  fill(160, 30, 30);
  text('CRITICAL', midX + (right - midX) / 2, top + 18);
  textStyle(NORMAL);
  textSize(9);
  fill(130, 30, 30);
  text('Retain at all costs', midX + (right - midX) / 2, top + 33);

  // Top-left: Watch
  textStyle(BOLD);
  textSize(12);
  fill(160, 100, 0);
  text('WATCH', left + (midX - left) / 2, top + 18);
  textStyle(NORMAL);
  textSize(9);
  fill(140, 90, 0);
  text('Proactive engagement', left + (midX - left) / 2, top + 33);

  // Bottom-right: High
  textStyle(BOLD);
  textSize(12);
  fill(170, 110, 0);
  text('HIGH RISK', midX + (right - midX) / 2, bottom - 18);
  textStyle(NORMAL);
  textSize(9);
  fill(150, 100, 0);
  text('Active intervention', midX + (right - midX) / 2, bottom - 5);

  // Bottom-left: Monitor
  textStyle(BOLD);
  textSize(12);
  fill(40, 120, 40);
  text('MONITOR', left + (midX - left) / 2, bottom - 18);
  textStyle(NORMAL);
  textSize(9);
  fill(30, 100, 30);
  text('Standard programs', left + (midX - left) / 2, bottom - 5);
}

function drawAxes() {
  stroke(80);
  strokeWeight(1.5);
  setLineDash([]);

  // X axis
  line(MARGIN.left, MARGIN.top + plotH, MARGIN.left + plotW, MARGIN.top + plotH);
  // Y axis
  line(MARGIN.left, MARGIN.top, MARGIN.left, MARGIN.top + plotH);

  // Tick marks and labels
  textAlign(CENTER, TOP);
  textSize(10);
  fill(60);
  noStroke();

  let ticks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
  for (let t of ticks) {
    // X axis ticks
    let sx = MARGIN.left + t * plotW;
    stroke(80);
    strokeWeight(1);
    line(sx, MARGIN.top + plotH, sx, MARGIN.top + plotH + 5);
    noStroke();
    fill(60);
    textAlign(CENTER, TOP);
    text(t.toFixed(1), sx, MARGIN.top + plotH + 7);

    // Y axis ticks
    let sy = MARGIN.top + (1 - t) * plotH;
    stroke(80);
    strokeWeight(1);
    line(MARGIN.left - 5, sy, MARGIN.left, sy);
    noStroke();
    fill(60);
    textAlign(RIGHT, CENTER);
    text(t.toFixed(1), MARGIN.left - 8, sy);
  }

  // Axis labels
  textAlign(CENTER, CENTER);
  textSize(13);
  textStyle(BOLD);
  fill(INDIGO_DARK[0], INDIGO_DARK[1], INDIGO_DARK[2]);
  text('Flight Risk Score', MARGIN.left + plotW / 2, canvasH - 10);

  push();
  translate(15, MARGIN.top + plotH / 2);
  rotate(-HALF_PI);
  text('Organizational Impact Score', 0, 0);
  pop();
  textStyle(NORMAL);

  // Title
  textSize(16);
  textStyle(BOLD);
  fill(INDIGO_DARK[0], INDIGO_DARK[1], INDIGO_DARK[2]);
  textAlign(CENTER, CENTER);
  text('Retention Priority Matrix', canvasW / 2, 48);
  textStyle(NORMAL);
}

function drawContagionLinks() {
  if (!showContagion) return;

  stroke(200, 50, 50, 140);
  strokeWeight(1.5);
  setLineDash([6, 4]);

  for (let pair of contagionPairs) {
    let e1 = employees[pair[0]];
    let e2 = employees[pair[1]];

    // Only draw if both visible under current filter
    if (activeDept !== 'All' && e1.dept !== activeDept && e2.dept !== activeDept) continue;

    let p1 = dataToScreen(e1.flightRisk, e1.orgImpact);
    let p2 = dataToScreen(e2.flightRisk, e2.orgImpact);
    line(p1.x, p1.y, p2.x, p2.y);
  }
  setLineDash([]);
}

function drawEmployees() {
  let dotR = 12;
  hoveredEmp = null;

  for (let emp of employees) {
    let pos = dataToScreen(emp.flightRisk, emp.orgImpact);
    let col = DEPT_COLORS[emp.dept];
    let isDimmed = (activeDept !== 'All' && emp.dept !== activeDept);

    // Check hover
    let d = dist(mouseX, mouseY, pos.x, pos.y);
    let isHovered = (d < dotR / 2 + 4);
    if (isHovered && !isDimmed) {
      hoveredEmp = emp;
    }

    // Draw dot
    noStroke();
    if (isDimmed) {
      fill(col[0], col[1], col[2], 50);
    } else {
      fill(col[0], col[1], col[2], 210);
    }

    if (isHovered && !isDimmed) {
      // Highlight ring
      stroke(AMBER[0], AMBER[1], AMBER[2]);
      strokeWeight(3);
      fill(col[0], col[1], col[2], 230);
    }

    if (pinnedEmp && pinnedEmp.id === emp.id) {
      stroke(GOLD[0], GOLD[1], GOLD[2]);
      strokeWeight(3);
      fill(col[0], col[1], col[2], 240);
    }

    ellipse(pos.x, pos.y, dotR, dotR);
    noStroke();
  }
}

function drawTooltip() {
  if (!hoveredEmp) return;

  let emp = hoveredEmp;
  let pos = dataToScreen(emp.flightRisk, emp.orgImpact);

  let lines = [
    emp.name,
    emp.title,
    emp.dept,
    'Flight Risk: ' + emp.flightRisk.toFixed(2),
    'Org Impact: ' + emp.orgImpact.toFixed(2),
    'Factors: ' + emp.factors
  ];

  textSize(10);
  textStyle(NORMAL);
  let tw = 0;
  for (let l of lines) {
    tw = max(tw, textWidth(l));
  }
  tw = min(tw, 220);

  // Wrap factors line
  let wrappedLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (i === 5) {
      wrappedLines = wrappedLines.concat(wrapText(lines[i], tw));
    } else {
      wrappedLines.push(lines[i]);
    }
  }

  let th = wrappedLines.length * 14 + 12;
  let tx = pos.x + 15;
  let ty = pos.y - th / 2;

  // Keep tooltip on screen
  if (tx + tw + 16 > canvasW) tx = pos.x - tw - 30;
  if (ty < 5) ty = 5;
  if (ty + th > canvasH - 5) ty = canvasH - th - 5;

  // Background
  fill(255, 255, 255, 240);
  stroke(INDIGO[0], INDIGO[1], INDIGO[2], 120);
  strokeWeight(1);
  rect(tx, ty, tw + 16, th, 5);

  // Text
  noStroke();
  textAlign(LEFT, TOP);
  for (let i = 0; i < wrappedLines.length; i++) {
    if (i === 0) {
      fill(INDIGO_DARK[0], INDIGO_DARK[1], INDIGO_DARK[2]);
      textStyle(BOLD);
    } else if (i === 1) {
      fill(100);
      textStyle(ITALIC);
    } else {
      fill(60);
      textStyle(NORMAL);
    }
    text(wrappedLines[i], tx + 8, ty + 6 + i * 14);
  }
  textStyle(NORMAL);
}

function wrapText(str, maxW) {
  textSize(10);
  let words = str.split(' ');
  let lines = [];
  let current = '';
  for (let w of words) {
    let test = current ? current + ' ' + w : w;
    if (textWidth(test) > maxW && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawPinnedPanel() {
  if (!pinnedEmp) return;

  let emp = pinnedEmp;
  let px = MARGIN.left + plotW + 12;
  let py = MARGIN.top + 10;
  let pw = MARGIN.right - 20;
  let ph = 230;

  // Panel background
  fill(255, 255, 255, 245);
  stroke(INDIGO[0], INDIGO[1], INDIGO[2]);
  strokeWeight(1.5);
  rect(px, py, pw, ph, 6);

  noStroke();
  textAlign(LEFT, TOP);
  let cx = px + 10;
  let cy = py + 10;

  // Name
  textSize(13);
  textStyle(BOLD);
  fill(INDIGO_DARK[0], INDIGO_DARK[1], INDIGO_DARK[2]);
  text(emp.name, cx, cy);
  cy += 18;

  // Title
  textSize(10);
  textStyle(ITALIC);
  fill(100);
  text(emp.title, cx, cy);
  cy += 16;

  // Department with color dot
  let col = DEPT_COLORS[emp.dept];
  fill(col[0], col[1], col[2]);
  noStroke();
  ellipse(cx + 5, cy + 6, 8, 8);
  fill(60);
  textStyle(NORMAL);
  textSize(10);
  text(emp.dept, cx + 14, cy);
  cy += 20;

  // Divider
  stroke(200);
  strokeWeight(0.5);
  line(cx, cy, cx + pw - 20, cy);
  noStroke();
  cy += 8;

  // Scores
  textSize(10);
  textStyle(BOLD);
  fill(INDIGO_DARK[0], INDIGO_DARK[1], INDIGO_DARK[2]);
  text('Flight Risk:', cx, cy);
  fill(emp.flightRisk > 0.6 ? [200, 50, 50] : (emp.flightRisk > 0.4 ? [180, 120, 0] : [40, 120, 40]));
  textStyle(NORMAL);
  text(emp.flightRisk.toFixed(2), cx + 70, cy);

  // Risk bar
  let barX = cx, barY = cy + 14, barW = pw - 20, barH = 6;
  fill(230);
  noStroke();
  rect(barX, barY, barW, barH, 3);
  fill(emp.flightRisk > 0.6 ? [200, 50, 50] : (emp.flightRisk > 0.4 ? [210, 160, 0] : [60, 160, 60]));
  rect(barX, barY, barW * emp.flightRisk, barH, 3);
  cy += 26;

  textStyle(BOLD);
  fill(INDIGO_DARK[0], INDIGO_DARK[1], INDIGO_DARK[2]);
  text('Org Impact:', cx, cy);
  fill(INDIGO[0], INDIGO[1], INDIGO[2]);
  textStyle(NORMAL);
  text(emp.orgImpact.toFixed(2), cx + 70, cy);

  // Impact bar
  barY = cy + 14;
  fill(230);
  rect(barX, barY, barW, barH, 3);
  fill(INDIGO[0], INDIGO[1], INDIGO[2]);
  rect(barX, barY, barW * emp.orgImpact, barH, 3);
  cy += 30;

  // Divider
  stroke(200);
  strokeWeight(0.5);
  line(cx, cy, cx + pw - 20, cy);
  noStroke();
  cy += 8;

  // Risk factors
  textSize(9);
  textStyle(BOLD);
  fill(INDIGO_DARK[0], INDIGO_DARK[1], INDIGO_DARK[2]);
  text('Risk Factors:', cx, cy);
  cy += 14;
  textStyle(NORMAL);
  fill(80);
  let factorLines = wrapText(emp.factors, pw - 25);
  for (let fl of factorLines) {
    text(fl, cx, cy);
    cy += 13;
  }

  // Close button
  let closeBtnX = px + pw - 18;
  let closeBtnY = py + 6;
  fill(180);
  textSize(14);
  textAlign(CENTER, CENTER);
  text('\u00D7', closeBtnX, closeBtnY + 5);
  textAlign(LEFT, TOP);
}

// ---- Interaction ----

function mousePressed() {
  // Check department buttons
  for (let btn of deptButtons) {
    if (mouseX >= btn.x && mouseX <= btn.x + btn.w &&
        mouseY >= btn.y && mouseY <= btn.y + btn.h) {
      activeDept = btn.label;
      return;
    }
  }

  // Check contagion toggle
  let cb = contagionBtn;
  if (mouseX >= cb.x && mouseX <= cb.x + cb.w &&
      mouseY >= cb.y && mouseY <= cb.y + cb.h) {
    showContagion = !showContagion;
    return;
  }

  // Check pinned panel close button
  if (pinnedEmp) {
    let px = MARGIN.left + plotW + 12;
    let pw = MARGIN.right - 20;
    let closeBtnX = px + pw - 18;
    let closeBtnY = MARGIN.top + 10 + 6;
    if (dist(mouseX, mouseY, closeBtnX, closeBtnY + 5) < 12) {
      pinnedEmp = null;
      return;
    }
  }

  // Check employee dots
  let dotR = 12;
  for (let emp of employees) {
    let pos = dataToScreen(emp.flightRisk, emp.orgImpact);
    let isDimmed = (activeDept !== 'All' && emp.dept !== activeDept);
    if (!isDimmed && dist(mouseX, mouseY, pos.x, pos.y) < dotR / 2 + 4) {
      pinnedEmp = (pinnedEmp && pinnedEmp.id === emp.id) ? null : emp;
      return;
    }
  }

  // Click on empty area clears pinned
  if (mouseX >= MARGIN.left && mouseX <= MARGIN.left + plotW &&
      mouseY >= MARGIN.top && mouseY <= MARGIN.top + plotH) {
    pinnedEmp = null;
  }
}

// ---- Dashed line utility ----

function setLineDash(list) {
  drawingContext.setLineDash(list);
}
