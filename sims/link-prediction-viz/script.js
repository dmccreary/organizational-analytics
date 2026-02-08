// Link Prediction Visualization - p5.js MicroSim
// Interactive graph with existing edges (solid) and predicted edges (dashed amber)

let canvasWidth = 900;
const canvasHeight = 540;
let nodes = [];
let existingEdges = [];
let predictedEdges = [];
let adj = {};
let method = 'common'; // 'common', 'jaccard', 'adamic'
let threshold = 0.3;
let hoveredNode = null;
let hoveredPrediction = null;
let draggedNode = null;
let dragOffsetX = 0, dragOffsetY = 0;

const GRAPH_TOP = 55;
const GRAPH_BOTTOM = 430;
const INFO_TOP = 440;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];
const LIGHT_GRAY = [200, 200, 200];

const methodButtons = [
    { label: 'Common Neighbors', key: 'common', x: 0, y: 10, w: 145, h: 30 },
    { label: 'Jaccard', key: 'jaccard', x: 0, y: 10, w: 80, h: 30 },
    { label: 'Adamic-Adar', key: 'adamic', x: 0, y: 10, w: 110, h: 30 }
];

let sliderX = 0;
let sliderW = 180;
let sliderY = 16;
let sliderDragging = false;

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');

    positionControls();
    buildGraph();
    buildAdjacency();
    computePredictions();
}

function positionControls() {
    let totalBtnW = 145 + 80 + 110 + 20;
    let startX = 15;
    methodButtons[0].x = startX;
    methodButtons[1].x = startX + 155;
    methodButtons[2].x = startX + 245;

    sliderX = canvasWidth - sliderW - 80;
}

function buildGraph() {
    let deptColors = {
        'Engineering': INDIGO,
        'Product': AMBER,
        'Marketing': GOLD
    };

    let empData = [
        { name: 'Alice', dept: 'Engineering', rx: 0.15, ry: 0.3 },
        { name: 'Bob', dept: 'Engineering', rx: 0.25, ry: 0.2 },
        { name: 'Carlos', dept: 'Engineering', rx: 0.20, ry: 0.45 },
        { name: 'Dev', dept: 'Engineering', rx: 0.30, ry: 0.35 },
        { name: 'Elena', dept: 'Product', rx: 0.55, ry: 0.2 },
        { name: 'Frank', dept: 'Product', rx: 0.65, ry: 0.3 },
        { name: 'Grace', dept: 'Product', rx: 0.60, ry: 0.45 },
        { name: 'Hiro', dept: 'Product', rx: 0.50, ry: 0.35 },
        { name: 'Ines', dept: 'Marketing', rx: 0.75, ry: 0.65 },
        { name: 'Jake', dept: 'Marketing', rx: 0.85, ry: 0.75 },
        { name: 'Kim', dept: 'Marketing', rx: 0.80, ry: 0.55 },
        { name: 'Leo', dept: 'Marketing', rx: 0.90, ry: 0.65 }
    ];

    let graphH = GRAPH_BOTTOM - GRAPH_TOP;
    for (let i = 0; i < empData.length; i++) {
        let e = empData[i];
        nodes.push({
            id: i,
            name: e.name,
            dept: e.dept,
            color: deptColors[e.dept],
            x: e.rx * canvasWidth,
            y: GRAPH_TOP + e.ry * graphH
        });
    }

    // Alice=0, Bob=1, Carlos=2, Dev=3, Elena=4, Frank=5, Grace=6, Hiro=7
    // Ines=8, Jake=9, Kim=10, Leo=11
    let edgeList = [
        [0, 1], [0, 2], [1, 3], [2, 3],       // Engineering internal
        [4, 5], [4, 6], [5, 7], [6, 7],         // Product internal
        [8, 9], [8, 10], [9, 11], [10, 11],     // Marketing internal
        [3, 4], [7, 10]                          // Cross-department bridges
    ];

    for (let e of edgeList) {
        existingEdges.push({ from: e[0], to: e[1] });
    }
}

function buildAdjacency() {
    adj = {};
    for (let n of nodes) adj[n.id] = new Set();
    for (let e of existingEdges) {
        adj[e.from].add(e.to);
        adj[e.to].add(e.from);
    }
}

function getNeighbors(id) {
    return adj[id] || new Set();
}

function commonNeighbors(a, b) {
    let na = getNeighbors(a);
    let nb = getNeighbors(b);
    let count = 0;
    for (let x of na) {
        if (nb.has(x)) count++;
    }
    return count;
}

function commonNeighborsList(a, b) {
    let na = getNeighbors(a);
    let nb = getNeighbors(b);
    let shared = [];
    for (let x of na) {
        if (nb.has(x)) shared.push(nodes[x].name);
    }
    return shared;
}

function jaccardCoeff(a, b) {
    let na = getNeighbors(a);
    let nb = getNeighbors(b);
    let intersection = 0;
    for (let x of na) {
        if (nb.has(x)) intersection++;
    }
    let unionSize = na.size + nb.size - intersection;
    return unionSize > 0 ? intersection / unionSize : 0;
}

function adamicAdar(a, b) {
    let na = getNeighbors(a);
    let nb = getNeighbors(b);
    let score = 0;
    for (let x of na) {
        if (nb.has(x)) {
            let deg = getNeighbors(x).size;
            if (deg > 1) score += 1.0 / Math.log(deg);
        }
    }
    return score;
}

function computePredictions() {
    predictedEdges = [];
    let rawScores = [];

    // For each unconnected pair
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            // Skip if already connected
            if (adj[i].has(j)) continue;

            let cn = commonNeighbors(i, j);
            if (cn === 0) continue; // No shared neighbors, no prediction

            let score = 0;
            if (method === 'common') score = cn;
            else if (method === 'jaccard') score = jaccardCoeff(i, j);
            else if (method === 'adamic') score = adamicAdar(i, j);

            let shared = commonNeighborsList(i, j);
            rawScores.push({
                from: i, to: j,
                score: score,
                cn: cn,
                shared: shared
            });
        }
    }

    // Normalize scores to 0-1
    let maxScore = 0;
    for (let p of rawScores) {
        if (p.score > maxScore) maxScore = p.score;
    }

    for (let p of rawScores) {
        let normScore = maxScore > 0 ? p.score / maxScore : 0;
        predictedEdges.push({
            from: p.from,
            to: p.to,
            score: normScore,
            rawScore: p.score,
            cn: p.cn,
            shared: p.shared
        });
    }

    // Sort by score descending
    predictedEdges.sort((a, b) => b.score - a.score);
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(15);
    text('Link Prediction Visualization', canvasWidth / 2, 25);

    drawButtons();
    drawSlider();

    // Department legend
    drawLegend();

    // Draw existing edges (solid gray)
    for (let e of existingEdges) {
        let n1 = nodes[e.from];
        let n2 = nodes[e.to];
        let isHighlighted = hoveredNode && (e.from === hoveredNode.id || e.to === hoveredNode.id);
        stroke(isHighlighted ? 100 : 180);
        strokeWeight(isHighlighted ? 2.5 : 1.5);
        line(n1.x, n1.y, n2.x, n2.y);
    }

    // Draw predicted edges (dashed amber) above threshold
    hoveredPrediction = null;
    for (let p of predictedEdges) {
        if (p.score < threshold) continue;

        let n1 = nodes[p.from];
        let n2 = nodes[p.to];

        let showThis = true;
        if (hoveredNode) {
            showThis = (p.from === hoveredNode.id || p.to === hoveredNode.id);
        }

        if (!showThis) continue;

        // Check hover on this predicted edge
        let isHovered = isMouseNearLine(n1.x, n1.y, n2.x, n2.y, 8);
        if (isHovered && !draggedNode) {
            hoveredPrediction = p;
        }

        let alpha = map(p.score, threshold, 1, 100, 240);
        let weight = map(p.score, threshold, 1, 1.5, 3.5);

        drawDashedLine(n1.x, n1.y, n2.x, n2.y,
            isHovered ? [212, 136, 15, 255] : [212, 136, 15, alpha],
            isHovered ? weight + 1.5 : weight,
            10, 6);

        // Score label at midpoint
        let mx = (n1.x + n2.x) / 2;
        let my = (n1.y + n2.y) / 2;
        fill(212, 136, 15, isHovered ? 255 : alpha + 30);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        text(nf(p.score, 0, 2), mx, my - 8);
    }

    // Draw nodes
    for (let n of nodes) {
        drawNode(n);
    }

    // Info panel
    drawInfoPanel();
}

function drawButtons() {
    for (let b of methodButtons) {
        let isActive = (method === b.key);
        let isHover = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;

        if (isActive) {
            fill(...INDIGO);
        } else if (isHover) {
            fill(92, 107, 192);
        } else {
            fill(180);
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

function drawSlider() {
    let labelX = sliderX - 75;

    // Label
    fill(60);
    noStroke();
    textAlign(RIGHT, CENTER);
    textSize(12);
    text('Threshold: ' + nf(threshold, 0, 2), labelX + 70, sliderY + 7);

    // Track
    stroke(180);
    strokeWeight(3);
    line(sliderX, sliderY + 7, sliderX + sliderW, sliderY + 7);

    // Filled portion
    let knobX = sliderX + threshold * sliderW;
    stroke(...AMBER);
    strokeWeight(3);
    line(sliderX, sliderY + 7, knobX, sliderY + 7);

    // Knob
    fill(255);
    stroke(...INDIGO);
    strokeWeight(2);
    ellipse(knobX, sliderY + 7, 16, 16);

    // Min/max labels
    fill(140);
    noStroke();
    textSize(9);
    textAlign(CENTER, CENTER);
    text('0.0', sliderX, sliderY + 22);
    text('1.0', sliderX + sliderW, sliderY + 22);
}

function drawLegend() {
    let lx = 15;
    let ly = 44;
    textSize(10);
    noStroke();

    // Engineering
    fill(...INDIGO);
    ellipse(lx + 6, ly, 10, 10);
    fill(80);
    textAlign(LEFT, CENTER);
    text('Engineering', lx + 14, ly);

    // Product
    fill(...AMBER);
    ellipse(lx + 100, ly, 10, 10);
    fill(80);
    text('Product', lx + 108, ly);

    // Marketing
    fill(...GOLD);
    stroke(180);
    strokeWeight(0.5);
    ellipse(lx + 170, ly, 10, 10);
    fill(80);
    noStroke();
    text('Marketing', lx + 178, ly);

    // Edge legend
    let elx = lx + 270;
    stroke(180);
    strokeWeight(1.5);
    line(elx, ly, elx + 25, ly);
    fill(80);
    noStroke();
    textAlign(LEFT, CENTER);
    text('Existing', elx + 30, ly);

    drawDashedLine(elx + 90, ly, elx + 115, ly, [212, 136, 15, 220], 2, 6, 4);
    fill(80);
    noStroke();
    text('Predicted', elx + 120, ly);
}

function drawNode(n) {
    let r = 20;
    let isHovered = (hoveredNode === n);

    // Check if connected to hovered prediction
    let isPredTarget = false;
    if (hoveredPrediction) {
        isPredTarget = (n.id === hoveredPrediction.from || n.id === hoveredPrediction.to);
    }

    // Glow on hover
    if (isHovered || isPredTarget) {
        noStroke();
        fill(...GOLD, 70);
        ellipse(n.x, n.y, r * 2 + 18);
    }

    // Node circle
    stroke(isHovered || isPredTarget ? GOLD : [80]);
    strokeWeight(isHovered || isPredTarget ? 3 : 1.5);
    fill(...n.color);
    ellipse(n.x, n.y, r * 2);

    // Label (dark text on gold nodes for contrast)
    fill(n.dept === 'Marketing' ? 60 : 255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(11);
    text(n.name, n.x, n.y);
}

function drawInfoPanel() {
    // Background panel
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(10, INFO_TOP, canvasWidth - 20, canvasHeight - INFO_TOP - 10, 8);

    if (hoveredPrediction && !draggedNode) {
        let p = hoveredPrediction;
        let n1 = nodes[p.from];
        let n2 = nodes[p.to];

        fill(30);
        noStroke();
        textAlign(LEFT, TOP);
        textSize(14);
        text('Predicted Link: ' + n1.name + ' (' + n1.dept + ')  <-->  ' + n2.name + ' (' + n2.dept + ')',
            24, INFO_TOP + 10);

        textSize(12);
        fill(80);
        let methodName = method === 'common' ? 'Common Neighbors' :
                         method === 'jaccard' ? 'Jaccard Coefficient' : 'Adamic-Adar';
        text('Method: ' + methodName + '    |    Score: ' + nf(p.score, 0, 3) +
             '    |    Common Neighbors: ' + p.cn, 24, INFO_TOP + 32);

        if (p.shared.length > 0) {
            text('Shared connections: ' + p.shared.join(', '), 24, INFO_TOP + 50);
        }

        fill(100);
        textSize(11);
        let reason = getReasonText(p);
        text(reason, 24, INFO_TOP + 70);
    } else if (hoveredNode && !draggedNode) {
        let n = hoveredNode;
        let degree = getNeighbors(n.id).size;
        let predCount = 0;
        for (let p of predictedEdges) {
            if (p.score >= threshold && (p.from === n.id || p.to === n.id)) predCount++;
        }

        fill(30);
        noStroke();
        textAlign(LEFT, TOP);
        textSize(14);
        text(n.name + '  (' + n.dept + ')', 24, INFO_TOP + 10);

        textSize(12);
        fill(80);
        text('Current connections: ' + degree + '    |    Predicted new links: ' + predCount,
            24, INFO_TOP + 32);

        let neighbors = [];
        for (let x of getNeighbors(n.id)) neighbors.push(nodes[x].name);
        text('Connected to: ' + neighbors.join(', '), 24, INFO_TOP + 50);
    } else {
        fill(140);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(13);
        text('Hover over a predicted edge (dashed amber line) or node to see details',
            canvasWidth / 2, INFO_TOP + 40);
    }
}

function getReasonText(p) {
    let n1 = nodes[p.from];
    let n2 = nodes[p.to];
    let sameDept = n1.dept === n2.dept;

    if (p.cn >= 3) {
        return n1.name + ' and ' + n2.name + ' share ' + p.cn + ' connections -- a strong structural signal for a future link.';
    } else if (p.cn === 2) {
        if (sameDept) {
            return 'Both in ' + n1.dept + ' with 2 mutual contacts -- likely to collaborate directly soon.';
        }
        return 'Cross-department pair with 2 shared connections -- bridge-building opportunity.';
    } else {
        if (sameDept) {
            return 'Same department with 1 shared connection -- natural introduction path exists.';
        }
        return '1 shared connection bridges ' + n1.dept + ' and ' + n2.dept + ' -- potential cross-team link.';
    }
}

function drawDashedLine(x1, y1, x2, y2, col, weight, dashLen, gapLen) {
    stroke(col);
    strokeWeight(weight);
    let dx = x2 - x1;
    let dy = y2 - y1;
    let totalLen = sqrt(dx * dx + dy * dy);
    if (totalLen < 1) return;
    let ux = dx / totalLen;
    let uy = dy / totalLen;

    let drawn = 0;
    let drawing = true;
    while (drawn < totalLen) {
        let segLen = drawing ? dashLen : gapLen;
        let end = min(drawn + segLen, totalLen);
        if (drawing) {
            line(x1 + ux * drawn, y1 + uy * drawn, x1 + ux * end, y1 + uy * end);
        }
        drawn = end;
        drawing = !drawing;
    }
}

function isMouseNearLine(x1, y1, x2, y2, tolerance) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let lenSq = dx * dx + dy * dy;
    if (lenSq < 1) return false;

    let t = ((mouseX - x1) * dx + (mouseY - y1) * dy) / lenSq;
    t = constrain(t, 0, 1);

    let closestX = x1 + t * dx;
    let closestY = y1 + t * dy;
    let d = dist(mouseX, mouseY, closestX, closestY);
    return d < tolerance;
}

function mousePressed() {
    // Check method buttons
    for (let b of methodButtons) {
        if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
            method = b.key;
            computePredictions();
            return;
        }
    }

    // Check slider knob
    let knobX = sliderX + threshold * sliderW;
    if (dist(mouseX, mouseY, knobX, sliderY + 7) < 14) {
        sliderDragging = true;
        return;
    }

    // Check slider track click
    if (mouseX >= sliderX && mouseX <= sliderX + sliderW &&
        mouseY >= sliderY - 5 && mouseY <= sliderY + 20) {
        threshold = constrain((mouseX - sliderX) / sliderW, 0, 1);
        sliderDragging = true;
        return;
    }

    // Check node drag
    for (let n of nodes) {
        if (dist(mouseX, mouseY, n.x, n.y) < 20) {
            draggedNode = n;
            dragOffsetX = n.x - mouseX;
            dragOffsetY = n.y - mouseY;
            return;
        }
    }
}

function mouseDragged() {
    if (sliderDragging) {
        threshold = constrain((mouseX - sliderX) / sliderW, 0, 1);
        return;
    }
    if (draggedNode) {
        draggedNode.x = mouseX + dragOffsetX;
        draggedNode.y = mouseY + dragOffsetY;
    }
}

function mouseReleased() {
    sliderDragging = false;
    draggedNode = null;
}

function mouseMoved() {
    hoveredNode = null;
    for (let n of nodes) {
        if (dist(mouseX, mouseY, n.x, n.y) < 20) {
            hoveredNode = n;
            break;
        }
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    positionControls();

    // Reposition nodes proportionally
    // (not done here to preserve user drag positions)
}
