---
title: Cypher Query Visualizer
description: Interactive tool for executing Cypher query patterns against a sample organizational graph
bloom_level: Apply
bloom_verb: execute
learning_objective: Students will execute pre-built Cypher queries against a sample organizational graph and interpret the highlighted results to understand pattern matching, traversal, and pathfinding in graph databases.
chapter: 06-querying-the-graph
quality_score: 85
---

# Cypher Query Visualizer

Cypher is the query language of graph databases, and the best way to learn it is to see it in action. This MicroSim lets you select pre-built Cypher queries and watch the graph light up with matching nodes and edges -- turning abstract pattern-matching syntax into something you can see and reason about.

<iframe src="./main.html" width="100%" height="502px" style="border: 2px solid #303F9F; border-radius: 8px;" scrolling="no"></iframe>

[Open Full Screen](./main.html){: .md-button .md-button--primary target="_blank" }

## How to Use

1. **Click any query button** on the right panel to execute it against the sample graph.
2. **Watch the graph** -- matched nodes glow amber, matched edges light up, and non-matched elements stay gray.
3. **Read the Cypher code** displayed in the dark code box below the buttons to see the exact syntax that produces each result.
4. **Click Reset** to clear all highlights and return to the default view.

## The Five Queries Explained

### 1. Find Maria

The simplest possible Cypher query: find a single node by a property value. This is the graph equivalent of `SELECT * FROM employees WHERE name = 'Maria'`, but instead of returning a row, it returns a node with all its relationships intact.

### 2. Maria's Dept

Traverse a single WORKS_IN relationship from Maria to her department. This demonstrates how Cypher's arrow syntax (`-[:WORKS_IN]->`) naturally expresses graph traversal -- something that would require a JOIN in SQL.

### 3. Maria's Network

Find everyone Maria communicates with by following COMMUNICATES_WITH edges. The undirected dash syntax (`-[:COMMUNICATES_WITH]-`) means direction does not matter -- we want all communication partners regardless of who initiates.

### 4. Cross-Dept Comm

A more sophisticated pattern: find pairs of people who communicate across department boundaries. This query matches two employees, checks that each works in a different department, and connects them through a COMMUNICATES_WITH edge. In SQL, this would require multiple self-joins.

### 5. Path: Li to James

The `shortestPath` function finds the fewest hops between Li and James through any relationship type. This is a fundamentally graph operation -- there is no clean SQL equivalent. The result reveals hidden connections: Li reaches James through Aisha and Maria.

## What the Graph Contains

- **5 Employee nodes:** Maria, James, Aisha, Carlos, and Li
- **2 Department nodes:** Engineering and Product
- **3 edge types:** WORKS_IN (directed), REPORTS_TO (directed), COMMUNICATES_WITH (undirected)
- **10 total edges** connecting the organizational network

## Lesson Plan

### Learning Objective

Students will execute Cypher queries against a sample organizational graph and explain how each query pattern (node match, traversal, neighbor expansion, cross-boundary filter, and shortest path) maps to an organizational analytics question.

### Warm-Up (5 minutes)

Before opening the MicroSim, write these five questions on the board:

1. Where does Maria work?
2. Who does Maria talk to regularly?
3. Who communicates across department lines?
4. What is the shortest connection between Li and James?
5. Can you find Maria in the database?

Ask students: "Which of these could you answer with a simple spreadsheet lookup? Which ones require understanding relationships?"

### Guided Exploration (15 minutes)

1. Students click through each query in order, observing what highlights and reading the Cypher code.
2. For each query, students write one sentence answering: "What organizational question does this query answer?"
3. After all five, students rank the queries by complexity and discuss what makes the later queries harder to express in SQL.

### Discussion (10 minutes)

- Why does the shortest path query highlight four nodes but only three edges?
- If Carlos also communicated with Li, how would the Cross-Dept Comm results change?
- What other organizational questions would you want to ask this graph?

### Assessment

Students write Cypher patterns (on paper) for two new queries of their own design using this same graph. They should describe what nodes and edges they expect to highlight and what organizational insight the query would reveal.

## References

- Neo4j Documentation. *Introduction to Cypher*. [https://neo4j.com/docs/cypher-manual/current/introduction/](https://neo4j.com/docs/cypher-manual/current/introduction/)
- Robinson, I., Webber, J., & Eifrem, E. (2015). *Graph Databases: New Opportunities for Connected Data*. O'Reilly Media.
- Francis, N. et al. (2018). "Cypher: An Evolving Query Language for Property Graphs." *Proceedings of the 2018 International Conference on Management of Data (SIGMOD)*.
