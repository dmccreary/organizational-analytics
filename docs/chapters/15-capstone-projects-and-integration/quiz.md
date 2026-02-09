# Quiz: Capstone Projects and Integration

Test your understanding of graph library design, reusable queries, API integration, AI content detection, end-to-end pipelines, organizational health scores, benchmarking, and continuous improvement with these review questions.

---

#### 1. What are the three core design principles for building a graph library?

<div class="upper-alpha" markdown>
1. Speed, scalability, and security
2. Modularity, parameterization, and categorization
3. Abstraction, inheritance, and polymorphism
4. Normalization, indexing, and partitioning
</div>

??? question "Show Answer"
    The correct answer is **B**. The chapter identifies three core principles: modularity (each query addresses a single, well-defined analytical question), parameterization (queries accept inputs like department names, date ranges, and thresholds rather than containing hardcoded values), and categorization (related queries are grouped by analytical domain so users can find what they need). Without these principles, the library becomes a disorganized collection of queries that teams must rewrite from scratch.

    **Concept Tested:** Graph Library Design

---

#### 2. The chapter recommends a consistent naming convention for reusable graph queries. Which pattern does it specify?

<div class="upper-alpha" markdown>
1. category_version_date (e.g., centrality_v2_2026)
2. table_column_operation (e.g., employee_name_select)
3. action_entity_qualifier (e.g., find_communication_bridges)
4. module_class_method (e.g., graph_node_compute)
</div>

??? question "Show Answer"
    The correct answer is **C**. The chapter specifies the naming pattern as action_entity_qualifier, with examples including find_communication_bridges, detect_community_silos, measure_team_centrality, and score_department_sentiment. This naming convention makes queries discoverable through autocomplete and searchable in documentation. It uses a verb-first format that clearly communicates what each query does, making the library intuitive for analysts who may not have written the queries themselves.

    **Concept Tested:** Reusable Graph Queries

---

#### 3. Why does the chapter emphasize that every reusable query should have at least one test case that runs against a small, deterministic test graph?

<div class="upper-alpha" markdown>
1. Because tests ensure that schema changes, database upgrades, or query modifications do not silently break analytical outputs
2. Because test cases are required for compliance with data privacy regulations
3. Because tests generate documentation automatically from query outputs
4. Because the graph database cannot execute queries without a test graph loaded first
</div>

??? question "Show Answer"
    The correct answer is **A**. The chapter emphasizes that tests tell you immediately whether anything broke when you update the graph database version, change the schema, or modify a query. Without tests, the library becomes a collection of queries that "probably" still work, and the chapter warns that "probably is a dangerous word when leadership decisions depend on the output." Test cases provide confidence that analytical outputs remain accurate through system evolution.

    **Concept Tested:** Building a Graph Library

---

#### 4. When an HRIS records a resignation and the system automatically calls the API to run a cascade analysis for single points of failure, what type of integration pattern does this represent?

<div class="upper-alpha" markdown>
1. Batch processing integration
2. Manual ETL integration
3. Scheduled cron job integration
4. Event-driven integration
</div>

??? question "Show Answer"
    The correct answer is **D**. The chapter describes event-driven integration as the pattern where external systems like HRIS platforms trigger graph operations via API calls in response to real-world events. When a resignation is recorded, an automatic call to a cascade analysis endpoint immediately assesses whether the departure creates a single point of failure. This makes the graph a living, responsive part of organizational infrastructure rather than a static tool run quarterly.

    **Concept Tested:** API Integration

---

#### 5. In the end-to-end analytics pipeline, what is the most important component according to the chapter, and why?

<div class="upper-alpha" markdown>
1. Stage 4 (Algorithm Execution), because graph algorithms generate all the analytical value
2. Stage 1 (Raw Events), because data quality determines everything downstream
3. Stage 3 (Graph Loading), because the graph model is the foundation of all analysis
4. The feedback arrow from Stage 6 back to Stage 1, because it transforms the system from a static tool into a learning system
</div>

??? question "Show Answer"
    The correct answer is **D**. The chapter explicitly states that "the arrow from Stage 6 back to Stage 1 is the most important part of the pipeline." This feedback loop transforms a static analytics tool into a learning system. When an alert fires, the alert itself becomes an event. When a benchmark comparison reveals a trend, the trend detection becomes part of the historical record. This recursive loop enables the system to continuously improve its analytical capabilities over time.

    **Concept Tested:** End-to-end Pipeline

---

#### 6. Why does AI-generated content in organizational communications pose a challenge for sentiment analysis?

<div class="upper-alpha" markdown>
1. AI-generated text uses vocabulary that sentiment analysis models cannot parse
2. AI-generated text may present positive or professional tone regardless of the author's actual emotional state, distorting engagement signals
3. AI-generated text is always neutral in sentiment, creating a flat distribution
4. AI-generated text triggers false positive anomaly alerts in the detection pipeline
</div>

??? question "Show Answer"
    The correct answer is **B**. The chapter explains that sentiment analysis assumes text reflects the author's actual thoughts and emotional state. When a burned-out manager uses AI to generate an upbeat, polished performance review, the sentiment analysis records positive engagement despite the reality of burnout. When a disengaged employee uses AI to craft thoughtful responses, the disengagement signal is missed. The data looks clean but the underlying signal is synthetic, making the analytical insights unreliable.

    **Concept Tested:** AI-generated Content

---

#### 7. Of the three AI detection techniques described in the chapter, which one receives the highest weight in the composite score?

<div class="upper-alpha" markdown>
1. Perplexity scoring at 0.35
2. Behavioral signals at 0.25
3. All three techniques are weighted equally
4. Stylometric analysis at 0.40
</div>

??? question "Show Answer"
    The correct answer is **D**. The chapter recommends initial weights of 0.35 for perplexity scoring, 0.40 for stylometric analysis, and 0.25 for behavioral signals. Stylometric analysis receives the highest weight because it is the most robust to adversarial manipulation. It compares incoming text against each sender's historical writing fingerprint -- characteristic patterns of sentence length, vocabulary diversity, punctuation habits, and structural preferences -- making it difficult to circumvent without perfectly mimicking the person's entire writing style.

    **Concept Tested:** Detecting AI Events

---

#### 8. The organizational health score integrates five dimensions. Which dimension receives the highest weight?

<div class="upper-alpha" markdown>
1. Connectivity at 0.25
2. Information Flow at 0.20
3. Community Health at 0.20
4. Resilience at 0.15
</div>

??? question "Show Answer"
    The correct answer is **A**. The health score assigns weights as follows: Connectivity at 0.25 (the highest), Information Flow at 0.20, Community Health at 0.20, Sentiment at 0.20, and Resilience at 0.15. Connectivity measures how well-connected the communication network is using average degree centrality, network density, and giant component ratio. The chapter emphasizes that the per-dimension breakdown is often more valuable than the composite score because knowing the individual dimensions tells you exactly where to focus improvement efforts.

    **Concept Tested:** Organizational Health Score

---

#### 9. An organization's resilience score is 55 this quarter, down from 58 last quarter, against an industry median of 58 (42nd percentile). What does the chapter suggest this combination of benchmarks indicates?

<div class="upper-alpha" markdown>
1. Resilience is a minor concern that will self-correct over time
2. The organization is performing above industry norms for resilience
3. This is a genuine area of concern confirmed by both the declining internal trend and below-median industry ranking
4. The industry benchmark data is unreliable and should be disregarded
</div>

??? question "Show Answer"
    The correct answer is **C**. The chapter uses this exact example to illustrate how multiple benchmark types reinforce each other. The internal trend shows resilience declining (55 vs. 58 last quarter, down 3 points), and the industry percentile (42nd) confirms that the organization is below the median for similar companies. When both internal historical benchmarks and industry benchmarks point in the same direction, the finding is more credible than either benchmark alone. The chapter notes this is "a genuine area of concern, not just normal variation."

    **Concept Tested:** Benchmarking

---

#### 10. In the continuous improvement cycle, Phase 3 (Intervene) should include what critical element to make the intervention measurable?

<div class="upper-alpha" markdown>
1. Executive approval and budget allocation documentation
2. A clear hypothesis about expected outcomes, such as a specific metric improvement within a defined timeframe
3. A complete rollback plan in case the intervention fails
4. Notification to all affected employees about the upcoming changes
</div>

??? question "Show Answer"
    The correct answer is **B**. The chapter specifies that the intervention in Phase 3 should have a clear hypothesis, giving the example: "If we add weekly cross-team standups between Platform and Infrastructure, we expect the community health score for those teams to increase by 5-10 points within two months." This hypothesis-driven approach makes the intervention measurable during Phase 4 (Evaluate), enabling the organization to determine whether the change actually moved the needle and whether the improvement held over time.

    **Concept Tested:** Continuous Improvement
