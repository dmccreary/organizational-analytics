// Word Embedding Space - p5.js MicroSim
// 2D scatter plot of word embeddings showing organizational vocabulary clusters

let canvasWidth = 900;
const canvasHeight = 550;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];
const CORAL = [229, 115, 115];

// Cluster definitions
const clusters = [
    { name: 'Leadership', color: INDIGO },
    { name: 'Technical', color: AMBER },
    { name: 'Financial', color: GOLD },
    { name: 'People', color: CORAL }
];

// Words with precomputed 2D positions (0-1 range) and cluster index
const words = [
    // Leadership cluster (index 0)
    { word: 'CEO', nx: 0.15, ny: 0.20, cluster: 0 },
    { word: 'director', nx: 0.18, ny: 0.25, cluster: 0 },
    { word: 'manager', nx: 0.22, ny: 0.18, cluster: 0 },
    { word: 'supervisor', nx: 0.20, ny: 0.30, cluster: 0 },
    { word: 'executive', nx: 0.12, ny: 0.28, cluster: 0 },
    { word: 'VP', nx: 0.16, ny: 0.15, cluster: 0 },
    // Technical cluster (index 1)
    { word: 'deploy', nx: 0.75, ny: 0.20, cluster: 1 },
    { word: 'sprint', nx: 0.78, ny: 0.25, cluster: 1 },
    { word: 'code', nx: 0.82, ny: 0.18, cluster: 1 },
    { word: 'testing', nx: 0.80, ny: 0.30, cluster: 1 },
    { word: 'release', nx: 0.72, ny: 0.22, cluster: 1 },
    { word: 'API', nx: 0.85, ny: 0.15, cluster: 1 },
    // Financial cluster (index 2)
    { word: 'budget', nx: 0.20, ny: 0.70, cluster: 2 },
    { word: 'revenue', nx: 0.25, ny: 0.75, cluster: 2 },
    { word: 'forecast', nx: 0.18, ny: 0.80, cluster: 2 },
    { word: 'quarterly', nx: 0.28, ny: 0.72, cluster: 2 },
    { word: 'P&L', nx: 0.22, ny: 0.82, cluster: 2 },
    // People cluster (index 3)
    { word: 'hire', nx: 0.75, ny: 0.70, cluster: 3 },
    { word: 'onboard', nx: 0.78, ny: 0.75, cluster: 3 },
    { word: 'retention', nx: 0.72, ny: 0.80, cluster: 3 },
    { word: 'team', nx: 0.80, ny: 0.72, cluster: 3 },
    { word: 'mentor', nx: 0.76, ny: 0.82, cluster: 3 }
];

// Precompute similarity matrix (cosine-like based on distance)
let similarities = [];

// State
let hoveredWord = -1;
let pinnedWord = -1;
let threshold = 0.3; // similarity threshold for display

// Layout
const PLOT_LEFT = 60;
const PLOT_TOP = 50;
const PLOT_RIGHT_MARGIN = 30;
const PLOT_BOTTOM = 440;
const SLIDER_Y = 470;
const SLIDER_H = 14;
const POINT_R = 10;

let sliderX, sliderW;
let draggingSlider = false;

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');
    computeSimilarities();
    sliderX = 180;
    sliderW = canvasWidth - 260;
}

function computeSimilarities() {
    // Compute pairwise similarity from 2D distance (inverse, normalized)
    let maxDist = 0;
    for (let i = 0; i < words.length; i++) {
        similarities[i] = [];
        for (let j = 0; j < words.length; j++) {
            let d = dist(words[i].nx, words[i].ny, words[j].nx, words[j].ny);
            if (d > maxDist) maxDist = d;
            similarities[i][j] = d;
        }
    }
    // Convert distance to similarity (1 = identical, 0 = max distance)
    for (let i = 0; i < words.length; i++) {
        for (let j = 0; j < words.length; j++) {
            similarities[i][j] = i === j ? 1.0 : max(0, 1.0 - similarities[i][j] / maxDist);
        }
    }
}

function wordX(w) {
    let plotW = canvasWidth - PLOT_LEFT - PLOT_RIGHT_MARGIN;
    return PLOT_LEFT + w.nx * plotW;
}

function wordY(w) {
    return PLOT_TOP + w.ny * (PLOT_BOTTOM - PLOT_TOP);
}

function getNearest(idx, count) {
    let scored = [];
    for (let j = 0; j < words.length; j++) {
        if (j !== idx) scored.push({ idx: j, sim: similarities[idx][j] });
    }
    scored.sort((a, b) => b.sim - a.sim);
    return scored.slice(0, count);
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text('Word Embedding Space', canvasWidth / 2, 22);

    // Subtle grid lines
    drawGrid();

    // Draw threshold connections for pinned word
    if (pinnedWord >= 0) {
        drawAllConnections(pinnedWord);
    }

    // Draw hover connections
    if (hoveredWord >= 0 && hoveredWord !== pinnedWord) {
        drawNearestConnections(hoveredWord);
    }

    // Draw word points
    for (let i = 0; i < words.length; i++) {
        drawWordPoint(i);
    }

    // Draw legend
    drawLegend();

    // Draw slider
    drawThresholdSlider();

    // Draw pinned detail panel
    if (pinnedWord >= 0) {
        drawDetailPanel(pinnedWord);
    }
}

function drawGrid() {
    stroke(230);
    strokeWeight(0.5);
    let plotW = canvasWidth - PLOT_LEFT - PLOT_RIGHT_MARGIN;
    for (let t = 0; t <= 1.0; t += 0.2) {
        let x = PLOT_LEFT + t * plotW;
        let y = PLOT_TOP + t * (PLOT_BOTTOM - PLOT_TOP);
        line(x, PLOT_TOP, x, PLOT_BOTTOM);
        line(PLOT_LEFT, y, PLOT_LEFT + plotW, y);
    }
}

function drawWordPoint(i) {
    let w = words[i];
    let px = wordX(w);
    let py = wordY(w);
    let col = clusters[w.cluster].color;
    let isHovered = (hoveredWord === i);
    let isPinned = (pinnedWord === i);

    // Hover/pinned halo
    if (isHovered || isPinned) {
        noStroke();
        fill(...col, 50);
        ellipse(px, py, POINT_R * 4);
    }

    // Point
    stroke(isPinned ? GOLD : (isHovered ? [60] : [200]));
    strokeWeight(isPinned ? 2.5 : (isHovered ? 2 : 1));
    fill(...col);
    ellipse(px, py, POINT_R * 2);

    // Label
    fill(40);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(11);
    text(w.word, px + POINT_R + 4, py);
}

function drawNearestConnections(idx) {
    let nearest = getNearest(idx, 3);
    let w = words[idx];
    let px = wordX(w);
    let py = wordY(w);

    for (let n of nearest) {
        let nw = words[n.idx];
        let npx = wordX(nw);
        let npy = wordY(nw);

        // Dashed line with opacity proportional to similarity
        let alpha = map(n.sim, 0, 1, 40, 220);
        stroke(100, 100, 100, alpha);
        strokeWeight(1.5);
        drawDashedLine(px, py, npx, npy, 6);

        // Similarity score at midpoint
        let mx = (px + npx) / 2;
        let my = (py + npy) / 2;
        fill(80, 80, 80, alpha + 30);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(9);
        text(nf(n.sim, 0, 2), mx, my - 8);
    }
}

function drawAllConnections(idx) {
    let w = words[idx];
    let px = wordX(w);
    let py = wordY(w);

    for (let j = 0; j < words.length; j++) {
        if (j === idx) continue;
        let sim = similarities[idx][j];
        if (sim < threshold) continue;

        let nw = words[j];
        let npx = wordX(nw);
        let npy = wordY(nw);

        let alpha = map(sim, threshold, 1, 40, 200);
        stroke(100, 100, 100, alpha);
        strokeWeight(map(sim, threshold, 1, 0.5, 2.5));
        drawDashedLine(px, py, npx, npy, 6);

        // Score label
        let mx = (px + npx) / 2;
        let my = (py + npy) / 2;
        fill(80, 80, 80, alpha + 30);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(9);
        text(nf(sim, 0, 2), mx, my - 8);
    }
}

function drawDashedLine(x1, y1, x2, y2, dashLen) {
    let d = dist(x1, y1, x2, y2);
    let steps = floor(d / dashLen);
    for (let i = 0; i < steps; i += 2) {
        let t1 = i / steps;
        let t2 = min((i + 1) / steps, 1);
        let sx = lerp(x1, x2, t1);
        let sy = lerp(y1, y2, t1);
        let ex = lerp(x1, x2, t2);
        let ey = lerp(y1, y2, t2);
        line(sx, sy, ex, ey);
    }
}

function drawLegend() {
    let legendX = PLOT_LEFT + 10;
    let legendY = PLOT_BOTTOM + 6;
    textSize(11);
    textAlign(LEFT, CENTER);

    for (let i = 0; i < clusters.length; i++) {
        let cx = legendX + i * 130;
        fill(...clusters[i].color);
        noStroke();
        ellipse(cx, legendY, 12);
        fill(60);
        text(clusters[i].name, cx + 10, legendY);
    }
}

function drawThresholdSlider() {
    let slY = SLIDER_Y;

    // Label
    fill(60);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(12);
    text('Similarity Threshold:', sliderX - 160, slY + SLIDER_H / 2);

    // Track
    fill(220);
    stroke(180);
    strokeWeight(1);
    rect(sliderX, slY, sliderW, SLIDER_H, 4);

    // Filled portion
    let fillW = threshold * sliderW;
    fill(...INDIGO, 180);
    noStroke();
    rect(sliderX, slY, fillW, SLIDER_H, 4);

    // Handle
    let handleX = sliderX + fillW;
    fill(255);
    stroke(...INDIGO);
    strokeWeight(2);
    ellipse(handleX, slY + SLIDER_H / 2, 18);

    // Value label
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(10);
    text(nf(threshold, 0, 2), handleX, slY + SLIDER_H / 2);

    // Min/max labels
    fill(120);
    textSize(9);
    textAlign(LEFT, CENTER);
    text('0.0', sliderX, slY + SLIDER_H + 14);
    textAlign(RIGHT, CENTER);
    text('1.0', sliderX + sliderW, slY + SLIDER_H + 14);

    // Instruction
    fill(150);
    textAlign(CENTER, CENTER);
    textSize(10);
    text('Drag to adjust \u2022 Click a word to pin \u2022 Hover to preview neighbors', canvasWidth / 2, slY + SLIDER_H + 30);
}

function drawDetailPanel(idx) {
    let w = words[idx];
    let panelW = 180;
    let nearest = getNearest(idx, words.length - 1);
    let aboveThreshold = nearest.filter(n => n.sim >= threshold);
    let panelH = 40 + aboveThreshold.length * 16;
    panelH = min(panelH, 250);

    // Position panel near the word but keep on screen
    let px = wordX(w) + POINT_R + 14;
    let py = wordY(w) - panelH / 2;
    if (px + panelW > canvasWidth - 10) px = wordX(w) - POINT_R - panelW - 14;
    if (py < PLOT_TOP) py = PLOT_TOP;
    if (py + panelH > PLOT_BOTTOM) py = PLOT_BOTTOM - panelH;

    // Panel background
    fill(255, 252, 245);
    stroke(...clusters[w.cluster].color);
    strokeWeight(2);
    rect(px, py, panelW, panelH, 6);

    // Title
    fill(...clusters[w.cluster].color);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(13);
    textStyle(BOLD);
    text('"' + w.word + '"', px + 10, py + 8);
    textStyle(NORMAL);

    // Cluster label
    fill(120);
    textSize(9);
    text(clusters[w.cluster].name + ' cluster', px + 10, py + 25);

    // Similarity list
    textSize(10);
    let listY = py + 42;
    let maxItems = floor((panelH - 44) / 16);

    for (let i = 0; i < min(aboveThreshold.length, maxItems); i++) {
        let n = aboveThreshold[i];
        let nw = words[n.idx];
        let barW = map(n.sim, 0, 1, 0, 60);

        // Mini bar
        fill(...clusters[nw.cluster].color, 100);
        noStroke();
        rect(px + 10, listY + i * 16, barW, 12, 2);

        // Text
        fill(60);
        textAlign(LEFT, CENTER);
        text(nw.word + '  ' + nf(n.sim, 0, 2), px + 14, listY + i * 16 + 6);
    }
}

function mousePressed() {
    // Check slider
    let handleX = sliderX + threshold * sliderW;
    if (dist(mouseX, mouseY, handleX, SLIDER_Y + SLIDER_H / 2) < 14) {
        draggingSlider = true;
        return;
    }
    if (mouseY > SLIDER_Y - 4 && mouseY < SLIDER_Y + SLIDER_H + 4 &&
        mouseX > sliderX && mouseX < sliderX + sliderW) {
        threshold = constrain((mouseX - sliderX) / sliderW, 0, 1);
        draggingSlider = true;
        return;
    }

    // Check word clicks
    for (let i = 0; i < words.length; i++) {
        let px = wordX(words[i]);
        let py = wordY(words[i]);
        if (dist(mouseX, mouseY, px, py) < POINT_R + 4) {
            pinnedWord = (pinnedWord === i) ? -1 : i;
            return;
        }
    }

    // Click empty space to unpin
    if (pinnedWord >= 0) {
        pinnedWord = -1;
    }
}

function mouseDragged() {
    if (draggingSlider) {
        threshold = constrain((mouseX - sliderX) / sliderW, 0, 1);
    }
}

function mouseReleased() {
    draggingSlider = false;
}

function mouseMoved() {
    hoveredWord = -1;
    for (let i = 0; i < words.length; i++) {
        let px = wordX(words[i]);
        let py = wordY(words[i]);
        if (dist(mouseX, mouseY, px, py) < POINT_R + 4) {
            hoveredWord = i;
            break;
        }
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    sliderW = canvasWidth - 260;
}
