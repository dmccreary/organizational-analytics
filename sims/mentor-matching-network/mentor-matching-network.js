// Mentor-Mentee Matching Network MicroSim
// Bipartite graph visualization of mentor-mentee pairing with skill nodes
// Built-in p5.js controls
// MicroSim template version 2026.02

let canvasWidth = 400;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let sliderLeftMargin = 240;
let defaultTextSize = 16;

// Aria color scheme
const INDIGO = [48, 63, 159];
const INDIGO_DARK = [26, 35, 126];
const INDIGO_LIGHT = [92, 107, 192];
const AMBER = [212, 136, 15];
const AMBER_DARK = [176, 109, 11];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// Data
let mentee = null;
let mentors = [];
let skills = [];
let hasSkillEdges = [];
let pairingScores = [];

// Interaction state
let hoveredMentor = null;
let hoveredSkill = null;
let selectedSkill = null;
let bestMatchIdx = 0;

// Controls
let showGrowthCheckbox;
let crossDeptSlider;

// Layout positions (computed in layoutNodes)
let menteePos = {};
let mentorPositions = [];
let skillPositions = [];

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
  canvasHeight = drawHeight + controlHeight;
}

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));
  textFont('Arial');

  buildData();
  layoutNodes();
  recalcScores();

  // Controls
  showGrowthCheckbox = createCheckbox('Show Growth Skills', false);
  showGrowthCheckbox.position(10, drawHeight + 12);
  showGrowthCheckbox.style('font-size', '13px');
  showGrowthCheckbox.style('accent-color', '#303F9F');
  showGrowthCheckbox.changed(function() { /* triggers redraw */ });

  crossDeptSlider = createSlider(0, 100, 40, 1);
  crossDeptSlider.position(sliderLeftMargin, drawHeight + 15);
  crossDeptSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('Interactive bipartite graph showing mentor-mentee skill matching with pairing scores and cross-department weighting.', LABEL);
}

// ---- Data ----

function buildData() {
  mentee = {
    name: 'Priya Sharma',
    title: 'Junior Data Analyst',
    dept: 'Marketing Analytics',
    skills: ['SQL', 'Python', 'Segmentation', 'Excel', 'Statistics']
  };

  mentors = [
    {
      name: 'Marcus Chen',
      title: 'Senior Analyst',
      dept: 'Product Analytics',
      skills: ['SQL', 'Python', 'Segmentation', 'ML', 'A/B Testing', 'Data Viz'],
      similarity: 0.71,
      sharedProjects: 2,
      sameDept: false
    },
    {
      name: 'Elena Rodriguez',
      title: 'Senior Data Scientist',
      dept: 'Data Science',
      skills: ['Python', 'Statistics', 'Deep Learning', 'NLP', 'R'],
      similarity: 0.58,
      sharedProjects: 1,
      sameDept: false
    },
    {
      name: 'James Okafor',
      title: 'Analytics Manager',
      dept: 'Marketing Analytics',
      skills: ['SQL', 'Segmentation', 'Excel', 'Cloud', 'Pipeline Design', 'Tableau'],
      similarity: 0.65,
      sharedProjects: 3,
      sameDept: true
    },
    {
      name: 'Fatima Al-Rashid',
      title: 'BI Engineering Lead',
      dept: 'BI Engineering',
      skills: ['SQL', 'Python', 'Spark', 'Airflow', 'dbt', 'Dashboard Design'],
      similarity: 0.44,
      sharedProjects: 0,
      sameDept: false
    },
    {
      name: 'Wei Zhang',
      title: 'Senior Analytics Eng.',
      dept: 'Analytics Engineering',
      skills: ['Python', 'SQL', 'Statistics', 'dbt', 'Git', 'Testing'],
      similarity: 0.55,
      sharedProjects: 1,
      sameDept: false
    }
  ];

  // Collect all unique skills
  let skillSet = new Set();
  for (let s of mentee.skills) skillSet.add(s);
  for (let m of mentors) {
    for (let s of m.skills) skillSet.add(s);
  }

  let allSkills = Array.from(skillSet);
  skills = allSkills.map(s => {
    let menteeHas = mentee.skills.includes(s);
    let mentorOwners = [];
    for (let i = 0; i < mentors.length; i++) {
      if (mentors[i].skills.includes(s)) mentorOwners.push(i);
    }
    let isShared = menteeHas && mentorOwners.length > 0;
    let isGrowth = !menteeHas && mentorOwners.length > 0;
    let isMenteeOnly = menteeHas && mentorOwners.length === 0;
    return {
      name: s,
      menteeHas: menteeHas,
      mentorOwners: mentorOwners,
      isShared: isShared,
      isGrowth: isGrowth,
      isMenteeOnly: isMenteeOnly
    };
  });

  // Sort skills: shared first, then mentee-only, then growth
  skills.sort((a, b) => {
    if (a.isShared && !b.isShared) return -1;
    if (!a.isShared && b.isShared) return 1;
    if (a.menteeHas && !b.menteeHas) return -1;
    if (!a.menteeHas && b.menteeHas) return 1;
    return 0;
  });

  // Build HAS_SKILL edges
  hasSkillEdges = [];
  for (let si = 0; si < skills.length; si++) {
    let sk = skills[si];
    if (sk.menteeHas) {
      hasSkillEdges.push({ from: 'mentee', toSkill: si });
    }
    for (let mi of sk.mentorOwners) {
      hasSkillEdges.push({ from: 'mentor_' + mi, toSkill: si });
    }
  }
}

function layoutNodes() {
  let leftX = canvasWidth * 0.10;
  let midX = canvasWidth * 0.48;
  let rightX = canvasWidth * 0.88;
  let topY = 55;
  let bottomY = drawHeight - 20;
  let vertRange = bottomY - topY;

  // Mentee position (center-left, vertically centered)
  menteePos = { x: leftX, y: topY + vertRange * 0.5 };

  // Mentor positions (right column, evenly spaced)
  mentorPositions = [];
  for (let i = 0; i < mentors.length; i++) {
    let t = (i + 0.5) / mentors.length;
    mentorPositions.push({ x: rightX, y: topY + t * vertRange });
  }

  // Skill positions (middle column)
  // Only layout visible skills
  layoutSkillPositions();
}

function layoutSkillPositions() {
  let midX = canvasWidth * 0.48;
  let topY = 55;
  let bottomY = drawHeight - 20;
  let vertRange = bottomY - topY;

  let showGrowth = showGrowthCheckbox ? showGrowthCheckbox.checked() : false;

  // Determine visible skills
  let visibleSkills = [];
  for (let i = 0; i < skills.length; i++) {
    let sk = skills[i];
    if (sk.isGrowth && !showGrowth) continue;
    visibleSkills.push(i);
  }

  skillPositions = [];
  for (let i = 0; i < skills.length; i++) {
    skillPositions.push(null);
  }

  for (let vi = 0; vi < visibleSkills.length; vi++) {
    let si = visibleSkills[vi];
    let t = (vi + 0.5) / visibleSkills.length;
    skillPositions[si] = { x: midX, y: topY + t * vertRange };
  }
}

// ---- Score calculation ----

function recalcScores() {
  let crossWeight = crossDeptSlider ? crossDeptSlider.value() / 100.0 : 0.4;
  let simWeight = 1.0 - crossWeight;

  pairingScores = [];
  let maxScore = 0;
  bestMatchIdx = 0;

  for (let i = 0; i < mentors.length; i++) {
    let m = mentors[i];
    let simScore = m.similarity;
    let crossBonus = m.sameDept ? 0.0 : 0.3;
    let projectBonus = min(m.sharedProjects * 0.08, 0.24);
    let total = simScore * simWeight + (crossBonus + projectBonus) * crossWeight;
    total = min(total, 1.0);

    pairingScores.push({
      mentorIdx: i,
      similarity: simScore,
      crossBonus: crossBonus,
      projectBonus: projectBonus,
      total: total
    });

    if (total > maxScore) {
      maxScore = total;
      bestMatchIdx = i;
    }
  }
}

// ---- Drawing ----

function draw() {
  // Recalculate layout and scores each frame for responsiveness
  layoutSkillPositions();
  recalcScores();

  let showGrowth = showGrowthCheckbox ? showGrowthCheckbox.checked() : false;

  // Background
  fill(245);
  noStroke();
  rect(0, 0, canvasWidth, drawHeight);

  // Control area background
  fill(255);
  stroke(200);
  strokeWeight(1);
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  noStroke();
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  textSize(min(17, canvasWidth * 0.025 + 8));
  textStyle(BOLD);
  text('Mentor-Mentee Matching Network', canvasWidth / 2, 6);
  textStyle(NORMAL);

  // Column labels
  textSize(11);
  fill(120);
  textAlign(CENTER, TOP);
  text('Mentee', canvasWidth * 0.10, 30);
  text('Skills', canvasWidth * 0.48, 30);
  text('Mentor Candidates', canvasWidth * 0.88, 30);

  // Slider label
  noStroke();
  fill(60);
  textSize(12);
  textAlign(LEFT, CENTER);
  let crossVal = crossDeptSlider ? crossDeptSlider.value() : 40;
  text('Cross-Dept Weight: ' + crossVal + '%', 155, drawHeight + 25);

  // Detect hover states
  detectHover();

  // Draw edges first (behind nodes)
  drawHasSkillEdges(showGrowth);
  drawPairingEdges();

  // Draw skill nodes
  drawSkillNodes(showGrowth);

  // Draw mentee node
  drawMenteeNode();

  // Draw mentor nodes
  drawMentorNodes();

  // Draw tooltip
  drawTooltip();

  // Draw instruction
  noStroke();
  fill(150);
  textSize(10);
  textAlign(CENTER, BOTTOM);
  text('Hover mentor to see score | Click a skill to highlight connections', canvasWidth / 2, drawHeight - 3);
}

function detectHover() {
  hoveredMentor = null;
  hoveredSkill = null;

  // Check mentors
  for (let i = 0; i < mentors.length; i++) {
    let pos = mentorPositions[i];
    if (dist(mouseX, mouseY, pos.x, pos.y) < 22) {
      hoveredMentor = i;
      return;
    }
  }

  // Check skills
  for (let i = 0; i < skills.length; i++) {
    let pos = skillPositions[i];
    if (!pos) continue;
    if (dist(mouseX, mouseY, pos.x, pos.y) < 12) {
      hoveredSkill = i;
      return;
    }
  }
}

function drawHasSkillEdges(showGrowth) {
  for (let edge of hasSkillEdges) {
    let skillPos = skillPositions[edge.toSkill];
    if (!skillPos) continue;

    let sk = skills[edge.toSkill];
    if (sk.isGrowth && !showGrowth) continue;

    let fromPos;
    let isMentorEdge = edge.from.startsWith('mentor_');
    if (edge.from === 'mentee') {
      fromPos = menteePos;
    } else {
      let mi = parseInt(edge.from.split('_')[1]);
      fromPos = mentorPositions[mi];
    }

    // Determine highlight
    let isHighlighted = false;
    let isDimmed = false;

    if (hoveredMentor !== null) {
      if (isMentorEdge) {
        let mi = parseInt(edge.from.split('_')[1]);
        if (mi === hoveredMentor && sk.menteeHas) {
          isHighlighted = true;
        } else if (mi !== hoveredMentor) {
          isDimmed = true;
        }
      } else {
        // Mentee edge - highlight if skill is shared with hovered mentor
        if (sk.isShared && sk.mentorOwners.includes(hoveredMentor)) {
          isHighlighted = true;
        } else {
          isDimmed = true;
        }
      }
    }

    if (selectedSkill !== null) {
      if (edge.toSkill === selectedSkill) {
        isHighlighted = true;
      } else {
        isDimmed = true;
      }
    }

    if (isHighlighted) {
      stroke(GOLD[0], GOLD[1], GOLD[2], 200);
      strokeWeight(2.5);
    } else if (isDimmed) {
      stroke(200, 200, 200, 60);
      strokeWeight(0.5);
    } else {
      stroke(INDIGO_LIGHT[0], INDIGO_LIGHT[1], INDIGO_LIGHT[2], 80);
      strokeWeight(1);
    }

    line(fromPos.x, fromPos.y, skillPos.x, skillPos.y);
  }
}

function drawPairingEdges() {
  for (let i = 0; i < pairingScores.length; i++) {
    let ps = pairingScores[i];
    let mPos = mentorPositions[i];
    let thickness = map(ps.total, 0, 1, 1, 5);

    let isDimmed = false;
    if (hoveredMentor !== null && hoveredMentor !== i) isDimmed = true;
    if (selectedSkill !== null) isDimmed = true;

    if (i === bestMatchIdx && !isDimmed) {
      // Best match: thick solid gold
      stroke(GOLD[0], GOLD[1], GOLD[2]);
      strokeWeight(thickness + 2);
      line(menteePos.x, menteePos.y, mPos.x, mPos.y);
    } else {
      // Dashed amber line
      if (isDimmed) {
        stroke(AMBER[0], AMBER[1], AMBER[2], 30);
      } else {
        stroke(AMBER[0], AMBER[1], AMBER[2], 120);
      }
      strokeWeight(thickness);
      drawingContext.setLineDash([6, 4]);
      line(menteePos.x, menteePos.y, mPos.x, mPos.y);
      drawingContext.setLineDash([]);
    }

    // Score label on the edge
    if (!isDimmed) {
      // Offset toward the mentee side a bit
      let labelX = menteePos.x + (mPos.x - menteePos.x) * 0.22;
      let labelY = menteePos.y + (mPos.y - menteePos.y) * 0.22;

      noStroke();
      fill(255, 255, 255, 200);
      rectMode(CENTER);
      rect(labelX, labelY, 32, 15, 3);
      rectMode(CORNER);

      fill(i === bestMatchIdx ? GOLD : AMBER);
      textSize(9);
      textAlign(CENTER, CENTER);
      textStyle(BOLD);
      text(nf(ps.total, 0, 2), labelX, labelY);
      textStyle(NORMAL);
    }
  }
}

function drawMenteeNode() {
  let pos = menteePos;
  let r = 30;

  let isHighlighted = hoveredMentor !== null || selectedSkill !== null;

  // Glow
  if (isHighlighted) {
    noStroke();
    fill(AMBER[0], AMBER[1], AMBER[2], 40);
    ellipse(pos.x, pos.y, r * 2 + 16);
  }

  // Node
  stroke(AMBER_DARK);
  strokeWeight(2.5);
  fill(AMBER);
  ellipse(pos.x, pos.y, r * 2);

  // Label
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(9);
  textStyle(BOLD);
  text('Priya', pos.x, pos.y - 5);
  textStyle(NORMAL);
  textSize(7);
  text('Sharma', pos.x, pos.y + 6);
}

function drawMentorNodes() {
  for (let i = 0; i < mentors.length; i++) {
    let m = mentors[i];
    let pos = mentorPositions[i];
    let r = 22;

    let isHovered = hoveredMentor === i;
    let isBest = i === bestMatchIdx;
    let isDimmed = (hoveredMentor !== null && hoveredMentor !== i) ||
                   (selectedSkill !== null && !skills[selectedSkill].mentorOwners.includes(i));

    // Glow for hovered or best
    if (isHovered) {
      noStroke();
      fill(GOLD[0], GOLD[1], GOLD[2], 60);
      ellipse(pos.x, pos.y, r * 2 + 16);
    } else if (isBest && !isDimmed) {
      noStroke();
      fill(GOLD[0], GOLD[1], GOLD[2], 30);
      ellipse(pos.x, pos.y, r * 2 + 12);
    }

    // Best match ring
    if (isBest && !isDimmed) {
      noFill();
      stroke(GOLD);
      strokeWeight(3);
      ellipse(pos.x, pos.y, r * 2 + 6);
    }

    // Node
    if (isDimmed) {
      stroke(180);
      strokeWeight(1.5);
      fill(190, 190, 200, 150);
    } else {
      stroke(INDIGO_DARK);
      strokeWeight(2);
      fill(INDIGO);
    }
    ellipse(pos.x, pos.y, r * 2);

    // Name label
    noStroke();
    fill(isDimmed ? [180, 180, 180] : 255);
    textAlign(CENTER, CENTER);
    textSize(8);
    textStyle(BOLD);
    // Split name for two lines
    let parts = m.name.split(' ');
    text(parts[0], pos.x, pos.y - 4);
    textStyle(NORMAL);
    textSize(7);
    text(parts[1], pos.x, pos.y + 6);

    // Dept label below node
    if (!isDimmed) {
      fill(100);
      textSize(7);
      textAlign(CENTER, TOP);
      text(m.dept, pos.x, pos.y + r + 3);
    }
  }
}

function drawSkillNodes(showGrowth) {
  let diamondR = 10;

  for (let i = 0; i < skills.length; i++) {
    let sk = skills[i];
    let pos = skillPositions[i];
    if (!pos) continue;
    if (sk.isGrowth && !showGrowth) continue;

    let isHovered = hoveredSkill === i;
    let isSelected = selectedSkill === i;

    // Determine highlight state
    let isDimmed = false;
    let isHighlighted = false;

    if (hoveredMentor !== null) {
      if (sk.isShared && sk.mentorOwners.includes(hoveredMentor)) {
        isHighlighted = true;
      } else if (sk.isGrowth && sk.mentorOwners.includes(hoveredMentor)) {
        isHighlighted = true;
      } else {
        isDimmed = true;
      }
    }

    if (selectedSkill !== null) {
      if (i === selectedSkill) {
        isHighlighted = true;
      } else {
        isDimmed = true;
      }
    }

    // Diamond shape (rotated square)
    push();
    translate(pos.x, pos.y);
    rotate(PI / 4);

    if (isHovered || isSelected) {
      noFill();
      stroke(GOLD);
      strokeWeight(3);
      rect(-diamondR - 3, -diamondR - 3, (diamondR + 3) * 2, (diamondR + 3) * 2);
    }

    if (isDimmed) {
      fill(220, 220, 220, 120);
      stroke(180, 180, 180, 100);
      strokeWeight(1);
    } else if (sk.isShared) {
      fill(GOLD);
      stroke(AMBER_DARK);
      strokeWeight(1.5);
    } else if (sk.isMenteeOnly) {
      fill(AMBER[0], AMBER[1], AMBER[2], 150);
      stroke(AMBER_DARK[0], AMBER_DARK[1], AMBER_DARK[2], 150);
      strokeWeight(1);
    } else if (sk.isGrowth) {
      fill(200, 200, 200);
      stroke(160);
      strokeWeight(1);
    } else {
      fill(200);
      stroke(160);
      strokeWeight(1);
    }

    rect(-diamondR, -diamondR, diamondR * 2, diamondR * 2);
    pop();

    // Label
    noStroke();
    if (isDimmed) {
      fill(180);
    } else if (isHighlighted) {
      fill(40);
    } else {
      fill(80);
    }
    textAlign(CENTER, CENTER);
    textSize(8);
    textStyle(NORMAL);
    text(sk.name, pos.x, pos.y + diamondR + 10);
  }
}

function drawTooltip() {
  if (hoveredMentor === null) return;

  let mi = hoveredMentor;
  let m = mentors[mi];
  let ps = pairingScores[mi];
  let pos = mentorPositions[mi];

  let tw = 195;
  let th = 120;
  let tx = pos.x - tw - 30;
  let ty = pos.y - th / 2;

  // Keep on screen
  if (tx < 5) tx = pos.x + 30;
  if (ty < 50) ty = 50;
  if (ty + th > drawHeight - 5) ty = drawHeight - th - 5;

  // Shadow
  noStroke();
  fill(0, 0, 0, 20);
  rect(tx + 3, ty + 3, tw, th, 8);

  // Background
  fill(255, 252, 240);
  stroke(INDIGO[0], INDIGO[1], INDIGO[2], 150);
  strokeWeight(1);
  rect(tx, ty, tw, th, 8);

  let cx = tx + 10;
  let cy = ty + 10;

  // Name
  noStroke();
  fill(INDIGO_DARK);
  textAlign(LEFT, TOP);
  textSize(12);
  textStyle(BOLD);
  text(m.name, cx, cy);
  textStyle(NORMAL);
  cy += 16;

  // Title & dept
  fill(100);
  textSize(10);
  text(m.title + ' | ' + m.dept, cx, cy);
  cy += 16;

  // Divider
  stroke(220);
  strokeWeight(0.5);
  line(cx, cy, cx + tw - 20, cy);
  noStroke();
  cy += 6;

  // Score breakdown
  fill(80);
  textSize(10);
  text('Skill Similarity:', cx, cy);
  fill(INDIGO);
  textAlign(RIGHT, TOP);
  text(nf(ps.similarity, 0, 2), tx + tw - 10, cy);
  cy += 14;

  textAlign(LEFT, TOP);
  fill(80);
  text('Cross-Dept Bonus:', cx, cy);
  fill(ps.crossBonus > 0 ? [56, 142, 60] : [180, 180, 180]);
  textAlign(RIGHT, TOP);
  text(ps.crossBonus > 0 ? '+' + nf(ps.crossBonus, 0, 2) : 'same dept', tx + tw - 10, cy);
  cy += 14;

  textAlign(LEFT, TOP);
  fill(80);
  text('Project Bonus:', cx, cy);
  fill(ps.projectBonus > 0 ? [56, 142, 60] : [180, 180, 180]);
  textAlign(RIGHT, TOP);
  text('+' + nf(ps.projectBonus, 0, 2) + ' (' + m.sharedProjects + ' projects)', tx + tw - 10, cy);
  cy += 16;

  // Total
  stroke(220);
  strokeWeight(0.5);
  line(cx, cy - 3, cx + tw - 20, cy - 3);
  noStroke();
  textAlign(LEFT, TOP);
  fill(INDIGO_DARK);
  textSize(11);
  textStyle(BOLD);
  text('Pairing Score:', cx, cy);
  let isBest = mi === bestMatchIdx;
  fill(isBest ? GOLD : AMBER);
  textAlign(RIGHT, TOP);
  text(nf(ps.total, 0, 2) + (isBest ? ' (Best)' : ''), tx + tw - 10, cy);
  textStyle(NORMAL);
}

// ---- Interaction ----

function mousePressed() {
  // Check skill nodes for click
  for (let i = 0; i < skills.length; i++) {
    let pos = skillPositions[i];
    if (!pos) continue;
    if (dist(mouseX, mouseY, pos.x, pos.y) < 14) {
      if (selectedSkill === i) {
        selectedSkill = null;
      } else {
        selectedSkill = i;
      }
      return;
    }
  }

  // Click on empty space clears selection
  if (mouseY < drawHeight) {
    selectedSkill = null;
  }
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  layoutNodes();
  crossDeptSlider.size(canvasWidth - sliderLeftMargin - margin);
}
