// Subgraph Comparison MicroSim
// Split-screen comparing two department subgraphs with computed metrics

let canvasWidth = 900;
const canvasHeight = 550;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

const DEPT_NAMES = ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR'];

// Department colors for nodes
const DEPT_COLORS = {
    Engineering: [92, 107, 192],
    Sales: [76, 175, 80],
    Marketing: [156, 39, 176],
    Finance: [0, 150, 136],
    HR: [255, 112, 67]
};

let leftDept = 0;   // index into DEPT_NAMES
let rightDept = 2;   // index into DEPT_NAMES

// Pre-built department graph data
// Each department has nodes with relative positions (0-1 range) and edges
const departments = {};

function buildDepartments() {
    // Engineering: 10 nodes, 18 edges, density ~0.40, clustering ~0.52
    departments['Engineering'] = {
        nodes: [
            { id: 0, label: 'E1', rx: 0.5, ry: 0.15 },
            { id: 1, label: 'E2', rx: 0.25, ry: 0.3 },
            { id: 2, label: 'E3', rx: 0.75, ry: 0.3 },
            { id: 3, label: 'E4', rx: 0.15, ry: 0.55 },
            { id: 4, label: 'E5', rx: 0.4, ry: 0.5 },
            { id: 5, label: 'E6', rx: 0.6, ry: 0.5 },
            { id: 6, label: 'E7', rx: 0.85, ry: 0.55 },
            { id: 7, label: 'E8', rx: 0.3, ry: 0.75 },
            { id: 8, label: 'E9', rx: 0.5, ry: 0.85 },
            { id: 9, label: 'E10', rx: 0.7, ry: 0.75 }
        ],
        edges: [
            [0,1],[0,2],[1,2],[1,3],[1,4],[2,5],[2,6],
            [3,4],[3,7],[4,5],[4,8],[5,6],[5,9],
            [7,8],[8,9],[6,9],[0,4],[0,5]
        ]
    };

    // Sales: 8 nodes, 10 edges, density ~0.36, clustering ~0.38
    departments['Sales'] = {
        nodes: [
            { id: 0, label: 'S1', rx: 0.5, ry: 0.12 },
            { id: 1, label: 'S2', rx: 0.2, ry: 0.3 },
            { id: 2, label: 'S3', rx: 0.8, ry: 0.3 },
            { id: 3, label: 'S4', rx: 0.35, ry: 0.55 },
            { id: 4, label: 'S5', rx: 0.65, ry: 0.55 },
            { id: 5, label: 'S6', rx: 0.15, ry: 0.75 },
            { id: 6, label: 'S7', rx: 0.5, ry: 0.82 },
            { id: 7, label: 'S8', rx: 0.85, ry: 0.75 }
        ],
        edges: [
            [0,1],[0,2],[1,3],[2,4],[3,5],[3,6],
            [4,6],[4,7],[5,6],[6,7]
        ]
    };

    // Marketing: 8 nodes, 14 edges, density ~0.50, clustering ~0.61
    departments['Marketing'] = {
        nodes: [
            { id: 0, label: 'M1', rx: 0.5, ry: 0.12 },
            { id: 1, label: 'M2', rx: 0.22, ry: 0.32 },
            { id: 2, label: 'M3', rx: 0.78, ry: 0.32 },
            { id: 3, label: 'M4', rx: 0.35, ry: 0.55 },
            { id: 4, label: 'M5', rx: 0.65, ry: 0.55 },
            { id: 5, label: 'M6', rx: 0.2, ry: 0.78 },
            { id: 6, label: 'M7', rx: 0.5, ry: 0.85 },
            { id: 7, label: 'M8', rx: 0.8, ry: 0.78 }
        ],
        edges: [
            [0,1],[0,2],[0,3],[1,2],[1,3],[1,5],
            [2,4],[2,7],[3,4],[3,5],[3,6],
            [4,6],[4,7],[5,6]
        ]
    };

    // Finance: 9 nodes, 12 edges, density ~0.33, clustering ~0.44
    departments['Finance'] = {
        nodes: [
            { id: 0, label: 'F1', rx: 0.5, ry: 0.1 },
            { id: 1, label: 'F2', rx: 0.22, ry: 0.28 },
            { id: 2, label: 'F3', rx: 0.78, ry: 0.28 },
            { id: 3, label: 'F4', rx: 0.12, ry: 0.52 },
            { id: 4, label: 'F5', rx: 0.4, ry: 0.48 },
            { id: 5, label: 'F6', rx: 0.6, ry: 0.48 },
            { id: 6, label: 'F7', rx: 0.88, ry: 0.52 },
            { id: 7, label: 'F8', rx: 0.35, ry: 0.78 },
            { id: 8, label: 'F9', rx: 0.65, ry: 0.78 }
        ],
        edges: [
            [0,1],[0,2],[1,3],[1,4],[2,5],[2,6],
            [3,4],[3,7],[4,5],[5,6],[5,8],[7,8]
        ]
    };

    // HR: 7 nodes, 12 edges, density ~0.57, clustering ~0.72
    departments['HR'] = {
        nodes: [
            { id: 0, label: 'H1', rx: 0.5, ry: 0.12 },
            { id: 1, label: 'H2', rx: 0.22, ry: 0.35 },
            { id: 2, label: 'H3', rx: 0.78, ry: 0.35 },
            { id: 3, label: 'H4', rx: 0.3, ry: 0.6 },
            { id: 4, label: 'H5', rx: 0.7, ry: 0.6 },
            { id: 5, label: 'H6', rx: 0.35, ry: 0.85 },
            { id: 6, label: 'H7', rx: 0.65, ry: 0.85 }
        ],
        edges: [
            [0,1],[0,2],[1,2],[1,3],[2,4],
            [3,4],[3,5],[3,6],[4,5],[4,6],[5,6],[0,4]
        ]
    };
}

// Compute graph metrics for a department
function computeMetrics(deptName) {
    let dept = departments[deptName];
    let n = dept.nodes.length;
    let m = dept.edges.length;

    // Density = 2m / (n*(n-1))
    let density = (2 * m) / (n * (n - 1));

    // Build adjacency for clustering and path length
    let adj = [];
    for (let i = 0; i < n; i++) adj[i] = [];
    for (let e of dept.edges) {
        adj[e[0]].push(e[1]);
        adj[e[1]].push(e[0]);
    }

    // Average clustering coefficient
    let totalCC = 0;
    for (let i = 0; i < n; i++) {
        let neighbors = adj[i];
        let k = neighbors.length;
        if (k < 2) continue;
        let triangles = 0;
        for (let a = 0; a < k; a++) {
            for (let b = a + 1; b < k; b++) {
                if (adj[neighbors[a]].includes(neighbors[b])) {
                    triangles++;
                }
            }
        }
        totalCC += (2 * triangles) / (k * (k - 1));
    }
    let avgClustering = totalCC / n;

    // Average path length (BFS from each node)
    let totalDist = 0;
    let pairs = 0;
    for (let s = 0; s < n; s++) {
        let distArr = new Array(n).fill(-1);
        distArr[s] = 0;
        let queue = [s];
        while (queue.length > 0) {
            let v = queue.shift();
            for (let w of adj[v]) {
                if (distArr[w] < 0) {
                    distArr[w] = distArr[v] + 1;
                    queue.push(w);
                }
            }
        }
        for (let j = s + 1; j < n; j++) {
            if (distArr[j] > 0) {
                totalDist += distArr[j];
                pairs++;
            }
        }
    }
    let avgPathLength = pairs > 0 ? totalDist / pairs : 0;

    return {
        nodeCount: n,
        edgeCount: m,
        density: density,
        clustering: avgClustering,
        avgPathLength: avgPathLength
    };
}

// Button layout
const HEADER_H = 42;
const SELECTOR_H = 36;
const GRAPH_TOP = HEADER_H + SELECTOR_H + 8;
const GRAPH_H = 220;
const METRICS_TOP = GRAPH_TOP + GRAPH_H + 10;

let leftButtons = [];
let rightButtons = [];

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');
    buildDepartments();
    layoutButtons();
}

function layoutButtons() {
    leftButtons = [];
    rightButtons = [];
    let halfW = canvasWidth / 2;
    let btnW = 72;
    let gap = 4;
    let totalBtnW = DEPT_NAMES.length * btnW + (DEPT_NAMES.length - 1) * gap;

    // Left panel buttons
    let leftStart = (halfW - totalBtnW) / 2;
    for (let i = 0; i < DEPT_NAMES.length; i++) {
        leftButtons.push({
            label: DEPT_NAMES[i].substring(0, 5) + (DEPT_NAMES[i].length > 5 ? '.' : ''),
            fullLabel: DEPT_NAMES[i],
            idx: i,
            x: leftStart + i * (btnW + gap),
            y: HEADER_H + 4,
            w: btnW,
            h: 28
        });
    }
    // Right panel buttons
    let rightStart = halfW + (halfW - totalBtnW) / 2;
    for (let i = 0; i < DEPT_NAMES.length; i++) {
        rightButtons.push({
            label: DEPT_NAMES[i].substring(0, 5) + (DEPT_NAMES[i].length > 5 ? '.' : ''),
            fullLabel: DEPT_NAMES[i],
            idx: i,
            x: rightStart + i * (btnW + gap),
            y: HEADER_H + 4,
            w: btnW,
            h: 28
        });
    }
}

function draw() {
    background(245);
    let halfW = canvasWidth / 2;

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text('Department Subgraph Comparison', canvasWidth / 2, 20);

    // Divider line
    stroke(200);
    strokeWeight(1);
    line(halfW, HEADER_H, halfW, canvasHeight - 8);

    // Panel labels
    fill(...INDIGO);
    noStroke();
    textSize(12);
    textAlign(CENTER, CENTER);
    text('Left Panel', halfW / 2, HEADER_H - 8);
    text('Right Panel', halfW + halfW / 2, HEADER_H - 8);

    // Draw selector buttons
    drawSelectorButtons(leftButtons, leftDept);
    drawSelectorButtons(rightButtons, rightDept);

    // Draw graphs
    let leftName = DEPT_NAMES[leftDept];
    let rightName = DEPT_NAMES[rightDept];

    drawMiniGraph(leftName, 12, GRAPH_TOP, halfW - 18, GRAPH_H);
    drawMiniGraph(rightName, halfW + 6, GRAPH_TOP, halfW - 18, GRAPH_H);

    // Compute and draw metrics
    let leftMetrics = computeMetrics(leftName);
    let rightMetrics = computeMetrics(rightName);

    drawMetrics(leftMetrics, leftName, 12, METRICS_TOP, halfW - 18);
    drawMetrics(rightMetrics, rightName, halfW + 6, METRICS_TOP, halfW - 18);

    // Comparison bar at bottom
    drawComparisonBar(leftMetrics, rightMetrics, leftName, rightName);
}

function drawSelectorButtons(btns, selectedIdx) {
    for (let b of btns) {
        let isActive = (b.idx === selectedIdx);
        let isHover = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;

        if (isActive) {
            fill(...INDIGO);
        } else if (isHover) {
            fill(92, 107, 192);
        } else {
            fill(200);
        }
        noStroke();
        rect(b.x, b.y, b.w, b.h, 5);

        fill(isActive ? 255 : 60);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        text(b.label, b.x + b.w / 2, b.y + b.h / 2);
    }
}

function drawMiniGraph(deptName, px, py, pw, ph) {
    // Background panel
    fill(255);
    stroke(210);
    strokeWeight(1);
    rect(px, py, pw, ph, 6);

    // Department name inside panel
    fill(...INDIGO);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(13);
    text(deptName, px + pw / 2, py + 5);

    let dept = departments[deptName];
    let col = DEPT_COLORS[deptName];
    let padX = 30;
    let padY = 28;
    let graphW = pw - padX * 2;
    let graphH = ph - padY - 18;

    // Draw edges
    stroke(180);
    strokeWeight(1.2);
    for (let e of dept.edges) {
        let n1 = dept.nodes[e[0]];
        let n2 = dept.nodes[e[1]];
        let x1 = px + padX + n1.rx * graphW;
        let y1 = py + padY + n1.ry * graphH;
        let x2 = px + padX + n2.rx * graphW;
        let y2 = py + padY + n2.ry * graphH;
        line(x1, y1, x2, y2);
    }

    // Draw nodes
    for (let nd of dept.nodes) {
        let nx = px + padX + nd.rx * graphW;
        let ny = py + padY + nd.ry * graphH;
        let r = 14;

        fill(...col);
        stroke(255);
        strokeWeight(1.5);
        ellipse(nx, ny, r * 2);

        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(8);
        text(nd.label, nx, ny);
    }
}

function drawMetrics(metrics, deptName, px, py, pw) {
    let mh = 82;
    fill(255, 252, 245);
    stroke(210);
    strokeWeight(1);
    rect(px, py, pw, mh, 6);

    let col = DEPT_COLORS[deptName];
    fill(60);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(11);

    let mx = px + 10;
    let my = py + 8;
    let lineH = 14;

    fill(80);
    text('Nodes: ' + metrics.nodeCount, mx, my);
    text('Edges: ' + metrics.edgeCount, mx + pw / 2 - 10, my);
    my += lineH;
    text('Density: ' + nf(metrics.density, 0, 3), mx, my);
    text('Clustering: ' + nf(metrics.clustering, 0, 3), mx + pw / 2 - 10, my);
    my += lineH;
    text('Avg Path Length: ' + nf(metrics.avgPathLength, 0, 2), mx, my);

    // Mini density bar
    my += lineH + 4;
    fill(220);
    noStroke();
    rect(mx, my, pw - 20, 10, 3);
    fill(...col);
    rect(mx, my, (pw - 20) * metrics.density, 10, 3);

    fill(100);
    textSize(9);
    textAlign(LEFT, CENTER);
    text('density', mx + pw - 16, my + 5);
}

function drawComparisonBar(leftM, rightM, leftName, rightName) {
    let barY = canvasHeight - 58;
    let barH = 52;

    fill(255);
    stroke(210);
    strokeWeight(1);
    rect(10, barY, canvasWidth - 20, barH, 6);

    fill(50);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(11);
    text('Metric Comparison:', 18, barY + 12);

    // Compare key metrics, highlight if >20% difference
    let metrics = [
        { label: 'Density', l: leftM.density, r: rightM.density },
        { label: 'Clustering', l: leftM.clustering, r: rightM.clustering },
        { label: 'Avg Path', l: leftM.avgPathLength, r: rightM.avgPathLength }
    ];

    let chipX = 150;
    let chipY = barY + 4;
    let chipH = 20;

    for (let m of metrics) {
        let avg = (m.l + m.r) / 2;
        let diff = avg > 0.001 ? Math.abs(m.l - m.r) / avg : 0;
        let significant = diff > 0.2;
        let chipW = textWidth(m.label + ': ' + nf(m.l, 0, 2) + ' vs ' + nf(m.r, 0, 2)) + 20;
        if (chipW < 100) chipW = 100;

        if (significant) {
            fill(...AMBER, 50);
            stroke(...AMBER);
        } else {
            fill(240);
            stroke(210);
        }
        strokeWeight(1);
        rect(chipX, chipY, chipW, chipH, 4);

        fill(significant ? [160, 90, 0] : [100]);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        text(m.label + ': ' + nf(m.l, 0, 2) + ' vs ' + nf(m.r, 0, 2), chipX + chipW / 2, chipY + chipH / 2);

        chipX += chipW + 8;
    }

    // Legend for comparison bar
    fill(130);
    textAlign(LEFT, CENTER);
    textSize(9);
    let legendY = barY + barH - 14;
    fill(...AMBER);
    noStroke();
    rect(18, legendY - 4, 10, 10, 2);
    fill(100);
    text('Amber = >20% difference', 32, legendY + 1);

    // Show which side is which
    fill(80);
    textSize(9);
    textAlign(RIGHT, CENTER);
    text('Left: ' + leftName + '  |  Right: ' + rightName, canvasWidth - 18, legendY + 1);
}

function mousePressed() {
    // Check left buttons
    for (let b of leftButtons) {
        if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
            leftDept = b.idx;
            return;
        }
    }
    // Check right buttons
    for (let b of rightButtons) {
        if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
            rightDept = b.idx;
            return;
        }
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    layoutButtons();
}
