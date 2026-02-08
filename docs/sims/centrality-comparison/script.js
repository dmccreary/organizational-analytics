// Centrality Comparison Dashboard - p5.js MicroSim
// Compare degree, betweenness, and closeness centrality on the same graph

let canvasWidth = 900;
const canvasHeight = 640;
let nodes = [];
let edges = [];
let mode = 'degree'; // 'degree', 'betweenness', 'closeness'
let hoveredNode = null;
let draggedNode = null;
let dragOffsetX = 0, dragOffsetY = 0;

const GRAPH_TOP = 55;
const GRAPH_BOTTOM = 400;
const BAR_TOP = 415;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];

const buttons = [
    { label: 'Degree', mode: 'degree', x: 0, y: 10, w: 100, h: 32 },
    { label: 'Betweenness', mode: 'betweenness', x: 0, y: 10, w: 120, h: 32 },
    { label: 'Closeness', mode: 'closeness', x: 0, y: 10, w: 110, h: 32 }
];

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');

    let totalW = 100 + 120 + 110 + 20;
    let startX = (canvasWidth - totalW) / 2;
    buttons[0].x = startX;
    buttons[1].x = startX + 120;
    buttons[2].x = startX + 260;

    buildGraph();
    computeAllCentralities();
}

function buildGraph() {
    // 13 employees across 3 departments with specific structural roles
    const empData = [
        // Engineering cluster
        { name: 'Alice', dept: 'Engineering', col: [92, 107, 192] },
        { name: 'Bob', dept: 'Engineering', col: [92, 107, 192] },
        { name: 'Carlos', dept: 'Engineering', col: [92, 107, 192] },
        { name: 'Dana', dept: 'Engineering', col: [92, 107, 192] },
        // Product cluster
        { name: 'Elena', dept: 'Product', col: [212, 136, 15] },
        { name: 'Frank', dept: 'Product', col: [212, 136, 15] },
        { name: 'Grace', dept: 'Product', col: [212, 136, 15] },
        { name: 'Hiro', dept: 'Product', col: [212, 136, 15] },
        // Sales cluster
        { name: 'Ines', dept: 'Sales', col: [76, 175, 80] },
        { name: 'Jake', dept: 'Sales', col: [76, 175, 80] },
        { name: 'Kim', dept: 'Sales', col: [76, 175, 80] },
        { name: 'Leo', dept: 'Sales', col: [76, 175, 80] },
        // Central connector
        { name: 'Maya', dept: 'Operations', col: [156, 39, 176] }
    ];

    let cx = canvasWidth / 2;
    let cy = (GRAPH_TOP + GRAPH_BOTTOM) / 2 + 10;

    // Position clusters
    const positions = [
        // Engineering (top-left)
        { x: cx - 180, y: cy - 100 },
        { x: cx - 250, y: cy - 40 },
        { x: cx - 180, y: cy + 20 },
        { x: cx - 110, y: cy - 40 },
        // Product (top-right)
        { x: cx + 180, y: cy - 100 },
        { x: cx + 250, y: cy - 40 },
        { x: cx + 180, y: cy + 20 },
        { x: cx + 110, y: cy - 40 },
        // Sales (bottom)
        { x: cx - 70, y: cy + 120 },
        { x: cx + 70, y: cy + 120 },
        { x: cx, y: cy + 170 },
        { x: cx, y: cy + 80 },
        // Maya (center bridge)
        { x: cx, y: cy - 10 }
    ];

    for (let i = 0; i < empData.length; i++) {
        nodes.push({
            id: i, name: empData[i].name, dept: empData[i].dept,
            color: empData[i].col,
            x: positions[i].x, y: positions[i].y,
            degree: 0, betweenness: 0, closeness: 0
        });
    }

    // Edges (undirected for centrality comparison)
    // Alice=0, Bob=1, Carlos=2, Dana=3, Elena=4, Frank=5, Grace=6, Hiro=7
    // Ines=8, Jake=9, Kim=10, Leo=11, Maya=12
    const edgeList = [
        // Engineering internal (Alice is the hub - many connections)
        [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3],
        // Product internal
        [4, 5], [4, 6], [4, 7], [5, 6], [6, 7],
        // Sales internal
        [8, 9], [8, 10], [9, 10], [9, 11], [10, 11],
        // Maya bridges ALL clusters (high betweenness)
        [12, 3], [12, 7], [12, 11],
        // Leo connects to all clusters too (high closeness - central position)
        [11, 3], [11, 7],
        // Additional cross links
        [0, 4], [8, 5]
    ];

    for (let e of edgeList) {
        edges.push({ from: e[0], to: e[1] });
    }
}

function computeAllCentralities() {
    let n = nodes.length;

    // Degree centrality
    for (let nd of nodes) nd.degree = 0;
    for (let e of edges) {
        nodes[e.from].degree++;
        nodes[e.to].degree++;
    }

    // Build adjacency list for BFS
    let adj = [];
    for (let i = 0; i < n; i++) adj[i] = [];
    for (let e of edges) {
        adj[e.from].push(e.to);
        adj[e.to].push(e.from);
    }

    // Betweenness centrality (Brandes algorithm simplified)
    for (let nd of nodes) nd.betweenness = 0;

    for (let s = 0; s < n; s++) {
        let stack = [];
        let pred = [];
        for (let i = 0; i < n; i++) pred[i] = [];
        let sigma = new Array(n).fill(0);
        sigma[s] = 1;
        let distArr = new Array(n).fill(-1);
        distArr[s] = 0;
        let queue = [s];

        while (queue.length > 0) {
            let v = queue.shift();
            stack.push(v);
            for (let w of adj[v]) {
                if (distArr[w] < 0) {
                    queue.push(w);
                    distArr[w] = distArr[v] + 1;
                }
                if (distArr[w] === distArr[v] + 1) {
                    sigma[w] += sigma[v];
                    pred[w].push(v);
                }
            }
        }

        let delta = new Array(n).fill(0);
        while (stack.length > 0) {
            let w = stack.pop();
            for (let v of pred[w]) {
                delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
            }
            if (w !== s) {
                nodes[w].betweenness += delta[w];
            }
        }
    }
    // Normalize betweenness (undirected: divide by 2)
    for (let nd of nodes) nd.betweenness /= 2;

    // Closeness centrality
    for (let i = 0; i < n; i++) {
        let distArr = new Array(n).fill(-1);
        distArr[i] = 0;
        let queue = [i];
        while (queue.length > 0) {
            let v = queue.shift();
            for (let w of adj[v]) {
                if (distArr[w] < 0) {
                    distArr[w] = distArr[v] + 1;
                    queue.push(w);
                }
            }
        }
        let totalDist = 0;
        let reachable = 0;
        for (let j = 0; j < n; j++) {
            if (j !== i && distArr[j] > 0) {
                totalDist += distArr[j];
                reachable++;
            }
        }
        nodes[i].closeness = reachable > 0 ? reachable / totalDist : 0;
    }
}

function getScore(node) {
    return node[mode];
}

function getMaxScore() {
    let mx = 0.001;
    for (let n of nodes) {
        let s = getScore(n);
        if (s > mx) mx = s;
    }
    return mx;
}

function nodeRadius(node) {
    let maxS = getMaxScore();
    let s = getScore(node);
    return map(s, 0, maxS, 14, 34);
}

function nodeColor(node) {
    let maxS = getMaxScore();
    let s = getScore(node);
    let t = s / maxS;
    return [lerp(AMBER[0], INDIGO[0], t), lerp(AMBER[1], INDIGO[1], t), lerp(AMBER[2], INDIGO[2], t)];
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(15);
    text('Centrality Comparison Dashboard', canvasWidth / 2, 25);

    drawButtons();

    // Department labels
    fill(120);
    textSize(11);
    textAlign(CENTER, CENTER);
    let cx = canvasWidth / 2;
    text('Engineering', cx - 180, GRAPH_TOP + 2);
    text('Product', cx + 180, GRAPH_TOP + 2);
    text('Sales', GRAPH_BOTTOM - 5, GRAPH_BOTTOM - 5);

    // Draw edges
    for (let e of edges) {
        stroke(180);
        strokeWeight(1.2);
        line(nodes[e.from].x, nodes[e.from].y, nodes[e.to].x, nodes[e.to].y);
    }

    // Draw nodes
    for (let n of nodes) {
        let r = nodeRadius(n);
        let col = nodeColor(n);
        let isHovered = (hoveredNode === n);

        if (isHovered) {
            noStroke();
            fill(...GOLD, 70);
            ellipse(n.x, n.y, r * 2 + 18);
        }

        // Top-ranked gold ring
        let sorted = [...nodes].sort((a, b) => getScore(b) - getScore(a));
        let isTop = (sorted[0] === n);

        stroke(isTop ? GOLD : (isHovered ? GOLD : [80]));
        strokeWeight(isTop ? 3 : (isHovered ? 3 : 1.5));
        fill(...col);
        ellipse(n.x, n.y, r * 2);

        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(constrain(r * 0.6, 8, 13));
        text(n.name, n.x, n.y);
    }

    // Tooltip
    if (hoveredNode && !draggedNode) {
        drawTooltip(hoveredNode);
    }

    // Bar chart
    drawBarChart();
}

function drawButtons() {
    for (let b of buttons) {
        let isActive = (mode === b.mode);
        let isHover = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
        fill(isActive ? INDIGO : (isHover ? [92, 107, 192] : [180]));
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

function drawTooltip(n) {
    let tw = 195;
    let th = 82;
    let tx = n.x + nodeRadius(n) + 12;
    let ty = n.y - th / 2;
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
    text('Degree:       ' + n.degree, tx + 8, ty + 26);
    text('Betweenness:  ' + nf(n.betweenness, 0, 1), tx + 8, ty + 42);
    text('Closeness:    ' + nf(n.closeness, 0, 3), tx + 8, ty + 58);

    let modeY = mode === 'degree' ? ty + 26 : mode === 'betweenness' ? ty + 42 : ty + 58;
    noFill();
    stroke(...AMBER);
    strokeWeight(2);
    rect(tx + 4, modeY - 2, tw - 8, 14, 3);
}

function drawBarChart() {
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(10, BAR_TOP, canvasWidth - 20, canvasHeight - BAR_TOP - 10, 8);

    let modeLabel = mode === 'degree' ? 'Degree' : mode === 'betweenness' ? 'Betweenness' : 'Closeness';
    fill(30);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(13);
    text('Top 5 by ' + modeLabel + ':', 24, BAR_TOP + 10);

    let sorted = [...nodes].sort((a, b) => getScore(b) - getScore(a));
    let top5 = sorted.slice(0, 5);
    let maxS = getMaxScore();
    let barY = BAR_TOP + 32;
    let maxBarW = canvasWidth - 200;

    for (let i = 0; i < top5.length; i++) {
        let n = top5[i];
        let s = getScore(n);
        let bw = (s / maxS) * maxBarW;
        let col = nodeColor(n);

        fill(...col);
        noStroke();
        rect(120, barY + i * 30, bw, 22, 4);

        fill(50);
        textAlign(RIGHT, CENTER);
        textSize(12);
        text(n.name, 112, barY + i * 30 + 11);

        fill(255);
        textAlign(LEFT, CENTER);
        textSize(11);
        let scoreText = mode === 'closeness' ? nf(s, 0, 3) : (mode === 'betweenness' ? nf(s, 0, 1) : '' + s);
        text(scoreText, 126, barY + i * 30 + 11);
    }
}

function mousePressed() {
    for (let b of buttons) {
        if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
            mode = b.mode;
            return;
        }
    }
    for (let n of nodes) {
        if (dist(mouseX, mouseY, n.x, n.y) < nodeRadius(n)) {
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

function mouseReleased() { draggedNode = null; }

function mouseMoved() {
    hoveredNode = null;
    for (let n of nodes) {
        if (dist(mouseX, mouseY, n.x, n.y) < nodeRadius(n)) {
            hoveredNode = n;
            break;
        }
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    let totalW = 100 + 120 + 110 + 20;
    let startX = (canvasWidth - totalW) / 2;
    buttons[0].x = startX;
    buttons[1].x = startX + 120;
    buttons[2].x = startX + 260;
}
