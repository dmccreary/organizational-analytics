// Organizational Network Patterns MicroSim
// 4 patterns: Hourglass, Star, Clique Decay, Isolation Drift

const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';

let canvasW = 900;
const canvasH = 520;
let activePattern = 0;
let animStep = 0;
let isPlaying = false;
let patternButtons = [];
let playBtn, stepFwdBtn, stepBackBtn;

const PATTERNS = ['Hourglass', 'Star', 'Clique Decay', 'Isolation Drift'];

const descriptions = [
  { title: 'Hourglass Bottleneck', text: 'Two large clusters connected by a single bridge node. This signals a structural bottleneck where one person brokers all communication between groups.', detection: 'Find nodes whose removal would split a connected component. High betweenness centrality with neighbors in different communities.', impact: 'Single point of failure for cross-team communication. If the bridge leaves, groups become isolated.' },
  { title: 'Star / Hub-and-Spoke', text: 'A central node connected to many peripherals with few connections among themselves. Signals a manager-centric communication pattern.', detection: 'High degree centrality node whose neighbors have low degree centrality and low inter-neighbor connectivity.', impact: 'Information flows only through the hub. Bottleneck for decisions, fragile to hub absence.' },
  { title: 'Clique Decay', text: 'A previously tight group losing internal connections over time. Signals team fragmentation, conflict, or emerging silos.', detection: 'Track period-over-period decline in within-community edge density. Three consecutive periods of decline triggers alert.', impact: 'Collaboration breaks down. Team cohesion weakens. May precede turnover wave.' },
  { title: 'Isolation Drift', text: 'An individual steadily losing connections and drifting toward the network periphery. Signals disengagement.', detection: 'Track individual closeness centrality trend. Declining over 3+ periods with decreasing degree.', impact: 'Employee becoming disengaged. Flight risk increasing. Institutional knowledge at risk.' }
];

// Network data for each pattern
let networks = [];

function buildNetworks() {
  networks = [];

  // 0: Hourglass - two clusters with one bridge
  let hg = { nodes: [], edges: [] };
  // Cluster A (left)
  let clusterACenter = { x: -120, y: 0 };
  for (let i = 0; i < 8; i++) {
    let angle = (i / 8) * TWO_PI;
    hg.nodes.push({
      x: clusterACenter.x + cos(angle) * 70,
      y: clusterACenter.y + sin(angle) * 70,
      r: 10, group: 'A', label: 'A' + (i + 1)
    });
  }
  // Cluster B (right)
  let clusterBCenter = { x: 120, y: 0 };
  for (let i = 0; i < 8; i++) {
    let angle = (i / 8) * TWO_PI;
    hg.nodes.push({
      x: clusterBCenter.x + cos(angle) * 70,
      y: clusterBCenter.y + sin(angle) * 70,
      r: 10, group: 'B', label: 'B' + (i + 1)
    });
  }
  // Bridge node
  hg.nodes.push({ x: 0, y: 0, r: 16, group: 'bridge', label: 'Bridge' });
  let bridgeIdx = 16;
  // Cluster A edges
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      if (Math.random() < 0.5) hg.edges.push([i, j]);
    }
    hg.edges.push([i, bridgeIdx]);
  }
  // Cluster B edges
  for (let i = 8; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      if (Math.random() < 0.5) hg.edges.push([i, j]);
    }
    hg.edges.push([i, bridgeIdx]);
  }
  // Ensure minimum intra-cluster edges
  for (let i = 0; i < 7; i++) hg.edges.push([i, i + 1]);
  for (let i = 8; i < 15; i++) hg.edges.push([i, i + 1]);
  networks.push(hg);

  // 1: Star pattern
  let star = { nodes: [], edges: [] };
  star.nodes.push({ x: 0, y: 0, r: 18, group: 'hub', label: 'Manager' });
  for (let i = 0; i < 12; i++) {
    let angle = (i / 12) * TWO_PI - HALF_PI;
    star.nodes.push({
      x: cos(angle) * 110,
      y: sin(angle) * 110,
      r: 8, group: 'spoke', label: 'E' + (i + 1)
    });
    star.edges.push([0, i + 1]);
  }
  // A couple weak peripheral connections
  star.edges.push([1, 2]);
  star.edges.push([5, 6]);
  networks.push(star);

  // 2: Clique Decay (3 time steps)
  let cd = { nodes: [], edges: [], timeEdges: [[], [], []] };
  for (let i = 0; i < 8; i++) {
    let angle = (i / 8) * TWO_PI;
    cd.nodes.push({
      x: cos(angle) * 80,
      y: sin(angle) * 80,
      r: 10, group: 'clique', label: 'M' + (i + 1)
    });
  }
  // Full clique at t=0
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      cd.timeEdges[0].push([i, j]);
    }
  }
  // Losing edges at t=1
  cd.timeEdges[1] = cd.timeEdges[0].filter(() => Math.random() < 0.7);
  // More loss at t=2
  cd.timeEdges[2] = cd.timeEdges[1].filter(() => Math.random() < 0.6);
  cd.edges = cd.timeEdges[0];
  networks.push(cd);

  // 3: Isolation Drift (3 time steps)
  let iso = { nodes: [], edges: [], timePositions: [[], [], []] };
  // Cluster
  for (let i = 0; i < 10; i++) {
    let angle = (i / 10) * TWO_PI;
    let r = 65 + Math.random() * 20;
    iso.nodes.push({
      x: cos(angle) * r,
      y: sin(angle) * r,
      r: 10, group: 'cluster', label: 'C' + (i + 1)
    });
  }
  // Drifting node
  iso.nodes.push({ x: 0, y: 0, r: 12, group: 'drifter', label: 'Drifter' });
  // Cluster edges
  for (let i = 0; i < 10; i++) {
    for (let j = i + 1; j < 10; j++) {
      if (Math.random() < 0.4) iso.edges.push([i, j]);
    }
    iso.edges.push([i, (i + 1) % 10]);
  }
  // Time positions for drifter
  iso.timePositions[0] = { x: 0, y: 0, edges: [0, 1, 2, 3, 4] };
  iso.timePositions[1] = { x: 80, y: 60, edges: [0, 2] };
  iso.timePositions[2] = { x: 160, y: 100, edges: [] };
  networks.push(iso);
}

function updateCanvasSize() {
  let container = document.getElementById('canvas-container');
  if (container) canvasW = container.offsetWidth;
}

function setup() {
  updateCanvasSize();
  let canvas = createCanvas(canvasW, canvasH);
  canvas.parent('canvas-container');
  textFont('Arial');

  randomSeed(42);
  buildNetworks();

  // Pattern selection buttons
  for (let i = 0; i < PATTERNS.length; i++) {
    let btn = createButton(PATTERNS[i]);
    btn.parent('canvas-container');
    btn.style('font-size', '11px');
    btn.style('padding', '4px 12px');
    btn.style('border', 'none');
    btn.style('border-radius', '4px');
    btn.style('cursor', 'pointer');
    btn.style('font-weight', 'bold');
    btn.mousePressed(() => { activePattern = i; animStep = 0; isPlaying = false; updateStyles(); });
    patternButtons.push(btn);
  }

  // Animation controls (only for patterns 2 and 3)
  playBtn = createButton('\u25B6 Play');
  playBtn.parent('canvas-container');
  playBtn.style('font-size', '11px');
  playBtn.style('padding', '4px 12px');
  playBtn.style('border', 'none');
  playBtn.style('border-radius', '4px');
  playBtn.style('cursor', 'pointer');
  playBtn.style('font-weight', 'bold');
  playBtn.style('margin-left', '20px');
  playBtn.mousePressed(() => {
    if (activePattern >= 2) {
      isPlaying = !isPlaying;
      updateStyles();
    }
  });

  stepBackBtn = createButton('\u25C0 Prev');
  stepBackBtn.parent('canvas-container');
  stepBackBtn.style('font-size', '11px');
  stepBackBtn.style('padding', '4px 10px');
  stepBackBtn.style('border', 'none');
  stepBackBtn.style('border-radius', '4px');
  stepBackBtn.style('cursor', 'pointer');
  stepBackBtn.mousePressed(() => { if (activePattern >= 2) animStep = max(0, animStep - 1); });

  stepFwdBtn = createButton('Next \u25B6');
  stepFwdBtn.parent('canvas-container');
  stepFwdBtn.style('font-size', '11px');
  stepFwdBtn.style('padding', '4px 10px');
  stepFwdBtn.style('border', 'none');
  stepFwdBtn.style('border-radius', '4px');
  stepFwdBtn.style('cursor', 'pointer');
  stepFwdBtn.mousePressed(() => { if (activePattern >= 2) animStep = min(2, animStep + 1); });

  updateStyles();
  positionUI();

  // Auto-advance animation
  setInterval(() => {
    if (isPlaying && activePattern >= 2) {
      animStep = (animStep + 1) % 3;
    }
  }, 1500);
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasW, canvasH);
  positionUI();
}

function positionUI() {
  let startX = 15;
  let y = canvasH + 6;
  for (let btn of patternButtons) {
    btn.position(startX, y);
    startX += btn.elt.offsetWidth + 6;
  }
  playBtn.position(startX + 14, y);
  startX += playBtn.elt.offsetWidth + 24;
  stepBackBtn.position(startX, y);
  startX += stepBackBtn.elt.offsetWidth + 4;
  stepFwdBtn.position(startX, y);
}

function updateStyles() {
  for (let i = 0; i < patternButtons.length; i++) {
    if (i === activePattern) {
      patternButtons[i].style('background', INDIGO);
      patternButtons[i].style('color', 'white');
    } else {
      patternButtons[i].style('background', '#ddd');
      patternButtons[i].style('color', '#333');
    }
  }
  playBtn.style('background', isPlaying ? AMBER : '#ddd');
  playBtn.style('color', isPlaying ? 'white' : '#333');
  playBtn.elt.textContent = isPlaying ? '\u23F8 Pause' : '\u25B6 Play';

  // Show/hide animation controls
  let showAnim = activePattern >= 2;
  playBtn.style('display', showAnim ? 'inline-block' : 'none');
  stepBackBtn.style('display', showAnim ? 'inline-block' : 'none');
  stepFwdBtn.style('display', showAnim ? 'inline-block' : 'none');
}

function draw() {
  background(245);
  drawTitle();

  // Split layout: left = network, right = description
  let splitX = canvasW * 0.55;

  // Left panel
  push();
  let netCX = splitX / 2;
  let netCY = (canvasH - 40) / 2 + 40;
  translate(netCX, netCY);

  if (activePattern === 0) drawHourglass();
  else if (activePattern === 1) drawStar();
  else if (activePattern === 2) drawCliqueDecay();
  else drawIsolationDrift();
  pop();

  // Right panel
  drawDescription(splitX);

  // Time step indicator for animated patterns
  if (activePattern >= 2) {
    drawTimeIndicator();
  }
}

function drawTitle() {
  fill(INDIGO_DARK);
  textSize(15);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('Organizational Network Patterns', 15, 22);
  textStyle(NORMAL);
}

function drawHourglass() {
  let net = networks[0];

  // Draw edges
  stroke(180);
  strokeWeight(1);
  for (let e of net.edges) {
    let a = net.nodes[e[0]];
    let b = net.nodes[e[1]];
    if (a.group === 'bridge' || b.group === 'bridge') {
      stroke(AMBER);
      strokeWeight(2);
    } else {
      stroke(190);
      strokeWeight(1);
    }
    line(a.x, a.y, b.x, b.y);
  }

  // Draw nodes
  for (let n of net.nodes) {
    noStroke();
    if (n.group === 'bridge') {
      // Pulsing bridge node
      let pulse = sin(frameCount * 0.06) * 4;
      fill(GOLD);
      ellipse(n.x, n.y, n.r * 2 + pulse, n.r * 2 + pulse);
      fill(AMBER);
      ellipse(n.x, n.y, n.r * 2 - 4, n.r * 2 - 4);
    } else if (n.group === 'A') {
      fill(INDIGO);
      ellipse(n.x, n.y, n.r * 2, n.r * 2);
    } else {
      fill(INDIGO_LIGHT);
      ellipse(n.x, n.y, n.r * 2, n.r * 2);
    }
  }

  // Labels
  fill(255);
  textSize(7);
  textAlign(CENTER, CENTER);
  noStroke();
  for (let n of net.nodes) {
    if (n.group === 'bridge') {
      fill(255);
      textSize(8);
      textStyle(BOLD);
      text('Bridge', n.x, n.y);
      textStyle(NORMAL);
    }
  }

  // Cluster labels
  fill(INDIGO_DARK);
  textSize(11);
  textStyle(BOLD);
  text('Cluster A', -120, -110);
  text('Cluster B', 120, -110);
  textStyle(NORMAL);
}

function drawStar() {
  let net = networks[1];

  // Draw edges
  stroke(190);
  strokeWeight(1.5);
  for (let e of net.edges) {
    let a = net.nodes[e[0]];
    let b = net.nodes[e[1]];
    if (a.group === 'hub' || b.group === 'hub') {
      stroke(INDIGO_LIGHT);
      strokeWeight(2);
    } else {
      stroke(200);
      strokeWeight(1);
      drawingContext.setLineDash([4, 4]);
    }
    line(a.x, a.y, b.x, b.y);
    drawingContext.setLineDash([]);
  }

  // Draw nodes
  for (let n of net.nodes) {
    noStroke();
    if (n.group === 'hub') {
      fill(INDIGO);
      ellipse(n.x, n.y, n.r * 2, n.r * 2);
      fill(255);
      textSize(8);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text('Hub', n.x, n.y);
      textStyle(NORMAL);
    } else {
      fill(INDIGO_LIGHT);
      ellipse(n.x, n.y, n.r * 2, n.r * 2);
    }
  }
}

function drawCliqueDecay() {
  let net = networks[2];
  let currentEdges = net.timeEdges[animStep];
  let allEdges = net.timeEdges[0];

  // Draw faded edges (lost connections)
  for (let e of allEdges) {
    let inCurrent = currentEdges.some(ce => ce[0] === e[0] && ce[1] === e[1]);
    let a = net.nodes[e[0]];
    let b = net.nodes[e[1]];
    if (!inCurrent) {
      stroke(220);
      strokeWeight(1);
      drawingContext.setLineDash([3, 5]);
      line(a.x, a.y, b.x, b.y);
      drawingContext.setLineDash([]);
    }
  }

  // Draw active edges
  for (let e of currentEdges) {
    let a = net.nodes[e[0]];
    let b = net.nodes[e[1]];
    stroke(INDIGO_LIGHT);
    strokeWeight(2);
    line(a.x, a.y, b.x, b.y);
  }

  // Draw nodes
  for (let n of net.nodes) {
    noStroke();
    fill(INDIGO);
    ellipse(n.x, n.y, n.r * 2, n.r * 2);
  }

  // Density label
  let totalPossible = (net.nodes.length * (net.nodes.length - 1)) / 2;
  let density = currentEdges.length / totalPossible;
  fill(INDIGO_DARK);
  textSize(11);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  text('Density: ' + density.toFixed(2), 0, 110);
  textSize(9);
  textStyle(NORMAL);
  text(currentEdges.length + ' / ' + totalPossible + ' edges', 0, 125);
}

function drawIsolationDrift() {
  let net = networks[3];
  let drifter = net.nodes[10];
  let tp = net.timePositions[animStep];

  // Draw cluster edges
  stroke(190);
  strokeWeight(1);
  for (let e of net.edges) {
    let a = net.nodes[e[0]];
    let b = net.nodes[e[1]];
    line(a.x, a.y, b.x, b.y);
  }

  // Draw drifter edges
  for (let idx of tp.edges) {
    let target = net.nodes[idx];
    stroke(AMBER);
    strokeWeight(2);
    line(tp.x, tp.y, target.x, target.y);
  }

  // Draw trail of previous positions
  for (let s = 0; s < animStep; s++) {
    let prevPos = net.timePositions[s];
    fill(255, 215, 0, 80);
    noStroke();
    ellipse(prevPos.x, prevPos.y, 12, 12);
  }
  // Trail line
  if (animStep > 0) {
    stroke(GOLD);
    strokeWeight(1.5);
    drawingContext.setLineDash([4, 4]);
    for (let s = 0; s < animStep; s++) {
      let p1 = net.timePositions[s];
      let p2 = net.timePositions[s + 1];
      line(p1.x, p1.y, p2.x, p2.y);
    }
    drawingContext.setLineDash([]);
  }

  // Draw cluster nodes
  for (let i = 0; i < 10; i++) {
    noStroke();
    fill(INDIGO);
    ellipse(net.nodes[i].x, net.nodes[i].y, net.nodes[i].r * 2, net.nodes[i].r * 2);
  }

  // Draw drifter
  noStroke();
  let pulse = sin(frameCount * 0.06) * 3;
  fill(GOLD);
  ellipse(tp.x, tp.y, 20 + pulse, 20 + pulse);
  fill(AMBER);
  ellipse(tp.x, tp.y, 16, 16);
  fill(255);
  textSize(7);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text('D', tp.x, tp.y);
  textStyle(NORMAL);

  // Connection count
  fill(INDIGO_DARK);
  textSize(11);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  text('Connections: ' + tp.edges.length, 0, 120);
  textStyle(NORMAL);
}

function drawDescription(splitX) {
  let desc = descriptions[activePattern];
  let px = splitX + 10;
  let py = 45;
  let pw = canvasW - splitX - 25;

  // Background
  fill(255);
  noStroke();
  rect(px, py, pw, canvasH - py - 50, 8);

  // Title
  fill(INDIGO_DARK);
  textSize(13);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text(desc.title, px + 12, py + 12);

  // Description
  textSize(10);
  textStyle(NORMAL);
  fill('#333');
  let ty = py + 32;
  ty = drawWrapped(desc.text, px + 12, ty, pw - 24);

  // Detection
  ty += 16;
  fill(INDIGO);
  textSize(11);
  textStyle(BOLD);
  text('Detection', px + 12, ty);
  ty += 16;
  fill('#444');
  textSize(10);
  textStyle(NORMAL);
  ty = drawWrapped(desc.detection, px + 12, ty, pw - 24);

  // Business Impact
  ty += 16;
  fill(AMBER_DARK);
  textSize(11);
  textStyle(BOLD);
  text('Business Impact', px + 12, ty);
  ty += 16;
  fill('#444');
  textSize(10);
  textStyle(NORMAL);
  ty = drawWrapped(desc.impact, px + 12, ty, pw - 24);
}

function drawWrapped(str, x, y, maxW) {
  let words = str.split(' ');
  let line = '';
  let lineH = 14;
  let cy = y;
  for (let w of words) {
    let test = line ? line + ' ' + w : w;
    if (textWidth(test) > maxW && line) {
      text(line, x, cy);
      cy += lineH;
      line = w;
    } else {
      line = test;
    }
  }
  if (line) { text(line, x, cy); cy += lineH; }
  return cy;
}

function drawTimeIndicator() {
  let labels = ['Period 1', 'Period 2', 'Period 3'];
  let y = canvasH - 40;
  let cx = canvasW * 0.55 / 2;

  for (let i = 0; i < 3; i++) {
    let x = cx - 80 + i * 80;
    if (i === animStep) {
      fill(INDIGO);
      noStroke();
      rect(x - 30, y, 60, 20, 4);
      fill(255);
    } else {
      fill(230);
      noStroke();
      rect(x - 30, y, 60, 20, 4);
      fill('#666');
    }
    textSize(9);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text(labels[i], x, y + 10);
  }
  textStyle(NORMAL);

  // Connecting line
  stroke(180);
  strokeWeight(1);
  line(cx - 80 + 30, y + 10, cx + 80 - 30, y + 10);
  noStroke();
}
