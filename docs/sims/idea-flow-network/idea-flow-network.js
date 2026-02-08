// Idea Flow Network - p5.js MicroSim
// Force-directed graph showing how novel ideas travel through an organization

let canvasWidth = 900;
const drawHeight = 500;
const controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;

// Colors
const BG_DARK = [26, 35, 126];         // #1A237E very dark indigo
const AMBER = [212, 136, 15];           // #D4880F high originator
const GOLD = [255, 215, 0];             // #FFD700 high-volume edge
const LIGHT_GRAY = [204, 204, 204];     // #CCCCCC low originator
const EDGE_LOW = [120, 120, 120];       // low-volume edge
const WHITE = [255, 255, 255];

// Department cluster colors (semi-transparent for labels)
const DEPT_COLORS = {
    'Engineering':  [100, 140, 255],
    'Product':      [130, 200, 130],
    'Data Science': [200, 130, 220],
    'Marketing':    [255, 160, 100]
};

// Physics
const REPULSION = 2800;
const SPRING_LENGTH = 80;
const SPRING_K = 0.006;
const DAMPING = 0.82;
const GRAVITY = 0.003;
const CLUSTER_PULL = 0.004;
let simulationActive = true;
let framesSinceInteraction = 0;
let mouseOverCanvas = false;

// Data
let nodes = [];
let edges = [];
let departments = ['Engineering', 'Product', 'Data Science', 'Marketing'];
let deptCenters = {};

// Interaction state
let hoveredNode = null;
let draggedNode = null;
let dragOffsetX = 0, dragOffsetY = 0;

// Controls
let showIdeaFlowOnly = true;  // toggle state: true = "Idea Flow Only", false = "All Communication"
let thresholdValue = 1;       // slider value 1-5

// Toggle button geometry
let toggleBtn = { x: 0, y: 0, w: 180, h: 30 };

// Slider geometry
let slider = { x: 0, y: 0, w: 200, h: 20, knobR: 10 };
let sliderDragging = false;

// Labels for special nodes/departments
let innovationHubIdx = -1;
let ideaDesertDept = '';

function updateCanvasSize() {
    let container = document.querySelector('main');
    if (container) canvasWidth = container.offsetWidth;
    if (canvasWidth < 400) canvasWidth = 400;
}

function setup() {
    updateCanvasSize();
    canvasHeight = drawHeight + controlHeight;
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('main');
    textFont('Arial');

    buildData();
    computeSpecialLabels();
    layoutControls();
}

function layoutControls() {
    // Toggle button: left side of control area
    toggleBtn.x = 20;
    toggleBtn.y = drawHeight + (controlHeight - toggleBtn.h) / 2;

    // Slider: right side of control area
    slider.w = min(200, canvasWidth - 340);
    slider.x = canvasWidth - slider.w - 80;
    slider.y = drawHeight + controlHeight / 2;
}

// ─── Data Generation ────────────────────────────────────────────────────────

function buildData() {
    let employees = [
        // Engineering (6 people)
        { name: 'Alex',    dept: 'Engineering',  ideaCount: 12, topics: ['ML pipelines', 'API design'] },
        { name: 'Priya',   dept: 'Engineering',  ideaCount: 8,  topics: ['Cloud infra', 'DevOps'] },
        { name: 'Carlos',  dept: 'Engineering',  ideaCount: 3,  topics: ['Testing'] },
        { name: 'Dana',    dept: 'Engineering',  ideaCount: 2,  topics: ['Documentation'] },
        { name: 'Hiro',    dept: 'Engineering',  ideaCount: 5,  topics: ['Microservices'] },
        { name: 'Fatima',  dept: 'Engineering',  ideaCount: 1,  topics: ['Bug fixes'] },

        // Product (5 people)
        { name: 'Kim',     dept: 'Product',      ideaCount: 10, topics: ['User research', 'Roadmap'] },
        { name: 'Leo',     dept: 'Product',      ideaCount: 4,  topics: ['UX design'] },
        { name: 'Nora',    dept: 'Product',      ideaCount: 6,  topics: ['Feature specs', 'Analytics'] },
        { name: 'Omar',    dept: 'Product',      ideaCount: 2,  topics: ['A/B testing'] },
        { name: 'Sophie',  dept: 'Product',      ideaCount: 3,  topics: ['Onboarding flow'] },

        // Data Science (5 people)
        { name: 'Raj',     dept: 'Data Science',  ideaCount: 14, topics: ['NLP models', 'Graph analytics', 'LLMs'] },
        { name: 'Wei',     dept: 'Data Science',  ideaCount: 7,  topics: ['Dashboards', 'Metrics'] },
        { name: 'Elena',   dept: 'Data Science',  ideaCount: 4,  topics: ['Data pipelines'] },
        { name: 'Jamal',   dept: 'Data Science',  ideaCount: 1,  topics: ['ETL'] },
        { name: 'Tara',    dept: 'Data Science',  ideaCount: 9,  topics: ['Predictive models', 'Churn'] },

        // Marketing (4 people) -- isolated "idea desert"
        { name: 'Beth',    dept: 'Marketing',    ideaCount: 2,  topics: ['Brand'] },
        { name: 'Marcus',  dept: 'Marketing',    ideaCount: 1,  topics: ['Events'] },
        { name: 'Julia',   dept: 'Marketing',    ideaCount: 3,  topics: ['Content strategy'] },
        { name: 'Dev',     dept: 'Marketing',    ideaCount: 1,  topics: ['Social media'] }
    ];

    // Edge list: [fromIdx, toIdx, ideaFlowWeight, isIdeaFlow]
    // ideaFlowWeight 1-5 for idea flow edges, 0 for general communication
    let edgeList = [
        // ── Engineering internal - idea flow ──
        [0, 1, 3, true],    // Alex -> Priya
        [0, 4, 4, true],    // Alex -> Hiro
        [0, 2, 2, true],    // Alex -> Carlos
        [1, 3, 1, true],    // Priya -> Dana
        [1, 4, 2, true],    // Priya -> Hiro
        [4, 5, 1, true],    // Hiro -> Fatima

        // ── Engineering internal - communication only ──
        [2, 3, 0, false],   // Carlos <-> Dana
        [3, 5, 0, false],   // Dana <-> Fatima
        [2, 5, 0, false],   // Carlos <-> Fatima

        // ── Product internal - idea flow ──
        [6, 7, 3, true],    // Kim -> Leo
        [6, 8, 4, true],    // Kim -> Nora
        [8, 9, 2, true],    // Nora -> Omar
        [8, 10, 2, true],   // Nora -> Sophie
        [6, 10, 1, true],   // Kim -> Sophie

        // ── Product internal - communication only ──
        [7, 9, 0, false],   // Leo <-> Omar
        [9, 10, 0, false],  // Omar <-> Sophie

        // ── Data Science internal - idea flow ──
        [11, 12, 5, true],  // Raj -> Wei (strongest flow)
        [11, 15, 4, true],  // Raj -> Tara
        [11, 13, 2, true],  // Raj -> Elena
        [15, 12, 3, true],  // Tara -> Wei
        [13, 14, 1, true],  // Elena -> Jamal

        // ── Data Science internal - communication only ──
        [12, 14, 0, false], // Wei <-> Jamal
        [13, 15, 0, false], // Elena <-> Tara

        // ── Marketing internal - idea flow (sparse) ──
        [18, 16, 1, true],  // Julia -> Beth
        [18, 19, 1, true],  // Julia -> Dev

        // ── Marketing internal - communication only ──
        [16, 17, 0, false], // Beth <-> Marcus
        [17, 19, 0, false], // Marcus <-> Dev
        [16, 19, 0, false], // Beth <-> Dev

        // ── Cross-department idea flow ──
        [0, 6, 3, true],    // Alex (Eng) -> Kim (Product) -- strong cross
        [11, 0, 4, true],   // Raj (DS) -> Alex (Eng) -- strong cross
        [11, 6, 3, true],   // Raj (DS) -> Kim (Product) -- cross
        [15, 8, 2, true],   // Tara (DS) -> Nora (Product) -- cross
        [1, 12, 2, true],   // Priya (Eng) -> Wei (DS) -- cross
        [6, 18, 1, true],   // Kim (Product) -> Julia (Marketing) -- weak cross

        // ── Cross-department communication only ──
        [7, 16, 0, false],  // Leo (Product) <-> Beth (Marketing)
        [4, 13, 0, false],  // Hiro (Eng) <-> Elena (DS)
        [2, 14, 0, false],  // Carlos (Eng) <-> Jamal (DS)
        [10, 17, 0, false], // Sophie (Product) <-> Marcus (Marketing)
    ];

    // Cluster starting positions
    let cx = canvasWidth / 2;
    let cy = drawHeight / 2 + 10;
    let clusterR = min(canvasWidth, drawHeight) * 0.25;

    deptCenters = {
        'Engineering':  { x: cx - clusterR * 1.1, y: cy - clusterR * 0.7 },
        'Product':      { x: cx + clusterR * 1.1, y: cy - clusterR * 0.7 },
        'Data Science': { x: cx - clusterR * 0.8, y: cy + clusterR * 0.8 },
        'Marketing':    { x: cx + clusterR * 1.0, y: cy + clusterR * 0.9 }
    };

    // Create nodes
    for (let i = 0; i < employees.length; i++) {
        let e = employees[i];
        let center = deptCenters[e.dept];
        let angle = (i * 2.399) + Math.random() * 0.5;
        let r = 25 + Math.random() * 40;

        nodes.push({
            id: i,
            name: e.name,
            dept: e.dept,
            ideaCount: e.ideaCount,
            topics: e.topics,
            x: center.x + cos(angle) * r,
            y: center.y + sin(angle) * r,
            vx: 0,
            vy: 0
        });
    }

    // Create edges
    for (let e of edgeList) {
        edges.push({
            from: e[0],
            to: e[1],
            weight: e[2],
            isIdeaFlow: e[3]
        });
    }
}

function computeSpecialLabels() {
    // Innovation hub: node with highest ideaCount
    let maxIdeas = 0;
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].ideaCount > maxIdeas) {
            maxIdeas = nodes[i].ideaCount;
            innovationHubIdx = i;
        }
    }

    // Idea desert: department with fewest incoming idea flow edges from other departments
    let deptIncoming = {};
    for (let d of departments) deptIncoming[d] = 0;

    for (let e of edges) {
        if (!e.isIdeaFlow) continue;
        let fromDept = nodes[e.from].dept;
        let toDept = nodes[e.to].dept;
        if (fromDept !== toDept) {
            deptIncoming[toDept]++;
        }
    }

    let minIncoming = Infinity;
    for (let d of departments) {
        if (deptIncoming[d] < minIncoming) {
            minIncoming = deptIncoming[d];
            ideaDesertDept = d;
        }
    }
}

// ─── Node Visual Properties ─────────────────────────────────────────────────

function nodeRadius(node) {
    // Size by idea origination count: range 8-25
    let maxIdeas = 14; // Raj has 14
    return map(node.ideaCount, 0, maxIdeas, 8, 25);
}

function nodeColor(node) {
    // Gradient from amber (high originator) to light gray (low)
    let maxIdeas = 14;
    let t = node.ideaCount / maxIdeas;
    return [
        lerp(LIGHT_GRAY[0], AMBER[0], t),
        lerp(LIGHT_GRAY[1], AMBER[1], t),
        lerp(LIGHT_GRAY[2], AMBER[2], t)
    ];
}

// ─── Edge Visual Properties ─────────────────────────────────────────────────

function edgeColor(e) {
    if (!e.isIdeaFlow) return [...EDGE_LOW, 60];
    // Cross-department idea flow: brighter gold
    let fromDept = nodes[e.from].dept;
    let toDept = nodes[e.to].dept;
    let isCross = fromDept !== toDept;

    let t = (e.weight - 1) / 4; // 0 to 1
    if (isCross) {
        return [
            lerp(180, GOLD[0], t),
            lerp(160, GOLD[1], t),
            lerp(60, GOLD[2], t),
            lerp(120, 240, t)
        ];
    }
    return [
        lerp(140, GOLD[0], t),
        lerp(130, GOLD[1], t),
        lerp(40, GOLD[2], t),
        lerp(80, 200, t)
    ];
}

function edgeThickness(e) {
    if (!e.isIdeaFlow) return 0.8;
    return map(e.weight, 1, 5, 1, 4);
}

// ─── Force-Directed Layout ──────────────────────────────────────────────────

function applyForces() {
    if (!simulationActive || !mouseOverCanvas) return;

    let cx = canvasWidth / 2;
    let cy = drawHeight / 2;

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

        // Spring force along edges
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

        // Gentle attraction to department cluster center
        let center = deptCenters[nodes[i].dept];
        fx += (center.x - nodes[i].x) * CLUSTER_PULL;
        fy += (center.y - nodes[i].y) * CLUSTER_PULL;

        // Global gravity toward canvas center
        fx += (cx - nodes[i].x) * GRAVITY * 0.3;
        fy += (cy - nodes[i].y) * GRAVITY * 0.3;

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
        node.y = constrain(node.y, r + 30, drawHeight - r - 10);
    }

    framesSinceInteraction++;
    if (framesSinceInteraction > 400 && totalMovement < 0.3) {
        simulationActive = false;
    }
}

// ─── Drawing ────────────────────────────────────────────────────────────────

function draw() {
    // Dark indigo background for draw region
    noStroke();
    fill(...BG_DARK);
    rect(0, 0, canvasWidth, drawHeight);

    // White control region
    fill(255);
    rect(0, drawHeight, canvasWidth, controlHeight);

    applyForces();

    // Title
    fill(255, 255, 255, 220);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(18);
    textStyle(BOLD);
    text('Idea Flow Network', canvasWidth / 2, 8);
    textStyle(NORMAL);

    // Department cluster labels
    drawDepartmentLabels();

    // Draw edges
    drawEdges();

    // Draw nodes
    for (let n of nodes) {
        drawNode(n);
    }

    // Special labels
    drawSpecialLabels();

    // Controls
    drawToggleButton();
    drawSlider();

    // Tooltip
    if (hoveredNode && !draggedNode) {
        drawTooltip(hoveredNode);
    }

    // Legend
    drawLegend();
}

function drawDepartmentLabels() {
    textAlign(CENTER, CENTER);
    textSize(12);
    noStroke();

    for (let dept of departments) {
        // Compute actual centroid from current node positions
        let avgX = 0, avgY = 0, count = 0;
        for (let n of nodes) {
            if (n.dept === dept) {
                avgX += n.x;
                avgY += n.y;
                count++;
            }
        }
        if (count === 0) continue;
        avgX /= count;
        avgY /= count;

        let col = DEPT_COLORS[dept];
        fill(col[0], col[1], col[2], 90);
        textStyle(BOLD);
        text(dept, avgX, avgY - 55);
        textStyle(NORMAL);
    }
}

function drawEdges() {
    for (let e of edges) {
        // Filter by mode
        if (showIdeaFlowOnly && !e.isIdeaFlow) continue;
        // Filter by threshold
        if (e.isIdeaFlow && e.weight < thresholdValue) continue;

        let fromN = nodes[e.from];
        let toN = nodes[e.to];
        let col = edgeColor(e);
        let thick = edgeThickness(e);

        // Glow effect for high-weight idea flow edges
        if (e.isIdeaFlow && e.weight >= 3) {
            stroke(col[0], col[1], col[2], col[3] * 0.3);
            strokeWeight(thick + 4);
            line(fromN.x, fromN.y, toN.x, toN.y);
        }

        // Main edge line
        stroke(col[0], col[1], col[2], col[3] || 200);
        strokeWeight(thick);
        line(fromN.x, fromN.y, toN.x, toN.y);

        // Arrow for idea flow edges
        if (e.isIdeaFlow) {
            drawArrow(fromN, toN, col, thick);
        }
    }
}

function drawArrow(fromN, toN, col, thick) {
    let dx = toN.x - fromN.x;
    let dy = toN.y - fromN.y;
    let d = Math.sqrt(dx * dx + dy * dy);
    if (d < 1) return;

    let toR = nodeRadius(toN);
    // Arrow sits at edge of target node
    let ratio = (d - toR - 3) / d;
    let ax = fromN.x + dx * ratio;
    let ay = fromN.y + dy * ratio;

    let angle = atan2(dy, dx);
    let arrowSize = min(thick * 2.5 + 3, 12);

    fill(col[0], col[1], col[2], col[3] || 200);
    noStroke();
    push();
    translate(ax, ay);
    rotate(angle);
    triangle(0, 0, -arrowSize, -arrowSize * 0.4, -arrowSize, arrowSize * 0.4);
    pop();
}

function drawNode(n) {
    let r = nodeRadius(n);
    let col = nodeColor(n);
    let isHovered = (hoveredNode === n);
    let isHub = (n.id === innovationHubIdx);

    // Glow for hovered node
    if (isHovered) {
        noStroke();
        fill(GOLD[0], GOLD[1], GOLD[2], 50);
        ellipse(n.x, n.y, r * 2 + 20);
        fill(GOLD[0], GOLD[1], GOLD[2], 30);
        ellipse(n.x, n.y, r * 2 + 34);
    }

    // Innovation hub ring
    if (isHub) {
        noFill();
        stroke(GOLD[0], GOLD[1], GOLD[2], 180);
        strokeWeight(2);
        ellipse(n.x, n.y, r * 2 + 10);
    }

    // Node body
    stroke(isHovered ? GOLD : [255, 255, 255, 100]);
    strokeWeight(isHovered ? 2 : 1);
    fill(col[0], col[1], col[2]);
    ellipse(n.x, n.y, r * 2);

    // Name label (white)
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(constrain(r * 0.7, 7, 11));
    text(n.name, n.x, n.y);
}

function drawSpecialLabels() {
    // "Innovation Hub" label
    if (innovationHubIdx >= 0) {
        let n = nodes[innovationHubIdx];
        let r = nodeRadius(n);
        fill(GOLD[0], GOLD[1], GOLD[2], 220);
        noStroke();
        textAlign(CENTER, BOTTOM);
        textSize(10);
        textStyle(BOLD);
        text('Innovation Hub', n.x, n.y - r - 8);
        textStyle(NORMAL);
    }

    // "Idea Desert" label on the department cluster
    if (ideaDesertDept) {
        let avgX = 0, avgY = 0, count = 0, maxY = 0;
        for (let n of nodes) {
            if (n.dept === ideaDesertDept) {
                avgX += n.x;
                avgY += n.y;
                if (n.y > maxY) maxY = n.y;
                count++;
            }
        }
        if (count > 0) {
            avgX /= count;
            fill(255, 100, 100, 200);
            noStroke();
            textAlign(CENTER, TOP);
            textSize(10);
            textStyle(BOLD);
            text('Idea Desert', avgX, maxY + 18);
            textStyle(NORMAL);
        }
    }
}

function drawTooltip(n) {
    let tw = 200;
    let th = 90;
    let tx = n.x + nodeRadius(n) + 14;
    let ty = n.y - th / 2;

    // Keep on screen
    if (tx + tw > canvasWidth - 10) tx = n.x - nodeRadius(n) - tw - 14;
    if (ty < 40) ty = 40;
    if (ty + th > drawHeight - 10) ty = drawHeight - th - 10;

    // Shadow
    noStroke();
    fill(0, 0, 0, 60);
    rect(tx + 3, ty + 3, tw, th, 8);

    // Background
    fill(30, 35, 80, 240);
    stroke(GOLD[0], GOLD[1], GOLD[2], 150);
    strokeWeight(1);
    rect(tx, ty, tw, th, 8);

    // Content
    noStroke();
    textAlign(LEFT, TOP);

    // Name
    fill(255);
    textSize(13);
    textStyle(BOLD);
    text(n.name, tx + 10, ty + 8);
    textStyle(NORMAL);

    // Department
    let dcol = DEPT_COLORS[n.dept];
    fill(dcol[0], dcol[1], dcol[2]);
    textSize(10);
    text(n.dept, tx + 10, ty + 26);

    // Idea count
    fill(GOLD[0], GOLD[1], GOLD[2]);
    textSize(11);
    text('Ideas originated: ' + n.ideaCount, tx + 10, ty + 42);

    // Topics
    fill(200, 200, 220);
    textSize(9);
    let topicStr = 'Topics: ' + n.topics.join(', ');
    // Truncate if too long
    if (topicStr.length > 35) topicStr = topicStr.substring(0, 32) + '...';
    text(topicStr, tx + 10, ty + 60);

    // Hub/desert indicator
    if (n.id === innovationHubIdx) {
        fill(GOLD[0], GOLD[1], GOLD[2], 200);
        textSize(9);
        textStyle(BOLD);
        text('INNOVATION HUB', tx + 10, ty + 76);
        textStyle(NORMAL);
    }
}

function drawLegend() {
    let lx = 12;
    let ly = 34;

    // Background
    fill(20, 28, 100, 180);
    noStroke();
    rect(lx, ly, 140, 78, 6);

    textAlign(LEFT, CENTER);
    textSize(9);
    noStroke();

    // High originator
    fill(AMBER[0], AMBER[1], AMBER[2]);
    ellipse(lx + 14, ly + 14, 10);
    fill(200);
    text('High originator', lx + 24, ly + 14);

    // Low originator
    fill(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
    ellipse(lx + 14, ly + 30, 7);
    fill(200);
    text('Low originator', lx + 24, ly + 30);

    // Strong idea flow
    stroke(GOLD[0], GOLD[1], GOLD[2], 220);
    strokeWeight(3);
    line(lx + 7, ly + 46, lx + 21, ly + 46);
    noStroke();
    fill(200);
    text('Strong idea flow', lx + 24, ly + 46);

    // Cross-dept flow
    stroke(GOLD[0], GOLD[1], GOLD[2], 250);
    strokeWeight(2);
    let dashX = lx + 7;
    line(dashX, ly + 62, dashX + 5, ly + 62);
    line(dashX + 8, ly + 62, dashX + 14, ly + 62);
    noStroke();
    fill(GOLD[0], GOLD[1], GOLD[2], 200);
    text('Cross-dept flow', lx + 24, ly + 62);
}

// ─── Controls ───────────────────────────────────────────────────────────────

function drawToggleButton() {
    let bx = toggleBtn.x;
    let by = toggleBtn.y;
    let bw = toggleBtn.w;
    let bh = toggleBtn.h;

    let isHover = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;

    // Button background
    if (showIdeaFlowOnly) {
        fill(isHover ? 60 : 40, isHover ? 55 : 45, isHover ? 140 : 120);
    } else {
        fill(isHover ? 80 : 60, isHover ? 80 : 60, isHover ? 80 : 60);
    }
    stroke(150);
    strokeWeight(1);
    rect(bx, by, bw, bh, 6);

    // Label
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(11);
    let label = showIdeaFlowOnly ? 'Idea Flow Only' : 'All Communication';
    text(label, bx + bw / 2, by + bh / 2);
}

function drawSlider() {
    let sx = slider.x;
    let sy = slider.y;
    let sw = slider.w;

    // Label
    fill(80);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(11);
    text('Min Weight:', sx - 80, sy);

    // Track
    stroke(180);
    strokeWeight(2);
    line(sx, sy, sx + sw, sy);

    // Tick marks and labels
    fill(120);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(9);
    for (let v = 1; v <= 5; v++) {
        let tx = sx + map(v, 1, 5, 0, sw);
        stroke(160);
        strokeWeight(1);
        line(tx, sy - 4, tx, sy + 4);
        noStroke();
        fill(100);
        text(v, tx, sy + 8);
    }

    // Knob
    let knobX = sx + map(thresholdValue, 1, 5, 0, sw);
    fill(48, 63, 159);
    stroke(255);
    strokeWeight(1.5);
    ellipse(knobX, sy, slider.knobR * 2);

    // Value label on knob
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(10);
    textStyle(BOLD);
    text(thresholdValue, knobX, sy);
    textStyle(NORMAL);
}

// ─── Interaction ────────────────────────────────────────────────────────────

function mousePressed() {
    // Check toggle button
    if (mouseX > toggleBtn.x && mouseX < toggleBtn.x + toggleBtn.w &&
        mouseY > toggleBtn.y && mouseY < toggleBtn.y + toggleBtn.h) {
        showIdeaFlowOnly = !showIdeaFlowOnly;
        return;
    }

    // Check slider
    let knobX = slider.x + map(thresholdValue, 1, 5, 0, slider.w);
    if (dist(mouseX, mouseY, knobX, slider.y) < slider.knobR + 5) {
        sliderDragging = true;
        return;
    }

    // Check if clicking on slider track area
    if (mouseY > slider.y - 15 && mouseY < slider.y + 20 &&
        mouseX > slider.x - 5 && mouseX < slider.x + slider.w + 5) {
        let val = map(mouseX, slider.x, slider.x + slider.w, 1, 5);
        thresholdValue = constrain(round(val), 1, 5);
        sliderDragging = true;
        return;
    }

    // Check nodes for dragging (only in draw area)
    if (mouseY < drawHeight) {
        for (let n of nodes) {
            let d = dist(mouseX, mouseY, n.x, n.y);
            if (d < nodeRadius(n) + 4) {
                draggedNode = n;
                dragOffsetX = n.x - mouseX;
                dragOffsetY = n.y - mouseY;
                simulationActive = true;
                framesSinceInteraction = 0;
                return;
            }
        }
    }
}

function mouseDragged() {
    if (sliderDragging) {
        let val = map(mouseX, slider.x, slider.x + slider.w, 1, 5);
        thresholdValue = constrain(round(val), 1, 5);
        return;
    }

    if (draggedNode) {
        draggedNode.x = mouseX + dragOffsetX;
        draggedNode.y = mouseY + dragOffsetY;
        // Keep within draw bounds
        let r = nodeRadius(draggedNode);
        draggedNode.x = constrain(draggedNode.x, r + 10, canvasWidth - r - 10);
        draggedNode.y = constrain(draggedNode.y, r + 30, drawHeight - r - 10);
        draggedNode.vx = 0;
        draggedNode.vy = 0;
        simulationActive = true;
        framesSinceInteraction = 0;
    }
}

function mouseReleased() {
    draggedNode = null;
    sliderDragging = false;
}

function mouseMoved() {
    hoveredNode = null;
    if (mouseY < drawHeight) {
        for (let n of nodes) {
            let d = dist(mouseX, mouseY, n.x, n.y);
            if (d < nodeRadius(n) + 4) {
                hoveredNode = n;
                break;
            }
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
    hoveredNode = null;
}

function windowResized() {
    updateCanvasSize();
    canvasHeight = drawHeight + controlHeight;
    resizeCanvas(canvasWidth, canvasHeight);

    // Update department cluster centers
    let cx = canvasWidth / 2;
    let cy = drawHeight / 2 + 10;
    let clusterR = min(canvasWidth, drawHeight) * 0.25;

    deptCenters = {
        'Engineering':  { x: cx - clusterR * 1.1, y: cy - clusterR * 0.7 },
        'Product':      { x: cx + clusterR * 1.1, y: cy - clusterR * 0.7 },
        'Data Science': { x: cx - clusterR * 0.8, y: cy + clusterR * 0.8 },
        'Marketing':    { x: cx + clusterR * 1.0, y: cy + clusterR * 0.9 }
    };

    layoutControls();
    simulationActive = true;
    framesSinceInteraction = 0;
}
