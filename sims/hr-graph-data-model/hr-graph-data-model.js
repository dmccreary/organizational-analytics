// HR Graph Data Model - Interactive Graph Database Model
// Shows employees, departments, and relationships as a property graph

// ================================
// NODE DATA
// ================================
const employeeData = [
    {
        id: 'maria',
        label: 'Maria\nChen',
        title: 'Senior Engineer',
        department: 'Engineering',
        hireDate: '2021-03-15',
        x: -120,
        y: -60
    },
    {
        id: 'james',
        label: 'James\nPark',
        title: 'Engineering Manager',
        department: 'Engineering',
        hireDate: '2019-06-01',
        x: -200,
        y: -170
    },
    {
        id: 'aisha',
        label: 'Aisha\nPatel',
        title: 'Product Manager',
        department: 'Product',
        hireDate: '2020-09-20',
        x: 140,
        y: -70
    },
    {
        id: 'carlos',
        label: 'Carlos\nRivera',
        title: 'Lead Designer',
        department: 'Design',
        hireDate: '2022-01-10',
        x: -100,
        y: 190
    },
    {
        id: 'li',
        label: 'Li\nWei',
        title: 'Data Analyst',
        department: 'Analytics',
        hireDate: '2023-04-05',
        x: 220,
        y: 170
    }
];

const departmentData = [
    {
        id: 'engineering',
        label: 'Engineering',
        headcount: 42,
        budget: '$4.2M',
        x: -280,
        y: -50
    },
    {
        id: 'product',
        label: 'Product',
        headcount: 18,
        budget: '$1.8M',
        x: 280,
        y: -100
    },
    {
        id: 'design',
        label: 'Design',
        headcount: 12,
        budget: '$1.1M',
        x: -260,
        y: 190
    },
    {
        id: 'analytics',
        label: 'Analytics',
        headcount: 8,
        budget: '$0.9M',
        x: 300,
        y: 200
    }
];

// ================================
// EDGE DATA
// ================================
const edgeData = [
    // WORKS_IN relationships
    {
        id: 'maria-eng',
        from: 'maria',
        to: 'engineering',
        edgeType: 'WORKS_IN',
        since: '2021-03-15',
        role: 'Individual Contributor'
    },
    {
        id: 'james-eng',
        from: 'james',
        to: 'engineering',
        edgeType: 'WORKS_IN',
        since: '2019-06-01',
        role: 'Manager'
    },
    {
        id: 'aisha-prod',
        from: 'aisha',
        to: 'product',
        edgeType: 'WORKS_IN',
        since: '2020-09-20',
        role: 'Individual Contributor'
    },
    {
        id: 'carlos-design',
        from: 'carlos',
        to: 'design',
        edgeType: 'WORKS_IN',
        since: '2022-01-10',
        role: 'Lead'
    },
    {
        id: 'li-analytics',
        from: 'li',
        to: 'analytics',
        edgeType: 'WORKS_IN',
        since: '2023-04-05',
        role: 'Individual Contributor'
    },

    // COMMUNICATES_WITH relationships
    {
        id: 'maria-aisha',
        from: 'maria',
        to: 'aisha',
        edgeType: 'COMMUNICATES_WITH',
        frequency: 'daily',
        channel: 'Slack, meetings'
    },
    {
        id: 'maria-james',
        from: 'maria',
        to: 'james',
        edgeType: 'COMMUNICATES_WITH',
        frequency: 'weekly',
        channel: '1:1 meetings'
    },
    {
        id: 'maria-carlos',
        from: 'maria',
        to: 'carlos',
        edgeType: 'COMMUNICATES_WITH',
        frequency: 'weekly',
        channel: 'Slack, design reviews'
    },
    {
        id: 'aisha-li',
        from: 'aisha',
        to: 'li',
        edgeType: 'COMMUNICATES_WITH',
        frequency: 'daily',
        channel: 'Slack, dashboards'
    },
    {
        id: 'carlos-li',
        from: 'carlos',
        to: 'li',
        edgeType: 'COMMUNICATES_WITH',
        frequency: 'monthly',
        channel: 'Email'
    },

    // REPORTS_TO relationships
    {
        id: 'maria-reports-james',
        from: 'maria',
        to: 'james',
        edgeType: 'REPORTS_TO',
        since: '2021-03-15'
    },

    // HEADED_BY relationships
    {
        id: 'eng-headed-james',
        from: 'engineering',
        to: 'james',
        edgeType: 'HEADED_BY',
        since: '2020-01-15'
    }
];

// ================================
// EDGE STYLE CONFIG
// ================================
const edgeStyles = {
    'WORKS_IN': {
        color: '#666666',
        dashes: false,
        width: 2,
        arrows: { to: { enabled: true, scaleFactor: 0.8 } },
        smooth: { type: 'curvedCW', roundness: 0.15 }
    },
    'COMMUNICATES_WITH': {
        color: '#D4880F',
        dashes: [8, 5],
        width: 2,
        arrows: { to: { enabled: false } },
        smooth: { type: 'curvedCW', roundness: 0.2 }
    },
    'REPORTS_TO': {
        color: '#303F9F',
        dashes: false,
        width: 2.5,
        arrows: { to: { enabled: true, scaleFactor: 0.9 } },
        smooth: { type: 'curvedCW', roundness: 0.3 }
    },
    'HEADED_BY': {
        color: '#FFD700',
        dashes: false,
        width: 2.5,
        arrows: { to: { enabled: true, scaleFactor: 0.9 } },
        smooth: { type: 'curvedCW', roundness: 0.15 }
    }
};

// ================================
// CREATE VIS-NETWORK DATASETS
// ================================

// Employee nodes
const nodes = new vis.DataSet(
    employeeData.map(emp => ({
        id: emp.id,
        label: emp.label,
        x: emp.x,
        y: emp.y,
        fixed: true,
        shape: 'ellipse',
        size: 25,
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
            color: 'rgba(176, 109, 11, 0.2)',
            size: 6,
            x: 1,
            y: 1
        }
    }))
);

// Department nodes
departmentData.forEach(dept => {
    nodes.add({
        id: dept.id,
        label: dept.label,
        x: dept.x,
        y: dept.y,
        fixed: true,
        shape: 'box',
        size: 20,
        color: {
            background: '#303F9F',
            border: '#1A237E',
            highlight: { background: '#3949AB', border: '#1A237E' },
            hover: { background: '#3949AB', border: '#1A237E' }
        },
        font: {
            color: '#FFFFFF',
            size: 13,
            face: 'Arial',
            bold: true
        },
        borderWidth: 2,
        margin: { top: 8, bottom: 8, left: 12, right: 12 },
        shadow: {
            enabled: true,
            color: 'rgba(26, 35, 126, 0.25)',
            size: 8,
            x: 1,
            y: 1
        }
    });
});

// Edges
const edges = new vis.DataSet(
    edgeData.map(edge => {
        const style = edgeStyles[edge.edgeType];
        // Build label for COMMUNICATES_WITH edges
        let edgeLabel = '';
        if (edge.edgeType === 'COMMUNICATES_WITH') {
            edgeLabel = edge.frequency;
        }
        return {
            id: edge.id,
            from: edge.from,
            to: edge.to,
            label: edgeLabel,
            color: {
                color: style.color,
                highlight: style.color,
                hover: style.color,
                opacity: 0.8
            },
            dashes: style.dashes,
            width: style.width,
            arrows: style.arrows,
            smooth: style.smooth,
            font: {
                size: 10,
                color: '#666',
                strokeWidth: 3,
                strokeColor: '#ffffff',
                align: 'middle'
            },
            chosen: {
                edge: function(values) {
                    values.width = style.width + 2;
                    values.opacity = 1.0;
                }
            }
        };
    })
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
        dragView: true,
        dragNodes: true,
        selectable: true,
        selectConnectedEdges: false,
        navigationButtons: true
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

const network = new vis.Network(container, data, options);

// Fit all nodes into view on initial load
network.once('afterDrawing', function() {
    network.fit({
        animation: false
    });
});

// ================================
// DETAILS PANEL
// ================================
const detailsContent = document.getElementById('details-content');

function showEmployeeDetails(empId) {
    const emp = employeeData.find(e => e.id === empId);
    if (!emp) return;

    // Find connections
    const connections = edgeData.filter(e => e.from === empId || e.to === empId);
    const commLinks = connections.filter(e => e.edgeType === 'COMMUNICATES_WITH');
    const worksIn = connections.find(e => e.edgeType === 'WORKS_IN');
    const reportsTo = connections.find(e => e.edgeType === 'REPORTS_TO' && e.from === empId);

    const cypher = `(:Employee {name: "${emp.label.replace(/\\n/g, ' ')}"})\n  -[:WORKS_IN]->\n  (:Department {name: "${emp.department}"})`;

    detailsContent.innerHTML = `
        <span class="detail-type detail-type-employee">Employee Node</span>
        <div class="detail-name">${emp.label.replace(/\n/g, ' ')}</div>
        <ul class="detail-props">
            <li><span class="prop-key">Title:</span> ${emp.title}</li>
            <li><span class="prop-key">Department:</span> ${emp.department}</li>
            <li><span class="prop-key">Hire Date:</span> ${emp.hireDate}</li>
            <li><span class="prop-key">Connections:</span> ${connections.length} relationships</li>
            <li><span class="prop-key">Comm Links:</span> ${commLinks.length} peers</li>
        </ul>
        <div class="detail-cypher-label">Cypher Pattern</div>
        <div class="detail-cypher">${cypher}</div>
    `;
}

function showDepartmentDetails(deptId) {
    const dept = departmentData.find(d => d.id === deptId);
    if (!dept) return;

    // Find employees in department
    const members = edgeData
        .filter(e => e.edgeType === 'WORKS_IN' && e.to === deptId)
        .map(e => {
            const emp = employeeData.find(em => em.id === e.from);
            return emp ? emp.label.replace(/\n/g, ' ') : e.from;
        });

    const headEdge = edgeData.find(e => e.edgeType === 'HEADED_BY' && e.from === deptId);
    const headName = headEdge
        ? employeeData.find(em => em.id === headEdge.to)?.label.replace(/\n/g, ' ') || 'Unknown'
        : 'None assigned';

    const cypher = `(:Department {name: "${dept.label}"})\n  -[:HEADED_BY]->\n  (:Employee {name: "${headName}"})`;

    detailsContent.innerHTML = `
        <span class="detail-type detail-type-department">Department Node</span>
        <div class="detail-name">${dept.label}</div>
        <ul class="detail-props">
            <li><span class="prop-key">Headcount:</span> ${dept.headcount}</li>
            <li><span class="prop-key">Budget:</span> ${dept.budget}</li>
            <li><span class="prop-key">Head:</span> ${headName}</li>
            <li><span class="prop-key">Members shown:</span> ${members.join(', ')}</li>
        </ul>
        <div class="detail-cypher-label">Cypher Pattern</div>
        <div class="detail-cypher">${cypher}</div>
    `;
}

function showEdgeDetails(edgeId) {
    const edge = edgeData.find(e => e.id === edgeId);
    if (!edge) return;

    const fromNode = employeeData.find(e => e.id === edge.from) || departmentData.find(d => d.id === edge.from);
    const toNode = employeeData.find(e => e.id === edge.to) || departmentData.find(d => d.id === edge.to);
    const fromLabel = fromNode ? (fromNode.label || '').replace(/\n/g, ' ') : edge.from;
    const toLabel = toNode ? (toNode.label || '').replace(/\n/g, ' ') : edge.to;

    let propsHtml = '';
    if (edge.edgeType === 'COMMUNICATES_WITH') {
        propsHtml = `
            <li><span class="prop-key">Frequency:</span> ${edge.frequency}</li>
            <li><span class="prop-key">Channel:</span> ${edge.channel}</li>
        `;
    } else if (edge.edgeType === 'WORKS_IN') {
        propsHtml = `
            <li><span class="prop-key">Since:</span> ${edge.since}</li>
            <li><span class="prop-key">Role:</span> ${edge.role}</li>
        `;
    } else if (edge.edgeType === 'REPORTS_TO') {
        propsHtml = `
            <li><span class="prop-key">Since:</span> ${edge.since}</li>
        `;
    } else if (edge.edgeType === 'HEADED_BY') {
        propsHtml = `
            <li><span class="prop-key">Since:</span> ${edge.since}</li>
        `;
    }

    // Build Cypher with appropriate node labels
    const fromIsEmp = employeeData.some(e => e.id === edge.from);
    const toIsEmp = employeeData.some(e => e.id === edge.to);
    const fromType = fromIsEmp ? 'Employee' : 'Department';
    const toType = toIsEmp ? 'Employee' : 'Department';

    const cypher = `(:${fromType} {name: "${fromLabel}"})\n  -[:${edge.edgeType}]->\n  (:${toType} {name: "${toLabel}"})`;

    detailsContent.innerHTML = `
        <span class="detail-type detail-type-edge">${edge.edgeType}</span>
        <div class="detail-name">${fromLabel} &rarr; ${toLabel}</div>
        <ul class="detail-props">
            <li><span class="prop-key">Type:</span> ${edge.edgeType}</li>
            ${propsHtml}
        </ul>
        <div class="detail-cypher-label">Cypher Pattern</div>
        <div class="detail-cypher">${cypher}</div>
    `;
}

function resetDetailsPanel() {
    detailsContent.innerHTML = '<p class="details-prompt">Hover over a node or edge to see its properties and graph database representation.</p>';
}

// ================================
// EVENT HANDLERS
// ================================

// Hover node
network.on('hoverNode', function(params) {
    const nodeId = params.node;
    if (employeeData.some(e => e.id === nodeId)) {
        showEmployeeDetails(nodeId);
    } else if (departmentData.some(d => d.id === nodeId)) {
        showDepartmentDetails(nodeId);
    }
});

network.on('blurNode', function() {
    const selected = network.getSelectedNodes();
    const selectedEdges = network.getSelectedEdges();
    if (selected.length === 0 && selectedEdges.length === 0) {
        resetDetailsPanel();
    }
});

// Hover edge
network.on('hoverEdge', function(params) {
    showEdgeDetails(params.edge);
});

network.on('blurEdge', function() {
    const selected = network.getSelectedNodes();
    const selectedEdges = network.getSelectedEdges();
    if (selected.length === 0 && selectedEdges.length === 0) {
        resetDetailsPanel();
    }
});

// Click node - persist details and highlight neighborhood
network.on('selectNode', function(params) {
    const nodeId = params.nodes[0];
    if (employeeData.some(e => e.id === nodeId)) {
        showEmployeeDetails(nodeId);
    } else if (departmentData.some(d => d.id === nodeId)) {
        showDepartmentDetails(nodeId);
    }

    // Highlight connected nodes/edges, dim others
    const connectedNodes = network.getConnectedNodes(nodeId);
    const connectedEdges = network.getConnectedEdges(nodeId);
    const allConnected = new Set([nodeId, ...connectedNodes]);

    // Dim non-connected nodes
    employeeData.concat(departmentData).forEach(n => {
        if (!allConnected.has(n.id)) {
            nodes.update({
                id: n.id,
                opacity: 0.25
            });
        } else {
            nodes.update({
                id: n.id,
                opacity: 1.0
            });
        }
    });

    // Dim non-connected edges
    edgeData.forEach(e => {
        if (!connectedEdges.includes(e.id)) {
            edges.update({
                id: e.id,
                color: { ...edges.get(e.id).color, opacity: 0.1 }
            });
        } else {
            const style = edgeStyles[e.edgeType];
            edges.update({
                id: e.id,
                color: { color: style.color, highlight: style.color, hover: style.color, opacity: 1.0 }
            });
        }
    });
});

// Click edge
network.on('selectEdge', function(params) {
    if (params.edges.length > 0 && params.nodes.length === 0) {
        showEdgeDetails(params.edges[0]);
    }
});

// Click background to reset
network.on('click', function(params) {
    if (params.nodes.length === 0 && params.edges.length === 0) {
        network.unselectAll();
        resetDetailsPanel();
        // Restore all opacities
        employeeData.concat(departmentData).forEach(n => {
            nodes.update({ id: n.id, opacity: 1.0 });
        });
        edgeData.forEach(e => {
            const style = edgeStyles[e.edgeType];
            edges.update({
                id: e.id,
                color: { color: style.color, highlight: style.color, hover: style.color, opacity: 0.8 }
            });
        });
    }
});

network.on('deselectNode', function() {
    resetDetailsPanel();
    // Restore all opacities
    employeeData.concat(departmentData).forEach(n => {
        nodes.update({ id: n.id, opacity: 1.0 });
    });
    edgeData.forEach(e => {
        const style = edgeStyles[e.edgeType];
        edges.update({
            id: e.id,
            color: { color: style.color, highlight: style.color, hover: style.color, opacity: 0.8 }
        });
    });
});
