// Summarization Pipeline MicroSim
// Three-column workflow: Raw Transcript -> Summarization -> Graph Output

let canvasWidth = 900;
const canvasHeight = 540;

const INDIGO = [48, 63, 159];
const INDIGO_LIGHT = [92, 107, 192];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

let mode = 'extractive'; // 'extractive' or 'abstractive'
let hoveredOutputIdx = -1;
let arrowPhase = 0;

// Transcript lines with speaker and key-sentence flag
const transcript = [
    { speaker: 'Sarah', text: "Let's review the Q3 roadmap priorities.", key: false, extractIdx: -1 },
    { speaker: 'Dev',   text: "The API redesign is critical \u2014 our partners are blocked.", key: true, extractIdx: 0 },
    { speaker: 'Maria', text: "What about the mobile app? It's been on the backlog.", key: false, extractIdx: -1 },
    { speaker: 'Sarah', text: "I think we need to prioritize the API. Mobile can wait.", key: true, extractIdx: 1 },
    { speaker: 'Dev',   text: "Agreed. I can draft the technical spec by next Friday.", key: true, extractIdx: 2 },
    { speaker: 'Maria', text: "OK. Let's set March 22 as the deadline for the spec.", key: false, extractIdx: -1 },
    { speaker: 'Sarah', text: "Good. I'll update the roadmap document today.", key: false, extractIdx: -1 },
    { speaker: 'Dev',   text: "Should we schedule a follow-up review?", key: false, extractIdx: -1 },
    { speaker: 'Sarah', text: "Yes, let's meet again on the 25th.", key: false, extractIdx: -1 }
];

// Extractive: indices of key sentences
const extractiveIdxs = [1, 3, 4];

// Abstractive summary
const abstractiveSummary = "The team decided to prioritize the API redesign over the mobile app. Dev will draft the technical spec with a March 22 deadline.";

// Graph output items with links to transcript lines
const graphOutput = [
    { label: 'summary', value: '"Discussed API redesign. Decided to prioritize over mobile."', srcLines: [1, 3] },
    { label: 'decisions', value: '["Prioritize API redesign"]', srcLines: [3] },
    { label: 'action_items', value: '[{owner: "Dev", task: "Draft spec", due: "Mar 22"}]', srcLines: [4, 5] },
    { label: 'topics', value: '["API", "roadmap", "timeline"]', srcLines: [0, 1, 5] }
];

// Column layout
let col1X, col1W, col2X, col2W, col3X, col3W;
const headerY = 10;
const contentTop = 50;
const colPad = 10;

// Buttons
let btnExtractiveX, btnAbstractiveX;
const btnY = 62;
const btnW = 95;
const btnH = 28;

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
    let gap = 8;
    col1X = colPad;
    col1W = (canvasWidth - colPad * 2 - gap * 2) * 0.30;
    col2X = col1X + col1W + gap;
    col2W = (canvasWidth - colPad * 2 - gap * 2) * 0.35;
    col3X = col2X + col2W + gap;
    col3W = (canvasWidth - colPad * 2 - gap * 2) * 0.35;

    btnExtractiveX = col2X + (col2W / 2 - btnW - 4);
    btnAbstractiveX = col2X + (col2W / 2 + 4);
}

function draw() {
    background(245);
    arrowPhase += 0.02;

    drawColumnBg(col1X, col1W, 'Raw Transcript', INDIGO);
    drawColumnBg(col2X, col2W, 'Summarization', INDIGO_LIGHT);
    drawColumnBg(col3X, col3W, 'Graph Output', [180, 140, 20]);

    drawTranscript();
    drawButtons();
    drawSummarization();
    drawGraphOutput();
    drawArrows();
}

function drawColumnBg(x, w, title, titleColor) {
    // Column background
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(x, contentTop - 14, w, canvasHeight - contentTop - 2, 8);

    // Header
    fill(...titleColor);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
    textStyle(BOLD);
    text(title, x + w / 2, headerY + 16);
    textStyle(NORMAL);
}

function drawTranscript() {
    let x = col1X + 8;
    let y = contentTop + 8;
    let maxW = col1W - 16;
    let lineH = 48;

    textAlign(LEFT, TOP);
    textSize(11);

    for (let i = 0; i < transcript.length; i++) {
        let t = transcript[i];
        let isHighlighted = false;

        // Highlight if hovered output references this line
        if (hoveredOutputIdx >= 0) {
            isHighlighted = graphOutput[hoveredOutputIdx].srcLines.includes(i);
        }
        // Highlight key sentences in extractive mode
        if (mode === 'extractive' && t.key) {
            isHighlighted = true;
        }

        if (isHighlighted) {
            fill(...AMBER, 50);
            noStroke();
            rect(x - 3, y - 2, maxW + 6, lineH - 4, 4);
        }

        // Speaker name
        fill(...INDIGO);
        textStyle(BOLD);
        textSize(10);
        text(t.speaker + ':', x, y);
        textStyle(NORMAL);

        // Message text
        fill(isHighlighted ? [...AMBER] : [60]);
        textSize(10);
        text(t.text, x, y + 14, maxW, lineH - 16);

        y += lineH;
    }
}

function drawButtons() {
    // Extractive button
    let exHover = mouseX > btnExtractiveX && mouseX < btnExtractiveX + btnW && mouseY > btnY && mouseY < btnY + btnH;
    fill(mode === 'extractive' ? INDIGO : (exHover ? INDIGO_LIGHT : [180]));
    noStroke();
    rect(btnExtractiveX, btnY, btnW, btnH, 6);
    fill(mode === 'extractive' ? 255 : 50);
    textAlign(CENTER, CENTER);
    textSize(11);
    text('Extractive', btnExtractiveX + btnW / 2, btnY + btnH / 2);

    // Abstractive button
    let abHover = mouseX > btnAbstractiveX && mouseX < btnAbstractiveX + btnW && mouseY > btnY && mouseY < btnY + btnH;
    fill(mode === 'abstractive' ? INDIGO : (abHover ? INDIGO_LIGHT : [180]));
    noStroke();
    rect(btnAbstractiveX, btnY, btnW, btnH, 6);
    fill(mode === 'abstractive' ? 255 : 50);
    textAlign(CENTER, CENTER);
    textSize(11);
    text('Abstractive', btnAbstractiveX + btnW / 2, btnY + btnH / 2);
}

function drawSummarization() {
    let x = col2X + 12;
    let y = contentTop + 16;
    let maxW = col2W - 24;

    if (mode === 'extractive') {
        // Mode label
        fill(...INDIGO);
        textAlign(LEFT, TOP);
        textSize(11);
        textStyle(BOLD);
        text('Key Sentences Extracted:', x, y);
        textStyle(NORMAL);
        y += 20;

        for (let i = 0; i < extractiveIdxs.length; i++) {
            let t = transcript[extractiveIdxs[i]];

            // Highlighted background
            fill(...AMBER, 40);
            noStroke();
            rect(x - 4, y - 2, maxW + 8, 56, 4);

            // Bullet number
            fill(...INDIGO);
            textSize(12);
            textStyle(BOLD);
            text((i + 1) + '.', x, y + 2);
            textStyle(NORMAL);

            // Speaker
            fill(...AMBER);
            textSize(10);
            textStyle(BOLD);
            text(t.speaker + ':', x + 16, y + 2);
            textStyle(NORMAL);

            // Text
            fill(50);
            textSize(10);
            text(t.text, x + 16, y + 16, maxW - 20, 38);

            y += 64;
        }

        // Explanation
        y += 8;
        fill(120);
        textSize(9);
        textStyle(ITALIC);
        text('Extractive summarization selects the most important sentences verbatim from the source text.', x, y, maxW, 40);
        textStyle(NORMAL);

    } else {
        // Abstractive mode
        fill(...INDIGO);
        textAlign(LEFT, TOP);
        textSize(11);
        textStyle(BOLD);
        text('Generated Summary:', x, y);
        textStyle(NORMAL);
        y += 20;

        // Summary box
        fill(...CHAMPAGNE);
        stroke(...AMBER);
        strokeWeight(1.5);
        rect(x - 4, y - 4, maxW + 8, 80, 6);

        fill(40);
        noStroke();
        textSize(11);
        text(abstractiveSummary, x + 4, y + 4, maxW, 70);

        y += 96;

        // Key differences box
        fill(240, 240, 255);
        stroke(...INDIGO_LIGHT);
        strokeWeight(1);
        rect(x - 4, y, maxW + 8, 120, 6);

        fill(...INDIGO);
        textSize(10);
        textStyle(BOLD);
        text('How It Differs:', x + 4, y + 8);
        textStyle(NORMAL);

        fill(60);
        textSize(9);
        let diffY = y + 24;
        let diffs = [
            '\u2022 Generates new sentences (not direct quotes)',
            '\u2022 Condenses multiple turns into compact text',
            '\u2022 May capture implied meaning',
            '\u2022 Requires language generation model'
        ];
        for (let d of diffs) {
            text(d, x + 4, diffY, maxW - 4, 20);
            diffY += 18;
        }

        // Explanation
        diffY += 14;
        fill(120);
        textSize(9);
        textStyle(ITALIC);
        text('Abstractive summarization generates new text that captures the core meaning in fewer words.', x, diffY, maxW, 40);
        textStyle(NORMAL);
    }
}

function drawGraphOutput() {
    let x = col3X + 10;
    let y = contentTop + 12;
    let maxW = col3W - 20;

    // Title
    fill(100, 80, 10);
    textAlign(LEFT, TOP);
    textSize(10);
    textStyle(BOLD);
    text('Structured Properties:', x, y);
    textStyle(NORMAL);
    y += 18;

    hoveredOutputIdx = -1;

    for (let i = 0; i < graphOutput.length; i++) {
        let item = graphOutput[i];
        let boxH = 90;
        if (i === 2) boxH = 100; // action_items needs more space

        let isHover = mouseX > x - 4 && mouseX < x + maxW + 4 && mouseY > y - 2 && mouseY < y + boxH;
        if (isHover) hoveredOutputIdx = i;

        // Background
        fill(isHover ? [255, 248, 220] : [250, 250, 255]);
        stroke(isHover ? AMBER : [200]);
        strokeWeight(isHover ? 2 : 1);
        rect(x - 4, y - 2, maxW + 8, boxH, 5);

        // Property name
        fill(...(isHover ? AMBER : INDIGO));
        noStroke();
        textSize(11);
        textStyle(BOLD);
        text(item.label + ':', x, y + 4);
        textStyle(NORMAL);

        // Value
        fill(isHover ? [140, 90, 0] : [60]);
        textSize(9);
        text(item.value, x + 4, y + 20, maxW - 8, boxH - 26);

        y += boxH + 8;
    }
}

function drawArrows() {
    // Arrow from col1 to col2
    let aX1 = col1X + col1W;
    let aX2 = col2X;
    let aY = canvasHeight / 2 - 20;
    drawFlowArrow(aX1, aY, aX2, aY);

    // Arrow from col2 to col3
    let bX1 = col2X + col2W;
    let bX2 = col3X;
    let bY = canvasHeight / 2 - 20;
    drawFlowArrow(bX1, bY, bX2, bY);
}

function drawFlowArrow(x1, y1, x2, y2) {
    let midX = (x1 + x2) / 2;

    // Animated dots along the arrow
    stroke(...AMBER);
    strokeWeight(2);
    noFill();
    line(x1 + 2, y1, x2 - 8, y2);

    // Arrowhead
    fill(...AMBER);
    noStroke();
    triangle(x2 - 4, y2, x2 - 12, y2 - 5, x2 - 12, y2 + 5);

    // Animated dot
    let t = (sin(arrowPhase * 3) + 1) / 2;
    let dotX = lerp(x1 + 4, x2 - 12, t);
    fill(...GOLD);
    noStroke();
    ellipse(dotX, y1, 6, 6);
}

function mousePressed() {
    // Check extractive button
    if (mouseX > btnExtractiveX && mouseX < btnExtractiveX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
        mode = 'extractive';
        return;
    }
    // Check abstractive button
    if (mouseX > btnAbstractiveX && mouseX < btnAbstractiveX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
        mode = 'abstractive';
        return;
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    computeLayout();
}
