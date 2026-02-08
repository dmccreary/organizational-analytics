// Similarity Comparison - p5.js MicroSim
// Interactive Jaccard vs Cosine similarity on an 8-node weighted network

let canvasWidth = 900;
const canvasHeight = 520;

const INDIGO = [48, 63, 159];
const INDIGO_LIGHT = [92, 107, 192];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

let nodes = [];
let edges = [];
let adjWeights = {}; // adjWeights[i][j] = weight

let selectedA = null; // first selected node
let selectedB = null; // second selected node
let hoveredNode = null;
let draggedNode = null;
let dragOffsetX = 0, dragOffsetY = 0;

let showWeights = false;

const GRAPH_BOTTOM = 260;
const PANEL_TOP = 275;

// Buttons
let btnToggle, btnReset;

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');

    buildGraph();
    layoutButtons();
}

function layoutButtons() {
    let bh = 28;
    btnToggle = { label: 'Show Weights', x: canvasWidth - 240, y: 12, w: 110, h: bh };
    btnReset = { label: 'Reset', x: canvasWidth - 115, y: 12, w: 70, h: bh };
}

function buildGraph() {
    // 8 employees with weighted edges designed so Jaccard and cosine diverge
    const empData = [
        { name: 'Alice', dept: 'Eng' },
        { name: 'Bob', dept: 'Eng' },
        { name: 'Carlos', dept: 'Eng' },
        { name: 'Dana', dept: 'Product' },
        { name: 'Elena', dept: 'Product' },
        { name: 'Frank', dept: 'Sales' },
        { name: 'Grace', dept: 'Sales' },
        { name: 'Hiro', dept: 'Ops' }
    ];

    let cx = canvasWidth / 2;
    let cy = 155;
    let rx = min(canvasWidth * 0.32, 260);
    let ry = 95;

    for (let i = 0; i < empData.length; i++) {
        let angle = -PI / 2 + (TWO_PI * i) / empData.length;
        nodes.push({
            id: i,
            name: empData[i].name,
            dept: empData[i].dept,
            x: cx + rx * cos(angle),
            y: cy + ry * sin(angle)
        });
    }

    // Weighted edges - designed so Alice-Bob have high Jaccard but different cosine vs Alice-Dana
    const edgeList = [
        // Alice(0) connects: Bob(1) w=2, Carlos(2) w=8, Dana(3) w=3, Hiro(7) w=1
        [0, 1, 2], [0, 2, 8], [0, 3, 3], [0, 7, 1],
        // Bob(1) connects: Carlos(2) w=7, Dana(3) w=4, Elena(4) w=2
        [1, 2, 7], [1, 3, 4], [1, 4, 2],
        // Carlos(2) connects: Dana(3) w=1
        [2, 3, 1],
        // Dana(3) connects: Elena(4) w=9, Frank(5) w=3
        [3, 4, 9], [3, 5, 3],
        // Elena(4) connects: Frank(5) w=6, Grace(6) w=4
        [4, 5, 6], [4, 6, 4],
        // Frank(5) connects: Grace(6) w=8, Hiro(7) w=2
        [5, 6, 8], [5, 7, 2],
        // Grace(6) connects: Hiro(7) w=5
        [6, 7, 5]
    ];

    // Build adjacency weight map
    for (let i = 0; i < 8; i++) adjWeights[i] = {};

    for (let e of edgeList) {
        edges.push({ from: e[0], to: e[1], weight: e[2] });
        adjWeights[e[0]][e[1]] = e[2];
        adjWeights[e[1]][e[0]] = e[2];
    }
}

function getNeighbors(nodeId) {
    let nbrs = new Set();
    for (let j in adjWeights[nodeId]) {
        nbrs.add(parseInt(j));
    }
    return nbrs;
}

function computeJaccard(a, b) {
    let nA = getNeighbors(a);
    let nB = getNeighbors(b);
    // Remove a and b from each other's sets for neighbor-based similarity
    nA.delete(b);
    nB.delete(a);

    let intersection = new Set([...nA].filter(x => nB.has(x)));
    let unionSet = new Set([...nA, ...nB]);

    if (unionSet.size === 0) return { score: 0, intersection: [], unionSet: [], setA: [], setB: [] };

    return {
        score: intersection.size / unionSet.size,
        intersection: [...intersection],
        unionSet: [...unionSet],
        setA: [...nA],
        setB: [...nB]
    };
}

function computeCosine(a, b) {
    // Build weight vectors over all nodes (excluding a and b themselves)
    let allNodes = [];
    for (let i = 0; i < nodes.length; i++) {
        if (i !== a && i !== b) allNodes.push(i);
    }

    let vecA = allNodes.map(n => adjWeights[a][n] || 0);
    let vecB = allNodes.map(n => adjWeights[b][n] || 0);

    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }
    magA = sqrt(magA);
    magB = sqrt(magB);

    let score = (magA > 0 && magB > 0) ? dot / (magA * magB) : 0;

    return {
        score: score,
        dot: dot,
        magA: magA,
        magB: magB,
        vecA: vecA,
        vecB: vecB,
        nodeLabels: allNodes.map(n => nodes[n].name)
    };
}

function draw() {
    background(245);

    // Title
    fill(...INDIGO);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(16);
    text('Jaccard vs Cosine Similarity', 20, 26);

    // Instructions
    fill(120);
    textSize(11);
    if (!selectedA) {
        text('Click a node to select the first employee', 20, 48);
    } else if (!selectedB) {
        text('Click a second node to compare with ' + nodes[selectedA].name, 20, 48);
    } else {
        text('Comparing: ' + nodes[selectedA].name + ' and ' + nodes[selectedB].name, 20, 48);
    }

    drawButtons();
    drawGraph();

    if (selectedA !== null && selectedB !== null) {
        drawJaccardPanel();
        drawCosinePanel();
    } else {
        // Empty panels
        drawEmptyPanels();
    }

    // Tooltip
    if (hoveredNode !== null && !draggedNode) {
        drawTooltip(hoveredNode);
    }
}

function drawGraph() {
    let jaccard = null;
    if (selectedA !== null && selectedB !== null) {
        jaccard = computeJaccard(selectedA, selectedB);
    }

    // Draw edges
    for (let e of edges) {
        let fromNode = nodes[e.from];
        let toNode = nodes[e.to];

        let isHighlighted = false;
        let isDimmed = false;

        if (selectedA !== null && selectedB !== null && jaccard) {
            let sharedSet = new Set(jaccard.intersection);
            let isConnectedToA = (e.from === selectedA || e.to === selectedA);
            let isConnectedToB = (e.from === selectedB || e.to === selectedB);
            let otherA = isConnectedToA ? (e.from === selectedA ? e.to : e.from) : -1;
            let otherB = isConnectedToB ? (e.from === selectedB ? e.to : e.from) : -1;

            if (isConnectedToA && sharedSet.has(otherA)) {
                isHighlighted = true;
            } else if (isConnectedToB && sharedSet.has(otherB)) {
                isHighlighted = true;
            } else if (isConnectedToA || isConnectedToB) {
                // connected to selection but not shared
            } else {
                isDimmed = true;
            }
        }

        if (isDimmed) {
            stroke(220);
            strokeWeight(1);
        } else if (isHighlighted) {
            stroke(...GOLD);
            strokeWeight(3);
        } else {
            stroke(170);
            strokeWeight(1.5);
        }
        line(fromNode.x, fromNode.y, toNode.x, toNode.y);

        // Weight label
        if (showWeights) {
            let mx = (fromNode.x + toNode.x) / 2;
            let my = (fromNode.y + toNode.y) / 2;
            noStroke();
            fill(isHighlighted ? [180, 120, 0] : [120]);
            textAlign(CENTER, CENTER);
            textSize(10);
            text(e.weight, mx, my - 6);
        }
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
        let n = nodes[i];
        let r = 20;
        let isSelected = (i === selectedA || i === selectedB);
        let isShared = false;
        let isDimmed = false;

        if (selectedA !== null && selectedB !== null && jaccard) {
            isShared = jaccard.intersection.includes(i);
            let isInUnion = jaccard.unionSet.includes(i);
            if (!isSelected && !isInUnion) isDimmed = true;
        }

        let isHov = (hoveredNode === i);

        if (isHov) {
            noStroke();
            fill(...GOLD, 60);
            ellipse(n.x, n.y, r + 22);
        }

        // Node fill
        if (i === selectedA) {
            fill(...AMBER);
            stroke(...AMBER);
            strokeWeight(3);
        } else if (i === selectedB) {
            fill(...GOLD);
            stroke(200, 170, 0);
            strokeWeight(3);
        } else if (isShared) {
            fill(...GOLD, 180);
            stroke(...AMBER);
            strokeWeight(2.5);
        } else if (isDimmed) {
            fill(200);
            stroke(180);
            strokeWeight(1);
        } else {
            fill(...INDIGO_LIGHT);
            stroke(60);
            strokeWeight(1.5);
        }
        ellipse(n.x, n.y, r * 2);

        // Name
        fill(isSelected || isShared ? 40 : 255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(11);
        text(n.name, n.x, n.y);
    }
}

function drawJaccardPanel() {
    let pw = canvasWidth / 2 - 25;
    let px = 15;
    let py = PANEL_TOP;
    let ph = canvasHeight - PANEL_TOP - 10;

    // Panel background
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(px, py, pw, ph, 8);

    // Header
    fill(...INDIGO);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(14);
    textStyle(BOLD);
    text('Jaccard Similarity', px + 12, py + 8);
    textStyle(NORMAL);

    let j = computeJaccard(selectedA, selectedB);

    // Score
    fill(60);
    textSize(12);
    text('Score: ', px + 12, py + 30);
    fill(...INDIGO);
    textSize(16);
    textStyle(BOLD);
    text(nf(j.score, 0, 3), px + 60, py + 28);
    textStyle(NORMAL);

    // Venn diagram
    let vx1 = px + pw * 0.35;
    let vx2 = px + pw * 0.65;
    let vy = py + ph * 0.55;
    let vr = min(pw * 0.28, 70);

    // Circle A
    noStroke();
    fill(AMBER[0], AMBER[1], AMBER[2], 60);
    ellipse(vx1, vy, vr * 2);

    // Circle B
    fill(GOLD[0], GOLD[1], GOLD[2], 60);
    ellipse(vx2, vy, vr * 2);

    // Labels
    fill(80);
    textAlign(CENTER, CENTER);
    textSize(10);
    text(nodes[selectedA].name, vx1 - vr * 0.4, vy - vr - 12);
    text(nodes[selectedB].name, vx2 + vr * 0.4, vy - vr - 12);

    // Set members
    let onlyA = j.setA.filter(x => !j.intersection.includes(x));
    let onlyB = j.setB.filter(x => !j.intersection.includes(x));

    textSize(9);
    fill(120);
    // Only A
    for (let i = 0; i < onlyA.length; i++) {
        text(nodes[onlyA[i]].name, vx1 - vr * 0.45, vy - 10 + i * 14);
    }
    // Only B
    for (let i = 0; i < onlyB.length; i++) {
        text(nodes[onlyB[i]].name, vx2 + vr * 0.45, vy - 10 + i * 14);
    }
    // Intersection
    fill(...AMBER);
    textStyle(BOLD);
    for (let i = 0; i < j.intersection.length; i++) {
        text(nodes[j.intersection[i]].name, (vx1 + vx2) / 2, vy - 10 + i * 14);
    }
    textStyle(NORMAL);

    // Formula
    fill(80);
    textAlign(CENTER, CENTER);
    textSize(11);
    let formulaY = py + ph - 22;
    text('|A' + String.fromCharCode(8745) + 'B| / |A' + String.fromCharCode(8746) + 'B| = ' +
         j.intersection.length + ' / ' + j.unionSet.length + ' = ' + nf(j.score, 0, 3),
         px + pw / 2, formulaY);
}

function drawCosinePanel() {
    let pw = canvasWidth / 2 - 25;
    let px = canvasWidth / 2 + 10;
    let py = PANEL_TOP;
    let ph = canvasHeight - PANEL_TOP - 10;

    // Panel background
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(px, py, pw, ph, 8);

    // Header
    fill(...INDIGO);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(14);
    textStyle(BOLD);
    text('Cosine Similarity', px + 12, py + 8);
    textStyle(NORMAL);

    let c = computeCosine(selectedA, selectedB);

    // Score
    fill(60);
    textSize(12);
    text('Score: ', px + 12, py + 30);
    fill(...INDIGO);
    textSize(16);
    textStyle(BOLD);
    text(nf(c.score, 0, 3), px + 60, py + 28);
    textStyle(NORMAL);

    // Vector visualization: show weight vectors as bar charts
    let chartX = px + 20;
    let chartY = py + 60;
    let barMaxW = pw - 60;
    let barH = 12;
    let gap = 4;
    let maxW = 0;
    for (let i = 0; i < c.vecA.length; i++) {
        maxW = max(maxW, c.vecA[i], c.vecB[i]);
    }
    if (maxW === 0) maxW = 1;

    fill(80);
    textAlign(LEFT, CENTER);
    textSize(9);

    let labelsX = chartX;
    let barsX = chartX + 50;
    let availBarW = barMaxW - 55;

    for (let i = 0; i < c.nodeLabels.length; i++) {
        let yPos = chartY + i * (barH * 2 + gap * 2 + 2);

        // Label
        fill(80);
        noStroke();
        textAlign(LEFT, CENTER);
        textSize(9);
        text(c.nodeLabels[i], labelsX, yPos + barH / 2);

        // Bar A
        let wA = (c.vecA[i] / maxW) * availBarW;
        fill(AMBER[0], AMBER[1], AMBER[2], 180);
        noStroke();
        if (wA > 0) rect(barsX, yPos, wA, barH, 2);

        if (c.vecA[i] > 0) {
            fill(80);
            textSize(8);
            textAlign(LEFT, CENTER);
            text(c.vecA[i], barsX + wA + 3, yPos + barH / 2);
        }

        // Bar B
        let wB = (c.vecB[i] / maxW) * availBarW;
        fill(GOLD[0], GOLD[1], GOLD[2], 180);
        if (wB > 0) rect(barsX, yPos + barH + 2, wB, barH, 2);

        if (c.vecB[i] > 0) {
            fill(80);
            textSize(8);
            textAlign(LEFT, CENTER);
            text(c.vecB[i], barsX + wB + 3, yPos + barH + 2 + barH / 2);
        }
    }

    // Formula at bottom
    fill(80);
    textAlign(CENTER, CENTER);
    textSize(10);
    let formulaY = py + ph - 32;
    text('A' + String.fromCharCode(183) + 'B / (||A|| ' + String.fromCharCode(215) + ' ||B||)', px + pw / 2, formulaY);
    textSize(10);
    text(nf(c.dot, 0, 1) + ' / (' + nf(c.magA, 0, 2) + ' ' + String.fromCharCode(215) + ' ' + nf(c.magB, 0, 2) + ') = ' + nf(c.score, 0, 3),
         px + pw / 2, formulaY + 16);
}

function drawEmptyPanels() {
    let pw = canvasWidth / 2 - 25;
    let ph = canvasHeight - PANEL_TOP - 10;

    // Left panel
    fill(250);
    stroke(200);
    strokeWeight(1);
    rect(15, PANEL_TOP, pw, ph, 8);
    fill(160);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(13);
    text('Jaccard Similarity', 15 + pw / 2, PANEL_TOP + ph / 2 - 10);
    textSize(11);
    text('Select two nodes to compare', 15 + pw / 2, PANEL_TOP + ph / 2 + 10);

    // Right panel
    fill(250);
    stroke(200);
    strokeWeight(1);
    let px = canvasWidth / 2 + 10;
    rect(px, PANEL_TOP, pw, ph, 8);
    fill(160);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(13);
    text('Cosine Similarity', px + pw / 2, PANEL_TOP + ph / 2 - 10);
    textSize(11);
    text('Select two nodes to compare', px + pw / 2, PANEL_TOP + ph / 2 + 10);
}

function drawTooltip(nodeIdx) {
    let n = nodes[nodeIdx];
    let nbrs = getNeighbors(nodeIdx);
    let nbrList = [...nbrs];

    let tw = 160;
    let th = 35 + nbrList.length * 15;
    let tx = n.x + 24;
    let ty = n.y - th / 2;
    if (tx + tw > canvasWidth - 10) tx = n.x - 24 - tw;
    if (ty < 60) ty = 60;
    if (ty + th > GRAPH_BOTTOM) ty = GRAPH_BOTTOM - th;

    fill(255, 252, 240);
    stroke(180);
    strokeWeight(1);
    rect(tx, ty, tw, th, 6);

    fill(30);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(12);
    textStyle(BOLD);
    text(n.name + ' (' + n.dept + ')', tx + 8, ty + 6);
    textStyle(NORMAL);

    fill(80);
    textSize(10);
    for (let i = 0; i < nbrList.length; i++) {
        let w = adjWeights[nodeIdx][nbrList[i]];
        text(nodes[nbrList[i]].name + ' (w=' + w + ')', tx + 12, ty + 24 + i * 15);
    }
}

function drawButtons() {
    // Toggle weights button
    let b = btnToggle;
    let isHov = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
    fill(showWeights ? AMBER : (isHov ? INDIGO_LIGHT : INDIGO));
    stroke(40);
    strokeWeight(1);
    rect(b.x, b.y, b.w, b.h, 6);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);
    text(showWeights ? 'Hide Weights' : 'Show Weights', b.x + b.w / 2, b.y + b.h / 2);

    // Reset button
    b = btnReset;
    isHov = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
    fill(isHov ? INDIGO_LIGHT : INDIGO);
    stroke(40);
    strokeWeight(1);
    rect(b.x, b.y, b.w, b.h, 6);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);
    text('Reset', b.x + b.w / 2, b.y + b.h / 2);
}

function mousePressed() {
    // Check toggle button
    let b = btnToggle;
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
        showWeights = !showWeights;
        return;
    }

    // Check reset button
    b = btnReset;
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
        selectedA = null;
        selectedB = null;
        return;
    }

    // Check node clicks (only in graph area)
    if (mouseY < GRAPH_BOTTOM + 20) {
        for (let i = 0; i < nodes.length; i++) {
            if (dist(mouseX, mouseY, nodes[i].x, nodes[i].y) < 20) {
                if (selectedA === null) {
                    selectedA = i;
                } else if (selectedB === null && i !== selectedA) {
                    selectedB = i;
                } else {
                    // Reset and start new selection
                    selectedA = i;
                    selectedB = null;
                }

                // Don't start dragging when selecting
                return;
            }
        }

        // Drag detection (only if not clicking a node for selection)
        for (let i = 0; i < nodes.length; i++) {
            if (dist(mouseX, mouseY, nodes[i].x, nodes[i].y) < 20) {
                draggedNode = i;
                dragOffsetX = nodes[i].x - mouseX;
                dragOffsetY = nodes[i].y - mouseY;
                return;
            }
        }
    }
}

function mouseDragged() {
    if (draggedNode !== null) {
        nodes[draggedNode].x = mouseX + dragOffsetX;
        nodes[draggedNode].y = mouseY + dragOffsetY;
    }
}

function mouseReleased() {
    draggedNode = null;
}

function mouseMoved() {
    hoveredNode = null;
    for (let i = 0; i < nodes.length; i++) {
        if (dist(mouseX, mouseY, nodes[i].x, nodes[i].y) < 20) {
            hoveredNode = i;
            break;
        }
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    layoutButtons();
}
