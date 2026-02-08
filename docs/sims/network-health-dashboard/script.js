// Network Health Dashboard - p5.js MicroSim
// Three gauge cards with sliders and combined diagnostic assessment

let canvasWidth = 900;
const canvasHeight = 490;

const INDIGO = [48, 63, 159];
const INDIGO_LIGHT = [92, 107, 192];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

const GREEN = [76, 175, 80];
const YELLOW = [255, 193, 7];
const RED = [239, 83, 80];

let metrics = [];
let diagnoseBtn;
let diagnosisText = '';
let diagnosisColor = [80, 80, 80];
let activeSlider = -1; // which slider is being dragged

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');

    buildMetrics();
    layoutCards();
}

function buildMetrics() {
    metrics = [
        {
            title: 'Network Density',
            value: 0.034,
            min: 0, max: 0.10,
            step: 0.001,
            decimals: 3,
            // Zones: [start, end, color]
            zones: [
                { start: 0, end: 0.01, color: RED, label: 'Sparse' },
                { start: 0.01, end: 0.02, color: YELLOW, label: 'Low' },
                { start: 0.02, end: 0.05, color: GREEN, label: 'Healthy' },
                { start: 0.05, end: 0.08, color: YELLOW, label: 'High' },
                { start: 0.08, end: 0.10, color: RED, label: 'Over-connected' }
            ]
        },
        {
            title: 'Avg Path Length',
            value: 3.2,
            min: 1, max: 8,
            step: 0.1,
            decimals: 1,
            zones: [
                { start: 1, end: 2, color: RED, label: 'Too short' },
                { start: 2, end: 4, color: GREEN, label: 'Efficient' },
                { start: 4, end: 5, color: YELLOW, label: 'Stretching' },
                { start: 5, end: 8, color: RED, label: 'Fragmented' }
            ]
        },
        {
            title: 'Avg Clustering',
            value: 0.45,
            min: 0, max: 1,
            step: 0.01,
            decimals: 2,
            zones: [
                { start: 0, end: 0.1, color: RED, label: 'No clusters' },
                { start: 0.1, end: 0.3, color: YELLOW, label: 'Low' },
                { start: 0.3, end: 0.6, color: GREEN, label: 'Balanced' },
                { start: 0.6, end: 0.8, color: YELLOW, label: 'Cliquish' },
                { start: 0.8, end: 1, color: RED, label: 'Siloed' }
            ]
        }
    ];
}

function layoutCards() {
    let cardPad = 12;
    let totalPad = cardPad * 4; // left + 2 gaps + right
    let cardW = (canvasWidth - totalPad) / 3;

    for (let i = 0; i < metrics.length; i++) {
        let m = metrics[i];
        m.cardX = cardPad + i * (cardW + cardPad);
        m.cardY = 50;
        m.cardW = cardW;
        m.cardH = 330;

        // Gauge center
        m.gaugeX = m.cardX + cardW / 2;
        m.gaugeY = m.cardY + 140;
        m.gaugeR = min(cardW * 0.38, 95);

        // Slider
        m.sliderX = m.cardX + 25;
        m.sliderW = cardW - 50;
        m.sliderY = m.cardY + m.cardH - 35;
        m.sliderR = 10;
    }

    // Diagnose button
    let btnW = 140;
    let btnH = 34;
    diagnoseBtn = {
        x: canvasWidth / 2 - btnW / 2,
        y: 395,
        w: btnW,
        h: btnH
    };
}

function draw() {
    background(245);

    // Title
    fill(...INDIGO);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text('Network Health Dashboard', canvasWidth / 2, 26);

    // Draw cards
    for (let i = 0; i < metrics.length; i++) {
        drawCard(metrics[i]);
    }

    // Diagnose button
    drawDiagnoseButton();

    // Diagnosis text
    if (diagnosisText.length > 0) {
        fill(...diagnosisColor);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        textStyle(NORMAL);
        // Word wrap the diagnosis text
        let maxW = canvasWidth - 60;
        let lines = wrapText(diagnosisText, maxW);
        for (let i = 0; i < lines.length; i++) {
            text(lines[i], canvasWidth / 2, 448 + i * 18);
        }
    }
}

function drawCard(m) {
    // Card background
    fill(255);
    stroke(220);
    strokeWeight(1);
    rect(m.cardX, m.cardY, m.cardW, m.cardH, 10);

    // Card header
    fill(...INDIGO);
    noStroke();
    rect(m.cardX, m.cardY, m.cardW, 36, 10, 10, 0, 0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(13);
    textStyle(BOLD);
    text(m.title, m.cardX + m.cardW / 2, m.cardY + 18);
    textStyle(NORMAL);

    // Draw gauge
    drawGauge(m);

    // Draw slider
    drawSlider(m);
}

function drawGauge(m) {
    let cx = m.gaugeX;
    let cy = m.gaugeY;
    let r = m.gaugeR;

    // Draw colored arc zones
    let totalRange = m.max - m.min;
    let startAngle = PI;
    let totalSweep = PI;

    for (let z of m.zones) {
        let a1 = startAngle + ((z.start - m.min) / totalRange) * totalSweep;
        let a2 = startAngle + ((z.end - m.min) / totalRange) * totalSweep;

        noFill();
        stroke(z.color[0], z.color[1], z.color[2], 180);
        strokeWeight(16);
        strokeCap(SQUARE);
        arc(cx, cy, r * 2 - 8, r * 2 - 8, a1, a2);
    }

    // Inner arc background (lighter)
    noFill();
    stroke(245);
    strokeWeight(6);
    arc(cx, cy, r * 2 - 30, r * 2 - 30, PI, TWO_PI);

    // Needle
    let valueAngle = PI + ((m.value - m.min) / totalRange) * PI;
    let needleLen = r - 20;
    let nx = cx + needleLen * cos(valueAngle);
    let ny = cy + needleLen * sin(valueAngle);

    stroke(50);
    strokeWeight(2.5);
    line(cx, cy, nx, ny);

    // Needle hub
    fill(50);
    noStroke();
    ellipse(cx, cy, 10);

    // Value text
    fill(...INDIGO);
    textAlign(CENTER, CENTER);
    textSize(20);
    textStyle(BOLD);
    text(nf(m.value, 0, m.decimals), cx, cy + 28);
    textStyle(NORMAL);

    // Zone label for current value
    let currentZone = getZone(m, m.value);
    if (currentZone) {
        fill(currentZone.color[0], currentZone.color[1], currentZone.color[2]);
        textSize(11);
        text(currentZone.label, cx, cy + 48);
    }

    // Min/Max labels
    fill(150);
    textSize(10);
    textAlign(LEFT, CENTER);
    text(nf(m.min, 0, m.decimals), cx - r + 2, cy + 12);
    textAlign(RIGHT, CENTER);
    text(nf(m.max, 0, m.decimals), cx + r - 2, cy + 12);
}

function drawSlider(m) {
    let sx = m.sliderX;
    let sy = m.sliderY;
    let sw = m.sliderW;

    // Track
    stroke(200);
    strokeWeight(4);
    strokeCap(ROUND);
    line(sx, sy, sx + sw, sy);

    // Active track
    let frac = (m.value - m.min) / (m.max - m.min);
    stroke(...INDIGO_LIGHT);
    strokeWeight(4);
    line(sx, sy, sx + frac * sw, sy);

    // Handle
    let hx = sx + frac * sw;
    let isHover = dist(mouseX, mouseY, hx, sy) < m.sliderR + 4;
    fill(isHover ? AMBER : INDIGO);
    stroke(255);
    strokeWeight(2);
    ellipse(hx, sy, m.sliderR * 2);
}

function drawDiagnoseButton() {
    let b = diagnoseBtn;
    let isHov = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
    fill(isHov ? INDIGO_LIGHT : INDIGO);
    noStroke();
    rect(b.x, b.y, b.w, b.h, 8);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    textStyle(BOLD);
    text('Diagnose', b.x + b.w / 2, b.y + b.h / 2);
    textStyle(NORMAL);
}

function getZone(m, value) {
    for (let z of m.zones) {
        if (value >= z.start && value <= z.end) return z;
    }
    return m.zones[m.zones.length - 1];
}

function runDiagnosis() {
    let density = metrics[0].value;
    let pathLen = metrics[1].value;
    let clustering = metrics[2].value;

    let issues = [];
    let severity = 'green';

    // Check for silo pattern: high clustering + long paths
    if (clustering > 0.6 && pathLen > 4) {
        issues.push('High clustering + long path length = silo risk. Teams are tightly knit but poorly connected across groups.');
        severity = 'red';
    }

    // Hub-and-spoke: low clustering + short paths
    if (clustering < 0.2 && pathLen < 2.5) {
        issues.push('Low clustering + short paths = hub-and-spoke structure. A few key connectors hold everything together -- fragile if they leave.');
        severity = 'red';
    }

    // Sparse network
    if (density < 0.01) {
        issues.push('Very low density -- the network is dangerously sparse. Many employees may be isolated.');
        severity = 'red';
    }

    // Over-connected
    if (density > 0.08) {
        issues.push('Very high density suggests meeting overload or reporting noise. Not all connections are meaningful.');
        if (severity !== 'red') severity = 'yellow';
    }

    // Fragmented
    if (pathLen > 5) {
        issues.push('Long average path length suggests the network may be fragmented or have bottleneck bridges.');
        if (severity !== 'red') severity = 'yellow';
    }

    // Good combo: moderate everything
    if (density >= 0.02 && density <= 0.05 && pathLen >= 2 && pathLen <= 4 && clustering >= 0.3 && clustering <= 0.6) {
        issues.push('All three metrics are in healthy ranges. The network has good connectivity, efficient information flow, and balanced local clustering.');
        severity = 'green';
    }

    // Mild concerns
    if (issues.length === 0) {
        if (clustering > 0.6) {
            issues.push('Elevated clustering suggests strong local groups but potential silo formation.');
            severity = 'yellow';
        }
        if (pathLen > 4 && pathLen <= 5) {
            issues.push('Path length is stretching -- information may take extra hops to cross the organization.');
            severity = 'yellow';
        }
        if (density < 0.02 && density >= 0.01) {
            issues.push('Density is on the low side. Consider fostering more cross-team connections.');
            severity = 'yellow';
        }
    }

    if (issues.length === 0) {
        issues.push('Metrics are within reasonable ranges. Monitor for trends over time.');
        severity = 'green';
    }

    diagnosisText = issues.join(' ');

    if (severity === 'green') {
        diagnosisColor = [...GREEN];
    } else if (severity === 'yellow') {
        diagnosisColor = [180, 140, 0];
    } else {
        diagnosisColor = [...RED];
    }
}

function wrapText(txt, maxW) {
    let words = txt.split(' ');
    let lines = [];
    let currentLine = '';

    for (let w of words) {
        let testLine = currentLine.length > 0 ? currentLine + ' ' + w : w;
        textSize(12);
        if (textWidth(testLine) > maxW && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = w;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine.length > 0) lines.push(currentLine);
    return lines;
}

function mousePressed() {
    // Check diagnose button
    let b = diagnoseBtn;
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
        runDiagnosis();
        return;
    }

    // Check sliders
    for (let i = 0; i < metrics.length; i++) {
        let m = metrics[i];
        let frac = (m.value - m.min) / (m.max - m.min);
        let hx = m.sliderX + frac * m.sliderW;
        if (dist(mouseX, mouseY, hx, m.sliderY) < m.sliderR + 6) {
            activeSlider = i;
            return;
        }
        // Also allow clicking on the track to jump
        if (mouseY > m.sliderY - 12 && mouseY < m.sliderY + 12 &&
            mouseX > m.sliderX - 5 && mouseX < m.sliderX + m.sliderW + 5) {
            activeSlider = i;
            updateSliderValue(i);
            return;
        }
    }
}

function mouseDragged() {
    if (activeSlider >= 0) {
        updateSliderValue(activeSlider);
    }
}

function mouseReleased() {
    activeSlider = -1;
}

function updateSliderValue(idx) {
    let m = metrics[idx];
    let frac = constrain((mouseX - m.sliderX) / m.sliderW, 0, 1);
    let rawVal = m.min + frac * (m.max - m.min);
    // Snap to step
    m.value = round(rawVal / m.step) * m.step;
    m.value = constrain(m.value, m.min, m.max);
    // Clear old diagnosis when values change
    diagnosisText = '';
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    layoutCards();
}
