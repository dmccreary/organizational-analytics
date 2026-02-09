# References: Data Pipelines and Graph Loading

1. [Extract, Transform, Load](https://en.wikipedia.org/wiki/Extract,_transform,_load) - Wikipedia - Comprehensive overview of ETL processes including extraction from source systems, data transformation, and loading into target databases. Core workflow pattern for populating organizational graphs.

2. [Data Quality](https://en.wikipedia.org/wiki/Data_quality) - Wikipedia - Covers data quality dimensions including accuracy, completeness, consistency, and timeliness. Essential framework for validating organizational event data before graph loading.

3. [Data Pipeline](https://en.wikipedia.org/wiki/Pipeline_(computing)) - Wikipedia - Explains pipeline architectures for chaining data processing stages, including batch, micro-batch, and streaming paradigms relevant to real-time organizational data ingestion.

4. Designing Data-Intensive Applications - Martin Kleppmann - O'Reilly Media (2017) - Industry-standard reference for data systems architecture covering batch processing, stream processing, data integration patterns, and consistency guarantees applicable to graph loading pipelines.

5. The Data Warehouse Toolkit (3rd Edition) - Ralph Kimball and Margy Ross - Wiley (2013) - Covers dimensional modeling, staging areas, and ETL best practices. Staging area concepts translate directly to the graph loading workflow taught in this chapter.

6. [Neo4j Data Import Guide](https://neo4j.com/docs/getting-started/data-import/) - Neo4j - Official documentation on importing data into Neo4j including CSV loading with LOAD CSV, the neo4j-admin import tool, and batch transaction patterns for large datasets.

7. [Apache Airflow Documentation](https://airflow.apache.org/docs/) - Apache Foundation - Documentation for the workflow orchestration platform widely used to schedule and monitor ETL pipelines, including dependency management and retry logic.

8. [Batch Processing vs Stream Processing](https://en.wikipedia.org/wiki/Stream_processing) - Wikipedia - Compares batch and stream processing architectures, latency tradeoffs, and use cases. Informs the decision between periodic graph refresh and continuous event ingestion.

9. [Data Deduplication](https://en.wikipedia.org/wiki/Data_deduplication) - Wikipedia - Techniques for identifying and eliminating duplicate records when merging data from multiple HR systems, a common challenge in organizational graph construction.

10. [Change Data Capture](https://en.wikipedia.org/wiki/Change_data_capture) - Wikipedia - Methods for detecting and capturing incremental changes in source systems for efficient pipeline updates, enabling near-real-time graph maintenance without full reloads.
