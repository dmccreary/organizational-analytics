// Property Graph Model - Interactive Visualization
// Shows employees, departments, and a project with visible properties

// ===========================================
// NODE DATA
// ===========================================
const employeeData = [
    {
        id: 'maria',
        label: 'Maria\nChen',
        title: 'Senior Engineer',
        department: 'Engineering',
        hireDate: '2021-03-15',
        x: -100, y: -50
    },
    {
        id: 'james',
        label: 'James\nPark',
        title: 'Engineering Director',
        department: 'Engineering',
        hireDate: '2019-06-01',
        x: -250, y: -150
    },
    {
        id: 'aisha',
        label: 'Aisha\nPatel',
        title: 'Product Manager',
        department: 'Product',
        hireDate: '2020-09-20',
        x: 120, y: -60
    }
];

const departmentData = [
    {
        id: 'eng',
        label: 'Engineering',
        budget: '$2.4M',
        headcount: 42,
        x: -280, y: 60
    },
    {
        id: 'prod',
        label: 'Product',
        budget: '$1.8M',
        headcount: 18,
        x: 280, y: -60
    }
];

const projectData = [
    {
        id: 'alpha',
        label: 'Project\nAlpha',
        status: 'active',
        deadline: '2026-06-01',
        x: 100, y: 150
    }
];

// ===========================================
// EDGE DATA
// ===========================================
const edgeData = [
    {
        id: 'maria-eng',
        from: 'maria', to: 'eng',
        edgeType: 'WORKS_IN',
        since: '2021-03-15'
    },
    {
        id: 'maria-james',
        from: 'maria', to: 'james',
        edgeType: 'REPORTS_TO',
        since: '2021-03-15'
    },
    {
        id: 'maria-aisha',
        from: 'maria', to: 'aisha',
        edgeType: 'COMMUNICATES_WITH',
        frequency: 'daily',
        weight: 0.92
    },
    {
        id: 'maria-alpha',
        from: 'maria', to: 'alpha',
        edgeType: 'ASSIGNED_TO',
        role: 'lead',
        hoursPerWeek: 20
    },
    {
        id: 'james-eng',
        from: 'james', to: 'eng',
        edgeType: 'WORKS_IN',
        since: '2019-06-01'
    },
    {
        id: 'aisha-prod',
        from: 'aisha', to: 'prod',
        edgeType: 'WORKS_IN',
        since: '2020-09-20'
    },
    {
        id: 'aisha-alpha',
        from: 'aisha', to: 'alpha',
        edgeType: 'ASSIGNED_TO',
        role: 'stakeholder',
        hoursPerWeek: 5
    }
];

// ===========================================
// EDGE STYLE CONFIG
// ===========================================
const edgeStyles = {
    'WORKS_IN':           { color: '#666666', dashes: false, width: 2 },
    'REPORTS_TO':         { color: '#303F9F', dashes: false, width: 2.5 },
    'COMMUNICATES_WITH':  { color: '#D4880F', dashes: [8, 5], width: 2 },
    'ASSIGNED_TO':        { color: '#B8960F', dashes: [3, 3], width: 2 }
};

// ===========================================
// CREATE VIS-NETWORK DATASETS
// ===========================================
let network;

function createNodes() {
    const allNodes = [];

    employeeData.forEach(emp => {
        allNodes.push({
            id: emp.id, label: emp.label, x: emp.x, y: emp.y,
            fixed: false, shape: 'ellipse', size: 24,
            color: {
                background: '#D4880F', border: '#B06D0B',
                highlight: { background: '#E09A2B', border: '#B06D0B' },
                hover: { background: '#E09A2B', border: '#B06D0B' }
            },
            font: { color: '#FFFFFF', size: 12, face: 'Arial', bold: true, multi: true },
            borderWidth: 2,
            shadow: { enabled: true, color: 'rgba(176,109,11,0.2)', size: 6, x: 1, y: 1 }
        });
    });

    departmentData.forEach(dept => {
        allNodes.push({
            id: dept.id, label: dept.label, x: dept.x, y: dept.y,
            fixed: false, shape: 'box', size: 18,
            color: {
                background: '#303F9F', border: '#1A237E',
                highlight: { background: '#3949AB', border: '#1A237E' },
                hover: { background: '#3949AB', border: '#1A237E' }
            },
            font: { color: '#FFFFFF', size: 13, face: 'Arial', bold: true },
            borderWidth: 2,
            margin: { top: 8, bottom: 8, left: 12, right: 12 },
            shadow: { enabled: true, color: 'rgba(26,35,126,0.25)', size: 8, x: 1, y: 1 }
        });
    });

    projectData.forEach(proj => {
        allNodes.push({
            id: proj.id, label: proj.label, x: proj.x, y: proj.y,
            fixed: false, shape: 'diamond', size: 24,
            color: {
                background: '#FFD700', border: '#B8960F',
                highlight: { background: '#FFE44D', border: '#B8960F' },
                hover: { background: '#FFE44D', border: '#B8960F' }
            },
            font: { color: '#333333', size: 11, face: 'Arial', bold: true, multi: true },
            borderWidth: 2,
            shadow: { enabled: true, color: 'rgba(184,150,15,0.2)', size: 6, x: 1, y: 1 }
        });
    });

    return new vis.DataSet(allNodes);
}

function createEdges() {
    return new vis.DataSet(edgeData.map(edge => {
        const style = edgeStyles[edge.edgeType];
        let edgeLabel = '';
        if (edge.edgeType === 'COMMUNICATES_WITH') edgeLabel = edge.frequency;
        return {
            id: edge.id, from: edge.from, to: edge.to, label: edgeLabel,
            color: { color: style.color, highlight: style.color, hover: style.color, opacity: 0.8 },
            dashes: style.dashes, width: style.width,
            arrows: { to: { enabled: true, scaleFactor: 0.8 } },
            smooth: { type: 'curvedCW', roundness: 0.15 },
            font: { size: 10, color: '#666', strokeWidth: 3, strokeColor: '#ffffff', align: 'middle' },
            chosen: {
                edge: function(values) {
                    values.width = style.width + 2;
                    values.opacity = 1.0;
                }
            }
        };
    }));
}

// ===========================================
// DETAILS PANEL
// ===========================================
const detailsContent = document.getElementById('details-content');

function showEmployeeDetails(empId) {
    const emp = employeeData.find(e => e.id === empId);
    if (!emp) return;

    const connections = edgeData.filter(e => e.from === empId || e.to === empId);
    const cypher = `(:Employee {name: "${emp.label.replace(/\n/g, ' ')}"})`;

    detailsContent.innerHTML = `
        <span class="detail-type detail-type-employee">Employee Node</span>
        <div class="detail-name">${emp.label.replace(/\n/g, ' ')}</div>
        <ul class="detail-props">
            <li><span class="prop-key">Title:</span> ${emp.title}</li>
            <li><span class="prop-key">Department:</span> ${emp.department}</li>
            <li><span class="prop-key">Hire Date:</span> ${emp.hireDate}</li>
            <li><span class="prop-key">Connections:</span> ${connections.length} relationships</li>
        </ul>
        <div class="detail-cypher-label">Cypher Pattern</div>
        <div class="detail-cypher">${cypher}</div>
    `;
}

function showDepartmentDetails(deptId) {
    const dept = departmentData.find(d => d.id === deptId);
    if (!dept) return;

    const members = edgeData
        .filter(e => e.edgeType === 'WORKS_IN' && e.to === deptId)
        .map(e => {
            const emp = employeeData.find(em => em.id === e.from);
            return emp ? emp.label.replace(/\n/g, ' ') : e.from;
        });

    detailsContent.innerHTML = `
        <span class="detail-type detail-type-department">Department Node</span>
        <div class="detail-name">${dept.label}</div>
        <ul class="detail-props">
            <li><span class="prop-key">Headcount:</span> ${dept.headcount}</li>
            <li><span class="prop-key">Budget:</span> ${dept.budget}</li>
            <li><span class="prop-key">Members shown:</span> ${members.join(', ')}</li>
        </ul>
        <div class="detail-cypher-label">Cypher Pattern</div>
        <div class="detail-cypher">(:Department {name: "${dept.label}"})</div>
    `;
}

function showProjectDetails(projId) {
    const proj = projectData.find(p => p.id === projId);
    if (!proj) return;

    const assigned = edgeData
        .filter(e => e.edgeType === 'ASSIGNED_TO' && e.to === projId)
        .map(e => {
            const emp = employeeData.find(em => em.id === e.from);
            return emp ? `${emp.label.replace(/\n/g, ' ')} (${e.role})` : e.from;
        });

    detailsContent.innerHTML = `
        <span class="detail-type detail-type-project">Project Node</span>
        <div class="detail-name">${proj.label.replace(/\n/g, ' ')}</div>
        <ul class="detail-props">
            <li><span class="prop-key">Status:</span> ${proj.status}</li>
            <li><span class="prop-key">Deadline:</span> ${proj.deadline}</li>
            <li><span class="prop-key">Team:</span> ${assigned.join(', ')}</li>
        </ul>
        <div class="detail-cypher-label">Cypher Pattern</div>
        <div class="detail-cypher">(:Project {name: "${proj.label.replace(/\n/g, ' ')}"})</div>
    `;
}

function showEdgeDetails(edgeId) {
    const edge = edgeData.find(e => e.id === edgeId);
    if (!edge) return;

    const allEntities = [...employeeData, ...departmentData, ...projectData];
    const fromNode = allEntities.find(n => n.id === edge.from);
    const toNode = allEntities.find(n => n.id === edge.to);
    const fromLabel = fromNode ? (fromNode.label || '').replace(/\n/g, ' ') : edge.from;
    const toLabel = toNode ? (toNode.label || '').replace(/\n/g, ' ') : edge.to;

    let propsHtml = '';
    if (edge.edgeType === 'COMMUNICATES_WITH') {
        propsHtml = `
            <li><span class="prop-key">Frequency:</span> ${edge.frequency}</li>
            <li><span class="prop-key">Weight:</span> ${edge.weight}</li>
        `;
    } else if (edge.edgeType === 'WORKS_IN' || edge.edgeType === 'REPORTS_TO') {
        propsHtml = `<li><span class="prop-key">Since:</span> ${edge.since}</li>`;
    } else if (edge.edgeType === 'ASSIGNED_TO') {
        propsHtml = `
            <li><span class="prop-key">Role:</span> ${edge.role}</li>
            <li><span class="prop-key">Hours/Week:</span> ${edge.hoursPerWeek}</li>
        `;
    }

    detailsContent.innerHTML = `
        <span class="detail-type detail-type-edge">${edge.edgeType}</span>
        <div class="detail-name">${fromLabel} &rarr; ${toLabel}</div>
        <ul class="detail-props">
            <li><span class="prop-key">Type:</span> ${edge.edgeType}</li>
            ${propsHtml}
        </ul>
        <div class="detail-cypher-label">Cypher Pattern</div>
        <div class="detail-cypher">(:${getNodeType(edge.from)} {name: "${fromLabel}"})\n  -[:${edge.edgeType}]->\n  (:${getNodeType(edge.to)} {name: "${toLabel}"})</div>
    `;
}

function getNodeType(nodeId) {
    if (employeeData.some(e => e.id === nodeId)) return 'Employee';
    if (departmentData.some(d => d.id === nodeId)) return 'Department';
    if (projectData.some(p => p.id === nodeId)) return 'Project';
    return 'Unknown';
}

function resetDetailsPanel() {
    detailsContent.innerHTML = '<p class="details-prompt">Click a node or edge to see its properties.</p>';
}

// ===========================================
// NETWORK INITIALIZATION
// ===========================================
function initializeNetwork() {
    const nodes = createNodes();
    const edges = createEdges();

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
            selectable: true,
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
    network = new vis.Network(container, { nodes, edges }, options);

    // Fit all nodes on initial load
    network.once('afterDrawing', function() {
        network.fit({ animation: false });
    });

    // Hover events
    network.on('hoverNode', function(params) {
        const nodeId = params.node;
        if (employeeData.some(e => e.id === nodeId)) showEmployeeDetails(nodeId);
        else if (departmentData.some(d => d.id === nodeId)) showDepartmentDetails(nodeId);
        else if (projectData.some(p => p.id === nodeId)) showProjectDetails(nodeId);
    });

    network.on('blurNode', function() {
        if (network.getSelectedNodes().length === 0 && network.getSelectedEdges().length === 0) {
            resetDetailsPanel();
        }
    });

    network.on('hoverEdge', function(params) {
        showEdgeDetails(params.edge);
    });

    network.on('blurEdge', function() {
        if (network.getSelectedNodes().length === 0 && network.getSelectedEdges().length === 0) {
            resetDetailsPanel();
        }
    });

    // Click to persist
    network.on('selectNode', function(params) {
        const nodeId = params.nodes[0];
        if (employeeData.some(e => e.id === nodeId)) showEmployeeDetails(nodeId);
        else if (departmentData.some(d => d.id === nodeId)) showDepartmentDetails(nodeId);
        else if (projectData.some(p => p.id === nodeId)) showProjectDetails(nodeId);
    });

    network.on('selectEdge', function(params) {
        if (params.edges.length > 0 && params.nodes.length === 0) {
            showEdgeDetails(params.edges[0]);
        }
    });

    network.on('click', function(params) {
        if (params.nodes.length === 0 && params.edges.length === 0) {
            network.unselectAll();
            resetDetailsPanel();
        }
    });

    network.on('deselectNode', function() { resetDetailsPanel(); });
}

// ===========================================
// INIT
// ===========================================
document.addEventListener('DOMContentLoaded', initializeNetwork);
