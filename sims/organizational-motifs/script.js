// Organizational Network Motifs MicroSim
// Visual gallery of 5 common organizational network motifs

let canvasWidth = 900;
const canvasHeight = 550;

const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

let selectedCard = 0; // 0-indexed, start with first card selected
let hoveredCard = -1;
let hoveredNode = null; // { cardIdx, nodeIdx }

const CARD_TOP = 48;
const CARD_H = 175;
const DETAIL_TOP = CARD_TOP + CARD_H + 12;

// Motif definitions
const motifs = [
    {
        name: 'Triangle',
        subtitle: 'Trust Cluster',
        brief: 'Three people who all communicate with each other.',
        description: 'A fully connected triad where every person communicates directly with the other two. This is the foundation of team cohesion and trust — when A talks to B, B talks to C, and C talks to A, information flows freely and accountability is shared.',
        healthy: 'Yes — triangles indicate strong team bonds and efficient information sharing. High triangle density suggests a cohesive, trusting team.',
        nodes: [
            { label: 'A', role: 'Team Lead', rx: 0.5, ry: 0.15 },
            { label: 'B', role: 'Engineer', rx: 0.2, ry: 0.8 },
            { label: 'C', role: 'Designer', rx: 0.8, ry: 0.8 }
        ],
        edges: [
            { from: 0, to: 1, directed: false },
            { from: 1, to: 2, directed: false },
            { from: 0, to: 2, directed: false }
        ],
        edgeColor: [76, 175, 80]
    },
    {
        name: 'Feed-forward Loop',
        subtitle: 'Mentoring Chain',
        brief: 'Information flows through a chain with redundant direct link.',
        description: 'Person A communicates to B and C, while B also communicates to C. This creates redundancy — C gets information both directly from A and filtered through B. Common in mentoring, where a senior leader (A) guides a mid-level mentor (B), who in turn coaches a junior (C), while the leader also checks in directly.',
        healthy: 'Yes — provides redundancy and validation. Information reaching C through two paths is more reliable and nuanced.',
        nodes: [
            { label: 'A', role: 'Director', rx: 0.5, ry: 0.12 },
            { label: 'B', role: 'Mentor', rx: 0.15, ry: 0.82 },
            { label: 'C', role: 'Mentee', rx: 0.85, ry: 0.82 }
        ],
        edges: [
            { from: 0, to: 1, directed: true },
            { from: 1, to: 2, directed: true },
            { from: 0, to: 2, directed: true }
        ],
        edgeColor: [33, 150, 243]
    },
    {
        name: 'Reciprocal Pair',
        subtitle: 'Collaboration Bond',
        brief: 'Bidirectional communication between two people.',
        description: 'Two people who both initiate communication with each other regularly. This is the simplest and most fundamental collaboration pattern — mutual exchange rather than one-way broadcasting. Found between co-leads, paired programmers, or close cross-functional partners.',
        healthy: 'Yes — reciprocal ties are the strongest relationships in any network. They indicate trust, shared goals, and balanced power dynamics.',
        nodes: [
            { label: 'A', role: 'Co-Lead', rx: 0.22, ry: 0.5 },
            { label: 'B', role: 'Co-Lead', rx: 0.78, ry: 0.5 }
        ],
        edges: [
            { from: 0, to: 1, directed: true, offsetY: -12 },
            { from: 1, to: 0, directed: true, offsetY: 12 }
        ],
        edgeColor: [156, 39, 176]
    },
    {
        name: 'Fan-out Star',
        subtitle: 'Broadcast Pattern',
        brief: 'One person communicating to many, no inter-recipient links.',
        description: 'A central hub sends information outward to multiple recipients who do not communicate with each other. Common with announcements from leadership, task assignments from a manager, or email blasts. The spokes rely entirely on the hub for information.',
        healthy: 'Mixed — efficient for broadcasting but fragile. If the hub is removed, the spokes become completely disconnected. Also indicates potential information bottleneck.',
        nodes: [
            { label: 'A', role: 'Manager', rx: 0.5, ry: 0.3 },
            { label: 'B', role: 'Report 1', rx: 0.1, ry: 0.85 },
            { label: 'C', role: 'Report 2', rx: 0.5, ry: 0.9 },
            { label: 'D', role: 'Report 3', rx: 0.9, ry: 0.85 }
        ],
        edges: [
            { from: 0, to: 1, directed: true },
            { from: 0, to: 2, directed: true },
            { from: 0, to: 3, directed: true }
        ],
        edgeColor: [255, 152, 0]
    },
    {
        name: 'Broker Triad',
        subtitle: 'Information Gatekeeper',
        brief: 'One person controlling flow between two disconnected others.',
        description: 'Person A is connected to both B and C, but B and C have no direct connection. A acts as a broker or gatekeeper, controlling the flow of information between two parties. This gives A structural power — they can filter, delay, or spin information passing between B and C.',
        healthy: 'Risky — while brokers add value by connecting silos, over-reliance on a single broker creates a fragile single point of failure and a potential power imbalance.',
        nodes: [
            { label: 'A', role: 'Broker', rx: 0.5, ry: 0.35 },
            { label: 'B', role: 'Dept Head 1', rx: 0.12, ry: 0.8 },
            { label: 'C', role: 'Dept Head 2', rx: 0.88, ry: 0.8 }
        ],
        edges: [
            { from: 0, to: 1, directed: false },
            { from: 0, to: 2, directed: false }
        ],
        edgeColor: [244, 67, 54]
    }
];

function updateCanvasSize() {
    let container = document.getElementById('canvas-container');
    if (container) canvasWidth = container.offsetWidth;
}

function setup() {
    updateCanvasSize();
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    textFont('Arial');
}

function getCardLayout() {
    let gap = 10;
    let margin = 12;
    let usableW = canvasWidth - margin * 2;
    let cardW = (usableW - gap * 4) / 5;
    let cards = [];
    for (let i = 0; i < 5; i++) {
        cards.push({
            x: margin + i * (cardW + gap),
            y: CARD_TOP,
            w: cardW,
            h: CARD_H
        });
    }
    return { cards, cardW };
}

function draw() {
    background(245);

    // Title
    fill(30);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text('Organizational Network Motifs', canvasWidth / 2, 22);

    let layout = getCardLayout();

    // Draw cards
    for (let i = 0; i < motifs.length; i++) {
        drawCard(i, layout.cards[i], layout.cardW);
    }

    // Draw detail panel
    if (selectedCard >= 0 && selectedCard < motifs.length) {
        drawDetailPanel(motifs[selectedCard]);
    }

    // Draw node tooltip
    if (hoveredNode !== null) {
        drawNodeTooltip();
    }
}

function drawCard(idx, card, cardW) {
    let m = motifs[idx];
    let isSelected = (idx === selectedCard);
    let isHover = (idx === hoveredCard);

    // Card background
    if (isSelected) {
        fill(255, 252, 240);
        stroke(...GOLD);
        strokeWeight(2.5);
    } else if (isHover) {
        fill(255);
        stroke(160, 170, 210);
        strokeWeight(1.5);
    } else {
        fill(255);
        stroke(200);
        strokeWeight(1);
    }
    rect(card.x, card.y, card.w, card.h, 8);

    // Mini graph area
    let graphPad = 10;
    let graphTop = card.y + 6;
    let graphH = card.h - 60;
    let graphW = card.w - graphPad * 2;

    // Draw edges in mini card
    for (let e of m.edges) {
        let n1 = m.nodes[e.from];
        let n2 = m.nodes[e.to];
        let x1 = card.x + graphPad + n1.rx * graphW;
        let y1 = graphTop + n1.ry * graphH;
        let x2 = card.x + graphPad + n2.rx * graphW;
        let y2 = graphTop + n2.ry * graphH;

        let offY1 = e.offsetY || 0;
        let offY2 = -(e.offsetY || 0);

        stroke(...m.edgeColor);
        strokeWeight(1.8);
        if (e.directed) {
            drawArrow(x1, y1 + offY1, x2, y2 + offY2, 6);
        } else {
            line(x1, y1, x2, y2);
        }
    }

    // Draw nodes in mini card
    for (let j = 0; j < m.nodes.length; j++) {
        let nd = m.nodes[j];
        let nx = card.x + graphPad + nd.rx * graphW;
        let ny = graphTop + nd.ry * graphH;
        let r = 13;

        let isNodeHovered = hoveredNode !== null && hoveredNode.cardIdx === idx && hoveredNode.nodeIdx === j;

        if (isNodeHovered) {
            noStroke();
            fill(...GOLD, 80);
            ellipse(nx, ny, r * 2 + 10);
        }

        fill(...AMBER);
        stroke(255);
        strokeWeight(1.5);
        ellipse(nx, ny, r * 2);

        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        text(nd.label, nx, ny);
    }

    // Motif name
    fill(40);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(11);
    let nameY = card.y + card.h - 50;
    text(m.name, card.x + card.w / 2, nameY);

    // Subtitle
    fill(...INDIGO);
    textSize(9);
    text(m.subtitle, card.x + card.w / 2, nameY + 15);

    // Brief description (wrapped)
    fill(100);
    textSize(8);
    textAlign(CENTER, TOP);
    let brief = m.brief;
    text(brief, card.x + 6, nameY + 30, card.w - 12, 24);
}

function drawArrow(x1, y1, x2, y2, headLen) {
    let angle = atan2(y2 - y1, x2 - x1);
    let targetR = 13; // node radius
    let dx = cos(angle);
    let dy = sin(angle);

    // Shorten line to stop at node edge
    let sx = x1 + dx * targetR;
    let sy = y1 + dy * targetR;
    let ex = x2 - dx * targetR;
    let ey = y2 - dy * targetR;

    line(sx, sy, ex, ey);

    // Arrowhead
    push();
    translate(ex, ey);
    rotate(angle);
    line(0, 0, -headLen, -headLen * 0.5);
    line(0, 0, -headLen, headLen * 0.5);
    pop();
}

function drawDetailPanel(m) {
    let panelX = 12;
    let panelY = DETAIL_TOP;
    let panelW = canvasWidth - 24;
    let panelH = canvasHeight - DETAIL_TOP - 10;

    // Panel background
    fill(255, 252, 245);
    stroke(200);
    strokeWeight(1);
    rect(panelX, panelY, panelW, panelH, 8);

    // Left side: larger motif diagram
    let diagramW = 180;
    let diagramH = panelH - 20;
    let diagramX = panelX + 15;
    let diagramY = panelY + 10;

    fill(250);
    stroke(220);
    strokeWeight(1);
    rect(diagramX, diagramY, diagramW, diagramH, 6);

    // Draw larger motif
    let gPad = 20;
    let gW = diagramW - gPad * 2;
    let gH = diagramH - gPad * 2;

    for (let e of m.edges) {
        let n1 = m.nodes[e.from];
        let n2 = m.nodes[e.to];
        let x1 = diagramX + gPad + n1.rx * gW;
        let y1 = diagramY + gPad + n1.ry * gH;
        let x2 = diagramX + gPad + n2.rx * gW;
        let y2 = diagramY + gPad + n2.ry * gH;

        let offY1 = (e.offsetY || 0) * 1.5;
        let offY2 = -(e.offsetY || 0) * 1.5;

        stroke(...m.edgeColor);
        strokeWeight(2.5);
        if (e.directed) {
            drawArrow(x1, y1 + offY1, x2, y2 + offY2, 10);
        } else {
            line(x1, y1, x2, y2);
        }
    }

    for (let j = 0; j < m.nodes.length; j++) {
        let nd = m.nodes[j];
        let nx = diagramX + gPad + nd.rx * gW;
        let ny = diagramY + gPad + nd.ry * gH;
        let r = 20;

        // Check hover on detail panel node
        let isHov = dist(mouseX, mouseY, nx, ny) < r;

        if (isHov) {
            noStroke();
            fill(...GOLD, 70);
            ellipse(nx, ny, r * 2 + 14);
        }

        fill(...AMBER);
        stroke(255);
        strokeWeight(2);
        ellipse(nx, ny, r * 2);

        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(14);
        text(nd.label, nx, ny);

        // Role label below node
        fill(80);
        textSize(9);
        text(nd.role, nx, ny + r + 10);
    }

    // Right side: text details
    let textX = diagramX + diagramW + 20;
    let textW = panelW - diagramW - 55;
    let ty = panelY + 16;

    // Motif name and subtitle
    fill(...INDIGO);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(16);
    text(m.name, textX, ty);

    fill(...AMBER);
    textSize(12);
    text(m.subtitle, textX, ty + 22);
    ty += 44;

    // Description
    fill(50);
    textSize(11);
    textAlign(LEFT, TOP);
    text(m.description, textX, ty, textW, 80);
    ty += 80;

    // Healthy sign assessment
    fill(...INDIGO);
    textSize(12);
    text('Healthy Sign?', textX, ty);
    ty += 18;

    fill(60);
    textSize(11);
    text(m.healthy, textX, ty, textW, 60);
    ty += 52;

    // Node roles table
    fill(...INDIGO);
    textSize(12);
    text('Example Roles:', textX, ty);
    ty += 18;

    for (let nd of m.nodes) {
        fill(80);
        textSize(11);
        text('Node ' + nd.label + ':  ' + nd.role, textX + 8, ty);
        ty += 16;
    }
}

function drawNodeTooltip() {
    if (hoveredNode === null) return;
    let m = motifs[hoveredNode.cardIdx];
    let nd = m.nodes[hoveredNode.nodeIdx];

    let tw = 110;
    let th = 36;
    let tx = mouseX + 14;
    let ty = mouseY - 10;

    if (tx + tw > canvasWidth - 5) tx = mouseX - tw - 10;
    if (ty < 5) ty = 5;

    fill(255, 252, 240);
    stroke(180);
    strokeWeight(1);
    rect(tx, ty, tw, th, 5);

    fill(40);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(11);
    text(nd.label + ': ' + nd.role, tx + 8, ty + th / 2);
}

function mousePressed() {
    let layout = getCardLayout();
    for (let i = 0; i < 5; i++) {
        let c = layout.cards[i];
        if (mouseX > c.x && mouseX < c.x + c.w && mouseY > c.y && mouseY < c.y + c.h) {
            selectedCard = i;
            return;
        }
    }
}

function mouseMoved() {
    hoveredCard = -1;
    hoveredNode = null;

    let layout = getCardLayout();

    // Check card hover
    for (let i = 0; i < 5; i++) {
        let c = layout.cards[i];
        if (mouseX > c.x && mouseX < c.x + c.w && mouseY > c.y && mouseY < c.y + c.h) {
            hoveredCard = i;

            // Check node hover within card
            let m = motifs[i];
            let graphPad = 10;
            let graphTop = c.y + 6;
            let graphH = c.h - 60;
            let graphW = c.w - graphPad * 2;

            for (let j = 0; j < m.nodes.length; j++) {
                let nd = m.nodes[j];
                let nx = c.x + graphPad + nd.rx * graphW;
                let ny = graphTop + nd.ry * graphH;
                if (dist(mouseX, mouseY, nx, ny) < 13) {
                    hoveredNode = { cardIdx: i, nodeIdx: j };
                    break;
                }
            }
            break;
        }
    }
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
}
