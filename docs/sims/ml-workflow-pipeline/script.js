// ML Workflow Pipeline - p5.js MicroSim
// Six-stage ML pipeline with hover tooltips and click interaction

let canvasWidth = 900;
const canvasHeight = 520;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

let hoveredStage = -1;
let selectedStage = -1;

const stages = [
    {
        label: 'Define\nProblem',
        color: INDIGO,
        tooltip: 'Specify the prediction target. Example: predict which employees will leave within 6 months.',
        example: 'Example: HR identifies that voluntary turnover costs $50K per departure. The analytics team frames a binary classification problem: will each employee leave within the next 6 months?'
    },
    {
        label: 'Collect\nData',
        color: INDIGO,
        tooltip: 'Gather graph metrics, HR records, and event streams as training data.',
        example: 'Example: Pull centrality scores from the collaboration graph, tenure and salary from HRIS, meeting frequency from calendar events, and Slack sentiment from communication logs.',
        subLabels: ['Graph Metrics', 'HR Records', 'Event Streams']
    },
    {
        label: 'Engineer\nFeatures',
        color: AMBER,
        tooltip: 'Transform raw data into model inputs: centrality scores, tenure, sentiment trends.',
        example: 'Example: Compute 30-day rolling average sentiment, ratio of cross-team to within-team connections, months since last promotion, and PageRank delta over the past quarter.'
    },
    {
        label: 'Train\nModel',
        color: AMBER,
        tooltip: 'Feed labeled examples to an algorithm. Common choices: random forest, XGBoost, GNN.',
        example: 'Example: Train an XGBoost classifier on 3 years of labeled departure data. Use 80/20 train-test split with stratified sampling to handle class imbalance (only 12% actually left).'
    },
    {
        label: 'Evaluate',
        color: AMBER,
        tooltip: 'Test on held-out data. Check precision, recall, AUC, and fairness metrics.',
        example: 'Example: On the test set, the model achieves AUC 0.84, precision 0.71, recall 0.68. Fairness audit shows equal performance across demographic groups within 5% tolerance.'
    },
    {
        label: 'Deploy &\nMonitor',
        color: GOLD,
        tooltip: 'Score employees monthly. Retrain quarterly. Monitor for drift and bias.',
        example: 'Example: A monthly batch job scores all active employees. Dashboards alert when prediction drift exceeds 10%. The model retrains quarterly with fresh labeled data from exits.'
    }
];

let stageRects = []; // {x, y, w, h} for each stage
let resetBtn = { x: 0, y: 0, w: 80, h: 30 };

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');
    layoutStages();
}

function layoutStages() {
    stageRects = [];
    let stageW = 120;
    let stageH = 50;
    let totalPipelineW = 6 * stageW + 5 * 30; // 30px gaps
    let startX = (canvasWidth - totalPipelineW) / 2;
    let centerY = 160;

    for (let i = 0; i < 6; i++) {
        let x = startX + i * (stageW + 30);
        // Slight arc: ends higher, middle lower
        let arcOffset = -15 * cos(map(i, 0, 5, 0, PI));
        let y = centerY + arcOffset;
        stageRects.push({ x: x, y: y, w: stageW, h: stageH });
    }

    resetBtn.x = canvasWidth / 2 - 40;
    resetBtn.y = canvasHeight - 45;
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text('ML Workflow Pipeline', canvasWidth / 2, 22);
    textStyle(NORMAL);
    textSize(12);
    fill(100);
    text('Hover for details, click for organizational examples', canvasWidth / 2, 42);

    // Draw arrows between stages
    for (let i = 0; i < 5; i++) {
        let r1 = stageRects[i];
        let r2 = stageRects[i + 1];
        let fromX = r1.x + r1.w;
        let fromY = r1.y + r1.h / 2;
        let toX = r2.x;
        let toY = r2.y + r2.h / 2;
        drawArrow(fromX + 2, fromY, toX - 2, toY, [120, 120, 120]);
    }

    // Draw feedback arrow (stage 6 back to stage 2)
    drawFeedbackArrow();

    // Draw stages
    for (let i = 0; i < 6; i++) {
        let r = stageRects[i];
        let s = stages[i];
        let isHovered = (hoveredStage === i);
        let isSelected = (selectedStage === i);

        // Gold highlight
        if (isSelected) {
            noFill();
            stroke(...GOLD);
            strokeWeight(4);
            rect(r.x - 4, r.y - 4, r.w + 8, r.h + 8, 14);
        }

        // Shadow
        noStroke();
        fill(0, 0, 0, 25);
        rect(r.x + 3, r.y + 3, r.w, r.h, 10);

        // Stage box
        let col = s.color;
        if (isHovered) {
            fill(lerp(col[0], 255, 0.2), lerp(col[1], 255, 0.2), lerp(col[2], 255, 0.2));
        } else {
            fill(...col);
        }
        stroke(isSelected ? GOLD : [30, 30, 60]);
        strokeWeight(isSelected ? 3 : 1.5);
        rect(r.x, r.y, r.w, r.h, 10);

        // Label
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        textStyle(BOLD);
        let lines = s.label.split('\n');
        for (let li = 0; li < lines.length; li++) {
            let yOff = (li - (lines.length - 1) / 2) * 15;
            text(lines[li], r.x + r.w / 2, r.y + r.h / 2 + yOff);
        }
        textStyle(NORMAL);

        // Sub-labels for "Collect Data"
        if (s.subLabels) {
            textSize(9);
            fill(180, 200, 255);
            for (let si = 0; si < s.subLabels.length; si++) {
                text(s.subLabels[si], r.x + r.w / 2, r.y + r.h + 12 + si * 12);
            }
        }

        // Stage number
        fill(255, 255, 255, 140);
        textSize(9);
        textAlign(LEFT, TOP);
        text((i + 1), r.x + 7, r.y + 5);
    }

    // Draw tooltip card if hovering
    if (hoveredStage >= 0) {
        drawTooltipCard(hoveredStage);
    }

    // Draw selected example text
    if (selectedStage >= 0) {
        drawExampleText(selectedStage);
    }

    // Reset button
    drawResetButton();
}

function drawArrow(x1, y1, x2, y2, col) {
    stroke(...col);
    strokeWeight(2.5);
    line(x1, y1, x2, y2);

    // Arrowhead
    let angle = atan2(y2 - y1, x2 - x1);
    let sz = 10;
    fill(...col);
    noStroke();
    triangle(
        x2, y2,
        x2 - sz * cos(angle - PI / 6), y2 - sz * sin(angle - PI / 6),
        x2 - sz * cos(angle + PI / 6), y2 - sz * sin(angle + PI / 6)
    );
}

function drawFeedbackArrow() {
    let r6 = stageRects[5];
    let r2 = stageRects[1];

    let startX = r6.x + r6.w / 2;
    let startY = r6.y + r6.h;
    let endX = r2.x + r2.w / 2;
    let endY = r2.y + r2.h;

    let loopY = stageRects[0].y + stageRects[0].h + 70;

    stroke(120, 80, 80);
    strokeWeight(2);
    noFill();

    // Curved path: down from stage 6, across bottom, up to stage 2
    beginShape();
    vertex(startX, startY);
    bezierVertex(
        startX, loopY,
        endX, loopY,
        endX, endY + 5
    );
    endShape();

    // Arrowhead pointing up at stage 2
    fill(120, 80, 80);
    noStroke();
    let sz = 9;
    triangle(
        endX, endY + 2,
        endX - sz / 2, endY + 2 + sz,
        endX + sz / 2, endY + 2 + sz
    );

    // Label
    fill(120, 80, 80);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(11);
    textStyle(ITALIC);
    text('Retrain cycle', (startX + endX) / 2, loopY - 8);
    textStyle(NORMAL);
}

function drawTooltipCard(idx) {
    let r = stageRects[idx];
    let tipText = stages[idx].tooltip;

    textSize(12);
    let tw = 260;
    let padding = 12;
    // Wrap text manually
    let words = tipText.split(' ');
    let lines = [];
    let currentLine = '';
    for (let w of words) {
        let testLine = currentLine.length === 0 ? w : currentLine + ' ' + w;
        if (textWidth(testLine) > tw - padding * 2) {
            lines.push(currentLine);
            currentLine = w;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine.length > 0) lines.push(currentLine);

    let th = lines.length * 18 + padding * 2;
    let tx = r.x + r.w / 2 - tw / 2;
    let ty = r.y - th - 12;

    // Keep on screen
    if (tx < 5) tx = 5;
    if (tx + tw > canvasWidth - 5) tx = canvasWidth - tw - 5;
    if (ty < 5) ty = r.y + r.h + 10;

    // Card
    fill(255, 252, 240);
    stroke(180);
    strokeWeight(1);
    rect(tx, ty, tw, th, 8);

    // Pointer triangle
    fill(255, 252, 240);
    noStroke();
    let px = r.x + r.w / 2;
    if (ty < r.y) {
        // tooltip above: pointer at bottom
        triangle(px - 6, ty + th, px + 6, ty + th, px, ty + th + 8);
    } else {
        // tooltip below: pointer at top
        triangle(px - 6, ty, px + 6, ty, px, ty - 8);
    }

    // Text
    fill(50);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(12);
    for (let li = 0; li < lines.length; li++) {
        text(lines[li], tx + padding, ty + padding + li * 18);
    }
}

function drawExampleText(idx) {
    let exText = stages[idx].example;
    let boxY = 340;
    let boxW = canvasWidth - 40;
    let boxX = 20;

    textSize(12);
    let padding = 14;
    // Word wrap
    let words = exText.split(' ');
    let lines = [];
    let currentLine = '';
    for (let w of words) {
        let testLine = currentLine.length === 0 ? w : currentLine + ' ' + w;
        if (textWidth(testLine) > boxW - padding * 2) {
            lines.push(currentLine);
            currentLine = w;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine.length > 0) lines.push(currentLine);

    let boxH = lines.length * 18 + padding * 2 + 20;

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
    text('Stage ' + (idx + 1) + ': ' + stages[idx].label.replace('\n', ' '), boxX + padding, boxY + padding);
    textStyle(NORMAL);

    // Body
    fill(50);
    textSize(12);
    for (let li = 0; li < lines.length; li++) {
        text(lines[li], boxX + padding, boxY + padding + 22 + li * 18);
    }
}

function drawResetButton() {
    let isHover = mouseX > resetBtn.x && mouseX < resetBtn.x + resetBtn.w &&
                  mouseY > resetBtn.y && mouseY < resetBtn.y + resetBtn.h;

    fill(isHover ? [92, 107, 192] : INDIGO);
    stroke(30);
    strokeWeight(1);
    rect(resetBtn.x, resetBtn.y, resetBtn.w, resetBtn.h, 6);

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(13);
    text('Reset', resetBtn.x + resetBtn.w / 2, resetBtn.y + resetBtn.h / 2);
}

function mouseMoved() {
    hoveredStage = -1;
    for (let i = 0; i < 6; i++) {
        let r = stageRects[i];
        if (mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h) {
            hoveredStage = i;
            break;
        }
    }
}

function mousePressed() {
    // Check reset button
    if (mouseX > resetBtn.x && mouseX < resetBtn.x + resetBtn.w &&
        mouseY > resetBtn.y && mouseY < resetBtn.y + resetBtn.h) {
        selectedStage = -1;
        return;
    }

    // Check stage click
    for (let i = 0; i < 6; i++) {
        let r = stageRects[i];
        if (mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h) {
            selectedStage = (selectedStage === i) ? -1 : i;
            return;
        }
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    layoutStages();
}
