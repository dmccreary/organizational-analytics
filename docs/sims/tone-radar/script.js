// Tone Radar Chart MicroSim
// Hexagonal radar chart showing multi-dimensional communication tone profiles

let canvasWidth = 900;
const canvasHeight = 580;

const INDIGO = [48, 63, 159];
const INDIGO_DARK = [26, 35, 126];
const INDIGO_LIGHT = [92, 107, 192];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

const axes = ['Formality', 'Directness', 'Confidence', 'Urgency', 'Empathy', 'Positivity'];
const numAxes = 6;

// Example messages for each axis
const axisExamples = [
    '"Per our earlier discussion, please submit the report by EOD."',
    '"We need this fixed today. No workarounds."',
    '"I am certain this approach will resolve the bottleneck."',
    '"This is time-sensitive \u2014 please prioritize immediately."',
    '"I understand this is a tough timeline. How can I help?"',
    '"Great progress! The team really came together on this one."'
];

const teams = [
    { name: 'Engineering', scores: [0.5, 0.8, 0.7, 0.4, 0.3, 0.5], color: [48, 63, 159], active: false },
    { name: 'Sales',       scores: [0.3, 0.6, 0.8, 0.5, 0.5, 0.8], color: [212, 136, 15], active: false },
    { name: 'Executive',   scores: [0.8, 0.7, 0.9, 0.6, 0.4, 0.5], color: [26, 35, 126], active: false },
    { name: 'HR',          scores: [0.6, 0.4, 0.5, 0.3, 0.8, 0.7], color: [56, 142, 60], active: false },
    { name: 'Support',     scores: [0.4, 0.4, 0.5, 0.6, 0.9, 0.6], color: [229, 115, 115], active: false }
];

const orgAvg = [0.5, 0.6, 0.65, 0.45, 0.5, 0.6];

// Button layout
const btnH = 30;
const btnW = 95;
const btnGap = 8;
let btnStartX = 0;
const btnY = 10;
let clearBtnX = 0;

// Radar layout
let radarCX, radarCY, radarR;

let hoveredAxis = -1;
let tooltipVisible = false;

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
}

function computeLayout() {
    // Center buttons
    let totalBtnW = teams.length * (btnW + btnGap) + 60 + btnGap; // 60 for Clear btn
    btnStartX = (canvasWidth - totalBtnW) / 2;
    clearBtnX = btnStartX + teams.length * (btnW + btnGap);

    // Radar center and radius
    radarCX = canvasWidth / 2;
    radarCY = 280;
    radarR = 175;
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(15);
    textStyle(BOLD);
    text('Communication Tone Profiles', canvasWidth / 2, btnY + btnH + 18);
    textStyle(NORMAL);

    drawButtons();
    drawRadar();
    drawLegend();

    if (hoveredAxis >= 0) {
        drawAxisTooltip(hoveredAxis);
    }
}

function drawButtons() {
    textSize(11);
    for (let i = 0; i < teams.length; i++) {
        let x = btnStartX + i * (btnW + btnGap);
        let isHover = mouseX > x && mouseX < x + btnW && mouseY > btnY && mouseY < btnY + btnH;
        let isActive = teams[i].active;

        if (isActive) {
            fill(...teams[i].color);
        } else if (isHover) {
            fill(...teams[i].color, 140);
        } else {
            fill(200);
        }
        noStroke();
        rect(x, btnY, btnW, btnH, 6);

        fill(isActive || isHover ? 255 : 60);
        textAlign(CENTER, CENTER);
        text(teams[i].name, x + btnW / 2, btnY + btnH / 2);
    }

    // Clear button
    let clearHover = mouseX > clearBtnX && mouseX < clearBtnX + 60 && mouseY > btnY && mouseY < btnY + btnH;
    fill(clearHover ? [180, 60, 60] : [160]);
    noStroke();
    rect(clearBtnX, btnY, 60, btnH, 6);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(11);
    text('Clear', clearBtnX + 30, btnY + btnH / 2);
}

function drawRadar() {
    // Grid rings
    for (let ring = 1; ring <= 5; ring++) {
        let r = radarR * (ring / 5);
        stroke(210);
        strokeWeight(0.5);
        noFill();
        beginShape();
        for (let i = 0; i < numAxes; i++) {
            let angle = -PI / 2 + (TWO_PI / numAxes) * i;
            vertex(radarCX + cos(angle) * r, radarCY + sin(angle) * r);
        }
        endShape(CLOSE);

        // Ring value labels
        if (ring % 2 === 0 || ring === 1) {
            fill(170);
            noStroke();
            textAlign(LEFT, CENTER);
            textSize(8);
            let labelAngle = -PI / 2;
            text((ring * 0.2).toFixed(1), radarCX + cos(labelAngle) * r + 4, radarCY + sin(labelAngle) * r);
        }
    }

    // Axes lines and labels
    hoveredAxis = -1;
    for (let i = 0; i < numAxes; i++) {
        let angle = -PI / 2 + (TWO_PI / numAxes) * i;
        let endX = radarCX + cos(angle) * radarR;
        let endY = radarCY + sin(angle) * radarR;

        stroke(180);
        strokeWeight(1);
        line(radarCX, radarCY, endX, endY);

        // Label position (slightly beyond the radar)
        let labelR = radarR + 28;
        let lx = radarCX + cos(angle) * labelR;
        let ly = radarCY + sin(angle) * labelR;

        // Check hover on axis endpoint
        let tipX = radarCX + cos(angle) * (radarR + 8);
        let tipY = radarCY + sin(angle) * (radarR + 8);
        if (dist(mouseX, mouseY, tipX, tipY) < 28) {
            hoveredAxis = i;
        }

        fill(hoveredAxis === i ? AMBER : [60]);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(11);
        textStyle(BOLD);
        text(axes[i], lx, ly);
        textStyle(NORMAL);
    }

    // Draw org average (dashed polygon) - always visible
    drawRadarPolygon(orgAvg, [150], 1.5, true, null);

    // Draw active team polygons
    let activeTeams = teams.filter(t => t.active);
    for (let team of activeTeams) {
        drawRadarPolygon(team.scores, team.color, 2.5, false, team.color);
    }
}

function drawRadarPolygon(scores, strokeCol, sw, dashed, fillCol) {
    let points = [];
    for (let i = 0; i < numAxes; i++) {
        let angle = -PI / 2 + (TWO_PI / numAxes) * i;
        let r = radarR * scores[i];
        points.push({ x: radarCX + cos(angle) * r, y: radarCY + sin(angle) * r });
    }

    // Fill
    if (fillCol) {
        fill(...fillCol, 70);
        noStroke();
        beginShape();
        for (let p of points) vertex(p.x, p.y);
        endShape(CLOSE);
    }

    // Stroke
    stroke(...strokeCol);
    strokeWeight(sw);
    noFill();

    if (dashed) {
        // Draw dashed lines between vertices
        for (let i = 0; i < points.length; i++) {
            let j = (i + 1) % points.length;
            drawDashedLine(points[i].x, points[i].y, points[j].x, points[j].y, 6, 4);
        }
    } else {
        beginShape();
        for (let p of points) vertex(p.x, p.y);
        endShape(CLOSE);
    }

    // Dots at vertices
    fill(...strokeCol);
    noStroke();
    for (let p of points) {
        ellipse(p.x, p.y, 6, 6);
    }
}

function drawDashedLine(x1, y1, x2, y2, dashLen, gapLen) {
    let d = dist(x1, y1, x2, y2);
    let segments = d / (dashLen + gapLen);
    let dx = (x2 - x1) / d;
    let dy = (y2 - y1) / d;

    for (let s = 0; s < segments; s++) {
        let startD = s * (dashLen + gapLen);
        let endD = min(startD + dashLen, d);
        line(x1 + dx * startD, y1 + dy * startD, x1 + dx * endD, y1 + dy * endD);
    }
}

function drawAxisTooltip(idx) {
    let angle = -PI / 2 + (TWO_PI / numAxes) * idx;
    let tipX = radarCX + cos(angle) * (radarR + 8);
    let tipY = radarCY + sin(angle) * (radarR + 8);

    let tw = 290;
    let th = 90;
    let tx = tipX + 15;
    let ty = tipY - th / 2;

    // Keep tooltip on screen
    if (tx + tw > canvasWidth - 10) tx = tipX - tw - 15;
    if (ty < 50) ty = 50;
    if (ty + th > canvasHeight - 10) ty = canvasHeight - th - 10;

    fill(255, 252, 240);
    stroke(180);
    strokeWeight(1);
    rect(tx, ty, tw, th, 6);

    // Axis name and org avg
    fill(...INDIGO);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(12);
    textStyle(BOLD);
    text(axes[idx], tx + 8, ty + 6);
    textStyle(NORMAL);

    // Org average score
    fill(120);
    textSize(10);
    text('Org Average: ' + orgAvg[idx].toFixed(2), tx + 8, ty + 24);

    // Active team scores
    let activeTeams = teams.filter(t => t.active);
    let scoreY = ty + 24;
    for (let team of activeTeams) {
        scoreY += 14;
        fill(...team.color);
        textSize(10);
        text(team.name + ': ' + team.scores[idx].toFixed(2), tx + 8, scoreY);
    }

    // Example message
    fill(100);
    textSize(9);
    textStyle(ITALIC);
    let exY = max(scoreY + 18, ty + 52);
    text(axisExamples[idx], tx + 8, exY, tw - 16, 30);
    textStyle(NORMAL);
}

function drawLegend() {
    let y = canvasHeight - 45;
    let activeTeams = teams.filter(t => t.active);

    // Always show org avg in legend
    let legendItems = [{ name: 'Org Average', color: [150], dashed: true }];
    for (let t of activeTeams) {
        legendItems.push({ name: t.name, color: t.color, dashed: false });
    }

    let totalW = 0;
    textSize(10);
    for (let item of legendItems) {
        totalW += textWidth(item.name) + 40;
    }
    let lx = (canvasWidth - totalW) / 2;

    for (let item of legendItems) {
        // Color swatch
        if (item.dashed) {
            stroke(...item.color);
            strokeWeight(1.5);
            drawDashedLine(lx, y + 8, lx + 20, y + 8, 4, 3);
        } else {
            fill(...item.color, 60);
            stroke(...item.color);
            strokeWeight(1.5);
            rect(lx, y + 2, 20, 12, 2);
        }

        // Label
        fill(60);
        noStroke();
        textAlign(LEFT, CENTER);
        textSize(10);
        text(item.name, lx + 24, y + 8);

        lx += textWidth(item.name) + 40;
    }

    // Instruction text
    fill(140);
    textAlign(CENTER, CENTER);
    textSize(9);
    text('Click team buttons to compare (max 2). Hover axis labels for details.', canvasWidth / 2, canvasHeight - 14);
}

function mousePressed() {
    // Team buttons
    for (let i = 0; i < teams.length; i++) {
        let x = btnStartX + i * (btnW + btnGap);
        if (mouseX > x && mouseX < x + btnW && mouseY > btnY && mouseY < btnY + btnH) {
            if (teams[i].active) {
                teams[i].active = false;
            } else {
                // Count active
                let activeCount = teams.filter(t => t.active).length;
                if (activeCount >= 2) {
                    // Deactivate the first active team
                    for (let t of teams) {
                        if (t.active) { t.active = false; break; }
                    }
                }
                teams[i].active = true;
            }
            return;
        }
    }

    // Clear button
    if (mouseX > clearBtnX && mouseX < clearBtnX + 60 && mouseY > btnY && mouseY < btnY + btnH) {
        for (let t of teams) t.active = false;
        return;
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    computeLayout();
}
