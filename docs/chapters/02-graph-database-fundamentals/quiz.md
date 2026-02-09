# Quiz: Graph Database Fundamentals

Test your understanding of graph data models, nodes, edges, properties, schema design, Cypher queries, and graph performance with these review questions.

---

#### 1. What is a node in a graph database?

<div class="upper-alpha" markdown>
1. A foreign key reference linking two tables together
2. The fundamental unit representing a discrete entity such as a person, department, or project
3. A SQL JOIN operation that combines data from multiple tables
4. A row in a staging table used for temporary data storage
</div>

??? question "Show Answer"
    The correct answer is **B**. A node (sometimes called a vertex) is the fundamental unit of a graph database, representing a discrete entity such as a person, department, project, skill, or event. Each node carries a label that declares its type and can hold properties as key-value pairs. Nodes are roughly analogous to rows in relational tables but are far more flexible -- different nodes with the same label can have different properties, and new properties can be added at any time without schema changes.

    **Concept Tested:** Nodes

---

#### 2. What is the primary purpose of edge properties in an organizational graph?

<div class="upper-alpha" markdown>
1. To replace node labels with more descriptive identifiers
2. To store metadata about the relationship itself, such as frequency or communication channel
3. To enforce uniqueness constraints on connected nodes
4. To serve as foreign keys linking to relational database tables
</div>

??? question "Show Answer"
    The correct answer is **B**. Edge properties store metadata about the relationship between two nodes -- not about the nodes themselves, but about the connection between them. For a COMMUNICATES_WITH edge, properties might include frequency ("daily"), primary channel ("slack"), start date, and average messages per week. These properties are essential for organizational analytics because relationships are rarely binary; people communicate with varying frequency, intensity, and formality, and edge properties capture these nuances.

    **Concept Tested:** Edge Properties

---

#### 3. In a directed graph, what happens to the meaning if you reverse the direction of a MANAGES edge?

<div class="upper-alpha" markdown>
1. Nothing changes because direction is irrelevant in graph databases
2. The query performance improves due to index-free adjacency
3. The meaning changes entirely -- who manages whom is reversed
4. The edge properties are automatically deleted
</div>

??? question "Show Answer"
    The correct answer is **C**. In a directed graph, the direction of an edge is fundamental to its meaning. The edge (James)-[:MANAGES]->(Maria) means James manages Maria, while (Maria)-[:MANAGES]->(James) means Maria manages James -- a completely different organizational relationship. Most graph databases store all edges as directed, and this directionality enables precise modeling of hierarchies, approval workflows, communication patterns, and reporting structures where the source and target roles are distinct.

    **Concept Tested:** Directed Graphs

---

#### 4. What key constraint distinguishes a Directed Acyclic Graph (DAG) from other directed graphs?

<div class="upper-alpha" markdown>
1. DAGs cannot contain more than one hundred nodes
2. DAGs only allow undirected edges between nodes
3. DAGs require every node to have exactly one parent
4. DAGs contain no cycles -- you can never follow directed edges and return to your starting node
</div>

??? question "Show Answer"
    The correct answer is **D**. A Directed Acyclic Graph (DAG) is a directed graph with the crucial constraint that it contains no cycles. You can never start at a node, follow directed edges, and arrive back where you started. This property makes DAGs ideal for modeling reporting hierarchies, approval workflows, prerequisite chains, and project dependencies where processes flow in one direction with a clear start and end. Note that DAGs allow multiple parents (unlike trees), which is useful for matrix organizations.

    **Concept Tested:** Directed Acyclic Graphs

---

#### 5. How do weighted edges enhance organizational analytics compared to unweighted edges?

<div class="upper-alpha" markdown>
1. Weighted edges reduce database storage requirements by compressing node data
2. Weighted edges prevent duplicate nodes from being created during data loading
3. Weighted edges quantify relationship strength, enabling analysis of communication intensity and strongest-path routing
4. Weighted edges automatically convert directed graphs into undirected graphs
</div>

??? question "Show Answer"
    The correct answer is **C**. Weighted edges assign a numerical value to each edge that quantifies some aspect of the relationship, such as communication frequency, intensity, or reciprocity. This enables analyses that unweighted edges cannot support: identifying the strongest communication links, finding the most efficient information routes (highest cumulative weight paths), detecting tightly communicating communities, and modeling influence propagation based on interaction intensity. Not all connections are equal, and weights capture the difference.

    **Concept Tested:** Weighted Edges

---

#### 6. Which principle of graph schema design recommends modeling high-cardinality attributes as separate nodes rather than properties?

<div class="upper-alpha" markdown>
1. Attributes that describe a single entity should always be stored as separate nodes
2. All properties should be removed from nodes to keep the graph lightweight
3. Shared attributes like skills should become nodes connected by edges so they can be independently queried and traversed
4. Edge properties should be converted to node properties for better performance
</div>

??? question "Show Answer"
    The correct answer is **C**. Graph schema design principle five states that high-cardinality attributes connecting entities should be modeled as intermediate nodes. If 500 employees share the skill "Python," creating a Skill node and connecting each employee with a HAS_SKILL edge is far more powerful than storing skills as a property list on each Employee node. This approach enables rich queries like "Who else knows Neo4j?" with a single traversal and supports skill-gap analysis, similarity calculations, and cross-organizational talent discovery.

    **Concept Tested:** Graph Schema Design

---

#### 7. What syntax feature makes Cypher particularly readable compared to SQL for graph queries?

<div class="upper-alpha" markdown>
1. Cypher uses numerical codes instead of human-readable keywords
2. Cypher uses ASCII-art patterns where parentheses represent nodes, brackets represent edges, and arrows show direction
3. Cypher requires all queries to be written in a single line without whitespace
4. Cypher replaces all text with mathematical symbols for conciseness
</div>

??? question "Show Answer"
    The correct answer is **B**. Cypher uses an intuitive ASCII-art syntax that visually resembles the graph patterns being searched. Nodes are represented by parentheses `(node)`, edges by square brackets `[:RELATIONSHIP]`, and arrows `->` show direction. This means `(maria)-[:WORKS_IN]->(engineering)` reads almost like English: "Maria works in Engineering." If you can draw a graph pattern on a whiteboard, you can translate it directly into Cypher, which dramatically lowers the learning curve compared to writing recursive CTEs or multi-way JOINs in SQL.

    **Concept Tested:** Cypher Query Language

---

#### 8. A Cypher query uses the pattern `-[:MANAGES*1..5]->` to find all employees in a management chain up to five levels deep. Which graph traversal concept does this demonstrate?

<div class="upper-alpha" markdown>
1. Index creation for node property lookups
2. Schema migration for adding new edge types
3. Variable-length path traversal across multiple hops
4. Horizontal scaling through graph sharding
</div>

??? question "Show Answer"
    The correct answer is **C**. The `*1..5` syntax in Cypher specifies a variable-length path traversal that follows between 1 and 5 edges of the specified type. This is one of the most powerful features of graph query languages -- a single, concise pattern replaces what would require recursive common table expressions (CTEs) or multiple self-joins in SQL. Variable-length paths enable organizational queries like tracing reporting chains, finding all communication paths between two departments, and exploring influence cascades.

    **Concept Tested:** Graph Traversals

---

#### 9. Why are indexes still necessary in graph databases despite the presence of index-free adjacency?

<div class="upper-alpha" markdown>
1. Index-free adjacency only works for undirected graphs and requires indexes for directed traversals
2. Indexes are needed to find the starting node of a traversal -- without them, the database must scan every node of a label
3. Index-free adjacency has been deprecated in modern graph databases
4. Indexes are required to store edge properties on weighted relationships
</div>

??? question "Show Answer"
    The correct answer is **B**. While index-free adjacency handles traversals efficiently (constant time per hop), the database still needs indexes for the initial node lookup -- finding the starting point of the traversal. A query like `MATCH (e:Employee {name: "Maria Chen"})` must locate Maria's node before edge traversal can begin. Without an index on the name property, this requires scanning every Employee node in the database. The two-phase approach -- indexed lookup followed by pointer-based traversal -- gives graph databases their characteristic performance profile.

    **Concept Tested:** Indexing in Graphs

---

#### 10. An organization with 100,000 employees needs to scale their graph database. Their current single-server deployment is running out of memory. Which scalability strategy should they evaluate first?

<div class="upper-alpha" markdown>
1. Rewriting all Cypher queries to use SQL instead
2. Removing all edge properties to reduce storage requirements
3. Converting from a graph database to a spreadsheet-based solution
4. Adding more RAM and CPU to the existing server (vertical scaling) before considering horizontal distribution
</div>

??? question "Show Answer"
    The correct answer is **D**. Vertical scaling (adding more RAM, CPU, and storage to a single server) is the recommended first step because graph databases benefit enormously from caching the graph structure in memory. A graph that fits entirely in RAM delivers the best possible performance without the complexity of horizontal scaling. Horizontal scaling (distributing across multiple servers) introduces the graph partitioning challenge where traversals must cross machine boundaries, adding latency. For organizations up to approximately 100 million nodes, vertical scaling is often sufficient.

    **Concept Tested:** Graph Scalability

---
