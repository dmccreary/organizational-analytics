// BFS vs DFS Traversal Animator - p5.js MicroSim
// Side-by-side animated comparison of BFS and DFS

let canvasWidth = 900;
const canvasHeight = 580;

// Graph data (same graph for both panels)
let graphNodes = [];
let graphEdges = [];
let adj = [];

// BFS state
let bfsVisited = [];
let bfsOrder = [];
let bfsQueue = [];
let bfsCurrent = -1;
let bfsStep = 0;
let bfsDone = false;

// DFS state
let dfsVisited = [];
let dfsOrder = [];
let dfsStack = [];
let dfsCurrent = -1;
let dfsStep = 0;
let dfsDone = false;

let animating = false;
let animTimer = 0;
let speed = 1.5; // seconds per step

const GRAPH_TOP = 80;
const GRAPH_BOTTOM = 380;
const DS_TOP = 395;  // data structure display area
const DS_BOTTOM = 560;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];

const buttons = [
    { label: 'Start', action: 'start', x: 0, y: 12, w: 80, h: 30 },
    { label: 'Step', action: 'step', x: 0, y: 12, w: 70, h: 30 },
    { label: 'Reset', action: 'reset', x: 0, y: 12, w: 80, h: 30 }
];

// Speed slider
let sliderX = 0, sliderY = 18, sliderW = 120, sliderH = 18;
let sliderDragging = false;

const START_NODE = 0;

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');
    layoutControls();
    buildGraph();
    resetTraversals();
}

function layoutControls() {
    let cx = canvasWidth / 2;
    buttons[0].x = cx - 180;
    buttons[1].x = cx - 90;
    buttons[2].x = cx - 10;
    sliderX = cx + 80;
}

function buildGraph() {
    // 8-node tree-like structure with some cross-links
    let cx = canvasWidth / 4;
    let cy = (GRAPH_TOP + GRAPH_BOTTOM) / 2;

    // Positions for left panel (BFS) — will mirror for right panel (DFS)
    const nodeData = [
        { name: 'CEO', rx: 0, ry: -110 },       // 0 - root
        { name: 'VP-Eng', rx: -100, ry: -40 },   // 1
        { name: 'VP-Sales', rx: 100, ry: -40 },   // 2
        { name: 'Dir-A', rx: -140, ry: 40 },      // 3
        { name: 'Dir-B', rx: -60, ry: 40 },       // 4
        { name: 'Dir-C', rx: 60, ry: 40 },        // 5
        { name: 'Dir-D', rx: 140, ry: 40 },       // 6
        { name: 'Analyst', rx: 0, ry: 110 }       // 7 - cross-linked
    ];

    for (let i = 0; i < nodeData.length; i++) {
        graphNodes.push({
            id: i,
            name: nodeData[i].name,
            rx: nodeData[i].rx,
            ry: nodeData[i].ry
        });
    }

    // Edges (tree + some cross-links for interesting traversal)
    const edgeList = [
        [0, 1], [0, 2],       // CEO -> VPs
        [1, 3], [1, 4],       // VP-Eng -> Directors
        [2, 5], [2, 6],       // VP-Sales -> Directors
        [4, 7], [5, 7],       // Cross-link through Analyst
        [3, 7]                 // Another cross-link
    ];

    adj = [];
    for (let i = 0; i < graphNodes.length; i++) adj[i] = [];
    for (let e of edgeList) {
        graphEdges.push({ from: e[0], to: e[1] });
        adj[e[0]].push(e[1]);
        adj[e[1]].push(e[0]);
    }
}

function resetTraversals() {
    let n = graphNodes.length;
    bfsVisited = new Array(n).fill(false);
    bfsOrder = [];
    bfsQueue = [START_NODE];
    bfsVisited[START_NODE] = true;
    bfsCurrent = -1;
    bfsStep = 0;
    bfsDone = false;

    dfsVisited = new Array(n).fill(false);
    dfsOrder = [];
    dfsStack = [START_NODE];
    dfsVisited[START_NODE] = true;
    dfsCurrent = -1;
    dfsStep = 0;
    dfsDone = false;

    animating = false;
    animTimer = 0;
}

function stepBFS() {
    if (bfsDone || bfsQueue.length === 0) {
        bfsDone = true;
        bfsCurrent = -1;
        return;
    }
    let v = bfsQueue.shift();
    bfsCurrent = v;
    bfsOrder.push(v);
    bfsStep++;

    // Sort neighbors for deterministic order
    let neighbors = [...adj[v]].sort((a, b) => a - b);
    for (let w of neighbors) {
        if (!bfsVisited[w]) {
            bfsVisited[w] = true;
            bfsQueue.push(w);
        }
    }

    if (bfsQueue.length === 0) bfsDone = true;
}

function stepDFS() {
    if (dfsDone || dfsStack.length === 0) {
        dfsDone = true;
        dfsCurrent = -1;
        return;
    }
    let v = dfsStack.pop();

    // DFS may pop an already-visited node (if added multiple times)
    // In our implementation, we mark visited when pushing, so this shouldn't happen
    dfsCurrent = v;
    dfsOrder.push(v);
    dfsStep++;

    // Push neighbors in reverse order so smallest is on top
    let neighbors = [...adj[v]].sort((a, b) => b - a);
    for (let w of neighbors) {
        if (!dfsVisited[w]) {
            dfsVisited[w] = true;
            dfsStack.push(w);
        }
    }

    if (dfsStack.length === 0) dfsDone = true;
}

function doStep() {
    stepBFS();
    stepDFS();
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(15);
    text('BFS vs DFS Traversal Animator', canvasWidth / 2, 45);

    drawButtons();
    drawSpeedSlider();

    // Auto-step if animating
    if (animating && !bfsDone && !dfsDone) {
        animTimer += deltaTime / 1000;
        if (animTimer >= speed) {
            animTimer = 0;
            doStep();
        }
    }
    if (bfsDone && dfsDone) animating = false;

    // Divider
    stroke(200);
    strokeWeight(1);
    let mid = canvasWidth / 2;
    line(mid, GRAPH_TOP - 10, mid, DS_BOTTOM);

    // Panel labels
    fill(...INDIGO);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
    text('Breadth-First Search (BFS)', canvasWidth / 4, GRAPH_TOP - 5);
    fill(...AMBER);
    text('Depth-First Search (DFS)', canvasWidth * 3 / 4, GRAPH_TOP - 5);

    // Draw BFS panel (left)
    drawGraphPanel(canvasWidth / 4, bfsOrder, bfsCurrent, bfsVisited, INDIGO);
    drawQueueDisplay(canvasWidth / 4, bfsQueue, 'Queue (FIFO)', INDIGO);

    // Draw DFS panel (right)
    drawGraphPanel(canvasWidth * 3 / 4, dfsOrder, dfsCurrent, dfsVisited, AMBER);
    drawStackDisplay(canvasWidth * 3 / 4, dfsStack, 'Stack (LIFO)', AMBER);

    // Visit order display
    drawVisitOrder();
}

function drawGraphPanel(cx, visitOrder, current, visited, themeColor) {
    let cy = (GRAPH_TOP + GRAPH_BOTTOM) / 2 + 10;

    // Draw edges
    for (let e of graphEdges) {
        let n1 = graphNodes[e.from];
        let n2 = graphNodes[e.to];
        stroke(190);
        strokeWeight(1.2);
        line(cx + n1.rx, cy + n1.ry, cx + n2.rx, cy + n2.ry);
    }

    // Draw nodes
    for (let n of graphNodes) {
        let x = cx + n.rx;
        let y = cy + n.ry;
        let r = 22;

        let orderIdx = visitOrder.indexOf(n.id);
        let isVisited = orderIdx >= 0;
        let isCurrent = (n.id === current);

        // Gold ring on current
        if (isCurrent) {
            noStroke();
            fill(...GOLD, 80);
            ellipse(x, y, r * 2 + 14);
        }

        if (isVisited) {
            // Gradient from amber (first) to indigo (last) based on visit order
            let t = visitOrder.length > 1 ? orderIdx / (visitOrder.length - 1) : 0;
            fill(lerp(AMBER[0], INDIGO[0], t), lerp(AMBER[1], INDIGO[1], t), lerp(AMBER[2], INDIGO[2], t));
            stroke(isCurrent ? GOLD : [60]);
            strokeWeight(isCurrent ? 3 : 1.5);
        } else if (visited[n.id]) {
            // In queue/stack but not yet processed
            fill(200, 210, 230);
            stroke(120);
            strokeWeight(1.5);
        } else {
            fill(230);
            stroke(160);
            strokeWeight(1);
        }
        ellipse(x, y, r * 2);

        // Label
        fill(isVisited ? 255 : 50);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(9);
        text(n.name, x, y - 5);

        // Visit order number
        if (isVisited) {
            textSize(11);
            fill(255, 230, 150);
            text(orderIdx + 1, x, y + 8);
        }
    }
}

function drawQueueDisplay(cx, queue, label, themeColor) {
    let y = DS_TOP + 10;

    fill(...themeColor);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(12);
    text(label, cx, y);

    let boxW = 50;
    let boxH = 28;
    let totalW = queue.length * (boxW + 4);
    let startX = cx - totalW / 2;

    y += 20;

    // Arrow showing direction
    if (queue.length > 0) {
        fill(100);
        textSize(9);
        text('OUT <--', startX - 30, y + 8);
        text('--> IN', startX + totalW + 26, y + 8);
    }

    for (let i = 0; i < queue.length; i++) {
        let x = startX + i * (boxW + 4);
        fill(i === 0 ? [...themeColor, 200] : [220, 225, 240]);
        stroke(...themeColor);
        strokeWeight(1);
        rect(x, y, boxW, boxH, 4);

        fill(i === 0 ? 255 : 40);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        text(graphNodes[queue[i]].name, x + boxW / 2, y + boxH / 2);
    }

    if (queue.length === 0) {
        fill(150);
        textSize(11);
        textAlign(CENTER, CENTER);
        text('(empty)', cx, y + 14);
    }
}

function drawStackDisplay(cx, stack, label, themeColor) {
    let y = DS_TOP + 10;

    fill(...themeColor);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(12);
    text(label, cx, y);

    let boxW = 60;
    let boxH = 22;
    let startY = y + 20;

    // Draw stack vertically, top of stack at top
    if (stack.length > 0) {
        fill(100);
        textSize(9);
        textAlign(RIGHT, CENTER);
        text('TOP ->', cx - boxW / 2 - 8, startY + boxH / 2);
    }

    for (let i = stack.length - 1; i >= 0; i--) {
        let row = stack.length - 1 - i;
        let bx = cx - boxW / 2;
        let by = startY + row * (boxH + 3);

        let isTop = (i === stack.length - 1);
        fill(isTop ? [...themeColor, 200] : [220, 225, 240]);
        stroke(...themeColor);
        strokeWeight(1);
        rect(bx, by, boxW, boxH, 4);

        fill(isTop ? 255 : 40);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        text(graphNodes[stack[i]].name, cx, by + boxH / 2);
    }

    if (stack.length === 0) {
        fill(150);
        textSize(11);
        textAlign(CENTER, CENTER);
        text('(empty)', cx, startY + 14);
    }
}

function drawVisitOrder() {
    let y = DS_BOTTOM - 15;
    fill(80);
    noStroke();
    textSize(10);
    textAlign(CENTER, CENTER);

    if (bfsOrder.length > 0) {
        let bfsNames = bfsOrder.map(i => graphNodes[i].name).join(', ');
        text('BFS order: ' + bfsNames, canvasWidth / 4, y);
    }
    if (dfsOrder.length > 0) {
        let dfsNames = dfsOrder.map(i => graphNodes[i].name).join(', ');
        text('DFS order: ' + dfsNames, canvasWidth * 3 / 4, y);
    }
}

function drawButtons() {
    for (let b of buttons) {
        let isHover = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
        fill(isHover ? [72, 87, 182] : INDIGO);
        stroke(40);
        strokeWeight(1);
        rect(b.x, b.y, b.w, b.h, 6);
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        text(b.label, b.x + b.w / 2, b.y + b.h / 2);
    }
}

function drawSpeedSlider() {
    // Label
    fill(80);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(11);
    text('Speed:', sliderX - 40, sliderY + sliderH / 2);

    // Track
    fill(200);
    stroke(160);
    strokeWeight(1);
    rect(sliderX, sliderY + 5, sliderW, 8, 4);

    // Thumb position: speed ranges from 0.3 (fast) to 3.0 (slow)
    let t = map(speed, 3.0, 0.3, 0, 1);
    let thumbX = sliderX + t * sliderW;
    fill(...INDIGO);
    noStroke();
    ellipse(thumbX, sliderY + 9, 16, 16);

    // Labels
    fill(120);
    textSize(9);
    textAlign(CENTER, CENTER);
    text('Slow', sliderX, sliderY + 24);
    text('Fast', sliderX + sliderW, sliderY + 24);
}

function mousePressed() {
    // Buttons
    for (let b of buttons) {
        if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
            if (b.action === 'start') {
                animating = !animating;
                animTimer = 0;
            } else if (b.action === 'step') {
                animating = false;
                doStep();
            } else if (b.action === 'reset') {
                resetTraversals();
            }
            return;
        }
    }

    // Speed slider
    if (mouseY > sliderY && mouseY < sliderY + 30 && mouseX > sliderX - 10 && mouseX < sliderX + sliderW + 10) {
        sliderDragging = true;
        updateSlider();
    }
}

function mouseDragged() {
    if (sliderDragging) {
        updateSlider();
    }
}

function mouseReleased() {
    sliderDragging = false;
}

function updateSlider() {
    let t = constrain((mouseX - sliderX) / sliderW, 0, 1);
    speed = lerp(3.0, 0.3, t);
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    layoutControls();
}
