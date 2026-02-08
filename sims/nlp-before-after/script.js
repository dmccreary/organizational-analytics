// NLP Before & After MicroSim
// Side-by-side comparison of structural graph vs NLP-enriched graph

let canvasWidth = 900;
const canvasHeight = 550;

const INDIGO = [48, 63, 159];
const INDIGO_LIGHT = [92, 107, 192];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// View modes for right panel
let viewMode = 'sentiment'; // 'sentiment', 'topic', 'tone'

// Node data
const nodeNames = ['Alice', 'Bob', 'Carlos', 'Dana', 'Elena', 'Frank'];
const nodeColors = [
    [92, 107, 192],  // Alice - indigo
    [92, 107, 192],  // Bob - indigo
    [212, 136, 15],  // Carlos - amber
    [56, 142, 60],   // Dana - green
    [156, 39, 176],  // Elena - purple
    [229, 115, 115]  // Frank - coral
];

// Node positions (relative to panel center, will be offset)
const nodeRelPos = [
    { x: -80, y: -120 },  // Alice top-left
    { x: 80, y: -120 },   // Bob top-right
    { x: -120, y: 20 },   // Carlos mid-left
    { x: 120, y: 20 },    // Dana mid-right
    { x: 0, y: 60 },      // Elena center-bottom
    { x: 0, y: -30 }      // Frank center
];

// Edge data with NLP properties
const edgeData = [
    { from: 0, to: 1, channel: 'email', weight: 5, sentiment: 0.6, topic: 'project planning', tone: 'formal', emotion: 'joy' },
    { from: 0, to: 2, channel: 'email', weight: 3, sentiment: -0.3, topic: 'deadline', tone: 'formal', emotion: 'frustration' },
    { from: 1, to: 3, channel: 'chat', weight: 4, sentiment: 0.1, topic: 'status update', tone: 'informal', emotion: 'neutral' },
    { from: 2, to: 4, channel: 'email', weight: 2, sentiment: -0.7, topic: 'resource allocation', tone: 'formal', emotion: 'anger' },
    { from: 3, to: 4, channel: 'chat', weight: 6, sentiment: 0.4, topic: 'mentoring', tone: 'informal', emotion: 'trust' },
    { from: 4, to: 5, channel: 'chat', weight: 3, sentiment: 0.2, topic: 'onboarding', tone: 'informal', emotion: 'anticipation' },
    { from: 5, to: 0, channel: 'email', weight: 2, sentiment: -0.1, topic: 'compliance', tone: 'formal', emotion: 'neutral' },
    { from: 1, to: 4, channel: 'chat', weight: 5, sentiment: 0.5, topic: 'collaboration', tone: 'informal', emotion: 'joy' }
];

// Panels
let leftPanelX, leftPanelW, rightPanelX, rightPanelW;
const panelTop = 55;
const panelBottom = canvasHeight - 15;
const panelGap = 6;

// Left panel nodes (draggable)
let leftNodes = [];
// Right panel nodes (draggable)
let rightNodes = [];

let draggedNode = null;
let dragOffsetX = 0, dragOffsetY = 0;
let hoveredEdge = -1;
let selectedEdge = -1;
let showPropertyCard = false;

// View mode buttons
const viewBtns = [
    { label: 'Sentiment', mode: 'sentiment' },
    { label: 'Topic', mode: 'topic' },
    { label: 'Tone', mode: 'tone' }
];
let viewBtnX = 0;
const viewBtnY = 12;
const viewBtnW = 80;
const viewBtnH = 26;
const viewBtnGap = 6;

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');
    computeLayout();
    initNodes();
}

function computeLayout() {
    let totalW = canvasWidth - 20;
    leftPanelX = 10;
    leftPanelW = totalW * 0.48;
    rightPanelX = leftPanelX + leftPanelW + panelGap;
    rightPanelW = totalW * 0.48 + (totalW * 0.04 - panelGap);

    // View buttons positioned in right panel header area
    viewBtnX = rightPanelX + rightPanelW - (viewBtns.length * (viewBtnW + viewBtnGap));
}

function initNodes() {
    let leftCX = leftPanelX + leftPanelW / 2;
    let rightCX = rightPanelX + rightPanelW / 2;
    let cy = (panelTop + panelBottom) / 2 + 15;

    leftNodes = [];
    rightNodes = [];

    for (let i = 0; i < nodeNames.length; i++) {
        leftNodes.push({
            id: i, name: nodeNames[i], color: nodeColors[i],
            x: leftCX + nodeRelPos[i].x, y: cy + nodeRelPos[i].y
        });
        rightNodes.push({
            id: i, name: nodeNames[i], color: nodeColors[i],
            x: rightCX + nodeRelPos[i].x, y: cy + nodeRelPos[i].y
        });
    }
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(15);
    textStyle(BOLD);
    text('NLP Before & After', canvasWidth / 2, 22);
    textStyle(NORMAL);

    drawViewButtons();
    drawLeftPanel();
    drawRightPanel();
    drawDivider();

    if (showPropertyCard && selectedEdge >= 0) {
        drawPropertyCard();
    }
}

function drawViewButtons() {
    textSize(10);
    for (let i = 0; i < viewBtns.length; i++) {
        let btn = viewBtns[i];
        let x = viewBtnX + i * (viewBtnW + viewBtnGap);
        let isActive = viewMode === btn.mode;
        let isHover = mouseX > x && mouseX < x + viewBtnW && mouseY > viewBtnY && mouseY < viewBtnY + viewBtnH;

        fill(isActive ? INDIGO : (isHover ? INDIGO_LIGHT : [185]));
        noStroke();
        rect(x, viewBtnY, viewBtnW, viewBtnH, 5);

        fill(isActive ? 255 : (isHover ? 255 : 50));
        textAlign(CENTER, CENTER);
        text(btn.label, x + viewBtnW / 2, viewBtnY + viewBtnH / 2);
    }
}

function drawLeftPanel() {
    // Panel background
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(leftPanelX, panelTop, leftPanelW, panelBottom - panelTop, 8);

    // Header
    fill(...INDIGO);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(13);
    textStyle(BOLD);
    text('Structural Graph', leftPanelX + leftPanelW / 2, panelTop + 16);
    textStyle(NORMAL);

    // Draw edges (plain gray)
    for (let i = 0; i < edgeData.length; i++) {
        let e = edgeData[i];
        let n1 = leftNodes[e.from];
        let n2 = leftNodes[e.to];

        stroke(170);
        strokeWeight(map(e.weight, 2, 6, 1, 3));
        line(n1.x, n1.y, n2.x, n2.y);

        // Channel label
        let mx = (n1.x + n2.x) / 2;
        let my = (n1.y + n2.y) / 2;
        fill(130);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(8);
        text(e.channel, mx, my - 6);
        textSize(7);
        fill(160);
        text('w:' + e.weight, mx, my + 5);
    }

    // Draw nodes
    for (let n of leftNodes) {
        let isHover = dist(mouseX, mouseY, n.x, n.y) < 20;

        if (isHover) {
            noStroke();
            fill(...GOLD, 60);
            ellipse(n.x, n.y, 50);
        }

        stroke(80);
        strokeWeight(1.5);
        fill(...n.color);
        ellipse(n.x, n.y, 36);

        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(9);
        text(n.name, n.x, n.y);
    }
}

function drawRightPanel() {
    // Panel background
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(rightPanelX, panelTop, rightPanelW, panelBottom - panelTop, 8);

    // Header
    fill(120, 80, 10);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(13);
    textStyle(BOLD);
    text('NLP-Enriched Graph', rightPanelX + rightPanelW / 2, panelTop + 16);
    textStyle(NORMAL);

    hoveredEdge = -1;

    // Draw edges with NLP styling
    for (let i = 0; i < edgeData.length; i++) {
        let e = edgeData[i];
        let n1 = rightNodes[e.from];
        let n2 = rightNodes[e.to];

        let edgeColor = getEdgeColor(e);
        let sw = map(e.weight, 2, 6, 1.5, 4);

        // Check if mouse is near edge midpoint
        let mx = (n1.x + n2.x) / 2;
        let my = (n1.y + n2.y) / 2;
        let dToMid = dist(mouseX, mouseY, mx, my);
        if (dToMid < 18) hoveredEdge = i;

        let isSelected = (selectedEdge === i && showPropertyCard);
        let isHover = (hoveredEdge === i);

        // Draw edge based on view mode
        if (viewMode === 'tone') {
            // Solid = formal, dashed = informal
            if (e.tone === 'informal') {
                stroke(...edgeColor);
                strokeWeight(sw);
                drawDashedLine(n1.x, n1.y, n2.x, n2.y, 8, 5);
            } else {
                stroke(...edgeColor);
                strokeWeight(sw);
                line(n1.x, n1.y, n2.x, n2.y);
            }
        } else {
            stroke(...edgeColor);
            strokeWeight(isSelected || isHover ? sw + 1.5 : sw);
            line(n1.x, n1.y, n2.x, n2.y);
        }

        // Edge label based on mode
        let labelText = '';
        if (viewMode === 'sentiment') {
            labelText = (e.sentiment >= 0 ? '+' : '') + e.sentiment.toFixed(1);
        } else if (viewMode === 'topic') {
            labelText = e.topic;
        } else if (viewMode === 'tone') {
            labelText = e.tone;
        }

        fill(isHover ? AMBER : [80]);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(8);

        // Background for label readability
        let tw = textWidth(labelText) + 8;
        fill(255, 230);
        noStroke();
        rect(mx - tw / 2, my - 7, tw, 13, 3);

        fill(isHover ? AMBER : [70]);
        text(labelText, mx, my - 1);

        // Arrowhead
        drawArrowhead(n1.x, n1.y, n2.x, n2.y, edgeColor);
    }

    // Draw nodes
    for (let n of rightNodes) {
        let isHover = dist(mouseX, mouseY, n.x, n.y) < 20;

        if (isHover) {
            noStroke();
            fill(...GOLD, 60);
            ellipse(n.x, n.y, 50);
        }

        stroke(80);
        strokeWeight(1.5);
        fill(...n.color);
        ellipse(n.x, n.y, 36);

        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(9);
        text(n.name, n.x, n.y);
    }

    // Legend at bottom of right panel
    drawEdgeLegend();
}

function getEdgeColor(e) {
    if (viewMode === 'sentiment') {
        if (e.sentiment > 0.2) return [56, 142, 60];       // green - positive
        else if (e.sentiment < -0.2) return [211, 47, 47];  // red - negative
        else return [150, 150, 150];                         // gray - neutral
    } else if (viewMode === 'topic') {
        // Color by topic category
        let topicColors = {
            'project planning': [48, 63, 159],
            'deadline': [211, 47, 47],
            'status update': [150, 150, 150],
            'resource allocation': [211, 47, 47],
            'mentoring': [56, 142, 60],
            'onboarding': [156, 39, 176],
            'compliance': [120, 120, 120],
            'collaboration': [48, 63, 159]
        };
        return topicColors[e.topic] || [150, 150, 150];
    } else { // tone
        return e.tone === 'formal' ? [48, 63, 159] : [212, 136, 15];
    }
}

function drawArrowhead(x1, y1, x2, y2, col) {
    let angle = atan2(y2 - y1, x2 - x1);
    let nodeR = 18;
    let tipX = x2 - cos(angle) * nodeR;
    let tipY = y2 - sin(angle) * nodeR;
    let sz = 8;

    fill(...col);
    noStroke();
    push();
    translate(tipX, tipY);
    rotate(angle);
    triangle(0, 0, -sz, -sz / 2.5, -sz, sz / 2.5);
    pop();
}

function drawDashedLine(x1, y1, x2, y2, dashLen, gapLen) {
    let d = dist(x1, y1, x2, y2);
    if (d === 0) return;
    let segments = d / (dashLen + gapLen);
    let dx = (x2 - x1) / d;
    let dy = (y2 - y1) / d;

    for (let s = 0; s < segments; s++) {
        let startD = s * (dashLen + gapLen);
        let endD = min(startD + dashLen, d);
        line(x1 + dx * startD, y1 + dy * startD, x1 + dx * endD, y1 + dy * endD);
    }
}

function drawEdgeLegend() {
    let y = panelBottom - 36;
    let x = rightPanelX + 14;

    fill(230);
    noStroke();
    rect(rightPanelX + 6, y - 6, rightPanelW - 12, 30, 4);

    textSize(9);
    textAlign(LEFT, CENTER);

    if (viewMode === 'sentiment') {
        // Green dot
        fill(56, 142, 60); noStroke();
        ellipse(x + 5, y + 8, 8);
        fill(60); text('Positive (>0.2)', x + 12, y + 8);

        x += 100;
        fill(150); noStroke();
        ellipse(x + 5, y + 8, 8);
        fill(60); text('Neutral', x + 12, y + 8);

        x += 65;
        fill(211, 47, 47); noStroke();
        ellipse(x + 5, y + 8, 8);
        fill(60); text('Negative (<-0.2)', x + 12, y + 8);

    } else if (viewMode === 'topic') {
        fill(80);
        text('Edge labels show detected topics. Colors group related themes.', x, y + 8);
    } else {
        // Tone legend
        stroke(...INDIGO);
        strokeWeight(2);
        line(x, y + 8, x + 20, y + 8);
        fill(60); noStroke();
        text('Formal (solid)', x + 24, y + 8);

        x += 110;
        stroke(...AMBER);
        strokeWeight(2);
        drawDashedLine(x, y + 8, x + 20, y + 8, 5, 3);
        fill(60); noStroke();
        text('Informal (dashed)', x + 24, y + 8);
    }
}

function drawDivider() {
    let dx = leftPanelX + leftPanelW + panelGap / 2;
    stroke(180);
    strokeWeight(1);
    line(dx, panelTop + 5, dx, panelBottom - 5);
}

function drawPropertyCard() {
    if (selectedEdge < 0 || selectedEdge >= edgeData.length) return;
    let e = edgeData[selectedEdge];
    let n1 = rightNodes[e.from];
    let n2 = rightNodes[e.to];

    let cx = (n1.x + n2.x) / 2;
    let cy = (n1.y + n2.y) / 2;

    let cardW = 200;
    let cardH = 150;
    let cardX = cx + 15;
    let cardY = cy - cardH / 2;

    // Keep on screen
    if (cardX + cardW > canvasWidth - 10) cardX = cx - cardW - 15;
    if (cardY < panelTop + 5) cardY = panelTop + 5;
    if (cardY + cardH > panelBottom - 5) cardY = panelBottom - cardH - 5;

    // Card shadow
    fill(0, 20);
    noStroke();
    rect(cardX + 3, cardY + 3, cardW, cardH, 8);

    // Card background
    fill(255, 252, 240);
    stroke(...INDIGO);
    strokeWeight(1.5);
    rect(cardX, cardY, cardW, cardH, 8);

    let px = cardX + 10;
    let py = cardY + 10;

    // Title
    fill(...INDIGO);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(12);
    textStyle(BOLD);
    text(nodeNames[e.from] + ' \u2192 ' + nodeNames[e.to], px, py);
    textStyle(NORMAL);
    py += 20;

    // Divider
    stroke(200);
    strokeWeight(0.5);
    line(px, py, cardX + cardW - 10, py);
    py += 6;

    // Properties
    noStroke();
    textSize(10);

    let sentColor = e.sentiment > 0.2 ? [56, 142, 60] : (e.sentiment < -0.2 ? [211, 47, 47] : [120]);
    fill(80); text('Sentiment:', px, py);
    fill(...sentColor); text((e.sentiment >= 0 ? '+' : '') + e.sentiment.toFixed(1), px + 68, py);
    py += 16;

    fill(80); text('Emotion:', px, py);
    fill(...AMBER); text(e.emotion, px + 68, py);
    py += 16;

    fill(80); text('Topic:', px, py);
    fill(...INDIGO_LIGHT); text(e.topic, px + 68, py);
    py += 16;

    fill(80); text('Tone:', px, py);
    fill(100); text(e.tone, px + 68, py);
    py += 16;

    fill(80); text('Channel:', px, py);
    fill(100); text(e.channel + ' (weight: ' + e.weight + ')', px + 68, py);

    // Close hint
    fill(160);
    textAlign(RIGHT, TOP);
    textSize(8);
    text('click elsewhere to close', cardX + cardW - 10, cardY + cardH - 14);
}

function mousePressed() {
    // View mode buttons
    for (let i = 0; i < viewBtns.length; i++) {
        let x = viewBtnX + i * (viewBtnW + viewBtnGap);
        if (mouseX > x && mouseX < x + viewBtnW && mouseY > viewBtnY && mouseY < viewBtnY + viewBtnH) {
            viewMode = viewBtns[i].mode;
            showPropertyCard = false;
            selectedEdge = -1;
            return;
        }
    }

    // Check edge click in right panel
    if (mouseX > rightPanelX && mouseX < rightPanelX + rightPanelW) {
        if (hoveredEdge >= 0) {
            selectedEdge = hoveredEdge;
            showPropertyCard = true;
            return;
        }
    }

    // Close property card if clicking elsewhere
    if (showPropertyCard) {
        showPropertyCard = false;
        selectedEdge = -1;
    }

    // Check node drag - left panel
    for (let n of leftNodes) {
        if (dist(mouseX, mouseY, n.x, n.y) < 20) {
            draggedNode = n;
            dragOffsetX = n.x - mouseX;
            dragOffsetY = n.y - mouseY;
            return;
        }
    }

    // Check node drag - right panel
    for (let n of rightNodes) {
        if (dist(mouseX, mouseY, n.x, n.y) < 20) {
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

function mouseReleased() {
    draggedNode = null;
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    computeLayout();
    initNodes();
}
