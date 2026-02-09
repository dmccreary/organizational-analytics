# Quiz: Introduction to Organizational Analytics

Test your understanding of organizational analytics, HRIS limitations, and the case for graph databases with these review questions.

---

#### 1. What does organizational analytics primarily focus on that traditional HR reporting does not?

<div class="upper-alpha" markdown>
1. Payroll calculations and benefits administration
2. Relationships, communication patterns, and information flow between people
3. Compliance with regulatory reporting requirements
4. Employee demographic data and compensation history
</div>

??? question "Show Answer"
    The correct answer is **B**. Organizational analytics goes beyond storing attributes about individuals (names, titles, salaries) to map behaviors and connections -- who communicates with whom, how information flows, where collaboration breaks down, and which individuals are critical to the network. Traditional HR reporting handles demographics, payroll, and compliance but cannot answer relationship-driven questions about how work actually happens.

    **Concept Tested:** Organizational Analytics

---

#### 2. Which of the following is a core function of an HRIS?

<div class="upper-alpha" markdown>
1. Mapping informal communication networks across departments
2. Detecting hidden influencers using centrality algorithms
3. Managing payroll, benefits enrollment, and compliance reporting
4. Analyzing cross-departmental email patterns
</div>

??? question "Show Answer"
    The correct answer is **C**. A Human Resources Information System (HRIS) is designed to manage core administrative HR functions including employee records, payroll processing, benefits administration, time and attendance tracking, compliance reporting, and performance management. It was not designed for relationship-based analysis such as communication network mapping or influence detection.

    **Concept Tested:** HRIS

---

#### 3. Which of the following is NOT typically considered a source of human resources data for organizational analytics?

<div class="upper-alpha" markdown>
1. Email metadata such as sender, recipient, and timestamp
2. Calendar data showing meeting attendees and recurring patterns
3. External stock market price fluctuations
4. Chat and messaging logs showing who messages whom
</div>

??? question "Show Answer"
    The correct answer is **C**. Human resources data for organizational analytics includes core employee records, email metadata, chat and messaging logs, calendar data, device and application logs, project management systems, learning management systems, performance records, and recruitment data. External stock market prices are financial market data unrelated to internal organizational communication and collaboration patterns.

    **Concept Tested:** Human Resources Data

---

#### 4. How do relational databases link data across tables?

<div class="upper-alpha" markdown>
1. Through foreign keys and JOIN operations in SQL
2. Through direct physical pointers between adjacent records
3. Through label-based pattern matching on nodes
4. Through pheromone-like chemical signals between rows
</div>

??? question "Show Answer"
    The correct answer is **A**. Relational databases organize data into tables with rows and columns. Tables are linked through foreign keys -- a column in one table that references the primary key of another table. To combine data from multiple tables, SQL JOIN operations match these foreign key values. This approach works well for direct lookups but degrades for multi-hop relationship queries.

    **Concept Tested:** Relational Databases

---

#### 5. What is the "JOIN wall" in relational databases?

<div class="upper-alpha" markdown>
1. A security firewall that prevents unauthorized SQL queries
2. The maximum number of tables a database can store
3. The exponential performance degradation that occurs with multi-hop relationship queries
4. A physical limit on the number of columns in a single table
</div>

??? question "Show Answer"
    The correct answer is **C**. The JOIN wall refers to the exponential degradation of query performance as you increase the number of hops (self-joins) in a relational database. Each additional hop multiplies the number of foreign key comparisons required. For example, with one million employees, a 1-hop query takes about 10 milliseconds, but a 5-hop query can take over 13 minutes or time out entirely. This is a fundamental architectural constraint, not a bug.

    **Concept Tested:** Relational Database Limits

---

#### 6. In a graph database, what does "index-free adjacency" mean?

<div class="upper-alpha" markdown>
1. Graph databases do not support any type of indexing
2. Each node stores direct pointers to its neighbors, making traversal an O(1) operation per hop
3. Graph queries never need a starting node to begin traversal
4. Indexes are automatically deleted after each query completes
</div>

??? question "Show Answer"
    The correct answer is **B**. Index-free adjacency means that each node in a graph database physically stores direct pointers to its adjacent nodes. Traversing from one node to its neighbor is a pointer lookup taking constant time, regardless of whether the database has a thousand or a billion total nodes. This architectural property is what gives graph databases their characteristic advantage for relationship-intensive queries, making multi-hop traversals fast and predictable.

    **Concept Tested:** Graph Databases

---

#### 7. How are relationships stored differently in a graph database compared to a relational database?

<div class="upper-alpha" markdown>
1. Graph databases store relationships only as foreign keys, just like relational databases
2. Graph databases cannot store relationships at all; they only store entities
3. Graph databases store relationships as first-class objects with their own types, direction, and properties
4. Graph databases store relationships as separate tables with indexed columns
</div>

??? question "Show Answer"
    The correct answer is **C**. In a relational database, relationships are implicit -- represented by foreign key values that must be resolved through JOIN operations. In a graph database, relationships (edges) are first-class citizens that are stored, indexed, and queryable just like nodes. Each edge has a type (like COMMUNICATES_WITH), a direction, and can carry its own properties such as frequency or weight. This explicit treatment of relationships is what makes graph queries more expressive and performant for network analysis.

    **Concept Tested:** Graph vs Relational

---

#### 8. An organization wants to answer the question: "When a key person leaves, who else is likely to follow?" Which system is best suited to answer this?

<div class="upper-alpha" markdown>
1. A traditional HRIS tracking employee records and payroll
2. A spreadsheet of employee names and hire dates
3. A relational database with standard HR tables
4. An organizational analytics system using a graph database
</div>

??? question "Show Answer"
    The correct answer is **D**. This question requires understanding communication networks, influence patterns, and relationship dependencies -- none of which can be captured by attribute-based systems like an HRIS, spreadsheet, or standard relational database. An organizational analytics system with a graph database can map who communicates with whom, identify clusters of closely connected employees, and trace influence paths to predict cascading departures when a key network connector leaves.

    **Concept Tested:** Organizational Analytics

---

#### 9. Which characteristic makes relational databases a strong choice for payroll processing but a poor choice for communication network analysis?

<div class="upper-alpha" markdown>
1. Relational databases cannot store any employee data
2. Relational databases lack ACID transaction guarantees
3. Relational databases excel at structured attribute storage but degrade exponentially on multi-hop traversals
4. Relational databases do not support the SQL query language
</div>

??? question "Show Answer"
    The correct answer is **C**. Relational databases offer ACID transactions, mature tooling, standardized SQL, and rigid schema enforcement -- making them excellent for structured, attribute-based workloads like payroll processing. However, their architecture requires foreign key lookups and JOINs to traverse relationships, and performance degrades exponentially with each additional hop. Communication network analysis demands multi-hop traversals across potentially millions of connections, which is precisely where relational databases hit the JOIN wall.

    **Concept Tested:** Relational Database Limits

---

#### 10. A data analyst discovers that removing one employee from the communication graph would disconnect two entire departments. What type of organizational analytics insight does this represent?

<div class="upper-alpha" markdown>
1. A payroll calculation error in the HRIS
2. A single point of failure in the organizational network
3. A schema normalization issue in the relational database
4. An ACID transaction violation
</div>

??? question "Show Answer"
    The correct answer is **B**. Identifying single points of failure -- individuals whose removal would break communication paths between parts of the organization -- is a classic organizational analytics insight that graph databases excel at revealing. This type of analysis requires understanding network topology, connectivity, and the structural role of individual nodes, which goes far beyond what attribute-based HR systems can detect. Recognizing these vulnerabilities helps organizations build redundant communication pathways.

    **Concept Tested:** Graph vs Relational

---
