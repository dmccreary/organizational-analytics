// GNN Message Passing - p5.js MicroSim
// Animated visualization of Graph Neural Network message passing

let canvasWidth = 900;
const canvasHeight = 580;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];
const LIGHT_AMBER = [245, 200, 130];

// Node data
let nodes = [];
let edges = [];
let currentLayer = 0; // 0 = initial, 1 = after layer 1, 2 = after layer 2

// Animation state
let animating = false;
let animProgress = 0; // 0 to 1
let animTarget = 0; // which layer we're animating to
let animDots = []; // animated message dots

// Feature colors for the 3 bars
const FEAT_COLORS = [
    [92, 107, 192],   // centrality - indigo-ish
    [76, 175, 80],    // tenure - green
    [255, 152, 0]     // performance - orange
];
const FEAT_LABELS = ['Centrality', 'Tenure', 'Performance'];

let hoveredNode = -1;

// Button layout
let buttons = [];
const BTN_Y = canvasHeight - 45;

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

function buildGraph() {
    let cx = canvasWidth / 2;
    let cy = 240;

    // Initial feature vectors: [centrality, tenure, performance]
    let initFeatures = [
        [0.8, 0.6, 0.7],  // Maria
        [0.5, 0.8, 0.6],  // Dev
        [0.6, 0.4, 0.9],  // Sarah
        [0.3, 0.7, 0.5],  // Li
        [0.4, 0.3, 0.8],  // Jake
        [0.7, 0.5, 0.4],  // Raj (connected to Dev)
        [0.2, 0.9, 0.6]   // Nadia (connected to Sarah)
    ];

    let nodeData = [
        { name: 'Maria',  color: INDIGO,      size: 36, x: cx,       y: cy },
        { name: 'Dev',    color: AMBER,        size: 28, x: cx - 150, y: cy - 100 },
        { name: 'Sarah',  color: AMBER,        size: 28, x: cx + 150, y: cy - 100 },
        { name: 'Li',     color: AMBER,        size: 28, x: cx - 160, y: cy + 110 },
        { name: 'Jake',   color: AMBER,        size: 28, x: cx + 160, y: cy + 110 },
        { name: 'Raj',    color: LIGHT_AMBER,  size: 22, x: cx - 290, y: cy - 50 },
        { name: 'Nadia',  color: LIGHT_AMBER,  size: 22, x: cx + 290, y: cy - 50 }
    ];

    nodes = [];
    for (let i = 0; i < nodeData.length; i++) {
        nodes.push({
            ...nodeData[i],
            initFeatures: [...initFeatures[i]],
            features: [...initFeatures[i]],     // current displayed features
            prevFeatures: [...initFeatures[i]]   // features before current animation
        });
    }

    // Edges: [from, to]
    // Maria(0) connected to Dev(1), Sarah(2), Li(3), Jake(4)
    // Dev(1) connected to Raj(5)
    // Sarah(2) connected to Nadia(6)
    edges = [
        [0, 1], [0, 2], [0, 3], [0, 4],
        [1, 5], [2, 6]
    ];
}

function layoutButtons() {
    let btnW = 90;
    let btnH = 32;
    let gap = 15;
    let totalW = 3 * btnW + 2 * gap;
    let startX = (canvasWidth - totalW) / 2;

    buttons = [
        { label: 'Layer 1', target: 1, x: startX, y: BTN_Y, w: btnW, h: btnH },
        { label: 'Layer 2', target: 2, x: startX + btnW + gap, y: BTN_Y, w: btnW, h: btnH },
        { label: 'Reset', target: 0, x: startX + 2 * (btnW + gap), y: BTN_Y, w: btnW, h: btnH }
    ];
}

function getNeighbors(nodeIdx) {
    let neighbors = [];
    for (let e of edges) {
        if (e[0] === nodeIdx) neighbors.push(e[1]);
        if (e[1] === nodeIdx) neighbors.push(e[0]);
    }
    return neighbors;
}

function computeLayerFeatures(sourceFeatures) {
    // For each node, new features = average of (self + all neighbors)
    let newFeatures = [];
    for (let i = 0; i < nodes.length; i++) {
        let neighbors = getNeighbors(i);
        let sum = [sourceFeatures[i][0], sourceFeatures[i][1], sourceFeatures[i][2]];
        let count = 1;
        for (let ni of neighbors) {
            sum[0] += sourceFeatures[ni][0];
            sum[1] += sourceFeatures[ni][1];
            sum[2] += sourceFeatures[ni][2];
            count++;
        }
        newFeatures.push([sum[0] / count, sum[1] / count, sum[2] / count]);
    }
    return newFeatures;
}

function startAnimation(targetLayer) {
    if (animating) return;

    if (targetLayer === 0) {
        // Reset
        currentLayer = 0;
        for (let n of nodes) {
            n.features = [...n.initFeatures];
            n.prevFeatures = [...n.initFeatures];
        }
        animDots = [];
        return;
    }

    if (targetLayer <= currentLayer) return; // already at or past this layer
    if (targetLayer > currentLayer + 1) return; // can only advance one layer at a time

    // Store previous features
    for (let n of nodes) {
        n.prevFeatures = [...n.features];
    }

    // Compute target features
    let sourceFeats = nodes.map(n => [...n.features]);
    let targetFeats = computeLayerFeatures(sourceFeats);

    // Store targets
    for (let i = 0; i < nodes.length; i++) {
        nodes[i]._targetFeatures = targetFeats[i];
    }

    // Create animated dots for message passing
    animDots = [];
    for (let e of edges) {
        // Dots go both directions
        animDots.push({ from: e[0], to: e[1], progress: 0 });
        animDots.push({ from: e[1], to: e[0], progress: 0 });
    }

    animating = true;
    animProgress = 0;
    animTarget = targetLayer;
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text('GNN Message Passing', canvasWidth / 2, 20);
    textStyle(NORMAL);
    textSize(11);
    fill(100);
    text('Watch how graph neural networks aggregate neighbor information layer by layer', canvasWidth / 2, 38);

    // Layer indicator
    let layerText = currentLayer === 0 ? 'Initial Features' : 'After Layer ' + currentLayer;
    if (animating) layerText = 'Aggregating Layer ' + animTarget + '...';
    fill(...INDIGO);
    textSize(13);
    textStyle(BOLD);
    text(layerText, canvasWidth / 2, 56);
    textStyle(NORMAL);

    // Update animation
    if (animating) {
        animProgress += 0.012;
        if (animProgress >= 1.0) {
            animProgress = 1.0;
            animating = false;
            currentLayer = animTarget;
            for (let n of nodes) {
                n.features = [...n._targetFeatures];
            }
            animDots = [];
        } else {
            // Interpolate features
            let t = easeInOutCubic(animProgress);
            for (let i = 0; i < nodes.length; i++) {
                for (let f = 0; f < 3; f++) {
                    nodes[i].features[f] = lerp(nodes[i].prevFeatures[f], nodes[i]._targetFeatures[f], t);
                }
            }
            // Update dot positions
            for (let dot of animDots) {
                dot.progress = constrain(animProgress * 1.5 - 0.1, 0, 1);
            }
        }
    }

    // Draw edges
    drawEdges();

    // Draw animated dots
    if (animating) {
        drawAnimatedDots();
    }

    // Draw nodes
    drawNodes();

    // Feature legend
    drawFeatureLegend();

    // Hover tooltip
    if (hoveredNode >= 0 && !animating) {
        drawTooltip(hoveredNode);
    }

    // Buttons
    drawButtons();
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
}

function drawEdges() {
    for (let e of edges) {
        let n1 = nodes[e[0]];
        let n2 = nodes[e[1]];
        stroke(180);
        strokeWeight(2);
        line(n1.x, n1.y, n2.x, n2.y);
    }
}

function drawAnimatedDots() {
    for (let dot of animDots) {
        let n1 = nodes[dot.from];
        let n2 = nodes[dot.to];
        let t = dot.progress;

        // Draw multiple dots along the path (trailing)
        let numDots = 4;
        for (let d = 0; d < numDots; d++) {
            let dt = t - d * 0.08;
            if (dt < 0 || dt > 1) continue;
            let dx = lerp(n1.x, n2.x, dt);
            let dy = lerp(n1.y, n2.y, dt);
            let alpha = map(d, 0, numDots - 1, 255, 80);
            let sz = map(d, 0, numDots - 1, 8, 4);
            noStroke();
            fill(255, 215, 0, alpha);
            ellipse(dx, dy, sz);
        }
    }
}

function drawNodes() {
    for (let i = 0; i < nodes.length; i++) {
        let n = nodes[i];
        let isHovered = (hoveredNode === i);

        // Glow for hovered
        if (isHovered) {
            noStroke();
            fill(...GOLD, 60);
            ellipse(n.x, n.y, n.size * 2 + 20);
        }

        // Node circle
        stroke(isHovered ? GOLD : [60]);
        strokeWeight(isHovered ? 3 : 1.5);
        fill(...n.color);
        ellipse(n.x, n.y, n.size * 2);

        // Name
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(constrain(n.size * 0.45, 9, 14));
        textStyle(BOLD);
        text(n.name, n.x, n.y);
        textStyle(NORMAL);

        // Feature bars below node
        drawFeatureBars(n.x, n.y + n.size + 8, n.features, n.size * 0.8);
    }
}

function drawFeatureBars(cx, topY, features, barScale) {
    let barW = 8;
    let gap = 3;
    let maxH = 30 * (barScale / 14);
    maxH = constrain(maxH, 15, 35);
    let totalW = 3 * barW + 2 * gap;
    let startX = cx - totalW / 2;

    for (let f = 0; f < 3; f++) {
        let x = startX + f * (barW + gap);
        let h = features[f] * maxH;

        // Bar background
        noStroke();
        fill(220);
        rect(x, topY, barW, maxH, 2);

        // Bar fill
        fill(...FEAT_COLORS[f]);
        rect(x, topY + maxH - h, barW, h, 2);
    }
}

function drawFeatureLegend() {
    let legendY = canvasHeight - 90;
    let legendX = 20;

    fill(120);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(11);
    text('Feature bars:', legendX, legendY);

    for (let f = 0; f < 3; f++) {
        let x = legendX + 80 + f * 110;
        fill(...FEAT_COLORS[f]);
        noStroke();
        rect(x, legendY - 5, 10, 10, 2);
        fill(80);
        textAlign(LEFT, CENTER);
        textSize(11);
        text(FEAT_LABELS[f], x + 14, legendY);
    }
}

function drawTooltip(idx) {
    let n = nodes[idx];
    let tw = 200;
    let th = 90;
    let tx = n.x + n.size + 15;
    let ty = n.y - th / 2;

    if (tx + tw > canvasWidth - 10) tx = n.x - n.size - tw - 15;
    if (ty < 60) ty = 60;
    if (ty + th > canvasHeight - 100) ty = canvasHeight - 100 - th;

    fill(255, 252, 240);
    stroke(180);
    strokeWeight(1);
    rect(tx, ty, tw, th, 8);

    fill(30);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(14);
    textStyle(BOLD);
    text(n.name, tx + 10, ty + 8);
    textStyle(NORMAL);

    textSize(11);
    fill(80);
    let hop = idx === 0 ? 'Target node' : (idx <= 4 ? '1-hop neighbor' : '2-hop neighbor');
    text(hop, tx + 10, ty + 28);

    for (let f = 0; f < 3; f++) {
        fill(...FEAT_COLORS[f]);
        rect(tx + 10, ty + 48 + f * 14, 8, 10, 2);
        fill(60);
        textAlign(LEFT, CENTER);
        textSize(10);
        text(FEAT_LABELS[f] + ': ' + nf(n.features[f], 1, 3), tx + 22, ty + 53 + f * 14);
    }
}

function drawButtons() {
    for (let b of buttons) {
        let isHover = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
        let isDisabled = false;

        if (animating) {
            isDisabled = true;
        } else if (b.target === 1 && currentLayer >= 1) {
            isDisabled = true;
        } else if (b.target === 2 && currentLayer !== 1) {
            isDisabled = true;
        } else if (b.target === 0 && currentLayer === 0) {
            isDisabled = true;
        }

        if (isDisabled) {
            fill(180);
        } else if (isHover) {
            fill(92, 107, 192);
        } else {
            fill(...INDIGO);
        }

        stroke(30);
        strokeWeight(1);
        rect(b.x, b.y, b.w, b.h, 6);

        fill(isDisabled ? 220 : 255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(13);
        textStyle(BOLD);
        text(b.label, b.x + b.w / 2, b.y + b.h / 2);
        textStyle(NORMAL);
    }
}

function mouseMoved() {
    hoveredNode = -1;
    for (let i = 0; i < nodes.length; i++) {
        let n = nodes[i];
        if (dist(mouseX, mouseY, n.x, n.y) < n.size) {
            hoveredNode = i;
            break;
        }
    }
}

function mousePressed() {
    for (let b of buttons) {
        if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
            startAnimation(b.target);
            return;
        }
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    // Reposition nodes relative to new center
    let cx = canvasWidth / 2;
    let cy = 240;
    let positions = [
        { x: cx,       y: cy },
        { x: cx - 150, y: cy - 100 },
        { x: cx + 150, y: cy - 100 },
        { x: cx - 160, y: cy + 110 },
        { x: cx + 160, y: cy + 110 },
        { x: cx - 290, y: cy - 50 },
        { x: cx + 290, y: cy - 50 }
    ];
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].x = positions[i].x;
        nodes[i].y = positions[i].y;
    }
    layoutButtons();
}
