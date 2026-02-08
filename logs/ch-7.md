---
title: "Graph Algorithms: Centrality and Pathfinding"
description: Centrality measures and pathfinding algorithms for revealing hidden patterns in organizational networks
generated_by: claude skill chapter-content-generator
date: 2026-02-07 14:30:00
version: 0.04
---

# Graph Algorithms: Centrality and Pathfinding

## Summary

This chapter introduces the algorithmic core of organizational analytics. Students learn how graph algorithms reveal hidden patterns in organizational networks. The chapter covers degree centrality (indegree and outdegree), betweenness centrality, closeness centrality, eigenvector centrality, PageRank, and pathfinding algorithms including shortest path, Dijkstra, breadth-first search, and depth-first search.

## Concepts Covered

This chapter covers the following 13 concepts from the learning graph:

1. Graph Algorithms
2. Degree Centrality
3. Indegree
4. Outdegree
5. Betweenness Centrality
6. Closeness Centrality
7. Eigenvector Centrality
8. PageRank
9. Pathfinding Algorithms
10. Shortest Path
11. Dijkstra Algorithm
12. Breadth-first Search
13. Depth-first Search

## Prerequisites

This chapter builds on concepts from:

- [Chapter 2: Graph Database Fundamentals](../02-graph-database-fundamentals/index.md)

---

## The Algorithms That See What You Can't

![Aria the Analytics Ant](../../img/aria.png){ width="100", align="right" }

> "My antennae are tingling — we're onto something big! You've built the graph, loaded the data, modeled the organization, and handled the ethics. Now it's time for the *real* magic. This chapter is where your graph stops being a pretty picture and starts answering questions that no org chart, no spreadsheet, and no HRIS report could ever touch. Let's dig into this!"
> — Aria

You've spent the first six chapters learning to build, load, and ethically manage an organizational graph. You understand nodes, edges, properties, Cypher, traversals, and the property graph model. That foundation matters — but a graph without algorithms is like a map without a compass. You can *see* the territory, but you can't systematically answer questions about it.

This chapter changes that. **Graph algorithms** are the computational tools that extract quantitative insight from graph structure. They transform a network of thousands of nodes and edges into ranked lists, scored metrics, and discovered paths that reveal who truly holds an organization together, where information bottlenecks hide, and which routes communication actually takes.

We'll cover two families of algorithms:

- **Centrality algorithms** answer the question "Who matters most?" — and they define "matters" in surprisingly different ways
- **Pathfinding algorithms** answer the question "How do things flow?" — information, influence, approvals, and escalations

By the end of this chapter, you'll be able to run these algorithms in Neo4j, interpret their results in organizational context, and explain *why* different centrality measures identify different people as "important." That last skill — knowing which measure to use and when — separates practitioners who generate reports from analysts who generate insight.

## Graph Algorithms: The Analytical Engine

A **graph algorithm** is a procedure that takes a graph as input and produces a computed result — a score for every node, a set of discovered paths, a partition of the graph into communities, or a ranking. Graph algorithms exploit the structure of connections in ways that row-and-column analytics simply cannot.

In organizational analytics, graph algorithms answer questions like:

- Who is the most connected person in the communication network?
- Who bridges otherwise disconnected departments?
- If a key person leaves, which communication paths break?
- What is the fastest route for escalating an issue from the field to the executive team?
- Which employees are connected to *other* well-connected employees?

These questions share a common trait: they require understanding not just individual entities but the *pattern of relationships* among them. That's the domain of graph algorithms, and it's where organizational analytics delivers its deepest value.

| Algorithm Family | Core Question | Organizational Application |
|---|---|---|
| Degree centrality | Who has the most connections? | Identify communication hubs |
| Betweenness centrality | Who sits on the most paths between others? | Find information brokers and bottlenecks |
| Closeness centrality | Who can reach everyone else most quickly? | Locate efficient information spreaders |
| Eigenvector centrality | Who is connected to other important people? | Discover influence networks |
| PageRank | Who receives the most "votes" from important neighbors? | Rank employees by network prestige |
| Shortest path / Dijkstra | What's the fastest route between two nodes? | Map escalation paths and communication channels |
| BFS / DFS | How do we systematically explore the graph? | Traverse hierarchies and discover reachability |

## Degree Centrality: Counting Connections

**Degree centrality** is the simplest and most intuitive centrality measure. It counts the number of edges connected to a node. A node with more connections has higher degree centrality. In an organizational communication network, a person who emails, chats with, or meets more distinct colleagues has a higher degree.

For undirected graphs, degree centrality of a node \( v \) is:

\[
C_D(v) = \frac{\text{deg}(v)}{n - 1}
\]

where \( \text{deg}(v) \) is the number of edges incident to \( v \), and \( n \) is the total number of nodes in the graph. Dividing by \( n - 1 \) normalizes the score to a value between 0 and 1, making it comparable across graphs of different sizes.

In directed graphs — which is what most organizational communication networks are — degree splits into two distinct measures:

**Indegree** counts incoming edges. In a communication network, high **indegree** means many people reach out *to* you. This often signals authority, expertise, or a gatekeeper role. The person everyone emails for approval has high indegree.

**Outdegree** counts outgoing edges. High **outdegree** means you reach out *to* many people. This can signal initiative, coordination, or a broadcasting role. The project manager who sends status updates to twelve stakeholders has high outdegree.

\[
C_{in}(v) = \frac{\text{indeg}(v)}{n - 1} \qquad C_{out}(v) = \frac{\text{outdeg}(v)}{n - 1}
\]

The distinction between indegree and outdegree is analytically rich. Consider these organizational scenarios:

| Pattern | Indegree | Outdegree | Interpretation |
|---|---|---|---|
| High in, high out | Many people contact them, they contact many | Communication hub — central coordinator |
| High in, low out | Many people contact them, they contact few | Authority figure or bottleneck |
| Low in, high out | Few contact them, they contact many | Broadcaster — might indicate low reciprocity |
| Low in, low out | Few connections in either direction | Peripheral or isolated employee |

Here's how to compute degree centrality in Neo4j using Cypher:

```cypher
// Indegree: who receives the most communication?
MATCH (target:Employee)<-[:COMMUNICATES_WITH]-(source)
RETURN target.name, COUNT(DISTINCT source) AS indegree
ORDER BY indegree DESC
LIMIT 10
```

```cypher
// Outdegree: who reaches out to the most people?
MATCH (source:Employee)-[:COMMUNICATES_WITH]->(target)
RETURN source.name, COUNT(DISTINCT target) AS outdegree
ORDER BY outdegree DESC
LIMIT 10
```

For normalized degree centrality using the Neo4j Graph Data Science library:

```cypher
CALL gds.degree.stream('orgGraph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS name, score
ORDER BY score DESC
LIMIT 10
```

!!! tip "Aria's Insight"
    High degree centrality doesn't automatically mean influence. The person who sends the most emails might just be CC'ing everyone on everything. In my colony, the ant who touched the most tunnels wasn't the most important — she was just lost. Always pair degree centrality with other measures before drawing conclusions.

#### Diagram: Degree Centrality Explorer
<iframe src="../../sims/degree-centrality-explorer/main.html" width="100%" height="550px" scrolling="no"></iframe>

<details markdown="1">
<summary>Degree Centrality Explorer</summary>
Type: microsim

Bloom Taxonomy: Analyze (L4)
Bloom Verb: differentiate
Learning Objective: Students will differentiate between indegree and outdegree centrality by exploring an interactive organizational communication network and observing how each measure highlights different individuals.

Purpose: Interactive visualization where students toggle between indegree, outdegree, and total degree views of a sample organizational network and see which nodes are highlighted as most central under each measure.

Layout: Central graph display (10-12 employee nodes with directed communication edges). Control panel with three canvas-based buttons: "Indegree," "Outdegree," "Total Degree." Node sizes scale with the selected centrality measure. A ranked list below the graph shows the top 5 employees for the selected measure.

Sample graph data:
- 10 Employee nodes with names and departments
- 20-25 directed COMMUNICATES_WITH edges with varying patterns
- At least one high-indegree/low-outdegree node (authority figure)
- At least one low-indegree/high-outdegree node (broadcaster)
- At least one balanced hub node

Interactive elements:
- Click centrality mode buttons to recompute and resize nodes
- Hover a node to see its exact indegree, outdegree, and total degree
- Color gradient from amber (low) to indigo (high) based on selected centrality

Visual style: Aria color scheme. Nodes sized proportionally to centrality score. Directed edges shown with arrows. Selected measure label displayed prominently.

Implementation: p5.js with canvas-based buttons and force-directed graph layout
</details>

## Betweenness Centrality: Finding the Bridges

**Betweenness centrality** measures how often a node appears on the shortest paths between other pairs of nodes. A node with high betweenness sits "between" many pairs of people — it's a bridge, a broker, a gatekeeper. Remove that node, and communication paths break or become significantly longer.

Formally, the betweenness centrality of a node \( v \) is:

\[
C_B(v) = \sum_{s \neq v \neq t} \frac{\sigma_{st}(v)}{\sigma_{st}}
\]

where \( \sigma_{st} \) is the total number of shortest paths from node \( s \) to node \( t \), and \( \sigma_{st}(v) \) is the number of those shortest paths that pass through \( v \). The normalized version divides by \( \frac{(n-1)(n-2)}{2} \) for undirected graphs.

In organizational terms, betweenness centrality identifies:

- **Information brokers** — people who connect otherwise disconnected teams
- **Single points of failure** — remove this person and departments lose their communication channel
- **Cross-functional connectors** — employees who bridge Engineering and Sales, or R&D and Operations
- **Hidden influencers** — people who may not have formal authority but control information flow

This is one of the most powerful measures in organizational analytics. The employee with the highest betweenness centrality often isn't the CEO, the most senior person, or even the most popular person. It's frequently a mid-level manager, an executive assistant, or a technical lead who sits at the intersection of multiple teams.

```cypher
// Betweenness centrality using GDS
CALL gds.betweenness.stream('orgGraph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS name,
       gds.util.asNode(nodeId).title AS title,
       score
ORDER BY score DESC
LIMIT 10
```

> "See that node with the highest betweenness centrality? That's your colony's equivalent of the ant who knows everyone in every tunnel. In my colony, it was a quiet worker named Bea who never held a leadership title but somehow connected every department. Every organization has a Bea. Your job is to find her." — Aria

## Closeness Centrality: Speed of Reach

**Closeness centrality** measures how close a node is to all other nodes in the graph, based on the sum of shortest path distances. A node with high closeness can reach every other node in fewer hops, making it an efficient spreader of information — or an early receiver of news.

The closeness centrality of a node \( v \) is:

\[
C_C(v) = \frac{n - 1}{\sum_{u \neq v} d(v, u)}
\]

where \( d(v, u) \) is the shortest path distance between \( v \) and \( u \), and \( n \) is the number of nodes. Higher values mean the node is "closer" to everyone else on average.

In organizational analytics, closeness centrality identifies employees who:

- Can disseminate information across the entire network quickly
- Hear news and rumors before most others
- Are positioned to coordinate across the whole organization, not just adjacent teams
- Would make effective change agents for organization-wide initiatives

A practical caveat: closeness centrality requires the graph to be connected (every node reachable from every other). In real organizational networks, disconnected components are common — the contractor team that only communicates among themselves, the remote office with no cross-office email traffic. For disconnected graphs, use **harmonic centrality**, which handles unreachable pairs gracefully:

\[
C_H(v) = \frac{1}{n - 1} \sum_{u \neq v} \frac{1}{d(v, u)}
\]

where unreachable pairs contribute 0 (since \( 1/\infty = 0 \)).

```cypher
// Closeness centrality using GDS
CALL gds.closeness.stream('orgGraph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS name, score
ORDER BY score DESC
LIMIT 10
```

#### Diagram: Centrality Comparison Dashboard
<iframe src="../../sims/centrality-comparison/main.html" width="100%" height="600px" scrolling="no"></iframe>

<details markdown="1">
<summary>Centrality Comparison Dashboard</summary>
Type: microsim

Bloom Taxonomy: Evaluate (L5)
Bloom Verb: compare
Learning Objective: Students will compare how degree, betweenness, and closeness centrality measures rank the same nodes differently and evaluate which measure is most appropriate for different organizational questions.

Purpose: Side-by-side comparison of three centrality measures on the same organizational graph. Students see how the same network produces different rankings depending on the centrality measure selected.

Layout: Top section shows the organizational graph (12-15 nodes) where node sizes reflect the currently selected centrality measure. Bottom section shows a bar chart with the top 5 ranked employees for each of three measures displayed simultaneously.

Sample graph data:
- 12-15 employee nodes across 3 departments
- One node is a high-degree hub (many connections but not bridging)
- One node is a high-betweenness bridge (connecting two clusters)
- One node is a high-closeness center (geometrically central, short average paths)
- These three should be DIFFERENT nodes to illustrate the distinction

Interactive elements:
- Three canvas-based toggle buttons: "Degree," "Betweenness," "Closeness"
- Selected measure resizes graph nodes and highlights the top-ranked node with a gold ring
- Bar chart updates to show rankings for selected measure
- Hover on any node to see all three centrality scores simultaneously

Visual style: Aria color scheme. Department clusters in light shading. Node colors on a gradient from amber (low) to indigo (high). Gold ring on top node.

Implementation: p5.js with canvas-based controls and dual visualization (graph + bar chart)
</details>

## Eigenvector Centrality: The Power of Powerful Friends

**Degree centrality** counts how many connections you have. **Eigenvector centrality** asks a deeper question: are your connections themselves well-connected? A node scores high on eigenvector centrality when it connects to other high-scoring nodes. It's the mathematical formalization of the idea that *who you know matters as much as how many you know*.

The eigenvector centrality of node \( v \) is defined recursively:

\[
x_v = \frac{1}{\lambda} \sum_{u \in N(v)} x_u
\]

where \( N(v) \) is the set of neighbors of \( v \), \( x_u \) is the centrality of neighbor \( u \), and \( \lambda \) is a normalization constant (the largest eigenvalue of the adjacency matrix). The circularity — your score depends on your neighbors' scores, which depend on *their* neighbors' scores — is resolved through iterative computation until values converge.

In organizational terms, eigenvector centrality identifies:

- **Influence network members** — employees connected to other influential employees
- **Executive inner circles** — people with direct access to decision-makers
- **Strategic positions** — roles that connect to other strategically connected roles
- **Political capital** — the organizational equivalent of "it's not what you know, it's who you know"

Eigenvector centrality reveals the informal power structure that org charts completely miss. Two employees might each have ten communication connections, but if one communicates with directors and VPs while the other communicates with interns and temps, their eigenvector centrality scores will be vastly different.

```cypher
// Eigenvector centrality using GDS
CALL gds.eigenvector.stream('orgGraph', {maxIterations: 20})
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS name,
       gds.util.asNode(nodeId).title AS title,
       score
ORDER BY score DESC
LIMIT 10
```

## PageRank: Google's Gift to Organizational Analytics

**PageRank** is the algorithm that made Google famous. Originally designed to rank web pages by the "importance" of pages linking to them, PageRank translates beautifully to organizational networks. It's a variant of eigenvector centrality with one critical addition: a **damping factor** that models the probability of random jumps.

The PageRank of a node \( v \) is:

\[
PR(v) = \frac{1 - d}{n} + d \sum_{u \in B(v)} \frac{PR(u)}{L(u)}
\]

where \( d \) is the damping factor (typically 0.85), \( B(v) \) is the set of nodes that link to \( v \), \( L(u) \) is the number of outgoing links from node \( u \), and \( n \) is the total number of nodes.

The intuition is elegant: imagine a random employee who, at each step, either follows one of their communication links to another person (with probability \( d = 0.85 \)) or jumps to a completely random person in the organization (with probability \( 1 - d = 0.15 \)). After thousands of such random walks, the fraction of time this "random walker" spends at each node is that node's PageRank. Nodes that are visited more often are more "important" in the network.

Why use PageRank instead of eigenvector centrality? Two reasons:

1. **PageRank handles directed graphs naturally** — it respects edge direction, so it measures who receives importance from others, not just who is connected to important people
2. **PageRank converges on any graph** — eigenvector centrality can fail to converge on directed graphs with certain structures (dangling nodes, disconnected components)

In organizational analytics, PageRank answers: "If communication flows like web traffic, who accumulates the most organizational attention?" People with high PageRank receive communication from people who themselves receive a lot of communication — a recursive measure of networked prestige.

```cypher
// PageRank using GDS
CALL gds.pageRank.stream('orgGraph', {
  dampingFactor: 0.85,
  maxIterations: 20
})
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS name,
       gds.util.asNode(nodeId).title AS title,
       score
ORDER BY score DESC
LIMIT 10
```

| Centrality Measure | What It Captures | Best Organizational Question |
|---|---|---|
| Degree (indegree) | Who receives the most communication? | Who are the go-to people? |
| Degree (outdegree) | Who initiates the most communication? | Who are the coordinators and broadcasters? |
| Betweenness | Who sits on paths between others? | Who bridges departments? Who is a bottleneck? |
| Closeness | Who can reach everyone quickly? | Who should lead an org-wide change initiative? |
| Eigenvector | Who is connected to other important people? | Who has informal influence? |
| PageRank | Who receives importance from important senders? | Who has the highest networked prestige? |

!!! warning "Common Mistake"
    Don't confuse high degree centrality with actual influence. The person who sends the most emails isn't necessarily the most important — they might just be over-CC'ing. And high betweenness doesn't always mean someone is *choosing* to broker information; they might be an unwilling bottleneck. Pair your centrality measures with qualitative context before making organizational decisions. As Aria says, "Gorgeous data deserves a gorgeous interpretation."

## From Centrality to Pathfinding

Centrality algorithms score *nodes* — they tell you who is important and why. **Pathfinding algorithms** focus on *routes* — they tell you how things flow between nodes. Together, they give you a complete picture: centrality identifies the key players, and pathfinding maps the channels between them.

In organizational networks, pathfinding answers questions like:

- What's the fastest escalation path from a field support rep to the CTO?
- If two departments need to coordinate, what's the shortest communication chain between their leaders?
- How many independent communication routes exist between the VP of Sales and the VP of Engineering?
- Which paths carry the strongest (or weakest) communication signal?

## Shortest Path

The **shortest path** between two nodes is the path that traverses the fewest edges. In an unweighted graph, "shortest" means "fewest hops." In organizational terms, it's the minimum number of people a message must pass through to get from person A to person B.

The shortest path is computed using **breadth-first search** (BFS), which we'll examine in detail shortly. The key property of BFS that makes it work for shortest path is that it explores nodes in order of their distance from the starting node — it visits all nodes at distance 1 before distance 2, distance 2 before distance 3, and so on. The first time BFS reaches the target node, it has found the shortest path.

```cypher
// Shortest path between two employees
MATCH path = shortestPath(
  (alice:Employee {name: "Alice Park"})
  -[:COMMUNICATES_WITH*]->
  (bob:Employee {name: "Bob Martinez"})
)
RETURN path, length(path) AS hops
```

```cypher
// All shortest paths (there may be multiple)
MATCH path = allShortestPaths(
  (alice:Employee {name: "Alice Park"})
  -[:COMMUNICATES_WITH*]->
  (bob:Employee {name: "Bob Martinez"})
)
RETURN path, length(path) AS hops
```

Finding multiple shortest paths is analytically powerful. If there are three independent shortest paths between the VP of Sales and the VP of Engineering, the communication link is robust — removing one intermediary doesn't sever the connection. If there's only one shortest path, the intermediary is a critical single point of failure (and likely has high betweenness centrality — see how the algorithms connect?).

## The Dijkstra Algorithm: Weighted Shortest Paths

In real organizational networks, not all communication edges are equal. An edge representing daily one-on-one meetings carries more weight than an edge representing a single forwarded newsletter. When edges have weights, the simple hop-counting shortest path gives way to the **Dijkstra algorithm**, which finds the path that minimizes total edge weight.

**Dijkstra's algorithm** works by maintaining a priority queue of nodes sorted by their currently known shortest distance from the source. At each step, it:

1. Removes the node with the smallest known distance from the queue
2. Examines all of that node's neighbors
3. For each neighbor, calculates the distance through the current node
4. If this new distance is shorter than the previously known distance, updates it
5. Repeats until the target node is removed from the queue

The algorithm guarantees finding the optimal path as long as all edge weights are non-negative. In organizational analytics, edge weights often represent communication *cost* (inverse of frequency or strength), so Dijkstra finds the *strongest* communication path when you invert the weights.

```cypher
// Dijkstra: shortest weighted path
MATCH (start:Employee {name: "Alice Park"}),
      (end:Employee {name: "Bob Martinez"})
CALL gds.shortestPath.dijkstra.stream('orgGraph', {
  sourceNode: start,
  targetNode: end,
  relationshipWeightProperty: 'cost'
})
YIELD nodeIds, costs, totalCost
RETURN [id IN nodeIds | gds.util.asNode(id).name] AS path,
       totalCost
```

A practical tip: when your edges represent communication *strength* (higher is better), you'll want to transform weights to *costs* (lower is better) before running Dijkstra. A common approach is \( \text{cost} = \frac{1}{\text{strength}} \) or \( \text{cost} = \text{max\_strength} - \text{strength} \).

#### Diagram: Pathfinding Algorithms Visualizer
<iframe src="../../sims/pathfinding-visualizer/main.html" width="100%" height="600px" scrolling="no"></iframe>

<details markdown="1">
<summary>Pathfinding Algorithms Visualizer</summary>
Type: microsim

Bloom Taxonomy: Apply (L3)
Bloom Verb: demonstrate
Learning Objective: Students will demonstrate how shortest path and Dijkstra's algorithm find different optimal paths in a weighted organizational network and explain why edge weights change the result.

Purpose: Interactive visualization showing how unweighted shortest path (BFS) and weighted shortest path (Dijkstra) find different routes through the same organizational network when edge weights are introduced.

Layout: A graph of 8-10 employee nodes with weighted edges. Two panels at the top: "Unweighted (BFS)" and "Weighted (Dijkstra)." Students select a source and target node, then run each algorithm to see the paths discovered.

Sample graph data:
- 8-10 employee nodes across 2-3 departments
- Edges with weights representing communication frequency (1-10 scale)
- The unweighted shortest path (fewest hops) should differ from the weighted shortest path (lowest total cost) for at least one source-target pair

Interactive elements:
- Click a node to set it as source (highlighted in amber), click another to set as target (highlighted in gold)
- "Find Path (BFS)" button highlights the unweighted shortest path
- "Find Path (Dijkstra)" button highlights the weighted shortest path
- Both paths can be shown simultaneously in different colors (indigo for BFS, amber for Dijkstra)
- Edge weights displayed as labels on edges
- Total cost displayed for each path

Visual style: Aria color scheme. Nodes in light gray by default. Source node in amber, target in gold. BFS path edges in indigo, Dijkstra path edges in amber. Edge weight labels in small text.

Implementation: p5.js with canvas-based buttons and animated path highlighting
</details>

## Breadth-First Search: Exploring Layer by Layer

**Breadth-first search (BFS)** is a graph traversal strategy that explores all neighbors of the current node before moving deeper. It visits nodes in order of their distance from the starting node — first all nodes at distance 1 (direct contacts), then all nodes at distance 2 (contacts of contacts), then distance 3, and so on.

The BFS algorithm uses a queue (first-in, first-out):

1. Start at the source node; add it to the queue and mark it as visited
2. Remove the front node from the queue
3. For each unvisited neighbor of that node, mark it as visited and add it to the queue
4. Repeat steps 2-3 until the queue is empty (or the target is found)

BFS guarantees discovering the shortest path in unweighted graphs. It also naturally produces a "distance map" — how far every node is from the starting node. In organizational analytics, this is extremely useful:

- **Organizational distance analysis:** How many hops separate the CEO from every employee? A healthy communication network has short average distances; a siloed one has long tails.
- **Neighborhood exploration:** Who are the second-degree and third-degree connections of a departing executive? These are the people most likely affected by the departure.
- **Reachability analysis:** Starting from the head of Sales, which employees can be reached through communication edges? Unreachable employees may indicate organizational silos.

> "In my colony, BFS is what happens when the queen sends a colony-wide alert — the message radiates outward from her chamber, level by level, until every tunnel has been reached. It's orderly, predictable, and guaranteed to reach every connected ant. DFS would be one scout ant following a single pheromone trail all the way to the food source before doubling back to try another. Both are essential — and both map perfectly to how you'll explore organizational graphs." — Aria

## Depth-First Search: Exploring Path by Path

**Depth-first search (DFS)** is the complementary traversal strategy. Where BFS explores broadly, DFS explores deeply — following one path as far as it goes before backtracking and trying another. It uses a stack (last-in, first-out) instead of a queue, which creates the characteristic "go deep, then backtrack" behavior.

The DFS algorithm:

1. Start at the source node; push it onto the stack and mark it as visited
2. Peek at the top of the stack
3. If that node has an unvisited neighbor, mark the neighbor as visited and push it onto the stack
4. If that node has no unvisited neighbors, pop it off the stack (backtrack)
5. Repeat steps 2-4 until the stack is empty

DFS doesn't find shortest paths (that's BFS's job), but it excels at:

- **Cycle detection:** Does the reporting hierarchy contain circular chains? DFS detects cycles by finding "back edges" — edges that point to a node already on the current exploration stack.
- **Topological sorting:** Ordering tasks or approvals so that prerequisites come first. DFS produces a topological order naturally through its post-order traversal.
- **Exhaustive path enumeration:** Find *all* possible communication paths between two employees, not just the shortest one. This is useful for redundancy analysis and influence modeling.
- **Connected component discovery:** Which groups of employees form isolated clusters with no cross-group communication?

| Feature | BFS | DFS |
|---|---|---|
| Data structure | Queue (FIFO) | Stack (LIFO) |
| Exploration pattern | Level by level | Path by path |
| Finds shortest path? | Yes (unweighted) | No |
| Detects cycles? | Not directly | Yes |
| Memory usage | High (stores entire frontier) | Lower (stores current path) |
| Topological sort? | No | Yes |
| Best org use case | Distance analysis, shortest paths | Cycle detection, exhaustive path search |

#### Diagram: BFS vs DFS Traversal Animator
<iframe src="../../sims/bfs-vs-dfs/main.html" width="100%" height="550px" scrolling="no"></iframe>

<details markdown="1">
<summary>BFS vs DFS Traversal Animator</summary>
Type: microsim

Bloom Taxonomy: Analyze (L4)
Bloom Verb: contrast
Learning Objective: Students will contrast the traversal order of BFS and DFS on the same organizational graph and predict the order in which nodes will be visited by each algorithm.

Purpose: Animated side-by-side comparison of BFS and DFS traversing the same organizational graph, showing the different exploration orders and the queue/stack data structures in real time.

Layout: Two graph panels side by side, each displaying the same 8-node organizational graph. Below each graph, a visual representation of the queue (BFS) or stack (DFS) showing which nodes are currently waiting to be explored.

Sample graph data:
- 8 employee nodes arranged in a tree-like structure with some cross-links
- One designated start node (highlighted)
- Edges representing communication relationships

Interactive elements:
- "Start" button begins both traversals simultaneously
- "Step" button advances both traversals one step at a time
- "Reset" button restores the initial state
- Speed slider controls animation speed
- Visited nodes change color progressively (from amber to indigo based on visit order)
- Current node highlighted with gold ring
- Queue/stack display updates at each step, showing add/remove operations

Visual style: Aria color scheme. Unvisited nodes in light gray. Visited nodes colored on an amber-to-indigo gradient based on visit order. Current node has gold ring. Queue drawn as horizontal boxes (FIFO). Stack drawn as vertical boxes (LIFO).

Implementation: p5.js with canvas-based buttons, slider, and animated graph rendering
</details>

## Choosing the Right Algorithm

With six centrality measures and four pathfinding algorithms in your toolkit, how do you choose the right one for a given organizational question? The answer depends on what you're trying to learn.

**Start with the question, not the algorithm.** Here's a decision framework:

- "Who are the busiest communicators?" — **Degree centrality**
- "Who should I worry about losing?" — **Betweenness centrality** (single points of failure)
- "Who could spread a message org-wide fastest?" — **Closeness centrality**
- "Who has access to power?" — **Eigenvector centrality**
- "Who has the highest overall network prestige?" — **PageRank**
- "What's the fastest route between A and B?" — **Shortest path** (unweighted) or **Dijkstra** (weighted)
- "How far is everyone from the CEO?" — **BFS**
- "Does our hierarchy have circular reporting?" — **DFS**

In practice, you'll often run multiple algorithms on the same graph and compare results. When the same person ranks high on *every* centrality measure, they're genuinely central to the organization. When different people top different measures, you've discovered the specialized roles that make the network function — the broker, the hub, the influencer, and the efficient spreader are often different people playing complementary roles.

#### Diagram: Centrality Algorithm Decision Tree
<iframe src="../../sims/centrality-decision-tree/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Centrality Algorithm Decision Tree</summary>
Type: diagram

Bloom Taxonomy: Evaluate (L5)
Bloom Verb: select
Learning Objective: Students will select the most appropriate centrality or pathfinding algorithm for a given organizational analytics question by navigating a decision tree.

Purpose: Interactive decision tree that guides students from an organizational question to the most appropriate algorithm. Students answer yes/no questions about their analytical goal and are directed to the right algorithm with an explanation of why.

Layout: A flowchart-style decision tree with 4-5 branching questions. Each leaf node names an algorithm and provides a one-sentence justification.

Decision flow:
1. "Are you scoring nodes or finding routes?" -> Nodes: centrality branch; Routes: pathfinding branch
2. Centrality branch: "Do edges have weights?" -> Yes: weighted variants; No: unweighted
3. "Do you care about who your connections know?" -> Yes: Eigenvector/PageRank; No: Degree/Betweenness/Closeness
4. "Are you looking for bridges or hubs?" -> Bridges: Betweenness; Hubs: Degree
5. Pathfinding branch: "Do edges have weights?" -> Yes: Dijkstra; No: BFS shortest path
6. "Do you need exhaustive exploration?" -> Yes: DFS; No: BFS

Interactive elements:
- Click yes/no buttons at each decision point to navigate the tree
- Selected path highlights in amber
- Final algorithm recommendation appears in a styled card with use case example
- "Reset" button to try a different path

Visual style: Aria color scheme. Decision nodes in indigo circles. Answer paths in amber. Leaf nodes (algorithms) in gold-bordered cards.

Implementation: p5.js with canvas-based button interactions and tree rendering
</details>

## Ant Colony Optimization: When Nature Meets Graph Theory

It would be a disservice to cover pathfinding in a book guided by an ant without mentioning **ant colony optimization (ACO)** — a real family of graph algorithms inspired by how actual ant colonies find shortest paths.

In nature, ants deposit **pheromone trails** as they walk. When an ant finds food and returns to the colony, it reinforces the trail with more pheromone. Shorter paths get traversed more quickly, so pheromone accumulates faster on shorter routes. Over time, the colony converges on an approximately optimal path without any individual ant knowing the full graph.

ACO algorithms formalize this behavior for computational pathfinding:

1. Multiple "artificial ants" explore the graph simultaneously
2. Each ant probabilistically chooses its next step based on pheromone intensity and edge distance
3. After completing a path, ants deposit pheromone proportional to path quality
4. Pheromone evaporates over time, preventing convergence on suboptimal paths
5. After many iterations, the pheromone-heavy paths approximate the best solution

While you won't typically use ACO for organizational analytics (Dijkstra and BFS are more efficient for exact solutions), the conceptual parallel is illuminating: organizations, like ant colonies, develop "pheromone trails" — habitual communication paths that strengthen with use. Organizational analytics reveals these trails, and sometimes you discover that the well-worn path isn't the optimal one. That's when restructuring makes a difference.

## Putting Algorithms to Work: An Organizational Case Study

Let's tie everything together with a practical scenario. Imagine you're an organizational analyst at a company of 500 employees. Leadership is concerned about communication silos between the Product and Engineering departments. Here's your analytical playbook:

**Step 1: Degree centrality** — Identify the most connected communicators in each department. Are there natural hubs who could serve as bridges?

**Step 2: Betweenness centrality** — Find employees who already bridge Product and Engineering. These are your existing cross-functional connectors. How many are there? Are they overloaded?

**Step 3: Shortest path** — Calculate the shortest communication path between the head of Product and the head of Engineering. Is it 2 hops (healthy) or 6 hops (problematic)?

**Step 4: Closeness centrality** — Among employees who communicate with both departments, who has the shortest average distance to everyone? This person could serve as a formal liaison.

**Step 5: PageRank** — Run PageRank on the combined Product-Engineering subgraph. Who has the highest networked prestige? This person's endorsement of cross-team collaboration would carry the most weight.

This multi-algorithm approach produces actionable intelligence that no single measure could provide. The degree analysis finds hubs. The betweenness analysis finds bridges. The shortest path analysis quantifies the silo. The closeness analysis identifies liaison candidates. And PageRank validates who has the social capital to drive change.

## Chapter Summary

> "Let's stash the big ideas before we move on:"
> — Aria

- **Graph algorithms** are the computational engine of organizational analytics. They transform graph structure into quantitative scores and discovered paths that reveal hidden organizational dynamics.

- **Degree centrality** counts connections. **Indegree** measures incoming communication (authority, expertise), while **outdegree** measures outgoing communication (coordination, broadcasting). It's the simplest centrality measure — useful but incomplete on its own.

- **Betweenness centrality** identifies bridge nodes that sit on shortest paths between other pairs. In organizations, these are information brokers, cross-functional connectors, and potential single points of failure. This is often the most actionable centrality measure for identifying organizational risk.

- **Closeness centrality** measures how quickly a node can reach all others. High closeness means efficient information spreading — ideal for identifying change agents and communication leads.

- **Eigenvector centrality** weights connections by the importance of the connected nodes. It reveals informal power structures and influence networks that org charts miss entirely.

- **PageRank** extends eigenvector centrality for directed graphs with a damping factor. It measures networked prestige — who receives communication attention from people who themselves receive a lot of attention.

- **Pathfinding algorithms** map routes through the graph. The **shortest path** (via **BFS**) finds minimum-hop routes. **Dijkstra's algorithm** finds minimum-cost routes in weighted graphs. Both are essential for analyzing communication channels, escalation paths, and organizational distance.

- **Breadth-first search** explores level by level — ideal for shortest paths, distance analysis, and neighborhood exploration. **Depth-first search** explores path by path — ideal for cycle detection, topological sorting, and exhaustive path enumeration.

- Different centrality measures highlight different people as "important." The communicator hub, the bridge, the efficient spreader, and the influence-connected insider are usually different individuals playing complementary roles. **Running multiple algorithms and comparing results** is the hallmark of sophisticated organizational analysis.

- Ant colony optimization reminds us that nature solved pathfinding long before computer scientists did. Organizations develop their own pheromone trails — habitual communication paths — and your job is to map them, evaluate them, and sometimes redirect them.

Six legs, one insight at a time. You've just learned the algorithmic core of organizational analytics — the tools that turn a graph from a static model into a dynamic analytical engine. In the next chapter, we'll use these foundations to discover communities and measure similarity within your organizational network. Follow the trail — the data always leads somewhere.
