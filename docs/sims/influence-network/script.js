// Influence Network Visualization - p5.js MicroSim
// Interactive network showing formal leaders, informal leaders, and bridge builders

let canvasWidth = 900;
const canvasHeight = 550;

const INDIGO = [48, 63, 159];
const INDIGO_LIGHT = [92, 107, 192];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// Department colors (indigo variants + complementary)
const DEPT_COLORS = {
    'Engineering':  [63, 81, 181],
    'Product':      [92, 107, 192],
    'Sales':        [121, 134, 203],
    'HR':           [159, 168, 218],
    'Operations':   [48, 63, 159]
};

// View modes
const MODES = ['All', 'Formal Leaders', 'Informal Leaders', 'Bridge Builders'];
let currentMode = 0;

let nodes = [];
let edges = [];
let hoveredNode = null;
let draggedNode = null;
let pinnedNode = null;
let dragOffsetX = 0, dragOffsetY = 0;

// Layout
const GRAPH_TOP = 52;
const GRAPH_BOTTOM = 550;

// Buttons
let buttons = [];

// Physics
const REPULSION = 3000;
const SPRING_LENGTH = 90;
const SPRING_K = 0.005;
const DAMPING = 0.85;
const GRAVITY = 0.002;
let simulationActive = true;
let framesSinceInteraction = 0;

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
    layoutButtons();
}

function layoutButtons() {
    let bh = 28;
    let gap = 8;
    let bws = [50, 130, 140, 130];
    let totalW = bws.reduce((a, b) => a + b, 0) + gap * (bws.length - 1);
    let startX = (canvasWidth - totalW) / 2;

    buttons = [];
    let cx = startX;
    for (let i = 0; i < MODES.length; i++) {
        buttons.push({ label: MODES[i], mode: i, x: cx, y: 12, w: bws[i], h: bh });
        cx += bws[i] + gap;
    }
}

// ─── Data Generation ────────────────────────────────────────────────────────

function buildData() {
    let employees = [
        // Engineering (8 people)
        { name: 'Alice',   title: 'VP Engineering',    dept: 'Engineering', isManager: true },
        { name: 'Bob',     title: 'Sr. Engineer',      dept: 'Engineering', isManager: false },
        { name: 'Carlos',  title: 'Engineer',          dept: 'Engineering', isManager: false },
        { name: 'Dana',    title: 'Engineer',          dept: 'Engineering', isManager: false },
        { name: 'Eve',     title: 'Tech Lead',         dept: 'Engineering', isManager: false },
        { name: 'Frank',   title: 'Engineer',          dept: 'Engineering', isManager: false },
        { name: 'Grace',   title: 'Jr. Engineer',      dept: 'Engineering', isManager: false },
        { name: 'Hiro',    title: 'Engineer',          dept: 'Engineering', isManager: false },

        // Product (7 people)
        { name: 'Ines',    title: 'Director of Product', dept: 'Product', isManager: true },
        { name: 'Jake',    title: 'Product Manager',   dept: 'Product', isManager: true },
        { name: 'Kim',     title: 'UX Designer',       dept: 'Product', isManager: false },
        { name: 'Leo',     title: 'UX Researcher',     dept: 'Product', isManager: false },
        { name: 'Maya',    title: 'Product Analyst',    dept: 'Product', isManager: false },
        { name: 'Nora',    title: 'Designer',          dept: 'Product', isManager: false },
        { name: 'Omar',    title: 'Product Analyst',    dept: 'Product', isManager: false },

        // Sales (7 people)
        { name: 'Priya',   title: 'Sales Director',    dept: 'Sales', isManager: true },
        { name: 'Quinn',   title: 'Account Exec',      dept: 'Sales', isManager: false },
        { name: 'Rita',    title: 'Sales Rep',          dept: 'Sales', isManager: false },
        { name: 'Sam',     title: 'Sales Rep',          dept: 'Sales', isManager: false },
        { name: 'Tina',    title: 'Sales Engineer',     dept: 'Sales', isManager: false },
        { name: 'Uma',     title: 'Account Exec',       dept: 'Sales', isManager: false },
        { name: 'Bea',     title: 'Sales Coordinator',  dept: 'Sales', isManager: false },

        // HR (6 people)
        { name: 'Wendy',   title: 'HR Manager',         dept: 'HR', isManager: true },
        { name: 'Xander',  title: 'Recruiter',          dept: 'HR', isManager: false },
        { name: 'Yara',    title: 'HR Specialist',       dept: 'HR', isManager: false },
        { name: 'Zack',    title: 'HR Analyst',          dept: 'HR', isManager: false },
        { name: 'Amara',   title: 'Recruiter',          dept: 'HR', isManager: false },
        { name: 'Ben',     title: 'Benefits Coord.',     dept: 'HR', isManager: false },

        // Operations (7 people)
        { name: 'Clara',   title: 'Ops Manager',         dept: 'Operations', isManager: true },
        { name: 'Derek',   title: 'Ops Analyst',         dept: 'Operations', isManager: false },
        { name: 'Elise',   title: 'Logistics Coord.',    dept: 'Operations', isManager: false },
        { name: 'Finn',    title: 'Ops Specialist',      dept: 'Operations', isManager: false },
        { name: 'Gina',    title: 'Data Analyst',        dept: 'Operations', isManager: false },
        { name: 'Hugo',    title: 'Ops Analyst',         dept: 'Operations', isManager: false },
        { name: 'Ivy',     title: 'Project Coord.',      dept: 'Operations', isManager: false }
    ];

    // Edge list: [from_index, to_index, weight (communication frequency 1-5)]
    let edgeList = [
        // ── Engineering internal ──
        [0, 1, 3], [0, 4, 4], [1, 2, 3], [1, 4, 2], [2, 3, 4],
        [3, 5, 3], [4, 5, 2], [4, 6, 2], [5, 7, 3], [6, 7, 2],
        [0, 3, 2], [2, 6, 1],

        // ── Product internal ──
        [8, 9, 4], [8, 10, 3], [9, 11, 3], [9, 12, 2], [10, 11, 4],
        [10, 13, 3], [12, 13, 2], [11, 14, 2], [8, 14, 1],

        // ── Sales internal ──
        [15, 16, 4], [15, 17, 3], [16, 18, 2], [17, 18, 3], [18, 19, 2],
        [19, 20, 3], [15, 20, 2], [16, 21, 3], [20, 21, 4], [17, 21, 2],

        // ── HR internal ──
        [22, 23, 4], [22, 24, 3], [23, 25, 2], [24, 25, 3], [22, 26, 2],
        [25, 27, 2], [26, 27, 3],

        // ── Operations internal ──
        [28, 29, 4], [28, 30, 3], [29, 31, 3], [30, 31, 2], [31, 32, 3],
        [28, 33, 2], [32, 33, 3], [33, 34, 2], [29, 34, 2],

        // ── Cross-department: Bea (21) bridges Sales-Engineering-Product-HR ──
        [21, 4, 3],    // Bea <-> Eve (Engineering Tech Lead)
        [21, 12, 3],   // Bea <-> Maya (Product Analyst)
        [21, 24, 2],   // Bea <-> Yara (HR Specialist)
        [21, 30, 2],   // Bea <-> Elise (Operations)

        // ── Other cross-department connections ──
        [0, 8, 2],     // Alice (Eng VP) <-> Ines (Product Dir)
        [4, 9, 2],     // Eve (Eng) <-> Jake (Product PM)
        [9, 15, 1],    // Jake (Product) <-> Priya (Sales Dir)
        [12, 16, 2],   // Maya (Product) <-> Quinn (Sales)
        [22, 28, 2],   // Wendy (HR) <-> Clara (Ops)
        [23, 19, 1],   // Xander (HR) <-> Uma (Sales) - recruiting
        [25, 32, 2],   // Zack (HR) <-> Gina (Ops)
        [1, 29, 1],    // Bob (Eng) <-> Derek (Ops)
        [13, 30, 1],   // Nora (Product) <-> Elise (Ops)

        // Eve as informal leader within engineering (high PageRank)
        [2, 4, 2], [3, 4, 2], [6, 4, 1], [7, 4, 2],

        // Kim (UX Designer) as informal connector in Product
        [10, 12, 2], [10, 14, 2]
    ];

    // Cluster starting positions by department
    let cx = canvasWidth / 2;
    let cy = (GRAPH_TOP + GRAPH_BOTTOM) / 2 + 10;
    let clusterR = 160;

    let deptCenters = {
        'Engineering':  { x: cx - clusterR * 1.1, y: cy - clusterR * 0.7 },
        'Product':      { x: cx + clusterR * 1.1, y: cy - clusterR * 0.7 },
        'Sales':        { x: cx + clusterR * 0.9, y: cy + clusterR * 0.7 },
        'HR':           { x: cx - clusterR * 0.9, y: cy + clusterR * 0.7 },
        'Operations':   { x: cx, y: cy + clusterR * 0.3 }
    };

    // Create nodes with jittered cluster positions
    for (let i = 0; i < employees.length; i++) {
        let e = employees[i];
        let center = deptCenters[e.dept];
        let angle = (i * 2.399) + Math.random() * 0.5; // golden angle + jitter
        let r = 30 + Math.random() * 50;

        nodes.push({
            id: i,
            name: e.name,
            title: e.title,
            dept: e.dept,
            isManager: e.isManager,
            x: center.x + cos(angle) * r,
            y: center.y + sin(angle) * r,
            vx: 0,
            vy: 0,
            pagerank: 0,
            betweenness: 0,
            crossDeptCount: 0 // number of departments connected to
        });
    }

    // Create edges
    for (let e of edgeList) {
        edges.push({ from: e[0], to: e[1], weight: e[2] });
    }

    // Compute metrics
    computePageRank();
    computeBetweenness();
    computeCrossDeptConnections();
}

// ─── PageRank ───────────────────────────────────────────────────────────────

function computePageRank() {
    let n = nodes.length;
    let d = 0.85;
    let iterations = 40;

    // Build adjacency
    let outDeg = new Array(n).fill(0);
    let inLinks = [];
    for (let i = 0; i < n; i++) inLinks.push([]);

    for (let e of edges) {
        outDeg[e.from]++;
        outDeg[e.to]++;
        inLinks[e.to].push(e.from);
        inLinks[e.from].push(e.to);
    }

    let pr = new Array(n).fill(1 / n);

    for (let iter = 0; iter < iterations; iter++) {
        let newPr = new Array(n).fill((1 - d) / n);
        for (let i = 0; i < n; i++) {
            for (let j of inLinks[i]) {
                if (outDeg[j] > 0) {
                    newPr[i] += d * pr[j] / outDeg[j];
                }
            }
        }
        pr = newPr;
    }

    // Normalize to 0-1
    let maxPr = Math.max(...pr);
    let minPr = Math.min(...pr);
    let range = maxPr - minPr || 1;
    for (let i = 0; i < n; i++) {
        nodes[i].pagerank = (pr[i] - minPr) / range;
    }
}

// ─── Betweenness Centrality (Brandes algorithm, unweighted) ─────────────────

function computeBetweenness() {
    let n = nodes.length;
    let cb = new Array(n).fill(0);

    // Build adjacency list
    let adj = [];
    for (let i = 0; i < n; i++) adj.push([]);
    for (let e of edges) {
        adj[e.from].push(e.to);
        adj[e.to].push(e.from);
    }

    for (let s = 0; s < n; s++) {
        let stack = [];
        let pred = [];
        for (let i = 0; i < n; i++) pred.push([]);
        let sigma = new Array(n).fill(0);
        sigma[s] = 1;
        let dists = new Array(n).fill(-1);
        dists[s] = 0;
        let queue = [s];

        // BFS
        while (queue.length > 0) {
            let v = queue.shift();
            stack.push(v);
            for (let w of adj[v]) {
                if (dists[w] < 0) {
                    dists[w] = dists[v] + 1;
                    queue.push(w);
                }
                if (dists[w] === dists[v] + 1) {
                    sigma[w] += sigma[v];
                    pred[w].push(v);
                }
            }
        }

        // Accumulation
        let delta = new Array(n).fill(0);
        while (stack.length > 0) {
            let w = stack.pop();
            for (let v of pred[w]) {
                delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
            }
            if (w !== s) cb[w] += delta[w];
        }
    }

    // Normalize to 0-1
    let maxCb = Math.max(...cb);
    let minCb = Math.min(...cb);
    let range = maxCb - minCb || 1;
    for (let i = 0; i < n; i++) {
        nodes[i].betweenness = (cb[i] - minCb) / range;
    }
}

// ─── Cross-department connection count ──────────────────────────────────────

function computeCrossDeptConnections() {
    for (let node of nodes) {
        let connectedDepts = new Set();
        connectedDepts.add(node.dept);
        for (let e of edges) {
            if (e.from === node.id) connectedDepts.add(nodes[e.to].dept);
            if (e.to === node.id) connectedDepts.add(nodes[e.from].dept);
        }
        node.crossDeptCount = connectedDepts.size;
    }
}

// ─── Force-Directed Layout ──────────────────────────────────────────────────

function applyForces() {
    if (!simulationActive) return;

    let cx = canvasWidth / 2;
    let cy = (GRAPH_TOP + GRAPH_BOTTOM) / 2;

    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i] === draggedNode) continue;

        let fx = 0, fy = 0;

        // Repulsion from all other nodes
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

        // Spring force for connected edges
        for (let e of edges) {
            let other = -1;
            if (e.from === i) other = e.to;
            else if (e.to === i) other = e.from;
            if (other < 0) continue;

            let dx = nodes[other].x - nodes[i].x;
            let dy = nodes[other].y - nodes[i].y;
            let d = Math.sqrt(dx * dx + dy * dy);
            if (d < 1) d = 1;
            let displacement = d - SPRING_LENGTH;
            fx += (dx / d) * displacement * SPRING_K;
            fy += (dy / d) * displacement * SPRING_K;
        }

        // Gravity toward center
        fx += (cx - nodes[i].x) * GRAVITY;
        fy += (cy - nodes[i].y) * GRAVITY;

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

        // Keep within bounds
        let r = nodeRadius(node);
        node.x = constrain(node.x, r + 10, canvasWidth - r - 10);
        node.y = constrain(node.y, GRAPH_TOP + r, GRAPH_BOTTOM - r - 10);
    }

    // Slow down simulation when settled
    framesSinceInteraction++;
    if (framesSinceInteraction > 300 && totalMovement < 0.5) {
        simulationActive = false;
    }
}

// ─── Node Sizing & Coloring ─────────────────────────────────────────────────

function nodeRadius(node) {
    // Size based on PageRank: min 10, max 28
    return map(node.pagerank, 0, 1, 10, 28);
}

function nodeColor(node) {
    if (currentMode === 0) {
        // All: color by department
        return DEPT_COLORS[node.dept];
    }
    if (currentMode === 1) {
        // Formal Leaders: highlight managers
        if (node.isManager) return INDIGO;
        return [190, 190, 190];
    }
    if (currentMode === 2) {
        // Informal Leaders: highlight high-PageRank non-managers
        if (!node.isManager && node.pagerank > 0.55) return AMBER;
        if (node.isManager) return [170, 170, 190];
        return [190, 190, 190];
    }
    if (currentMode === 3) {
        // Bridge Builders: highlight high-betweenness cross-community nodes
        if (node.betweenness > 0.4 && node.crossDeptCount >= 3) return GOLD;
        if (node.betweenness > 0.25) return [255, 235, 130];
        return [190, 190, 190];
    }
    return DEPT_COLORS[node.dept];
}

function nodeAlpha(node) {
    if (currentMode === 0) return 255;
    if (currentMode === 1) return node.isManager ? 255 : 80;
    if (currentMode === 2) {
        if (!node.isManager && node.pagerank > 0.55) return 255;
        return 80;
    }
    if (currentMode === 3) {
        if (node.betweenness > 0.25) return 255;
        return 80;
    }
    return 255;
}

function edgeAlpha(e) {
    if (currentMode === 0) return 100;
    let fromNode = nodes[e.from];
    let toNode = nodes[e.to];
    if (currentMode === 1) {
        if (fromNode.isManager || toNode.isManager) return 80;
        return 25;
    }
    if (currentMode === 2) {
        let fromHighlight = !fromNode.isManager && fromNode.pagerank > 0.55;
        let toHighlight = !toNode.isManager && toNode.pagerank > 0.55;
        if (fromHighlight || toHighlight) return 100;
        return 25;
    }
    if (currentMode === 3) {
        let fromHighlight = fromNode.betweenness > 0.25;
        let toHighlight = toNode.betweenness > 0.25;
        if (fromHighlight && toHighlight) return 120;
        if (fromHighlight || toHighlight) return 60;
        return 20;
    }
    return 100;
}

// ─── Drawing ────────────────────────────────────────────────────────────────

function draw() {
    background(245);

    applyForces();

    // Draw community boundaries in Bridge Builder mode
    if (currentMode === 3) {
        drawCommunityBoundaries();
    }

    // Draw edges
    for (let e of edges) {
        let fromN = nodes[e.from];
        let toN = nodes[e.to];
        let alpha = edgeAlpha(e);
        stroke(140, 140, 140, alpha);
        strokeWeight(map(e.weight, 1, 5, 0.5, 3));
        line(fromN.x, fromN.y, toN.x, toN.y);
    }

    // Draw nodes
    for (let n of nodes) {
        drawNode(n);
    }

    // Draw buttons
    drawButtons();

    // Draw mode description
    drawModeDescription();

    // Draw tooltip
    if (hoveredNode && !draggedNode) {
        drawTooltip(hoveredNode);
    }

    // Draw pinned detail panel
    if (pinnedNode) {
        drawDetailPanel(pinnedNode);
    }

    // Draw legend
    drawLegend();
}

function drawNode(n) {
    let r = nodeRadius(n);
    let col = nodeColor(n);
    let alpha = nodeAlpha(n);
    let isHovered = (hoveredNode === n);
    let isPinned = (pinnedNode === n);

    // Glow for hovered or pinned
    if (isHovered || isPinned) {
        noStroke();
        fill(...GOLD, 70);
        ellipse(n.x, n.y, r * 2 + 18);
    }

    // Highlight ring for bridge builders or informal leaders
    if (currentMode === 2 && !n.isManager && n.pagerank > 0.55) {
        noFill();
        stroke(...AMBER, 180);
        strokeWeight(3);
        ellipse(n.x, n.y, r * 2 + 8);
    }
    if (currentMode === 3 && n.betweenness > 0.4 && n.crossDeptCount >= 3) {
        noFill();
        stroke(...GOLD, 200);
        strokeWeight(3);
        ellipse(n.x, n.y, r * 2 + 8);
    }

    // Node body
    stroke(isHovered || isPinned ? GOLD : [80, 80, 80, alpha]);
    strokeWeight(isHovered || isPinned ? 2.5 : 1.2);
    fill(col[0], col[1], col[2], alpha);
    ellipse(n.x, n.y, r * 2);

    // Manager badge (small star indicator)
    if (n.isManager && (currentMode === 0 || currentMode === 1)) {
        fill(255, 215, 0, alpha);
        noStroke();
        let bx = n.x + r * 0.6;
        let by = n.y - r * 0.6;
        ellipse(bx, by, 8);
    }

    // Name label
    if (alpha > 100 || isHovered) {
        fill(255, 255, 255, alpha);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(constrain(r * 0.7, 8, 12));
        text(n.name, n.x, n.y);
    }
}

function drawCommunityBoundaries() {
    // Group nodes by department and draw hull-like ellipses
    let deptGroups = {};
    for (let n of nodes) {
        if (!deptGroups[n.dept]) deptGroups[n.dept] = [];
        deptGroups[n.dept].push(n);
    }

    for (let dept in deptGroups) {
        let group = deptGroups[dept];
        let avgX = 0, avgY = 0;
        for (let n of group) { avgX += n.x; avgY += n.y; }
        avgX /= group.length;
        avgY /= group.length;

        let maxDist = 0;
        for (let n of group) {
            let d = dist(n.x, n.y, avgX, avgY);
            if (d > maxDist) maxDist = d;
        }

        let col = DEPT_COLORS[dept];
        noStroke();
        fill(col[0], col[1], col[2], 18);
        ellipse(avgX, avgY, (maxDist + 60) * 2, (maxDist + 60) * 2);

        // Department label
        fill(col[0], col[1], col[2], 80);
        textAlign(CENTER, CENTER);
        textSize(11);
        noStroke();
        text(dept, avgX, avgY - maxDist - 18);
    }
}

function drawButtons() {
    for (let i = 0; i < buttons.length; i++) {
        let b = buttons[i];
        let isActive = (currentMode === b.mode);
        let isHover = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;

        if (isActive) {
            fill(...INDIGO);
        } else if (isHover) {
            fill(...INDIGO_LIGHT);
        } else {
            fill(170);
        }
        stroke(40);
        strokeWeight(1);
        rect(b.x, b.y, b.w, b.h, 6);

        fill(isActive ? 255 : 50);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        text(b.label, b.x + b.w / 2, b.y + b.h / 2);
    }
}

function drawModeDescription() {
    let descriptions = [
        'Showing all employees colored by department. Node size = PageRank.',
        'Formal leaders highlighted (managers, directors, VPs). Gold dot = management title.',
        'Informal leaders highlighted in amber: high PageRank, no management title.',
        'Bridge builders in gold: high betweenness centrality, connections across 3+ departments.'
    ];

    fill(100);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(11);
    text(descriptions[currentMode], canvasWidth / 2, 44);
}

function drawTooltip(n) {
    let tw = 220;
    let th = 110;
    let tx = n.x + nodeRadius(n) + 14;
    let ty = n.y - th / 2;

    // Keep on screen
    if (tx + tw > canvasWidth - 10) tx = n.x - nodeRadius(n) - tw - 14;
    if (ty < GRAPH_TOP + 10) ty = GRAPH_TOP + 10;
    if (ty + th > canvasHeight - 10) ty = canvasHeight - th - 10;

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

    textSize(11);
    fill(100);
    text(n.title, tx + 10, ty + 28);

    // Department color dot
    let col = DEPT_COLORS[n.dept];
    fill(...col);
    noStroke();
    ellipse(tx + 16, ty + 52, 10);
    fill(80);
    textAlign(LEFT, CENTER);
    textSize(11);
    text(n.dept, tx + 24, ty + 52);

    // Metrics
    textAlign(LEFT, TOP);
    fill(80);
    text('PageRank: ', tx + 10, ty + 66);
    fill(...INDIGO);
    text(nf(n.pagerank, 0, 3), tx + 80, ty + 66);

    fill(80);
    text('Betweenness: ', tx + 10, ty + 82);
    fill(...INDIGO);
    text(nf(n.betweenness, 0, 3), tx + 95, ty + 82);

    fill(80);
    text('Depts connected: ', tx + 10, ty + 98);
    fill(...INDIGO);
    text(n.crossDeptCount, tx + 118, ty + 98);
}

function drawDetailPanel(n) {
    let pw = 200;
    let ph = 120;
    let px = 10;
    let py = canvasHeight - ph - 10;

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

    // Content
    fill(30);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(13);
    textStyle(BOLD);
    text(n.name, px + 10, py + 8);
    textStyle(NORMAL);

    textSize(10);
    fill(100);
    text(n.title, px + 10, py + 26);

    let col = DEPT_COLORS[n.dept];
    fill(...col);
    noStroke();
    ellipse(px + 16, py + 48, 8);
    fill(80);
    textAlign(LEFT, CENTER);
    textSize(10);
    text(n.dept, px + 24, py + 48);

    textAlign(LEFT, TOP);
    fill(80);
    textSize(10);
    text('PageRank: ' + nf(n.pagerank, 0, 3), px + 10, py + 62);
    text('Betweenness: ' + nf(n.betweenness, 0, 3), px + 10, py + 78);
    text('Cross-dept links: ' + n.crossDeptCount, px + 10, py + 94);

    // Role tag
    let tag = '';
    let tagCol = [150, 150, 150];
    if (n.isManager) { tag = 'Formal Leader'; tagCol = [...INDIGO]; }
    else if (n.pagerank > 0.55) { tag = 'Informal Leader'; tagCol = [...AMBER]; }
    if (n.betweenness > 0.4 && n.crossDeptCount >= 3) {
        tag = (tag ? tag + ' + ' : '') + 'Bridge Builder';
        if (!n.isManager && !(n.pagerank > 0.55)) tagCol = [...GOLD];
    }
    if (tag) {
        fill(...tagCol);
        textSize(9);
        textStyle(BOLD);
        textAlign(LEFT, TOP);
        text(tag, px + 10, py + 108);
        textStyle(NORMAL);
    }
}

function drawLegend() {
    let lx, ly;

    if (currentMode === 0) {
        // Department color legend
        lx = canvasWidth - 150;
        ly = canvasHeight - 120;

        fill(255, 252, 240, 220);
        noStroke();
        rect(lx - 10, ly - 8, 155, 118, 6);

        fill(80);
        textAlign(LEFT, CENTER);
        textSize(10);
        textStyle(BOLD);
        text('Departments', lx, ly + 2);
        textStyle(NORMAL);

        let depts = ['Engineering', 'Product', 'Sales', 'HR', 'Operations'];
        for (let i = 0; i < depts.length; i++) {
            let col = DEPT_COLORS[depts[i]];
            fill(...col);
            noStroke();
            ellipse(lx + 6, ly + 22 + i * 18, 10);
            fill(60);
            textAlign(LEFT, CENTER);
            textSize(10);
            text(depts[i], lx + 16, ly + 22 + i * 18);
        }
    } else if (currentMode === 1) {
        lx = canvasWidth - 150;
        ly = canvasHeight - 60;
        fill(255, 252, 240, 220);
        noStroke();
        rect(lx - 10, ly - 8, 155, 55, 6);

        fill(...INDIGO);
        noStroke();
        ellipse(lx + 6, ly + 6, 10);
        fill(60);
        textAlign(LEFT, CENTER);
        textSize(10);
        text('Formal Leader', lx + 16, ly + 6);

        fill(190);
        ellipse(lx + 6, ly + 26, 10);
        fill(60);
        text('Non-manager', lx + 16, ly + 26);
    } else if (currentMode === 2) {
        lx = canvasWidth - 150;
        ly = canvasHeight - 60;
        fill(255, 252, 240, 220);
        noStroke();
        rect(lx - 10, ly - 8, 155, 55, 6);

        fill(...AMBER);
        noStroke();
        ellipse(lx + 6, ly + 6, 10);
        fill(60);
        textAlign(LEFT, CENTER);
        textSize(10);
        text('Informal Leader', lx + 16, ly + 6);

        fill(190);
        ellipse(lx + 6, ly + 26, 10);
        fill(60);
        text('Other', lx + 16, ly + 26);
    } else if (currentMode === 3) {
        lx = canvasWidth - 170;
        ly = canvasHeight - 80;
        fill(255, 252, 240, 220);
        noStroke();
        rect(lx - 10, ly - 8, 175, 75, 6);

        fill(...GOLD);
        noStroke();
        ellipse(lx + 6, ly + 6, 10);
        fill(60);
        textAlign(LEFT, CENTER);
        textSize(10);
        text('Bridge Builder (3+ depts)', lx + 16, ly + 6);

        fill(255, 235, 130);
        ellipse(lx + 6, ly + 26, 10);
        fill(60);
        text('High betweenness', lx + 16, ly + 26);

        fill(190);
        ellipse(lx + 6, ly + 46, 10);
        fill(60);
        text('Other', lx + 16, ly + 46);
    }
}

// ─── Interaction ────────────────────────────────────────────────────────────

function mousePressed() {
    // Check buttons first
    for (let b of buttons) {
        if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
            currentMode = b.mode;
            return;
        }
    }

    // Check close button on detail panel
    if (pinnedNode) {
        let pw = 200;
        let ph = 120;
        let px = 10;
        let py = canvasHeight - ph - 10;
        let closeDist = dist(mouseX, mouseY, px + pw - 14, py + 14);
        if (closeDist < 12) {
            pinnedNode = null;
            return;
        }
    }

    // Check nodes - click to pin, drag to move
    for (let n of nodes) {
        let d = dist(mouseX, mouseY, n.x, n.y);
        if (d < nodeRadius(n) + 4) {
            draggedNode = n;
            dragOffsetX = n.x - mouseX;
            dragOffsetY = n.y - mouseY;

            // Pin on click (will become drag if mouse moves)
            pinnedNode = n;

            // Wake up simulation
            simulationActive = true;
            framesSinceInteraction = 0;
            return;
        }
    }

    // Click on empty space clears pin
    pinnedNode = null;
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

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    layoutButtons();
    simulationActive = true;
    framesSinceInteraction = 0;
}
