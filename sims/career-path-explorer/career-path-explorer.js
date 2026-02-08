// Career Path Explorer MicroSim
// Radial tree visualization of career paths from a current role
// with path thickness by historical frequency and node color by skill readiness.
// Built-in p5.js controls (createSlider, createCheckbox).
// MicroSim template version 2026.02

// Canvas dimensions
let canvasWidth = 400;
let drawHeight = 480;
let controlHeight = 45;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let sliderLeftMargin = 260;
let defaultTextSize = 16;

// Aria color palette
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';
const GREEN = '#4CAF50';
const LIGHT_GRAY = '#CCCCCC';

// Role database: each role has skills and transitions to next-step roles
let roleDB = {
  'Data Analyst': {
    skills: ['SQL', 'Python', 'Excel', 'Statistics', 'Segmentation'],
    nextSteps: [
      { role: 'Senior Analyst', people: 34, avgMonths: 24, requiredSkills: ['SQL', 'Python', 'Statistics', 'Data Viz', 'Mentoring'], readiness: 0.85 },
      { role: 'Data Engineer', people: 15, avgMonths: 30, requiredSkills: ['SQL', 'Python', 'Spark', 'Airflow', 'Docker'], readiness: 0.55 },
      { role: 'Product Manager', people: 9, avgMonths: 36, requiredSkills: ['SQL', 'Communication', 'Strategy', 'Agile', 'UX'], readiness: 0.40 },
      { role: 'Analytics Manager', people: 12, avgMonths: 42, requiredSkills: ['SQL', 'Python', 'Leadership', 'Budgeting', 'Hiring'], readiness: 0.30 },
      { role: 'ML Engineer', people: 6, avgMonths: 28, requiredSkills: ['Python', 'Statistics', 'TensorFlow', 'MLOps', 'Docker'], readiness: 0.45 }
    ]
  },
  'Senior Analyst': {
    skills: ['SQL', 'Python', 'Statistics', 'Data Viz', 'Mentoring'],
    nextSteps: [
      { role: 'Analytics Manager', people: 22, avgMonths: 30, requiredSkills: ['SQL', 'Python', 'Leadership', 'Budgeting', 'Hiring'], readiness: 0.70 },
      { role: 'Staff Analyst', people: 8, avgMonths: 24, requiredSkills: ['SQL', 'Python', 'Statistics', 'Architecture', 'Mentoring'], readiness: 0.85 },
      { role: 'Data Scientist', people: 11, avgMonths: 36, requiredSkills: ['Python', 'Statistics', 'ML Algorithms', 'Experimentation', 'Communication'], readiness: 0.50 }
    ]
  },
  'Data Engineer': {
    skills: ['SQL', 'Python', 'Spark', 'Airflow', 'Docker'],
    nextSteps: [
      { role: 'Sr Data Engineer', people: 18, avgMonths: 24, requiredSkills: ['SQL', 'Python', 'Spark', 'Kubernetes', 'System Design'], readiness: 0.75 },
      { role: 'Platform Lead', people: 5, avgMonths: 36, requiredSkills: ['Python', 'Spark', 'Leadership', 'Architecture', 'Budgeting'], readiness: 0.40 }
    ]
  },
  'Product Manager': {
    skills: ['SQL', 'Communication', 'Strategy', 'Agile', 'UX'],
    nextSteps: [
      { role: 'Senior PM', people: 14, avgMonths: 30, requiredSkills: ['Strategy', 'Communication', 'Data Analysis', 'Leadership', 'Roadmapping'], readiness: 0.60 },
      { role: 'Group PM', people: 4, avgMonths: 42, requiredSkills: ['Strategy', 'Leadership', 'P&L Mgmt', 'Exec Communication', 'Hiring'], readiness: 0.25 }
    ]
  },
  'Analytics Manager': {
    skills: ['SQL', 'Python', 'Leadership', 'Budgeting', 'Hiring'],
    nextSteps: [
      { role: 'Director Analytics', people: 7, avgMonths: 48, requiredSkills: ['Leadership', 'Strategy', 'Exec Communication', 'Budgeting', 'Org Design'], readiness: 0.35 }
    ]
  },
  'ML Engineer': {
    skills: ['Python', 'Statistics', 'TensorFlow', 'MLOps', 'Docker'],
    nextSteps: [
      { role: 'Sr ML Engineer', people: 10, avgMonths: 24, requiredSkills: ['Python', 'TensorFlow', 'MLOps', 'System Design', 'Mentoring'], readiness: 0.65 },
      { role: 'ML Lead', people: 3, avgMonths: 36, requiredSkills: ['Python', 'TensorFlow', 'Leadership', 'Architecture', 'Hiring'], readiness: 0.30 }
    ]
  },
  // Two-step destination roles (leaf nodes with no further transitions)
  'Staff Analyst': { skills: ['SQL', 'Python', 'Statistics', 'Architecture', 'Mentoring'], nextSteps: [] },
  'Data Scientist': { skills: ['Python', 'Statistics', 'ML Algorithms', 'Experimentation', 'Communication'], nextSteps: [] },
  'Sr Data Engineer': { skills: ['SQL', 'Python', 'Spark', 'Kubernetes', 'System Design'], nextSteps: [] },
  'Platform Lead': { skills: ['Python', 'Spark', 'Leadership', 'Architecture', 'Budgeting'], nextSteps: [] },
  'Senior PM': { skills: ['Strategy', 'Communication', 'Data Analysis', 'Leadership', 'Roadmapping'], nextSteps: [] },
  'Group PM': { skills: ['Strategy', 'Leadership', 'P&L Mgmt', 'Exec Communication', 'Hiring'], nextSteps: [] },
  'Director Analytics': { skills: ['Leadership', 'Strategy', 'Exec Communication', 'Budgeting', 'Org Design'], nextSteps: [] },
  'Sr ML Engineer': { skills: ['Python', 'TensorFlow', 'MLOps', 'System Design', 'Mentoring'], nextSteps: [] },
  'ML Lead': { skills: ['Python', 'TensorFlow', 'Leadership', 'Architecture', 'Hiring'], nextSteps: [] }
};

// State
let centerRole = 'Data Analyst';
let nodes = [];    // computed layout nodes
let edges = [];    // computed layout edges
let hoveredNode = null;
let tooltipNode = null;

// DOM controls
let showGapsCheckbox;
let freqSlider;
let freqLabel;

// ---- Responsive sizing ----

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

  // Create controls
  showGapsCheckbox = createCheckbox('Show Skill Gaps', false);
  showGapsCheckbox.position(10, drawHeight + 10);
  showGapsCheckbox.style('font-size', '13px');
  showGapsCheckbox.style('font-family', 'Arial, sans-serif');
  showGapsCheckbox.style('color', INDIGO_DARK);
  showGapsCheckbox.style('user-select', 'none');

  freqLabel = createSpan('Min Frequency: 1');
  freqLabel.position(170, drawHeight + 13);
  freqLabel.style('font-size', '13px');
  freqLabel.style('font-family', 'Arial, sans-serif');
  freqLabel.style('color', INDIGO_DARK);

  freqSlider = createSlider(1, 10, 1, 1);
  freqSlider.position(sliderLeftMargin, drawHeight + 12);
  freqSlider.style('width', (canvasWidth - sliderLeftMargin - margin) + 'px');

  buildGraph();

  describe('Interactive radial career path explorer showing career transitions from a central role. Nodes are colored by skill readiness and edges are weighted by transition frequency.', LABEL);
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  freqSlider.style('width', (canvasWidth - sliderLeftMargin - margin) + 'px');
  buildGraph();
}

// ---- Graph building ----

function buildGraph() {
  nodes = [];
  edges = [];

  let cx = canvasWidth / 2;
  let cy = drawHeight / 2;
  let ring1Radius = Math.min(canvasWidth, drawHeight) * 0.25;
  let ring2Radius = Math.min(canvasWidth, drawHeight) * 0.47;

  // Center node
  let centerData = roleDB[centerRole];
  nodes.push({
    id: centerRole,
    x: cx,
    y: cy,
    r: 22,
    ring: 0,
    readiness: 1.0,
    skills: centerData ? centerData.skills : [],
    requiredSkills: [],
    people: 0,
    avgMonths: 0,
    parentRole: null
  });

  if (!centerData || !centerData.nextSteps) return;

  // Ring 1 nodes
  let ring1Steps = centerData.nextSteps;
  let ring1Count = ring1Steps.length;

  for (let i = 0; i < ring1Count; i++) {
    let step = ring1Steps[i];
    let angle = -HALF_PI + (TWO_PI * i) / ring1Count;
    let nx = cx + ring1Radius * cos(angle);
    let ny = cy + ring1Radius * sin(angle);

    nodes.push({
      id: step.role,
      x: nx,
      y: ny,
      r: 16,
      ring: 1,
      readiness: step.readiness,
      skills: roleDB[step.role] ? roleDB[step.role].skills : step.requiredSkills,
      requiredSkills: step.requiredSkills,
      people: step.people,
      avgMonths: step.avgMonths,
      parentRole: centerRole
    });

    edges.push({
      from: centerRole,
      to: step.role,
      people: step.people,
      avgMonths: step.avgMonths,
      ring: 1
    });

    // Ring 2 nodes (children of this ring 1 node)
    let childData = roleDB[step.role];
    if (childData && childData.nextSteps) {
      let ring2Steps = childData.nextSteps;
      let ring2Count = ring2Steps.length;
      let spreadAngle = (TWO_PI / ring1Count) * 0.6;
      let startAngle = angle - spreadAngle / 2;

      for (let j = 0; j < ring2Count; j++) {
        let childStep = ring2Steps[j];
        // Check if this node already exists (shared destination)
        let existingIdx = nodes.findIndex(n => n.id === childStep.role);
        let childAngle = ring2Count === 1
          ? angle
          : startAngle + (spreadAngle * j) / (ring2Count - 1);
        let childX = cx + ring2Radius * cos(childAngle);
        let childY = cy + ring2Radius * sin(childAngle);

        if (existingIdx === -1) {
          nodes.push({
            id: childStep.role,
            x: childX,
            y: childY,
            r: 12,
            ring: 2,
            readiness: childStep.readiness,
            skills: roleDB[childStep.role] ? roleDB[childStep.role].skills : childStep.requiredSkills,
            requiredSkills: childStep.requiredSkills,
            people: childStep.people,
            avgMonths: childStep.avgMonths,
            parentRole: step.role
          });
        }

        edges.push({
          from: step.role,
          to: childStep.role,
          people: childStep.people,
          avgMonths: childStep.avgMonths,
          ring: 2
        });
      }
    }
  }
}

// ---- Utility: readiness color ----

function readinessColor(r, isCenter) {
  if (isCenter) return color(AMBER);
  if (r > 0.8) return color(GREEN);
  if (r >= 0.5) return color(AMBER);
  return color(LIGHT_GRAY);
}

function readinessLabel(r) {
  if (r > 0.8) return 'Ready';
  if (r >= 0.5) return 'Developing';
  return 'Stretch';
}

// ---- Utility: find node by id ----

function findNode(id) {
  return nodes.find(n => n.id === id);
}

// ---- Utility: get missing skills ----

function getMissingSkills(node) {
  let centerData = roleDB[centerRole];
  let currentSkills = centerData ? centerData.skills : [];
  let missing = [];
  for (let s of node.requiredSkills) {
    if (!currentSkills.includes(s)) {
      missing.push(s);
    }
  }
  return missing;
}

// ---- Drawing ----

function draw() {
  let minFreq = freqSlider.value();
  freqLabel.html('Min Frequency: ' + minFreq);

  // Draw area background
  fill('#F5F5F5');
  noStroke();
  rect(0, 0, canvasWidth, drawHeight);

  // Control area background
  fill('white');
  stroke('#DDD');
  strokeWeight(1);
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  noStroke();
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  textSize(17);
  textStyle(BOLD);
  text('Career Path Explorer', canvasWidth / 2, 8);
  textStyle(NORMAL);
  textSize(11);
  fill('#666');
  text('Click a role to recenter  |  Hover for details', canvasWidth / 2, 28);

  // Draw edges
  hoveredNode = null;
  drawEdges(minFreq);

  // Draw nodes
  drawNodes(minFreq);

  // Draw skill gaps overlay
  if (showGapsCheckbox.checked()) {
    drawSkillGaps(minFreq);
  }

  // Draw tooltip
  drawTooltip();

  // Draw legend
  drawLegend();
}

function drawEdges(minFreq) {
  for (let e of edges) {
    if (e.people < minFreq) continue;

    let fromNode = findNode(e.from);
    let toNode = findNode(e.to);
    if (!fromNode || !toNode) continue;

    let thickness = map(e.people, 1, 34, 1.5, 7);
    let edgeColor = e.ring === 1 ? color(INDIGO) : color(INDIGO_LIGHT);
    edgeColor.setAlpha(160);

    stroke(edgeColor);
    strokeWeight(thickness);

    if (e.people < 3) {
      drawingContext.setLineDash([6, 4]);
    } else {
      drawingContext.setLineDash([]);
    }

    line(fromNode.x, fromNode.y, toNode.x, toNode.y);
    drawingContext.setLineDash([]);

    // Edge label
    let midX = (fromNode.x + toNode.x) / 2;
    let midY = (fromNode.y + toNode.y) / 2;
    noStroke();
    fill(60);
    textAlign(CENTER, CENTER);
    textSize(9);
    let labelText = e.people + ' people';
    let labelText2 = e.avgMonths + ' mo';
    text(labelText, midX, midY - 6);
    text(labelText2, midX, midY + 5);
  }
}

function drawNodes(minFreq) {
  for (let n of nodes) {
    // Skip filtered nodes (ring > 0)
    if (n.ring > 0 && n.people < minFreq) continue;

    let isCenter = (n.ring === 0);
    let nodeColor = readinessColor(n.readiness, isCenter);

    // Check hover
    let d = dist(mouseX, mouseY, n.x, n.y);
    let isHovered = d < n.r + 4;
    if (isHovered && mouseY < drawHeight) {
      hoveredNode = n;
    }

    // Draw node shadow
    noStroke();
    fill(0, 0, 0, 25);
    ellipse(n.x + 2, n.y + 2, n.r * 2 + 4);

    // Draw node
    if (isHovered) {
      stroke(GOLD);
      strokeWeight(3);
    } else if (isCenter) {
      stroke(AMBER_DARK);
      strokeWeight(2);
    } else {
      stroke(80);
      strokeWeight(1);
    }
    fill(nodeColor);
    ellipse(n.x, n.y, n.r * 2);

    // Draw label
    noStroke();
    fill(isCenter || n.readiness > 0.8 ? 255 : (n.readiness >= 0.5 ? 255 : 60));
    textAlign(CENTER, CENTER);
    textSize(isCenter ? 11 : (n.ring === 1 ? 10 : 8));
    textStyle(BOLD);

    // Word-wrap role names
    let words = n.id.split(' ');
    if (words.length <= 2 && textWidth(n.id) < n.r * 2.5) {
      text(n.id, n.x, n.y);
    } else {
      // Place label outside node for small nodes
      fill(50);
      let labelY = n.y + n.r + 10;
      if (labelY > drawHeight - 20) labelY = n.y - n.r - 10;
      text(n.id, n.x, labelY);
    }
    textStyle(NORMAL);
  }
}

function drawSkillGaps(minFreq) {
  for (let n of nodes) {
    if (n.ring === 0) continue;
    if (n.ring > 0 && n.people < minFreq) continue;
    if (n.readiness > 0.8) continue; // Only show for developing/stretch

    let missing = getMissingSkills(n);
    if (missing.length === 0) continue;

    let gapX = n.x;
    let gapY = n.y + n.r + 22;
    if (gapY > drawHeight - 40) gapY = n.y - n.r - 12 - missing.length * 12;

    textSize(8);
    textAlign(CENTER, TOP);
    noStroke();
    fill(200, 50, 50, 200);
    textStyle(BOLD);
    text('Missing:', gapX, gapY);
    textStyle(NORMAL);
    fill(180, 40, 40, 180);
    for (let i = 0; i < Math.min(missing.length, 3); i++) {
      text(missing[i], gapX, gapY + 11 + i * 11);
    }
    if (missing.length > 3) {
      text('+' + (missing.length - 3) + ' more', gapX, gapY + 11 + 3 * 11);
    }
  }
}

function drawTooltip() {
  if (!hoveredNode) return;

  let n = hoveredNode;
  let isCenter = (n.ring === 0);

  // Build tooltip content lines
  let lines = [];
  lines.push(n.id);
  if (isCenter) {
    lines.push('Current Role');
    lines.push('Skills: ' + n.skills.join(', '));
  } else {
    lines.push('Readiness: ' + Math.round(n.readiness * 100) + '% (' + readinessLabel(n.readiness) + ')');
    lines.push('Transitions: ' + n.people + ' people, avg ' + n.avgMonths + ' months');
    if (n.requiredSkills && n.requiredSkills.length > 0) {
      lines.push('Required: ' + n.requiredSkills.join(', '));
    }
    let missing = getMissingSkills(n);
    if (missing.length > 0) {
      lines.push('Gaps: ' + missing.join(', '));
    }
  }

  // Measure tooltip size
  textSize(11);
  textStyle(NORMAL);
  let maxW = 0;
  for (let l of lines) {
    maxW = Math.max(maxW, textWidth(l));
  }
  let tw = Math.min(maxW + 20, canvasWidth - 20);
  let th = lines.length * 16 + 14;

  // Position near mouse
  let tx = mouseX + 14;
  let ty = mouseY - th - 8;
  if (tx + tw > canvasWidth - 5) tx = mouseX - tw - 14;
  if (ty < 5) ty = mouseY + 18;
  if (tx < 5) tx = 5;

  // Background
  fill(255, 255, 255, 245);
  stroke(INDIGO);
  strokeWeight(1.5);
  rect(tx, ty, tw, th, 6);

  // Text
  noStroke();
  textAlign(LEFT, TOP);
  for (let i = 0; i < lines.length; i++) {
    if (i === 0) {
      fill(INDIGO_DARK);
      textStyle(BOLD);
      textSize(12);
    } else if (i === 1) {
      fill(isCenter ? AMBER : '#555');
      textStyle(NORMAL);
      textSize(11);
    } else {
      fill(60);
      textStyle(NORMAL);
      textSize(11);
    }
    // Wrap long lines
    let lineText = lines[i];
    if (textWidth(lineText) > tw - 16) {
      lineText = lineText.substring(0, Math.floor(lineText.length * (tw - 20) / textWidth(lineText))) + '...';
    }
    text(lineText, tx + 8, ty + 7 + i * 16);
  }
  textStyle(NORMAL);
}

function drawLegend() {
  let lx = 10;
  let ly = drawHeight - 52;
  let dotR = 8;
  let spacing = 18;

  // Legend background
  fill(255, 255, 255, 220);
  stroke('#DDD');
  strokeWeight(1);
  rect(lx, ly, 180, 48, 6);

  noStroke();
  textAlign(LEFT, CENTER);
  textSize(10);

  // Ready
  fill(GREEN);
  ellipse(lx + 12, ly + 12, dotR * 2);
  fill(50);
  text('Ready (>80%)', lx + 24, ly + 12);

  // Developing
  fill(AMBER);
  ellipse(lx + 12, ly + 28, dotR * 2);
  fill(50);
  text('Developing (50-80%)', lx + 24, ly + 28);

  // Stretch
  fill(LIGHT_GRAY);
  ellipse(lx + 12, ly + 44, dotR * 2);
  fill(50);
  text('Stretch (<50%)', lx + 24, ly + 44);
}

// ---- Interaction ----

function mousePressed() {
  if (mouseY > drawHeight) return; // ignore clicks in control area

  for (let n of nodes) {
    let d = dist(mouseX, mouseY, n.x, n.y);
    if (d < n.r + 4) {
      // Only recenter if the role has next steps defined
      if (roleDB[n.id] && roleDB[n.id].nextSteps && roleDB[n.id].nextSteps.length > 0) {
        centerRole = n.id;
        buildGraph();
      }
      return;
    }
  }
}
