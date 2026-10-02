// Organizational Hierarchy Graph - vis-network MicroSim
// Shows a three-level hierarchy (Organization, Division, Department)
// stored as a tree of nodes joined by PART_OF edges (child -> parent).
// CANVAS_HEIGHT: 500
//
// Interactions:
//   hover a node  -> its ancestors (the path to the root) turn amber
//   click a node  -> all of its descendants turn gold
//   click background -> clear the selection

// ===========================================
// ARIA COLOR SCHEME
// ===========================================
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const GOLD = '#FFD700';
const GOLD_DARK = '#B8960B';
const CHAMPAGNE = '#FFF8E7';
const EDGE_GRAY = '#555555';

// ===========================================
// GRAPH DATA
// The organization, the Engineering department and the Product department
// use the property values from the chapter text. The remaining departments
// carry illustrative sample values.
// ===========================================
const nodeData = [
    {
        id: 'org', type: 'Organization', label: 'Acme Corporation', level: 0, cypherVar: 'org',
        props: {
            org_id: "'ORG-001'", name: "'Acme Corporation'", industry: "'Technology'",
            founded: "date('1998-06-01')", headquarters: "'San Francisco'", employee_count: '4500'
        }
    },
    { id: 'tech', type: 'Division', label: 'Technology', level: 1, parent: 'org',
      props: { name: "'Technology'" } },
    { id: 'proddiv', type: 'Division', label: 'Product & Design', level: 1, parent: 'org',
      props: { name: "'Product & Design'" } },
    { id: 'ops', type: 'Division', label: 'Operations', level: 1, parent: 'org',
      props: { name: "'Operations'" } },
    { id: 'eng', labelShift: -10, type: 'Department', label: 'Engineering', level: 2, parent: 'tech',
      props: { dept_id: "'DEPT-ENG'", name: "'Engineering'", budget: '2400000', headcount: '85' } },
    { id: 'data', labelShift: 10, type: 'Department', label: 'Data Science', level: 2, parent: 'tech',
      props: { dept_id: "'DEPT-DATA'", name: "'Data Science'", budget: '900000', headcount: '24' } },
    { id: 'prod', labelShift: -10, type: 'Department', label: 'Product', level: 2, parent: 'proddiv',
      props: { dept_id: "'DEPT-PROD'", name: "'Product'", budget: '1200000', headcount: '32' } },
    { id: 'design', labelShift: 10, type: 'Department', label: 'Design', level: 2, parent: 'proddiv',
      props: { dept_id: "'DEPT-DSGN'", name: "'Design'", budget: '700000', headcount: '18' } },
    { id: 'hr', labelShift: -10, type: 'Department', label: 'HR', level: 2, parent: 'ops',
      props: { dept_id: "'DEPT-HR'", name: "'HR'", budget: '600000', headcount: '14' } },
    { id: 'fin', labelShift: 10, type: 'Department', label: 'Finance', level: 2, parent: 'ops',
      props: { dept_id: "'DEPT-FIN'", name: "'Finance'", budget: '800000', headcount: '20' } }
];

const nodeById = {};
nodeData.forEach(n => { nodeById[n.id] = n; });

// Base styling for each node type
const typeStyle = {
    Organization: { bg: INDIGO, border: INDIGO_DARK, font: '#FFFFFF', size: 18, margin: 14 },
    Division:     { bg: INDIGO_LIGHT, border: INDIGO, font: '#FFFFFF', size: 15, margin: 11 },
    Department:   { bg: AMBER, border: AMBER_DARK, font: '#FFFFFF', size: 14, margin: 9 }
};

// ===========================================
// TREE HELPERS
// ===========================================

// Ancestors of a node, nearest first (parent, grandparent, ...)
function getAncestors(id) {
    const result = [];
    let current = nodeById[id];
    while (current && current.parent) {
        result.push(current.parent);
        current = nodeById[current.parent];
    }
    return result;
}

// All descendants of a node (children, grandchildren, ...)
function getDescendants(id) {
    const result = [];
    nodeData.forEach(n => {
        if (getAncestors(n.id).includes(id)) result.push(n.id);
    });
    return result;
}

function edgeId(childId) {
    return 'e-' + childId;
}

// ===========================================
// TOOLTIP (shows node properties)
// ===========================================
function buildTooltip(node) {
    const div = document.createElement('div');
    let html = '<b>:' + node.type + '</b><br>';
    Object.keys(node.props).forEach(key => {
        html += key + ': ' + node.props[key] + '<br>';
    });
    div.innerHTML = html;
    return div;
}

// ===========================================
// VIS-NETWORK DATASETS
// ===========================================
function baseNode(n) {
    const s = typeStyle[n.type];
    return {
        id: n.id,
        label: n.label,
        fixed: true,
        title: buildTooltip(n),
        shape: 'box',
        shapeProperties: { borderRadius: 8 },
        margin: s.margin,
        borderWidth: 2,
        color: {
            background: s.bg, border: s.border,
            highlight: { background: s.bg, border: s.border },
            hover: { background: s.bg, border: s.border }
        },
        font: { color: s.font, size: s.size, face: 'Arial', bold: true },
        shadow: { enabled: true, color: 'rgba(0,0,0,0.22)', size: 6, x: 2, y: 2 }
    };
}

function baseEdge(n) {
    return {
        id: edgeId(n.id),
        from: n.id,          // child
        to: n.parent,        // parent  (child)-[:PART_OF]->(parent)
        label: 'PART_OF',
        width: 2,
        color: { color: EDGE_GRAY, highlight: EDGE_GRAY, hover: EDGE_GRAY },
        // Sibling labels are staggered vertically so neighbours never collide
        font: {
            size: 12, color: '#333333', strokeWidth: 5, strokeColor: '#F0F8FF',
            align: 'horizontal', vadjust: n.labelShift || 0
        },
        arrows: { to: { enabled: true, scaleFactor: 0.9 } },
        smooth: false
    };
}

const nodes = new vis.DataSet(nodeData.map(baseNode));
const edges = new vis.DataSet(nodeData.filter(n => n.parent).map(baseEdge));

// ===========================================
// NETWORK
// ===========================================
function isInIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

const enableMouseInteraction = !isInIframe();

const options = {
    physics: { enabled: false },
    interaction: {
        hover: true,
        tooltipDelay: 450,
        dragNodes: false,
        selectConnectedEdges: false,
        zoomView: enableMouseInteraction,   // never hijack page scrolling inside an iframe
        dragView: enableMouseInteraction,
        navigationButtons: true
    }
};

const container = document.getElementById('network');
const network = new vis.Network(container, { nodes: nodes, edges: edges }, options);

// ===========================================
// TREE LAYOUT
// A top-down tree: Organization, then Divisions, then Departments.
// Coordinates are set here rather than by the automatic hierarchical engine
// so the layout can adapt to the width of the graph area: in a wide area the
// departments sit in one row; in a narrow one each pair is staggered on two
// rows, which keeps the labels large enough to read.
// ===========================================
function treePositions(compact) {
    const pos = { org: { x: 0, y: -150 } };
    const divisions = nodeData.filter(n => n.type === 'Division');
    const groupGap = compact ? 172 : 208;
    const childGap = compact ? 37 : 52;
    divisions.forEach((division, i) => {
        const dx = (i - (divisions.length - 1) / 2) * groupGap;
        pos[division.id] = { x: dx, y: 0 };
        const children = nodeData.filter(n => n.parent === division.id);
        children.forEach((child, k) => {
            const side = (k % 2 === 0) ? -1 : 1;
            pos[child.id] = {
                x: dx + side * childGap,
                y: compact ? (side < 0 ? 128 : 178) : 150
            };
        });
    });
    return pos;
}

function applyLayout() {
    const compact = container.clientWidth < 560;
    const pos = treePositions(compact);
    nodes.update(nodeData.map(n => ({ id: n.id, x: pos[n.id].x, y: pos[n.id].y })));
    // In the single-row layout sibling edge labels are nudged apart vertically.
    // The staggered layout separates them already.
    edges.update(nodeData.filter(n => n.parent).map(n => ({
        id: edgeId(n.id),
        font: {
            size: 12, color: '#333333', strokeWidth: 5, strokeColor: '#F0F8FF',
            align: 'horizontal', vadjust: compact ? 0 : (n.labelShift || 0)
        }
    })));
}

function fitView() {
    network.fit({ animation: false });
    // Leave room for the title above and the navigation buttons below the tree
    const scale = Math.min(network.getScale() * 0.97, 1.2);
    const pos = network.getViewPosition();
    network.moveTo({
        position: { x: pos.x, y: pos.y + 14 / scale },   // camera down = tree up
        scale: scale,
        animation: false
    });
}

applyLayout();
network.once('afterDrawing', fitView);
window.addEventListener('resize', function () {
    applyLayout();
    network.redraw();
    fitView();
});

// ===========================================
// HIGHLIGHT STATE
// ===========================================
let hoveredId = null;    // node under the mouse -> ancestors in amber
let selectedId = null;   // clicked node         -> descendants in gold

function applyHighlights() {
    const ancestors = hoveredId ? getAncestors(hoveredId) : [];
    const descendants = selectedId ? getDescendants(selectedId) : [];

    const nodeUpdates = nodeData.map(n => {
        const s = typeStyle[n.type];
        let bg = s.bg, border = s.border, fontColor = s.font, borderWidth = 2;

        if (descendants.includes(n.id)) {
            bg = GOLD; border = GOLD_DARK; fontColor = '#222222'; borderWidth = 3;
        }
        if (n.id === selectedId) {
            border = GOLD; borderWidth = 5;
        }
        if (ancestors.includes(n.id)) {
            bg = CHAMPAGNE; border = AMBER; fontColor = '#7A4A00'; borderWidth = 5;
        }
        if (n.id === hoveredId) {
            border = AMBER; borderWidth = 5;
            if (n.type === 'Department') border = '#7A4A00';
        }
        return {
            id: n.id,
            borderWidth: borderWidth,
            color: {
                background: bg, border: border,
                highlight: { background: bg, border: border },
                hover: { background: bg, border: border }
            },
            font: { color: fontColor, size: s.size, face: 'Arial', bold: true }
        };
    });
    nodes.update(nodeUpdates);

    // An edge is on the ancestor path when its child end is the hovered node
    // or one of the hovered node's ancestors.
    const pathChildren = hoveredId ? [hoveredId].concat(ancestors) : [];
    const subtree = selectedId ? descendants : [];

    const edgeUpdates = nodeData.filter(n => n.parent).map(n => {
        let color = EDGE_GRAY, width = 2;
        if (subtree.includes(n.id)) { color = GOLD_DARK; width = 4; }
        if (pathChildren.includes(n.id)) { color = AMBER; width = 5; }
        return {
            id: edgeId(n.id),
            width: width,
            color: { color: color, highlight: color, hover: color }
        };
    });
    edges.update(edgeUpdates);
}

// ===========================================
// DETAILS PANEL
// ===========================================
const detailsContent = document.getElementById('details-content');

function showDefaultDetails() {
    detailsContent.innerHTML =
        '<div class="details-prompt">' +
        '<p>A hierarchy is stored as a <b>tree</b>: every child node has exactly one ' +
        '<b>PART_OF</b> edge pointing up to its parent.</p>' +
        '<p><b>Hover</b> a node to trace its path up to the root.</p>' +
        '<p><b>Click</b> a node to see everything that rolls up into it.</p>' +
        '<p>This tree has 10 nodes and 9 PART_OF edges.</p>' +
        '</div>';
}

function showNodeDetails(id) {
    const n = nodeById[id];
    const ancestors = getAncestors(id);
    const descendants = getDescendants(id);

    let propsHtml = '';
    Object.keys(n.props).forEach(key => {
        propsHtml += '<li><span class="prop-key">' + key + ':</span> ' + n.props[key] + '</li>';
    });

    // Path to the root, written the way the edges point
    let pathHtml;
    if (ancestors.length === 0) {
        pathHtml = 'This is the <b>root</b>. It has no outgoing PART_OF edge.';
    } else {
        const names = [n.label].concat(ancestors.map(a => nodeById[a].label));
        pathHtml = names.join(' <span class="arrow">&rarr;</span> ') +
            '<br>(' + ancestors.length + (ancestors.length === 1 ? ' hop' : ' hops') + ' to the root)';
    }

    // Traversal query for this node
    let cypher;
    if (n.type === 'Department') {
        cypher = "MATCH (d:Department\n  {name: " + n.props.name + "})\n  -[:PART_OF*]->(ancestor)\nRETURN ancestor";
    } else {
        cypher = "MATCH (unit)-[:PART_OF*]->\n  (:" + n.type + "\n  {name: " + n.props.name + "})\nRETURN unit";
    }
    const cypherLabel = n.type === 'Department' ? 'Traverse up (Cypher)' : 'Traverse down (Cypher)';

    detailsContent.innerHTML =
        '<span class="detail-type detail-type-' + n.type.toLowerCase() + '">:' + n.type + ' node</span>' +
        '<div class="detail-name">' + n.label.replace('&', '&amp;') + '</div>' +
        '<ul class="detail-props">' + propsHtml + '</ul>' +
        '<div class="detail-label">Path to root</div>' +
        '<div class="detail-path">' + pathHtml.replace(/ & /g, ' &amp; ') + '</div>' +
        '<div class="detail-label">Units beneath it: ' + descendants.length + '</div>' +
        '<div class="detail-label">' + cypherLabel + '</div>' +
        '<div class="detail-cypher">' + cypher.replace(/&/g, '&amp;') + '</div>';
}

function refreshDetails() {
    if (hoveredId) {
        showNodeDetails(hoveredId);
    } else if (selectedId) {
        showNodeDetails(selectedId);
    } else {
        showDefaultDetails();
    }
}

// ===========================================
// EVENTS
// ===========================================
network.on('hoverNode', function (params) {
    hoveredId = params.node;
    applyHighlights();
    refreshDetails();
});

network.on('blurNode', function () {
    hoveredId = null;
    applyHighlights();
    refreshDetails();
});

network.on('click', function (params) {
    if (params.nodes.length > 0) {
        const id = params.nodes[0];
        selectedId = (selectedId === id) ? null : id;   // click again to clear
    } else {
        selectedId = null;
    }
    network.unselectAll();
    applyHighlights();
    refreshDetails();
});

showDefaultDetails();
