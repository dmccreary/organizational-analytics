---
title: Organizational Hierarchy Graph
description: Interactive vis-network tree showing how an organization, its divisions, and its departments are stored as nodes joined by PART_OF edges, with ancestor and descendant highlighting.
image: /sims/org-hierarchy-graph/org-hierarchy-graph.png
og:image: /sims/org-hierarchy-graph/org-hierarchy-graph.png
twitter:image: /sims/org-hierarchy-graph/org-hierarchy-graph.png
social:
   cards: false
quality_score: 100
---

# Organizational Hierarchy Graph

<iframe src="main.html" height="502px" width="100%" scrolling="no" style="border: 2px solid #303F9F; border-radius: 8px;"></iframe>

[Run the Organizational Hierarchy Graph MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

An org chart on a slide is a picture. In a graph database it is data you can traverse. This MicroSim shows the three-level hierarchy from the chapter — one `:Organization`, three `:Division` nodes, and six `:Department` nodes — stored the way a graph database stores it: every child node has exactly one `PART_OF` edge pointing **up** to its parent.

Ten nodes, nine edges, one tree. Because the structure is a tree, two questions become simple traversals:

- **Traverse up** from any unit to find everything it belongs to (its ancestors).
- **Traverse down** from any unit to find everything that rolls up into it (its descendants).

## How to Use

1. **Hover over a node** to light up its ancestors in amber. This is the path from that unit to the root, following the direction of the `PART_OF` arrows. A tooltip lists the node's properties.
2. **Click a node** to turn all of its descendants gold. Click the same node again, or click the background, to clear the selection.
3. **Read the Details panel** for the node's properties, the path to the root with its hop count, the number of units beneath it, and the Cypher traversal that would return the same result.
4. Use the navigation buttons to zoom or pan if the tree is small on your screen.

Things to notice:

- The arrows point from child to parent. `(eng)-[:PART_OF]->(techDiv)` reads "Engineering is part of Technology."
- The root (Acme Corporation) is the only node with no outgoing `PART_OF` edge.
- Every department is exactly two hops from the root, so this hierarchy has a depth of two.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/org-hierarchy-graph/main.html"
        height="502px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Learning Objective

Students will illustrate how organizational hierarchy is represented as a tree of nodes and `PART_OF` edges in a graph database. (Bloom's Taxonomy: Understand)

### Audience

College students and working professionals in information systems, human resources analytics, and enterprise architecture.

### Duration

10-15 minutes

### Prerequisites

- Nodes, edges, labels, and properties in the labeled property graph model
- Basic Cypher `MATCH` and `CREATE` patterns

### Activities

1. **Exploration** (5 min): Hover over each of the six departments in turn. For each one, write down the path to the root and the number of hops. Confirm that every path ends at the same node.
2. **Guided Practice** (5 min): Click each division and count the gold nodes. Then click the organization node. Explain in one sentence why clicking a department turns nothing gold.
3. **Apply** (5 min): On paper, add a fourth level: split Engineering into two teams, "Platform" and "Mobile." Draw the new nodes and edges, and state how many nodes and edges the tree has now.

### Discussion Questions

- Why do the edges point from child to parent rather than from parent to child? Would the model still work if they pointed the other way?
- A tree with *n* nodes always has *n* - 1 edges. Where do you see that rule in this diagram?
- Reporting lines (`REPORTS_TO`) form a second tree over the same organization. How is a tree of people different from this tree of units?

### Assessment

Students sketch the hierarchy of an organization they know (a company, a university, a sports league) with at least three levels, label every edge `PART_OF` with the correct direction, and write one Cypher query that returns all units beneath a chosen node.

## References

1. Robinson, I., Webber, J., & Eifrem, E. (2015). *Graph Databases* (2nd ed.). O'Reilly Media.
2. [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/current/) - Neo4j - Reference for `MATCH` patterns, including variable-length relationships such as `-[:PART_OF*]->`.
3. [Tree (graph theory)](https://en.wikipedia.org/wiki/Tree_(graph_theory)) - Wikipedia - Definition and properties of trees, including the *n* - 1 edges rule.
4. [vis-network documentation](https://visjs.github.io/vis-network/docs/network/) - vis.js - The JavaScript library used to draw this hierarchy.
