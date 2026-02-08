// Louvain Community Detection - p5.js MicroSim
// Visualizes community detection on a 16-node organizational network

let canvasWidth = 900;
const canvasHeight = 520;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// Community color palette (5 distinct colors)
const COMM_COLORS = [
    [92, 107, 192],   // Indigo-light
    [212, 136, 15],   // Amber
    [76, 175, 80],    // Green
    [156, 39, 176],   // Purple
    [239, 83, 80],    // Red
    [0, 172, 193],    // Cyan
    [255, 167, 38],   // Orange
    [121, 85, 72],    // Brown
    [96, 125, 139],   // Blue-grey
    [205, 220, 57],   // Lime
    [255, 112, 67],   // Deep orange
    [38, 166, 154],   // Teal
    [171, 71, 188],   // Light purple
    [66, 165, 245],   // Light blue
    [255, 213, 79],   // Yellow
    [161, 136, 127]   // Warm grey
];

let nodes = [];
let edges = [];
let adj = [];  // adjacency list with weights

let hoveredNode = null;
let draggedNode = null;
let dragOffsetX = 0, dragOffsetY = 0;

// Algorithm state
let stepSequence = [];  // precomputed sequence of community assignments
let currentStep = 0;
let modularity = 0;
let isRunning = false;
let runTimer = 0;
let totalEdgeWeight = 0;

// Buttons
let buttons = [];

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
    precomputeLouvain();
    applyStep(0);

    layoutButtons();
}

function layoutButtons() {
    let bw = 72;
    let bh = 30;
    let gap = 10;
    let totalW = bw * 3 + gap * 2;
    let startX = canvasWidth - totalW - 20;
    let by = 12;

    buttons = [
        { label: 'Step', action: 'step', x: startX, y: by, w: bw, h: bh },
        { label: 'Run', action: 'run', x: startX + bw + gap, y: by, w: bw, h: bh },
        { label: 'Reset', action: 'reset', x: startX + 2 * (bw + gap), y: by, w: bw, h: bh }
    ];
}

function buildGraph() {
    // 16 employees across 4 departments
    const empData = [
        // Engineering (0-4)
        { name: 'Alice', dept: 'Engineering' },
        { name: 'Bob', dept: 'Engineering' },
        { name: 'Carlos', dept: 'Engineering' },
        { name: 'Dana', dept: 'Engineering' },
        { name: 'Eve', dept: 'Engineering' },
        // Product (5-8)
        { name: 'Frank', dept: 'Product' },
        { name: 'Grace', dept: 'Product' },
        { name: 'Hiro', dept: 'Product' },
        { name: 'Ines', dept: 'Product' },
        // Sales (9-12)
        { name: 'Jake', dept: 'Sales' },
        { name: 'Kim', dept: 'Sales' },
        { name: 'Leo', dept: 'Sales' },
        { name: 'Maya', dept: 'Sales' },
        // Operations (13-15)
        { name: 'Nora', dept: 'Operations' },
        { name: 'Omar', dept: 'Operations' },
        { name: 'Priya', dept: 'Operations' }
    ];

    let cx = canvasWidth / 2;
    let cy = 280;

    // Position in natural clusters
    const positions = [
        // Engineering (top-left)
        { x: cx - 220, y: cy - 120 },
        { x: cx - 290, y: cy - 50 },
        { x: cx - 220, y: cy + 20 },
        { x: cx - 150, y: cy - 50 },
        { x: cx - 150, y: cy - 130 },
        // Product (top-right)
        { x: cx + 220, y: cy - 120 },
        { x: cx + 290, y: cy - 50 },
        { x: cx + 220, y: cy + 20 },
        { x: cx + 150, y: cy - 50 },
        // Sales (bottom-right)
        { x: cx + 130, y: cy + 110 },
        { x: cx + 200, y: cy + 150 },
        { x: cx + 130, y: cy + 190 },
        { x: cx + 60, y: cy + 150 },
        // Operations (bottom-left)
        { x: cx - 130, y: cy + 130 },
        { x: cx - 200, y: cy + 170 },
        { x: cx - 60, y: cy + 160 }
    ];

    for (let i = 0; i < empData.length; i++) {
        nodes.push({
            id: i,
            name: empData[i].name,
            dept: empData[i].dept,
            x: positions[i].x,
            y: positions[i].y,
            community: i,       // starts in own community
            targetX: positions[i].x,
            targetY: positions[i].y
        });
    }

    // Edges: dense within clusters, sparse between
    const edgeList = [
        // Engineering internal (dense)
        [0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [2, 3], [3, 4],
        // Product internal (dense)
        [5, 6], [5, 7], [5, 8], [6, 7], [6, 8], [7, 8],
        // Sales internal (dense)
        [9, 10], [9, 11], [9, 12], [10, 11], [10, 12], [11, 12],
        // Operations internal
        [13, 14], [13, 15], [14, 15],
        // Cross-cluster bridges (sparse)
        [4, 8],    // Eve(Eng) - Ines(Prod) bridge
        [12, 15],  // Maya(Sales) - Priya(Ops) bridge
        [3, 13],   // Dana(Eng) - Nora(Ops) bridge
        [8, 9],    // Ines(Prod) - Jake(Sales) bridge
        [15, 4]    // Priya(Ops) - Eve(Eng) -- bridge node oscillates
    ];

    for (let e of edgeList) {
        edges.push({ from: e[0], to: e[1] });
    }

    // Build adjacency
    adj = [];
    for (let i = 0; i < nodes.length; i++) adj[i] = {};
    for (let e of edges) {
        adj[e.from][e.to] = (adj[e.from][e.to] || 0) + 1;
        adj[e.to][e.from] = (adj[e.to][e.from] || 0) + 1;
    }
    totalEdgeWeight = edges.length;
}

// Compute modularity for a given community assignment
function computeModularity(communities) {
    let m2 = 2 * totalEdgeWeight;
    let Q = 0;

    // Degree of each node
    let deg = new Array(nodes.length).fill(0);
    for (let e of edges) {
        deg[e.from]++;
        deg[e.to]++;
    }

    for (let e of edges) {
        if (communities[e.from] === communities[e.to]) {
            Q += 1 - (deg[e.from] * deg[e.to]) / m2;
        }
    }
    return Q / totalEdgeWeight;
}

// Precompute a sequence of community assignments simulating Louvain
function precomputeLouvain() {
    let n = nodes.length;

    // Step 0: everyone in own community
    let step0 = [];
    for (let i = 0; i < n; i++) step0.push(i);
    stepSequence.push([...step0]);

    // Step 1: First pass - merge obvious pairs within clusters
    let step1 = [...step0];
    // Engineering: merge 0,1,2,3,4 partially
    step1[1] = 0; step1[2] = 0; step1[3] = 0;
    // Product: merge 6,7 into 5
    step1[6] = 5; step1[7] = 5;
    // Sales: merge 10,11 into 9
    step1[10] = 9; step1[11] = 9;
    // Operations: merge 14 into 13
    step1[14] = 13;
    stepSequence.push([...step1]);

    // Step 2: Continue merging - full clusters form
    let step2 = [...step1];
    step2[4] = 0;   // Eve joins Engineering
    step2[8] = 5;   // Ines joins Product
    step2[12] = 9;  // Maya joins Sales
    step2[15] = 13; // Priya joins Operations
    stepSequence.push([...step2]);

    // Step 3: Bridge nodes may oscillate - Priya considers Engineering
    let step3 = [...step2];
    step3[15] = 0;  // Priya oscillates to Engineering (bridge node)
    stepSequence.push([...step3]);

    // Step 4: Stabilize - Priya goes back to Operations (better modularity)
    let step4 = [...step3];
    step4[15] = 13; // Priya returns to Operations
    stepSequence.push([...step4]);

    // Step 5: Final converged state
    stepSequence.push([...step4]);
}

function applyStep(stepIdx) {
    if (stepIdx >= stepSequence.length) stepIdx = stepSequence.length - 1;
    currentStep = stepIdx;

    let assignments = stepSequence[stepIdx];
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].community = assignments[i];
    }
    modularity = computeModularity(assignments);
}

function getCommColor(commId) {
    return COMM_COLORS[commId % COMM_COLORS.length];
}

function draw() {
    background(245);

    // Title
    fill(...INDIGO);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(16);
    text('Louvain Community Detection', 20, 26);

    // Modularity display
    textAlign(LEFT, CENTER);
    textSize(13);
    fill(80);
    text('Modularity:', 20, 52);
    fill(...INDIGO);
    textSize(16);
    textStyle(BOLD);
    text('Q = ' + nf(modularity, 0, 4), 100, 52);
    textStyle(NORMAL);

    // Step counter
    fill(120);
    textSize(12);
    text('Step ' + currentStep + ' / ' + (stepSequence.length - 1), 210, 52);

    // Status
    if (currentStep >= stepSequence.length - 1) {
        fill(76, 175, 80);
        textSize(12);
        text('Converged', 310, 52);
    } else if (isRunning) {
        fill(...AMBER);
        textSize(12);
        text('Running...', 310, 52);
    }

    drawButtons();

    // Draw community hulls (convex backgrounds)
    drawCommunityHulls();

    // Draw edges
    for (let e of edges) {
        let nFrom = nodes[e.from];
        let nTo = nodes[e.to];
        let sameCommunity = nFrom.community === nTo.community;
        stroke(sameCommunity ? [...getCommColor(nFrom.community), 120] : [180, 180, 180, 100]);
        strokeWeight(sameCommunity ? 2 : 1);
        line(nFrom.x, nFrom.y, nTo.x, nTo.y);
    }

    // Draw nodes
    for (let n of nodes) {
        let r = 22;
        let col = getCommColor(n.community);
        let isHovered = (hoveredNode === n);

        if (isHovered) {
            noStroke();
            fill(...GOLD, 80);
            ellipse(n.x, n.y, r + 20);
        }

        stroke(isHovered ? GOLD : [60]);
        strokeWeight(isHovered ? 2.5 : 1.5);
        fill(...col);
        ellipse(n.x, n.y, r * 2);

        // Name label
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        text(n.name, n.x, n.y);
    }

    // Tooltip
    if (hoveredNode && !draggedNode) {
        drawTooltip(hoveredNode);
    }

    // Legend
    drawLegend();

    // Auto-run logic
    if (isRunning) {
        runTimer++;
        if (runTimer >= 40) { // every ~40 frames
            runTimer = 0;
            if (currentStep < stepSequence.length - 1) {
                applyStep(currentStep + 1);
            } else {
                isRunning = false;
            }
        }
    }
}

function drawCommunityHulls() {
    // Group nodes by community
    let groups = {};
    for (let n of nodes) {
        if (!groups[n.community]) groups[n.community] = [];
        groups[n.community].push(n);
    }

    for (let cId in groups) {
        let g = groups[cId];
        if (g.length < 2) continue;

        let col = getCommColor(parseInt(cId));
        fill(col[0], col[1], col[2], 25);
        noStroke();

        // Find bounding circle center
        let cx = 0, cy = 0;
        for (let n of g) { cx += n.x; cy += n.y; }
        cx /= g.length;
        cy /= g.length;

        // Find max distance from center
        let maxDist = 0;
        for (let n of g) {
            let d = dist(n.x, n.y, cx, cy);
            if (d > maxDist) maxDist = d;
        }

        ellipse(cx, cy, (maxDist + 50) * 2, (maxDist + 50) * 2);
    }
}

function drawTooltip(n) {
    let tw = 170;
    let th = 58;
    let tx = n.x + 24;
    let ty = n.y - th / 2;
    if (tx + tw > canvasWidth - 10) tx = n.x - 24 - tw;
    if (ty < 70) ty = 70;
    if (ty + th > canvasHeight - 10) ty = canvasHeight - th - 10;

    fill(255, 252, 240);
    stroke(180);
    strokeWeight(1);
    rect(tx, ty, tw, th, 6);

    fill(30);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(13);
    textStyle(BOLD);
    text(n.name, tx + 8, ty + 6);
    textStyle(NORMAL);
    textSize(11);
    fill(80);
    text('Dept: ' + n.dept, tx + 8, ty + 24);

    let col = getCommColor(n.community);
    fill(...col);
    ellipse(tx + 18, ty + 46, 10);
    fill(80);
    textAlign(LEFT, CENTER);
    text('Community ' + n.community, tx + 28, ty + 46);
}

function drawLegend() {
    // Gather unique communities
    let comms = new Set();
    for (let n of nodes) comms.add(n.community);
    let commList = [...comms].sort((a, b) => a - b);

    let lx = 20;
    let ly = canvasHeight - 30;

    fill(120);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(11);
    text('Communities:', lx, ly);

    let offsetX = lx + 85;
    for (let cId of commList) {
        let col = getCommColor(cId);
        fill(...col);
        noStroke();
        ellipse(offsetX + 6, ly, 12);

        // Count members
        let count = nodes.filter(n => n.community === cId).length;
        fill(60);
        textAlign(LEFT, CENTER);
        textSize(10);
        text(count, offsetX + 16, ly);
        offsetX += 36;
    }

    fill(150);
    textSize(10);
    textAlign(RIGHT, CENTER);
    text(commList.length + ' communities detected', canvasWidth - 20, ly);
}

function drawButtons() {
    for (let b of buttons) {
        let isHover = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
        let isDisabled = false;
        if (b.action === 'step' && (currentStep >= stepSequence.length - 1 || isRunning)) isDisabled = true;
        if (b.action === 'run' && (currentStep >= stepSequence.length - 1 || isRunning)) isDisabled = true;

        if (isDisabled) {
            fill(180);
        } else if (isHover) {
            fill(92, 107, 192);
        } else {
            fill(...INDIGO);
        }
        stroke(40);
        strokeWeight(1);
        rect(b.x, b.y, b.w, b.h, 6);

        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(13);
        text(b.label, b.x + b.w / 2, b.y + b.h / 2);
    }
}

function mousePressed() {
    // Check buttons
    for (let b of buttons) {
        if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
            handleButton(b.action);
            return;
        }
    }

    // Check node dragging
    for (let n of nodes) {
        if (dist(mouseX, mouseY, n.x, n.y) < 22) {
            draggedNode = n;
            dragOffsetX = n.x - mouseX;
            dragOffsetY = n.y - mouseY;
            return;
        }
    }
}

function handleButton(action) {
    if (action === 'step') {
        if (currentStep < stepSequence.length - 1 && !isRunning) {
            applyStep(currentStep + 1);
        }
    } else if (action === 'run') {
        if (currentStep < stepSequence.length - 1) {
            isRunning = true;
            runTimer = 0;
        }
    } else if (action === 'reset') {
        isRunning = false;
        runTimer = 0;
        applyStep(0);
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
        if (dist(mouseX, mouseY, n.x, n.y) < 22) {
            hoveredNode = n;
            break;
        }
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    layoutButtons();
}
