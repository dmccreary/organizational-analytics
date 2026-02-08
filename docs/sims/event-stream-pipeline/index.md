---
title: Complete Event Stream Pipeline
description: End-to-end animated visualization of the 5-stage event stream pipeline from capture through graph preparation.
quality_score: 80
image: /sims/event-stream-pipeline/event-stream-pipeline.png
og:image: /sims/event-stream-pipeline/event-stream-pipeline.png
twitter:image: /sims/event-stream-pipeline/event-stream-pipeline.png
social:
   cards: false
---
# Complete Event Stream Pipeline

<iframe src="main.html" height="492px" width="100%" scrolling="no"></iframe>

[Run Event Stream Pipeline Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/event-stream-pipeline/main.html" height="492px" width="100%" scrolling="no"></iframe>
```

## Description

This end-to-end pipeline visualization shows the complete journey of organizational events through five stages: Capture, Timestamp, Normalize, Enrich, and Graph-Ready. Animated event tokens flow through the pipeline, color-coded by their source type (Email, Chat, Calendar, Device, App).

**How to use:**

- Press **Start** to begin the animation — watch events flow from source to graph
- Adjust the **Speed** slider to control animation pace
- **Click** any pipeline stage to see a description of what happens there
- **Hover** over flowing tokens to see their event type
- The counter tracks total events processed

## Lesson Plan

**Learning Objective:** Students will assess the complete event stream pipeline from capture through graph preparation and evaluate the role of each stage.

**Bloom's Level:** Evaluate (L5)

**Activities:**

1. Run the animation and observe the continuous flow of events — discuss why this pipeline runs continuously rather than as a batch process
2. Click each stage and evaluate: what would happen if this stage were skipped?
3. Compare the events-per-second at different speed settings and discuss real-world throughput considerations

**Assessment:** Students write a one-page evaluation of the pipeline design, arguing for or against adding a sixth stage (e.g., "Validation") and explaining where it would fit.

## References

1. [Stream Processing - Wikipedia](https://en.wikipedia.org/wiki/Stream_processing) - Real-time event processing pipeline concepts
2. [Graph Database - Wikipedia](https://en.wikipedia.org/wiki/Graph_database) - Target storage for the pipeline output
