# Quiz: Graph Algorithms -- Centrality and Pathfinding

Test your understanding of centrality measures and pathfinding algorithms for revealing hidden patterns in organizational networks with these review questions.

---

#### 1. What does the indegree of a node measure in a directed communication network?

<div class="upper-alpha" markdown>
1. The number of outgoing communication edges from the node
2. The number of incoming communication edges to the node
3. The total number of shortest paths passing through the node
4. The average distance from the node to all other nodes
</div>

??? question "Show Answer"
    The correct answer is **B**. Indegree counts the number of incoming edges to a node. In a communication network, high indegree means many people reach out to you, which often signals authority, expertise, or a gatekeeper role. Outdegree counts outgoing edges. The number of shortest paths passing through a node is measured by betweenness centrality, and average distance to all other nodes is related to closeness centrality. The distinction between indegree and outdegree is analytically rich in organizational contexts.

    **Concept Tested:** Indegree

---

#### 2. An employee has high betweenness centrality but low degree centrality. What does this pattern suggest about their organizational role?

<div class="upper-alpha" markdown>
1. They bridge otherwise disconnected groups despite having relatively few direct connections
2. They are isolated with very few connections to anyone in the organization
3. They are a communication hub who sends messages to the entire company
4. They have the highest salary band in their department
</div>

??? question "Show Answer"
    The correct answer is **A**. High betweenness centrality with low degree centrality indicates that the employee sits on many shortest paths between other pairs of nodes without having many direct connections themselves. This pattern is characteristic of information brokers and cross-functional connectors who bridge disconnected teams. Removing such a person could sever communication paths between departments. This is one of the most actionable findings in organizational analytics because it identifies hidden single points of failure.

    **Concept Tested:** Betweenness Centrality

---

#### 3. Which centrality measure would best identify an employee who could spread a message across the entire organization in the fewest number of hops?

<div class="upper-alpha" markdown>
1. Degree centrality
2. Betweenness centrality
3. Eigenvector centrality
4. Closeness centrality
</div>

??? question "Show Answer"
    The correct answer is **D**. Closeness centrality measures how close a node is to all other nodes based on the sum of shortest path distances. A node with high closeness centrality can reach every other node in fewer hops, making it the most efficient information spreader. Degree centrality only counts direct connections. Betweenness centrality measures bridge positions between others. Eigenvector centrality measures connection to other well-connected nodes. For identifying change agents who can disseminate information organization-wide, closeness centrality is the most appropriate measure.

    **Concept Tested:** Closeness Centrality

---

#### 4. How does eigenvector centrality differ from simple degree centrality?

<div class="upper-alpha" markdown>
1. Eigenvector centrality counts edges while degree centrality counts nodes
2. Eigenvector centrality considers whether your connections are themselves well-connected
3. Eigenvector centrality only works on undirected graphs while degree centrality works on any graph
4. Eigenvector centrality measures the physical distance between employees in an office
</div>

??? question "Show Answer"
    The correct answer is **B**. Degree centrality simply counts how many connections a node has, treating all connections equally. Eigenvector centrality goes deeper by weighting connections by the importance of the connected nodes. Your score depends on your neighbors' scores, which depend on their neighbors' scores, creating a recursive measure. Two employees might each have ten connections, but if one communicates with directors and VPs while the other communicates with interns, their eigenvector centrality scores will be vastly different. This reveals informal power structures that org charts miss.

    **Concept Tested:** Eigenvector Centrality

---

#### 5. What is the damping factor in the PageRank algorithm, and what does a typical value of 0.85 represent?

<div class="upper-alpha" markdown>
1. The probability that the algorithm terminates early, meaning 85% of nodes are skipped
2. The probability that a random walker follows a communication link rather than jumping to a random node
3. The percentage of edges that are removed before the algorithm runs to reduce computation time
4. The minimum centrality score required for a node to be included in the results
</div>

??? question "Show Answer"
    The correct answer is **B**. The damping factor (d = 0.85) in PageRank models the probability that a random walker follows one of the current node's communication links to another person rather than jumping to a completely random person in the organization. With d = 0.85, there is an 85% chance of following an edge and a 15% chance of a random jump. After thousands of such random walks, the fraction of time spent at each node becomes its PageRank score. The random jump component ensures that even disconnected nodes receive some score and prevents the algorithm from getting trapped.

    **Concept Tested:** PageRank

---

#### 6. Which pathfinding algorithm should you use to find the strongest communication path between two employees when edges have weights representing communication frequency?

<div class="upper-alpha" markdown>
1. Breadth-first search
2. Depth-first search
3. Dijkstra's algorithm
4. Topological sort
</div>

??? question "Show Answer"
    The correct answer is **C**. Dijkstra's algorithm finds the path that minimizes total edge weight in a weighted graph. When edges represent communication frequency, you transform weights to costs (e.g., cost = 1/strength) so that Dijkstra finds the strongest communication path. BFS finds shortest paths in unweighted graphs by counting hops but ignores edge weights. DFS is used for cycle detection and exhaustive path enumeration, not optimal pathfinding. Topological sort orders tasks by prerequisites and is not a pathfinding algorithm.

    **Concept Tested:** Dijkstra Algorithm

---

#### 7. What data structure does breadth-first search use, and what traversal pattern does this create?

<div class="upper-alpha" markdown>
1. A stack, which creates a path-by-path exploration pattern
2. A priority queue, which creates a cost-based exploration pattern
3. A queue, which creates a level-by-level exploration pattern
4. A hash table, which creates a random exploration pattern
</div>

??? question "Show Answer"
    The correct answer is **C**. BFS uses a queue (first-in, first-out) data structure, which creates a level-by-level exploration pattern. It visits all nodes at distance 1 from the start before visiting nodes at distance 2, then distance 3, and so on. This property guarantees that BFS finds the shortest path in unweighted graphs. A stack creates the path-by-path pattern characteristic of DFS. A priority queue is used by Dijkstra's algorithm. The level-by-level pattern makes BFS ideal for distance analysis and neighborhood exploration in organizational networks.

    **Concept Tested:** Breadth-first Search

---

#### 8. Which graph traversal algorithm is best suited for detecting circular reporting chains in an organizational hierarchy?

<div class="upper-alpha" markdown>
1. Dijkstra's algorithm
2. Breadth-first search
3. PageRank
4. Depth-first search
</div>

??? question "Show Answer"
    The correct answer is **D**. Depth-first search excels at cycle detection because it identifies "back edges" -- edges that point to a node already on the current exploration stack, indicating a cycle. In organizational analytics, this is valuable for detecting circular reporting chains where, for example, A reports to B, B reports to C, and C reports to A. BFS does not directly detect cycles. Dijkstra finds weighted shortest paths. PageRank is a centrality measure, not a traversal algorithm for cycle detection.

    **Concept Tested:** Depth-first Search

---

#### 9. An organizational analyst runs degree, betweenness, and closeness centrality on the same communication graph and finds that three different employees rank highest on each measure. What does this indicate?

<div class="upper-alpha" markdown>
1. The organization has specialized roles where the hub, bridge, and efficient spreader are different people
2. At least two of the three algorithms have produced incorrect results
3. The graph data is corrupted and should be reloaded from source systems
4. The graph is too small for centrality algorithms to produce meaningful results
</div>

??? question "Show Answer"
    The correct answer is **A**. Different centrality measures identify different people as "important" because they define importance differently. The degree-central person is the communication hub with the most connections. The betweenness-central person is the bridge between otherwise disconnected groups. The closeness-central person can reach everyone most efficiently. When different people top different measures, you have discovered the specialized, complementary roles that make the network function. This is a sign of organizational health, not an error.

    **Concept Tested:** Degree Centrality

---

#### 10. If there is only one shortest path between the VP of Sales and the VP of Engineering in the communication network, what organizational risk does this represent?

<div class="upper-alpha" markdown>
1. The two VPs are communicating too frequently and should reduce their interaction
2. The organization has too many redundant communication channels between departments
3. The single intermediary on that path is a critical single point of failure
4. The graph database needs additional indexes to find alternative paths
</div>

??? question "Show Answer"
    The correct answer is **C**. When only one shortest path exists between two important nodes, the intermediary on that path is a critical single point of failure. Removing that person (through departure, illness, or reassignment) would sever or significantly lengthen the communication channel between the two departments. This intermediary likely has high betweenness centrality. Multiple shortest paths indicate robust communication links with redundancy. This finding should prompt the organization to create additional cross-department connections.

    **Concept Tested:** Shortest Path

---
