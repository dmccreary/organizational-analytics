---
title: Data Quality Check Framework
description: Interactive three-tier quality check visualization showing record-level, batch-level, and graph-level data validation with dead letter queue routing.
quality_score: 80
image: /sims/data-quality-checks/data-quality-checks.png
og:image: /sims/data-quality-checks/data-quality-checks.png
twitter:image: /sims/data-quality-checks/data-quality-checks.png
social:
   cards: false
---
# Data Quality Check Framework

<iframe src="main.html" height="502px" width="100%" scrolling="no"></iframe>

[Run Data Quality Checks Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/data-quality-checks/main.html" height="502px" width="100%" scrolling="no"></iframe>
```

## Description

This MicroSim visualizes a three-tier data quality check framework that organizational analytics pipelines use before loading data into a graph database. Data flows downward through a narrowing funnel representing three validation levels: record-level checks (schema, range, referential validity, completeness), batch-level checks (volume, distribution, temporal coverage), and graph-level checks (node growth rate, edge density, orphan detection). Records that fail at any level are routed rightward into a Dead Letter Queue for manual review.

**How to use:**

- Press **Simulate Checks** to run an animated simulation that scans each level and randomly passes or fails individual checks
- Press **Toggle Failures** to randomly flip check states and observe how failures at different levels affect the outcome
- **Click** any individual check item to read a description of what it validates
- Press **Reset** to restore all checks to a passing state

The funnel narrows at each level to reinforce that fewer data issues should survive as validation deepens. The color-coded outcome indicator at the bottom shows either "Graph Updated" (all pass) or "Rollback + Alert" (any failure), making the consequences of quality failures immediately visible.

## Lesson Plan

**Learning Objective:** Students will assess data quality at three levels (record, batch, graph) and determine appropriate responses to quality failures.

**Bloom's Level:** Evaluate (L5)

**Activities:**

1. Run the simulation several times and observe which levels tend to catch the most failures. Discuss why record-level checks act as the first line of defense.
2. Use Toggle Failures to create a scenario where only graph-level checks fail. Discuss what kinds of real-world data problems would pass record and batch checks but fail at the graph level.
3. Click each check item and read its description. For each check, write one example of a real organizational event that would fail that specific check.
4. Compare the Dead Letter Queue counts across levels. Discuss whether it is better to catch errors early (record level) or late (graph level) and what the cost trade-offs are.

**Assessment:** Students design a data quality dashboard for a fictional organization's HR event pipeline. They must specify at least two checks at each level, explain what each check validates, and describe the remediation process for failures routed to the Dead Letter Queue.

## References

1. [Data Quality - Wikipedia](https://en.wikipedia.org/wiki/Data_quality) - Foundational concepts of data accuracy, completeness, consistency, and timeliness
2. [Dead Letter Queue - Wikipedia](https://en.wikipedia.org/wiki/Dead_letter_queue) - Message queuing pattern for handling unprocessable records
3. [Graph Database - Wikipedia](https://en.wikipedia.org/wiki/Graph_database) - Target storage where validated data is ultimately loaded
