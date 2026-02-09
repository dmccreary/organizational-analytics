# Quiz: Graph Algorithms -- Community and Similarity

Test your understanding of community detection, similarity algorithms, and graph metrics for discovering organizational structure and patterns with these review questions.

---

#### 1. What does the clustering coefficient of a node measure?

<div class="upper-alpha" markdown>
1. The total number of communities the node belongs to in the graph
2. The average distance from the node to all other nodes in the network
3. The number of edges the node shares with the highest-degree node
4. The ratio of actual connections among a node's neighbors to the maximum possible connections among them
</div>

??? question "Show Answer"
    The correct answer is **D**. The clustering coefficient measures how interconnected a node's neighbors are. It is calculated as the ratio of actual edges among the node's neighbors to the maximum possible edges. A clustering coefficient of 1.0 means all neighbors communicate with each other (a clique), while a low coefficient means the node's contacts are scattered and do not know each other. The formula is \( C(v) = 2e / k(k-1) \) for undirected graphs, where \( e \) is actual edges among neighbors and \( k \) is the number of neighbors.

    **Concept Tested:** Clustering Coefficient

---

#### 2. What does a modularity score above 0.3 indicate about a community partition?

<div class="upper-alpha" markdown>
1. The network has exactly three distinct communities
2. At least 30% of nodes have been incorrectly assigned to communities
3. The community grouping has meaningful structure with denser internal connections than expected by chance
4. The algorithm needs at least three more iterations to converge on a solution
</div>

??? question "Show Answer"
    The correct answer is **C**. Modularity compares the density of edges within detected communities to the density expected in a random graph with the same degree distribution. A score above 0.3 generally indicates meaningful community structure, meaning the detected groups have substantially denser internal connections than would occur by chance. Modularity ranges from -0.5 to 1.0, and organizational networks typically yield scores between 0.3 and 0.7. The score does not indicate the number of communities or the number of incorrectly assigned nodes.

    **Concept Tested:** Modularity

---

#### 3. How does the Louvain algorithm detect communities in a network?

<div class="upper-alpha" markdown>
1. By randomly assigning nodes to a fixed number of communities specified by the user
2. By iteratively moving nodes to neighboring communities that maximize modularity, then aggregating communities into super-nodes
3. By removing the edges with the lowest weights until the graph splits into disconnected components
4. By computing the shortest path between every pair of nodes and grouping those with short paths
</div>

??? question "Show Answer"
    The correct answer is **B**. The Louvain algorithm uses a two-phase iterative process. In the local optimization phase, each node starts in its own community, and the algorithm moves nodes to neighboring communities that produce the largest gain in modularity. In the aggregation phase, each community is contracted into a super-node, preserving edge weights. These phases alternate until modularity stabilizes. This produces a hierarchical decomposition from broad divisions down to tight-knit teams, making it the workhorse of community detection in organizational analytics.

    **Concept Tested:** Louvain Algorithm

---

#### 4. What is a key difference between the Louvain algorithm and label propagation for community detection?

<div class="upper-alpha" markdown>
1. Louvain produces deterministic results while label propagation may vary between runs due to random tie-breaking
2. Label propagation always finds more communities than Louvain on the same graph
3. Louvain can only be used on undirected graphs while label propagation works on directed graphs
4. Label propagation requires the user to specify the number of communities in advance
</div>

??? question "Show Answer"
    The correct answer is **A**. Louvain optimizes modularity through a deterministic process, producing consistent results. Label propagation uses neighbor voting where each node adopts the most frequent label among its neighbors, with ties broken randomly. This randomness means results can vary between runs. Label propagation is faster (nearly linear in the number of edges) but less stable. Running it multiple times and comparing results is a common practice. Neither algorithm requires specifying the number of communities in advance.

    **Concept Tested:** Label Propagation

---

#### 5. An analyst has run community detection and received community IDs numbered 0 through 5. What should they do next before presenting results to leadership?

<div class="upper-alpha" markdown>
1. Run the algorithm again with different parameters to get fewer communities
2. Delete any community with fewer than ten members from the results
3. Assign meaningful labels to communities based on dominant department, project, or geographic characteristics
4. Merge all communities into a single group to simplify the presentation
</div>

??? question "Show Answer"
    The correct answer is **C**. Labeling communities transforms raw numeric IDs into meaningful organizational labels that stakeholders can understand. Strategies include naming by dominant department (e.g., "Engineering Core"), shared project (e.g., "Project Aurora Team"), geographic cluster (e.g., "Chicago Hub"), or functional role (e.g., "Analytics Guild"). Community detection is only half the work; interpretation is the other half. Automated labeling can find the most common department within each community using Cypher aggregation queries. Presenting numbers like "Community 3" to a VP of HR is not actionable.

    **Concept Tested:** Labeling Communities

---

#### 6. Two employees share 3 common communication contacts out of 9 total unique contacts between them. What is their Jaccard similarity score?

<div class="upper-alpha" markdown>
1. 0.25
2. 0.33
3. 0.50
4. 0.67
</div>

??? question "Show Answer"
    The correct answer is **B**. Jaccard similarity is calculated as the size of the intersection divided by the size of the union of two neighbor sets. With 3 shared contacts (intersection) and 9 total unique contacts (union), Jaccard similarity = 3/9 = 0.33. This means the two employees have a moderate overlap in their communication networks. Jaccard ranges from 0 (no shared neighbors) to 1 (identical neighbor sets). It is the simplest neighborhood comparison metric and is effective for unweighted networks where you only need to know whether connections exist, not how strong they are.

    **Concept Tested:** Jaccard Similarity

---

#### 7. When should an analyst use cosine similarity instead of Jaccard similarity for comparing employees?

<div class="upper-alpha" markdown>
1. When the graph has fewer than 100 nodes
2. When the analyst needs results faster than Jaccard can compute them
3. When the two employees being compared are in the same department
4. When the communication edges have weights representing frequency or intensity
</div>

??? question "Show Answer"
    The correct answer is **D**. Cosine similarity accounts for weighted relationships by representing each node as a vector of connection strengths and measuring the angle between vectors. This is important when communication frequency matters. Two managers who both email the CEO ten times daily are more similar than two managers where one emails daily and the other emails quarterly, even if both technically have the same neighbor set. Jaccard treats all connections as binary (present or absent) and ignores edge weights. The choice between the two depends on whether edge weights carry meaningful information, not graph size or department membership.

    **Concept Tested:** Cosine Similarity

---

#### 8. What does a network density of 0.03 indicate about an organizational communication graph with 1,000 employees?

<div class="upper-alpha" markdown>
1. Only 3 employees are communicating with anyone in the organization
2. Each employee communicates with approximately 3% of the organization, which is typical
3. The graph contains exactly 30 edges total
4. 97% of the communication data has been lost during data ingestion
</div>

??? question "Show Answer"
    The correct answer is **B**. Network density is the ratio of actual edges to maximum possible edges. A density of 0.03 means approximately 3% of all possible connections exist. For organizational networks, densities between 0.01 and 0.05 are typical. A 1,000-person organization with density 0.03 would have roughly 14,985 edges out of a possible 499,500. This is normal because not everyone communicates with everyone. Tracking density over time can reveal trends: increasing density after a merger may indicate integration, while decreasing density during rapid growth could signal onboarding challenges.

    **Concept Tested:** Network Density

---

#### 9. An organization's communication network has high clustering coefficients but long average path lengths. What organizational problem does this combination suggest?

<div class="upper-alpha" markdown>
1. Employees are communicating too frequently and should reduce meeting time
2. The graph database needs performance tuning to handle the query load
3. Teams are tightly cohesive internally but lack bridge connections between groups, indicating a silo problem
4. The organization has too many departments and should consolidate into fewer units
</div>

??? question "Show Answer"
    The correct answer is **C**. High clustering coefficients mean people cluster into tight-knit teams where everyone knows everyone. Long average path lengths mean it takes many hops to reach people in other parts of the organization. This combination indicates a silo problem: clusters exist but they are not well bridged. A healthy network has the "small world" property -- high clustering with short path lengths, maintained by a few bridge individuals who keep overall distances short. The solution is to create more cross-group connections, not to reduce communication or consolidate departments.

    **Concept Tested:** Average Path Length

---

#### 10. Which organizational use case is best served by finding similar people through node similarity algorithms?

<div class="upper-alpha" markdown>
1. Identifying succession planning candidates who have comparable network positions and skill profiles
2. Determining which employees should receive a salary increase this quarter
3. Calculating the total communication volume between two departments
4. Detecting circular reporting chains in the organizational hierarchy
</div>

??? question "Show Answer"
    The correct answer is **A**. Finding similar people through node similarity algorithms directly supports succession planning by identifying employees whose network positions, skill profiles, and activity patterns resemble those of the current role holder. If a key person leaves, similar people analysis reveals who could step into that role based on structural equivalence rather than just title or seniority. Other applications include mentoring (pairing junior employees with similar senior employees) and team assembly. Communication volume between departments is a graph metric, and circular reporting detection uses depth-first search.

    **Concept Tested:** Similar People

---
