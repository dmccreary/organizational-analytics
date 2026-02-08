---
title: Multi-Hop Query Performance
description: An interactive grouped bar chart comparing RDBMS and graph database query performance as traversal depth increases from 1 to 5 hops.
quality_score: 85
---

# Multi-Hop Query Performance

This MicroSim lets you compare how relational databases and graph databases handle increasingly deep traversals. As the number of hops grows, the performance gap between the two approaches becomes dramatic -- and switching between logarithmic and linear scale makes the difference viscerally clear.

<iframe src="./main.html" width="100%" height="520px"></iframe>

[Open Full Screen](./main.html){ .md-button .md-button--primary }

## How to Use This Chart

1. **Hover** over any bar to see the exact query time in milliseconds and a human-readable duration (seconds, minutes, etc.).
2. **Click the scale toggle** button beneath the chart to switch between logarithmic and linear Y-axis. On a linear scale, the graph database bars virtually disappear next to the towering RDBMS bars at 4 and 5 hops.
3. **Compare the growth patterns.** The RDBMS times grow exponentially while the graph database times stay nearly flat.

## Why the Gap Widens

A relational database answers multi-hop queries by performing recursive JOIN operations. Each additional hop multiplies the number of rows the engine must scan, producing an exponential explosion in query time. At 5 hops across 10 million communication records, the database is grinding through billions of intermediate rows.

A graph database stores relationships as direct pointers between nodes. Traversing from one node to its neighbors is a constant-time pointer lookup regardless of overall dataset size. Adding another hop simply follows one more set of pointers, so query time increases only linearly with depth.

| Hops | RDBMS | Graph DB | Speedup |
|------|-------|----------|---------|
| 1 | 10 ms | 5 ms | 2x |
| 2 | 150 ms | 8 ms | 19x |
| 3 | 3,000 ms (3 sec) | 12 ms | 250x |
| 4 | 45,000 ms (45 sec) | 15 ms | 3,000x |
| 5 | 780,000 ms (13 min) | 18 ms | 43,333x |

At five hops the graph database is over **43,000 times faster** than the relational approach.

## Lesson Plan

**Learning Objective:** Students will compare the query performance of relational databases versus graph databases as traversal depth increases, and analyze why the performance gap widens.

**Bloom's Level:** Analyze (Level 4)

### Activities

1. **Predict Before You See (5 min)** -- Before toggling to linear scale, ask students to sketch what they think the chart will look like. Most are surprised by just how invisible the graph database bars become.

2. **Calculate the Speedup (10 min)** -- Have students compute the ratio of RDBMS time to graph time at each hop count. What mathematical function best describes the RDBMS growth curve?

3. **Real-World Scenarios (15 min)** -- Discuss organizational analytics questions that require multi-hop traversals:
    - "Who are the colleagues of my colleagues?" (2 hops)
    - "Find all communication paths between two executives" (3-5 hops)
    - "Identify communities connected through chains of collaboration" (4+ hops)
    - For each scenario, what would the user experience be with an RDBMS at scale?

4. **Reflection (5 min)** -- When would a relational database still be the right choice? Not every query is a multi-hop traversal. Discuss the trade-offs in tooling, ecosystem maturity, and query patterns.

## Data Assumptions

The benchmark scenario assumes:

- **1 million employee nodes** in the database
- **10 million communication relationship records** (emails, messages, meetings)
- RDBMS uses standard recursive CTEs or self-joins for traversal
- Graph database uses native index-free adjacency for pointer-based traversal
- Times are representative order-of-magnitude benchmarks, not from a specific product

## References

- Robinson, I., Webber, J., & Eifrem, E. (2015). *Graph Databases: New Opportunities for Connected Data*. O'Reilly Media.
- Neo4j. "Native Graph Processing and Index-Free Adjacency." [neo4j.com/blog/native-vs-non-native-graph-technology](https://neo4j.com/blog/native-vs-non-native-graph-technology/)
- Angles, R. & Gutierrez, C. (2008). "Survey of Graph Database Models." *ACM Computing Surveys*, 40(1).
