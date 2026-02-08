// Cypher Query Visualizer MicroSim
// Students select pre-built Cypher queries and watch the graph
// highlight matching nodes and edges

let canvasWidth = 400;
let drawHeight = 500;
let controlHeight = 0;
let canvasHeight = drawHeight + controlHeight;
let margin = 15;

// Aria color theme
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const AMBER_LIGHT = '#F5C14B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';

// Colors for rendering
const NODE_DEFAULT = '#D0D0D0';
const DEPT_DEFAULT = '#B0B8D0';

// ===========================================
// GRAPH DATA
// ===========================================

const employees = [
    { id: 'maria',  name: 'Maria',  title: 'Senior Engineer',   dept: 'engineering' },
    { id: 'james',  name: 'James',  title: 'Eng Manager',       dept: 'engineering' },
    { id: 'aisha',  name: 'Aisha',  title: 'Product Manager',   dept: 'product' },
    { id: 'carlos', name: 'Carlos', title: 'Lead Designer',     dept: 'engineering' },
    { id: 'li',     name: 'Li',     title: 'Data Analyst',      dept: 'product' }
];

const departments = [
    { id: 'engineering', name: 'Engineering' },
    { id: 'product',     name: 'Product' }
];

const graphEdges = [
    // WORKS_IN  (indices 0-4)
    { from: 'maria',  to: 'engineering', type: 'WORKS_IN' },
    { from: 'james',  to: 'engineering', type: 'WORKS_IN' },
    { from: 'aisha',  to: 'product',     type: 'WORKS_IN' },
    { from: 'carlos', to: 'engineering', type: 'WORKS_IN' },
    { from: 'li',     to: 'product',     type: 'WORKS_IN' },
    // REPORTS_TO  (indices 5-6)
    { from: 'maria',  to: 'james',  type: 'REPORTS_TO' },
    { from: 'carlos', to: 'james',  type: 'REPORTS_TO' },
    // COMMUNICATES_WITH  (indices 7-9)
    { from: 'maria',  to: 'aisha',  type: 'COMMUNICATES_WITH' },
    { from: 'maria',  to: 'carlos', type: 'COMMUNICATES_WITH' },
    { from: 'aisha',  to: 'li',     type: 'COMMUNICATES_WITH' }
];

// Node positions as pixel coordinates (computed each frame)
let nodePositions = {};

// ===========================================
// QUERY DEFINITIONS
// ===========================================

const queries = [
    {
        label: 'Find Maria',
        cypher: 'MATCH (m:Employee\n  {name: "Maria"})\nRETURN m',
        description: 'Find a single node by property',
        highlightNodes: ['maria'],
        highlightEdges: []
    },
    {
        label: "Maria's Dept",
        cypher: 'MATCH (m:Employee\n  {name: "Maria"})\n  -[:WORKS_IN]->\n  (d:Department)\nRETURN m, d',
        description: 'Traverse a WORKS_IN edge',
        highlightNodes: ['maria', 'engineering'],
        highlightEdges: [0] // maria -> engineering
    },
    {
        label: "Maria's Network",
        cypher: 'MATCH (m:Employee\n  {name: "Maria"})\n  -[:COMMUNICATES_WITH]-\n  (peer)\nRETURN m, peer',
        description: 'Find communication neighbors',
        highlightNodes: ['maria', 'aisha', 'carlos'],
        highlightEdges: [7, 8] // maria-aisha, maria-carlos
    },
    {
        label: 'Cross-Dept Comm',
        cypher: 'MATCH (a:Employee)\n  -[:WORKS_IN]->(d1),\n (a)-[:COMMUNICATES_WITH]\n  -(b:Employee)\n  -[:WORKS_IN]->(d2)\nWHERE d1 <> d2\nRETURN a, b',
        description: 'People communicating across depts',
        highlightNodes: ['maria', 'aisha'],
        highlightEdges: [0, 2, 7] // maria->eng, aisha->prod, maria-aisha
    },
    {
        label: 'Path: Li to James',
        cypher: 'MATCH path =\n  shortestPath(\n  (a:Employee\n    {name: "Li"})\n  -[*]-(b:Employee\n    {name: "James"}))\nRETURN path',
        description: 'Shortest path through any edges',
        highlightNodes: ['li', 'aisha', 'maria', 'james'],
        highlightEdges: [9, 7, 5] // li-aisha, maria-aisha, maria-james
    }
];

let selectedQuery = -1;
let queryButtons = [];
let resetBtn = {};
let animProgress = 0;
let animSpeed = 0.04;
let graphAreaRight = 0;

function setup() {
    updateCanvasSize();
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent(document.querySelector('main'));
    describe('Interactive Cypher query visualizer showing an organizational graph on the left and query buttons on the right. Clicking a query highlights the matching nodes and edges in amber.', LABEL);
    textFont('Arial');
}

function draw() {
    updateCanvasSize();

    // Background
    fill(CHAMPAGNE);
    noStroke();
    rect(0, 0, canvasWidth, canvasHeight);

    // Layout: graph on left ~58%, panel on right ~42%
    let panelWidth = constrain(canvasWidth * 0.38, 155, 260);
    graphAreaRight = canvasWidth - panelWidth;
    let panelX = graphAreaRight;

    // Compute positions every frame for responsiveness
    computePositions(margin, 40, graphAreaRight - margin * 2, drawHeight - 55);

    // Draw the graph area
    drawGraphArea(margin, 40, graphAreaRight - margin * 2, drawHeight - 55);

    // Draw the right panel
    drawPanel(panelX, 0, panelWidth, drawHeight);

    // Title bar
    noStroke();
    fill(INDIGO_DARK);
    textAlign(CENTER, TOP);
    textSize(constrain(canvasWidth * 0.03, 12, 17));
    textStyle(BOLD);
    text('Cypher Query Visualizer', graphAreaRight / 2, 12);
    textStyle(NORMAL);

    // Advance animation
    if (animProgress < 1) {
        animProgress += animSpeed;
        if (animProgress > 1) animProgress = 1;
    }
}

// ===========================================
// COMPUTE NODE POSITIONS
// ===========================================

function computePositions(gx, gy, gw, gh) {
    let cx = gx + gw * 0.45;
    let cy = gy + gh * 0.45;

    nodePositions['maria']  = { x: cx,              y: cy - gh * 0.10 };
    nodePositions['james']  = { x: cx - gw * 0.32,  y: cy - gh * 0.28 };
    nodePositions['aisha']  = { x: cx + gw * 0.28,  y: cy - gh * 0.05 };
    nodePositions['carlos'] = { x: cx - gw * 0.18,  y: cy + gh * 0.25 };
    nodePositions['li']     = { x: cx + gw * 0.32,  y: cy + gh * 0.28 };

    nodePositions['engineering'] = { x: cx - gw * 0.38, y: cy + gh * 0.05 };
    nodePositions['product']     = { x: cx + gw * 0.42, y: cy + gh * 0.12 };
}

// ===========================================
// DRAW GRAPH
// ===========================================

function drawGraphArea(gx, gy, gw, gh) {
    let nodeR = constrain(gw * 0.05, 16, 26);
    let fontSize = constrain(gw * 0.033, 9, 13);
    let sc = selectedQuery >= 0 ? queries[selectedQuery] : null;

    // Draw edges
    for (let i = 0; i < graphEdges.length; i++) {
        let e = graphEdges[i];
        let fromPos = nodePositions[e.from];
        let toPos = nodePositions[e.to];
        if (!fromPos || !toPos) continue;

        let isHL = sc && sc.highlightEdges.indexOf(i) !== -1;

        if (isHL && animProgress > 0.1) {
            let edgeAlpha = min(255, animProgress * 500);
            // Amber glow (wider stroke behind)
            stroke(212, 136, 15, edgeAlpha * 0.3);
            strokeWeight(8);
            drawEdgeLine(fromPos, toPos, nodeR, e);
            // Amber solid line
            stroke(212, 136, 15, edgeAlpha);
            strokeWeight(3);
            drawEdgeLine(fromPos, toPos, nodeR, e);
            // Arrowhead
            drawArrowhead(fromPos, toPos, nodeR, e, AMBER);
        } else {
            stroke(200, 200, 200, 100);
            strokeWeight(1.5);
            drawEdgeLine(fromPos, toPos, nodeR, e);
            drawArrowhead(fromPos, toPos, nodeR, e, '#CCC');
        }

        // Edge type label at midpoint
        let midX = (fromPos.x + toPos.x) / 2;
        let midY = (fromPos.y + toPos.y) / 2;
        noStroke();
        let labelCol = isHL && animProgress > 0.2 ? AMBER_DARK : '#BBB';
        fill(labelCol);
        textAlign(CENTER, CENTER);
        textSize(constrain(fontSize * 0.55, 6, 8));
        text(e.type, midX, midY - 8);
    }

    // Draw department nodes (rectangles)
    for (let dept of departments) {
        let pos = nodePositions[dept.id];
        if (!pos) continue;
        let isHL = sc && sc.highlightNodes.indexOf(dept.id) !== -1;
        let deptW = nodeR * 3.5;
        let deptH = nodeR * 1.8;

        if (isHL && animProgress > 0.1) {
            // Amber glow
            noStroke();
            fill(212, 136, 15, 50 * animProgress);
            rect(pos.x - deptW / 2 - 4, pos.y - deptH / 2 - 4, deptW + 8, deptH + 8, 10);

            fill(AMBER);
            stroke(AMBER_DARK);
            strokeWeight(2.5);
        } else {
            fill(DEPT_DEFAULT);
            stroke('#999');
            strokeWeight(1.5);
        }
        rect(pos.x - deptW / 2, pos.y - deptH / 2, deptW, deptH, 6);

        // Label
        noStroke();
        fill(isHL && animProgress > 0.15 ? 'white' : '#444');
        textAlign(CENTER, CENTER);
        textSize(constrain(fontSize * 0.85, 8, 12));
        textStyle(BOLD);
        text(dept.name, pos.x, pos.y);
        textStyle(NORMAL);

        // Small type label below
        fill(isHL && animProgress > 0.15 ? AMBER_LIGHT : '#AAA');
        textSize(constrain(fontSize * 0.55, 5, 8));
        text(':Department', pos.x, pos.y + deptH / 2 + 9);
    }

    // Draw employee nodes (circles)
    for (let emp of employees) {
        let pos = nodePositions[emp.id];
        if (!pos) continue;
        let isHL = sc && sc.highlightNodes.indexOf(emp.id) !== -1;

        if (isHL && animProgress > 0.1) {
            // Amber glow behind
            noStroke();
            fill(212, 136, 15, 55 * animProgress);
            ellipse(pos.x, pos.y, nodeR * 2 + 14);

            fill(AMBER);
            stroke(AMBER_DARK);
            strokeWeight(2.5);
        } else {
            // Shadow
            noStroke();
            fill(0, 0, 0, 15);
            ellipse(pos.x + 1, pos.y + 1, nodeR * 2 + 2);

            fill(NODE_DEFAULT);
            stroke('#AAA');
            strokeWeight(1.5);
        }
        ellipse(pos.x, pos.y, nodeR * 2);

        // Name
        noStroke();
        fill(isHL && animProgress > 0.15 ? 'white' : '#444');
        textAlign(CENTER, CENTER);
        textSize(constrain(fontSize * 0.9, 8, 12));
        textStyle(BOLD);
        text(emp.name, pos.x, pos.y);
        textStyle(NORMAL);

        // Small label below
        fill(isHL && animProgress > 0.15 ? AMBER_DARK : '#AAA');
        textSize(constrain(fontSize * 0.55, 5, 8));
        text(':Employee', pos.x, pos.y + nodeR + 9);
    }

    // Legend at bottom-left of graph area
    let legY = gy + gh + 2;
    let legX = gx + 5;
    let legFontSize = constrain(fontSize * 0.7, 7, 10);

    noStroke();
    fill(NODE_DEFAULT);
    ellipse(legX + 6, legY, 10);
    fill('#888');
    textAlign(LEFT, CENTER);
    textSize(legFontSize);
    text('Employee', legX + 15, legY);

    fill(DEPT_DEFAULT);
    noStroke();
    rect(legX + 80, legY - 4, 10, 8, 2);
    fill('#888');
    textAlign(LEFT, CENTER);
    text('Department', legX + 94, legY);
}

function drawEdgeLine(fromPos, toPos, nodeR, e) {
    let ang = atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);

    let startR = nodeR;
    let endR = nodeR;

    // Adjust for department rectangle shape
    if (departments.some(function(d) { return d.id === e.to; })) {
        endR = nodeR * 1.7;
    }
    if (departments.some(function(d) { return d.id === e.from; })) {
        startR = nodeR * 1.7;
    }

    let sx = fromPos.x + cos(ang) * startR;
    let sy = fromPos.y + sin(ang) * startR;
    let ex = toPos.x - cos(ang) * endR;
    let ey = toPos.y - sin(ang) * endR;

    line(sx, sy, ex, ey);
}

function drawArrowhead(fromPos, toPos, nodeR, e, arrowColor) {
    // Only draw arrowheads for directed edges
    if (e.type === 'COMMUNICATES_WITH') return;

    let ang = atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
    let endR = nodeR;
    if (departments.some(function(d) { return d.id === e.to; })) {
        endR = nodeR * 1.7;
    }

    let ex = toPos.x - cos(ang) * endR;
    let ey = toPos.y - sin(ang) * endR;

    let aSize = 6;
    push();
    translate(ex, ey);
    rotate(ang);
    noStroke();
    fill(arrowColor);
    triangle(0, 0, -aSize * 1.5, -aSize * 0.6, -aSize * 1.5, aSize * 0.6);
    pop();
}

// ===========================================
// DRAW RIGHT PANEL
// ===========================================

function drawPanel(px, py, pw, ph) {
    // Panel background
    noStroke();
    fill(255, 255, 255, 230);
    rect(px, py, pw, ph);

    // Subtle left border
    stroke(INDIGO_LIGHT);
    strokeWeight(2);
    line(px, py, px, py + ph);

    let innerMargin = 10;
    let contentX = px + innerMargin;
    let contentW = pw - innerMargin * 2;
    let fontSize = constrain(pw * 0.065, 9, 13);

    // Panel title
    noStroke();
    fill(INDIGO_DARK);
    textAlign(LEFT, TOP);
    textSize(fontSize + 2);
    textStyle(BOLD);
    text('Query Panel', contentX, py + 10);
    textStyle(NORMAL);

    fill('#777');
    textSize(constrain(fontSize * 0.8, 7, 10));
    text('Select a Cypher query:', contentX, py + 28);

    // Draw query buttons
    queryButtons = [];
    let btnY = py + 44;
    let btnH = constrain(fontSize * 2.4, 24, 32);
    let btnGap = 4;

    for (let i = 0; i < queries.length; i++) {
        let isSelected = i === selectedQuery;
        let bx = contentX;
        let by = btnY + i * (btnH + btnGap);
        let bw = contentW;

        // Button background
        noStroke();
        if (isSelected) {
            fill(AMBER);
        } else {
            let isHover = mouseX >= bx && mouseX <= bx + bw &&
                          mouseY >= by && mouseY <= by + btnH;
            fill(isHover ? INDIGO_LIGHT : INDIGO);
        }
        rect(bx, by, bw, btnH, 5);

        // Button text
        fill('white');
        textAlign(CENTER, CENTER);
        textSize(constrain(fontSize * 0.82, 8, 11));
        textStyle(BOLD);
        text(queries[i].label, bx + bw / 2, by + btnH / 2);
        textStyle(NORMAL);

        queryButtons.push({ x: bx, y: by, w: bw, h: btnH, idx: i });
    }

    // Reset button
    let resetY = btnY + queries.length * (btnH + btnGap) + 6;
    let resetH = btnH;
    let resetHover = mouseX >= contentX && mouseX <= contentX + contentW &&
                     mouseY >= resetY && mouseY <= resetY + resetH;

    noStroke();
    fill(resetHover ? '#999' : '#BBB');
    rect(contentX, resetY, contentW, resetH, 5);

    fill('white');
    textAlign(CENTER, CENTER);
    textSize(constrain(fontSize * 0.82, 8, 11));
    textStyle(BOLD);
    text('Reset', contentX + contentW / 2, resetY + resetH / 2);
    textStyle(NORMAL);

    resetBtn = { x: contentX, y: resetY, w: contentW, h: resetH };

    // Cypher code display area
    let codeY = resetY + resetH + 12;

    if (selectedQuery >= 0) {
        let q = queries[selectedQuery];

        // Description
        fill(INDIGO_DARK);
        textAlign(LEFT, TOP);
        textSize(constrain(fontSize * 0.78, 7, 10));
        textStyle(BOLD);
        text(q.description, contentX, codeY);
        textStyle(NORMAL);

        // Cypher code box
        let codeBoxY = codeY + 16;
        let codeBoxH = ph - codeBoxY + py - 12;
        codeBoxH = max(codeBoxH, 80);

        noStroke();
        fill(30, 30, 50);
        rect(contentX, codeBoxY, contentW, codeBoxH, 5);

        // Cypher label
        fill(AMBER_LIGHT);
        textAlign(LEFT, TOP);
        textSize(constrain(fontSize * 0.65, 7, 9));
        textStyle(BOLD);
        text('Cypher:', contentX + 6, codeBoxY + 5);
        textStyle(NORMAL);

        // Cypher code text
        fill('#E0E0E0');
        textSize(constrain(fontSize * 0.68, 7, 10));
        textAlign(LEFT, TOP);
        let codeLines = q.cypher.split('\n');
        let lineH = constrain(fontSize * 0.95, 10, 14);
        for (let i = 0; i < codeLines.length; i++) {
            text(codeLines[i], contentX + 6, codeBoxY + 18 + i * lineH);
        }

        // Results count at bottom of code box
        fill(AMBER);
        textSize(constrain(fontSize * 0.6, 6, 9));
        textAlign(LEFT, BOTTOM);
        let nodeCount = q.highlightNodes.length;
        let edgeCount = q.highlightEdges.length;
        text(nodeCount + ' node' + (nodeCount !== 1 ? 's' : '') +
             ', ' + edgeCount + ' edge' + (edgeCount !== 1 ? 's' : '') +
             ' matched', contentX + 6, codeBoxY + codeBoxH - 4);
    } else {
        // Prompt text
        fill('#999');
        textAlign(LEFT, TOP);
        textSize(constrain(fontSize * 0.78, 8, 10));
        textStyle(ITALIC);
        text('Click a query above to\nhighlight matching nodes\nand edges in the graph.', contentX, codeY);
        textStyle(NORMAL);
    }
}

// ===========================================
// INTERACTION
// ===========================================

function mousePressed() {
    // Check query buttons
    for (let i = 0; i < queryButtons.length; i++) {
        let btn = queryButtons[i];
        if (mouseX >= btn.x && mouseX <= btn.x + btn.w &&
            mouseY >= btn.y && mouseY <= btn.y + btn.h) {
            if (selectedQuery !== btn.idx) {
                selectedQuery = btn.idx;
                animProgress = 0;
            }
            return;
        }
    }

    // Check reset button
    if (resetBtn.w && mouseX >= resetBtn.x && mouseX <= resetBtn.x + resetBtn.w &&
        mouseY >= resetBtn.y && mouseY <= resetBtn.y + resetBtn.h) {
        selectedQuery = -1;
        animProgress = 0;
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
