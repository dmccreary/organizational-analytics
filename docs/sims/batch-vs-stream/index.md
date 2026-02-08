---
title: Batch vs Stream Processing
description: Interactive split-screen simulation comparing batch and stream processing pipelines side by side, showing trade-offs in freshness, latency, and error handling.
quality_score: 80
image: /sims/batch-vs-stream/batch-vs-stream.png
og:image: /sims/batch-vs-stream/batch-vs-stream.png
twitter:image: /sims/batch-vs-stream/batch-vs-stream.png
social:
   cards: false
---
# Batch vs Stream Processing

<iframe src="main.html" height="502px" width="100%" scrolling="no"></iframe>

[Run Batch vs Stream Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/batch-vs-stream/main.html" height="502px" width="100%" scrolling="no"></iframe>
```

## Description

This split-screen MicroSim places batch processing and stream processing side by side so you can directly observe how each approach handles the same flow of organizational events. In the top half, events accumulate in a buffer until a batch timer fires, at which point all buffered events move through the Transform and Load stages as a single block and update the graph database in a burst. In the bottom half, events flow continuously through the same stages one at a time, updating the graph database with each individual event.

The key insight emerges when you watch the "Graph Age" indicator on each side. The batch pipeline's graph age climbs steadily between batch runs, meaning any dashboard or query is working with stale data until the next batch completes. The stream pipeline keeps its graph age near zero, reflecting a continuously current view of the organization.

Press the **Fail** button to see how each approach handles errors. The batch pipeline rolls back the entire batch, losing all accumulated events. The stream pipeline routes only the failed event to a dead letter queue while the rest continue flowing. This contrast illustrates why stream architectures are more resilient to individual event failures, while batch architectures risk larger data loss per failure.

## Lesson Plan

**Learning Objective:** Students will compare batch and stream processing approaches by observing how each handles the same event flow, and evaluate the trade-offs in data freshness, processing latency, throughput, and error resilience.

**Bloom's Level:** Evaluate (L5)

**Activities:**

1. **Observe and Compare** -- Run the simulation at Medium speed and watch both pipelines for two full batch cycles. Note the difference in graph age, event counts, and average latency between the two approaches.
2. **Stress Test** -- Switch to Burst mode and observe how the batch buffer grows while stream events flow continuously. Discuss which approach handles high-volume periods better and why.
3. **Failure Analysis** -- Click the Fail button during an active batch and during normal stream flow. Compare the error handling behavior: batch rollback vs. dead letter queue. Discuss the implications for data integrity and recovery.
4. **Trade-off Debate** -- In small groups, argue for either batch or stream processing for a specific organizational scenario (e.g., monthly payroll processing vs. real-time badge access monitoring). Present your reasoning to the class.

**Assessment:** Students write a one-page analysis comparing batch and stream processing for a real organizational use case of their choice. The analysis must address data freshness requirements, error handling implications, and infrastructure complexity, citing observations from the simulation.

## References

1. [Batch Processing - Wikipedia](https://en.wikipedia.org/wiki/Batch_processing) -- Overview of batch-oriented data processing and its historical role in enterprise computing
2. [Stream Processing - Wikipedia](https://en.wikipedia.org/wiki/Stream_processing) -- Real-time event processing concepts and modern streaming architectures
3. [Lambda Architecture - Wikipedia](https://en.wikipedia.org/wiki/Lambda_architecture) -- Hybrid architecture combining batch and stream processing layers
