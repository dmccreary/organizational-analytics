---
title: Process Discovery Flow
description: Interactive simulation showing how process discovery transforms raw event logs into a visual process map, highlighting deviations from the expected hiring process.
quality_score: 80
image: /sims/process-discovery/process-discovery.png
og:image: /sims/process-discovery/process-discovery.png
twitter:image: /sims/process-discovery/process-discovery.png
social:
   cards: false
---
# Process Discovery Flow

<iframe src="main.html" height="542px" width="100%" scrolling="no"></iframe>

[Run Process Discovery Flow Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/process-discovery/main.html" height="542px" width="100%" scrolling="no"></iframe>
```

## Description

This MicroSim demonstrates process discovery — the automated reconstruction of a business process model from event log data. The left panel shows a table of 25 events across 4 hiring process cases. The right panel builds a discovered process map as events are analyzed.

**How to use:**

- Press **Discover Process** to watch the algorithm analyze events and build the process map
- Observe how deviations (red edges) appear: Case H-003 skips screening, Case H-004 loops back from Decision to Interview
- Toggle **Show Ideal Process** to overlay the documented 6-step linear process in gray
- Press **Reset** to start the discovery again

## Lesson Plan

**Learning Objective:** Students will analyze event log data to discover the actual flow of a business process and compare it to the documented process.

**Bloom's Level:** Analyze (L4)

**Activities:**

1. Before pressing Discover, examine the event log — can you spot which cases deviate from the normal hiring flow?
2. Run the discovery and identify all deviation edges (red). Explain why each deviation occurred
3. Toggle the ideal process overlay and discuss: is the documented process wrong, or are the deviations problems?

**Assessment:** Students receive a new event log for a different process (e.g., expense approval) and manually construct a process map, identifying normal flows and deviations.

## References

1. [Process Mining - Wikipedia](https://en.wikipedia.org/wiki/Process_mining) - Discovery, conformance, and enhancement of business processes from event logs
2. [Petri Net - Wikipedia](https://en.wikipedia.org/wiki/Petri_net) - The mathematical formalism underlying many process discovery algorithms
