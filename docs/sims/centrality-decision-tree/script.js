// Centrality Algorithm Decision Tree - p5.js MicroSim
// Interactive decision tree guiding algorithm selection

let canvasWidth = 900;
const canvasHeight = 540;
let currentNode = 0;
let visitedPath = [0];
let resultNode = null;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// Decision tree structure
// type: 'question' or 'result'
const treeNodes = [
    // 0: Root question
    {
        type: 'question',
        text: 'Are you scoring nodes\nor finding routes?',
        yesLabel: 'Scoring\nNodes',
        noLabel: 'Finding\nRoutes',
        yes: 1,   // centrality branch
        no: 6,    // pathfinding branch
        x: 0.5, y: 0.12
    },
    // 1: Centrality - connections matter?
    {
        type: 'question',
        text: "Do you care who your\nconnections know?",
        yesLabel: 'Yes',
        noLabel: 'No',
        yes: 2,   // eigenvector/pagerank
        no: 3,    // degree/betweenness/closeness
        x: 0.25, y: 0.30
    },
    // 2: Directed graph?
    {
        type: 'question',
        text: 'Is the graph directed?',
        yesLabel: 'Yes',
        noLabel: 'No',
        yes: 10,  // PageRank
        no: 11,   // Eigenvector
        x: 0.12, y: 0.50
    },
    // 3: What structural property?
    {
        type: 'question',
        text: 'Are you looking for\nbridges or hubs?',
        yesLabel: 'Bridges',
        noLabel: 'Hubs',
        yes: 12,  // Betweenness
        no: 4,    // Degree or closeness
        x: 0.38, y: 0.50
    },
    // 4: Reach speed?
    {
        type: 'question',
        text: 'Do you care about\nspeed of reach?',
        yesLabel: 'Yes',
        noLabel: 'No',
        yes: 13,  // Closeness
        no: 14,   // Degree
        x: 0.45, y: 0.72
    },
    // 5: (unused, kept for numbering)
    { type: 'spacer' },
    // 6: Pathfinding - weighted?
    {
        type: 'question',
        text: 'Do edges have weights?',
        yesLabel: 'Yes',
        noLabel: 'No',
        yes: 15,  // Dijkstra
        no: 7,    // BFS or DFS
        x: 0.75, y: 0.30
    },
    // 7: Exhaustive?
    {
        type: 'question',
        text: 'Do you need exhaustive\nexploration or shortest path?',
        yesLabel: 'Exhaustive',
        noLabel: 'Shortest\nPath',
        yes: 16,  // DFS
        no: 17,   // BFS
        x: 0.82, y: 0.50
    },
    // 8-9: spacers
    { type: 'spacer' },
    { type: 'spacer' },
    // 10: PageRank
    {
        type: 'result',
        algorithm: 'PageRank',
        description: 'Measures networked prestige in directed graphs. Who receives importance from important senders?',
        useCase: 'Rank employees by network influence',
        x: 0.05, y: 0.75
    },
    // 11: Eigenvector
    {
        type: 'result',
        algorithm: 'Eigenvector Centrality',
        description: 'Scores nodes by the importance of their connections. Connected to well-connected people = high score.',
        useCase: 'Find informal power structures',
        x: 0.18, y: 0.75
    },
    // 12: Betweenness
    {
        type: 'result',
        algorithm: 'Betweenness Centrality',
        description: 'Identifies nodes on many shortest paths between others. Bridge nodes, brokers, and bottlenecks.',
        useCase: 'Find single points of failure',
        x: 0.32, y: 0.75
    },
    // 13: Closeness
    {
        type: 'result',
        algorithm: 'Closeness Centrality',
        description: 'Measures how quickly a node can reach all others. Short average distance = efficient spreader.',
        useCase: 'Identify change agents',
        x: 0.38, y: 0.92
    },
    // 14: Degree
    {
        type: 'result',
        algorithm: 'Degree Centrality',
        description: 'Counts connections. Simple but effective for finding communication hubs with many direct contacts.',
        useCase: 'Find the busiest communicators',
        x: 0.52, y: 0.92
    },
    // 15: Dijkstra
    {
        type: 'result',
        algorithm: "Dijkstra's Algorithm",
        description: 'Finds the minimum-cost path in a weighted graph. Use when edge weights represent communication cost or strength.',
        useCase: 'Find strongest communication path',
        x: 0.68, y: 0.50
    },
    // 16: DFS
    {
        type: 'result',
        algorithm: 'Depth-First Search',
        description: 'Explores deeply along each path. Detects cycles, finds all paths, and performs topological sorting.',
        useCase: 'Detect circular reporting chains',
        x: 0.75, y: 0.75
    },
    // 17: BFS
    {
        type: 'result',
        algorithm: 'Breadth-First Search',
        description: 'Explores level by level. Finds shortest unweighted path and maps organizational distance from any node.',
        useCase: 'Map distance from CEO to all employees',
        x: 0.90, y: 0.75
    }
];

let resetBtn = { x: 0, y: 8, w: 80, h: 30 };

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');
    resetBtn.x = canvasWidth - 100;
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(15);
    text('Which Algorithm Should You Use?', canvasWidth / 2, 25);

    // Draw reset button
    let isHover = mouseX > resetBtn.x && mouseX < resetBtn.x + resetBtn.w &&
                  mouseY > resetBtn.y && mouseY < resetBtn.y + resetBtn.h;
    fill(isHover ? [100] : [140]);
    stroke(40);
    strokeWeight(1);
    rect(resetBtn.x, resetBtn.y, resetBtn.w, resetBtn.h, 6);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);
    text('Reset', resetBtn.x + resetBtn.w / 2, resetBtn.y + resetBtn.h / 2);

    // Draw connecting lines first (behind nodes)
    drawConnections();

    // Draw all tree nodes
    for (let i = 0; i < treeNodes.length; i++) {
        let tn = treeNodes[i];
        if (tn.type === 'spacer') continue;
        drawTreeNode(i, tn);
    }

    // Draw result card if we reached a result
    if (resultNode !== null) {
        drawResultCard(treeNodes[resultNode]);
    }
}

function drawConnections() {
    for (let i = 0; i < treeNodes.length; i++) {
        let tn = treeNodes[i];
        if (tn.type !== 'question') continue;

        let px = tn.x * canvasWidth;
        let py = tn.y * canvasHeight + 20;

        // Yes connection
        if (tn.yes !== undefined && treeNodes[tn.yes].type !== 'spacer') {
            let child = treeNodes[tn.yes];
            let cx = child.x * canvasWidth;
            let cy = child.y * canvasHeight + (child.type === 'result' ? 10 : 20);

            let isOnPath = visitedPath.includes(i) && visitedPath.includes(tn.yes);
            stroke(isOnPath ? AMBER : [200]);
            strokeWeight(isOnPath ? 3 : 1.5);
            noFill();
            // Curved line
            bezier(px, py + 22, px, py + 40, cx, cy - 30, cx, cy - 12);
        }

        // No connection
        if (tn.no !== undefined && treeNodes[tn.no].type !== 'spacer') {
            let child = treeNodes[tn.no];
            let cx = child.x * canvasWidth;
            let cy = child.y * canvasHeight + (child.type === 'result' ? 10 : 20);

            let isOnPath = visitedPath.includes(i) && visitedPath.includes(tn.no);
            stroke(isOnPath ? AMBER : [200]);
            strokeWeight(isOnPath ? 3 : 1.5);
            noFill();
            bezier(px, py + 22, px, py + 40, cx, cy - 30, cx, cy - 12);
        }
    }
}

function drawTreeNode(idx, tn) {
    let x = tn.x * canvasWidth;
    let y = tn.y * canvasHeight;
    let isOnPath = visitedPath.includes(idx);
    let isCurrent = (idx === currentNode && resultNode === null);

    if (tn.type === 'question') {
        let w = 150;
        let h = 50;

        // Question box
        if (isCurrent) {
            fill(...INDIGO);
            stroke(...GOLD);
            strokeWeight(3);
        } else if (isOnPath) {
            fill(92, 107, 192);
            stroke(...AMBER);
            strokeWeight(2);
        } else {
            fill(200, 205, 220);
            stroke(160);
            strokeWeight(1);
        }
        ellipse(x, y + 20, w, h);

        // Question text
        fill(isCurrent || isOnPath ? 255 : 100);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        text(tn.text, x, y + 20);

        // Yes/No buttons (only for current node)
        if (isCurrent) {
            drawChoiceButton(x - 50, y + 50, tn.yesLabel, 'yes');
            drawChoiceButton(x + 50, y + 50, tn.noLabel, 'no');
        }
    } else if (tn.type === 'result') {
        let w = 120;
        let h = 36;

        if (idx === resultNode) {
            fill(...GOLD);
            stroke(...AMBER);
            strokeWeight(3);
        } else if (isOnPath) {
            fill(...GOLD, 200);
            stroke(...AMBER);
            strokeWeight(2);
        } else {
            fill(230, 230, 220);
            stroke(180);
            strokeWeight(1);
        }
        rect(x - w / 2, y, w, h, 8);

        fill(idx === resultNode ? 30 : (isOnPath ? 40 : 120));
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        text(tn.algorithm, x, y + h / 2);
    }
}

function drawChoiceButton(x, y, label, type) {
    let w = 65;
    let h = 28;
    let isHover = mouseX > x - w / 2 && mouseX < x + w / 2 &&
                  mouseY > y && mouseY < y + h;

    if (type === 'yes') {
        fill(isHover ? [60, 140, 60] : [76, 175, 80]);
    } else {
        fill(isHover ? [180, 60, 60] : [211, 47, 47]);
    }
    stroke(40);
    strokeWeight(1);
    rect(x - w / 2, y, w, h, 5);

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(10);
    text(label, x, y + h / 2);
}

function drawResultCard(tn) {
    let cardW = min(380, canvasWidth - 40);
    let cardH = 90;
    let cardX = canvasWidth / 2 - cardW / 2;
    let cardY = canvasHeight - cardH - 10;

    // Card background
    fill(255, 252, 240);
    stroke(...AMBER);
    strokeWeight(2);
    rect(cardX, cardY, cardW, cardH, 10);

    // Algorithm name
    fill(...INDIGO);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(14);
    text(tn.algorithm, cardX + 12, cardY + 8);

    // Description
    fill(60);
    textSize(11);
    text(tn.description, cardX + 12, cardY + 28, cardW - 24, 30);

    // Use case
    fill(...AMBER);
    textSize(11);
    text('Use case: ' + tn.useCase, cardX + 12, cardY + 66);
}

function mousePressed() {
    // Reset button
    if (mouseX > resetBtn.x && mouseX < resetBtn.x + resetBtn.w &&
        mouseY > resetBtn.y && mouseY < resetBtn.y + resetBtn.h) {
        currentNode = 0;
        visitedPath = [0];
        resultNode = null;
        return;
    }

    // If we already have a result, only reset works
    if (resultNode !== null) return;

    let tn = treeNodes[currentNode];
    if (tn.type !== 'question') return;

    let x = tn.x * canvasWidth;
    let y = tn.y * canvasHeight;

    // Yes button
    let yesX = x - 50;
    let yesY = y + 50;
    let noX = x + 50;
    let noY = y + 50;
    let bw = 65;
    let bh = 28;

    if (mouseX > yesX - bw / 2 && mouseX < yesX + bw / 2 && mouseY > yesY && mouseY < yesY + bh) {
        navigateTo(tn.yes);
    } else if (mouseX > noX - bw / 2 && mouseX < noX + bw / 2 && mouseY > noY && mouseY < noY + bh) {
        navigateTo(tn.no);
    }
}

function navigateTo(nodeIdx) {
    visitedPath.push(nodeIdx);
    let tn = treeNodes[nodeIdx];
    if (tn.type === 'result') {
        resultNode = nodeIdx;
        currentNode = nodeIdx;
    } else {
        currentNode = nodeIdx;
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    resetBtn.x = canvasWidth - 100;
}
