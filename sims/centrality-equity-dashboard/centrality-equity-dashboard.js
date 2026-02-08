// Centrality Equity Dashboard - p5.js MicroSim
// Three-panel dashboard: grouped bar chart, box plot, equity ratios

let canvasWidth = 900;
const drawHeight = 550;
const controlHeight = 50;
const canvasHeight = drawHeight + controlHeight;

// Aria color palette
const INDIGO = [48, 63, 159];
const INDIGO_DARK = [26, 35, 126];
const INDIGO_LIGHT = [92, 107, 192];
const AMBER = [212, 136, 15];
const AMBER_DARK = [176, 109, 11];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// Equity indicator colors
const EQ_GREEN = [56, 142, 60];
const EQ_AMBER = [245, 166, 35];
const EQ_RED = [211, 47, 47];

// Metric indices
const BETWEENNESS = 0;
const DEGREE = 1;
const EIGENVECTOR = 2;

let selectedMetric = BETWEENNESS;
let controlForTenure = false;

// Metric labels and colors
const metricNames = ['Betweenness', 'Degree', 'Eigenvector'];
const metricColors = [
    INDIGO,   // Betweenness
    AMBER,    // Degree
    GOLD      // Eigenvector
];

// Group data
const groupNames = ['A', 'B', 'C', 'D'];
const groupSizes = [312, 287, 156, 93];

// Raw centrality averages [group][metric]
const rawAverages = [
    [0.0142, 0.0831, 0.0724],  // Group A
    [0.0098, 0.0612, 0.0519],  // Group B
    [0.0067, 0.0445, 0.0388],  // Group C
    [0.0051, 0.0389, 0.0312]   // Group D
];

// Tenure-controlled averages (more equitable)
const tenureFactors = [0.85, 1.05, 1.20, 1.30];
let tenureAverages = [];

// Box plot data [group][metric] = {min, q1, median, q3, max}
const rawBoxData = [
    // Betweenness
    [
        {min: 0.001, q1: 0.008, median: 0.013, q3: 0.019, max: 0.045},
        {min: 0.001, q1: 0.005, median: 0.009, q3: 0.013, max: 0.032},
        {min: 0.000, q1: 0.003, median: 0.006, q3: 0.009, max: 0.025},
        {min: 0.000, q1: 0.002, median: 0.004, q3: 0.007, max: 0.019}
    ],
    // Degree
    [
        {min: 0.010, q1: 0.055, median: 0.080, q3: 0.110, max: 0.210},
        {min: 0.008, q1: 0.038, median: 0.058, q3: 0.082, max: 0.165},
        {min: 0.005, q1: 0.025, median: 0.042, q3: 0.060, max: 0.130},
        {min: 0.004, q1: 0.020, median: 0.036, q3: 0.055, max: 0.115}
    ],
    // Eigenvector
    [
        {min: 0.008, q1: 0.045, median: 0.070, q3: 0.098, max: 0.190},
        {min: 0.006, q1: 0.032, median: 0.050, q3: 0.070, max: 0.145},
        {min: 0.004, q1: 0.020, median: 0.036, q3: 0.054, max: 0.112},
        {min: 0.003, q1: 0.016, median: 0.028, q3: 0.044, max: 0.095}
    ]
];

let tenureBoxData = [];

// Tooltip state
let tooltip = { show: false, x: 0, y: 0, lines: [] };

// Button positions (computed in layout)
let metricButtons = [];
let toggleButton = { x: 0, y: 0, w: 0, h: 0 };

// Panel regions (computed in layout)
let barPanel = {};
let boxPanel = {};
let eqPanel = {};

function updateCanvasSize() {
    const container = document.querySelector('main');
    if (container) canvasWidth = container.offsetWidth;
    if (canvasWidth < 400) canvasWidth = 400;
}

function setup() {
    updateCanvasSize();
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('main');
    textFont('Arial');

    computeTenureData();
    computeLayout();
}

function computeTenureData() {
    // Tenure-controlled averages: bring groups closer together
    tenureAverages = [];
    for (let g = 0; g < 4; g++) {
        tenureAverages.push([]);
        for (let m = 0; m < 3; m++) {
            tenureAverages[g].push(rawAverages[g][m] * tenureFactors[g]);
        }
    }

    // Tenure-controlled box plot data
    tenureBoxData = [];
    for (let m = 0; m < 3; m++) {
        tenureBoxData.push([]);
        for (let g = 0; g < 4; g++) {
            const f = tenureFactors[g];
            const raw = rawBoxData[m][g];
            tenureBoxData[m].push({
                min: raw.min * f,
                q1: raw.q1 * f,
                median: raw.median * f,
                q3: raw.q3 * f,
                max: raw.max * f
            });
        }
    }
}

function computeLayout() {
    const margin = 16;
    const titleH = 36;

    // Panel 1 (top): grouped bar chart - ~50% of drawHeight
    const barH = drawHeight * 0.48;
    barPanel = {
        x: margin, y: titleH,
        w: canvasWidth - 2 * margin,
        h: barH
    };

    // Panel 2 (bottom-left): box plot - ~50% height, ~50% width
    const bottomY = titleH + barH + 8;
    const bottomH = drawHeight - bottomY - 4;
    boxPanel = {
        x: margin, y: bottomY,
        w: (canvasWidth - 3 * margin) * 0.52,
        h: bottomH
    };

    // Panel 3 (bottom-right): equity ratios
    eqPanel = {
        x: boxPanel.x + boxPanel.w + margin, y: bottomY,
        w: canvasWidth - boxPanel.x - boxPanel.w - 2 * margin,
        h: bottomH
    };

    // Control area metric selector buttons
    const btnW = 90;
    const btnH = 28;
    const btnGap = 8;
    const totalBtnW = 3 * btnW + 2 * btnGap;
    const btnStartX = 20;
    const btnY = drawHeight + (controlHeight - btnH) / 2;

    metricButtons = [];
    for (let i = 0; i < 3; i++) {
        metricButtons.push({
            x: btnStartX + i * (btnW + btnGap),
            y: btnY,
            w: btnW,
            h: btnH,
            metric: i
        });
    }

    // Toggle button
    const togW = 220;
    const togH = 28;
    toggleButton = {
        x: canvasWidth - togW - 20,
        y: drawHeight + (controlHeight - togH) / 2,
        w: togW,
        h: togH
    };
}

function draw() {
    // Draw region background
    noStroke();
    fill(240, 248, 255); // aliceblue
    rect(0, 0, canvasWidth, drawHeight);

    // Control region background
    fill(255);
    rect(0, drawHeight, canvasWidth, controlHeight);

    // Separator line
    stroke(200);
    strokeWeight(1);
    line(0, drawHeight, canvasWidth, drawHeight);

    // Title
    noStroke();
    fill(...INDIGO_DARK);
    textAlign(CENTER, CENTER);
    textSize(17);
    textStyle(BOLD);
    text('Centrality Equity Dashboard', canvasWidth / 2, 18);
    textStyle(NORMAL);

    // Draw panels
    drawBarChart();
    drawBoxPlot();
    drawEquityRatios();

    // Draw controls
    drawMetricButtons();
    drawToggleButton();

    // Draw tooltip last (on top)
    drawTooltip();
}

// ============================================================
// PANEL 1: Grouped Bar Chart
// ============================================================
function drawBarChart() {
    const p = barPanel;
    const averages = controlForTenure ? tenureAverages : rawAverages;

    // Panel background
    fill(255);
    stroke(210);
    strokeWeight(1);
    rect(p.x, p.y, p.w, p.h, 6);

    // Panel title
    noStroke();
    fill(...INDIGO);
    textAlign(LEFT, TOP);
    textSize(12);
    textStyle(BOLD);
    const modeLabel = controlForTenure ? ' (Tenure-Controlled)' : ' (Raw)';
    text('Average Centrality by Demographic Group' + modeLabel, p.x + 12, p.y + 8);
    textStyle(NORMAL);

    // Chart area within panel
    const chartLeft = p.x + 60;
    const chartRight = p.x + p.w - 20;
    const chartTop = p.y + 32;
    const chartBottom = p.y + p.h - 30;
    const chartW = chartRight - chartLeft;
    const chartH = chartBottom - chartTop;

    // Y-axis: 0 to 0.10
    const yMax = 0.10;
    const yTicks = [0, 0.02, 0.04, 0.06, 0.08, 0.10];

    // Grid lines and y-axis labels
    textAlign(RIGHT, CENTER);
    textSize(10);
    fill(130);
    for (const yVal of yTicks) {
        const yPos = chartBottom - (yVal / yMax) * chartH;
        stroke(230);
        strokeWeight(1);
        line(chartLeft, yPos, chartRight, yPos);
        noStroke();
        text(yVal.toFixed(2), chartLeft - 6, yPos);
    }

    // Y-axis label
    push();
    fill(100);
    textSize(10);
    textAlign(CENTER, CENTER);
    translate(p.x + 14, chartTop + chartH / 2);
    rotate(-HALF_PI);
    text('Avg Centrality', 0, 0);
    pop();

    // Organization-wide averages (horizontal dashed lines)
    for (let m = 0; m < 3; m++) {
        let sum = 0;
        let totalPeople = 0;
        for (let g = 0; g < 4; g++) {
            sum += averages[g][m] * groupSizes[g];
            totalPeople += groupSizes[g];
        }
        const orgAvg = sum / totalPeople;
        const yPos = chartBottom - (orgAvg / yMax) * chartH;

        stroke(metricColors[m][0], metricColors[m][1], metricColors[m][2], 140);
        strokeWeight(1);
        drawDashedLine(chartLeft, yPos, chartRight, yPos, 6, 4);
    }

    // Bars
    const groupCount = 4;
    const metricsPerGroup = 3;
    const groupSpacing = chartW / groupCount;
    const groupPadding = groupSpacing * 0.15;
    const barAreaW = groupSpacing - 2 * groupPadding;
    const barW = barAreaW / metricsPerGroup - 2;
    const barGap = 2;

    // Reset tooltip
    tooltip.show = false;

    for (let g = 0; g < groupCount; g++) {
        const groupX = chartLeft + g * groupSpacing;

        // Group label
        noStroke();
        fill(80);
        textAlign(CENTER, TOP);
        textSize(11);
        text('Group ' + groupNames[g], groupX + groupSpacing / 2, chartBottom + 4);
        textSize(9);
        fill(140);
        text('(n=' + groupSizes[g] + ')', groupX + groupSpacing / 2, chartBottom + 16);

        for (let m = 0; m < metricsPerGroup; m++) {
            const val = averages[g][m];
            const barH2 = (val / yMax) * chartH;
            const bx = groupX + groupPadding + m * (barW + barGap);
            const by = chartBottom - barH2;

            // Bar fill
            noStroke();
            fill(metricColors[m][0], metricColors[m][1], metricColors[m][2]);
            rect(bx, by, barW, barH2, 2, 2, 0, 0);

            // Hover detection
            if (mouseX >= bx && mouseX <= bx + barW && mouseY >= by && mouseY <= chartBottom) {
                // Highlight
                fill(255, 255, 255, 60);
                rect(bx, by, barW, barH2, 2, 2, 0, 0);

                tooltip.show = true;
                tooltip.x = mouseX;
                tooltip.y = mouseY;
                tooltip.lines = [
                    'Group ' + groupNames[g] + ' - ' + metricNames[m],
                    'Value: ' + val.toFixed(4),
                    'n = ' + groupSizes[g]
                ];
            }
        }
    }

    // Legend (top right of chart)
    const legX = chartRight - 180;
    const legY = chartTop + 4;
    for (let m = 0; m < 3; m++) {
        fill(metricColors[m][0], metricColors[m][1], metricColors[m][2]);
        noStroke();
        rect(legX, legY + m * 16, 12, 10, 2);
        fill(80);
        textAlign(LEFT, CENTER);
        textSize(10);
        text(metricNames[m], legX + 16, legY + m * 16 + 5);
    }

    // Dashed line legend
    stroke(140);
    strokeWeight(1);
    drawDashedLine(legX, legY + 52, legX + 12, legY + 52, 4, 3);
    noStroke();
    fill(100);
    textSize(9);
    textAlign(LEFT, CENTER);
    text('Org-wide avg (dashed)', legX + 16, legY + 52);
}

// ============================================================
// PANEL 2: Box-and-Whisker Plot
// ============================================================
function drawBoxPlot() {
    const p = boxPanel;
    const boxData = controlForTenure ? tenureBoxData : rawBoxData;
    const data = boxData[selectedMetric];

    // Panel background
    fill(255);
    stroke(210);
    strokeWeight(1);
    rect(p.x, p.y, p.w, p.h, 6);

    // Panel title
    noStroke();
    fill(...INDIGO);
    textAlign(LEFT, TOP);
    textSize(12);
    textStyle(BOLD);
    text(metricNames[selectedMetric] + ' Distribution', p.x + 12, p.y + 8);
    textStyle(NORMAL);

    // Chart area
    const chartLeft = p.x + 50;
    const chartRight = p.x + p.w - 16;
    const chartTop = p.y + 28;
    const chartBottom = p.y + p.h - 28;
    const chartW = chartRight - chartLeft;
    const chartH = chartBottom - chartTop;

    // Find y range from data
    let yMin = Infinity, yMax2 = -Infinity;
    for (let g = 0; g < 4; g++) {
        if (data[g].min < yMin) yMin = data[g].min;
        if (data[g].max > yMax2) yMax2 = data[g].max;
    }
    // Add some padding
    const yRange = yMax2 - yMin;
    const yLow = max(0, yMin - yRange * 0.05);
    const yHigh = yMax2 + yRange * 0.1;

    // Y-axis ticks
    const tickCount = 5;
    textAlign(RIGHT, CENTER);
    textSize(9);
    fill(130);
    for (let i = 0; i <= tickCount; i++) {
        const yVal = yLow + (yHigh - yLow) * (i / tickCount);
        const yPos = chartBottom - (i / tickCount) * chartH;
        stroke(235);
        strokeWeight(1);
        line(chartLeft, yPos, chartRight, yPos);
        noStroke();
        text(yVal.toFixed(3), chartLeft - 4, yPos);
    }

    // Box plots
    const groupSpacing = chartW / 4;
    const boxW = min(groupSpacing * 0.5, 40);

    const groupColors = [
        [48, 63, 159],    // A - indigo
        [212, 136, 15],   // B - amber
        [255, 215, 0],    // C - gold
        [92, 107, 192]    // D - indigo light
    ];

    for (let g = 0; g < 4; g++) {
        const d = data[g];
        const cx = chartLeft + (g + 0.5) * groupSpacing;

        // Map values to y positions
        const yMinPos = chartBottom - ((d.min - yLow) / (yHigh - yLow)) * chartH;
        const yQ1Pos = chartBottom - ((d.q1 - yLow) / (yHigh - yLow)) * chartH;
        const yMedPos = chartBottom - ((d.median - yLow) / (yHigh - yLow)) * chartH;
        const yQ3Pos = chartBottom - ((d.q3 - yLow) / (yHigh - yLow)) * chartH;
        const yMaxPos = chartBottom - ((d.max - yLow) / (yHigh - yLow)) * chartH;

        // Whisker line (min to max)
        stroke(groupColors[g][0], groupColors[g][1], groupColors[g][2]);
        strokeWeight(1.5);
        line(cx, yMinPos, cx, yQ1Pos);
        line(cx, yQ3Pos, cx, yMaxPos);

        // Whisker caps
        const capW = boxW * 0.4;
        line(cx - capW, yMinPos, cx + capW, yMinPos);
        line(cx - capW, yMaxPos, cx + capW, yMaxPos);

        // Box (Q1 to Q3)
        fill(groupColors[g][0], groupColors[g][1], groupColors[g][2], 80);
        stroke(groupColors[g][0], groupColors[g][1], groupColors[g][2]);
        strokeWeight(1.5);
        rect(cx - boxW / 2, yQ3Pos, boxW, yQ1Pos - yQ3Pos, 2);

        // Median line
        stroke(groupColors[g][0], groupColors[g][1], groupColors[g][2]);
        strokeWeight(2.5);
        line(cx - boxW / 2, yMedPos, cx + boxW / 2, yMedPos);

        // Group label
        noStroke();
        fill(80);
        textAlign(CENTER, TOP);
        textSize(10);
        text('Grp ' + groupNames[g], cx, chartBottom + 4);

        // Hover tooltip for box plot
        if (mouseX >= cx - boxW / 2 - 5 && mouseX <= cx + boxW / 2 + 5 &&
            mouseY >= yMaxPos - 5 && mouseY <= yMinPos + 5) {
            tooltip.show = true;
            tooltip.x = mouseX;
            tooltip.y = mouseY;
            tooltip.lines = [
                'Group ' + groupNames[g] + ' - ' + metricNames[selectedMetric],
                'Max: ' + d.max.toFixed(4),
                'Q3: ' + d.q3.toFixed(4),
                'Median: ' + d.median.toFixed(4),
                'Q1: ' + d.q1.toFixed(4),
                'Min: ' + d.min.toFixed(4)
            ];
        }
    }
}

// ============================================================
// PANEL 3: Equity Ratio Indicators
// ============================================================
function drawEquityRatios() {
    const p = eqPanel;
    const averages = controlForTenure ? tenureAverages : rawAverages;

    // Panel background
    fill(255);
    stroke(210);
    strokeWeight(1);
    rect(p.x, p.y, p.w, p.h, 6);

    // Panel title
    noStroke();
    fill(...INDIGO);
    textAlign(LEFT, TOP);
    textSize(12);
    textStyle(BOLD);
    text('Equity Ratios', p.x + 12, p.y + 8);
    textStyle(NORMAL);

    // Subtitle
    fill(120);
    textSize(9);
    text('Lowest / Highest group average', p.x + 12, p.y + 24);

    // Compute equity ratios for each metric
    const barLeft = p.x + 16;
    const barRight = p.x + p.w - 16;
    const barW = barRight - barLeft;
    const barH = 22;
    const startY = p.y + 44;
    const rowH = (p.h - 52) / 3;

    for (let m = 0; m < 3; m++) {
        let minVal = Infinity, maxVal = -Infinity;
        for (let g = 0; g < 4; g++) {
            if (averages[g][m] < minVal) minVal = averages[g][m];
            if (averages[g][m] > maxVal) maxVal = averages[g][m];
        }
        const ratio = maxVal > 0 ? minVal / maxVal : 0;

        const rowY = startY + m * rowH;

        // Metric label
        noStroke();
        fill(80);
        textAlign(LEFT, TOP);
        textSize(11);
        textStyle(BOLD);
        text(metricNames[m], barLeft, rowY);
        textStyle(NORMAL);

        // Background bar
        fill(235);
        noStroke();
        rect(barLeft, rowY + 16, barW, barH, 4);

        // Filled bar
        let barColor;
        if (ratio >= 0.8) {
            barColor = EQ_GREEN;
        } else if (ratio >= 0.5) {
            barColor = EQ_AMBER;
        } else {
            barColor = EQ_RED;
        }
        fill(barColor[0], barColor[1], barColor[2]);
        const filledW = ratio * barW;
        rect(barLeft, rowY + 16, filledW, barH, 4);

        // Ratio text on bar
        fill(255);
        textAlign(LEFT, CENTER);
        textSize(11);
        textStyle(BOLD);
        if (filledW > 50) {
            text(ratio.toFixed(2), barLeft + 8, rowY + 16 + barH / 2);
        }
        textStyle(NORMAL);

        // Ratio text to the right if bar is too short
        if (filledW <= 50) {
            fill(barColor[0], barColor[1], barColor[2]);
            textAlign(LEFT, CENTER);
            textSize(11);
            textStyle(BOLD);
            text(ratio.toFixed(2), barLeft + filledW + 4, rowY + 16 + barH / 2);
            textStyle(NORMAL);
        }

        // Status label
        let statusLabel;
        if (ratio >= 0.8) {
            statusLabel = 'Equitable';
        } else if (ratio >= 0.5) {
            statusLabel = 'Moderate Gap';
        } else {
            statusLabel = 'Significant Gap';
        }
        fill(barColor[0], barColor[1], barColor[2]);
        textAlign(RIGHT, TOP);
        textSize(9);
        text(statusLabel, barRight, rowY);

        // Hover for equity bar
        if (mouseX >= barLeft && mouseX <= barRight &&
            mouseY >= rowY + 16 && mouseY <= rowY + 16 + barH) {
            tooltip.show = true;
            tooltip.x = mouseX;
            tooltip.y = mouseY;
            tooltip.lines = [
                metricNames[m] + ' Equity Ratio: ' + ratio.toFixed(3),
                'Lowest group avg: ' + minVal.toFixed(4),
                'Highest group avg: ' + maxVal.toFixed(4),
                'Status: ' + statusLabel
            ];
        }
    }

    // Legend at bottom
    const legY = p.y + p.h - 24;
    const legItems = [
        { color: EQ_GREEN, label: '>0.8 Equitable' },
        { color: EQ_AMBER, label: '0.5-0.8 Moderate' },
        { color: EQ_RED, label: '<0.5 Significant' }
    ];
    const legItemW = (p.w - 32) / 3;

    for (let i = 0; i < 3; i++) {
        const lx = p.x + 16 + i * legItemW;
        fill(legItems[i].color[0], legItems[i].color[1], legItems[i].color[2]);
        noStroke();
        rect(lx, legY, 10, 10, 2);
        fill(100);
        textAlign(LEFT, CENTER);
        textSize(8);
        text(legItems[i].label, lx + 13, legY + 5);
    }
}

// ============================================================
// Controls
// ============================================================
function drawMetricButtons() {
    // Label
    noStroke();
    fill(100);
    textAlign(LEFT, CENTER);
    textSize(9);
    text('Box Plot Metric:', metricButtons[0].x, metricButtons[0].y - 8);

    for (let i = 0; i < 3; i++) {
        const btn = metricButtons[i];
        const isSelected = (selectedMetric === i);
        const isHover = mouseX >= btn.x && mouseX <= btn.x + btn.w &&
                        mouseY >= btn.y && mouseY <= btn.y + btn.h;

        if (isSelected) {
            fill(metricColors[i][0], metricColors[i][1], metricColors[i][2]);
        } else if (isHover) {
            fill(metricColors[i][0], metricColors[i][1], metricColors[i][2], 120);
        } else {
            fill(220);
        }
        noStroke();
        rect(btn.x, btn.y, btn.w, btn.h, 4);

        fill(isSelected ? 255 : 80);
        textAlign(CENTER, CENTER);
        textSize(11);
        textStyle(isSelected ? BOLD : NORMAL);
        text(metricNames[i], btn.x + btn.w / 2, btn.y + btn.h / 2);
        textStyle(NORMAL);
    }
}

function drawToggleButton() {
    const btn = toggleButton;
    const isHover = mouseX >= btn.x && mouseX <= btn.x + btn.w &&
                    mouseY >= btn.y && mouseY <= btn.y + btn.h;

    // Background
    fill(isHover ? 235 : 245);
    stroke(180);
    strokeWeight(1);
    rect(btn.x, btn.y, btn.w, btn.h, 4);

    // Two halves
    const halfW = btn.w / 2;

    // Left half: Raw
    if (!controlForTenure) {
        fill(...INDIGO);
        noStroke();
        rect(btn.x + 2, btn.y + 2, halfW - 2, btn.h - 4, 3, 0, 0, 3);
        fill(255);
    } else {
        fill(100);
    }
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(10);
    textStyle(!controlForTenure ? BOLD : NORMAL);
    text('Raw Centrality', btn.x + halfW / 2, btn.y + btn.h / 2);
    textStyle(NORMAL);

    // Right half: Tenure-Controlled
    if (controlForTenure) {
        fill(...INDIGO);
        noStroke();
        rect(btn.x + halfW, btn.y + 2, halfW - 2, btn.h - 4, 0, 3, 3, 0);
        fill(255);
    } else {
        fill(100);
    }
    textAlign(CENTER, CENTER);
    textSize(10);
    textStyle(controlForTenure ? BOLD : NORMAL);
    text('Tenure-Controlled', btn.x + halfW + halfW / 2, btn.y + btn.h / 2);
    textStyle(NORMAL);
}

// ============================================================
// Tooltip
// ============================================================
function drawTooltip() {
    if (!tooltip.show) return;

    textSize(11);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);

    // Calculate tooltip dimensions
    let maxW = 0;
    for (const line of tooltip.lines) {
        const tw = textWidth(line);
        if (tw > maxW) maxW = tw;
    }
    const tipW = maxW + 20;
    const tipH = tooltip.lines.length * 16 + 12;

    // Position (avoid going off screen)
    let tx = tooltip.x + 14;
    let ty = tooltip.y - tipH - 8;
    if (tx + tipW > canvasWidth) tx = tooltip.x - tipW - 14;
    if (ty < 0) ty = tooltip.y + 20;

    // Shadow
    fill(0, 0, 0, 40);
    noStroke();
    rect(tx + 2, ty + 2, tipW, tipH, 4);

    // Background
    fill(255, 255, 240);
    stroke(180);
    strokeWeight(1);
    rect(tx, ty, tipW, tipH, 4);

    // Text
    noStroke();
    fill(50);
    for (let i = 0; i < tooltip.lines.length; i++) {
        if (i === 0) {
            textStyle(BOLD);
            fill(40);
        } else {
            textStyle(NORMAL);
            fill(70);
        }
        text(tooltip.lines[i], tx + 10, ty + 8 + i * 16);
    }
    textStyle(NORMAL);
}

// ============================================================
// Interaction
// ============================================================
function mousePressed() {
    // Check metric buttons
    for (let i = 0; i < 3; i++) {
        const btn = metricButtons[i];
        if (mouseX >= btn.x && mouseX <= btn.x + btn.w &&
            mouseY >= btn.y && mouseY <= btn.y + btn.h) {
            selectedMetric = i;
            return;
        }
    }

    // Check toggle button
    const btn = toggleButton;
    if (mouseX >= btn.x && mouseX <= btn.x + btn.w &&
        mouseY >= btn.y && mouseY <= btn.y + btn.h) {
        const halfW = btn.w / 2;
        if (mouseX < btn.x + halfW) {
            controlForTenure = false;
        } else {
            controlForTenure = true;
        }
        return;
    }
}

// ============================================================
// Utility: Dashed line
// ============================================================
function drawDashedLine(x1, y1, x2, y2, dashLen, gapLen) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const totalLen = sqrt(dx * dx + dy * dy);
    const ux = dx / totalLen;
    const uy = dy / totalLen;

    let drawn = 0;
    let drawing = true;

    while (drawn < totalLen) {
        const segLen = drawing ? dashLen : gapLen;
        const end = min(drawn + segLen, totalLen);

        if (drawing) {
            line(x1 + ux * drawn, y1 + uy * drawn,
                 x1 + ux * end, y1 + uy * end);
        }

        drawn = end;
        drawing = !drawing;
    }
}

// ============================================================
// Responsive resize
// ============================================================
function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    computeLayout();
}
