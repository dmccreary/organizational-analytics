// Sentiment Analysis Demo - p5.js MicroSim
// Interactive sentiment analysis with gauge, token-level view, and sample messages

let canvasWidth = 900;
const canvasHeight = 520;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// Sample messages with precomputed sentiment
const messages = [
    {
        text: 'Excited about the new product direction!',
        score: 0.85,
        tokens: [
            { word: 'Excited', score: 0.9 },
            { word: 'about', score: 0 },
            { word: 'the', score: 0 },
            { word: 'new', score: 0.2 },
            { word: 'product', score: 0 },
            { word: 'direction!', score: 0.3 }
        ]
    },
    {
        text: 'The deadline has been moved up again.',
        score: -0.40,
        tokens: [
            { word: 'The', score: 0 },
            { word: 'deadline', score: -0.3 },
            { word: 'has', score: 0 },
            { word: 'been', score: 0 },
            { word: 'moved up', score: -0.4 },
            { word: 'again.', score: -0.3 }
        ]
    },
    {
        text: 'Meeting scheduled for 3pm in Room 201.',
        score: 0.05,
        tokens: [
            { word: 'Meeting', score: 0 },
            { word: 'scheduled', score: 0.05 },
            { word: 'for', score: 0 },
            { word: '3pm', score: 0 },
            { word: 'in', score: 0 },
            { word: 'Room 201.', score: 0 }
        ]
    },
    {
        text: 'Deeply frustrated by the lack of communication.',
        score: -0.80,
        tokens: [
            { word: 'Deeply', score: -0.1 },
            { word: 'frustrated', score: -0.9 },
            { word: 'by', score: 0 },
            { word: 'the', score: 0 },
            { word: 'lack', score: -0.6 },
            { word: 'of', score: 0 },
            { word: 'communication.', score: 0 }
        ]
    },
    {
        text: 'Thanks for the quick turnaround — appreciate it.',
        score: 0.75,
        tokens: [
            { word: 'Thanks', score: 0.7 },
            { word: 'for', score: 0 },
            { word: 'the', score: 0 },
            { word: 'quick', score: 0.3 },
            { word: 'turnaround', score: 0.2 },
            { word: '\u2014', score: 0 },
            { word: 'appreciate', score: 0.8 },
            { word: 'it.', score: 0 }
        ]
    },
    {
        text: 'We need a serious conversation about resources.',
        score: -0.35,
        tokens: [
            { word: 'We', score: 0 },
            { word: 'need', score: -0.1 },
            { word: 'a', score: 0 },
            { word: 'serious', score: -0.3 },
            { word: 'conversation', score: 0 },
            { word: 'about', score: 0 },
            { word: 'resources.', score: -0.1 }
        ]
    }
];

let selectedMsg = 0;
let displayScore = 0; // for lerp animation
let scoredMode = false; // false = Simple, true = Scored

// Layout constants
const MSG_TOP = 50;
const MSG_BTN_H = 42;
const MSG_BTN_GAP = 8;
const GAUGE_Y = 210;
const GAUGE_H = 60;
const TOKEN_Y = 340;
const TOGGLE_Y = 295;

// Button layout
let msgButtons = [];
let toggleBtn = { x: 0, y: TOGGLE_Y, w: 100, h: 28 };

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');
    layoutButtons();
    displayScore = messages[0].score;
}

function layoutButtons() {
    msgButtons = [];
    let cols = 3;
    let rows = 2;
    let padding = 20;
    let btnW = (canvasWidth - padding * 2 - (cols - 1) * MSG_BTN_GAP) / cols;

    for (let i = 0; i < messages.length; i++) {
        let col = i % cols;
        let row = floor(i / cols);
        msgButtons.push({
            x: padding + col * (btnW + MSG_BTN_GAP),
            y: MSG_TOP + row * (MSG_BTN_H + MSG_BTN_GAP),
            w: btnW,
            h: MSG_BTN_H,
            idx: i
        });
    }

    toggleBtn.x = canvasWidth / 2 - 50;
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text('Sentiment Analysis Demo', canvasWidth / 2, 24);

    // Message buttons
    drawMessageButtons();

    // Animate score
    let targetScore = messages[selectedMsg].score;
    displayScore = lerp(displayScore, targetScore, 0.08);

    // Gauge
    drawGauge();

    // Toggle button
    drawToggle();

    // Token view
    drawTokenView();
}

function drawMessageButtons() {
    for (let b of msgButtons) {
        let isSelected = (b.idx === selectedMsg);
        let hovering = mouseX > b.x && mouseX < b.x + b.w &&
                       mouseY > b.y && mouseY < b.y + b.h;

        if (isSelected) {
            fill(...INDIGO);
            stroke(...GOLD);
            strokeWeight(2);
        } else if (hovering) {
            fill(92, 107, 192);
            stroke(120);
            strokeWeight(1);
        } else {
            fill(255);
            stroke(180);
            strokeWeight(1);
        }
        rect(b.x, b.y, b.w, b.h, 6);

        // Truncated message text
        fill(isSelected ? 255 : 50);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(11);
        let msg = messages[b.idx].text;
        // Truncate if too long
        let maxChars = floor(b.w / 6.5);
        if (msg.length > maxChars) msg = msg.substring(0, maxChars - 2) + '...';
        text(msg, b.x + b.w / 2, b.y + b.h / 2);

        // Message number badge
        fill(isSelected ? [...GOLD] : [180]);
        noStroke();
        textSize(9);
        textAlign(LEFT, TOP);
        text('#' + (b.idx + 1), b.x + 6, b.y + 4);
    }
}

function drawGauge() {
    let gaugeX = 60;
    let gaugeW = canvasWidth - 120;
    let gaugeTop = GAUGE_Y;
    let barH = 24;

    // Label
    fill(60);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(13);
    text('Sentiment Score', canvasWidth / 2, gaugeTop - 16);

    // Gauge background - gradient from red through gray to green
    for (let x = 0; x < gaugeW; x++) {
        let t = x / gaugeW; // 0 to 1
        let r, g, b;
        if (t < 0.5) {
            // Red to gray
            let lt = t / 0.5;
            r = lerp(200, 180, lt);
            g = lerp(60, 180, lt);
            b = lerp(60, 180, lt);
        } else {
            // Gray to green
            let lt = (t - 0.5) / 0.5;
            r = lerp(180, 60, lt);
            g = lerp(180, 180, lt);
            b = lerp(180, 60, lt);
        }
        stroke(r, g, b);
        strokeWeight(1);
        line(gaugeX + x, gaugeTop, gaugeX + x, gaugeTop + barH);
    }

    // Border
    noFill();
    stroke(120);
    strokeWeight(1);
    rect(gaugeX, gaugeTop, gaugeW, barH, 4);

    // Tick marks and labels
    fill(80);
    noStroke();
    textSize(10);
    textAlign(CENTER, TOP);
    for (let v = -1.0; v <= 1.0; v += 0.5) {
        let px = gaugeX + ((v + 1) / 2) * gaugeW;
        stroke(80);
        strokeWeight(1);
        line(px, gaugeTop + barH, px, gaugeTop + barH + 6);
        noStroke();
        text(nf(v, 1, 1), px, gaugeTop + barH + 8);
    }

    // Pointer triangle
    let pointerX = gaugeX + ((displayScore + 1) / 2) * gaugeW;
    let pointerY = gaugeTop - 2;
    fill(30);
    noStroke();
    triangle(pointerX, pointerY + 4, pointerX - 7, pointerY - 8, pointerX + 7, pointerY - 8);

    // Score or label text above pointer
    textAlign(CENTER, BOTTOM);
    textSize(14);
    textStyle(BOLD);
    if (scoredMode) {
        fill(30);
        text(nf(displayScore, 1, 2), pointerX, pointerY - 10);
    } else {
        let label, labelCol;
        if (displayScore > 0.2) {
            label = 'Positive';
            labelCol = [60, 150, 60];
        } else if (displayScore < -0.2) {
            label = 'Negative';
            labelCol = [180, 60, 60];
        } else {
            label = 'Neutral';
            labelCol = [120, 120, 120];
        }
        fill(...labelCol);
        text(label, pointerX, pointerY - 10);
    }
    textStyle(NORMAL);
}

function drawToggle() {
    let hovering = mouseX > toggleBtn.x && mouseX < toggleBtn.x + toggleBtn.w &&
                   mouseY > toggleBtn.y && mouseY < toggleBtn.y + toggleBtn.h;

    fill(hovering ? [92, 107, 192] : INDIGO);
    noStroke();
    rect(toggleBtn.x, toggleBtn.y, toggleBtn.w, toggleBtn.h, 6);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(scoredMode ? 'Scored' : 'Simple', toggleBtn.x + toggleBtn.w / 2, toggleBtn.y + toggleBtn.h / 2);
}

function drawTokenView() {
    let msg = messages[selectedMsg];
    let padding = 30;

    // Section label
    fill(60);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(13);
    text('Token-Level Sentiment:', padding, TOKEN_Y);

    // Full message text
    fill(80);
    textSize(11);
    textAlign(LEFT, TOP);
    text('"' + msg.text + '"', padding, TOKEN_Y + 22);

    // Token boxes with colored underlines
    let tokenY = TOKEN_Y + 52;
    let tokenX = padding;
    textSize(13);

    for (let t of msg.tokens) {
        let tw = textWidth(t.word) + 16;

        // Check if wrapping needed
        if (tokenX + tw > canvasWidth - padding) {
            tokenX = padding;
            tokenY += 48;
        }

        // Token background
        fill(255);
        stroke(200);
        strokeWeight(1);
        rect(tokenX, tokenY, tw, 30, 4);

        // Token text
        fill(40);
        noStroke();
        textAlign(CENTER, CENTER);
        text(t.word, tokenX + tw / 2, tokenY + 11);

        // Color underline based on score
        let lineCol;
        if (t.score > 0.1) {
            lineCol = [60, 160, 60]; // green
        } else if (t.score < -0.1) {
            lineCol = [200, 60, 60]; // red
        } else {
            lineCol = [180, 180, 180]; // gray
        }
        stroke(...lineCol);
        strokeWeight(3);
        line(tokenX + 4, tokenY + 28, tokenX + tw - 4, tokenY + 28);

        // Score below if in scored mode
        if (scoredMode && t.score !== 0) {
            fill(...lineCol);
            noStroke();
            textSize(9);
            textAlign(CENTER, TOP);
            text(nf(t.score, 1, 1), tokenX + tw / 2, tokenY + 32);
            textSize(13);
        }

        tokenX += tw + 6;
    }

    // Legend
    let legendY = canvasHeight - 30;
    textSize(10);
    textAlign(LEFT, CENTER);
    noStroke();

    let legendX = padding;
    stroke(60, 160, 60);
    strokeWeight(3);
    line(legendX, legendY, legendX + 20, legendY);
    noStroke();
    fill(80);
    text('Positive', legendX + 26, legendY);

    legendX += 90;
    stroke(200, 60, 60);
    strokeWeight(3);
    line(legendX, legendY, legendX + 20, legendY);
    noStroke();
    fill(80);
    text('Negative', legendX + 26, legendY);

    legendX += 95;
    stroke(180);
    strokeWeight(3);
    line(legendX, legendY, legendX + 20, legendY);
    noStroke();
    fill(80);
    text('Neutral', legendX + 26, legendY);
}

function mousePressed() {
    // Message buttons
    for (let b of msgButtons) {
        if (mouseX > b.x && mouseX < b.x + b.w &&
            mouseY > b.y && mouseY < b.y + b.h) {
            selectedMsg = b.idx;
            return;
        }
    }

    // Toggle button
    if (mouseX > toggleBtn.x && mouseX < toggleBtn.x + toggleBtn.w &&
        mouseY > toggleBtn.y && mouseY < toggleBtn.y + toggleBtn.h) {
        scoredMode = !scoredMode;
        return;
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    layoutButtons();
}
