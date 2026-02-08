---
title: Directed vs Undirected Graph
description: Interactive comparison showing how edge direction conveys meaning in organizational graph models
quality_score: 85
image: /sims/directed-vs-undirected/directed-vs-undirected.png
og:image: /sims/directed-vs-undirected/directed-vs-undirected.png
twitter:image: /sims/directed-vs-undirected/directed-vs-undirected.png
social:
   cards: false
---
# Directed vs Undirected Graph

<iframe src="main.html" height="500px" width="100%" scrolling="no"></iframe>

[View Directed vs Undirected Graph Fullscreen](./main.html){ .md-button .md-button--primary }

## Embed This Visualization

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/directed-vs-undirected/main.html" height="500px" width="100%" scrolling="no"></iframe>
```

## Overview

This MicroSim lets students toggle between a **directed graph** and an **undirected graph** representation of the same organizational relationships. By switching views, students can directly observe how edge direction encodes meaning — and what information is lost when direction is removed.

## How to Use

1. **Explore the directed view** — arrows show who manages whom, who initiates communication, and who works in which department
2. **Hover over edges** to see a tooltip explaining what direction adds to each relationship
3. **Click "Show Undirected"** to switch to symmetric edges and compare what information is preserved or lost
4. **Toggle back and forth** to solidify your understanding of directed vs undirected semantics

## Graph Structure

### Nodes

| Node | Type | Color |
|------|------|-------|
| James | Employee | Amber |
| Maria | Employee | Amber |
| Aisha | Employee | Amber |
| Carlos | Employee | Amber |
| Engineering | Department | Indigo |

### Edges

**Directed view:**

- James → Maria (MANAGES)
- James → Carlos (MANAGES)
- Maria → Aisha (COMMUNICATES_WITH)
- Aisha → Maria (COMMUNICATES_WITH)
- Maria → Engineering (WORKS_IN)
- Carlos → Engineering (WORKS_IN)

**Undirected view:**

- James — Maria (COLLABORATES)
- James — Carlos (COLLABORATES)
- Maria — Aisha (COLLABORATES)
- Maria — Engineering (MEMBER_OF)
- Carlos — Engineering (MEMBER_OF)

## Key Concepts

- **Directed graphs** preserve asymmetric relationship semantics (who manages whom, who initiates communication)
- **Undirected graphs** model symmetric relationships (mutual collaboration, shared membership)
- Removing direction can lose critical organizational information
- Most graph databases store directed edges but allow undirected queries

## Lesson Plan

### Learning Objectives

After using this visualization, students will be able to:

1. Differentiate between directed and undirected graph representations
2. Explain how edge direction encodes meaning in organizational relationships
3. Evaluate when directed vs undirected models are appropriate

### Activities

1. **Toggle and Compare**: Switch between views and list three pieces of information lost in the undirected version
2. **Identify Relationship Types**: For each edge, decide whether direction is essential or optional
3. **Design Challenge**: Propose two additional relationships for this graph and justify whether each should be directed or undirected

### Assessment

- Can students explain why MANAGES requires direction but COLLABORATES does not?
- Can students identify which directed edges collapse into a single undirected edge?
- Can students predict what queries become impossible without edge direction?

## Editing Node Positions

To edit node positions for better layout:

1. Open main.html directly in a browser (not in an iframe)
2. Drag nodes to desired positions
3. Note the coordinates for updating the JavaScript file

## References

- [Neo4j Graph Data Modeling](https://neo4j.com/developer/data-modeling/)
- [vis-network Documentation](https://visjs.github.io/vis-network/docs/network/)
