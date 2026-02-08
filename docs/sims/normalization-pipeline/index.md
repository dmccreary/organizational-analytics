---
title: Normalization and Enrichment Pipeline
description: Interactive pipeline diagram showing how raw events from diverse sources are normalized and enriched into graph-ready records.
quality_score: 80
image: /sims/normalization-pipeline/normalization-pipeline.png
og:image: /sims/normalization-pipeline/normalization-pipeline.png
twitter:image: /sims/normalization-pipeline/normalization-pipeline.png
social:
   cards: false
---
# Normalization and Enrichment Pipeline

<iframe src="main.html" height="487px" width="100%" scrolling="no"></iframe>

[Run Normalization Pipeline Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/normalization-pipeline/main.html" height="487px" width="100%" scrolling="no"></iframe>
```

## Description

This workflow MicroSim shows the four-stage pipeline that transforms raw events from diverse organizational systems into normalized, enriched records ready for graph loading. The stages are: Raw Sources, Normalization, Enrichment, and Graph-Ready.

**How to use:**

- **Click** any pipeline stage to expand it and see detailed sub-steps and sample data
- Press the **Animate** button to watch event tokens flow through the pipeline
- Hover over tokens during animation to see their event type

## Lesson Plan

**Learning Objective:** Students will trace the steps of event normalization and enrichment and explain how raw events are transformed into graph-ready records.

**Bloom's Level:** Apply (L3)

**Activities:**

1. Click each stage and read the transformation details — then explain in your own words what happens at each step
2. Animate the pipeline and describe the journey of a single event from raw source to graph-ready format
3. Compare the "before" and "after" JSON samples at each stage

**Assessment:** Given a raw event from a new source system, have students write the normalized and enriched version by applying each pipeline stage.

## References

1. [Data Normalization - Wikipedia](https://en.wikipedia.org/wiki/Data_normalization) - General principles of data normalization
2. [Extract, Transform, Load - Wikipedia](https://en.wikipedia.org/wiki/Extract,_transform,_load) - ETL pipeline concepts applicable to event processing
