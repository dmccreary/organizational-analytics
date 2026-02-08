// Skill Gap Heatmap - p5.js MicroSim
// Interactive heatmap showing skill coverage across teams,
// with cells colored by gap severity and org-wide summary bar.

let canvasWidth = 400;
let drawHeight = 490;
let controlHeight = 0;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let sliderLeftMargin = 140;
let defaultTextSize = 16;

// Aria color palette
const INDIGO = [48, 63, 159];       // #303F9F
const INDIGO_DARK = [26, 35, 126];  // #1A237E
const INDIGO_LIGHT = [92, 107, 192]; // #5C6BC0
const AMBER = [212, 136, 15];       // #D4880F
const AMBER_DARK = [176, 109, 11];  // #B06D0B
const GOLD = [255, 215, 0];         // #FFD700
const CHAMPAGNE = [255, 248, 231];  // #FFF8E7

// Gap severity colors
const GREEN = [76, 175, 80];   // #4CAF50 -- 80-100%
const GAP_AMBER = [212, 136, 15]; // #D4880F -- 40-79%
const RED = [229, 57, 53];     // #E53935 -- 0-39%

// Data: 6 teams x 10 skills
const teamNames = [
  'Cloud Migration', 'Data Platform', 'Customer Success',
  'Product Eng', 'Marketing Analytics', 'Security'
];
const skillNames = [
  'Kubernetes', 'SQL', 'Python', 'Spark', 'GraphQL',
  'AWS', 'Docker', 'ML', 'Tableau', 'Git'
];
const teamSizes = [8, 6, 12, 10, 8, 6];

// Coverage matrix (percentages)
const coverageData = [
  [12, 75, 62, 25, 10, 38, 50, 15, 20, 88],  // Cloud Migration
  [30, 90, 85, 17, 25, 60, 70, 45, 30, 95],  // Data Platform
  [5,  25, 15,  5,  8, 10,  5,  3, 60, 40],  // Customer Success
  [45, 80, 90, 20, 30, 55, 65, 50, 25, 92],  // Product Eng
  [8,  70, 65, 10,  5, 20, 15, 35, 85, 75],  // Marketing Analytics
  [55, 60, 50, 15, 12, 80, 75, 20, 10, 70]   // Security
];

// State
let sortedTeamIndices = [0, 1, 2, 3, 4, 5];
let sortSkillIndex = -1;  // -1 means no sort
let highlightedTeam = -1;
let showCriticalOnly = false;

// Layout (computed in computeLayout)
let leftMargin = 150;
let topMargin = 100;
let summaryBarHeight = 60;
let gridRight = 0;
let gridBottom = 0;
let cellW = 0;
let cellH = 0;

// Tooltip state
let tooltip = { show: false, x: 0, y: 0, lines: [] };

// Controls
let criticalCheckbox;
let resetButton;

// ---- Responsive sizing ----

function updateCanvasSize() {
  let container = document.querySelector('main');
  if (container) {
    canvasWidth = container.getBoundingClientRect().width;
  }
  if (canvasWidth < 500) canvasWidth = 500;
}

function setup() {
  updateCanvasSize();
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));
  textFont('Arial');

  // Create controls
  criticalCheckbox = createCheckbox(' Show Critical Only', false);
  criticalCheckbox.parent(document.querySelector('main'));
  criticalCheckbox.style('font-size', '13px');
  criticalCheckbox.style('font-family', 'Arial, sans-serif');
  criticalCheckbox.style('color', '#333');
  criticalCheckbox.style('display', 'inline-block');
  criticalCheckbox.style('margin-right', '20px');
  criticalCheckbox.changed(onCriticalToggle);

  resetButton = createButton('Reset Sort');
  resetButton.parent(document.querySelector('main'));
  resetButton.style('font-size', '13px');
  resetButton.style('font-family', 'Arial, sans-serif');
  resetButton.style('padding', '4px 14px');
  resetButton.style('background-color', '#303F9F');
  resetButton.style('color', '#fff');
  resetButton.style('border', 'none');
  resetButton.style('border-radius', '4px');
  resetButton.style('cursor', 'pointer');
  resetButton.mousePressed(onResetSort);

  positionControls();
  computeLayout();
}

function positionControls() {
  // Controls are DOM elements flowing naturally below the canvas
  criticalCheckbox.style('margin-left', '10px');
  criticalCheckbox.style('margin-top', '6px');
  resetButton.style('margin-left', '10px');
  resetButton.style('margin-top', '6px');
}

function onCriticalToggle() {
  showCriticalOnly = criticalCheckbox.checked();
}

function onResetSort() {
  sortedTeamIndices = [0, 1, 2, 3, 4, 5];
  sortSkillIndex = -1;
  highlightedTeam = -1;
}

function computeLayout() {
  leftMargin = Math.min(150, canvasWidth * 0.2);
  topMargin = 100;
  summaryBarHeight = 60;

  let availableW = canvasWidth - leftMargin - margin;
  let availableH = drawHeight - topMargin - summaryBarHeight - 20;

  cellW = availableW / skillNames.length;
  cellH = availableH / teamNames.length;
  // Cap cell height for readability
  if (cellH > 45) cellH = 45;

  gridRight = leftMargin + cellW * skillNames.length;
  gridBottom = topMargin + cellH * teamNames.length;
}

// ---- Color helpers ----

function getCoverageColor(pct) {
  if (pct >= 80) return GREEN;
  if (pct >= 40) return GAP_AMBER;
  return RED;
}

// ---- Org-wide averages ----

function getOrgAverage(skillIdx) {
  let totalWithSkill = 0;
  let totalMembers = 0;
  for (let t = 0; t < teamNames.length; t++) {
    let pct = coverageData[t][skillIdx];
    let members = teamSizes[t];
    totalWithSkill += Math.round(pct / 100 * members);
    totalMembers += members;
  }
  return totalMembers > 0 ? (totalWithSkill / totalMembers) * 100 : 0;
}

// ---- Drawing ----

function draw() {
  // Background
  noStroke();
  fill(245, 247, 250);
  rect(0, 0, canvasWidth, canvasHeight);

  // Title
  noStroke();
  fill(...INDIGO_DARK);
  textAlign(CENTER, TOP);
  textSize(17);
  textStyle(BOLD);
  text('Skill Gap Heatmap', canvasWidth / 2, 8);
  textStyle(NORMAL);
  textSize(10);
  fill(100);
  text('Click a skill column to sort | Click a team row to highlight | Hover cells for detail', canvasWidth / 2, 28);

  // Reset tooltip
  tooltip.show = false;

  drawColumnHeaders();
  drawRowHeaders();
  drawHeatmapCells();
  drawSummaryBar();
  drawTooltip();
}

function drawColumnHeaders() {
  push();
  textSize(11);
  textStyle(BOLD);
  fill(...INDIGO_DARK);
  textAlign(LEFT, CENTER);

  for (let s = 0; s < skillNames.length; s++) {
    let cx = leftMargin + s * cellW + cellW / 2;
    let cy = topMargin - 8;

    // Highlight sorted column header
    if (sortSkillIndex === s) {
      noStroke();
      fill(...GOLD);
      let bx = leftMargin + s * cellW;
      rect(bx, topMargin - 40, cellW, 36, 3);
    }

    push();
    translate(cx, cy);
    rotate(-PI / 4);
    noStroke();
    fill(sortSkillIndex === s ? [...INDIGO_DARK] : [...INDIGO]);
    textAlign(LEFT, CENTER);
    textSize(11);
    textStyle(BOLD);
    text(skillNames[s], 0, 0);
    pop();
  }
  pop();
}

function drawRowHeaders() {
  textSize(11);
  textStyle(BOLD);
  textAlign(RIGHT, CENTER);

  for (let r = 0; r < sortedTeamIndices.length; r++) {
    let teamIdx = sortedTeamIndices[r];
    let ry = topMargin + r * cellH + cellH / 2;

    // Highlight background and border for selected team
    if (highlightedTeam === teamIdx) {
      noStroke();
      fill(255, 235, 180, 120);
      rect(0, topMargin + r * cellH, leftMargin + cellW * skillNames.length, cellH);
      // Amber border around entire row
      noFill();
      stroke(AMBER[0], AMBER[1], AMBER[2]);
      strokeWeight(2.5);
      rect(leftMargin - 2, topMargin + r * cellH - 1, cellW * skillNames.length + 4, cellH + 2, 2);
    }

    noStroke();
    fill(highlightedTeam === teamIdx ? [...AMBER_DARK] : [...INDIGO]);
    text(teamNames[teamIdx], leftMargin - 10, ry);
  }
}

function drawHeatmapCells() {
  for (let r = 0; r < sortedTeamIndices.length; r++) {
    let teamIdx = sortedTeamIndices[r];
    let ry = topMargin + r * cellH;

    for (let s = 0; s < skillNames.length; s++) {
      let rx = leftMargin + s * cellW;
      let pct = coverageData[teamIdx][s];

      // If critical-only mode, dim non-critical cells
      let isCritical = pct < 40;
      let dimmed = showCriticalOnly && !isCritical;

      // Cell fill
      let cellColor = getCoverageColor(pct);
      noStroke();
      if (dimmed) {
        fill(230, 230, 230, 180);
      } else {
        fill(cellColor[0], cellColor[1], cellColor[2], 200);
      }
      rect(rx + 1, ry + 1, cellW - 2, cellH - 2, 3);

      // Cell text (percentage)
      if (!dimmed) {
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        textStyle(BOLD);
        text(pct + '%', rx + cellW / 2, ry + cellH / 2);
        textStyle(NORMAL);
      } else {
        fill(180);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        text(pct + '%', rx + cellW / 2, ry + cellH / 2);
      }

      // Hover detection
      if (mouseX >= rx && mouseX < rx + cellW &&
          mouseY >= ry && mouseY < ry + cellH) {
        // Hover highlight
        noFill();
        stroke(255, 255, 255, 200);
        strokeWeight(2);
        rect(rx + 1, ry + 1, cellW - 2, cellH - 2, 3);

        let membersWith = Math.round(pct / 100 * teamSizes[teamIdx]);
        let membersWithout = teamSizes[teamIdx] - membersWith;
        let severity = pct >= 80 ? 'Well-Covered' : (pct >= 40 ? 'Moderate Gap' : 'Critical Gap');

        tooltip.show = true;
        tooltip.x = mouseX;
        tooltip.y = mouseY;
        tooltip.lines = [
          teamNames[teamIdx] + ' -- ' + skillNames[s],
          'Coverage: ' + pct + '%  (' + severity + ')',
          'Members with skill: ' + membersWith + ' / ' + teamSizes[teamIdx],
          'Members without: ' + membersWithout
        ];
      }
    }
  }

  // Grid outline
  noFill();
  stroke(180);
  strokeWeight(1);
  rect(leftMargin, topMargin, cellW * skillNames.length, cellH * teamNames.length);
}

function drawSummaryBar() {
  let barY = gridBottom + 16;
  let barHeight = 20;
  let labelY = barY - 4;

  // Title
  noStroke();
  fill(...INDIGO_DARK);
  textAlign(LEFT, TOP);
  textSize(12);
  textStyle(BOLD);
  text('Org-Wide Coverage by Skill', leftMargin, barY - 2);
  textStyle(NORMAL);

  barY += 16;

  for (let s = 0; s < skillNames.length; s++) {
    let rx = leftMargin + s * cellW;
    let avg = getOrgAverage(s);
    let barColor = getCoverageColor(avg);

    // Bar background
    noStroke();
    fill(220);
    rect(rx + 2, barY, cellW - 4, barHeight, 3);

    // Filled portion
    let fillW = (avg / 100) * (cellW - 4);
    fill(barColor[0], barColor[1], barColor[2]);
    rect(rx + 2, barY, fillW, barHeight, 3);

    // Percentage label
    fill(avg < 50 ? [...RED] : 60);
    textAlign(CENTER, CENTER);
    textSize(9);
    textStyle(BOLD);
    text(Math.round(avg) + '%', rx + cellW / 2, barY + barHeight / 2);
    textStyle(NORMAL);

    // Star indicator for training program candidates (below 50%)
    if (avg < 50) {
      fill(...RED);
      textSize(10);
      textAlign(CENTER, TOP);
      text('\u2605', rx + cellW / 2, barY + barHeight + 2);
    }

    // Hover on summary bar
    if (mouseX >= rx && mouseX < rx + cellW &&
        mouseY >= barY && mouseY < barY + barHeight + 14) {
      tooltip.show = true;
      tooltip.x = mouseX;
      tooltip.y = mouseY;
      let avgRound = Math.round(avg);
      tooltip.lines = [
        skillNames[s] + ' -- Org-Wide Average: ' + avgRound + '%',
        avgRound < 50 ? 'Training Program Candidate' : 'Adequate Coverage'
      ];
    }
  }

  // Legend for training candidate star
  let legX = leftMargin;
  let legY = barY + barHeight + 14;
  fill(...RED);
  textSize(10);
  textAlign(LEFT, CENTER);
  text('\u2605', legX, legY);
  fill(100);
  textSize(9);
  text(' = Training program candidate (< 50% org coverage)', legX + 12, legY);
}

function drawTooltip() {
  if (!tooltip.show) return;

  textSize(11);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);

  // Measure
  let maxW = 0;
  for (let line of tooltip.lines) {
    let tw = textWidth(line);
    if (tw > maxW) maxW = tw;
  }
  let tipW = maxW + 20;
  let tipH = tooltip.lines.length * 17 + 14;

  // Position
  let tx = tooltip.x + 16;
  let ty = tooltip.y - tipH - 8;
  if (tx + tipW > canvasWidth - 5) tx = tooltip.x - tipW - 16;
  if (ty < 5) ty = tooltip.y + 20;
  if (ty + tipH > drawHeight) ty = drawHeight - tipH - 5;

  // Shadow
  fill(0, 0, 0, 35);
  noStroke();
  rect(tx + 2, ty + 2, tipW, tipH, 5);

  // Background
  fill(255, 255, 250);
  stroke(160);
  strokeWeight(1);
  rect(tx, ty, tipW, tipH, 5);

  // Text
  noStroke();
  for (let i = 0; i < tooltip.lines.length; i++) {
    if (i === 0) {
      fill(...INDIGO_DARK);
      textStyle(BOLD);
    } else if (tooltip.lines[i].indexOf('Critical') >= 0) {
      fill(...RED);
      textStyle(BOLD);
    } else if (tooltip.lines[i].indexOf('Training Program') >= 0) {
      fill(...RED);
      textStyle(BOLD);
    } else {
      fill(60);
      textStyle(NORMAL);
    }
    textSize(11);
    text(tooltip.lines[i], tx + 10, ty + 8 + i * 17);
  }
  textStyle(NORMAL);
}

// ---- Interaction ----

function mousePressed() {
  // Only respond to clicks in the draw region
  if (mouseY > drawHeight) return;

  // Check column header clicks (skill names - sort by that skill)
  if (mouseY >= topMargin - 50 && mouseY < topMargin) {
    for (let s = 0; s < skillNames.length; s++) {
      let rx = leftMargin + s * cellW;
      if (mouseX >= rx && mouseX < rx + cellW) {
        sortBySkill(s);
        return;
      }
    }
  }

  // Check row header clicks (team names - highlight row)
  if (mouseX < leftMargin && mouseY >= topMargin && mouseY < gridBottom) {
    let rowIdx = Math.floor((mouseY - topMargin) / cellH);
    if (rowIdx >= 0 && rowIdx < sortedTeamIndices.length) {
      let teamIdx = sortedTeamIndices[rowIdx];
      // Toggle highlight
      highlightedTeam = (highlightedTeam === teamIdx) ? -1 : teamIdx;
      return;
    }
  }

  // Click on a heatmap cell also highlights the row
  if (mouseX >= leftMargin && mouseX < gridRight &&
      mouseY >= topMargin && mouseY < gridBottom) {
    let rowIdx = Math.floor((mouseY - topMargin) / cellH);
    if (rowIdx >= 0 && rowIdx < sortedTeamIndices.length) {
      let teamIdx = sortedTeamIndices[rowIdx];
      highlightedTeam = (highlightedTeam === teamIdx) ? -1 : teamIdx;
    }
  }
}

function sortBySkill(skillIdx) {
  if (sortSkillIndex === skillIdx) {
    // Clicking same column again reverses the sort
    sortedTeamIndices.reverse();
    return;
  }
  sortSkillIndex = skillIdx;
  sortedTeamIndices.sort(function(a, b) {
    return coverageData[b][skillIdx] - coverageData[a][skillIdx];
  });
}

// ---- Responsive resize ----

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  computeLayout();
  positionControls();
}
