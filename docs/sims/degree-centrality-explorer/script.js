// Degree Centrality Explorer - p5.js MicroSim
// Interactive organizational network showing indegree, outdegree, and total degree

let canvasWidth = 900;
const canvasHeight = 580;
let nodes = [];
let edges = [];
let mode = 'total'; // 'indegree', 'outdegree', 'total'
let hoveredNode = null;
let draggedNode = null;
let dragOffsetX = 0, dragOffsetY = 0;

const GRAPH_TOP = 55;
const GRAPH_BOTTOM = 400;
const GRAPH_LEFT = 20;
const GRAPH_RIGHT = 880;
const RANKING_TOP = 415;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const LIGHT_GRAY = [220, 220, 220];

const buttons = [
    { label: 'Indegree', mode: 'indegree', x: 0, y: 10, w: 110, h: 32 },
    { label: 'Outdegree', mode: 'outdegree', x: 0, y: 10, w: 110, h: 32 },
    { label: 'Total Degree', mode: 'total', x: 0, y: 10, w: 120, h: 32 }
];

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) {
        canvasWidth = container.offsetWidth;
    }
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');

    // Position buttons centered
    let totalW = 110 + 110 + 120 + 20;
    let startX = (canvasWidth - totalW) / 2;
    buttons[0].x = startX;
    buttons[1].x = startX + 130;
    buttons[2].x = startX + 260;

    buildGraph();
    computeCentrality();
}

function buildGraph() {
    // 10 employees across 3 departments
    const depts = ['Engineering', 'Product', 'Sales'];
    const deptColors = {
        'Engineering': [92, 107, 192],  // light indigo
        'Product': [212, 136, 15],      // amber
        'Sales': [76, 175, 80]          // green
    };

    const empData = [
        { name: 'Alice', dept: 'Engineering' },
        { name: 'Bob', dept: 'Engineering' },
        { name: 'Carlos', dept: 'Engineering' },
        { name: 'Dana', dept: 'Product' },
        { name: 'Elena', dept: 'Product' },
        { name: 'Frank', dept: 'Product' },
        { name: 'Grace', dept: 'Sales' },
        { name: 'Hiro', dept: 'Sales' },
        { name: 'Ines', dept: 'Sales' },
        { name: 'Jake', dept: 'Engineering' }
    ];

    // Arrange in clusters
    let cx = canvasWidth / 2;
    let cy = (GRAPH_TOP + GRAPH_BOTTOM) / 2;
    let r = 130;

    // Engineering cluster (left)
    let engCx = cx - 160, engCy = cy - 20;
    // Product cluster (right)
    let prodCx = cx + 160, prodCy = cy - 20;
    // Sales cluster (bottom)
    let salesCx = cx, salesCy = cy + 110;

    const positions = [
        { x: engCx - 60, y: engCy - 40 },   // Alice (Eng)
        { x: engCx + 40, y: engCy - 50 },   // Bob (Eng)
        { x: engCx - 20, y: engCy + 50 },   // Carlos (Eng)
        { x: prodCx - 40, y: prodCy - 40 },  // Dana (Prod)
        { x: prodCx + 50, y: prodCy - 30 },  // Elena (Prod)
        { x: prodCx, y: prodCy + 50 },       // Frank (Prod)
        { x: salesCx - 70, y: salesCy },      // Grace (Sales)
        { x: salesCx + 70, y: salesCy },      // Hiro (Sales)
        { x: salesCx, y: salesCy + 50 },      // Ines (Sales)
        { x: engCx + 50, y: engCy + 40 }     // Jake (Eng)
    ];

    for (let i = 0; i < empData.length; i++) {
        nodes.push({
            id: i,
            name: empData[i].name,
            dept: empData[i].dept,
            color: deptColors[empData[i].dept],
            x: positions[i].x,
            y: positions[i].y,
            indegree: 0,
            outdegree: 0,
            total: 0
        });
    }

    // Directed edges: [from, to]
    // Alice=0, Bob=1, Carlos=2, Dana=3, Elena=4, Frank=5, Grace=6, Hiro=7, Ines=8, Jake=9
    const edgeList = [
        // Engineering internal
        [0, 1], [1, 0], [0, 2], [2, 9], [9, 1],
        // Product internal
        [3, 4], [4, 5], [5, 3], [3, 5],
        // Sales internal
        [6, 7], [7, 8], [8, 6],
        // Cross-department: Dana is the bridge (high indegree from many)
        [0, 3], [1, 3], [6, 3], [7, 3],
        // Carlos is a broadcaster (high outdegree)
        [2, 0], [2, 3], [2, 6], [2, 7], [2, 4],
        // Jake connects Engineering-Sales
        [9, 6], [9, 7],
        // Elena reaches out broadly
        [4, 0], [4, 6]
    ];

    for (let e of edgeList) {
        edges.push({ from: e[0], to: e[1] });
    }
}

function computeCentrality() {
    for (let n of nodes) {
        n.indegree = 0;
        n.outdegree = 0;
    }
    for (let e of edges) {
        nodes[e.from].outdegree++;
        nodes[e.to].indegree++;
    }
    for (let n of nodes) {
        n.total = n.indegree + n.outdegree;
    }
}

function getScore(node) {
    if (mode === 'indegree') return node.indegree;
    if (mode === 'outdegree') return node.outdegree;
    return node.total;
}

function getMaxScore() {
    let mx = 1;
    for (let n of nodes) {
        let s = getScore(n);
        if (s > mx) mx = s;
    }
    return mx;
}

function nodeRadius(node) {
    let maxS = getMaxScore();
    let s = getScore(node);
    return map(s, 0, maxS, 14, 36);
}

function nodeColor(node) {
    let maxS = getMaxScore();
    let s = getScore(node);
    let t = s / maxS;
    return [
        lerp(AMBER[0], INDIGO[0], t),
        lerp(AMBER[1], INDIGO[1], t),
        lerp(AMBER[2], INDIGO[2], t)
    ];
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(15);
    text('Degree Centrality Explorer', canvasWidth / 2, 25);

    // Buttons
    drawButtons();

    // Draw edges
    for (let e of edges) {
        drawArrow(nodes[e.from], nodes[e.to]);
    }

    // Draw nodes
    for (let n of nodes) {
        drawNode(n);
    }

    // Draw tooltip
    if (hoveredNode !== null && draggedNode === null) {
        drawTooltip(hoveredNode);
    }

    // Draw rankings
    drawRankings();
}

function drawButtons() {
    for (let b of buttons) {
        let isActive = (mode === b.mode);
        let isHover = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;

        if (isActive) {
            fill(...INDIGO);
        } else if (isHover) {
            fill(92, 107, 192);
        } else {
            fill(180);
        }
        stroke(40);
        strokeWeight(1);
        rect(b.x, b.y, b.w, b.h, 6);

        fill(isActive ? 255 : 50);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(13);
        text(b.label, b.x + b.w / 2, b.y + b.h / 2);
    }
}

function drawArrow(fromN, toN) {
    let r = nodeRadius(toN);
    let dx = toN.x - fromN.x;
    let dy = toN.y - fromN.y;
    let dist = sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    let ux = dx / dist;
    let uy = dy / dist;

    let fromR = nodeRadius(fromN);
    let x1 = fromN.x + ux * fromR;
    let y1 = fromN.y + uy * fromR;
    let x2 = toN.x - ux * (r + 6);
    let y2 = toN.y - uy * (r + 6);

    stroke(160);
    strokeWeight(1.5);
    line(x1, y1, x2, y2);

    // Arrowhead
    let aSize = 8;
    let angle = atan2(y2 - y1, x2 - x1);
    fill(160);
    noStroke();
    push();
    translate(x2, y2);
    rotate(angle);
    triangle(0, 0, -aSize, -aSize / 2.5, -aSize, aSize / 2.5);
    pop();
}

function drawNode(n) {
    let r = nodeRadius(n);
    let col = nodeColor(n);
    let isHovered = (hoveredNode === n);

    // Glow on hover
    if (isHovered) {
        noStroke();
        fill(...GOLD, 60);
        ellipse(n.x, n.y, r * 2 + 16);
    }

    // Node circle
    stroke(isHovered ? GOLD : [80, 80, 80]);
    strokeWeight(isHovered ? 3 : 1.5);
    fill(...col);
    ellipse(n.x, n.y, r * 2);

    // Label
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(constrain(r * 0.65, 9, 14));
    text(n.name, n.x, n.y);
}

function drawTooltip(n) {
    let tw = 180;
    let th = 76;
    let tx = n.x + nodeRadius(n) + 12;
    let ty = n.y - th / 2;

    // Keep on screen
    if (tx + tw > canvasWidth - 10) tx = n.x - nodeRadius(n) - tw - 12;
    if (ty < GRAPH_TOP) ty = GRAPH_TOP;
    if (ty + th > GRAPH_BOTTOM) ty = GRAPH_BOTTOM - th;

    fill(255, 252, 240);
    stroke(180);
    strokeWeight(1);
    rect(tx, ty, tw, th, 6);

    fill(30);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(13);
    text(n.name + ' (' + n.dept + ')', tx + 8, ty + 6);
    textSize(11);
    fill(80);
    text('Indegree:   ' + n.indegree, tx + 8, ty + 26);
    text('Outdegree:  ' + n.outdegree, tx + 8, ty + 42);
    text('Total:      ' + n.total, tx + 8, ty + 58);

    // Highlight current mode
    let modeY = mode === 'indegree' ? ty + 26 : mode === 'outdegree' ? ty + 42 : ty + 58;
    noFill();
    stroke(...AMBER);
    strokeWeight(2);
    rect(tx + 4, modeY - 2, tw - 8, 14, 3);
}

function drawRankings() {
    // Background
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(10, RANKING_TOP, canvasWidth - 20, canvasHeight - RANKING_TOP - 10, 8);

    // Title
    fill(30);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(13);
    let modeLabel = mode === 'indegree' ? 'Indegree' : mode === 'outdegree' ? 'Outdegree' : 'Total Degree';
    text('Top 5 by ' + modeLabel + ':', 24, RANKING_TOP + 10);

    // Sort and show top 5
    let sorted = [...nodes].sort((a, b) => getScore(b) - getScore(a));
    let top5 = sorted.slice(0, 5);

    let barX = 24;
    let barY = RANKING_TOP + 32;
    let maxBarW = canvasWidth - 160;
    let maxS = getMaxScore();

    for (let i = 0; i < top5.length; i++) {
        let n = top5[i];
        let s = getScore(n);
        let bw = (s / maxS) * maxBarW;

        // Bar
        let col = nodeColor(n);
        fill(...col);
        noStroke();
        rect(barX + 80, barY + i * 28, bw, 20, 4);

        // Label
        fill(50);
        textAlign(RIGHT, CENTER);
        textSize(12);
        text(n.name, barX + 72, barY + i * 28 + 10);

        // Score
        fill(255);
        textAlign(LEFT, CENTER);
        text(s, barX + 86, barY + i * 28 + 10);
    }
}

function mousePressed() {
    // Check buttons
    for (let b of buttons) {
        if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
            mode = b.mode;
            return;
        }
    }

    // Check node drag
    for (let n of nodes) {
        let d = dist(mouseX, mouseY, n.x, n.y);
        if (d < nodeRadius(n)) {
            draggedNode = n;
            dragOffsetX = n.x - mouseX;
            dragOffsetY = n.y - mouseY;
            return;
        }
    }
}

function mouseDragged() {
    if (draggedNode) {
        draggedNode.x = mouseX + dragOffsetX;
        draggedNode.y = mouseY + dragOffsetY;
    }
}

function mouseReleased() {
    draggedNode = null;
}

function mouseMoved() {
    hoveredNode = null;
    for (let n of nodes) {
        let d = dist(mouseX, mouseY, n.x, n.y);
        if (d < nodeRadius(n)) {
            hoveredNode = n;
            break;
        }
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    // Reposition buttons
    let totalW = 110 + 110 + 120 + 20;
    let startX = (canvasWidth - totalW) / 2;
    buttons[0].x = startX;
    buttons[1].x = startX + 130;
    buttons[2].x = startX + 260;
}
