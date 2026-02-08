// Normalization and Enrichment Pipeline MicroSim
// Shows the multi-stage pipeline that transforms raw events into graph-ready records
// Built-in p5.js controls
// MicroSim template version 2026.02

let canvasWidth = 400;
let drawHeight = 440;
let controlHeight = 45;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;

// Pipeline stages
let stages = [
  {
    label: 'Raw Sources',
    shortLabel: 'Raw',
    color: '#D4880F',
    icon: 'sources',
    description: 'Events arrive from diverse systems in different formats',
    details: [
      'Email: MessageSent, from: m.chen',
      'Slack: message_posted, user: U03B7',
      'Calendar: event.created, organizer: chen',
      'Badge: door_access, id: 4471',
      'Jira: issue_updated, assignee: chen'
    ],
    sample: '{"type":"message",\n "user":"U03B7K9QP",\n "ts":"1742047622"}'
  },
  {
    label: 'Normalization',
    shortLabel: 'Norm',
    color: '#303F9F',
    icon: 'normalize',
    description: 'Transform raw events to a consistent schema',
    details: [
      'Field Mapping: sender → actor',
      'Timestamp: Unix → ISO 8601 UTC',
      'Action Vocab: message_posted → CHAT_SEND',
      'Identity: U03B7 → EMP-00147',
      'Schema: Unified base fields + metadata'
    ],
    sample: '{"event_id":"CHAT-...",\n "timestamp":"2026-03-15T...",\n "actor":"EMP-00147",\n "action":"CHAT_SEND"}'
  },
  {
    label: 'Enrichment',
    shortLabel: 'Enrich',
    color: '#303F9F',
    icon: 'enrich',
    description: 'Add organizational and temporal context',
    details: [
      'Org Context: dept, team, manager',
      'Temporal: day_of_week, business_hours',
      'Relationship: cross_departmental?',
      'History: interaction_count_30d',
      'Content: sentiment, topic, urgency'
    ],
    sample: '{"enrichment":{\n "actor_dept":"Engineering",\n "cross_dept": true,\n "interaction_count": 23}}'
  },
  {
    label: 'Graph-Ready',
    shortLabel: 'Graph',
    color: '#B8860B',
    icon: 'graph',
    description: 'Enriched events become nodes and edges',
    details: [
      'Actors → Person nodes',
      'Interactions → COMMUNICATED edges',
      'Properties → edge attributes',
      'Timestamps → temporal ordering',
      'Context → relationship metadata'
    ],
    sample: '(EMP-00147)-[:CHAT_SEND\n {count:23, cross_dept:true}]\n ->(CHANNEL-engineering)'
  }
];

// Animation state
let animating = false;
let animPhase = 0; // 0 to stages.length
let animSpeed = 0.015;
let eventTokens = [];

// Interaction state
let expandedStage = -1; // which stage detail is showing
let hoveredStage = -1;

// Controls
let playButton;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  playButton = createButton('▶ Animate');
  playButton.position(canvasWidth / 2 - 50, drawHeight + 8);
  playButton.mousePressed(toggleAnimation);
  playButton.style('font-size', '14px');
  playButton.style('padding', '5px 20px');
  playButton.style('border-radius', '6px');
  playButton.style('cursor', 'pointer');
  playButton.style('background-color', '#303F9F');
  playButton.style('color', 'white');
  playButton.style('border', '1px solid #303F9F');
  playButton.style('font-weight', 'bold');

  // Initialize event tokens
  resetTokens();

  describe('Interactive pipeline diagram showing how raw events are normalized, enriched, and prepared for graph loading. Click stages to see details, or animate the flow.', LABEL);
}

function resetTokens() {
  eventTokens = [
    { x: 0, color: '#303F9F', label: 'Email', stage: 0 },
    { x: 0, color: '#D4880F', label: 'Chat', stage: 0 },
    { x: 0, color: '#B8860B', label: 'Calendar', stage: 0 }
  ];
}

function toggleAnimation() {
  animating = !animating;
  if (animating) {
    animPhase = 0;
    resetTokens();
    playButton.html('⏸ Pause');
    expandedStage = -1;
  } else {
    playButton.html('▶ Animate');
  }
}

function draw() {
  updateCanvasSize();

  // Background
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);

  // Control area
  fill('white');
  stroke('silver');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(18);
  text('Normalization & Enrichment Pipeline', canvasWidth / 2, 8);

  // Pipeline layout
  let pipeY = 55;
  let stageW = (canvasWidth - margin * 2 - 30) / stages.length;
  let stageH = 60;
  let arrowGap = 10;

  hoveredStage = -1;

  // Draw stages
  for (let i = 0; i < stages.length; i++) {
    let sx = margin + i * (stageW + arrowGap);
    let sy = pipeY;
    let stage = stages[i];

    // Check hover
    let isHovered = mouseX > sx && mouseX < sx + stageW &&
                    mouseY > sy && mouseY < sy + stageH;
    if (isHovered) hoveredStage = i;
    let isExpanded = expandedStage === i;

    // Stage box
    stroke(stage.color);
    strokeWeight(isHovered || isExpanded ? 3 : 2);
    fill(isHovered ? lerpColor(color(stage.color), color(255), 0.85) : 'white');
    rect(sx, sy, stageW, stageH, 8);

    // Stage label
    noStroke();
    fill(stage.color);
    textAlign(CENTER, CENTER);
    textSize(stageW > 100 ? 12 : 10);
    textStyle(BOLD);
    text(stageW > 100 ? stage.label : stage.shortLabel, sx + stageW / 2, sy + stageH / 2 - 8);

    // Stage icon
    textStyle(NORMAL);
    textSize(18);
    let icons = ['📧', '⚙️', '➕', '🔗'];
    text(icons[i], sx + stageW / 2, sy + stageH / 2 + 12);

    textStyle(NORMAL);

    // Draw arrow between stages
    if (i < stages.length - 1) {
      let arrowX = sx + stageW + 2;
      let arrowY = sy + stageH / 2;
      stroke('#999');
      strokeWeight(2);
      line(arrowX, arrowY, arrowX + arrowGap - 4, arrowY);
      // Arrowhead
      fill('#999');
      noStroke();
      triangle(arrowX + arrowGap - 4, arrowY - 4, arrowX + arrowGap - 4, arrowY + 4, arrowX + arrowGap, arrowY);
    }
  }

  // Draw expanded detail panel
  if (expandedStage >= 0) {
    let stage = stages[expandedStage];
    let panelY = pipeY + stageH + 15;
    let panelH = 150;
    let panelW = canvasWidth - margin * 2;

    fill(255, 255, 255, 240);
    stroke(stage.color);
    strokeWeight(2);
    rect(margin, panelY, panelW, panelH, 8);

    noStroke();
    fill(stage.color);
    textAlign(LEFT, TOP);
    textSize(13);
    textStyle(BOLD);
    text(stage.label, margin + 10, panelY + 8);

    textStyle(NORMAL);
    fill('#333');
    textSize(12);
    text(stage.description, margin + 10, panelY + 26);

    // Details list
    textSize(11);
    for (let j = 0; j < stage.details.length; j++) {
      fill(stage.color);
      text('•', margin + 12, panelY + 45 + j * 16);
      fill('#444');
      text(stage.details[j], margin + 22, panelY + 45 + j * 16);
    }

    // Sample data
    let sampleX = margin + panelW / 2 + 10;
    if (panelW > 400) {
      fill('#f5f5f5');
      stroke('#ddd');
      strokeWeight(1);
      rect(sampleX, panelY + 30, panelW / 2 - 20, panelH - 40, 4);
      noStroke();
      fill('#666');
      textSize(10);
      textAlign(LEFT, TOP);
      let sampleLines = stage.sample.split('\n');
      for (let k = 0; k < sampleLines.length; k++) {
        text(sampleLines[k], sampleX + 8, panelY + 38 + k * 14);
      }
    }
  }

  // Draw event tokens during animation
  if (animating) {
    animPhase += animSpeed;

    let tokenY = pipeY + stageH + (expandedStage >= 0 ? 175 : 20);
    let pipeStartX = margin + stageW / 2;
    let pipeEndX = margin + (stages.length - 1) * (stageW + arrowGap) + stageW / 2;
    let pipeLength = pipeEndX - pipeStartX;

    // Draw token track
    stroke('#ddd');
    strokeWeight(3);
    line(pipeStartX, tokenY, pipeEndX, tokenY);

    // Draw stage markers on track
    for (let i = 0; i < stages.length; i++) {
      let mx = pipeStartX + i * pipeLength / (stages.length - 1);
      fill(stages[i].color);
      noStroke();
      ellipse(mx, tokenY, 8, 8);
    }

    // Animate tokens with staggered delays
    for (let t = 0; t < eventTokens.length; t++) {
      let token = eventTokens[t];
      let tokenPhase = animPhase - t * 0.15; // Staggered
      if (tokenPhase < 0) tokenPhase = 0;
      if (tokenPhase > 1) tokenPhase = 1;

      let tx = pipeStartX + tokenPhase * pipeLength;
      fill(token.color);
      noStroke();
      ellipse(tx, tokenY - 10 - t * 14, 12, 12);
      fill('#333');
      textSize(10);
      textAlign(LEFT, CENTER);
      noStroke();
      text(token.label, tx + 10, tokenY - 10 - t * 14);
    }

    // Reset when done
    if (animPhase > 1.5) {
      animPhase = 0;
      resetTokens();
    }
  }

  // Instruction text at bottom
  noStroke();
  fill('#777');
  textSize(11);
  textAlign(CENTER, BOTTOM);
  text('Click a stage to see details', canvasWidth / 2, drawHeight - 5);
}

function mousePressed() {
  // Check stage clicks
  let stageW = (canvasWidth - margin * 2 - 30) / stages.length;
  let arrowGap = 10;
  let pipeY = 55;
  let stageH = 60;

  for (let i = 0; i < stages.length; i++) {
    let sx = margin + i * (stageW + arrowGap);
    if (mouseX > sx && mouseX < sx + stageW &&
        mouseY > pipeY && mouseY < pipeY + stageH) {
      expandedStage = expandedStage === i ? -1 : i;
      break;
    }
  }
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  playButton.position(canvasWidth / 2 - 50, drawHeight + 8);
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
}
