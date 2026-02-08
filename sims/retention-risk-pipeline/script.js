// Retention Risk Pipeline - p5.js MicroSim
// Left-to-right pipeline: input signals -> processing -> risk output categories

let canvasWidth = 900;
const canvasHeight = 500;

// Aria color scheme
const INDIGO = [48, 63, 159];
const INDIGO_LIGHT = [92, 107, 192];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// Pipeline state
let showContagion = true;
let selectedBox = null; // { type: 'input'|'process'|'output', index: number }
let particles = [];
let contagionBtn = { x: 0, y: 0, w: 140, h: 28 };
let resetBtn = { x: 0, y: 0, w: 80, h: 28 };

// Layout rectangles computed in layoutPipeline()
let inputRects = [];
let processRects = [];
let outputRects = [];

// Column x positions
let colInputX, colProcessX, colOutputX;
const boxW = 160;
const inputBoxH = 80;
const processBoxH = 46;
const outputBoxH = 50;

// ─── Data definitions ───

const inputs = [
    {
        label: 'Graph Metrics',
        color: INDIGO,
        subItems: ['Degree trend', 'Ego network density', 'Closeness drift', 'Betweenness change'],
        detail: 'Graph metrics capture structural changes in an employee\'s collaboration network. A declining degree trend means fewer connections over time. Shrinking ego network density indicates weakening team bonds. Closeness drift reveals increasing distance from information hubs, while betweenness change shows shifting roles as a bridge between groups.'
    },
    {
        label: 'NLP Signals',
        color: AMBER,
        subItems: ['Sentiment trend', 'Topic disengagement', 'Communication tone shift'],
        detail: 'Natural language processing extracts signals from emails, messages, and documents. Sentiment trend tracks emotional valence over time. Topic disengagement detects when employees stop participating in strategic discussions. Tone shift identifies movement from collaborative to transactional language patterns.'
    },
    {
        label: 'Behavioral Events',
        color: GOLD,
        subItems: ['Meeting declines', 'Login patterns', 'Reduced collaboration'],
        detail: 'Behavioral event streams from HR and IT systems capture observable changes: increasing meeting declines, irregular login patterns suggesting disengagement, and reduced collaboration activity such as fewer code reviews, document shares, or cross-team interactions.'
    }
];

const processes = [
    {
        label: 'Feature Engineering',
        detail: 'Transforms raw signals into model-ready features. Computes rolling averages (30/60/90-day windows), calculates rate-of-change derivatives, normalizes across departments, and creates interaction features like sentiment-times-centrality-drop that capture compound risk signals.'
    },
    {
        label: 'ML Prediction',
        detail: 'A gradient-boosted ensemble (XGBoost or LightGBM) trained on historical departure data. Uses SHAP values for explainability so HR can understand why each employee received their risk score. Retrained quarterly with fresh labeled data and monitored for prediction drift.'
    },
    {
        label: 'Contagion Overlay',
        detail: 'A graph neural network layer that propagates individual risk scores through the collaboration network. Detects when high-risk nodes cluster in tightly connected subgraphs, amplifying the team-level risk. Based on research showing turnover spreads through social proximity -- one departure can trigger a cascade.'
    }
];

const outputs = [
    {
        label: 'Low Risk',
        subtitle: 'Monitor quarterly',
        color: [56, 142, 60],   // green
        detail: 'Employees with stable or improving signals across all input streams. Recommended action: standard quarterly check-in with manager, continue professional development plans, and maintain current engagement patterns.'
    },
    {
        label: 'Watch',
        subtitle: 'Monthly check-in',
        color: [212, 136, 15],  // amber
        detail: 'Employees showing early warning signs in one or two input streams. Recommended action: monthly 1-on-1 with direct manager, review workload and career growth opportunities, consider stretch assignments or mentoring roles to re-engage.'
    },
    {
        label: 'High Risk',
        subtitle: 'Immediate intervention',
        color: [198, 40, 40],   // red
        detail: 'Employees with converging negative signals across multiple streams. Recommended action: immediate stay interview with HR partner, compensation and role review, executive sponsor engagement, and retention package consideration within 2 weeks.'
    },
    {
        label: 'Contagion Alert',
        subtitle: 'Team-level action',
        color: [123, 31, 162],  // purple
        detail: 'A connected subgroup where multiple members show elevated risk, suggesting a systemic or team-level issue. Recommended action: team health assessment, skip-level meetings, review of team leadership and dynamics, and organizational design intervention if structural issues are identified.'
    }
];

// ─── Layout ───

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');
    layoutPipeline();
}

function layoutPipeline() {
    let margin = 14;
    let colGap = (canvasWidth - margin * 2 - boxW * 3) / 2;
    colInputX = margin;
    colProcessX = margin + boxW + colGap;
    colOutputX = margin + (boxW + colGap) * 2;

    // Inputs: 3 boxes stacked, starting at y=50
    inputRects = [];
    let inputStartY = 48;
    let inputGap = 10;
    for (let i = 0; i < 3; i++) {
        let y = inputStartY + i * (inputBoxH + inputGap);
        inputRects.push({ x: colInputX, y: y, w: boxW, h: inputBoxH });
    }

    // Processing: stacked in center column
    processRects = [];
    let numProc = showContagion ? 3 : 2;
    let procTotalH = numProc * processBoxH + (numProc - 1) * 14;
    let procStartY = inputStartY + (3 * (inputBoxH + inputGap) - inputGap - procTotalH) / 2;
    for (let i = 0; i < numProc; i++) {
        let y = procStartY + i * (processBoxH + 14);
        processRects.push({ x: colProcessX, y: y, w: boxW, h: processBoxH });
    }

    // Outputs: stacked in right column
    outputRects = [];
    let numOut = showContagion ? 4 : 3;
    let outGap = 8;
    let outTotalH = numOut * outputBoxH + (numOut - 1) * outGap;
    let outStartY = inputStartY + (3 * (inputBoxH + inputGap) - inputGap - outTotalH) / 2;
    for (let i = 0; i < numOut; i++) {
        let y = outStartY + i * (outputBoxH + outGap);
        outputRects.push({ x: colOutputX, y: y, w: boxW, h: outputBoxH });
    }

    // Buttons at bottom
    contagionBtn.x = canvasWidth / 2 - contagionBtn.w - 10;
    contagionBtn.y = canvasHeight - 102;
    resetBtn.x = canvasWidth / 2 + 10;
    resetBtn.y = canvasHeight - 102;
}

// ─── Particle system ───

function spawnParticle() {
    // Pick a random input box as origin
    let srcIdx = floor(random(3));
    let srcRect = inputRects[srcIdx];
    let col;
    if (srcIdx === 0) col = INDIGO;
    else if (srcIdx === 1) col = AMBER;
    else col = GOLD;

    particles.push({
        x: srcRect.x + srcRect.w,
        y: srcRect.y + srcRect.h / 2 + random(-8, 8),
        phase: 0, // 0=input->proc1, 1=proc1->proc2, 2=proc2->proc3 or output, 3=proc3->output
        targetIdx: 0,
        color: col,
        speed: random(1.8, 3.2),
        outputIdx: -1
    });
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        let target;

        if (p.phase === 0) {
            // Moving toward first process box
            target = { x: processRects[0].x, y: processRects[0].y + processRects[0].h / 2 };
        } else if (p.phase === 1) {
            // Moving toward second process box
            target = { x: processRects[1].x, y: processRects[1].y + processRects[1].h / 2 };
        } else if (p.phase === 2) {
            if (showContagion && processRects.length > 2) {
                // Moving toward contagion overlay
                target = { x: processRects[2].x, y: processRects[2].y + processRects[2].h / 2 };
            } else {
                // Skip to output
                if (p.outputIdx < 0) p.outputIdx = floor(random(showContagion ? 4 : 3));
                let outR = outputRects[min(p.outputIdx, outputRects.length - 1)];
                target = { x: outR.x, y: outR.y + outR.h / 2 };
            }
        } else if (p.phase === 3) {
            // contagion -> output
            if (p.outputIdx < 0) p.outputIdx = floor(random(showContagion ? 4 : 3));
            let outR = outputRects[min(p.outputIdx, outputRects.length - 1)];
            target = { x: outR.x, y: outR.y + outR.h / 2 };
        } else {
            particles.splice(i, 1);
            continue;
        }

        let dx = target.x - p.x;
        let dy = target.y - p.y;
        let dist = sqrt(dx * dx + dy * dy);

        if (dist < p.speed + 2) {
            p.x = target.x;
            p.y = target.y;
            p.phase++;
            // When entering process boxes, come out the right side
            if (p.phase <= 3 && p.phase - 1 < processRects.length) {
                let pr = processRects[p.phase - 1];
                p.x = pr.x + pr.w;
                p.y = pr.y + pr.h / 2 + random(-4, 4);
            }
            // If skipping contagion, adjust phase numbering
            if (!showContagion && p.phase === 2) {
                // Was heading to output, now done entering output
            }
            if (p.phase > 3 || (p.phase === 3 && !showContagion)) {
                // Reached output
                particles.splice(i, 1);
            }
        } else {
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;
        }
    }
}

// ─── Drawing ───

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text('Retention Risk Pipeline', canvasWidth / 2, 20);
    textStyle(NORMAL);
    textSize(11);
    fill(100);
    text('Click any stage for details  |  Toggle contagion overlay on/off', canvasWidth / 2, 38);

    // Draw connecting arrows
    drawArrows();

    // Draw input boxes
    for (let i = 0; i < 3; i++) {
        drawInputBox(i);
    }

    // Draw process boxes
    let numProc = showContagion ? 3 : 2;
    for (let i = 0; i < numProc; i++) {
        drawProcessBox(i);
    }

    // Draw output boxes
    let numOut = showContagion ? 4 : 3;
    for (let i = 0; i < numOut; i++) {
        drawOutputBox(i);
    }

    // Particles
    if (frameCount % 12 === 0) spawnParticle();
    updateParticles();
    drawParticles();

    // Buttons
    drawContagionButton();
    drawResetButton();

    // Detail panel
    if (selectedBox) {
        drawDetailPanel();
    }
}

function drawArrows() {
    // Inputs -> first process
    let procR = processRects[0];
    for (let i = 0; i < 3; i++) {
        let ir = inputRects[i];
        let fromX = ir.x + ir.w;
        let fromY = ir.y + ir.h / 2;
        let toX = procR.x;
        let toY = procR.y + procR.h / 2;
        drawCurvedArrow(fromX, fromY, toX, toY, [150, 150, 160]);
    }

    // Process -> process
    let numProc = showContagion ? 3 : 2;
    for (let i = 0; i < numProc - 1; i++) {
        let r1 = processRects[i];
        let r2 = processRects[i + 1];
        drawStraightArrow(
            r1.x + r1.w / 2, r1.y + r1.h,
            r2.x + r2.w / 2, r2.y,
            [150, 150, 160]
        );
    }

    // Last process -> outputs
    let lastProc = processRects[numProc - 1];
    let numOut = showContagion ? 4 : 3;
    for (let i = 0; i < numOut; i++) {
        let or2 = outputRects[i];
        let fromX = lastProc.x + lastProc.w;
        let fromY = lastProc.y + lastProc.h / 2;
        let toX = or2.x;
        let toY = or2.y + or2.h / 2;
        drawCurvedArrow(fromX, fromY, toX, toY, [150, 150, 160]);
    }
}

function drawCurvedArrow(x1, y1, x2, y2, col) {
    stroke(...col);
    strokeWeight(1.8);
    noFill();
    let cx1 = x1 + (x2 - x1) * 0.5;
    let cx2 = x1 + (x2 - x1) * 0.5;
    bezier(x1, y1, cx1, y1, cx2, y2, x2, y2);

    // Arrowhead
    let t = 0.95;
    let ax = bezierPoint(x1, cx1, cx2, x2, t);
    let ay = bezierPoint(y1, y1, y2, y2, t);
    let angle = atan2(y2 - ay, x2 - ax);
    fill(...col);
    noStroke();
    let sz = 7;
    triangle(
        x2, y2,
        x2 - sz * cos(angle - PI / 6), y2 - sz * sin(angle - PI / 6),
        x2 - sz * cos(angle + PI / 6), y2 - sz * sin(angle + PI / 6)
    );
}

function drawStraightArrow(x1, y1, x2, y2, col) {
    stroke(...col);
    strokeWeight(1.8);
    line(x1, y1, x2, y2);
    let angle = atan2(y2 - y1, x2 - x1);
    fill(...col);
    noStroke();
    let sz = 7;
    triangle(
        x2, y2,
        x2 - sz * cos(angle - PI / 6), y2 - sz * sin(angle - PI / 6),
        x2 - sz * cos(angle + PI / 6), y2 - sz * sin(angle + PI / 6)
    );
}

function drawInputBox(i) {
    let r = inputRects[i];
    let inp = inputs[i];
    let isSelected = selectedBox && selectedBox.type === 'input' && selectedBox.index === i;
    let isHover = hitTest(r);

    // Selection highlight
    if (isSelected) {
        noFill();
        stroke(...GOLD);
        strokeWeight(3);
        rect(r.x - 3, r.y - 3, r.w + 6, r.h + 6, 12);
    }

    // Shadow
    noStroke();
    fill(0, 0, 0, 20);
    rect(r.x + 2, r.y + 2, r.w, r.h, 10);

    // Box
    let col = inp.color;
    if (isHover) {
        fill(lerp(col[0], 255, 0.15), lerp(col[1], 255, 0.15), lerp(col[2], 255, 0.15));
    } else {
        fill(...col);
    }
    stroke(30, 30, 60);
    strokeWeight(1.2);
    rect(r.x, r.y, r.w, r.h, 10);

    // Label
    fill(255);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(13);
    textStyle(BOLD);
    text(inp.label, r.x + r.w / 2, r.y + 8);
    textStyle(NORMAL);

    // Sub-items
    textSize(9);
    fill(220, 220, 240);
    textAlign(CENTER, TOP);
    for (let s = 0; s < inp.subItems.length; s++) {
        text(inp.subItems[s], r.x + r.w / 2, r.y + 27 + s * 13);
    }
}

function drawProcessBox(i) {
    let r = processRects[i];
    let proc = processes[i];
    let isSelected = selectedBox && selectedBox.type === 'process' && selectedBox.index === i;
    let isHover = hitTest(r);

    // Selection highlight
    if (isSelected) {
        noFill();
        stroke(...GOLD);
        strokeWeight(3);
        rect(r.x - 3, r.y - 3, r.w + 6, r.h + 6, 16);
    }

    // Shadow
    noStroke();
    fill(0, 0, 0, 20);
    rect(r.x + 2, r.y + 2, r.w, r.h, 14);

    // Box - all process boxes use indigo-light background
    let bgCol = INDIGO_LIGHT;
    if (i === 2) bgCol = [123, 31, 162]; // purple for contagion
    if (isHover) {
        fill(lerp(bgCol[0], 255, 0.15), lerp(bgCol[1], 255, 0.15), lerp(bgCol[2], 255, 0.15));
    } else {
        fill(...bgCol);
    }
    stroke(30, 30, 60);
    strokeWeight(1.2);
    rect(r.x, r.y, r.w, r.h, 14);

    // Label
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);
    textStyle(BOLD);
    text(proc.label, r.x + r.w / 2, r.y + r.h / 2);
    textStyle(NORMAL);
}

function drawOutputBox(i) {
    let r = outputRects[i];
    let out = outputs[i];
    let isSelected = selectedBox && selectedBox.type === 'output' && selectedBox.index === i;
    let isHover = hitTest(r);

    // Selection highlight
    if (isSelected) {
        noFill();
        stroke(...GOLD);
        strokeWeight(3);
        rect(r.x - 3, r.y - 3, r.w + 6, r.h + 6, 12);
    }

    // Shadow
    noStroke();
    fill(0, 0, 0, 20);
    rect(r.x + 2, r.y + 2, r.w, r.h, 10);

    // Box
    let col = out.color;
    if (isHover) {
        fill(lerp(col[0], 255, 0.15), lerp(col[1], 255, 0.15), lerp(col[2], 255, 0.15));
    } else {
        fill(...col);
    }
    stroke(30, 30, 60);
    strokeWeight(1.2);
    rect(r.x, r.y, r.w, r.h, 10);

    // Label
    fill(255);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(12);
    textStyle(BOLD);
    text(out.label, r.x + r.w / 2, r.y + 10);
    textStyle(NORMAL);
    textSize(9);
    fill(230, 230, 240);
    text(out.subtitle, r.x + r.w / 2, r.y + 28);
}

function drawParticles() {
    noStroke();
    for (let p of particles) {
        fill(p.color[0], p.color[1], p.color[2], 200);
        ellipse(p.x, p.y, 6, 6);
    }
}

function drawContagionButton() {
    let isHover = hitTest(contagionBtn);
    if (showContagion) {
        fill(isHover ? [140, 50, 180] : [123, 31, 162]);
    } else {
        fill(isHover ? [160, 160, 170] : [140, 140, 150]);
    }
    stroke(80);
    strokeWeight(1);
    rect(contagionBtn.x, contagionBtn.y, contagionBtn.w, contagionBtn.h, 6);

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(11);
    text(showContagion ? 'Contagion: ON' : 'Contagion: OFF',
        contagionBtn.x + contagionBtn.w / 2, contagionBtn.y + contagionBtn.h / 2);
}

function drawResetButton() {
    let isHover = hitTest(resetBtn);
    fill(isHover ? INDIGO_LIGHT : INDIGO);
    stroke(80);
    strokeWeight(1);
    rect(resetBtn.x, resetBtn.y, resetBtn.w, resetBtn.h, 6);

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(11);
    text('Reset', resetBtn.x + resetBtn.w / 2, resetBtn.y + resetBtn.h / 2);
}

function drawDetailPanel() {
    let panelY = canvasHeight - 68;
    let panelH = 60;
    let panelX = 14;
    let panelW = canvasWidth - 28;

    // Get the detail text and title
    let title = '';
    let detail = '';
    if (selectedBox.type === 'input') {
        let inp = inputs[selectedBox.index];
        title = inp.label;
        detail = inp.detail;
    } else if (selectedBox.type === 'process') {
        let proc = processes[selectedBox.index];
        title = proc.label;
        detail = proc.detail;
    } else if (selectedBox.type === 'output') {
        let out = outputs[selectedBox.index];
        title = out.label + ' - ' + out.subtitle;
        detail = out.detail;
    }

    // Background
    fill(...CHAMPAGNE);
    stroke(...AMBER);
    strokeWeight(1.5);
    rect(panelX, panelY, panelW, panelH, 8);

    // Title
    fill(...INDIGO);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(11);
    textStyle(BOLD);
    text(title, panelX + 10, panelY + 6);
    textStyle(NORMAL);

    // Detail text with word wrap
    fill(50);
    textSize(10);
    let words = detail.split(' ');
    let lines = [];
    let currentLine = '';
    let maxW = panelW - 20;
    for (let w of words) {
        let testLine = currentLine.length === 0 ? w : currentLine + ' ' + w;
        if (textWidth(testLine) > maxW) {
            lines.push(currentLine);
            currentLine = w;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine.length > 0) lines.push(currentLine);

    for (let li = 0; li < min(lines.length, 3); li++) {
        text(lines[li], panelX + 10, panelY + 22 + li * 13);
    }
}

// ─── Interaction ───

function hitTest(r) {
    return mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h;
}

function mousePressed() {
    // Contagion toggle
    if (hitTest(contagionBtn)) {
        showContagion = !showContagion;
        selectedBox = null;
        particles = [];
        layoutPipeline();
        return;
    }

    // Reset button
    if (hitTest(resetBtn)) {
        selectedBox = null;
        return;
    }

    // Check input boxes
    for (let i = 0; i < 3; i++) {
        if (hitTest(inputRects[i])) {
            if (selectedBox && selectedBox.type === 'input' && selectedBox.index === i) {
                selectedBox = null;
            } else {
                selectedBox = { type: 'input', index: i };
            }
            return;
        }
    }

    // Check process boxes
    let numProc = showContagion ? 3 : 2;
    for (let i = 0; i < numProc; i++) {
        if (hitTest(processRects[i])) {
            if (selectedBox && selectedBox.type === 'process' && selectedBox.index === i) {
                selectedBox = null;
            } else {
                selectedBox = { type: 'process', index: i };
            }
            return;
        }
    }

    // Check output boxes
    let numOut = showContagion ? 4 : 3;
    for (let i = 0; i < numOut; i++) {
        if (hitTest(outputRects[i])) {
            if (selectedBox && selectedBox.type === 'output' && selectedBox.index === i) {
                selectedBox = null;
            } else {
                selectedBox = { type: 'output', index: i };
            }
            return;
        }
    }

    // Click on empty space clears selection
    selectedBox = null;
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    layoutPipeline();
}
