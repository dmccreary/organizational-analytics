---
title: Index-Free Adjacency
description: Animated comparison of graph database pointer-based traversals vs relational database index lookups
quality_score: 85
---

# Index-Free Adjacency

<iframe src="./main.html" width="100%" height="502" style="border: 2px solid #303F9F; border-radius: 8px;" scrolling="no"></iframe>

[Open Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

This side-by-side animation demonstrates **index-free adjacency** -- the key performance property that gives graph databases their traversal speed advantage over relational databases. On the left, a graph database follows direct pointers between nodes (constant time per hop). On the right, a relational database performs B-tree index lookups for each hop (time grows with data size and hop depth).

Click "Next Hop" repeatedly to step through a 5-hop traversal and watch the cumulative time difference grow.

## How to Use

1. Click **Next Hop** to advance the traversal one step on both sides
2. Watch the graph side follow a direct pointer (fast, constant time)
3. Watch the table side perform an index lookup through the B-tree (slower each hop)
4. Compare the timer bars at the bottom as the gap widens
5. Click **Reset** to start over

## Scenarios

| Hop | Graph Database | Relational Database |
|-----|---------------|-------------------|
| **1** | Follow pointer: 15 ms | Index lookup: 65 ms |
| **2** | Follow pointer: 15 ms | Index lookup: 90 ms |
| **3** | Follow pointer: 15 ms | Index lookup: 115 ms |
| **4** | Follow pointer: 15 ms | Index lookup: 140 ms |
| **5** | Follow pointer: 15 ms | Index lookup: 165 ms |
| **Total** | **75 ms** | **575 ms** |

## Key Concepts

- **Index-free adjacency** means each node stores direct physical pointers to its neighbors
- Graph traversal cost is **O(1) per hop** regardless of total database size
- Relational traversal requires **O(log n) index lookups** per hop, where n is the table size
- The performance gap **widens with each additional hop** -- this is why graph databases excel at multi-hop queries like pathfinding, friend-of-friend, and organizational network analysis

## Lesson Plan

**Bloom Level:** Analyze (L4)

**Learning Objective:** Students will explain why index-free adjacency makes graph databases faster for multi-hop traversals compared to relational database index lookups.

### Activities

1. **Step Through All 5 Hops:** Click "Next Hop" five times and observe how the graph side completes each hop in constant time while the relational side slows down.
2. **Watch the B-Tree:** Notice how the index tree lights up during each relational lookup -- this represents the O(log n) traversal through the index structure.
3. **Analyze the Timer Bars:** At which hop does the relational approach fall noticeably behind? Why does the gap accelerate?
4. **Predict at Scale:** If the employee table had 1 million rows instead of 6, how would each side's per-hop time change? (Hint: graph stays O(1), relational becomes O(log 1,000,000).)
5. **Connect to Practice:** Think of a real organizational question that requires 3+ hops (e.g., "Who are the indirect reports of the VP's mentor?"). Why would you choose a graph database for this?

## References

- [Neo4j: Native vs Non-Native Graph Technology](https://neo4j.com/blog/native-vs-non-native-graph-technology/)
- [Graph Databases, 2nd Edition (O'Reilly)](https://www.oreilly.com/library/view/graph-databases-2nd/9781491930885/)
