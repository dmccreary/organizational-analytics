---
title: "Graph Algorithms: Community and Similarity"
description: Community detection, similarity algorithms, and graph metrics for discovering organizational structure and patterns
generated_by: claude skill chapter-content-generator
date: 2026-02-07 23:45:00
version: 0.04
---

# Graph Algorithms: Community and Similarity

## Summary

This chapter builds on centrality and pathfinding to cover algorithms that detect structure and patterns in organizational networks. Students learn about clustering coefficients, community detection (Louvain, label propagation, modularity), and how to label discovered communities. The chapter also covers similarity algorithms (Jaccard, cosine, node similarity), graph metrics like network density and average path length, connected components, subgraph analysis, and motif detection.

## Concepts Covered

This chapter covers the following 19 concepts from the learning graph:

1. Clustering Coefficient
2. Community Detection
3. Louvain Algorithm
4. Label Propagation
5. Modularity
6. Labeling Communities
7. Similarity Algorithms
8. Jaccard Similarity
9. Cosine Similarity
10. Node Similarity
11. Similar People
12. Similar Roles
13. Similar Events
14. Graph Metrics
15. Network Density
16. Average Path Length
17. Connected Components
18. Subgraph Analysis
19. Motif Detection

## Prerequisites

This chapter builds on concepts from:

- [Chapter 5: Modeling the Organization](../05-modeling-the-organization/index.md)
- [Chapter 7: Graph Algorithms: Centrality and Pathfinding](../07-centrality-and-pathfinding/index.md)

---

## From Individual Importance to Collective Structure

![Aria the Analytics Ant](../../img/aria.png){ width="100", align="right" }

> "My antennae are tingling -- we're onto something big! In Chapter 7 we learned to spot the VIPs in a network. Now we're going to discover the *neighborhoods* they live in. Every organization is a colony -- let's map the work zones."
> -- Aria

In Chapter 7, you learned algorithms that measure the importance of individual nodes -- centrality told you *who* matters, and pathfinding showed you *how* information travels. Those are powerful tools, but they answer questions about individuals. Organizations aren't just collections of important people; they're collections of *groups* -- teams that cluster together, departments that form silos, informal communities that cross every boundary on the org chart.

This chapter gives you the algorithms to see those groups. Community detection reveals the natural clusters hiding in your network. Similarity algorithms tell you which employees, roles, or events resemble each other based on their connections. And graph metrics give you a bird's-eye assessment of your network's overall health -- how dense, how connected, how fragmented.

Think of it this way: centrality is a microscope that lets you examine individual cells. Community and similarity algorithms are the lens that lets you see the organs, the systems, and the body as a whole.

## Clustering Coefficient: How Tight Is the Circle?

Before we detect entire communities, let's start with a fundamental question about local structure: *do your neighbors know each other?*

The **clustering coefficient** measures exactly this. For a given node, it's the ratio of actual connections among its neighbors to the maximum possible connections among them. A high clustering coefficient means the node sits inside a tight-knit group where everyone communicates with everyone else. A low coefficient means the node's contacts are scattered -- they know the node, but not each other.

The local clustering coefficient for a node \( v \) with \( k \) neighbors is:

\[
C(v) = \frac{2 \cdot e}{k \cdot (k - 1)}
\]

where \( e \) is the number of edges that exist between \( v \)'s \( k \) neighbors, and \( k \cdot (k-1)/2 \) is the maximum possible edges in an undirected graph. In a directed graph, the denominator becomes \( k \cdot (k-1) \).

Consider a concrete example. Suppose Elena in Marketing has four direct contacts: Raj, Sofia, Carlos, and Li. If Raj and Sofia communicate with each other, and Carlos and Li communicate with each other, that's 2 actual edges out of a maximum of \( \binom{4}{2} = 6 \). Elena's clustering coefficient is \( 2 \times 2 / (4 \times 3) = 0.33 \).

Now compare that with David in Finance, who also has four contacts -- but all four of them communicate with each other, giving 6 out of 6 possible edges. David's clustering coefficient is 1.0. David sits in a clique; Elena bridges between subgroups.

| Employee | Neighbors | Edges Among Neighbors | Max Possible Edges | Clustering Coefficient |
|---|---|---|---|---|
| Elena (Marketing) | 4 | 2 | 6 | 0.33 |
| David (Finance) | 4 | 6 | 6 | 1.00 |
| Priya (Engineering) | 6 | 3 | 15 | 0.20 |
| Marcus (Sales) | 2 | 1 | 1 | 1.00 |

The **average clustering coefficient** across all nodes gives you a network-level sense of how cliquish the organization is. High average clustering often signals strong departmental cohesion -- or potentially troublesome silos.

In Neo4j GDS, you can compute clustering coefficients with:

```cypher
CALL gds.localClusteringCoefficient.stream('myGraph')
YIELD nodeId, localClusteringCoefficient
RETURN gds.util.asNode(nodeId).name AS employee,
       localClusteringCoefficient
ORDER BY localClusteringCoefficient DESC
```

!!! tip "Aria's Insight"
    In my colony, the fungus-farming chambers had clustering coefficients near 1.0 -- every farmer knew every other farmer. But the foraging teams had much lower coefficients because scouts spread out and reported back through different tunnels. High clustering isn't always good, and low clustering isn't always bad -- context is everything. A tightly clustered department might be deeply collaborative, or it might be a silo that never talks to outsiders.

## Community Detection: Finding the Groups

The clustering coefficient tells you about local neighborhoods. **Community detection** scales that idea up to the entire network -- algorithmically partitioning nodes into groups where members are more densely connected to each other than to the rest of the graph.

In organizational terms, communities often correspond to actual teams, project groups, or informal coalitions that don't appear on any org chart. Detecting them can reveal cross-functional collaborations, departmental silos, or social clusters that influence how decisions really get made.

### Modularity: Measuring Community Quality

Before we can *find* communities, we need a way to evaluate how good a particular grouping is. That's the role of **modularity**, denoted \( Q \). Modularity compares the density of edges *within* detected communities to the density you'd expect in a random graph with the same degree distribution.

\[
Q = \frac{1}{2m} \sum_{ij} \left[ A_{ij} - \frac{k_i k_j}{2m} \right] \delta(c_i, c_j)
\]

where:

- \( m \) is the total number of edges
- \( A_{ij} \) is the adjacency matrix entry (1 if edge exists, 0 otherwise)
- \( k_i \) and \( k_j \) are the degrees of nodes \( i \) and \( j \)
- \( \delta(c_i, c_j) \) is 1 if nodes \( i \) and \( j \) are in the same community, 0 otherwise

Modularity ranges from -0.5 to 1.0. A score above 0.3 generally indicates meaningful community structure. A score near 0 means the grouping is no better than random. In practice, organizational networks typically yield modularity scores between 0.3 and 0.7 -- enough structure to be interesting, enough cross-group communication to keep the organization functional.

### The Louvain Algorithm

The **Louvain algorithm** is the workhorse of community detection in organizational analytics. Named after the Universit&eacute; catholique de Louvain in Belgium, it optimizes modularity through a two-phase iterative process:

1. **Local optimization** -- Each node starts in its own community. The algorithm iterates over every node and moves it to the neighboring community that produces the largest gain in modularity. If no move improves modularity, the node stays put. This continues until no further improvements are possible.

2. **Aggregation** -- The algorithm contracts each community into a single "super-node," preserving internal and external edge weights. Then it repeats phase 1 on the condensed graph.

These two phases alternate until modularity stabilizes. The result is a hierarchical decomposition of the network into communities at multiple levels of granularity -- from broad divisions down to tight-knit teams.

In Neo4j GDS:

```cypher
CALL gds.louvain.stream('myGraph')
YIELD nodeId, communityId
RETURN gds.util.asNode(nodeId).name AS employee,
       communityId
ORDER BY communityId, employee
```

To write the detected community back as a node property:

```cypher
CALL gds.louvain.write('myGraph', {
  writeProperty: 'community'
})
YIELD communityCount, modularity
RETURN communityCount, modularity
```

#### Diagram: Louvain Community Detection
<iframe src="../../sims/louvain-community-detection/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Louvain Community Detection</summary>
Type: microsim

Bloom Taxonomy: Analyze (L4)
Bloom Verb: differentiate
Learning Objective: Students will differentiate how the Louvain algorithm iteratively assigns nodes to communities by optimizing modularity.

Purpose: Visualize the Louvain algorithm's two-phase process on a small organizational network, showing how nodes migrate between communities and how modularity improves at each step.

Layout: A force-directed graph of 15-20 employee nodes with edges representing communication. Nodes are colored by community assignment. A modularity score is displayed prominently.

Interactive controls:
- "Step" button advances the algorithm one iteration, recoloring nodes as they move between communities
- "Run" button animates the full algorithm
- "Reset" button returns to the initial state (each node in its own community)
- Modularity score updates in real time

Data:
- 3-4 natural clusters with some cross-cluster edges
- Include 1-2 bridge nodes that initially oscillate between communities before settling

Visual style: Nodes in Aria amber (#D4880F) family with community colors assigned from a palette. Edges in light gray, with intra-community edges thickening as communities form. Modularity displayed in indigo (#303F9F).

Responsive design: Scale node count and layout to container width.

Implementation: p5.js with canvas-based controls.
</details>

### Label Propagation

**Label propagation** takes a different and more lightweight approach. Instead of optimizing a global function, each node adopts the label (community ID) that the majority of its neighbors carry. The algorithm proceeds in rounds:

1. Every node receives a unique label.
2. In each round, nodes update their label to match the most frequent label among their neighbors (ties broken randomly).
3. The process repeats until labels stabilize -- typically in just a few iterations.

Label propagation is fast -- nearly linear in the number of edges -- which makes it practical for very large organizational networks. The tradeoff is that results can vary between runs due to random tie-breaking and the order in which nodes are processed. Running the algorithm multiple times and comparing results is a common practice.

```cypher
CALL gds.labelPropagation.stream('myGraph')
YIELD nodeId, communityId
RETURN gds.util.asNode(nodeId).name AS employee,
       communityId
ORDER BY communityId, employee
```

| Algorithm | Approach | Speed | Deterministic? | Best For |
|---|---|---|---|---|
| Louvain | Modularity optimization | Moderate | Yes | Quality-sensitive analysis, reporting |
| Label Propagation | Neighbor voting | Fast | No (random tie-breaking) | Large networks, exploratory analysis |

### Labeling Communities

Algorithms produce community IDs -- numbers like 0, 1, 2, 3. These aren't particularly helpful in a meeting with your VP of HR. **Labeling communities** is the critical practice of assigning meaningful names to algorithmically detected groups.

There are several strategies for labeling:

- **Dominant department** -- If 80% of Community 3's members are in Engineering, call it "Engineering Core."
- **Shared project** -- If community members are all assigned to Project Aurora, use that as the label.
- **Geographic cluster** -- Members all in the Chicago office? "Chicago Hub" works.
- **Functional role** -- A community of data analysts scattered across departments might be labeled "Analytics Guild."
- **Key connector** -- Sometimes a community is best described by its central node: "Priya's Network."

In Cypher, you can automate basic labeling by finding the most common department within each community:

```cypher
MATCH (e:Employee)
WHERE e.community IS NOT NULL
WITH e.community AS communityId,
     e.department AS dept,
     count(*) AS memberCount
ORDER BY communityId, memberCount DESC
WITH communityId, collect(dept)[0] AS dominantDept
RETURN communityId, dominantDept AS communityLabel
```

The key insight is that community detection is only half the work. The other half is interpretation -- and that's where your organizational knowledge becomes indispensable.

## Similarity Algorithms: Who Resembles Whom?

Community detection groups nodes that are densely interconnected. **Similarity algorithms** take a different angle: they measure how alike two nodes are based on their neighborhoods, even if the two nodes have no direct connection at all.

This distinction matters enormously in organizational analytics. Two project managers in different offices might never email each other, but if they attend the same types of meetings, hold the same certifications, and collaborate with the same kinds of teams, they're *similar* -- and that similarity has practical implications for mentoring, succession planning, and knowledge transfer.

### Jaccard Similarity

**Jaccard similarity** is the simplest and most intuitive neighborhood comparison. For two nodes \( A \) and \( B \), it measures the overlap of their neighbor sets:

\[
J(A, B) = \frac{|N(A) \cap N(B)|}{|N(A) \cup N(B)|}
\]

where \( N(A) \) is the set of neighbors of node \( A \). The result ranges from 0 (no shared neighbors) to 1 (identical neighbor sets).

Consider two employees:

- **Amir** communicates with {Elena, Raj, Sofia, Carlos}
- **Nadia** communicates with {Elena, Raj, Li, Priya}

Their shared neighbors are {Elena, Raj} (2 people). Their combined unique neighbors are {Elena, Raj, Sofia, Carlos, Li, Priya} (6 people). Jaccard similarity = 2/6 = 0.33.

```cypher
CALL gds.nodeSimilarity.stream('myGraph', {
  similarityMetric: 'JACCARD'
})
YIELD node1, node2, similarity
RETURN gds.util.asNode(node1).name AS person1,
       gds.util.asNode(node2).name AS person2,
       similarity
ORDER BY similarity DESC
LIMIT 10
```

### Cosine Similarity

While Jaccard treats all connections as binary (present or absent), **cosine similarity** accounts for *weighted* relationships. It represents each node as a vector of connection strengths and measures the angle between vectors:

\[
\text{cosine}(A, B) = \frac{\sum_{i} w_{Ai} \cdot w_{Bi}}{\sqrt{\sum_{i} w_{Ai}^2} \cdot \sqrt{\sum_{i} w_{Bi}^2}}
\]

where \( w_{Ai} \) is the weight of node \( A \)'s connection to neighbor \( i \). Cosine similarity ranges from 0 to 1 for non-negative weights.

This is especially useful when communication frequency matters. Two managers who both email the CEO ten times a day are more similar than two managers where one emails the CEO daily and the other emails once a quarter -- even if both technically have the same neighbor set.

### Node Similarity in Practice

**Node similarity** in Neo4j GDS is the umbrella procedure that computes pairwise similarity across the graph. You can configure it to use either Jaccard or cosine metrics, set minimum thresholds, and control how many similar pairs to retain:

```cypher
CALL gds.nodeSimilarity.stream('myGraph', {
  similarityMetric: 'COSINE',
  similarityCutoff: 0.3,
  topK: 5
})
YIELD node1, node2, similarity
RETURN gds.util.asNode(node1).name AS person1,
       gds.util.asNode(node2).name AS person2,
       round(similarity, 3) AS similarity
ORDER BY similarity DESC
```

The `topK` parameter limits each node to its top 5 most similar peers, and `similarityCutoff` filters out weak matches. This keeps results focused and actionable.

#### Diagram: Similarity Algorithm Comparison
<iframe src="../../sims/similarity-comparison/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Similarity Algorithm Comparison</summary>
Type: microsim

Bloom Taxonomy: Evaluate (L5)
Bloom Verb: compare
Learning Objective: Students will compare Jaccard and cosine similarity results on the same network and evaluate which metric is more appropriate for different organizational questions.

Purpose: Interactive side-by-side comparison of Jaccard and cosine similarity for a selected pair of employees, showing how weighted vs. unweighted connections change the similarity score.

Layout: A small network (8-10 nodes) with weighted edges. Two panels below show the Jaccard and cosine calculations for a selected node pair.

Interactive controls:
- Click any two nodes to select a pair
- Display Jaccard calculation: show Venn diagram of neighbor sets, compute intersection/union
- Display cosine calculation: show vector representation and dot product
- Toggle edge weight visibility on/off

Visual style: Aria color scheme. Selected nodes highlighted in amber. Shared neighbors highlighted in gold (#FFD700). Unique neighbors dimmed.

Implementation: p5.js with canvas-based controls.
</details>

## Applications: Finding Similar People, Roles, and Events

Similarity algorithms become powerful organizational tools when applied to specific entity types. Let's explore three key applications.

### Similar People

Finding **similar people** means identifying employees whose network positions, skill profiles, or activity patterns resemble each other. This has direct applications in:

- **Succession planning** -- Who could step into a role if the current holder leaves? Look for people with similar connection patterns and skill adjacencies.
- **Mentoring** -- Pair junior employees with senior employees who have similar network structures and interests.
- **Team assembly** -- When forming a new project team, find people who've successfully operated in similar network positions before.

For example, you might compute similarity based on a bipartite projection -- employees connected to the skills they hold, the projects they've worked on, or the meetings they've attended:

```cypher
// Create a bipartite projection of employees and skills
CALL gds.graph.project(
  'employee-skills',
  ['Employee', 'Skill'],
  {HAS_SKILL: {orientation: 'NATURAL'}}
)

// Find similar people based on shared skills
CALL gds.nodeSimilarity.stream('employee-skills')
YIELD node1, node2, similarity
WHERE gds.util.asNode(node1):Employee
  AND gds.util.asNode(node2):Employee
RETURN gds.util.asNode(node1).name AS person1,
       gds.util.asNode(node2).name AS person2,
       similarity
ORDER BY similarity DESC
LIMIT 10
```

### Similar Roles

**Similar roles** extends the analysis from individuals to job titles or positions. By aggregating the network behaviors of everyone who holds a particular role -- their average connectivity, the departments they interact with, the meeting types they attend -- you can measure how similar two roles are in *practice*, regardless of how they're described in job postings.

This is invaluable for organizational design. If the "Business Analyst" role in Finance and the "Data Analyst" role in Engineering have similarity scores above 0.8, perhaps they should share training programs, career ladders, or even reporting structures.

### Similar Events

**Similar events** applies the same logic to organizational activities. Two recurring meetings that draw the same participants, cover similar topics, and connect the same departments might be candidates for consolidation. Two training programs that attract employees with similar skill profiles might be redundant -- or complementary in ways worth understanding.

| Application | Nodes Compared | Similarity Based On | Organizational Use |
|---|---|---|---|
| Similar People | Employees | Shared skills, projects, contacts | Succession, mentoring, team building |
| Similar Roles | Job titles | Aggregated network behaviors | Org design, career pathing |
| Similar Events | Meetings, trainings | Shared participants, topics | Consolidation, scheduling optimization |

## Graph Metrics: The Network Health Dashboard

Individual algorithms tell you about specific nodes or communities. **Graph metrics** give you the vital signs of the entire network. These are the numbers you'd put on a dashboard and track over time.

### Network Density

**Network density** is the ratio of actual connections to the maximum possible connections. For an undirected graph with \( n \) nodes and \( m \) edges:

\[
D = \frac{2m}{n(n-1)}
\]

Density ranges from 0 (no edges -- nobody talks to anyone) to 1 (complete graph -- everyone talks to everyone). In practice, organizational networks are sparse. A 5,000-person company where every employee communicated with every other employee would have over 12 million edges. Real networks have densities between 0.01 and 0.05, meaning each person communicates with roughly 1-5% of the organization.

But density isn't just a number -- it's a diagnostic. Tracking network density over time can reveal organizational trends:

- **Increasing density** after a merger might indicate successful integration.
- **Decreasing density** during rapid growth could signal onboarding challenges.
- **Sudden drops** in density within a department might flag disengagement or conflict.

### Average Path Length

The **average path length** is the mean number of hops in the shortest paths between all reachable pairs of nodes. It tells you how many "degrees of separation" typically exist between any two people in the organization.

\[
L = \frac{1}{n(n-1)} \sum_{i \neq j} d(i,j)
\]

where \( d(i,j) \) is the shortest path length between nodes \( i \) and \( j \).

A short average path length (2-4 hops) indicates that information can flow quickly across the organization. A long average path length (6+ hops) suggests structural barriers -- silos, geographic isolation, or hierarchical bottlenecks that slow down communication.

```cypher
// Compute shortest paths and average path length
// for a sampled set of node pairs
MATCH (a:Employee), (b:Employee)
WHERE a <> b AND rand() < 0.01
MATCH p = shortestPath((a)-[:COMMUNICATES_WITH*]-(b))
RETURN avg(length(p)) AS averagePathLength,
       max(length(p)) AS diameter
```

!!! note "The Small World Property"
    Many organizational networks exhibit the "small world" property: high clustering coefficients combined with short average path lengths. People cluster into tight teams, but a few bridge individuals keep the overall path lengths short. If your network has high clustering *and* long path lengths, you likely have a silo problem -- clusters exist, but they aren't bridged.

#### Diagram: Network Health Dashboard
<iframe src="../../sims/network-health-dashboard/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Network Health Dashboard</summary>
Type: chart

Bloom Taxonomy: Evaluate (L5)
Bloom Verb: assess
Learning Objective: Students will assess organizational network health by interpreting density, average path length, and clustering coefficient metrics together.

Purpose: Display the three core graph metrics (density, avg path length, clustering coefficient) as gauges or summary cards, with contextual ranges showing healthy, warning, and critical thresholds for organizational networks.

Layout: Three metric cards side by side, each with a gauge visualization and interpretive text.

Metric cards:
1. "Network Density" -- Gauge from 0 to 0.10 (organizational scale). Green zone: 0.02-0.05, Yellow zone: 0.01-0.02 or 0.05-0.08, Red zone: below 0.01 or above 0.08. Default value: 0.034.
2. "Average Path Length" -- Gauge from 1 to 8. Green zone: 2-4, Yellow zone: 4-5, Red zone: above 5 or below 2. Default value: 3.2.
3. "Avg Clustering Coefficient" -- Gauge from 0 to 1. Green zone: 0.3-0.6, Yellow zone: 0.1-0.3 or 0.6-0.8, Red zone: below 0.1 or above 0.8. Default value: 0.45.

Interactive controls:
- Slider to adjust each metric value and see interpretive text change
- A "diagnose" button that reads all three values and provides a combined assessment (e.g., "High clustering + long path length = silo risk")

Visual style: Clean dashboard cards with Aria color scheme. Indigo headers, amber gauge fills, gold highlights for optimal ranges.

Implementation: p5.js with canvas-based gauge elements and slider controls.
</details>

## Connected Components: Is Anyone Isolated?

A **connected component** is a maximal subgraph where every node can reach every other node through some path. In organizational terms, connected components answer a simple but vital question: *is everyone reachable?*

In a healthy organizational network, you'd expect one large connected component containing the vast majority of employees, plus perhaps a few small components representing contractors, recently onboarded employees who haven't yet integrated, or employees in highly isolated roles.

Multiple large components are a red flag. They mean significant portions of the organization literally have no communication path to each other -- not through three hops, not through ten, not at all.

```cypher
CALL gds.wcc.stream('myGraph')
YIELD nodeId, componentId
WITH componentId, collect(gds.util.asNode(nodeId).name) AS members,
     count(*) AS size
RETURN componentId, size, members[..5] AS sampleMembers
ORDER BY size DESC
```

The weakly connected components (WCC) algorithm ignores edge direction -- it just asks whether a path exists. For directed networks, you might also care about **strongly connected components** (SCC), where every node can reach every other node *following edge directions*. Strongly connected components in a communication network represent groups where information flows bidirectionally -- true dialogue rather than one-way broadcasting.

## Subgraph Analysis: Zooming In

Once you've detected communities, identified components, and flagged interesting structures, you often need to drill deeper. **Subgraph analysis** is the practice of extracting a portion of the graph -- a specific community, a department, a project team -- and analyzing it in isolation.

Why not just analyze the whole graph? Because organizational questions are often scoped. "How well-connected is the data science team?" doesn't require computing centrality for all 10,000 employees. Running algorithms on a targeted subgraph is faster, more interpretable, and lets you apply different analytical lenses to different organizational units.

In Neo4j GDS, you create subgraph projections:

```cypher
// Project only Engineering department employees and their relationships
CALL gds.graph.project.cypher(
  'engineering-subgraph',
  'MATCH (e:Employee) WHERE e.department = "Engineering" RETURN id(e) AS id',
  'MATCH (a:Employee)-[r:COMMUNICATES_WITH]->(b:Employee)
   WHERE a.department = "Engineering" AND b.department = "Engineering"
   RETURN id(a) AS source, id(b) AS target, r.weight AS weight'
)

// Now run community detection on just this subgraph
CALL gds.louvain.stream('engineering-subgraph')
YIELD nodeId, communityId
RETURN gds.util.asNode(nodeId).name AS engineer, communityId
```

Subgraph analysis is also essential for comparing organizational units. You might compute network density for every department, then compare them:

| Department | Nodes | Edges | Density | Avg Clustering Coeff |
|---|---|---|---|---|
| Engineering | 120 | 890 | 0.125 | 0.52 |
| Sales | 85 | 310 | 0.087 | 0.38 |
| Marketing | 45 | 280 | 0.282 | 0.61 |
| Finance | 60 | 185 | 0.104 | 0.44 |
| HR | 30 | 156 | 0.359 | 0.72 |

Marketing's high density and clustering suggest a tightly collaborative team. Sales' lower density might reflect a geographically distributed team where reps operate more independently. HR's very high density in a 30-person department is natural -- smaller teams tend to be denser.

#### Diagram: Subgraph Comparison
<iframe src="../../sims/subgraph-comparison/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Subgraph Comparison</summary>
Type: microsim

Bloom Taxonomy: Analyze (L4)
Bloom Verb: compare
Learning Objective: Students will compare graph metrics across departmental subgraphs to identify structural differences between organizational units.

Purpose: Let students select two departments and see their subgraphs side by side with computed metrics, enabling direct structural comparison.

Layout: Split screen with a department subgraph on each side. Metrics displayed below each graph.

Interactive controls:
- Two dropdown selectors to choose departments (Engineering, Sales, Marketing, Finance, HR)
- Each side shows the department's communication subgraph as a force-directed network
- Below each graph: density, average clustering coefficient, average path length, and number of connected components
- A comparison bar at the bottom highlights which metrics differ significantly

Data: Pre-computed metrics for 5 departments, with 15-25 nodes each rendered as small network diagrams.

Visual style: Aria color scheme. Each department in a distinct shade. Metric comparison bars in amber where differences are significant.

Implementation: p5.js with canvas-based controls and dropdown selection via mousePressed() detection.
</details>

## Motif Detection: Recurring Structural Patterns

The most sophisticated structural analysis comes from **motif detection** -- finding recurring small subgraph patterns that appear more frequently than expected by chance. Motifs are the "building blocks" of network architecture, and different types of motifs have organizational significance.

Common organizational motifs include:

- **Triangles** -- Three people who all communicate with each other. The building block of trust and rapid information sharing. High triangle counts indicate strong team cohesion.
- **Feed-forward loops** -- A communicates with B, B communicates with C, and A also communicates with C. Common in mentoring chains and escalation paths.
- **Reciprocal pairs** -- Two people who communicate bidirectionally. The foundation of collaborative relationships.
- **Fan-out stars** -- One person broadcasting to many with no interconnection among recipients. Common for managers sending updates, but a warning sign if it's the dominant pattern in a team that should be collaborating.
- **Broker triads** -- A connects to B and C, but B and C don't connect to each other. A is a broker controlling information flow between otherwise disconnected individuals.

| Motif | Structure | Organizational Meaning | Healthy Sign? |
|---|---|---|---|
| Triangle | A-B-C all connected | Trust, cohesion, redundant communication | Yes -- indicates team bonding |
| Feed-forward loop | A->B->C, A->C | Mentoring chains, escalation | Yes -- structured knowledge flow |
| Fan-out star | A->B, A->C, A->D (no B-C-D) | Broadcasting, one-way communication | Depends -- normal for updates, concerning for teamwork |
| Broker triad | A-B, A-C (no B-C) | Information brokering, gatekeeping | Warning -- single point of failure |

Motif detection combines naturally with community detection. Within a detected community, you can analyze which motifs dominate to characterize the community's collaboration style. A community dominated by triangles operates differently from one dominated by broker triads -- and knowing this helps you tailor interventions.

#### Diagram: Organizational Motifs Gallery
<iframe src="../../sims/organizational-motifs/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Organizational Motifs Gallery</summary>
Type: infographic

Bloom Taxonomy: Understand (L2)
Bloom Verb: classify
Learning Objective: Students will classify common network motifs and explain their organizational significance.

Purpose: Visual gallery showing 5 common organizational motifs, their graph structure, and what they mean in a workplace context.

Layout: Grid of 5 motif cards, each showing a small graph diagram, the motif name, and a brief organizational interpretation. One card is highlighted at a time for detailed explanation.

Interactive controls:
- Click any motif card to highlight it and show a detailed explanation panel below
- Each motif diagram is a small animated graph showing the pattern with labeled nodes (A, B, C, etc.)
- Hover over nodes in the motif to see example roles (e.g., "Manager," "Team Lead," "Engineer")

Motifs:
1. Triangle (3 nodes, 3 edges) -- "Trust cluster"
2. Feed-forward loop (3 nodes, 3 directed edges) -- "Mentoring chain"
3. Reciprocal pair (2 nodes, 2 directed edges) -- "Collaboration bond"
4. Fan-out star (1 hub, 3+ spokes, no spoke-spoke edges) -- "Broadcast pattern"
5. Broker triad (3 nodes, 2 edges through broker) -- "Information gatekeeper"

Visual style: Each motif card has a white background with an indigo (#303F9F) border. Node colors in amber (#D4880F). Edge colors vary by motif type. Selected card has gold (#FFD700) border.

Implementation: p5.js with canvas-based card layout and click interaction.
</details>

## Putting It All Together: A Silo Detection Workflow

Let's walk through a realistic scenario that combines several algorithms from this chapter. Your CHRO has asked: *"Are there silos in our organization, and if so, where?"*

Here's a workflow that answers that question:

**Step 1: Compute graph metrics** to establish a baseline. Calculate network density, average path length, and average clustering coefficient. If density is low and path lengths are long, structural isolation may exist.

**Step 2: Run community detection** (Louvain) to identify natural groupings. Compare detected communities against the official org chart. Communities that map perfectly to departments suggest silos -- people only talk within their own group.

**Step 3: Measure cross-community communication.** For each detected community, count the edges that go to other communities versus edges that stay within. A community where 95% of communication is internal is behaving like a silo.

**Step 4: Label communities** using the dominant department, project, or location. Present findings in terms stakeholders understand.

**Step 5: Identify bridge nodes** by cross-referencing community boundaries with betweenness centrality from Chapter 7. The employees who do connect silos are critical -- and possibly overloaded.

**Step 6: Analyze subgraphs** of suspected silos. Run clustering coefficient analysis within each silo to understand their internal dynamics. A silo with high internal cohesion might just need better *external* bridges.

This workflow uses clustering coefficients, community detection (Louvain), modularity, labeling, graph metrics, subgraph analysis, and connects back to centrality from Chapter 7. That's the power of having a complete algorithm toolkit.

## Chapter Summary

> "Look at you! You just added community detection, similarity, and graph metrics to your toolkit. When I first mapped the specialized work zones in my colony -- the fungus farmers, the waste managers, the foraging crews -- everything about how the colony functioned suddenly made sense. The individual ants mattered, sure, but the *groups* were where the real dynamics lived. That's exactly what you've learned to see today. Not bad at all -- not bad for any number of legs."
> -- Aria

Let's stash the big ideas before we move on:

- **Clustering coefficient** measures how interconnected a node's neighbors are, revealing whether someone sits in a tight-knit group or bridges between separate clusters. The formula \( C(v) = 2e / k(k-1) \) captures the ratio of actual to possible neighbor connections.

- **Community detection** algorithmically partitions a network into groups where internal connections are denser than external ones. It reveals teams, silos, and informal coalitions that don't appear on org charts.

- **The Louvain algorithm** optimizes modularity through iterative local moves and network aggregation, producing hierarchical community structures. It's the go-to algorithm for quality-focused community analysis.

- **Label propagation** offers a faster alternative where nodes adopt the most common label among their neighbors. It's ideal for large networks and exploratory analysis, though results may vary between runs.

- **Modularity** quantifies how good a community partition is by comparing within-community edge density to what you'd expect by chance. Scores above 0.3 indicate meaningful structure.

- **Labeling communities** transforms raw community IDs into meaningful organizational labels using dominant departments, projects, locations, or key connectors. Detection without interpretation is incomplete.

- **Similarity algorithms** measure how alike two nodes are based on their neighborhoods, even without a direct connection. They're the foundation for people matching and organizational comparison.

- **Jaccard similarity** computes the overlap of two nodes' neighbor sets as intersection over union -- simple, intuitive, and effective for unweighted networks.

- **Cosine similarity** extends the comparison to weighted relationships, using vector dot products to account for communication frequency and intensity.

- **Node similarity** in GDS provides a configurable framework for computing pairwise similarity across the graph using either Jaccard or cosine metrics.

- **Similar people** analysis supports succession planning, mentoring, and team assembly by finding employees with comparable network positions and skill profiles.

- **Similar roles** compares job titles based on aggregated network behaviors, revealing when nominally different roles function identically in practice.

- **Similar events** identifies meetings, trainings, or activities with overlapping participants and topics -- candidates for consolidation or coordination.

- **Graph metrics** provide network-level vital signs. They belong on dashboards and should be tracked over time to detect organizational trends.

- **Network density** is the ratio of actual to maximum possible edges. Organizational networks are typically sparse (0.01-0.05), and changes in density signal integration, fragmentation, or growth challenges.

- **Average path length** measures degrees of separation. Short paths (2-4 hops) indicate healthy information flow; long paths (6+) suggest structural barriers.

- **Connected components** reveal whether everyone in the network is reachable. Multiple large components mean parts of the organization are completely disconnected.

- **Subgraph analysis** extracts and analyzes portions of the graph in isolation, enabling department-by-department comparison and focused investigation.

- **Motif detection** finds recurring small structural patterns -- triangles, stars, broker triads -- that characterize how collaboration actually happens within teams and across boundaries.

In Chapter 9, we'll add language to the graph. Natural language processing will let us analyze *what* people communicate about, not just *who* they communicate with. When you combine structural insights from this chapter with semantic insights from NLP, your organizational analytics capability becomes truly formidable.

Six legs, one insight at a time. You've got this.

[See Annotated References](./references.md)
