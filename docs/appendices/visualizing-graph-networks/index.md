# Visualizing Graph Networks

Graph networks encode rich structural information — nodes, edges, clusters, hierarchies — but a graph is only as useful as your ability to *see* it. Choosing the right layout algorithm is the difference between a tangle of spaghetti and a clear, actionable picture of your organization.

This appendix surveys the major layout algorithms used to visualize graph networks, explains when each one shines, and connects them to the organizational analytics work throughout this course.

---

## Why Layout Matters

A graph with 200 nodes and 500 edges contains the same data no matter how you draw it. But the *arrangement* of nodes on the screen determines what patterns a human eye can detect:

- **Clusters** become visible when related nodes are grouped together
- **Bridges** stand out when communities are spatially separated
- **Hierarchies** are obvious when parent-child relationships flow top-to-bottom
- **Outliers** are easy to spot when peripheral nodes drift to the edges

No single layout works for every graph. The best choice depends on the structure of your data and the question you're trying to answer.

---

## Force-Directed Layout

Force-directed algorithms are the workhorses of graph visualization. They simulate a physical system where nodes repel each other like charged particles and edges act like springs pulling connected nodes together. The simulation runs until it reaches an equilibrium where the forces balance out.

### How It Works

1. Place nodes at random positions
2. Apply repulsive forces between all node pairs (nodes push apart)
3. Apply attractive forces along edges (connected nodes pull together)
4. Iterate until the system stabilizes

The result is an organic, aesthetically pleasing layout where densely connected clusters naturally group together and sparsely connected regions spread apart.

### Common Algorithms

| Algorithm | Description |
|-----------|-------------|
| **Fruchterman-Reingold** | Classic spring-electric model with cooling schedule; good for small to medium graphs |
| **ForceAtlas2** | Optimized for large graphs with continuous layout; used in Gephi |
| **Barnes-Hut** | Uses spatial partitioning to approximate repulsive forces; scales to thousands of nodes |
| **D3-force** | Configurable velocity-based simulation; the default in D3.js visualizations |

### When to Use It

Force-directed layouts are the best default choice when you don't know the structure of your graph in advance. They excel at revealing:

- **Community structure** — clusters naturally emerge as tightly connected groups
- **Central connectors** — high-degree nodes settle near the center
- **Bridges and brokers** — nodes that connect separate clusters appear between groups
- **Peripheral isolates** — loosely connected nodes drift to the edges

In organizational analytics, force-directed layouts are ideal for visualizing communication networks, advice networks, and collaboration patterns where the goal is to discover hidden structure.

### Limitations

- Results can vary between runs (non-deterministic)
- Performance degrades on graphs with more than a few thousand nodes
- Dense graphs can produce "hairball" visualizations where everything overlaps
- Long, chain-like structures can fold on themselves

---

## Hierarchical Layout

Hierarchical layouts arrange nodes in layers or levels, with edges flowing in a consistent direction — typically top-to-bottom or left-to-right. They are designed for directed acyclic graphs (DAGs) and tree-like structures.

### How It Works

1. Assign each node to a layer based on its depth from root nodes
2. Order nodes within each layer to minimize edge crossings
3. Position nodes to reduce edge bends and improve readability

The Sugiyama algorithm (1981) is the foundation for most hierarchical layout implementations. It solves the layer assignment, crossing minimization, and coordinate assignment problems as separate steps.

### When to Use It

Hierarchical layouts are the natural choice when your data has inherent levels or direction:

- **Org charts** — reporting relationships from CEO to individual contributors
- **Process flows** — data pipeline stages from ingestion to dashboard
- **Dependency graphs** — prerequisite relationships between concepts or tasks
- **Career progression paths** — how roles lead to other roles over time

In this course, the learning graph concept dependency diagram uses a hierarchical layout to show how foundational concepts (at the top) support advanced topics (at the bottom).

### Layout Directions

| Direction | Best For |
|-----------|----------|
| **Top-to-bottom** | Org charts, taxonomies, inheritance hierarchies |
| **Left-to-right** | Process flows, timelines, data pipelines |
| **Bottom-to-top** | Dependency trees where foundations are at the base |
| **Radial** | Hierarchies with a single root and many leaves |

### Example: Organization Chart

The following MicroSim uses a hierarchical top-to-bottom layout to display reporting relationships in a 1,000-employee company. Use the slider to control how many positions are visible and toggle between title-only and full-name labels.

<iframe src="../../sims/org-chart/main.html" width="100%" height="620px" allow="fullscreen" allowfullscreen></iframe>

[View Fullscreen](../../sims/org-chart/main.html)

### Limitations

- Only works well when the graph has a clear directional structure
- Cycles must be broken or handled specially (back-edges)
- Wide hierarchies can become very horizontal and hard to read
- Does not reveal clustering or community structure

---

## Circular Layout

Circular layouts place all nodes on the circumference of one or more circles. Edges are drawn as straight lines or curves between positions on the circle.

### How It Works

1. Arrange nodes evenly around a circle (or in multiple concentric rings)
2. Order nodes to minimize edge crossings where possible
3. Draw edges as chords across the circle

### Variations

| Variation | Description |
|-----------|-------------|
| **Simple circle** | All nodes equally spaced on one ring |
| **Grouped circle** | Nodes grouped by category, with gaps between groups |
| **Concentric circles** | Important nodes in the center ring, peripheral nodes on outer rings |
| **Arc diagram** | Nodes on a line (a "flattened" circle) with arcs above and below |

### When to Use It

Circular layouts are effective when:

- You want to compare connectivity across a known set of entities
- The graph has natural groupings you want to highlight with arc segments
- You need a compact, symmetrical visualization for presentations
- You're showing flows between departments, teams, or categories

In organizational analytics, circular layouts work well for showing communication flow between departments — each department occupies an arc segment, and edges between segments reveal cross-functional collaboration (or the lack of it).

### Limitations

- Edge crossings increase rapidly as the graph gets denser
- Hard to read with more than 50-60 nodes on a single circle
- Doesn't reveal hierarchical structure
- Node ordering significantly affects readability — a bad ordering makes the visualization useless

---

## Grid and Matrix Layouts

Grid layouts arrange nodes on a regular grid. Matrix layouts go further by representing the graph as an adjacency matrix — a square grid where rows and columns are nodes and filled cells indicate edges.

### When to Use It

- **Adjacency matrices** are excellent for dense graphs where force-directed layouts produce hairballs
- **Grid layouts** work for structured data where nodes have a natural row/column mapping (e.g., employees by department and seniority level)
- Pattern detection in large, dense networks — matrices make clusters appear as visual blocks along the diagonal

### Limitations

- Adjacency matrices lose the intuitive "network" appearance
- Row/column ordering is critical — a poor ordering hides structure
- Unfamiliar to audiences who expect node-and-edge diagrams

---

## Geospatial Layout

When nodes have physical locations — office buildings, cities, countries — placing them on a map creates an immediately intuitive visualization.

### When to Use It

- Visualizing collaboration patterns across office locations
- Showing knowledge flow between regional teams
- Mapping talent distribution across geographies

### Limitations

- Only applicable when nodes have meaningful geographic coordinates
- Dense urban areas may need insets or aggregation
- Physical proximity doesn't always correspond to network proximity

---

## Choosing the Right Layout

| Question You're Asking | Best Layout |
|------------------------|-------------|
| What communities exist in this network? | Force-directed |
| Who reports to whom? | Hierarchical |
| How do departments interact? | Circular (grouped) |
| Where are the dense vs. sparse connections? | Matrix |
| How does collaboration vary by office location? | Geospatial |
| What does the data pipeline look like? | Hierarchical (left-to-right) |
| Who are the central connectors? | Force-directed |
| Which teams are siloed? | Force-directed or circular |

In practice, the best approach is often to try multiple layouts on the same data. A force-directed view might reveal clusters you didn't expect, while a hierarchical view of the same graph might clarify the reporting relationships within those clusters.

---

## Layout in vis-network

The vis-network library used in many of this course's MicroSims supports several layout engines:

| vis-network Option | Layout Type |
|--------------------|-------------|
| `physics: { barnesHut: {} }` | Force-directed (default) |
| `layout: { hierarchical: { direction: 'UD' } }` | Hierarchical (top-down) |
| `layout: { hierarchical: { direction: 'LR' } }` | Hierarchical (left-right) |
| Manual `x, y` coordinates | Fixed positions (any layout precomputed externally) |

The `physics` engine in vis-network runs a Barnes-Hut force simulation by default. For hierarchical layouts, physics is typically disabled and the Sugiyama-style layering takes over. You can also precompute positions using an external tool and pass fixed `x, y` coordinates to each node for full control.

---

## Further Reading

- Tamassia, R. (Ed.) (2013). *Handbook of Graph Drawing and Visualization*. CRC Press.
- Kobourov, S. (2012). "Spring Embedders and Force-Directed Graph Drawing Algorithms." *arXiv:1201.3011*.
- Sugiyama, K., Tagawa, S., and Toda, M. (1981). "Methods for Visual Understanding of Hierarchical System Structures." *IEEE Transactions on Systems, Man, and Cybernetics*.
- vis-network documentation: [https://visjs.github.io/vis-network/docs/network/](https://visjs.github.io/vis-network/docs/network/)
