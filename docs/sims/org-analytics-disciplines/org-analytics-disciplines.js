// Organizational Analytics Disciplines - Hub-and-Spoke Infographic
// Shows the five contributing disciplines that form organizational analytics

// ================================
// DISCIPLINE DATA
// ================================
const disciplines = {
    hub: {
        id: 'oa',
        label: 'Organizational\nAnalytics',
        description: 'The interdisciplinary field that applies graph databases, AI, and network analysis to understand hidden dynamics within organizations — from communication patterns to talent flows.',
        example: 'Combining network science, NLP, and machine learning to discover that a quiet mid-level engineer is actually the most critical connector between three product teams.'
    },
    spokes: [
        {
            id: 'ns',
            label: 'Network\nScience',
            description: 'The mathematical study of relationships. Provides the theory for understanding how connections in groups create emergent properties like influence, resilience, and information flow.',
            example: 'Using network science principles to identify that removing one key person from a project would disconnect two entire teams that depend on their bridging role.',
            angle: -90  // top
        },
        {
            id: 'gt',
            label: 'Graph\nTheory',
            description: 'Models entities as nodes and connections as edges. Gives us algorithms for pathfinding, centrality, community detection, and similarity.',
            example: 'Running a betweenness centrality algorithm to find the three employees who broker the most cross-departmental communication.',
            angle: -18  // upper right
        },
        {
            id: 'nlp',
            label: 'Natural Language\nProcessing',
            description: 'Extracts meaning from text — emails, chats, documents. Enables sentiment analysis, topic modeling, and summarization of communications.',
            example: 'Analyzing six months of team Slack messages to detect a gradual decline in sentiment that predicted an upcoming wave of departures.',
            angle: 54   // lower right
        },
        {
            id: 'ml',
            label: 'Machine\nLearning',
            description: 'Detects patterns in large datasets. Powers predictions like flight risk, skill matching, and anomaly detection.',
            example: 'Training a model on historical employee data to predict which new hires are most likely to thrive based on their onboarding network connections.',
            angle: 126  // lower left
        },
        {
            id: 'bpm',
            label: 'Business Process\nMining',
            description: 'Discovers how work actually happens by analyzing event logs. Reveals real workflows vs. documented processes.',
            example: 'Mining approval-chain event logs to discover that 40% of purchase orders bypass the documented three-step review, revealing an informal fast-track process.',
            angle: 198  // upper left
        }
    ]
};

// ================================
// NODE AND EDGE CREATION
// ================================
const SPOKE_RADIUS = 210;
const HUB_X = 0;
const HUB_Y = 0;

// Create hub node
const nodes = new vis.DataSet([
    {
        id: disciplines.hub.id,
        label: disciplines.hub.label,
        x: HUB_X,
        y: HUB_Y,
        fixed: true,
        shape: 'circle',
        size: 55,
        color: {
            background: '#303F9F',
            border: '#1A237E',
            highlight: { background: '#3949AB', border: '#1A237E' },
            hover: { background: '#3949AB', border: '#1A237E' }
        },
        font: {
            color: '#FFFFFF',
            size: 14,
            face: 'Arial',
            bold: true,
            multi: true
        },
        borderWidth: 3,
        shadow: {
            enabled: true,
            color: 'rgba(26, 35, 126, 0.3)',
            size: 10,
            x: 2,
            y: 2
        }
    }
]);

// Create spoke nodes
disciplines.spokes.forEach(spoke => {
    const radians = (spoke.angle * Math.PI) / 180;
    const x = HUB_X + SPOKE_RADIUS * Math.cos(radians);
    const y = HUB_Y + SPOKE_RADIUS * Math.sin(radians);

    nodes.add({
        id: spoke.id,
        label: spoke.label,
        x: x,
        y: y,
        fixed: true,
        shape: 'circle',
        size: 42,
        color: {
            background: '#D4880F',
            border: '#B06D0B',
            highlight: { background: '#E09A2B', border: '#B06D0B' },
            hover: { background: '#E09A2B', border: '#B06D0B' }
        },
        font: {
            color: '#FFFFFF',
            size: 12,
            face: 'Arial',
            bold: true,
            multi: true
        },
        borderWidth: 2,
        shadow: {
            enabled: true,
            color: 'rgba(176, 109, 11, 0.25)',
            size: 8,
            x: 2,
            y: 2
        }
    });
});

// Create edges from hub to each spoke
const edges = new vis.DataSet(
    disciplines.spokes.map(spoke => ({
        id: `oa-${spoke.id}`,
        from: 'oa',
        to: spoke.id,
        color: {
            color: '#5C6BC0',
            highlight: '#303F9F',
            hover: '#303F9F',
            opacity: 0.7
        },
        width: 2.5,
        smooth: {
            enabled: true,
            type: 'continuous',
            roundness: 0.2
        },
        hoverWidth: 1.5,
        selectionWidth: 2
    }))
);

// ================================
// NETWORK INITIALIZATION
// ================================
const container = document.getElementById('network');
const data = { nodes, edges };

const options = {
    physics: { enabled: false },
    interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: false,
        dragView: false,
        dragNodes: false,
        selectable: true,
        selectConnectedEdges: true
    },
    nodes: {
        chosen: {
            node: function(values, id, selected, hovering) {
                if (hovering && id !== 'oa') {
                    values.borderWidth = 4;
                    values.shadow = true;
                    values.shadowSize = 15;
                    values.shadowColor = 'rgba(212, 136, 15, 0.5)';
                }
            }
        }
    },
    edges: {
        chosen: {
            edge: function(values, id, selected, hovering) {
                if (hovering || selected) {
                    values.width = 4;
                    values.opacity = 1.0;
                }
            }
        }
    }
};

const network = new vis.Network(container, data, options);

// ================================
// INFO PANEL UPDATE
// ================================
const infoContent = document.getElementById('info-content');

function showDisciplineInfo(disciplineData) {
    infoContent.innerHTML = `
        <div class="discipline-name">${disciplineData.label.replace(/\n/g, ' ')}</div>
        <div class="discipline-desc">${disciplineData.description}</div>
        <div class="discipline-example"><strong>Example:</strong> ${disciplineData.example}</div>
    `;
}

function resetInfoPanel() {
    infoContent.innerHTML = '<p class="info-prompt">Hover over or click a discipline node to learn more about how it contributes to organizational analytics.</p>';
}

// ================================
// EVENT HANDLERS
// ================================

// Hover events
network.on('hoverNode', function(params) {
    const nodeId = params.node;
    if (nodeId === 'oa') {
        showDisciplineInfo(disciplines.hub);
    } else {
        const spoke = disciplines.spokes.find(s => s.id === nodeId);
        if (spoke) {
            showDisciplineInfo(spoke);
        }
    }
    // Highlight the connected edge
    if (nodeId !== 'oa') {
        const edgeId = `oa-${nodeId}`;
        edges.update({
            id: edgeId,
            width: 4,
            color: { color: '#303F9F', opacity: 1.0 }
        });
    }
});

network.on('blurNode', function(params) {
    // Only reset if nothing is selected
    const selectedNodes = network.getSelectedNodes();
    if (selectedNodes.length === 0) {
        resetInfoPanel();
    }
    // Reset edge styling
    const nodeId = params.node;
    if (nodeId !== 'oa') {
        const edgeId = `oa-${nodeId}`;
        edges.update({
            id: edgeId,
            width: 2.5,
            color: { color: '#5C6BC0', opacity: 0.7 }
        });
    }
});

// Click events
network.on('selectNode', function(params) {
    const nodeId = params.nodes[0];
    if (nodeId === 'oa') {
        showDisciplineInfo(disciplines.hub);
    } else {
        const spoke = disciplines.spokes.find(s => s.id === nodeId);
        if (spoke) {
            showDisciplineInfo(spoke);
            // Highlight the selected edge
            const edgeId = `oa-${nodeId}`;
            edges.update({
                id: edgeId,
                width: 4,
                color: { color: '#303F9F', opacity: 1.0 }
            });
            // Dim other spokes
            disciplines.spokes.forEach(s => {
                if (s.id !== nodeId) {
                    nodes.update({
                        id: s.id,
                        color: {
                            background: 'rgba(212, 136, 15, 0.4)',
                            border: 'rgba(176, 109, 11, 0.4)'
                        },
                        font: { color: 'rgba(255, 255, 255, 0.5)' }
                    });
                    edges.update({
                        id: `oa-${s.id}`,
                        color: { color: 'rgba(92, 107, 192, 0.25)', opacity: 0.3 }
                    });
                }
            });
        }
    }
});

network.on('deselectNode', function() {
    resetInfoPanel();
    // Restore all node and edge styles
    disciplines.spokes.forEach(spoke => {
        nodes.update({
            id: spoke.id,
            color: {
                background: '#D4880F',
                border: '#B06D0B',
                highlight: { background: '#E09A2B', border: '#B06D0B' },
                hover: { background: '#E09A2B', border: '#B06D0B' }
            },
            font: { color: '#FFFFFF', size: 12, face: 'Arial', bold: true, multi: true }
        });
        edges.update({
            id: `oa-${spoke.id}`,
            width: 2.5,
            color: { color: '#5C6BC0', opacity: 0.7 }
        });
    });
});

// Click on canvas background to deselect
network.on('click', function(params) {
    if (params.nodes.length === 0 && params.edges.length === 0) {
        network.unselectAll();
        resetInfoPanel();
        // Restore styles
        disciplines.spokes.forEach(spoke => {
            nodes.update({
                id: spoke.id,
                color: {
                    background: '#D4880F',
                    border: '#B06D0B',
                    highlight: { background: '#E09A2B', border: '#B06D0B' },
                    hover: { background: '#E09A2B', border: '#B06D0B' }
                },
                font: { color: '#FFFFFF', size: 12, face: 'Arial', bold: true, multi: true }
            });
            edges.update({
                id: `oa-${spoke.id}`,
                width: 2.5,
                color: { color: '#5C6BC0', opacity: 0.7 }
            });
        });
    }
});
