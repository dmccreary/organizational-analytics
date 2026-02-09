// Capstone Project Component Map
// vis-network concept map with central Capstone node, 7 component satellites,
// and chapter reference nodes showing dependencies

// Color palette
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const AMBER = '#D4880F';
const GOLD = '#FFD700';
const GRAY = '#9E9E9E';

// Component definitions with chapter dependencies and deliverables
const components = [
    {
        id: 'capstone', label: 'Capstone\nProject', color: GOLD, fontColor: '#000',
        x: 0, y: 10,
        detail: 'Central integration project combining all course skills into a deployable organizational analytics platform.'
    },
    {
        id: 'graph-model', label: 'Graph\nModel', color: INDIGO, fontColor: '#fff',
        x: -200, y: -180,
        chapters: [2, 3, 5],
        detail: 'Populated Neo4j database with 500+ employee nodes, departments, and 12 months of event data.',
        deliverable: 'Populated graph DB with schema docs'
    },
    {
        id: 'data-pipeline', label: 'Data\nPipeline', color: AMBER, fontColor: '#fff',
        x: 0, y: -220,
        chapters: [3, 4],
        detail: 'ETL pipeline ingesting raw events, normalizing, deduplicating, and loading into the graph.',
        deliverable: 'Automated ETL scripts'
    },
    {
        id: 'query-library', label: 'Query\nLibrary', color: INDIGO, fontColor: '#fff',
        x: 200, y: -180,
        chapters: [7, 8, 9, 10],
        detail: '10+ parameterized Cypher queries across centrality, community, pathfinding, similarity, and NLP.',
        deliverable: '10+ parameterized queries with tests'
    },
    {
        id: 'api-layer', label: 'API\nLayer', color: AMBER, fontColor: '#fff',
        x: 270, y: 0,
        chapters: [4, 14],
        detail: 'FastAPI or Flask application exposing 5+ endpoints for analytics on demand.',
        deliverable: 'REST API with documented endpoints'
    },
    {
        id: 'ai-detection', label: 'AI\nDetection', color: INDIGO, fontColor: '#fff',
        x: 200, y: 190,
        chapters: [9, 10],
        detail: 'Pipeline classifying communications as AI-assisted or human-authored using perplexity, stylometric, and behavioral signals.',
        deliverable: 'Detection pipeline with accuracy report'
    },
    {
        id: 'health-score', label: 'Health\nScore', color: AMBER, fontColor: '#fff',
        x: 0, y: 230,
        chapters: [7, 8, 9, 11],
        detail: 'Composite score combining connectivity, information flow, community health, sentiment, and resilience.',
        deliverable: 'Scores with dashboard visualization'
    },
    {
        id: 'improvement', label: 'Improvement\nCycle', color: INDIGO, fontColor: '#fff',
        x: -220, y: 120,
        chapters: [11, 14, 15],
        detail: 'Complete measure-analyze-intervene-evaluate cycle with documented pre/post measurements.',
        deliverable: 'Documented intervention with results'
    }
];

// Dependency edges between components
const componentEdges = [
    { from: 'data-pipeline', to: 'graph-model', label: 'feeds' },
    { from: 'graph-model', to: 'query-library', label: 'enables' },
    { from: 'query-library', to: 'api-layer', label: 'exposes' },
    { from: 'query-library', to: 'health-score', label: 'computes' },
    { from: 'ai-detection', to: 'health-score', label: 'enriches', dashes: true },
    { from: 'health-score', to: 'improvement', label: 'drives' }
];

// Build unique chapter node set
const chapterSet = new Set();
components.forEach(c => {
    if (c.chapters) c.chapters.forEach(ch => chapterSet.add(ch));
});

// Network state
let nodes, edges, network;
let selectedComponent = null;

// Environment detection
function isInIframe() {
    try { return window.self !== window.top; }
    catch (e) { return true; }
}

function initializeNetwork() {
    // Build node array
    const nodeArray = [];

    // Add component nodes
    components.forEach(c => {
        nodeArray.push({
            id: c.id,
            label: c.label,
            x: c.x,
            y: c.y,
            color: {
                background: c.color,
                border: c.color === GOLD ? '#B8860B' : (c.color === INDIGO ? INDIGO_DARK : '#B06D0B'),
                highlight: { background: c.color, border: '#000' }
            },
            font: {
                color: c.fontColor,
                size: c.id === 'capstone' ? 18 : 14,
                face: 'Arial',
                bold: c.id === 'capstone'
            },
            shape: c.id === 'capstone' ? 'box' : 'box',
            size: c.id === 'capstone' ? 35 : 25,
            margin: c.id === 'capstone' ? 16 : 10,
            borderWidth: c.id === 'capstone' ? 4 : 3,
            shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', size: 5, x: 2, y: 2 }
        });
    });

    // Add chapter reference nodes
    chapterSet.forEach(ch => {
        nodeArray.push({
            id: 'ch-' + ch,
            label: 'Ch.' + ch,
            color: { background: '#E0E0E0', border: GRAY },
            font: { color: '#333', size: 11, face: 'Arial' },
            shape: 'ellipse',
            size: 12,
            margin: 4,
            borderWidth: 2,
            shadow: false
        });
    });

    // Position chapter nodes near their components
    const chapterPositions = {};
    components.forEach(c => {
        if (c.chapters) {
            c.chapters.forEach((ch, idx) => {
                if (!chapterPositions['ch-' + ch]) {
                    // Place chapter nodes offset from the component
                    let angle = -PI / 3 + (idx * PI / 6);
                    chapterPositions['ch-' + ch] = {
                        x: c.x + cos(angle) * 80,
                        y: c.y + sin(angle) * 80
                    };
                }
            });
        }
    });

    // Update chapter node positions
    nodeArray.forEach(n => {
        if (n.id.startsWith('ch-') && chapterPositions[n.id]) {
            n.x = chapterPositions[n.id].x;
            n.y = chapterPositions[n.id].y;
        }
    });

    // Build edge array
    const edgeArray = [];

    // Component-to-capstone edges
    components.forEach(c => {
        if (c.id !== 'capstone') {
            edgeArray.push({
                from: c.id,
                to: 'capstone',
                color: { color: '#B0B0B0', opacity: 0.4 },
                width: 1,
                dashes: [4, 4],
                arrows: { to: { enabled: false } },
                smooth: { type: 'curvedCW', roundness: 0.1 }
            });
        }
    });

    // Component dependency edges
    componentEdges.forEach(e => {
        edgeArray.push({
            from: e.from,
            to: e.to,
            label: e.label,
            color: { color: '#666' },
            width: 2,
            dashes: e.dashes || false,
            arrows: { to: { enabled: true, scaleFactor: 1 } },
            font: { size: 10, color: '#555', strokeWidth: 2, strokeColor: '#fff' },
            smooth: { type: 'curvedCW', roundness: 0.15 }
        });
    });

    // Chapter-to-component edges
    components.forEach(c => {
        if (c.chapters) {
            c.chapters.forEach(ch => {
                edgeArray.push({
                    from: 'ch-' + ch,
                    to: c.id,
                    color: { color: '#CCC', opacity: 0.6 },
                    width: 1,
                    arrows: { to: { enabled: true, scaleFactor: 0.6 } },
                    smooth: { type: 'curvedCW', roundness: 0.1 }
                });
            });
        }
    });

    nodes = new vis.DataSet(nodeArray);
    edges = new vis.DataSet(edgeArray);

    const enableMouseInteraction = !isInIframe();

    const options = {
        layout: { improvedLayout: false },
        physics: { enabled: false },
        interaction: {
            selectConnectedEdges: false,
            dragNodes: false,
            dragView: enableMouseInteraction,
            zoomView: enableMouseInteraction,
            navigationButtons: true,
            hover: true
        },
        nodes: {
            shape: 'box',
            margin: 10,
            font: { size: 14, face: 'Arial' },
            borderWidth: 3
        },
        edges: {
            arrows: { to: { enabled: true, scaleFactor: 1 } },
            width: 2,
            smooth: { type: 'curvedCW', roundness: 0.15 }
        }
    };

    const container = document.getElementById('network');
    const data = { nodes: nodes, edges: edges };
    network = new vis.Network(container, data, options);

    // Position view after rendering
    network.once('afterDrawing', function() {
        const pos = network.getViewPosition();
        network.moveTo({
            position: { x: pos.x + 60, y: pos.y + 20 },
            animation: false
        });
    });

    // Hover handler
    network.on('hoverNode', function(params) {
        let nodeId = params.node;
        let comp = components.find(c => c.id === nodeId);
        if (comp) {
            updateStatus(comp);
        } else if (nodeId.startsWith('ch-')) {
            let chNum = nodeId.replace('ch-', '');
            updateStatus({
                label: 'Chapter ' + chNum,
                detail: 'Referenced by components that use skills from Chapter ' + chNum + '.'
            });
        }
    });

    network.on('blurNode', function() {
        resetStatus();
    });

    // Click handler - highlight connected chapters
    network.on('click', function(params) {
        if (params.nodes.length > 0) {
            let nodeId = params.nodes[0];
            highlightComponent(nodeId);
        } else {
            clearHighlight();
        }
    });
}

function updateStatus(comp) {
    let html = '<strong>' + comp.label.replace(/\n/g, ' ') + '</strong><br>';
    html += comp.detail;
    if (comp.deliverable) {
        html += '<br><br><em>Deliverable: ' + comp.deliverable + '</em>';
    }
    if (comp.chapters) {
        html += '<br><br>Chapters: ' + comp.chapters.join(', ');
    }
    document.getElementById('status-text').innerHTML = html;
}

function resetStatus() {
    document.getElementById('status-text').innerHTML =
        'Hover over a node to see details. Click a component to highlight its chapter dependencies.';
}

function highlightComponent(nodeId) {
    let comp = components.find(c => c.id === nodeId);
    if (!comp || !comp.chapters) {
        clearHighlight();
        return;
    }

    // Highlight connected chapter nodes
    let updates = [];
    chapterSet.forEach(ch => {
        let isConnected = comp.chapters.includes(ch);
        updates.push({
            id: 'ch-' + ch,
            color: {
                background: isConnected ? AMBER : '#E0E0E0',
                border: isConnected ? '#B06D0B' : GRAY
            },
            font: {
                color: isConnected ? '#fff' : '#333',
                size: 11,
                face: 'Arial'
            }
        });
    });
    nodes.update(updates);
}

function clearHighlight() {
    let updates = [];
    chapterSet.forEach(ch => {
        updates.push({
            id: 'ch-' + ch,
            color: { background: '#E0E0E0', border: GRAY },
            font: { color: '#333', size: 11, face: 'Arial' }
        });
    });
    nodes.update(updates);
}

// PI and trig helpers for positioning
const PI = Math.PI;
function cos(a) { return Math.cos(a); }
function sin(a) { return Math.sin(a); }

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initializeNetwork();
});
