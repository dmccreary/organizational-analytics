// Strategy Alignment Graph Model - p5.js MicroSim
// Three-layer graph: Strategic Objectives -> Projects -> Tasks
// Shows alignment strength and identifies gaps

// ================================
// CANVAS & LAYOUT
// ================================
let canvasWidth = 900;
const drawHeight = 500;
const controlHeight = 40;
const canvasHeight = drawHeight + controlHeight;

// Aria color palette
const INDIGO = [48, 63, 159];
const INDIGO_DARK = [26, 35, 126];
const INDIGO_LIGHT = [92, 107, 192];
const AMBER = [212, 136, 15];
const AMBER_DARK = [176, 109, 11];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// Layer Y positions (computed in setup based on drawHeight)
let layerY = {};
const LAYER_PADDING_TOP = 70;
const LAYER_SPACING = 170;

// ================================
// DATA MODEL
// ================================
const strategicObjectives = [
    { id: 'so1', label: 'Expand APAC\nMarket', shortLabel: 'APAC', color: [255, 215, 0] },
    { id: 'so2', label: 'Improve\nRetention', shortLabel: 'Retention', color: [255, 215, 0] },
    { id: 'so3', label: 'Reduce\nCosts', shortLabel: 'Costs', color: [255, 215, 0] }
];

const projects = [
    { id: 'p1', label: 'APAC\nLocalization', shortLabel: 'APAC Localization', alignedTo: 'so1', strength: 0.9 },
    { id: 'p2', label: 'Customer\nAnalytics', shortLabel: 'Customer Analytics', alignedTo: 'so2', strength: 0.85 },
    { id: 'p3', label: 'Process\nAutomation', shortLabel: 'Process Automation', alignedTo: 'so3', strength: 0.7 },
    { id: 'p4', label: 'UX\nRedesign', shortLabel: 'UX Redesign', alignedTo: 'so2', strength: 0.5 },
    { id: 'p5', label: 'Legacy\nMigration', shortLabel: 'Legacy Migration', alignedTo: null, strength: 0 },
    { id: 'p6', label: 'Research\nPOC', shortLabel: 'Research POC', alignedTo: null, strength: 0 }
];

const tasks = [
    // APAC Localization tasks
    { id: 't1', label: 'Translate UI', projectId: 'p1' },
    { id: 't2', label: 'Market Research', projectId: 'p1' },
    { id: 't3', label: 'Legal Review', projectId: 'p1' },
    // Customer Analytics tasks
    { id: 't4', label: 'Build Dashboards', projectId: 'p2' },
    { id: 't5', label: 'Churn Model', projectId: 'p2' },
    { id: 't6', label: 'Survey Design', projectId: 'p2' },
    // Process Automation tasks
    { id: 't7', label: 'Map Workflows', projectId: 'p3' },
    { id: 't8', label: 'RPA Setup', projectId: 'p3' },
    // UX Redesign tasks
    { id: 't9', label: 'User Testing', projectId: 'p4' },
    { id: 't10', label: 'Wireframes', projectId: 'p4' },
    // Legacy Migration tasks
    { id: 't11', label: 'Schema Audit', projectId: 'p5' },
    { id: 't12', label: 'Data Migration', projectId: 'p5' },
    // Research POC tasks
    { id: 't13', label: 'Prototype', projectId: 'p6' },
    { id: 't14', label: 'Tech Eval', projectId: 'p6' }
];

// ================================
// INTERACTION STATE
// ================================
let hoveredNode = null;
let hoveredNodeType = null; // 'objective', 'project', 'task'
let selectedProject = null;
let nodePositions = {}; // id -> {x, y}
let tooltipText = '';
let tooltipX = 0, tooltipY = 0;
let showTooltip = false;

// Reset button
let resetBtn = { x: 0, y: 0, w: 100, h: 28 };

// ================================
// CANVAS SETUP
// ================================
function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');
    computePositions();
}

function computePositions() {
    // Layer Y positions
    layerY.objectives = LAYER_PADDING_TOP;
    layerY.projects = LAYER_PADDING_TOP + LAYER_SPACING;
    layerY.tasks = LAYER_PADDING_TOP + LAYER_SPACING * 2;

    // Strategic objectives - evenly spaced across top
    let soCount = strategicObjectives.length;
    let soSpacing = canvasWidth / (soCount + 1);
    for (let i = 0; i < soCount; i++) {
        nodePositions[strategicObjectives[i].id] = {
            x: soSpacing * (i + 1),
            y: layerY.objectives
        };
    }

    // Projects - evenly spaced across middle
    let pCount = projects.length;
    let pSpacing = canvasWidth / (pCount + 1);
    for (let i = 0; i < pCount; i++) {
        nodePositions[projects[i].id] = {
            x: pSpacing * (i + 1),
            y: layerY.projects
        };
    }

    // Tasks - group under their parent project, spread evenly
    let projectTaskMap = {};
    for (let t of tasks) {
        if (!projectTaskMap[t.projectId]) projectTaskMap[t.projectId] = [];
        projectTaskMap[t.projectId].push(t);
    }

    for (let pid in projectTaskMap) {
        let group = projectTaskMap[pid];
        let parentX = nodePositions[pid].x;
        let groupWidth = (group.length - 1) * 55;
        let startX = parentX - groupWidth / 2;
        for (let i = 0; i < group.length; i++) {
            nodePositions[group[i].id] = {
                x: startX + i * 55,
                y: layerY.tasks
            };
        }
    }

    // Reset button position
    resetBtn.x = canvasWidth / 2 - resetBtn.w / 2;
    resetBtn.y = drawHeight + (controlHeight - resetBtn.h) / 2;
}

// ================================
// CONNECTIVITY HELPERS
// ================================
function getConnectedProjectIds(objectiveId) {
    return projects.filter(p => p.alignedTo === objectiveId).map(p => p.id);
}

function getConnectedTaskIds(projectId) {
    return tasks.filter(t => t.projectId === projectId).map(t => t.id);
}

function getFullSubgraph(objectiveId) {
    let ids = new Set();
    ids.add(objectiveId);
    let projIds = getConnectedProjectIds(objectiveId);
    for (let pid of projIds) {
        ids.add(pid);
        let taskIds = getConnectedTaskIds(pid);
        for (let tid of taskIds) ids.add(tid);
    }
    return ids;
}

function getProjectSubgraph(projectId) {
    let ids = new Set();
    ids.add(projectId);
    let proj = projects.find(p => p.id === projectId);
    if (proj && proj.alignedTo) ids.add(proj.alignedTo);
    let taskIds = getConnectedTaskIds(projectId);
    for (let tid of taskIds) ids.add(tid);
    return ids;
}

// ================================
// ALIGNMENT METRICS
// ================================
function computeAlignmentPercentage() {
    let alignedTasks = 0;
    let totalTasks = tasks.length;
    for (let t of tasks) {
        let proj = projects.find(p => p.id === t.projectId);
        if (proj && proj.alignedTo) alignedTasks++;
    }
    return Math.round((alignedTasks / totalTasks) * 100);
}

// ================================
// DRAWING
// ================================
function draw() {
    // Draw region background
    noStroke();
    fill(240, 248, 255); // aliceblue
    rect(0, 0, canvasWidth, drawHeight);

    // Control region background
    fill(255);
    rect(0, drawHeight, canvasWidth, controlHeight);

    // Border between regions
    stroke(192);
    strokeWeight(1);
    line(0, drawHeight, canvasWidth, drawHeight);

    // Determine highlight set
    let highlightSet = null;
    if (hoveredNode && hoveredNodeType === 'objective') {
        highlightSet = getFullSubgraph(hoveredNode);
    } else if (hoveredNode && hoveredNodeType === 'project') {
        highlightSet = getProjectSubgraph(hoveredNode);
    } else if (hoveredNode && hoveredNodeType === 'task') {
        let task = tasks.find(t => t.id === hoveredNode);
        if (task) highlightSet = getProjectSubgraph(task.projectId);
    }
    if (selectedProject) {
        highlightSet = getProjectSubgraph(selectedProject);
    }

    // Title
    drawTitle();

    // Layer labels
    drawLayerLabels();

    // Draw edges (behind nodes)
    drawEdges(highlightSet);

    // Draw nodes
    drawStrategicObjectives(highlightSet);
    drawProjects(highlightSet);
    drawTasks(highlightSet);

    // Draw annotations
    drawAnnotations(highlightSet);

    // Draw info panel for selected project
    if (selectedProject) {
        drawInfoPanel(selectedProject);
    }

    // Draw tooltip
    if (showTooltip && !selectedProject) {
        drawTooltipBox();
    }

    // Draw reset button
    drawResetButton();
}

function drawTitle() {
    fill(...INDIGO_DARK);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(18);
    textStyle(BOLD);
    text('Strategy Alignment Graph Model', canvasWidth / 2, 10);
    textStyle(NORMAL);
}

function drawLayerLabels() {
    textSize(11);
    textAlign(LEFT, CENTER);
    noStroke();

    // Strategic Objectives label
    fill(...GOLD, 200);
    rect(8, layerY.objectives - 14, 130, 20, 4);
    fill(80);
    text('Strategic Objectives', 14, layerY.objectives - 4);

    // Projects label
    fill(...INDIGO, 40);
    rect(8, layerY.projects - 14, 60, 20, 4);
    fill(80);
    text('Projects', 14, layerY.projects - 4);

    // Tasks label
    fill(...AMBER, 40);
    rect(8, layerY.tasks - 14, 48, 20, 4);
    fill(80);
    text('Tasks', 14, layerY.tasks - 4);
}

// ================================
// EDGE DRAWING
// ================================
function drawEdges(highlightSet) {
    // ALIGNS_WITH edges (Project -> Objective) - gold, thickness by strength
    for (let p of projects) {
        if (!p.alignedTo) continue;
        let from = nodePositions[p.id];
        let to = nodePositions[p.alignedTo];
        if (!from || !to) continue;

        let isDimmed = highlightSet && (!highlightSet.has(p.id) || !highlightSet.has(p.alignedTo));
        let alpha = isDimmed ? 40 : 200;
        let thickness = map(p.strength, 0, 1, 1, 6);

        stroke(255, 200, 0, alpha);
        strokeWeight(thickness);
        noFill();
        // Slight curve for visual appeal
        let cx = (from.x + to.x) / 2;
        let cy = (from.y + to.y) / 2 - 10;
        bezier(from.x, from.y - 18, cx - 15, cy, cx + 15, cy, to.x, to.y + 22);

        // Draw arrowhead at objective end
        if (!isDimmed) {
            drawArrowhead(to.x, to.y + 22, from.x, from.y - 18, alpha);
        }
    }

    // PART_OF edges (Task -> Project) - indigo, thin solid
    for (let t of tasks) {
        let from = nodePositions[t.id];
        let proj = projects.find(p => p.id === t.projectId);
        if (!proj) continue;
        let to = nodePositions[t.projectId];
        if (!from || !to) continue;

        let isDimmed = highlightSet && (!highlightSet.has(t.id) || !highlightSet.has(t.projectId));
        let alpha = isDimmed ? 30 : 150;

        stroke(...INDIGO, alpha);
        strokeWeight(1.5);
        line(from.x, from.y - 12, to.x, to.y + 22);
    }
}

function drawArrowhead(toX, toY, fromX, fromY, alpha) {
    let angle = atan2(toY - fromY, toX - fromX);
    let arrowSize = 8;
    fill(255, 200, 0, alpha);
    noStroke();
    push();
    translate(toX, toY);
    rotate(angle);
    triangle(0, 0, -arrowSize, -arrowSize / 2, -arrowSize, arrowSize / 2);
    pop();
}

// ================================
// STRATEGIC OBJECTIVE NODES (hexagon shapes)
// ================================
function drawStrategicObjectives(highlightSet) {
    for (let so of strategicObjectives) {
        let pos = nodePositions[so.id];
        if (!pos) continue;

        let isDimmed = highlightSet && !highlightSet.has(so.id);
        let isHovered = hoveredNode === so.id;
        let alpha = isDimmed ? 60 : 255;

        // Glow on hover
        if (isHovered) {
            noStroke();
            fill(255, 215, 0, 60);
            drawHexagon(pos.x, pos.y, 38);
        }

        // Hexagon body
        stroke(isDimmed ? 200 : 180, 160, 0);
        strokeWeight(isHovered ? 3 : 2);
        fill(255, 215, 0, alpha);
        drawHexagon(pos.x, pos.y, 30);

        // Label
        fill(isDimmed ? 160 : 50, isDimmed ? 160 : 40, isDimmed ? 160 : 0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        textStyle(BOLD);
        let lines = so.label.split('\n');
        for (let i = 0; i < lines.length; i++) {
            text(lines[i], pos.x, pos.y - 5 + i * 13);
        }
        textStyle(NORMAL);
    }
}

function drawHexagon(cx, cy, r) {
    beginShape();
    for (let i = 0; i < 6; i++) {
        let angle = TWO_PI / 6 * i - PI / 6;
        vertex(cx + cos(angle) * r, cy + sin(angle) * r);
    }
    endShape(CLOSE);
}

// ================================
// PROJECT NODES (rounded rectangles)
// ================================
function drawProjects(highlightSet) {
    let pw = 90, ph = 40;

    for (let p of projects) {
        let pos = nodePositions[p.id];
        if (!pos) continue;

        let isDimmed = highlightSet && !highlightSet.has(p.id);
        let isHovered = hoveredNode === p.id;
        let isSelected = selectedProject === p.id;
        let isUnaligned = !p.alignedTo;
        let alpha = isDimmed ? 60 : 255;

        let x = pos.x - pw / 2;
        let y = pos.y - ph / 2;

        // Glow on hover/select
        if (isHovered || isSelected) {
            noStroke();
            fill(255, 215, 0, 50);
            rect(x - 5, y - 5, pw + 10, ph + 10, 14);
        }

        // Project box
        if (isUnaligned) {
            // Dashed border for unaligned
            stroke(180, 80, 80, alpha);
            strokeWeight(2);
            drawDashedRect(x, y, pw, ph, 10, 6);
            fill(240, 230, 230, alpha);
            noStroke();
            rect(x, y, pw, ph, 10);
        } else {
            if (isHovered || isSelected) {
                stroke(255, 215, 0, alpha);
            } else {
                stroke(26, 35, 126, alpha);
            }
            strokeWeight(isHovered || isSelected ? 2.5 : 1.5);
            fill(48, 63, 159, alpha);
            rect(x, y, pw, ph, 10);
        }

        // Label
        fill(isUnaligned ? (isDimmed ? 200 : 120) : (isDimmed ? 180 : 255));
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        textStyle(BOLD);
        let lines = p.label.split('\n');
        for (let i = 0; i < lines.length; i++) {
            text(lines[i], pos.x, pos.y - 5 + i * 13);
        }
        textStyle(NORMAL);

        // Alignment strength badge for aligned projects
        if (p.alignedTo && !isDimmed) {
            let badgeX = pos.x + pw / 2 - 8;
            let badgeY = pos.y - ph / 2 - 4;
            fill(255, 215, 0);
            noStroke();
            ellipse(badgeX, badgeY, 22, 16);
            fill(50);
            textSize(8);
            textStyle(BOLD);
            textAlign(CENTER, CENTER);
            text(nf(p.strength, 0, 1), badgeX, badgeY);
            textStyle(NORMAL);
        }
    }
}

function drawDashedRect(x, y, w, h, r, dashLen) {
    // Draw dashed border using short line segments
    let gap = dashLen;
    noFill();

    // Top edge
    for (let i = x + r; i < x + w - r; i += dashLen + gap) {
        let endX = min(i + dashLen, x + w - r);
        line(i, y, endX, y);
    }
    // Bottom edge
    for (let i = x + r; i < x + w - r; i += dashLen + gap) {
        let endX = min(i + dashLen, x + w - r);
        line(i, y + h, endX, y + h);
    }
    // Left edge
    for (let i = y + r; i < y + h - r; i += dashLen + gap) {
        let endY = min(i + dashLen, y + h - r);
        line(x, i, x, endY);
    }
    // Right edge
    for (let i = y + r; i < y + h - r; i += dashLen + gap) {
        let endY = min(i + dashLen, y + h - r);
        line(x + w, i, x + w, endY);
    }
}

// ================================
// TASK NODES (small circles)
// ================================
function drawTasks(highlightSet) {
    for (let t of tasks) {
        let pos = nodePositions[t.id];
        if (!pos) continue;

        let isDimmed = highlightSet && !highlightSet.has(t.id);
        let isHovered = hoveredNode === t.id;
        let alpha = isDimmed ? 60 : 255;

        // Glow on hover
        if (isHovered) {
            noStroke();
            fill(255, 215, 0, 60);
            ellipse(pos.x, pos.y, 30);
        }

        // Circle body
        stroke(...AMBER_DARK, alpha);
        strokeWeight(isHovered ? 2.5 : 1.2);
        fill(212, 136, 15, alpha);
        ellipse(pos.x, pos.y, 22);

        // Label below
        fill(isDimmed ? 180 : 70);
        noStroke();
        textAlign(CENTER, TOP);
        textSize(8);
        text(t.label, pos.x, pos.y + 14);
    }
}

// ================================
// ANNOTATIONS
// ================================
function drawAnnotations(highlightSet) {
    let pct = computeAlignmentPercentage();

    // "XX% aligned" near the top-left cluster
    let firstAligned = projects.find(p => p.alignedTo);
    if (firstAligned) {
        let pos = nodePositions[firstAligned.id];
        let annoX = canvasWidth - 140;
        let annoY = layerY.objectives + 40;

        if (!highlightSet) {
            fill(50, 140, 50, 180);
            noStroke();
            textAlign(LEFT, CENTER);
            textSize(13);
            textStyle(BOLD);
            text(pct + '% aligned', annoX, annoY);
            textStyle(NORMAL);
            textSize(9);
            fill(100);
            text('of tasks linked to', annoX, annoY + 16);
            text('strategic objectives', annoX, annoY + 28);
        }
    }

    // "Alignment gap" near unaligned projects
    let unaligned = projects.filter(p => !p.alignedTo);
    if (unaligned.length > 0) {
        let lastUnaligned = unaligned[unaligned.length - 1];
        let pos = nodePositions[lastUnaligned.id];
        let annoX = pos.x + 55;
        let annoY = pos.y - 30;

        if (!highlightSet) {
            // Gap indicator
            fill(180, 60, 60, 180);
            noStroke();
            textAlign(LEFT, CENTER);
            textSize(12);
            textStyle(BOLD);
            text('Alignment gap', annoX, annoY);
            textStyle(NORMAL);
            textSize(9);
            fill(140, 60, 60, 160);
            text('No strategic link', annoX, annoY + 15);

            // Small arrow pointing to unaligned project
            stroke(180, 60, 60, 120);
            strokeWeight(1.5);
            line(annoX - 5, annoY, pos.x + 50, pos.y - 15);
        }
    }
}

// ================================
// INFO PANEL (on project click)
// ================================
function drawInfoPanel(projectId) {
    let proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    let pw = 220, ph = 140;
    let px = canvasWidth - pw - 16;
    let py = drawHeight - ph - 16;

    // Shadow
    noStroke();
    fill(0, 0, 0, 20);
    rect(px + 3, py + 3, pw, ph, 8);

    // Background
    fill(255, 252, 240);
    stroke(...INDIGO, 150);
    strokeWeight(1.5);
    rect(px, py, pw, ph, 8);

    // Close button
    fill(180);
    noStroke();
    ellipse(px + pw - 14, py + 14, 18);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    text('x', px + pw - 14, py + 13);

    // Title
    fill(...INDIGO_DARK);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(14);
    textStyle(BOLD);
    text(proj.shortLabel, px + 12, py + 10);
    textStyle(NORMAL);

    // Alignment info
    textSize(11);
    if (proj.alignedTo) {
        let so = strategicObjectives.find(s => s.id === proj.alignedTo);
        fill(80);
        text('Aligned to: ' + (so ? so.shortLabel : 'Unknown'), px + 12, py + 32);

        // Strength bar
        text('Strength:', px + 12, py + 52);
        fill(220);
        noStroke();
        rect(px + 80, py + 52, 120, 14, 4);
        fill(...GOLD);
        rect(px + 80, py + 52, 120 * proj.strength, 14, 4);
        fill(50);
        textAlign(CENTER, TOP);
        textSize(10);
        textStyle(BOLD);
        text(nf(proj.strength * 100, 0, 0) + '%', px + 80 + 60, py + 53);
        textStyle(NORMAL);
        textAlign(LEFT, TOP);
        textSize(11);
    } else {
        fill(180, 60, 60);
        textStyle(BOLD);
        text('No strategic alignment', px + 12, py + 32);
        textStyle(NORMAL);
        fill(120);
        textSize(10);
        text('This project has no link to any', px + 12, py + 50);
        text('strategic objective.', px + 12, py + 64);
    }

    // Connected tasks
    let connectedTasks = tasks.filter(t => t.projectId === projectId);
    fill(80);
    textSize(11);
    text('Tasks (' + connectedTasks.length + '):', px + 12, py + 80);
    textSize(10);
    fill(100);
    for (let i = 0; i < connectedTasks.length; i++) {
        let dotY = py + 96 + i * 14;
        if (dotY + 14 > py + ph - 4) break; // prevent overflow
        fill(...AMBER);
        noStroke();
        ellipse(px + 18, dotY + 4, 6);
        fill(80);
        textAlign(LEFT, TOP);
        text(connectedTasks[i].label, px + 26, dotY);
    }
}

// ================================
// TOOLTIP
// ================================
function drawTooltipBox() {
    if (!tooltipText) return;

    textSize(11);
    let tw = textWidth(tooltipText) + 20;
    let th = 30;
    let tx = tooltipX + 15;
    let ty = tooltipY - 20;

    // Keep on screen
    if (tx + tw > canvasWidth - 10) tx = tooltipX - tw - 10;
    if (ty < 10) ty = 10;

    // Shadow
    noStroke();
    fill(0, 0, 0, 20);
    rect(tx + 2, ty + 2, tw, th, 6);

    // Background
    fill(255, 252, 240);
    stroke(180);
    strokeWeight(1);
    rect(tx, ty, tw, th, 6);

    // Text
    fill(60);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(11);
    text(tooltipText, tx + 10, ty + th / 2);
}

// ================================
// RESET BUTTON
// ================================
function drawResetButton() {
    let bx = resetBtn.x, by = resetBtn.y, bw = resetBtn.w, bh = resetBtn.h;
    let isHover = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;

    if (isHover) {
        fill(...INDIGO_LIGHT);
    } else {
        fill(...INDIGO);
    }
    stroke(...INDIGO_DARK);
    strokeWeight(1);
    rect(bx, by, bw, bh, 6);

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);
    text('Reset View', bx + bw / 2, by + bh / 2);
}

// ================================
// HIT TESTING
// ================================
function findNodeUnderMouse(mx, my) {
    // Check strategic objectives (hexagon ~ circle hit test with r=30)
    for (let so of strategicObjectives) {
        let pos = nodePositions[so.id];
        if (pos && dist(mx, my, pos.x, pos.y) < 32) {
            return { id: so.id, type: 'objective' };
        }
    }

    // Check projects (rectangle hit test 90x40)
    let pw = 90, ph = 40;
    for (let p of projects) {
        let pos = nodePositions[p.id];
        if (pos && mx > pos.x - pw / 2 - 4 && mx < pos.x + pw / 2 + 4 &&
            my > pos.y - ph / 2 - 4 && my < pos.y + ph / 2 + 4) {
            return { id: p.id, type: 'project' };
        }
    }

    // Check tasks (circle hit test r=13)
    for (let t of tasks) {
        let pos = nodePositions[t.id];
        if (pos && dist(mx, my, pos.x, pos.y) < 15) {
            return { id: t.id, type: 'task' };
        }
    }

    return null;
}

// ================================
// INTERACTION
// ================================
function mouseMoved() {
    let hit = findNodeUnderMouse(mouseX, mouseY);
    showTooltip = false;
    hoveredNode = null;
    hoveredNodeType = null;

    if (hit) {
        hoveredNode = hit.id;
        hoveredNodeType = hit.type;

        // Set tooltip for unaligned projects
        if (hit.type === 'project') {
            let proj = projects.find(p => p.id === hit.id);
            if (proj && !proj.alignedTo) {
                tooltipText = 'No strategic alignment detected';
                tooltipX = mouseX;
                tooltipY = mouseY;
                showTooltip = true;
            }
        }

        cursor(HAND);
    } else {
        cursor(ARROW);
    }
}

function mousePressed() {
    // Check reset button
    if (mouseX > resetBtn.x && mouseX < resetBtn.x + resetBtn.w &&
        mouseY > resetBtn.y && mouseY < resetBtn.y + resetBtn.h) {
        selectedProject = null;
        return;
    }

    // Check close button on info panel
    if (selectedProject) {
        let pw = 220, ph = 140;
        let px = canvasWidth - pw - 16;
        let py = drawHeight - ph - 16;
        if (dist(mouseX, mouseY, px + pw - 14, py + 14) < 12) {
            selectedProject = null;
            return;
        }
    }

    // Check project click
    let hit = findNodeUnderMouse(mouseX, mouseY);
    if (hit && hit.type === 'project') {
        selectedProject = (selectedProject === hit.id) ? null : hit.id;
        return;
    }

    // Click on background clears selection
    if (!hit) {
        selectedProject = null;
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    computePositions();
}
