// Inclusion Network Map - p5.js MicroSim
// Compares segregated vs integrated communication networks
// Nodes colored by demographic group, edges styled by cross-group status

let canvasWidth = 900;
const drawHeight = 500;
const controlHeight = 50;
const canvasHeight = drawHeight + controlHeight;

// Aria color theme
const INDIGO = [48, 63, 159];
const INDIGO_LIGHT = [92, 107, 192];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// Group colors
const GROUP_COLORS = {
    'A': [48, 63, 159],    // indigo
    'B': [212, 136, 15],   // amber
    'C': [255, 215, 0],    // gold
    'D': [76, 175, 80]     // green
};

const GROUP_NAMES = {
    'A': 'Group A (Indigo)',
    'B': 'Group B (Amber)',
    'C': 'Group C (Gold)',
    'D': 'Group D (Green)'
};

// State
let nodes = [];
let segregatedEdges = [];
let integratedEdges = [];
let currentEdges = [];
let isIntegrated = false;
let transitionProgress = 0; // 0 = segregated, 1 = integrated
let transitioning = false;

let hoveredNode = null;
let selectedNode = null;
let draggedNode = null;
let dragOffsetX = 0, dragOffsetY = 0;
let mouseOverCanvas = false;

// Physics
const REPULSION = 2500;
const SPRING_LENGTH = 80;
const SPRING_K = 0.004;
const DAMPING = 0.82;
const GRAVITY = 0.003;
let simulationActive = true;
let framesSinceInteraction = 0;

// Layout bounds
const GRAPH_TOP = 40;
const GRAPH_BOTTOM = drawHeight;

// Toggle button
let toggleBtn = { x: 0, y: 0, w: 180, h: 32 };

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');

    buildData();
    setTargetPositions();
    // Initialize nodes at segregated positions
    for (let n of nodes) {
        n.x = n.segX;
        n.y = n.segY;
    }
    currentEdges = segregatedEdges.slice();
    computeMetrics();
}

// ---- Data Generation ----

function buildData() {
    let names = [
        // Group A (10 nodes) - indigo
        'Alice', 'Alex', 'Amir', 'Andrea', 'Aaron',
        'Angela', 'Arthur', 'Ava', 'Adrian', 'Alicia',
        // Group B (9 nodes) - amber
        'Ben', 'Bianca', 'Blake', 'Brenda', 'Brian',
        'Bethany', 'Boris', 'Bridget', 'Brent',
        // Group C (7 nodes) - gold
        'Carmen', 'Carlos', 'Chloe', 'Chris', 'Clara',
        'Craig', 'Celeste',
        // Group D (6 nodes) - green
        'Diana', 'David', 'Derek', 'Dalia', 'Drew', 'Dina'
    ];

    let groups = [];
    for (let i = 0; i < 10; i++) groups.push('A');
    for (let i = 0; i < 9; i++) groups.push('B');
    for (let i = 0; i < 7; i++) groups.push('C');
    for (let i = 0; i < 6; i++) groups.push('D');

    for (let i = 0; i < names.length; i++) {
        nodes.push({
            id: i,
            name: names[i],
            group: groups[i],
            x: 0, y: 0,
            vx: 0, vy: 0,
            segX: 0, segY: 0,
            intX: 0, intY: 0,
            targetX: 0, targetY: 0,
            degree: 0,
            integrationScore: 0,
            crossGroupEdges: 0,
            totalEdges: 0
        });
    }

    // Segregated edges (~60): mostly within-group, few cross-group
    segregatedEdges = [
        // Group A internal (dense, 20 edges)
        [0, 1], [0, 2], [0, 3], [1, 2], [1, 4], [2, 3],
        [3, 5], [4, 5], [4, 6], [5, 7], [6, 7], [6, 8],
        [7, 8], [8, 9], [0, 9], [1, 5], [3, 6], [2, 8],
        [0, 4], [5, 9],
        // Group B internal (moderate, 16 edges)
        [10, 11], [10, 12], [11, 13], [12, 13], [12, 14],
        [13, 15], [14, 15], [14, 16], [15, 17], [16, 17],
        [10, 14], [11, 16], [13, 18], [16, 18], [10, 17],
        [11, 14],
        // Group C internal (moderate, 10 edges)
        [19, 20], [20, 21], [21, 22], [22, 23], [19, 21],
        [23, 24], [24, 25], [20, 23], [19, 24], [22, 25],
        // Group D internal (sparse, peripheral, 7 edges)
        [26, 27], [27, 28], [28, 29], [29, 30],
        [26, 28], [30, 31], [27, 31],
        // Cross-group (very few, 8 edges)
        [0, 10],  // A-B
        [4, 13],  // A-B
        [9, 19],  // A-C
        [15, 22], // B-C
        [14, 27], // B-D
        [23, 29], // C-D
        [2, 26],  // A-D
        [6, 11],  // A-B
    ];

    // Integrated edges (~75): balanced within and cross-group
    integratedEdges = [
        // Group A internal (12 edges)
        [0, 1], [0, 3], [1, 2], [2, 4], [3, 5],
        [4, 6], [5, 7], [6, 8], [7, 9], [0, 9],
        [1, 5], [3, 8],
        // Group B internal (9 edges)
        [10, 11], [11, 13], [12, 14], [13, 15],
        [14, 16], [15, 17], [16, 18], [10, 16],
        [12, 18],
        // Group C internal (7 edges)
        [19, 20], [20, 21], [21, 22], [22, 23],
        [23, 24], [24, 25], [19, 23],
        // Group D internal (6 edges)
        [26, 27], [27, 28], [28, 29], [29, 30],
        [30, 31], [26, 30],
        // Cross-group A-B (9 edges)
        [0, 10], [1, 12], [2, 14], [3, 11], [4, 13],
        [5, 15], [7, 17], [9, 18], [8, 16],
        // Cross-group A-C (6 edges)
        [0, 19], [2, 21], [6, 22], [8, 24], [9, 20],
        [4, 25],
        // Cross-group A-D (5 edges)
        [1, 26], [3, 28], [5, 30], [7, 31], [6, 29],
        // Cross-group B-C (6 edges)
        [10, 20], [12, 23], [14, 25], [16, 21], [18, 19],
        [13, 24],
        // Cross-group B-D (5 edges)
        [11, 27], [13, 29], [15, 31], [17, 26], [18, 28],
        // Cross-group C-D (6 edges)
        [19, 27], [21, 29], [23, 31], [25, 26], [22, 30],
        [20, 28],
    ];
}

function setTargetPositions() {
    let cx = canvasWidth / 2;
    let cy = (GRAPH_TOP + GRAPH_BOTTOM) / 2;

    // Segregated positions: clustered by group in four quadrants
    let clusterCenters = {
        'A': { x: cx - canvasWidth * 0.2, y: cy - 100 },
        'B': { x: cx + canvasWidth * 0.2, y: cy - 100 },
        'C': { x: cx - canvasWidth * 0.15, y: cy + 120 },
        'D': { x: cx + canvasWidth * 0.2, y: cy + 130 }
    };

    // Place nodes in tight clusters for segregated view
    let groupCounters = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
    for (let n of nodes) {
        let center = clusterCenters[n.group];
        let idx = groupCounters[n.group]++;
        let angle = idx * 2.399 + 0.5; // golden angle
        let r = 30 + (idx % 4) * 22;
        n.segX = center.x + cos(angle) * r;
        n.segY = center.y + sin(angle) * r;
    }

    // Integrated positions: mixed throughout the canvas
    let totalNodes = nodes.length;
    let cols = Math.ceil(Math.sqrt(totalNodes * (canvasWidth / (GRAPH_BOTTOM - GRAPH_TOP))));
    let rows = Math.ceil(totalNodes / cols);

    // Shuffle indices for mixed placement
    let indices = [];
    for (let i = 0; i < totalNodes; i++) indices.push(i);
    // Deterministic shuffle using a simple seed
    for (let i = indices.length - 1; i > 0; i--) {
        let j = (i * 7 + 3) % (i + 1);
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    let marginX = canvasWidth * 0.1;
    let marginY = 60;
    let usableW = canvasWidth - marginX * 2;
    let usableH = (GRAPH_BOTTOM - GRAPH_TOP) - marginY * 2;

    for (let k = 0; k < totalNodes; k++) {
        let ni = indices[k];
        let col = k % cols;
        let row = Math.floor(k / cols);
        let jitterX = ((ni * 13 + 7) % 30) - 15;
        let jitterY = ((ni * 17 + 11) % 30) - 15;
        nodes[ni].intX = marginX + (col + 0.5) * (usableW / cols) + jitterX;
        nodes[ni].intY = GRAPH_TOP + marginY + (row + 0.5) * (usableH / rows) + jitterY;
    }

    // Set initial targets to segregated
    for (let n of nodes) {
        n.targetX = n.segX;
        n.targetY = n.segY;
    }
}

// ---- Metrics ----

function computeMetrics() {
    // Reset
    for (let n of nodes) {
        n.degree = 0;
        n.crossGroupEdges = 0;
        n.totalEdges = 0;
    }

    for (let e of currentEdges) {
        let a = nodes[e[0]];
        let b = nodes[e[1]];
        a.degree++;
        b.degree++;
        a.totalEdges++;
        b.totalEdges++;
        if (a.group !== b.group) {
            a.crossGroupEdges++;
            b.crossGroupEdges++;
        }
    }

    // Integration score per node: ratio of cross-group edges to total edges
    for (let n of nodes) {
        n.integrationScore = n.totalEdges > 0 ? n.crossGroupEdges / n.totalEdges : 0;
    }
}

function getOverallIntegrationScore() {
    let totalCross = 0;
    let totalEdges = currentEdges.length;
    for (let e of currentEdges) {
        if (nodes[e[0]].group !== nodes[e[1]].group) totalCross++;
    }
    return totalEdges > 0 ? totalCross / totalEdges : 0;
}

function getCrossGroupRatio() {
    let totalCross = 0;
    for (let e of currentEdges) {
        if (nodes[e[0]].group !== nodes[e[1]].group) totalCross++;
    }
    return totalCross + ' / ' + currentEdges.length;
}

function getCentralityEquity() {
    // Ratio of min group avg degree to max group avg degree
    let groupDegrees = { 'A': [], 'B': [], 'C': [], 'D': [] };
    for (let n of nodes) {
        groupDegrees[n.group].push(n.degree);
    }
    let groupAvgs = {};
    let minAvg = Infinity, maxAvg = 0;
    for (let g in groupDegrees) {
        let arr = groupDegrees[g];
        let avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        groupAvgs[g] = avg;
        if (avg < minAvg) minAvg = avg;
        if (avg > maxAvg) maxAvg = avg;
    }
    return maxAvg > 0 ? minAvg / maxAvg : 0;
}

// ---- Node sizing ----

function nodeRadius(node) {
    // Size proportional to degree: range 8-20
    let maxDeg = 0;
    for (let n of nodes) {
        if (n.degree > maxDeg) maxDeg = n.degree;
    }
    if (maxDeg === 0) maxDeg = 1;
    return map(node.degree, 0, maxDeg, 8, 20);
}

// ---- Force-Directed Layout ----

function applyForces() {
    if (!simulationActive && !transitioning) return;

    let cx = canvasWidth / 2;
    let cy = (GRAPH_TOP + GRAPH_BOTTOM) / 2;

    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i] === draggedNode) continue;

        let fx = 0, fy = 0;

        // Repulsion between all nodes
        for (let j = 0; j < nodes.length; j++) {
            if (i === j) continue;
            let dx = nodes[i].x - nodes[j].x;
            let dy = nodes[i].y - nodes[j].y;
            let d = Math.sqrt(dx * dx + dy * dy);
            if (d < 1) d = 1;
            let force = REPULSION / (d * d);
            fx += (dx / d) * force;
            fy += (dy / d) * force;
        }

        // Spring force along edges
        for (let e of currentEdges) {
            let other = -1;
            if (e[0] === i) other = e[1];
            else if (e[1] === i) other = e[0];
            if (other < 0) continue;

            let dx = nodes[other].x - nodes[i].x;
            let dy = nodes[other].y - nodes[i].y;
            let d = Math.sqrt(dx * dx + dy * dy);
            if (d < 1) d = 1;
            let displacement = d - SPRING_LENGTH;
            fx += (dx / d) * displacement * SPRING_K;
            fy += (dy / d) * displacement * SPRING_K;
        }

        // Gravity toward target position (stronger during transition)
        let gravStrength = transitioning ? 0.03 : GRAVITY;
        fx += (nodes[i].targetX - nodes[i].x) * gravStrength;
        fy += (nodes[i].targetY - nodes[i].y) * gravStrength;

        nodes[i].vx = (nodes[i].vx + fx) * DAMPING;
        nodes[i].vy = (nodes[i].vy + fy) * DAMPING;
    }

    // Apply velocities and constrain
    let totalMovement = 0;
    for (let node of nodes) {
        if (node === draggedNode) continue;
        node.x += node.vx;
        node.y += node.vy;
        totalMovement += Math.abs(node.vx) + Math.abs(node.vy);

        let r = nodeRadius(node);
        node.x = constrain(node.x, r + 10, canvasWidth - r - 10);
        node.y = constrain(node.y, GRAPH_TOP + r + 5, GRAPH_BOTTOM - r - 5);
    }

    framesSinceInteraction++;
    if (!transitioning && framesSinceInteraction > 300 && totalMovement < 0.5) {
        simulationActive = false;
    }
}

// ---- Transition ----

function startTransition() {
    isIntegrated = !isIntegrated;
    transitioning = true;
    transitionProgress = 0;

    // Set new targets
    for (let n of nodes) {
        n.targetX = isIntegrated ? n.intX : n.segX;
        n.targetY = isIntegrated ? n.intY : n.segY;
    }

    simulationActive = true;
    framesSinceInteraction = 0;
}

function updateTransition() {
    if (!transitioning) return;

    transitionProgress += 0.02;
    if (transitionProgress >= 1) {
        transitionProgress = 1;
        transitioning = false;
        currentEdges = isIntegrated ? integratedEdges.slice() : segregatedEdges.slice();
        computeMetrics();
        return;
    }

    // Interpolate edges: blend between the two sets
    // During first half, fade out old exclusive edges; during second half, fade in new ones
    if (transitionProgress < 0.5) {
        currentEdges = (isIntegrated ? segregatedEdges : integratedEdges).slice();
    } else {
        currentEdges = (isIntegrated ? integratedEdges : segregatedEdges).slice();
    }
    computeMetrics();
}

// ---- Edge color blending ----

function blendColors(c1, c2, t) {
    return [
        lerp(c1[0], c2[0], t),
        lerp(c1[1], c2[1], t),
        lerp(c1[2], c2[2], t)
    ];
}

function getEdgeColor(e) {
    let a = nodes[e[0]];
    let b = nodes[e[1]];
    if (a.group === b.group) {
        return { color: [153, 153, 153], weight: 1, alpha: 77 }; // gray, thin, 0.3 opacity
    } else {
        let c1 = GROUP_COLORS[a.group];
        let c2 = GROUP_COLORS[b.group];
        let blended = blendColors(c1, c2, 0.5);
        return { color: blended, weight: 2.5, alpha: 179 }; // blended, thick, 0.7 opacity
    }
}

// ---- Drawing ----

function draw() {
    // Background
    background(255);

    // Draw region border
    noFill();
    stroke(192);
    strokeWeight(1);
    rect(0, 0, canvasWidth - 1, drawHeight);

    // Title
    fill(...INDIGO);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(16);
    textStyle(BOLD);
    text('Inclusion Network Map', canvasWidth / 2, 10);
    textStyle(NORMAL);

    // Subtitle showing current mode
    fill(120);
    textSize(11);
    let modeLabel = isIntegrated ? 'Integrated Network' : 'Segregated Network';
    if (transitioning) modeLabel = 'Transitioning...';
    text(modeLabel, canvasWidth / 2, 28);

    updateTransition();
    // Always run physics during transition; otherwise only when mouse is over canvas
    // or during initial settling (first 200 frames)
    if (mouseOverCanvas || transitioning || frameCount < 200) {
        applyForces();
    }

    // Draw edges
    drawEdges();

    // Draw nodes
    for (let n of nodes) {
        drawNode(n);
    }

    // Draw metric panel
    drawMetricPanel();

    // Draw legend
    drawLegend();

    // Draw tooltip
    if (hoveredNode && !draggedNode) {
        drawTooltip(hoveredNode);
    }

    // Draw control area
    drawControls();
}

function drawEdges() {
    for (let e of currentEdges) {
        let a = nodes[e[0]];
        let b = nodes[e[1]];
        let style = getEdgeColor(e);

        // Highlight edges connected to selected node
        let isHighlighted = false;
        if (selectedNode !== null) {
            if (e[0] === selectedNode.id || e[1] === selectedNode.id) {
                isHighlighted = true;
            }
        }

        if (selectedNode !== null && !isHighlighted) {
            // Dim non-connected edges
            stroke(style.color[0], style.color[1], style.color[2], 30);
            strokeWeight(style.weight * 0.5);
        } else if (isHighlighted) {
            // Bright highlighted edge
            if (a.group === b.group) {
                stroke(153, 153, 153, 220);
                strokeWeight(2.5);
            } else {
                let blended = blendColors(GROUP_COLORS[a.group], GROUP_COLORS[b.group], 0.5);
                stroke(blended[0], blended[1], blended[2], 240);
                strokeWeight(3.5);
            }
        } else {
            stroke(style.color[0], style.color[1], style.color[2], style.alpha);
            strokeWeight(style.weight);
        }

        // Transition fade effect
        let fadeAlpha = 1;
        if (transitioning) {
            // Slight pulse during transition
            fadeAlpha = 0.5 + 0.5 * sin(transitionProgress * PI);
        }

        line(a.x, a.y, b.x, b.y);
    }
}

function drawNode(n) {
    let r = nodeRadius(n);
    let col = GROUP_COLORS[n.group];
    let isHovered = (hoveredNode === n);
    let isSelected = (selectedNode === n);

    // Dim nodes not connected to selected
    let alpha = 255;
    if (selectedNode !== null && selectedNode !== n) {
        let connected = false;
        for (let e of currentEdges) {
            if ((e[0] === selectedNode.id && e[1] === n.id) ||
                (e[1] === selectedNode.id && e[0] === n.id)) {
                connected = true;
                break;
            }
        }
        if (!connected) alpha = 60;
    }

    // Glow for hovered or selected
    if (isHovered || isSelected) {
        noStroke();
        fill(col[0], col[1], col[2], 50);
        ellipse(n.x, n.y, r * 2 + 20);
    }

    // White border for well-integrated nodes (integration score > 0.6)
    if (n.integrationScore > 0.6) {
        stroke(255);
        strokeWeight(3.5);
        fill(col[0], col[1], col[2], alpha);
        ellipse(n.x, n.y, r * 2 + 4);
    }

    // Node body
    if (isHovered || isSelected) {
        stroke(...GOLD);
        strokeWeight(2.5);
    } else {
        stroke(255, 255, 255, alpha);
        strokeWeight(1.2);
    }
    fill(col[0], col[1], col[2], alpha);
    ellipse(n.x, n.y, r * 2);

    // Name label (only on larger nodes or hover)
    if ((r >= 12 || isHovered || isSelected) && alpha > 100) {
        fill(255, 255, 255, alpha);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(constrain(r * 0.65, 7, 11));
        let shortName = n.name.length > 5 ? n.name.substring(0, 4) + '.' : n.name;
        text(shortName, n.x, n.y);
    }
}

function drawMetricPanel() {
    let pw = 195;
    let ph = 82;
    let px = 12;
    let py = drawHeight - ph - 12;

    // Semi-transparent background
    fill(255, 255, 255, 220);
    stroke(192);
    strokeWeight(1);
    rect(px, py, pw, ph, 6);

    // Title
    fill(...INDIGO);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(11);
    textStyle(BOLD);
    text('Network Metrics', px + 10, py + 8);
    textStyle(NORMAL);

    // Metrics
    textSize(10);
    let integScore = getOverallIntegrationScore();
    let crossRatio = getCrossGroupRatio();
    let equityRatio = getCentralityEquity();

    fill(80);
    text('Integration Score:', px + 10, py + 26);
    fill(...INDIGO);
    textStyle(BOLD);
    text(nf(integScore, 0, 3), px + 130, py + 26);
    textStyle(NORMAL);

    fill(80);
    text('Cross-Group Edges:', px + 10, py + 42);
    fill(...INDIGO);
    textStyle(BOLD);
    text(crossRatio, px + 130, py + 42);
    textStyle(NORMAL);

    fill(80);
    text('Centrality Equity:', px + 10, py + 58);
    fill(...INDIGO);
    textStyle(BOLD);
    text(nf(equityRatio, 0, 3), px + 130, py + 58);
    textStyle(NORMAL);
}

function drawLegend() {
    let lx = canvasWidth - 148;
    let ly = drawHeight - 100;
    let lw = 138;
    let lh = 90;

    fill(255, 255, 255, 220);
    stroke(192);
    strokeWeight(1);
    rect(lx, ly, lw, lh, 6);

    fill(80);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(10);
    textStyle(BOLD);
    text('Groups', lx + 10, ly + 6);
    textStyle(NORMAL);

    let groups = ['A', 'B', 'C', 'D'];
    let labels = ['Group A', 'Group B', 'Group C', 'Group D'];
    for (let i = 0; i < groups.length; i++) {
        let col = GROUP_COLORS[groups[i]];
        fill(col[0], col[1], col[2]);
        noStroke();
        ellipse(lx + 18, ly + 26 + i * 16, 10);
        fill(60);
        textAlign(LEFT, CENTER);
        textSize(10);
        text(labels[i], lx + 28, ly + 26 + i * 16);
    }
}

function drawTooltip(n) {
    let tw = 210;
    let th = 100;
    let tx = n.x + nodeRadius(n) + 14;
    let ty = n.y - th / 2;

    // Keep on screen
    if (tx + tw > canvasWidth - 10) tx = n.x - nodeRadius(n) - tw - 14;
    if (ty < GRAPH_TOP + 10) ty = GRAPH_TOP + 10;
    if (ty + th > drawHeight - 10) ty = drawHeight - th - 10;

    // Shadow
    noStroke();
    fill(0, 0, 0, 20);
    rect(tx + 3, ty + 3, tw, th, 8);

    // Background
    fill(255, 252, 240);
    stroke(180);
    strokeWeight(1);
    rect(tx, ty, tw, th, 8);

    // Content
    fill(30);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(14);
    textStyle(BOLD);
    text(n.name, tx + 10, ty + 8);
    textStyle(NORMAL);

    // Group indicator
    let col = GROUP_COLORS[n.group];
    fill(col[0], col[1], col[2]);
    noStroke();
    ellipse(tx + 16, ty + 36, 10);
    fill(80);
    textAlign(LEFT, CENTER);
    textSize(10);
    text(GROUP_NAMES[n.group], tx + 24, ty + 36);

    // Metrics
    textAlign(LEFT, TOP);
    fill(80);
    textSize(10);
    text('Degree Centrality: ', tx + 10, ty + 52);
    fill(...INDIGO);
    textStyle(BOLD);
    text(n.degree, tx + 125, ty + 52);
    textStyle(NORMAL);

    fill(80);
    text('Integration Score: ', tx + 10, ty + 68);
    fill(...INDIGO);
    textStyle(BOLD);
    text(nf(n.integrationScore, 0, 3), tx + 125, ty + 68);
    textStyle(NORMAL);

    fill(80);
    text('Cross-Group Edges: ', tx + 10, ty + 84);
    fill(...INDIGO);
    textStyle(BOLD);
    text(n.crossGroupEdges + ' / ' + n.totalEdges, tx + 125, ty + 84);
    textStyle(NORMAL);
}

function drawControls() {
    let cy = drawHeight;

    // Control background
    fill(255);
    noStroke();
    rect(0, cy, canvasWidth, controlHeight);

    // Border at top of control area
    stroke(192);
    strokeWeight(1);
    line(0, cy, canvasWidth, cy);

    // Toggle button
    toggleBtn.x = canvasWidth / 2 - toggleBtn.w / 2;
    toggleBtn.y = cy + (controlHeight - toggleBtn.h) / 2;

    let isHover = mouseX > toggleBtn.x && mouseX < toggleBtn.x + toggleBtn.w &&
                  mouseY > toggleBtn.y && mouseY < toggleBtn.y + toggleBtn.h;

    // Button styling
    if (transitioning) {
        fill(160);
    } else if (isHover) {
        fill(...INDIGO_LIGHT);
    } else {
        fill(...INDIGO);
    }
    stroke(40);
    strokeWeight(1);
    rect(toggleBtn.x, toggleBtn.y, toggleBtn.w, toggleBtn.h, 6);

    // Button label
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(13);
    textStyle(BOLD);
    let label = isIntegrated ? 'Show Segregated' : 'Show Integrated';
    if (transitioning) label = 'Transitioning...';
    text(label, toggleBtn.x + toggleBtn.w / 2, toggleBtn.y + toggleBtn.h / 2);
    textStyle(NORMAL);

    // Current mode indicator
    fill(100);
    textSize(11);
    textAlign(LEFT, CENTER);
    let modeText = isIntegrated ? 'Integrated' : 'Segregated';
    if (transitioning) modeText = '...';

    // Left label
    fill(isIntegrated ? 120 : INDIGO[0], isIntegrated ? 120 : INDIGO[1], isIntegrated ? 120 : INDIGO[2]);
    textAlign(RIGHT, CENTER);
    textSize(12);
    text('Segregated', toggleBtn.x - 15, toggleBtn.y + toggleBtn.h / 2);

    // Right label
    fill(isIntegrated ? INDIGO[0] : 120, isIntegrated ? INDIGO[1] : 120, isIntegrated ? INDIGO[2] : 120);
    textAlign(LEFT, CENTER);
    text('Integrated', toggleBtn.x + toggleBtn.w + 15, toggleBtn.y + toggleBtn.h / 2);
}

// ---- Interaction ----

function mousePressed() {
    // Check toggle button
    if (mouseX > toggleBtn.x && mouseX < toggleBtn.x + toggleBtn.w &&
        mouseY > toggleBtn.y && mouseY < toggleBtn.y + toggleBtn.h) {
        if (!transitioning) {
            startTransition();
        }
        return;
    }

    // Check nodes
    for (let n of nodes) {
        let d = dist(mouseX, mouseY, n.x, n.y);
        if (d < nodeRadius(n) + 4) {
            draggedNode = n;
            dragOffsetX = n.x - mouseX;
            dragOffsetY = n.y - mouseY;

            // Toggle selection
            if (selectedNode === n) {
                selectedNode = null;
            } else {
                selectedNode = n;
            }

            simulationActive = true;
            framesSinceInteraction = 0;
            return;
        }
    }

    // Click on empty space clears selection
    if (mouseY < drawHeight) {
        selectedNode = null;
    }
}

function mouseDragged() {
    if (draggedNode) {
        draggedNode.x = mouseX + dragOffsetX;
        draggedNode.y = mouseY + dragOffsetY;
        draggedNode.vx = 0;
        draggedNode.vy = 0;
        simulationActive = true;
        framesSinceInteraction = 0;
    }
}

function mouseReleased() {
    draggedNode = null;
}

function mouseMoved() {
    hoveredNode = null;
    for (let n of nodes) {
        let d = dist(mouseX, mouseY, n.x, n.y);
        if (d < nodeRadius(n) + 4) {
            hoveredNode = n;
            break;
        }
    }
}

function mouseEntered() {
    mouseOverCanvas = true;
    simulationActive = true;
    framesSinceInteraction = 0;
}

function mouseExited() {
    mouseOverCanvas = false;
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    setTargetPositions();
    // Update targets for current mode
    for (let n of nodes) {
        n.targetX = isIntegrated ? n.intX : n.segX;
        n.targetY = isIntegrated ? n.intY : n.segY;
    }
    simulationActive = true;
    framesSinceInteraction = 0;
}
