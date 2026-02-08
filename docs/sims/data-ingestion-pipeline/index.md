---
title: Data Ingestion Pipeline Architecture
description: Interactive visualization of the end-to-end data ingestion pipeline from source systems through staging, ETL, quality gates, and graph database loading.
quality_score: 80
image: /sims/data-ingestion-pipeline/data-ingestion-pipeline.png
og:image: /sims/data-ingestion-pipeline/data-ingestion-pipeline.png
twitter:image: /sims/data-ingestion-pipeline/data-ingestion-pipeline.png
social:
   cards: false
---
# Data Ingestion Pipeline Architecture

<iframe src="main.html" height="552px" width="100%" scrolling="no"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

[Run Data Ingestion Pipeline Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/data-ingestion-pipeline/main.html"
        height="552px" width="100%" scrolling="no"></iframe>
```

## Description

This interactive MicroSim visualizes the complete data ingestion pipeline that transforms raw organizational data into a queryable labeled property graph. The pipeline moves through six key components arranged in a left-to-right flow: source systems (Email Server, Chat Platform, Calendar, HRIS), a staging area that buffers and decouples incoming records, an ETL engine that extracts, transforms, and loads data, a quality gate that validates schema compliance, deduplicates records, and checks referential integrity, and finally the graph database where nodes and edges are stored for analysis.

Records that fail quality checks are diverted to a Dead Letter Queue displayed below the main flow, shown with a red "Failed" arrow. This quarantine mechanism ensures that bad data never contaminates the production graph while preserving failed records for investigation and reprocessing.

Students can animate the flow to watch colored dots travel through the pipeline, toggle between batch and stream processing modes to compare ingestion strategies, and click any stage to reveal a detail panel with descriptions and key metrics. The counters track both successfully loaded records and quarantined failures in real time.

## Lesson Plan

**Learning Objective:** Students will diagram the complete data ingestion pipeline from source systems through staging, ETL, quality checks, and graph loading, identifying the role of each component.

**Bloom's Level:** Analyze (L4) and Evaluate (L5)

**Activities:**

1. **Explore the pipeline** -- Click each of the six stages (including the Dead Letter Queue) and read the detail panels. Write a one-sentence summary of what each stage does.
2. **Animate and observe** -- Press "Animate Flow" and watch events traverse the pipeline. Note how some dots are diverted to the Dead Letter Queue at the quality gate.
3. **Compare modes** -- Toggle between Batch and Stream modes. Discuss the differences in arrival patterns: batch sends groups of dots at intervals while stream sends a continuous trickle.
4. **Failure analysis** -- After running the animation for 60 seconds, record the ratio of loaded versus quarantined records. Discuss why a ~3% failure rate might be acceptable or problematic in a production system.
5. **Design exercise** -- Sketch an additional pipeline stage (e.g., "Enrichment" or "Privacy Filter") and argue where it should be placed in the flow and why.

**Assessment:** Students create a written evaluation of the pipeline architecture, answering: (a) What happens to data flow if the staging area goes offline? (b) Why is the Dead Letter Queue necessary rather than simply dropping failed records? (c) How would switching from batch to stream mode affect downstream query freshness in the graph database?

## References

1. [ETL (Extract, Transform, Load) - Wikipedia](https://en.wikipedia.org/wiki/Extract,_transform,_load) - Overview of the ETL process for data integration
2. [Data Quality - Wikipedia](https://en.wikipedia.org/wiki/Data_quality) - Principles of data quality validation and governance
3. [Dead Letter Queue - Wikipedia](https://en.wikipedia.org/wiki/Dead_letter_queue) - Error handling pattern for failed message processing
