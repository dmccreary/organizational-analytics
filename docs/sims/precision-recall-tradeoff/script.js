// Precision-Recall Tradeoff - p5.js MicroSim
// Interactive threshold slider affecting precision, recall, and confusion matrix

let canvasWidth = 900;
const canvasHeight = 550;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// Pre-computed data points: [threshold, TP, FP, FN, TN]
const dataPoints = [
    [0.2, 17, 33, 1, 49],
    [0.3, 16, 22, 2, 60],
    [0.4, 15, 14, 3, 68],
    [0.5, 13, 7, 5, 75],
    [0.6, 11, 4, 7, 78],
    [0.7, 9, 2, 9, 80],
    [0.8, 7, 1, 11, 81]
];

let threshold = 0.5;
let sliderDragging = false;

// Animated display values (for lerp)
let displayPrecision = 0.65;
let displayRecall = 0.72;
let displayTP = 13, displayFP = 7, displayFN = 5, displayTN = 75;

// Layout constants
const SLIDER_Y = 80;
const SLIDER_X_LEFT = 100;
let sliderXRight = 800;
const CHART_TOP = 130;
const MATRIX_TOP = 130;

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');
    sliderXRight = canvasWidth - 100;
}

function interpolateData(t) {
    // Clamp
    t = constrain(t, 0.2, 0.8);

    // Find bracketing data points
    for (let i = 0; i < dataPoints.length - 1; i++) {
        let d1 = dataPoints[i];
        let d2 = dataPoints[i + 1];
        if (t >= d1[0] && t <= d2[0]) {
            let frac = (t - d1[0]) / (d2[0] - d1[0]);
            return {
                tp: lerp(d1[1], d2[1], frac),
                fp: lerp(d1[2], d2[2], frac),
                fn: lerp(d1[3], d2[3], frac),
                tn: lerp(d1[4], d2[4], frac)
            };
        }
    }
    // Edge: at or beyond last point
    let d = dataPoints[dataPoints.length - 1];
    return { tp: d[1], fp: d[2], fn: d[3], tn: d[4] };
}

function getConsequenceText(t) {
    if (t < 0.35) {
        return 'Low threshold: You flag many employees as flight risks. High recall catches most actual leavers, but the high false alarm rate overwhelms managers with retention interventions for people who were never going to leave.';
    } else if (t < 0.55) {
        return 'Balanced threshold: A reasonable tradeoff between catching leavers and minimizing false alarms. Most actual departures are identified while keeping the false positive rate manageable for HR teams.';
    } else if (t < 0.7) {
        return 'Moderately high threshold: Fewer false alarms mean managers trust the predictions more, but you are starting to miss a significant number of actual leavers. Some preventable departures will slip through.';
    } else {
        return 'High threshold: Very few false alarms and high credibility, but you miss many actual leavers. Surprised departures cost the organization in lost knowledge, recruitment expenses, and team disruption.';
    }
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text('Precision-Recall Tradeoff', canvasWidth / 2, 20);
    textStyle(NORMAL);
    textSize(11);
    fill(100);
    text('Drag the threshold slider to explore the tradeoff in an employee attrition prediction scenario', canvasWidth / 2, 38);

    // Compute current values
    let data = interpolateData(threshold);
    let targetTP = data.tp;
    let targetFP = data.fp;
    let targetFN = data.fn;
    let targetTN = data.tn;
    let targetPrecision = targetTP / (targetTP + targetFP);
    let targetRecall = targetTP / (targetTP + targetFN);

    // Lerp for animation
    displayPrecision = lerp(displayPrecision, targetPrecision, 0.15);
    displayRecall = lerp(displayRecall, targetRecall, 0.15);
    displayTP = lerp(displayTP, targetTP, 0.15);
    displayFP = lerp(displayFP, targetFP, 0.15);
    displayFN = lerp(displayFN, targetFN, 0.15);
    displayTN = lerp(displayTN, targetTN, 0.15);

    drawSlider();
    drawBarCharts();
    drawConfusionMatrix();
    drawConsequenceText();
}

function drawSlider() {
    let sliderW = sliderXRight - SLIDER_X_LEFT;
    let y = SLIDER_Y;

    // Label
    fill(50);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(13);
    textStyle(BOLD);
    text('Classification Threshold', canvasWidth / 2, y - 30);
    textStyle(NORMAL);

    // Track background
    stroke(180);
    strokeWeight(4);
    line(SLIDER_X_LEFT, y, sliderXRight, y);

    // Colored track: green-to-red gradient
    for (let x = SLIDER_X_LEFT; x < sliderXRight; x++) {
        let t = (x - SLIDER_X_LEFT) / sliderW;
        let r = lerp(80, 200, t);
        let g = lerp(180, 80, t);
        let b = 80;
        stroke(r, g, b, 100);
        strokeWeight(4);
        point(x, y);
    }

    // Tick marks
    for (let v = 0.2; v <= 0.8; v += 0.1) {
        let x = map(v, 0.2, 0.8, SLIDER_X_LEFT, sliderXRight);
        stroke(100);
        strokeWeight(1);
        line(x, y - 8, x, y + 8);
        fill(100);
        noStroke();
        textSize(10);
        textAlign(CENTER, TOP);
        text(nf(v, 1, 1), x, y + 11);
    }

    // Handle
    let handleX = map(threshold, 0.2, 0.8, SLIDER_X_LEFT, sliderXRight);
    let isHover = abs(mouseX - handleX) < 14 && abs(mouseY - y) < 14;

    // Handle shadow
    noStroke();
    fill(0, 0, 0, 30);
    ellipse(handleX + 2, y + 2, 24);

    // Handle
    stroke(30);
    strokeWeight(2);
    fill(isHover || sliderDragging ? GOLD : [255]);
    ellipse(handleX, y, 22);

    // Value display
    fill(30);
    noStroke();
    textAlign(CENTER, BOTTOM);
    textSize(14);
    textStyle(BOLD);
    text(nf(threshold, 1, 2), handleX, y - 14);
    textStyle(NORMAL);
}

function drawBarCharts() {
    let chartX = 40;
    let chartW = canvasWidth * 0.35;
    let barMaxH = 200;
    let barW = 80;
    let chartBottom = CHART_TOP + barMaxH + 30;

    // Background card
    fill(255);
    stroke(220);
    strokeWeight(1);
    rect(chartX, CHART_TOP, chartW, barMaxH + 60, 8);

    // Precision bar
    let pBarX = chartX + chartW * 0.25 - barW / 2;
    let pBarH = displayPrecision * barMaxH;
    let pBarY = CHART_TOP + 20 + barMaxH - pBarH;

    fill(230);
    noStroke();
    rect(pBarX, CHART_TOP + 20, barW, barMaxH, 4);

    fill(...INDIGO);
    rect(pBarX, pBarY, barW, pBarH, 4);

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text(nf(displayPrecision, 1, 2), pBarX + barW / 2, pBarY + pBarH / 2);
    textStyle(NORMAL);

    fill(50);
    textSize(13);
    textStyle(BOLD);
    text('Precision', pBarX + barW / 2, chartBottom + 4);
    textStyle(NORMAL);

    // Recall bar
    let rBarX = chartX + chartW * 0.75 - barW / 2;
    let rBarH = displayRecall * barMaxH;
    let rBarY = CHART_TOP + 20 + barMaxH - rBarH;

    fill(230);
    noStroke();
    rect(rBarX, CHART_TOP + 20, barW, barMaxH, 4);

    fill(...AMBER);
    rect(rBarX, rBarY, barW, rBarH, 4);

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text(nf(displayRecall, 1, 2), rBarX + barW / 2, rBarY + rBarH / 2);
    textStyle(NORMAL);

    fill(50);
    textSize(13);
    textStyle(BOLD);
    text('Recall', rBarX + barW / 2, chartBottom + 4);
    textStyle(NORMAL);
}

function drawConfusionMatrix() {
    let matrixX = canvasWidth * 0.43;
    let matrixW = canvasWidth * 0.53;
    let matrixY = MATRIX_TOP;
    let matrixH = 260;

    // Background card
    fill(255);
    stroke(220);
    strokeWeight(1);
    rect(matrixX, matrixY, matrixW, matrixH, 8);

    // Title
    fill(50);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(13);
    textStyle(BOLD);
    text('Confusion Matrix (100 employees, 18 actual leavers)', matrixX + matrixW / 2, matrixY + 8);
    textStyle(NORMAL);

    // Grid
    let gridX = matrixX + 90;
    let gridY = matrixY + 55;
    let cellW = (matrixW - 130) / 2;
    let cellH = 80;

    // Column headers
    textSize(11);
    fill(80);
    textAlign(CENTER, CENTER);
    text('Predicted: Leave', gridX + cellW / 2, gridY - 15);
    text('Predicted: Stay', gridX + cellW + cellW / 2, gridY - 15);

    // Row headers
    textAlign(RIGHT, CENTER);
    text('Actual:', gridX - 20, gridY + cellH / 2 - 8);
    text('Leave', gridX - 20, gridY + cellH / 2 + 8);
    text('Actual:', gridX - 20, gridY + cellH + cellH / 2 - 8);
    text('Stay', gridX - 20, gridY + cellH + cellH / 2 + 8);

    // TP cell (top-left) - green
    fill(76, 175, 80, 180);
    stroke(76, 175, 80);
    strokeWeight(2);
    rect(gridX, gridY, cellW, cellH, 4);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(11);
    text('True Positive', gridX + cellW / 2, gridY + 20);
    textSize(24);
    textStyle(BOLD);
    text(round(displayTP), gridX + cellW / 2, gridY + 52);
    textStyle(NORMAL);

    // FN cell (top-right) - red
    fill(229, 115, 115, 180);
    stroke(229, 115, 115);
    strokeWeight(2);
    rect(gridX + cellW, gridY, cellW, cellH, 4);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(11);
    text('False Negative', gridX + cellW + cellW / 2, gridY + 20);
    textSize(24);
    textStyle(BOLD);
    text(round(displayFN), gridX + cellW + cellW / 2, gridY + 52);
    textStyle(NORMAL);

    // FP cell (bottom-left) - amber
    fill(212, 136, 15, 150);
    stroke(212, 136, 15);
    strokeWeight(2);
    rect(gridX, gridY + cellH, cellW, cellH, 4);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(11);
    text('False Positive', gridX + cellW / 2, gridY + cellH + 20);
    textSize(24);
    textStyle(BOLD);
    text(round(displayFP), gridX + cellW / 2, gridY + cellH + 52);
    textStyle(NORMAL);

    // TN cell (bottom-right) - gray
    fill(158, 158, 158, 150);
    stroke(158, 158, 158);
    strokeWeight(2);
    rect(gridX + cellW, gridY + cellH, cellW, cellH, 4);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(11);
    text('True Negative', gridX + cellW + cellW / 2, gridY + cellH + 20);
    textSize(24);
    textStyle(BOLD);
    text(round(displayTN), gridX + cellW + cellW / 2, gridY + cellH + 52);
    textStyle(NORMAL);
}

function drawConsequenceText() {
    let boxX = 20;
    let boxY = 400;
    let boxW = canvasWidth - 40;

    let txt = getConsequenceText(threshold);

    textSize(12);
    let padding = 14;
    // Word wrap
    let words = txt.split(' ');
    let lines = [];
    let currentLine = '';
    let maxLineW = boxW - padding * 2;
    for (let w of words) {
        let testLine = currentLine.length === 0 ? w : currentLine + ' ' + w;
        if (textWidth(testLine) > maxLineW) {
            lines.push(currentLine);
            currentLine = w;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine.length > 0) lines.push(currentLine);

    let boxH = lines.length * 18 + padding * 2 + 22;

    // Box
    fill(...CHAMPAGNE);
    stroke(...AMBER);
    strokeWeight(2);
    rect(boxX, boxY, boxW, boxH, 8);

    // Header
    fill(...INDIGO);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(13);
    textStyle(BOLD);
    text('Organizational Consequence', boxX + padding, boxY + padding);
    textStyle(NORMAL);

    // Body
    fill(50);
    textSize(12);
    for (let li = 0; li < lines.length; li++) {
        text(lines[li], boxX + padding, boxY + padding + 22 + li * 18);
    }
}

function mousePressed() {
    let handleX = map(threshold, 0.2, 0.8, SLIDER_X_LEFT, sliderXRight);
    if (abs(mouseX - handleX) < 16 && abs(mouseY - SLIDER_Y) < 16) {
        sliderDragging = true;
    }
    // Also allow clicking on the track
    if (mouseX >= SLIDER_X_LEFT && mouseX <= sliderXRight &&
        abs(mouseY - SLIDER_Y) < 16) {
        sliderDragging = true;
        threshold = map(mouseX, SLIDER_X_LEFT, sliderXRight, 0.2, 0.8);
        threshold = constrain(threshold, 0.2, 0.8);
    }
}

function mouseDragged() {
    if (sliderDragging) {
        threshold = map(mouseX, SLIDER_X_LEFT, sliderXRight, 0.2, 0.8);
        threshold = constrain(threshold, 0.2, 0.8);
    }
}

function mouseReleased() {
    sliderDragging = false;
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    sliderXRight = canvasWidth - 100;
}
