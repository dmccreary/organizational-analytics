---
title: Deduplication Pipeline
description: Interactive simulation showing how events from multiple source systems with different identifiers are resolved through identity resolution into canonical graph nodes.
quality_score: 80
image: /sims/dedup-pipeline/dedup-pipeline.png
og:image: /sims/dedup-pipeline/dedup-pipeline.png
twitter:image: /sims/dedup-pipeline/dedup-pipeline.png
social:
   cards: false
---
# Deduplication Pipeline

<iframe src="main.html" height="502px" width="100%" scrolling="no"></iframe>

[Run Deduplication Pipeline Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/dedup-pipeline/main.html" height="502px" width="100%" scrolling="no"></iframe>
```

## Description

In any large organization, a single employee generates events across many systems -- email, Slack, HRIS, Jira, and more. Each system uses its own identifier: an email address, a chat handle, an employee code, or a username. Before these events can be loaded into a unified graph, the pipeline must resolve all of those disparate identifiers back to a single canonical person node. This process is called **identity resolution** or **deduplication**.

This MicroSim visualizes the three-column deduplication pipeline. On the left, incoming event cards arrive from different source systems, each carrying a different identifier. In the center, an identity resolution table maps every known source identifier to a canonical employee ID. On the right, a live mini-graph grows as resolved events create edges on existing person nodes or, when an identifier cannot be matched, routes the event to a manual review queue.

Use the canvas buttons to manually inject events: known duplicates that resolve cleanly, deliberately duplicate events that demonstrate merge behavior, or unknown identifiers that trigger the unresolved pathway. The metrics panel tracks total events processed, unique persons found, duplicates caught, and unresolved IDs encountered.

## Lesson Plan

**Learning Objective:** Students will trace how records with multiple identifiers from different source systems are resolved to canonical nodes in a graph, and explain why deduplication is essential for accurate organizational analytics.

**Bloom's Level:** Analyze (L4)

**Activities:**

1. Click **Add Event** several times and observe how different identifiers from different source systems resolve to the same canonical employee node in the graph
2. Click **Add Duplicate** to introduce a deliberately duplicate event and watch how the pipeline catches it, incrementing the duplicate counter without creating a new node
3. Click **Add Unknown** to see what happens when an identifier is not found in the resolution table -- observe the red flash and the unresolved counter
4. Discuss: What would happen to your graph analytics if deduplication failed and Maria Chen appeared as four separate nodes?

**Assessment:** Given a set of five raw events from three different source systems, have students manually trace through an identity resolution table and produce the resulting graph with the correct number of nodes and edges.

## References

1. [Entity Resolution - Wikipedia](https://en.wikipedia.org/wiki/Entity_resolution) - Overview of the entity resolution problem and common approaches
2. [Record Linkage - Wikipedia](https://en.wikipedia.org/wiki/Record_linkage) - Techniques for identifying records that refer to the same entity across data sources
3. [Master Data Management - Wikipedia](https://en.wikipedia.org/wiki/Master_data_management) - Enterprise strategies for maintaining canonical identifiers across systems
