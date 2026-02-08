---
title: Relational vs Graph Database
description: Side-by-side interactive comparison showing how the same organizational question is represented and queried in a relational database versus a graph database.
quality_score: 85
---

# Relational vs Graph Database

<iframe src="./main.html" width="100%" height="502" style="border: 2px solid #303F9F; border-radius: 8px;" scrolling="no"></iframe>

[Open Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

This side-by-side comparison lets you see how the *same data* and the *same questions* play out in two very different database paradigms. On the left, a relational database with SQL queries. On the right, a graph database with Cypher queries and a visual network.

Click through the four scenario buttons to see how each database handles increasingly complex relationship queries -- from simple one-hop lookups to multi-hop traversals and pathfinding.

## Scenarios

| Scenario | Question | RDBMS | Graph |
|----------|----------|-------|-------|
| **1-Hop** | Who does Maria communicate with? | Fast (one JOIN) | Fast (one traversal) |
| **2-Hop** | Friends of Maria's friends? | Slower (multiple JOINs) | Still fast |
| **Path** | Shortest path Maria to Carlos? | Complex recursive CTE | Native operation |
| **Aggregate** | Most connected department? | Multi-table GROUP BY | Simple pattern match |

## Key Takeaway

As relationship depth increases, relational databases require exponentially more JOINs and increasingly complex SQL. Graph databases, by contrast, store relationships natively and traverse them in constant time per hop. This is why organizational network analysis is a natural fit for graph databases.

## Lesson Plan

**Bloom Level:** Analyze (L4)

**Learning Objective:** Students will compare how the same organizational question is represented in a relational database versus a graph database.

### Activities

1. **Click Through All Scenarios:** Start with "1-Hop" and work through to "Aggregate." Watch the timing bars change.
2. **Read the Queries:** Compare the SQL on the left with the Cypher on the right. Which is easier to read for each scenario?
3. **Analyze the Tradeoffs:** For which scenarios does the relational approach work well enough? At what point does graph become clearly superior?
4. **Predict:** If we added 1,000 employees instead of 5, how would each scenario's timing change for RDBMS vs. Graph?
5. **Reflect:** Why do most organizations still use relational databases for their core HR data? When should they consider adding a graph layer?
