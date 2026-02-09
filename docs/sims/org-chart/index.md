---
title: Organization Chart Visualization
description: Interactive hierarchical organization chart demonstrating graph visualization with adjustable employee count and compact title-only view mode.
image: org-chart.png
og:image: org-chart.png
quality_score: 100
---

# Organization Chart Visualization

<iframe src="./main.html" width="100%" height="620px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Embed This MicroSim

Copy this iframe to your website:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/org-chart/main.html" width="100%" height="620px"></iframe>
```

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Description

This interactive MicroSim demonstrates hierarchical graph visualization using the vis-network.js library. It displays an organizational structure for a 1,000-employee company, showing key positions from the CEO down to individual contributors.

**Key Features:**

- **Adjustable Employee Count**: Use the slider to display between 5 and 50 employees, allowing you to focus on specific organizational levels or view the complete hierarchy.
- **Title-Only View**: Toggle between compact title-only labels and full name+title labels. The title-only view (enabled by default) is ideal for small iframes and presentations where space is limited.
- **Color-Coded Hierarchy**: Five distinct colors represent different organizational levels:
    - Red: CEO
    - Blue: C-Suite/Department Heads
    - Purple: Directors/Managers
    - Teal: Team Leads
    - Gray: Individual Contributors
- **Interactive Navigation**: Drag nodes, pan the view, and use the navigation buttons to zoom and explore the organizational structure in detail.

**How to Use:**

1. Adjust the "Number of Employees" slider to show more or fewer positions
2. Check/uncheck "Show titles only" to toggle between compact and detailed views
3. Click and drag to pan around the chart
4. Use the navigation buttons to zoom in and out
5. Hover over nodes to highlight reporting relationships

This visualization demonstrates how graphs can model hierarchical relationships in organizations, making it easier to understand reporting structures, span of control, and organizational depth.

## Graph Concepts Demonstrated

This MicroSim illustrates several important graph database concepts:

1. **Directed Acyclic Graph (DAG)**: The organization chart is a DAG where edges represent "reports to" relationships flowing from employees to managers, with no cycles.

2. **Tree Structure**: As a special case of a DAG, this hierarchy is a tree with a single root node (CEO) and unique paths from root to each node.

3. **Hierarchical Layout**: The vis-network library automatically arranges nodes by level, demonstrating graph layout algorithms.

4. **Node Properties**: Each node has properties (id, label, level, color) representing employee attributes.

5. **Edge Semantics**: Edges have clear semantics -- they represent formal reporting relationships.

6. **Graph Traversal**: Following edges from any node toward the root traces the chain of command.

7. **Subgraph Filtering**: The slider demonstrates filtering a graph to show only a connected subgraph (first N nodes that maintain valid relationships).

## References

1. [vis-network Documentation](https://visjs.github.io/vis-network/docs/network/) - Official documentation for the vis-network library used in this MicroSim
2. [Hierarchical Graph Drawing](https://en.wikipedia.org/wiki/Layered_graph_drawing) - Wikipedia article on algorithms for drawing hierarchical graphs
3. [Graph Databases and Organizational Modeling](https://neo4j.com/use-cases/organizational-management/) - Neo4j Use Cases - How graph databases model organizational structures in enterprise systems
