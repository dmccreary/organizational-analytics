// Complete Organizational Graph Schema - vis-network MicroSim
// A meta-model: each box is a node TYPE (label) and each arrow is an edge TYPE.
// CANVAS_HEIGHT: 600
//
// Interactions:
//   hover a node type  -> highlight every edge type connected to it
//   hover an edge type -> tooltip + details panel list its properties
//   click a node type  -> sample Cypher CREATE statement
//   question picker    -> highlight the parts of the schema that answer it

// ===========================================
// ARIA COLOR SCHEME
// ===========================================
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const AMBER_LIGHT = '#F5C14B';
const GOLD = '#FFD700';
const GOLD_DARK = '#B8960B';
const CHAMPAGNE = '#FFF8E7';
const EDGE_COLOR = '#444444';
const FOCUS_COLOR = '#D4880F';

// ===========================================
// NODE TYPES
// Purposes, key properties and CREATE statements follow the chapter text.
// ===========================================
const nodeTypes = [
    {
        id: 'Employee', x: 0, y: 0, bg: AMBER, border: AMBER_DARK, font: '#FFFFFF', size: 17,
        purpose: 'People in the organization',
        keyProps: 'employee_id, name, email, hire_date, status',
        value: 'The hub of the model. Ten of the thirteen edge types start or end here, so almost every analytics question passes through this node.',
        cypher: "CREATE (e:Employee {\n  employee_id: 'EMP-10042',\n  first_name: 'Maria',\n  last_name: 'Chen',\n  email: 'maria.chen@acme.com',\n  hire_date: date('2021-03-15'),\n  status: 'active'\n})"
    },
    {
        id: 'Organization', x: -205, y: -235, bg: INDIGO, border: INDIGO_DARK, font: '#FFFFFF', size: 14,
        purpose: 'Top-level company entity',
        keyProps: 'org_id, name, industry, headquarters',
        value: 'The root of the hierarchy. With more than one Organization node you can compare companies during mergers or across subsidiaries.',
        cypher: "CREATE (org:Organization {\n  org_id: 'ORG-001',\n  name: 'Acme Corporation',\n  industry: 'Technology',\n  founded: date('1998-06-01'),\n  headquarters: 'San Francisco',\n  employee_count: 4500\n})"
    },
    {
        id: 'Division', x: -205, y: -128, bg: INDIGO_LIGHT, border: INDIGO, font: '#FFFFFF', size: 14,
        purpose: 'Mid-level grouping',
        keyProps: 'name, leader',
        value: 'Lets you roll departments up into larger units and compare hierarchy depth across the business.',
        cypher: "CREATE (techDiv:Division {\n  name: 'Technology'\n})"
    },
    {
        id: 'Department', x: -205, y: -14, bg: INDIGO_LIGHT, border: INDIGO, font: '#FFFFFF', size: 14,
        purpose: 'Functional team unit',
        keyProps: 'dept_id, name, budget, headcount',
        value: 'Needed for every cross-department question: silos, bridges between teams, and collaboration across functions.',
        cypher: "CREATE (eng:Department {\n  dept_id: 'DEPT-ENG',\n  name: 'Engineering',\n  budget: 2400000,\n  headcount: 85,\n  created_date: date('1998-06-01')\n})"
    },
    {
        id: 'Position', x: 0, y: -215, bg: GOLD, border: GOLD_DARK, font: '#222222', size: 14,
        purpose: 'Role definition with level',
        keyProps: 'position_id, title, level, salary_band',
        value: 'A separate node with dated edges keeps the history of who held which role, so you can track career movement.',
        cypher: "CREATE (p:Position {\n  position_id: 'POS-SE-3',\n  title: 'Senior Engineer',\n  level: 'IC-3',\n  department: 'Engineering',\n  salary_band: 'Band-7',\n  is_management: false\n})"
    },
    {
        id: 'Project', x: 205, y: -118, bg: AMBER_DARK, border: '#7A4A00', font: '#FFFFFF', size: 14,
        purpose: 'Work initiative',
        keyProps: 'project_id, name, status, priority, budget',
        value: 'Shows which people from which departments come together to deliver work, beyond what the org chart shows.',
        cypher: "CREATE (proj:Project {\n  project_id: 'PROJ-2025-CLOUD',\n  name: 'Cloud Migration',\n  status: 'active',\n  start_date: date('2024-01-15'),\n  priority: 'high',\n  budget: 850000\n})"
    },
    {
        id: 'Task', x: 205, y: 12, bg: AMBER_LIGHT, border: AMBER, font: '#222222', size: 14,
        purpose: 'Individual work item',
        keyProps: 'task_id, name, status, estimated_hours',
        value: 'Adds fine-grained detail for workload analysis, dependency tracking, and sprint planning.',
        cypher: "CREATE (task:Task {\n  task_id: 'TASK-4521',\n  name: 'Migrate Auth Service',\n  status: 'in_progress',\n  estimated_hours: 40,\n  actual_hours: 28\n})"
    },
    {
        id: 'License', x: -190, y: 150, bg: CHAMPAGNE, border: INDIGO, font: '#222222', size: 14,
        purpose: 'Software or certification',
        keyProps: 'license_id, software, annual_cost, vendor',
        value: 'Supports cost management and compliance, such as finding tools that are paid for but rarely used.',
        cypher: "CREATE (lic:License {\n  license_id: 'LIC-JIRA-2025',\n  software: 'Jira',\n  type: 'professional',\n  annual_cost: 150.00,\n  vendor: 'Atlassian'\n})"
    },
    {
        id: 'OnboardingProcess', x: -62, y: 225, bg: CHAMPAGNE, border: AMBER, font: '#222222', size: 14,
        purpose: 'New hire integration',
        keyProps: 'onboarding_id, start_date, status',
        value: 'Reveals how long onboarding takes, which steps are bottlenecks, and how quickly new hires build their networks.',
        cypher: "CREATE (onb:OnboardingProcess {\n  onboarding_id: 'ONB-2025-0042',\n  employee_id: 'EMP-10042',\n  start_date: date('2021-03-15'),\n  target_completion:\n    date('2021-04-15'),\n  status: 'completed'\n})"
    },
    {
        id: 'ActivityType', x: 212, y: 232, bg: CHAMPAGNE, border: GOLD_DARK, font: '#222222', size: 14,
        purpose: 'Classification of interactions',
        keyProps: 'type_id, name, category',
        value: 'Lets you segment interactions, for example collaborative versus administrative work.',
        cypher: "CREATE (at:ActivityType {\n  type_id: 'ACT-CODE-REVIEW',\n  name: 'Code Review',\n  category: 'collaboration',\n  department_scope: 'Engineering'\n})"
    },
    {
        id: 'Event', x: 48, y: 172, bg: '#FFFFFF', border: '#777777', font: '#222222', size: 14, dashed: true,
        purpose: 'A communication event (:CommunicationEvent). It is not one of the ten core node types; it appears here as the source of CLASSIFIED_AS.',
        keyProps: 'event_id',
        value: 'Event nodes hold individual interactions when you model at the event level. Classifying them makes every interaction comparable by type.',
        cypher: "MATCH (event:CommunicationEvent\n    {event_id: 'EVT-99201'}),\n  (actType:ActivityType\n    {type_id: 'ACT-CODE-REVIEW'})\nCREATE (event)\n  -[:CLASSIFIED_AS]->(actType)"
    }
];

const nodeTypeById = {};
nodeTypes.forEach(n => { nodeTypeById[n.id] = n; });

// ===========================================
// EDGE TYPES
// Properties follow the chapter's Edge Types Summary table.
// The three Employee-to-Employee edge types are drawn as "petals": a loop
// that leaves Employee, passes through a label, and returns to Employee.
// ===========================================
const edgeTypes = [
    { id: 'WORKS_IN', type: 'WORKS_IN', from: 'Employee', to: 'Department', props: 'since',
      value: 'Places each person in a unit. Required for any comparison between departments.',
      smooth: { type: 'curvedCW', roundness: 0.22 } },
    { id: 'HEADED_BY', type: 'HEADED_BY', from: 'Department', to: 'Employee', props: 'appointed_date',
      value: 'Records who leads each department.',
      smooth: { type: 'curvedCW', roundness: 0.22 } },
    { id: 'REPORTS_TO', type: 'REPORTS_TO', from: 'Employee', to: 'Employee', props: 'since, type (solid / dotted)',
      value: 'Formal reporting lines, including dotted-line and matrix reporting.',
      petal: { x: -118, y: -112 } },
    { id: 'COMMUNICATES_WITH', type: 'COMMUNICATES_WITH', from: 'Employee', to: 'Employee', props: 'channel, frequency, message_count',
      value: 'Shows how the organization actually operates: who talks to whom, how often, and through which channel.',
      petal: { x: 98, y: -152 } },
    { id: 'MENTORED_BY', type: 'MENTORED_BY', from: 'Employee', to: 'Employee', props: 'start_date, context',
      value: 'Captures mentoring relationships, such as those created during onboarding.',
      petal: { x: 112, y: 98 } },
    { id: 'HOLDS_POSITION', type: 'HOLDS_POSITION', from: 'Employee', to: 'Position', props: 'start_date, end_date, is_current',
      value: 'Dated edges build a career history: one edge for each position a person has held.' },
    { id: 'WORKS_ON', type: 'WORKS_ON', from: 'Employee', to: 'Project', props: 'role, allocation, start_date',
      value: 'Summing allocation across projects detects over-allocation, a common precursor to burnout.' },
    { id: 'ASSIGNED_TO', type: 'ASSIGNED_TO', from: 'Employee', to: 'Task', props: 'assigned_date, role',
      value: 'Connects people to specific pieces of work for detailed workload analysis.' },
    { id: 'HOLDS_LICENSE', type: 'HOLDS_LICENSE', from: 'Employee', to: 'License', props: 'assigned_date, expiry_date, usage_frequency',
      value: 'Usage properties on the edge expose licenses that are paid for but rarely used.' },
    { id: 'UNDERWENT', type: 'UNDERWENT', from: 'Employee', to: 'OnboardingProcess', props: '(none)',
      value: 'Links a new hire to the onboarding process they went through.' },
    { id: 'PART_OF_1', type: 'PART_OF', from: 'Department', to: 'Division', props: '(none)',
      value: 'Builds the hierarchy tree. Traverse up to find parents, or down to find everything in a unit.' },
    { id: 'PART_OF_2', type: 'PART_OF', from: 'Division', to: 'Organization', props: '(none)',
      value: 'Builds the hierarchy tree. Traverse up to find parents, or down to find everything in a unit.' },
    { id: 'BELONGS_TO', type: 'BELONGS_TO', from: 'Task', to: 'Project', props: '(none)',
      value: 'Rolls individual tasks up into the project they are part of.' },
    { id: 'CLASSIFIED_AS', type: 'CLASSIFIED_AS', from: 'Event', to: 'ActivityType', props: '(none)',
      value: 'Adds a classification layer so interactions can be compared by kind.' }
];

const edgeTypeById = {};
edgeTypes.forEach(e => { edgeTypeById[e.id] = e; });

// ===========================================
// ASSESSMENT QUESTIONS
// Each question names the node types and edge types needed to answer it.
// ===========================================
const questions = [
    { text: 'Which licenses are paid for but rarely used?',
      nodes: ['Employee', 'License'], edges: ['HOLDS_LICENSE'],
      why: 'Compare <code>annual_cost</code> on License with <code>usage_frequency</code> on the HOLDS_LICENSE edge.' },
    { text: 'Who is over-allocated across projects?',
      nodes: ['Employee', 'Project'], edges: ['WORKS_ON'],
      why: 'Sum the <code>allocation</code> property on each employee’s WORKS_ON edges. A total above 1.0 signals over-allocation.' },
    { text: 'Which departments roll up into each division?',
      nodes: ['Department', 'Division', 'Organization'], edges: ['PART_OF_1', 'PART_OF_2'],
      why: 'Follow PART_OF edges up or down the hierarchy. No Employee nodes are needed.' },
    { text: 'Who communicates daily across departments?',
      nodes: ['Employee', 'Department'], edges: ['COMMUNICATES_WITH', 'WORKS_IN'],
      why: 'Filter COMMUNICATES_WITH on <code>frequency</code>, then use WORKS_IN to check that the two people are in different departments.' },
    { text: 'Who has changed roles, and when?',
      nodes: ['Employee', 'Position'], edges: ['HOLDS_POSITION'],
      why: 'Each HOLDS_POSITION edge carries <code>start_date</code> and <code>end_date</code>, so a chain of edges is a career history.' },
    { text: 'Do mentored new hires build networks faster?',
      nodes: ['Employee', 'OnboardingProcess'], edges: ['UNDERWENT', 'MENTORED_BY', 'COMMUNICATES_WITH'],
      why: 'Combine onboarding dates, MENTORED_BY edges, and the growth of each new hire’s COMMUNICATES_WITH edges.' },
    { text: 'What share of interactions is collaborative?',
      nodes: ['Event', 'ActivityType'], edges: ['CLASSIFIED_AS'],
      why: 'Count events grouped by the <code>category</code> of the ActivityType they are CLASSIFIED_AS.' }
];

// ===========================================
// LEGEND + QUESTION PICKER
// ===========================================
const legendContent = document.getElementById('legend-content');
nodeTypes.forEach(n => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    const chip = document.createElement('span');
    chip.className = 'legend-chip';
    chip.style.backgroundColor = n.bg;
    chip.style.borderColor = n.border;
    if (n.dashed) chip.style.borderStyle = 'dashed';
    const label = document.createElement('span');
    label.textContent = (n.id === 'OnboardingProcess') ? 'Onboarding' : n.id;
    item.appendChild(chip);
    item.appendChild(label);
    legendContent.appendChild(item);
});

const questionSelect = document.getElementById('question-select');
const blank = document.createElement('option');
blank.value = '';
blank.textContent = 'Choose a question...';
questionSelect.appendChild(blank);
questions.forEach((q, i) => {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = q.text;
    questionSelect.appendChild(option);
});

// ===========================================
// VIS-NETWORK DATASETS
// ===========================================
function edgeTooltip(e) {
    const div = document.createElement('div');
    div.innerHTML = '<b>:' + e.type + '</b><br>(' + e.from + ') &rarr; (' + e.to + ')<br>Properties: ' + e.props;
    return div;
}

const nodes = new vis.DataSet(nodeTypes.map(n => ({
    id: n.id,
    label: n.id,
    x: n.x,
    y: n.y,
    fixed: true,
    shape: 'box',
    shapeProperties: { borderRadius: 8, borderDashes: n.dashed ? [5, 4] : false },
    margin: (n.id === 'Employee') ? 11 : 9,
    borderWidth: 2,
    color: {
        background: n.bg, border: n.border,
        highlight: { background: n.bg, border: n.border },
        hover: { background: n.bg, border: n.border }
    },
    font: { color: n.font, size: n.size, face: 'Arial', bold: true },
    shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', size: 5, x: 2, y: 2 }
})));

const EDGE_FONT = { size: 12, strokeWidth: 0, background: '#F0F8FF', align: 'horizontal' };

function edgeFont(colorValue) {
    return Object.assign({ color: colorValue }, EDGE_FONT);
}

// One edge type normally becomes one vis edge. A petal becomes a label node
// plus two vis edges (out to the label, and back to Employee with the arrow).
function visEdgesFor(e) {
    const common = {
        title: edgeTooltip(e),
        width: 1.8,
        hoverWidth: 0,
        color: { color: EDGE_COLOR, highlight: EDGE_COLOR, hover: FOCUS_COLOR, opacity: 1 }
    };
    if (e.petal) {
        const labelId = 'label:' + e.id;
        const curve = { enabled: true, type: 'curvedCW', roundness: 0.32 };
        return [
            Object.assign({ id: e.id + '#out', from: e.from, to: labelId, arrows: { to: { enabled: false } }, smooth: curve }, common),
            Object.assign({ id: e.id + '#back', from: labelId, to: e.to, arrows: { to: { enabled: true, scaleFactor: 0.85 } }, smooth: curve }, common)
        ];
    }
    return [Object.assign({
        id: e.id,
        from: e.from,
        to: e.to,
        label: e.type,
        font: edgeFont('#222222'),
        arrows: { to: { enabled: true, scaleFactor: 0.85 } },
        smooth: e.smooth ? Object.assign({ enabled: true }, e.smooth) : false
    }, common)];
}

// Map every vis edge id (and petal label node id) back to its edge type id
const edgeTypeOfVisId = {};
const visEdgeList = [];
edgeTypes.forEach(e => {
    visEdgesFor(e).forEach(v => {
        edgeTypeOfVisId[v.id] = e.id;
        visEdgeList.push(v);
    });
    if (e.petal) {
        edgeTypeOfVisId['label:' + e.id] = e.id;
        nodes.add({
            id: 'label:' + e.id,
            label: e.type,
            title: edgeTooltip(e),
            x: e.petal.x,
            y: e.petal.y,
            fixed: true,
            shape: 'box',
            margin: 2,
            borderWidth: 0,
            color: {
                background: '#F0F8FF', border: '#F0F8FF',
                highlight: { background: '#F0F8FF', border: '#F0F8FF' },
                hover: { background: '#F0F8FF', border: '#F0F8FF' }
            },
            font: { color: '#222222', size: 12, face: 'Arial' },
            shadow: false
        });
    }
});

const edges = new vis.DataSet(visEdgeList);

// ===========================================
// NETWORK
// ===========================================
function isInIframe() {
    try {
        return window.self !== window.top;
    } catch (err) {
        return true;
    }
}

const enableMouseInteraction = !isInIframe();

const options = {
    physics: { enabled: false },
    interaction: {
        hover: true,
        tooltipDelay: 150,
        dragNodes: false,
        selectConnectedEdges: false,
        zoomView: enableMouseInteraction,   // never hijack page scrolling inside an iframe
        dragView: enableMouseInteraction,
        navigationButtons: true
    }
};

const network = new vis.Network(document.getElementById('network'), { nodes: nodes, edges: edges }, options);

function fitView() {
    network.fit({ animation: false });
    // Narrow (stacked) layout: the title is hidden and the diagram is shrunk a
    // little more so the bottom row sits above the navigation buttons.
    const narrow = window.innerWidth <= 540;
    // the cap keeps the bottom row clear of the navigation buttons on wide screens
    const scale = Math.min(network.getScale() * (narrow ? 0.86 : 0.97), 0.93);
    const pos = network.getViewPosition();
    network.moveTo({
        position: { x: pos.x, y: pos.y + (narrow ? 34 : 22) / scale },   // camera down = diagram up
        scale: scale,
        animation: false
    });
}

network.once('afterDrawing', fitView);
window.addEventListener('resize', function () {
    network.redraw();
    fitView();
});

// ===========================================
// HIGHLIGHT STATE
// ===========================================
let hoveredNode = null;
let hoveredEdge = null;
let selectedNode = null;        // clicked node type (shows its CREATE statement)
let activeQuestion = null;      // index into questions, or null

// Work out which node and edge ids are "in focus". Null means everything is.
function currentFocus() {
    if (hoveredNode) {
        const connected = edgeTypes.filter(e => e.from === hoveredNode || e.to === hoveredNode);
        const nodeIds = [hoveredNode];
        connected.forEach(e => { nodeIds.push(e.from); nodeIds.push(e.to); });
        return { nodes: nodeIds, edges: connected.map(e => e.id) };
    }
    if (hoveredEdge) {
        const e = edgeTypeById[hoveredEdge];
        return { nodes: [e.from, e.to], edges: [e.id] };
    }
    if (activeQuestion !== null) {
        const q = questions[activeQuestion];
        return { nodes: q.nodes, edges: q.edges };
    }
    return null;
}

function applyHighlights() {
    const focus = currentFocus();

    nodes.update(nodeTypes.map(n => {
        const inFocus = !focus || focus.nodes.includes(n.id);
        let borderWidth = 2;
        if (n.id === selectedNode) borderWidth = 5;
        if (n.id === hoveredNode) borderWidth = 5;
        return { id: n.id, opacity: inFocus ? 1 : 0.22, borderWidth: borderWidth };
    }));

    const edgeUpdates = [];
    const labelUpdates = [];
    edgeTypes.forEach(e => {
        const inFocus = !focus || focus.edges.includes(e.id);
        const emphasized = focus && inFocus;
        const color = emphasized ? FOCUS_COLOR : EDGE_COLOR;
        const fontColor = inFocus ? '#222222' : '#BBBBBB';
        const style = {
            width: emphasized ? 3.5 : 1.8,
            color: { color: color, highlight: color, hover: FOCUS_COLOR, opacity: inFocus ? 1 : 0.15 }
        };
        if (e.petal) {
            edgeUpdates.push(Object.assign({ id: e.id + '#out' }, style));
            edgeUpdates.push(Object.assign({ id: e.id + '#back' }, style));
            labelUpdates.push({
                id: 'label:' + e.id,
                font: { color: fontColor, size: 12, face: 'Arial' }
            });
        } else {
            edgeUpdates.push(Object.assign({ id: e.id, font: edgeFont(fontColor) }, style));
        }
    });
    edges.update(edgeUpdates);
    nodes.update(labelUpdates);
}

// ===========================================
// DETAILS PANEL
// ===========================================
const detailsContent = document.getElementById('details-content');

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showDefaultDetails() {
    detailsContent.innerHTML =
        '<div class="details-prompt">' +
        '<p>This is a <b>schema</b>: each box is a node <i>type</i> and each arrow is an edge <i>type</i>.</p>' +
        '<p><b>Hover</b> a node type to highlight its edges.</p>' +
        '<p><b>Hover</b> an edge to see its properties.</p>' +
        '<p><b>Click</b> a node type for a sample <code class="detail-mono">CREATE</code> statement.</p>' +
        '<p>Then pick a question above and judge which parts of the schema earn their place.</p>' +
        '</div>';
}

function connectedEdgeNames(nodeId) {
    const names = [];
    edgeTypes.forEach(e => {
        if ((e.from === nodeId || e.to === nodeId) && !names.includes(e.type)) names.push(e.type);
    });
    return names;
}

function showNodeDetails(nodeId, withCypher) {
    const n = nodeTypeById[nodeId];
    const names = connectedEdgeNames(nodeId);
    let html =
        '<span class="detail-type">Node type</span>' +
        '<div class="detail-name">:' + n.id + '</div>' +
        '<div class="detail-text">' + n.purpose + '</div>' +
        '<div class="detail-label">Key properties</div>' +
        '<div class="detail-mono">' + n.keyProps + '</div>' +
        '<div class="detail-label">Why it earns its place</div>' +
        '<div class="detail-text">' + n.value + '</div>';
    if (withCypher) {
        html += '<div class="detail-label">Sample Cypher</div>' +
            '<div class="detail-cypher">' + escapeHtml(n.cypher) + '</div>';
    } else {
        html += '<div class="detail-label">Edge types (' + names.length + ')</div>' +
            '<div class="detail-mono">' + names.join(', ') + '</div>' +
            '<div class="detail-hint">Click for a sample CREATE statement.</div>';
    }
    detailsContent.innerHTML = html;
}

function showEdgeDetails(edgeId) {
    const e = edgeTypeById[edgeId];
    detailsContent.innerHTML =
        '<span class="detail-type edge">Edge type</span>' +
        '<div class="detail-name">:' + e.type + '</div>' +
        '<div class="detail-mono">(:' + e.from + ')-[:' + e.type + ']-&gt;(:' + e.to + ')</div>' +
        '<div class="detail-label">Key properties</div>' +
        '<div class="detail-mono">' + e.props + '</div>' +
        '<div class="detail-label">Why it earns its place</div>' +
        '<div class="detail-text">' + e.value + '</div>';
}

function showQuestionDetails(index) {
    const q = questions[index];
    const edgeNames = [];
    q.edges.forEach(id => {
        const type = edgeTypeById[id].type;
        if (!edgeNames.includes(type)) edgeNames.push(type);
    });
    detailsContent.innerHTML =
        '<span class="detail-type question">Question</span>' +
        '<div class="detail-name plain">' + q.text + '</div>' +
        '<div class="detail-label">Node types needed (' + q.nodes.length + ' of 10)</div>' +
        '<div class="detail-mono">' + q.nodes.join(', ') + '</div>' +
        '<div class="detail-label">Edge types needed (' + edgeNames.length + ' of 13)</div>' +
        '<div class="detail-mono">' + edgeNames.join(', ') + '</div>' +
        '<div class="detail-label">How</div>' +
        '<div class="detail-text">' + q.why + '</div>' +
        '<div class="detail-hint">Everything dimmed is not needed for this question. Would you still model it?</div>';
}

function refreshDetails() {
    if (hoveredNode) {
        showNodeDetails(hoveredNode, hoveredNode === selectedNode);
    } else if (hoveredEdge) {
        showEdgeDetails(hoveredEdge);
    } else if (selectedNode) {
        showNodeDetails(selectedNode, true);
    } else if (activeQuestion !== null) {
        showQuestionDetails(activeQuestion);
    } else {
        showDefaultDetails();
    }
}

function refresh() {
    applyHighlights();
    refreshDetails();
}

// ===========================================
// EVENTS
// ===========================================
// A petal's label is a node as far as vis-network is concerned, but to the
// learner it is the name of an edge type, so hovering it acts like hovering the edge.
function isPetalLabel(id) {
    return String(id).indexOf('label:') === 0;
}

network.on('hoverNode', function (params) {
    if (isPetalLabel(params.node)) {
        hoveredEdge = edgeTypeOfVisId[params.node];
    } else {
        hoveredNode = params.node;
    }
    refresh();
});
network.on('blurNode', function () { hoveredNode = null; hoveredEdge = null; refresh(); });
network.on('hoverEdge', function (params) { hoveredEdge = edgeTypeOfVisId[params.edge]; refresh(); });
network.on('blurEdge', function () { hoveredEdge = null; refresh(); });

network.on('click', function (params) {
    if (params.nodes.length > 0 && !isPetalLabel(params.nodes[0])) {
        const id = params.nodes[0];
        selectedNode = (selectedNode === id) ? null : id;    // click again to clear
    } else {
        selectedNode = null;
    }
    network.unselectAll();
    refresh();
});

questionSelect.addEventListener('change', function () {
    activeQuestion = (questionSelect.value === '') ? null : parseInt(questionSelect.value, 10);
    selectedNode = null;
    refresh();
});

showDefaultDetails();
