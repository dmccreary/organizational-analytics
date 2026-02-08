// Directed vs Undirected Graph
// Educational vis-network visualization showing how edge direction conveys meaning

// ===========================================
// GRAPH DATA
// ===========================================

const nodeData = [
    { id: 'james',       label: 'James',       type: 'employee', x: -200, y: -120 },
    { id: 'maria',       label: 'Maria',       type: 'employee', x: -50,  y: -10  },
    { id: 'aisha',       label: 'Aisha',       type: 'employee', x: 150,  y: -120 },
    { id: 'carlos',      label: 'Carlos',      type: 'employee', x: -50,  y: 140  },
    { id: 'engineering', label: 'Engineering', type: 'department', x: 150,  y: 140  }
];

// Directed edge set (with arrows, directional semantics)
const directedEdges = [
    { id: 'e1', from: 'james', to: 'maria',       label: 'MANAGES',            edgeType: 'manages',       info: 'Direction tells us James manages Maria — not the reverse.' },
    { id: 'e2', from: 'james', to: 'carlos',      label: 'MANAGES',            edgeType: 'manages',       info: 'Direction tells us James manages Carlos — not the reverse.' },
    { id: 'e3', from: 'maria', to: 'aisha',       label: 'COMMUNICATES_WITH',  edgeType: 'communicates',  info: 'Direction shows Maria initiates communication with Aisha.' },
    { id: 'e4', from: 'aisha', to: 'maria',       label: 'COMMUNICATES_WITH',  edgeType: 'communicates',  info: 'Direction shows Aisha also initiates communication back to Maria.' },
    { id: 'e5', from: 'maria', to: 'engineering',  label: 'WORKS_IN',           edgeType: 'works_in',      info: 'Direction tells us Maria works in Engineering — not that Engineering works in Maria.' },
    { id: 'e6', from: 'carlos', to: 'engineering', label: 'WORKS_IN',           edgeType: 'works_in',      info: 'Direction tells us Carlos works in Engineering.' }
];

// Undirected edge set (no arrows, symmetric semantics)
const undirectedEdges = [
    { id: 'u1', from: 'james', to: 'maria',       label: 'COLLABORATES',  edgeType: 'collaborates', info: 'No direction — we only know James and Maria collaborate.' },
    { id: 'u2', from: 'james', to: 'carlos',      label: 'COLLABORATES',  edgeType: 'collaborates', info: 'No direction — we only know James and Carlos collaborate.' },
    { id: 'u3', from: 'maria', to: 'aisha',       label: 'COLLABORATES',  edgeType: 'collaborates', info: 'No direction — we only know Maria and Aisha collaborate. We lose the two-way communication detail.' },
    { id: 'u4', from: 'maria', to: 'engineering',  label: 'MEMBER_OF',     edgeType: 'member_of',    info: 'No direction — we only know Maria is associated with Engineering.' },
    { id: 'u5', from: 'carlos', to: 'engineering', label: 'MEMBER_OF',     edgeType: 'member_of',    info: 'No direction — we only know Carlos is associated with Engineering.' }
];

// ===========================================
// EDGE STYLE CONFIG
// ===========================================

const edgeStyleConfig = {
    manages:       { color: '#303F9F', dashes: false, width: 2.5 },
    communicates:  { color: '#D4880F', dashes: [8, 5], width: 2 },
    works_in:      { color: '#666666', dashes: false, width: 2 },
    collaborates:  { color: '#5C6BC0', dashes: false, width: 2 },
    member_of:     { color: '#666666', dashes: false, width: 2 }
};

// ===========================================
// STATE
// ===========================================

let network;
let isDirected = true;

// ===========================================
// NODE CREATION
// ===========================================

function createNodes() {
    return new vis.DataSet(nodeData.map(n => {
        const isEmployee = n.type === 'employee';
        return {
            id: n.id,
            label: n.label,
            x: n.x,
            y: n.y,
            fixed: false,
            shape: isEmployee ? 'ellipse' : 'box',
            size: isEmployee ? 22 : 18,
            color: {
                background: isEmployee ? '#D4880F' : '#303F9F',
                border: isEmployee ? '#B06D0B' : '#1A237E',
                highlight: { background: isEmployee ? '#E09A2B' : '#3949AB', border: isEmployee ? '#B06D0B' : '#1A237E' },
                hover: { background: isEmployee ? '#E09A2B' : '#3949AB', border: isEmployee ? '#B06D0B' : '#1A237E' }
            },
            font: {
                color: '#FFFFFF',
                size: 13,
                face: 'Arial',
                bold: true
            },
            borderWidth: 2,
            margin: isEmployee ? undefined : { top: 8, bottom: 8, left: 12, right: 12 },
            shadow: {
                enabled: true,
                color: isEmployee ? 'rgba(176, 109, 11, 0.2)' : 'rgba(26, 35, 126, 0.25)',
                size: 6, x: 1, y: 1
            }
        };
    }));
}

// ===========================================
// EDGE CREATION
// ===========================================

function createEdges(directed) {
    const edgeSet = directed ? directedEdges : undirectedEdges;
    return new vis.DataSet(edgeSet.map(edge => {
        const style = edgeStyleConfig[edge.edgeType];
        return {
            id: edge.id,
            from: edge.from,
            to: edge.to,
            label: edge.label,
            color: { color: style.color, highlight: style.color, hover: style.color, opacity: 0.8 },
            dashes: style.dashes,
            width: style.width,
            arrows: directed ? { to: { enabled: true, scaleFactor: 0.9 } } : { to: { enabled: false } },
            smooth: { type: 'curvedCW', roundness: 0.15 },
            font: {
                size: 10,
                color: '#666',
                strokeWidth: 3,
                strokeColor: '#ffffff',
                align: 'middle'
            }
        };
    }));
}

// ===========================================
// NETWORK INITIALIZATION
// ===========================================

function initializeNetwork() {
    const nodes = createNodes();
    const edges = createEdges(isDirected);

    const options = {
        layout: { improvedLayout: false },
        physics: { enabled: false },
        interaction: {
            hover: true,
            tooltipDelay: 100,
            zoomView: false,
            dragView: true,
            dragNodes: true,
            navigationButtons: true,
            selectConnectedEdges: false
        },
        nodes: {
            chosen: {
                node: function(values, id, selected, hovering) {
                    if (hovering) {
                        values.borderWidth = 4;
                        values.shadowSize = 12;
                    }
                }
            }
        }
    };

    const container = document.getElementById('network');
    const data = { nodes, edges };

    if (network) {
        network.destroy();
    }

    network = new vis.Network(container, data, options);

    // Fit all nodes into view on initial load
    network.once('afterDrawing', function() {
        network.fit({ animation: false });
    });

    // Edge hover handler
    network.on('hoverEdge', function(params) {
        const edgeSet = isDirected ? directedEdges : undirectedEdges;
        const edgeData = edgeSet.find(e => e.id === params.edge);
        if (edgeData) {
            showEdgeInfo(edgeData);
        }
    });

    network.on('blurEdge', function() {
        hideEdgeInfo();
    });

    // Click edge to persist info
    network.on('selectEdge', function(params) {
        if (params.edges.length > 0 && params.nodes.length === 0) {
            const edgeSet = isDirected ? directedEdges : undirectedEdges;
            const edgeData = edgeSet.find(e => e.id === params.edges[0]);
            if (edgeData) {
                showEdgeInfo(edgeData);
            }
        }
    });

    network.on('click', function(params) {
        if (params.edges.length === 0) {
            hideEdgeInfo();
        }
    });
}

// ===========================================
// UI UPDATES
// ===========================================

function showEdgeInfo(edgeData) {
    const panel = document.getElementById('info-panel');
    const content = document.getElementById('info-content');
    const fromNode = nodeData.find(n => n.id === edgeData.from);
    const toNode = nodeData.find(n => n.id === edgeData.to);

    let html = `<strong>${fromNode.label}`;
    if (isDirected) {
        html += ` → ${toNode.label}</strong><br>`;
        html += `<em>${edgeData.label}</em><br><br>`;
    } else {
        html += ` — ${toNode.label}</strong><br>`;
        html += `<em>${edgeData.label}</em><br><br>`;
    }
    html += edgeData.info;

    content.innerHTML = html;
    panel.style.display = 'block';
}

function hideEdgeInfo() {
    document.getElementById('info-panel').style.display = 'none';
}

function updateUI() {
    const toggleBtn = document.getElementById('toggle-btn');
    const viewLabel = document.getElementById('view-label');
    const statusText = document.getElementById('status-text');
    const legendEdges = document.getElementById('legend-edges');

    if (isDirected) {
        toggleBtn.textContent = 'Show Undirected';
        viewLabel.textContent = 'Directed Graph';
        statusText.textContent = 'Edges have direction — arrows show WHO does WHAT to WHOM. Hover over an edge to see details.';
        legendEdges.innerHTML = `
            <span class="legend-edge" style="border-color:#303F9F;border-top-style:solid;"></span>
            <span style="font-size:12px;">MANAGES (directed)</span>
        `;
    } else {
        toggleBtn.textContent = 'Show Directed';
        viewLabel.textContent = 'Undirected Graph';
        statusText.textContent = 'Edges have no direction — connections are symmetric. We lose information about who initiates what. Hover over an edge to compare.';
        legendEdges.innerHTML = `
            <span class="legend-edge" style="border-color:#5C6BC0;border-top-style:solid;"></span>
            <span style="font-size:12px;">COLLABORATES (undirected)</span>
        `;
    }
}

function toggleView() {
    isDirected = !isDirected;
    hideEdgeInfo();
    updateUI();
    initializeNetwork();
}

// ===========================================
// INIT
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    updateUI();
    initializeNetwork();
    document.getElementById('toggle-btn').addEventListener('click', toggleView);
});
