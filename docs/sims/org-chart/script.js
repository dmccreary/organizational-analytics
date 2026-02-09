// Global variables
let fullData = null;
let network = null;
let currentEmployeeCount = 25;
let titleOnly = true;

// Extract title from label (format: "Name\nTitle")
function extractTitle(label) {
    const parts = label.split('\\n');
    return parts.length > 1 ? parts[1] : label;
}

// Extract name from label (format: "Name\nTitle")
function extractName(label) {
    const parts = label.split('\\n');
    return parts[0];
}

// Create node label based on title-only setting
function createNodeLabel(node) {
    if (titleOnly) {
        return extractTitle(node.label);
    } else {
        return node.label; // Original format: "Name\nTitle"
    }
}

// Filter and prepare data based on employee count
function prepareData(count) {
    if (!fullData) return null;

    // Take first N nodes
    const filteredNodes = fullData.nodes.slice(0, count).map(node => ({
        ...node,
        label: createNodeLabel(node)
    }));

    // Get IDs of filtered nodes
    const nodeIds = new Set(filteredNodes.map(n => n.id));

    // Filter edges to only include connections between filtered nodes
    const filteredEdges = fullData.edges.filter(edge =>
        nodeIds.has(edge.from) && nodeIds.has(edge.to)
    );

    return {
        nodes: filteredNodes,
        edges: filteredEdges
    };
}

// Create or update the network visualization
function updateNetwork() {
    const data = prepareData(currentEmployeeCount);
    if (!data) return;

    // Create vis.js DataSets
    const nodes = new vis.DataSet(data.nodes);
    const edges = new vis.DataSet(data.edges);

    // Get the network container
    const container = document.getElementById('mynetwork');

    // Prepare data object
    const networkData = {
        nodes: nodes,
        edges: edges
    };

    // Configure network options
    const options = {
        layout: {
            hierarchical: {
                direction: 'UD', // Up-Down (top-down)
                sortMethod: 'directed',
                nodeSpacing: 150,
                levelSeparation: 120,
                treeSpacing: 200
            }
        },
        nodes: {
            shape: 'box',
            margin: 10,
            widthConstraint: {
                maximum: 150
            },
            font: {
                size: 12,
                face: 'Arial',
                multi: true
            },
            borderWidth: 2,
            shadow: true
        },
        edges: {
            arrows: {
                to: {
                    enabled: true,
                    scaleFactor: 0.5
                }
            },
            color: {
                color: '#848484',
                highlight: '#2B7CE9'
            },
            width: 2,
            smooth: {
                type: 'cubicBezier',
                forceDirection: 'vertical',
                roundness: 0.4
            }
        },
        interaction: {
            dragNodes: true,
            dragView: true,
            zoomView: false,
            navigationButtons: true,
            hover: true
        },
        physics: {
            enabled: false
        }
    };

    // Create or update the network
    if (network) {
        network.destroy();
    }
    network = new vis.Network(container, networkData, options);

    // Fit the network to the container after initialization
    network.once('stabilizationIterationsDone', function() {
        network.fit();
    });

    // Also fit after the initial draw
    network.once('afterDrawing', function() {
        network.fit();
    });

    // Update subtitle
    document.getElementById('subtitle').textContent =
        `1,000 Employee Company - Showing ${currentEmployeeCount} Key Positions`;
}

// Fetch and initialize the organization chart
async function initOrgChart() {
    try {
        // Load data from data.json
        const response = await fetch('data.json');
        fullData = await response.json();

        // Set up event listeners for controls
        const employeeSlider = document.getElementById('employeeCount');
        const countDisplay = document.getElementById('countValue');
        const titleOnlyCheckbox = document.getElementById('titleOnly');

        // Slider change handler
        employeeSlider.addEventListener('input', function() {
            currentEmployeeCount = parseInt(this.value);
            countDisplay.textContent = currentEmployeeCount;
            updateNetwork();
        });

        // Checkbox change handler
        titleOnlyCheckbox.addEventListener('change', function() {
            titleOnly = this.checked;
            updateNetwork();
        });

        // Initial render
        updateNetwork();

    } catch (error) {
        console.error('Error loading organization chart:', error);
    }
}

// Initialize the chart when the page loads
document.addEventListener('DOMContentLoaded', initOrgChart);
