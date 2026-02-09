# Quiz: Data Pipelines and Graph Loading

Test your understanding of staging areas, ETL for graph data, batch and stream processing, data quality checks, and deduplication with these review questions.

---

#### 1. What is the primary purpose of a staging area in a data ingestion pipeline?

<div class="upper-alpha" markdown>
1. To permanently store all organizational data as a backup archive
2. To serve as a temporary buffer between source systems and the graph database, enabling decoupling, inspection, and replay
3. To replace the graph database as the final destination for all event data
4. To automatically transform raw events into Cypher queries
</div>

??? question "Show Answer"
    The correct answer is **B**. A staging area is a temporary storage layer between source systems and the graph database. It serves four essential functions: decoupling (so source system failures do not crash graph loading), buffering (absorbing unpredictable event volume spikes), inspection (running quality checks before data enters the graph), and replay (enabling re-runs from staging if a graph load fails). The staging area preserves raw event data with processing metadata while transformation happens in the later ETL phase.

    **Concept Tested:** Staging Areas

---

#### 2. How does graph ETL differ from traditional data warehouse ETL in the transform phase?

<div class="upper-alpha" markdown>
1. Graph ETL does not require any transformation of source data
2. Graph ETL produces rows for dimension and fact tables in a star schema
3. Graph ETL produces nodes and edges with properties instead of table rows
4. Graph ETL skips the extract phase and reads directly from production systems
</div>

??? question "Show Answer"
    The correct answer is **C**. While both graph ETL and traditional ETL share the three-phase extract-transform-load structure, they diverge sharply in the transform phase. Traditional ETL maps source fields to table columns in a star or snowflake schema, producing rows for dimension and fact tables. Graph ETL makes structural decisions about what becomes a node, what becomes an edge, and what becomes a property. A single email event might produce three nodes (sender and two recipients) and two edges (EMAILED relationships), each carrying their own properties.

    **Concept Tested:** ETL for Graph Data

---

#### 3. When loading employee data into a graph database, why should you use MERGE instead of CREATE for employee nodes?

<div class="upper-alpha" markdown>
1. MERGE is faster than CREATE for all database operations
2. CREATE does not support adding properties to nodes
3. MERGE creates the node if it does not exist or matches the existing one, preventing duplicates when the same person appears in multiple events
4. MERGE automatically deletes old nodes to make room for new ones
</div>

??? question "Show Answer"
    The correct answer is **C**. The MERGE operation is central to graph ETL because it implements create-or-match semantics. When loading events, the same employee will appear in many different events over time. Using CREATE would generate a new duplicate node for every event, fragmenting that person's connections across multiple identities. MERGE checks whether a node with the specified key already exists -- if so, it matches the existing node; if not, it creates a new one. CREATE should be reserved for elements that are genuinely unique per event, like individual communication edges with distinct timestamps.

    **Concept Tested:** ETL for Graph Data

---

#### 4. Which of the following best describes the key advantage of batch loading over stream processing?

<div class="upper-alpha" markdown>
1. Batch loading provides real-time graph updates within seconds
2. Batch loading is simpler to design, implement, and debug compared to stream processing
3. Batch loading eliminates the need for staging areas entirely
4. Batch loading processes events individually as they arrive from source systems
</div>

??? question "Show Answer"
    The correct answer is **B**. Batch loading collects events over a defined time window and processes them all at once. Its primary advantages are simplicity (easier to design, implement, debug, and monitor), efficiency (bulk operations are faster per-record), consistency (atomic batch loading), and predictable resource planning. The tradeoff is staleness -- the graph is only as current as the last batch. Stream processing provides fresher data but requires more complex infrastructure including message queues, stream engines, and exactly-once delivery guarantees.

    **Concept Tested:** Batch Loading

---

#### 5. In a stream processing architecture, which component typically serves as the staging area for real-time event data?

<div class="upper-alpha" markdown>
1. A CSV file exported nightly to a shared network drive
2. A relational database table with scheduled batch queries
3. A high-throughput message broker like Apache Kafka
4. A printed report delivered to the data engineering team
</div>

??? question "Show Answer"
    The correct answer is **C**. In real-time data ingestion architectures, the staging area is a high-throughput message broker like Apache Kafka rather than a file system or database. Kafka provides durable ordered logs (events stored in sequence and replayable from any point), consumer groups (multiple processing engines reading independently), partitioning (parallel processing), and configurable retention policies. The stream processing engine subscribes to Kafka topics and transforms each event as it arrives, enabling graph updates within seconds.

    **Concept Tested:** Stream Processing

---

#### 6. An organization's email batch was 90% smaller than usual. According to the data quality check framework, at which level would this anomaly be detected?

<div class="upper-alpha" markdown>
1. Record-level checks that validate individual event field formats
2. Graph-level checks that monitor node growth rates and edge density
3. Batch-level checks that compare expected volume against actual volume
4. Source-level checks that verify encryption of raw data
</div>

??? question "Show Answer"
    The correct answer is **C**. The data quality check framework operates at three levels. Batch-level checks validate properties of the entire batch, including volume checks (did the batch contain roughly the expected number of events?), distribution checks (are events distributed across sources as expected?), and temporal coverage (does the batch cover the expected time window?). A batch that is 90% smaller than usual is a volume anomaly that suggests an extraction failure, not a genuine drop in organizational communication. Record-level and graph-level checks serve different purposes.

    **Concept Tested:** Data Quality Checks

---

#### 7. What happens to records that fail data quality checks in a well-designed pipeline?

<div class="upper-alpha" markdown>
1. They are silently dropped from the pipeline to maintain processing speed
2. They are automatically corrected by the ETL engine and loaded into the graph
3. They are routed to a dead letter queue for investigation while the pipeline continues processing valid records
4. They cause the entire pipeline to shut down until an administrator intervenes
</div>

??? question "Show Answer"
    The correct answer is **C**. Failed records should never be silently dropped or allowed to halt the entire pipeline. Instead, they are routed to a dead letter queue -- a separate storage area where failed records are quarantined for investigation. This serves two purposes: it keeps bad data out of the graph while preserving it for debugging. Over time, patterns in the dead letter queue reveal systematic problems in source systems or extraction logic. A dead letter queue is not optional; it is the only way to maintain visibility into data loss.

    **Concept Tested:** Data Quality Checks

---

#### 8. Why is deduplication especially critical for organizational analytics compared to traditional data warehousing?

<div class="upper-alpha" markdown>
1. Graph databases cannot store more than one node per label type
2. Duplicate nodes split a person's connections across multiple identities, corrupting centrality scores, community detection, and pathfinding results
3. Deduplication is only needed for batch loading and does not apply to stream processing
4. Relational databases automatically handle deduplication so graph systems should too
</div>

??? question "Show Answer"
    The correct answer is **B**. Duplicates are particularly destructive in graph analytics because they fragment an individual's network position across multiple nodes. If Maria Chen appears as three separate nodes, her centrality score is split three ways, making her look like three peripheral employees instead of one highly connected hub. Community detection assigns her to three different groups. Pathfinding cannot find routes through her because the path is broken across separate identities. This corrupts every downstream analysis built on the graph.

    **Concept Tested:** Deduplication

---

#### 9. You are designing a data pipeline for a company that needs real-time freshness for chat events but can tolerate nightly updates for HRIS organizational structure data. Which architecture best meets these requirements?

<div class="upper-alpha" markdown>
1. A single nightly batch pipeline processing all data sources together
2. A fully streaming architecture that processes every data source in real time
3. A tiered pipeline with stream processing for chat events and scheduled batch loading for HRIS data
4. No pipeline at all -- load data directly from source systems into the graph on each query
</div>

??? question "Show Answer"
    The correct answer is **C**. A tiered pipeline matches freshness requirements to actual needs. Chat events change rapidly and benefit from stream processing to keep the graph current. HRIS data (titles, departments, reporting structures) changes infrequently and can be batch-loaded nightly without analytical loss. This approach provides real-time freshness where it matters while keeping infrastructure costs reasonable, avoiding the unnecessary complexity and expense of streaming everything or the excessive staleness of batching everything.

    **Concept Tested:** Latency Management

---

#### 10. A pipeline team discovers that the same employee appears as three separate nodes in the graph due to different identifiers across email, Slack, and HRIS systems. Which deduplication strategy directly addresses this problem?

<div class="upper-alpha" markdown>
1. Increasing the batch loading frequency from nightly to hourly
2. Adding more graph database indexes on edge properties
3. Building an identity resolution table that maps all source-system identifiers to a single canonical employee ID
4. Deleting all three nodes and waiting for them to be recreated in the next batch
</div>

??? question "Show Answer"
    The correct answer is **C**. Identity resolution maps multiple identifiers to a single canonical identity. A master identity table links each source-system identifier (email address, Slack handle, HRIS code, Jira username) to one canonical employee ID. This canonical ID becomes the node's primary key in the graph. All events, regardless of source system, resolve to the same node through the identity resolution table. Combined with MERGE-based loading that creates-or-matches based on the canonical key, this prevents fragmentation of an individual's network identity.

    **Concept Tested:** Deduplication

---
