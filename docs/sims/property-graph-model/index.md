---
title: Property Graph Model
description: Interactive property graph visualization showing employees, departments, and a project with inspectable properties on nodes and edges
quality_score: 85
image: /sims/property-graph-model/property-graph-model.png
og:image: /sims/property-graph-model/property-graph-model.png
twitter:image: /sims/property-graph-model/property-graph-model.png
social:
   cards: false
---
# Property Graph Model

<iframe src="main.html" height="550px" width="100%" scrolling="no"></iframe>

[View Property Graph Model Fullscreen](./main.html){ .md-button .md-button--primary }

## Overview

This MicroSim visualizes a **property graph** — the dominant data model used by modern graph databases. Students can click on any node or edge to inspect its properties and see the corresponding Cypher pattern, reinforcing how nodes carry labels and key-value properties while edges carry types and their own properties.

## How to Use

1. **Click any node** to see its label, properties, and Cypher pattern
2. **Click any edge** to see its type, properties, and the Cypher relationship pattern
3. **Hover** over elements for quick preview
4. **Compare node types** — employees (amber ellipses), departments (indigo boxes), and the project (gold diamond) each carry different properties

## Key Concepts

- **Nodes** represent entities (employees, departments, projects) and carry labels and properties
- **Edges** represent relationships and carry their own type and properties
- **Properties** are key-value pairs that enrich both nodes and edges
- The **property graph model** unifies all these elements into a single queryable framework

## References

- [Neo4j Property Graph Model](https://neo4j.com/developer/graph-database/#property-graph)
- [vis-network Documentation](https://visjs.github.io/vis-network/docs/network/)
