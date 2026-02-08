// NLP Enrichment Pipeline - p5.js MicroSim
// Shows how raw text flows through NLP stages to produce graph properties

let canvasWidth = 900;
const canvasHeight = 500;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// Pipeline stages
const stages = [
    {
        label: 'Raw Text',
        color: [200, 200, 200],
        icon: 'email',
        detail: 'Unstructured text from organizational communications: emails, Slack messages, meeting transcripts, and support tickets. This raw data contains valuable signals but cannot be queried or analyzed directly.'
    },
    {
        label: 'Tokenization',
        color: [48, 63, 159],
        icon: 'tokens',
        detail: 'Text is split into individual tokens (words and punctuation). Stop words like "the" and "a" may be removed. Each token becomes a unit for downstream analysis. The sample produces 8 meaningful tokens.'
    },
    {
        label: 'NLP Analysis',
        color: [212, 136, 15],
        icon: 'branches',
        detail: 'Four parallel NLP models process the tokens simultaneously: Named Entity Recognition (NER) identifies organizations and people, Sentiment Analysis scores emotional tone, Topic Modeling classifies the subject, and Emotion Detection identifies urgency or concern.'
    },
    {
        label: 'Structured Output',
        color: [176, 109, 11],
        icon: 'json',
        detail: 'NLP results are assembled into a structured record with typed fields: entities with labels, numeric sentiment scores, topic categories, and emotion tags. This structured format is ready for database ingestion.'
    },
    {
        label: 'Graph Properties',
        color: [255, 215, 0],
        icon: 'graph',
        detail: 'Structured fields become properties on graph nodes and edges. The email becomes an Event node; "Acme Corp" links to an Organization node; sentiment and topic become edge properties connecting the sender to the event.'
    }
];

// Sample data for animation
const sampleText = '"Urgent: Acme Corp contract renewal — need legal review"';
const tokens = ['Urgent', 'Acme', 'Corp', 'contract', 'renewal', 'need', 'legal', 'review'];
const nlpResults = {
    ner: 'Acme Corp → ORG',
    sentiment: '-0.2 (urgency)',
    topic: 'Contract Mgmt',
    emotion: 'Urgency'
};

let selectedStage = -1;
let animating = false;
let animStage = -1;
let animProgress = 0;
let animSpeed = 0.012;

// Button
let animBtn = { x: 0, y: 0, w: 100, h: 30 };

// Stage layout positions (computed in setup)
let stageBoxes = [];
const PIPELINE_Y = 120;
const BOX_H = 70;
const BOX_W = 130;
const DETAIL_Y = 290;

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
    stageBoxes = [];
    let totalW = stages.length * BOX_W + (stages.length - 1) * 40;
    let startX = (canvasWidth - totalW) / 2;
    for (let i = 0; i < stages.length; i++) {
        stageBoxes.push({
            x: startX + i * (BOX_W + 40),
            y: PIPELINE_Y,
            w: BOX_W,
            h: BOX_H
        });
    }
    animBtn.x = canvasWidth / 2 - 50;
    animBtn.y = 50;
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text('NLP Enrichment Pipeline', canvasWidth / 2, 22);

    // Animate button
    drawAnimateButton();

    // Draw arrows between stages
    for (let i = 0; i < stageBoxes.length - 1; i++) {
        let b1 = stageBoxes[i];
        let b2 = stageBoxes[i + 1];
        let ax1 = b1.x + b1.w + 4;
        let ax2 = b2.x - 4;
        let ay = PIPELINE_Y + BOX_H / 2;
        stroke(150);
        strokeWeight(2);
        line(ax1, ay, ax2 - 8, ay);
        // Arrowhead
        fill(150);
        noStroke();
        triangle(ax2, ay, ax2 - 10, ay - 5, ax2 - 10, ay + 5);
    }

    // Draw stage boxes
    for (let i = 0; i < stages.length; i++) {
        drawStageBox(i);
    }

    // Draw NLP Analysis sub-branches if stage 2 is visible
    drawNLPBranches();

    // Animated data flow
    if (animating) {
        drawAnimatedFlow();
        animProgress += animSpeed;
        if (animProgress >= 1.0) {
            animProgress = 0;
            animStage++;
            if (animStage >= stages.length) {
                animating = false;
                animStage = -1;
            }
        }
    }

    // Detail panel
    if (selectedStage >= 0) {
        drawDetailPanel(selectedStage);
    } else {
        // Hint text
        fill(140);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        text('Click any stage to see details, or click "Animate" to watch data flow through the pipeline', canvasWidth / 2, DETAIL_Y + 40);
    }
}

function drawAnimateButton() {
    let hovering = mouseX > animBtn.x && mouseX < animBtn.x + animBtn.w &&
                   mouseY > animBtn.y && mouseY < animBtn.y + animBtn.h;
    fill(animating ? [120] : (hovering ? [92, 107, 192] : INDIGO));
    noStroke();
    rect(animBtn.x, animBtn.y, animBtn.w, animBtn.h, 6);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(13);
    text(animating ? 'Running...' : 'Animate', animBtn.x + animBtn.w / 2, animBtn.y + animBtn.h / 2);
}

function drawStageBox(i) {
    let b = stageBoxes[i];
    let s = stages[i];
    let isSelected = (selectedStage === i);
    let isAnimActive = (animating && animStage === i);
    let hovering = mouseX > b.x && mouseX < b.x + b.w &&
                   mouseY > b.y && mouseY < b.y + b.h;

    // Glow for animated stage
    if (isAnimActive) {
        noFill();
        stroke(...GOLD, 150);
        strokeWeight(4);
        rect(b.x - 4, b.y - 4, b.w + 8, b.h + 8, 14);
    }

    // Box
    if (isSelected) {
        stroke(...GOLD);
        strokeWeight(3);
    } else if (hovering) {
        stroke(100);
        strokeWeight(2);
    } else {
        stroke(180);
        strokeWeight(1);
    }
    fill(...s.color, isSelected ? 255 : (hovering ? 240 : 220));
    rect(b.x, b.y, b.w, b.h, 10);

    // Icon area
    let iconY = b.y + 18;
    drawStageIcon(s.icon, b.x + b.w / 2, iconY, s.color);

    // Label
    let textCol = (s.color[0] + s.color[1] + s.color[2]) / 3 > 170 ? 40 : 255;
    fill(textCol);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(11);
    text(s.label, b.x + b.w / 2, b.y + b.h - 14);
}

function drawStageIcon(icon, cx, cy, col) {
    let textCol = (col[0] + col[1] + col[2]) / 3 > 170 ? 60 : 230;
    fill(textCol);
    noStroke();
    textAlign(CENTER, CENTER);

    if (icon === 'email') {
        textSize(20);
        text('\u2709', cx, cy);
    } else if (icon === 'tokens') {
        textSize(9);
        text('[ a ] [ b ]', cx, cy);
    } else if (icon === 'branches') {
        textSize(9);
        text('NER | Sent', cx, cy - 4);
        text('Top | Emot', cx, cy + 8);
    } else if (icon === 'json') {
        textSize(9);
        text('{ key: val }', cx, cy);
    } else if (icon === 'graph') {
        // Mini node-edge diagram
        let r = 5;
        fill(textCol);
        ellipse(cx - 12, cy - 4, r * 2);
        ellipse(cx + 12, cy - 4, r * 2);
        ellipse(cx, cy + 8, r * 2);
        stroke(textCol);
        strokeWeight(1);
        line(cx - 12, cy - 4, cx + 12, cy - 4);
        line(cx - 12, cy - 4, cx, cy + 8);
        line(cx + 12, cy - 4, cx, cy + 8);
    }
}

function drawNLPBranches() {
    let b = stageBoxes[2]; // NLP Analysis stage
    let branches = ['NER', 'Sentiment', 'Topics', 'Emotion'];
    let branchY = b.y + b.h + 12;
    let branchH = 22;
    let branchW = 80;
    let totalW = branches.length * branchW + (branches.length - 1) * 6;
    let startX = b.x + b.w / 2 - totalW / 2;

    for (let i = 0; i < branches.length; i++) {
        let bx = startX + i * (branchW + 6);

        // Connecting line from stage box
        stroke(180);
        strokeWeight(1);
        line(b.x + b.w / 2, b.y + b.h, bx + branchW / 2, branchY);

        // Branch box
        let isAnimActive = animating && animStage === 2;
        fill(isAnimActive ? [...AMBER, 240] : [...AMBER, 160]);
        stroke(180);
        strokeWeight(1);
        rect(bx, branchY, branchW, branchH, 4);

        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        text(branches[i], bx + branchW / 2, branchY + branchH / 2);
    }
}

function drawAnimatedFlow() {
    if (animStage < 0 || animStage >= stages.length) return;

    let b = stageBoxes[animStage];

    // Show relevant data for current stage
    let dataY = b.y - 38;
    fill(50);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(10);

    if (animStage === 0) {
        // Show raw text
        fill(...CHAMPAGNE);
        stroke(180);
        strokeWeight(1);
        let tw = textWidth(sampleText) + 16;
        rect(b.x + b.w / 2 - tw / 2, dataY - 10, tw, 20, 4);
        fill(60);
        noStroke();
        text(sampleText, b.x + b.w / 2, dataY);
    } else if (animStage === 1) {
        // Show tokens
        let tokenStr = tokens.slice(0, floor(animProgress * tokens.length) + 1).join(' | ');
        fill(...CHAMPAGNE);
        stroke(180);
        strokeWeight(1);
        let tw = min(textWidth(tokenStr) + 16, b.w + 60);
        rect(b.x + b.w / 2 - tw / 2, dataY - 10, tw, 20, 4);
        fill(...INDIGO);
        noStroke();
        textSize(9);
        text(tokenStr, b.x + b.w / 2, dataY);
    } else if (animStage === 2) {
        // Show NLP results appearing
        let results = [nlpResults.ner, nlpResults.sentiment, nlpResults.topic, nlpResults.emotion];
        let shown = floor(animProgress * 4) + 1;
        for (let i = 0; i < min(shown, 4); i++) {
            fill(...CHAMPAGNE);
            stroke(180);
            strokeWeight(1);
            let branchB = stageBoxes[2];
            let branches = 4;
            let branchW = 80;
            let totalBW = branches * branchW + (branches - 1) * 6;
            let startBX = branchB.x + branchB.w / 2 - totalBW / 2;
            let bx = startBX + i * (branchW + 6);
            let by = branchB.y + branchB.h + 12 + 22 + 6;
            rect(bx, by, branchW, 18, 3);
            fill(60);
            noStroke();
            textSize(8);
            text(results[i], bx + branchW / 2, by + 9);
        }
    } else if (animStage === 3) {
        // Show JSON-like output
        let jsonLines = [
            '{ entity: "Acme Corp"',
            '  sentiment: -0.2',
            '  topic: "Contract"',
            '  emotion: "Urgency" }'
        ];
        let shown = floor(animProgress * 4) + 1;
        for (let i = 0; i < min(shown, 4); i++) {
            fill(60);
            noStroke();
            textSize(9);
            textAlign(LEFT, CENTER);
            text(jsonLines[i], b.x - 10, dataY - 16 + i * 13);
        }
        textAlign(CENTER, CENTER);
    } else if (animStage === 4) {
        // Show graph snippet
        let gx = b.x + b.w / 2;
        let gy = dataY - 4;
        // Nodes
        fill(...INDIGO);
        noStroke();
        ellipse(gx - 30, gy, 16);
        ellipse(gx + 30, gy, 16);
        // Edge
        stroke(...AMBER);
        strokeWeight(2);
        line(gx - 22, gy, gx + 22, gy);
        // Labels
        fill(255);
        noStroke();
        textSize(7);
        text('Sender', gx - 30, gy);
        text('Event', gx + 30, gy);
        // Property
        fill(100);
        textSize(8);
        text('sent: -0.2', gx, gy - 14);
    }
}

function drawDetailPanel(idx) {
    let s = stages[idx];
    let panelX = 30;
    let panelW = canvasWidth - 60;
    let panelH = 160;

    // Panel background
    fill(...CHAMPAGNE);
    stroke(...s.color);
    strokeWeight(2);
    rect(panelX, DETAIL_Y, panelW, panelH, 8);

    // Stage name
    fill(...s.color);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(14);
    textStyle(BOLD);
    text('Stage ' + (idx + 1) + ': ' + s.label, panelX + 16, DETAIL_Y + 12);
    textStyle(NORMAL);

    // Detail text wrapped
    fill(60);
    textSize(12);
    textAlign(LEFT, TOP);
    let maxW = panelW - 32;
    text(s.detail, panelX + 16, DETAIL_Y + 36, maxW, panelH - 50);

    // Close hint
    fill(150);
    textSize(10);
    textAlign(RIGHT, BOTTOM);
    text('Click stage again to close', panelX + panelW - 16, DETAIL_Y + panelH - 8);
}

function mousePressed() {
    // Animate button
    if (mouseX > animBtn.x && mouseX < animBtn.x + animBtn.w &&
        mouseY > animBtn.y && mouseY < animBtn.y + animBtn.h) {
        if (!animating) {
            animating = true;
            animStage = 0;
            animProgress = 0;
            selectedStage = -1;
        }
        return;
    }

    // Stage boxes
    for (let i = 0; i < stageBoxes.length; i++) {
        let b = stageBoxes[i];
        if (mouseX > b.x && mouseX < b.x + b.w &&
            mouseY > b.y && mouseY < b.y + b.h) {
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
