---
title: HR Graph Data Model
description: An interactive graph visualization showing how employees, departments, and their relationships are modeled as nodes and edges in a graph database.
bloom_level: Understand
bloom_verb: explain
learning_objective: Students will explain how employees, departments, and communications are represented as nodes and edges in a graph database.
chapter: 02-graph-database-fundamentals
---

# HR Graph Data Model

Before you can analyze an organization, you need to model it. This MicroSim shows a small but realistic slice of an organizational graph -- five employees, four departments, and the relationships that connect them. Every hover reveals how the graph database actually stores this data.

<iframe src="./main.html" width="100%" height="620px" style="border: 2px solid #303F9F; border-radius: 8px;" allow="fullscreen" allowfullscreen></iframe>

[Open Full Screen](./main.html){: .md-button .md-button--primary target="_blank" }

## How to Use

1. **Hover over any node** to see its properties in the right panel, along with a Cypher pattern showing how it would be queried in a graph database.
2. **Hover over any edge** to see the relationship type, its properties (frequency, channel, role), and the corresponding Cypher pattern.
3. **Click a node** to highlight its neighborhood -- all directly connected nodes and edges stay vivid while others dim, making the local structure easy to see.
4. **Click the background** to reset the view.

## What You Are Looking At

### Node Types

- **Employee nodes** (amber ellipses) represent individual people. Each carries properties like name, title, department, and hire date.
- **Department nodes** (indigo rectangles) represent organizational units. Each carries headcount and budget properties.

### Edge Types

- **WORKS_IN** (solid gray) connects an employee to their department.
- **COMMUNICATES_WITH** (dashed amber) captures who talks to whom and how often -- daily, weekly, or monthly. These edges are undirected because communication flows both ways.
- **REPORTS_TO** (solid indigo) captures the management hierarchy -- Maria reports to James.
- **HEADED_BY** (solid gold) links a department to the employee who leads it.

### Why Edges Matter

In a relational database, these relationships would require junction tables and foreign keys. In a graph database, relationships are first-class citizens -- stored directly, traversed instantly, and queryable by type, direction, and properties. That is why graph databases excel at organizational analytics: the questions you want to ask ("Who bridges Engineering and Product?") map directly to graph traversal patterns.

## Lesson Plan

### Learning Objective

Students will explain how employees, departments, and communications are represented as nodes and edges in a graph database.

### Warm-Up (5 minutes)

Draw a whiteboard sketch of three people and one department. Ask: "What kinds of connections exist between these entities?" List every type students can think of (works in, reports to, mentors, collaborates with, shares office with, etc.). Point out that each of these is a different edge type.

### Guided Exploration (15 minutes)

1. Students explore the MicroSim, hovering over each node and edge type.
2. For each of the four edge types, students write down: (a) what it connects, (b) what properties it carries, and (c) why that information matters for organizational analytics.
3. Students click on Maria Chen and observe which nodes stay highlighted. Discuss: "What can you learn about Maria just from her graph neighborhood?"

### Discussion (10 minutes)

- What organizational questions could you answer by traversing COMMUNICATES_WITH edges? What about REPORTS_TO edges?
- Carlos and Li communicate only monthly. What might that tell you about cross-team collaboration between Design and Analytics?
- If you added a MENTORS edge type, what new insights could you discover?

### Assessment

Students design a small graph data model for a scenario of their choosing (sports team, student club, restaurant staff). They must include at least two node types and three edge types, with properties on both nodes and edges, and write one Cypher-style pattern that answers an interesting question about their model.

## References

- Robinson, I., Webber, J., & Eifrem, E. (2015). *Graph Databases: New Opportunities for Connected Data*. O'Reilly Media.
- Neo4j Documentation. *Graph Data Modeling Guidelines*. [https://neo4j.com/docs/](https://neo4j.com/docs/)
- Needham, M. & Hodler, A. (2019). *Graph Algorithms: Practical Examples in Apache Spark and Neo4j*. O'Reilly Media.
