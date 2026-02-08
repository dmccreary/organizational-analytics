---
title: Merger Integration Monitor
description: Animated force-directed graph showing cross-legacy communication evolution during an 18-month post-merger integration period.
quality_score: 82
image: /sims/merger-integration-monitor/merger-integration-monitor.png
og:image: /sims/merger-integration-monitor/merger-integration-monitor.png
twitter:image: /sims/merger-integration-monitor/merger-integration-monitor.png
social:
   cards: false
---
# Merger Integration Monitor

<iframe src="main.html" width="100%" height="542px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen scrolling="no"></iframe>

[Run the Merger Integration Monitor Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

This visualization simulates the integration of two organizations after a merger, tracked over 18 months. Org A (indigo nodes) and Org B (amber nodes) begin as completely separate clusters with no cross-legacy communication. As months progress, gold edges appear between the two groups, representing new cross-legacy connections. Bridge nodes -- the people who form early connections across organizational boundaries -- grow larger as they accumulate more cross-legacy relationships.

The metrics panel tracks integration health in real time: total edges, cross-legacy percentage, and an overall status label that shifts from "Silos persist" through "Progressing" to "Integrating well."

## How to Use

- **Play/Pause** advances the timeline automatically at one month per second
- **Month slider** lets you scrub to any point in the 18-month integration period
- **Highlight Bridges** checkbox fades non-bridge nodes to 30% opacity so you can see who connects the two legacy organizations
- **Hover** over any node to see the employee name, legacy org, and cross-legacy connection count
- **Drag nodes** to rearrange the layout -- the force-directed simulation adapts continuously
- **Reset** returns the simulation to month 0 with fresh cluster positions

## Lesson Plan

### Learning Objective

Students will assess merger integration progress by analyzing cross-legacy communication patterns and identifying persistent silos between two merged organizations.

### Activities

1. **Observe the Timeline**: Play the full 18-month animation and note when the first cross-legacy edges appear and when the clusters begin to visually overlap
2. **Identify Bridge Nodes**: Enable "Highlight Bridges" and identify which individuals formed the earliest connections -- discuss why early bridge-builders matter
3. **Evaluate Integration Health**: At months 6, 12, and 18, record the cross-legacy percentage and status label -- discuss what thresholds indicate healthy integration
4. **Spot Persistent Silos**: At month 18, look for clusters of nodes that still have no cross-legacy connections -- what organizational interventions could address these gaps?

### Assessment

- Explain why cross-legacy percentage is a better integration metric than total edge count
- Identify the top 3 bridge nodes and describe their structural importance using graph terminology (betweenness centrality, broker role)
- At month 9, the integration status is "Progressing" -- propose two specific organizational actions that could accelerate integration
- Discuss the ethical considerations of monitoring employee communication networks during a merger

## References

1. [Organizational Network Analysis](https://en.wikipedia.org/wiki/Organizational_network_analysis) - Wikipedia - Foundational concepts for analyzing organizational communication patterns
2. [Mergers and Acquisitions](https://en.wikipedia.org/wiki/Mergers_and_acquisitions) - Wikipedia - Background on M&A integration challenges
3. [Betweenness Centrality](https://en.wikipedia.org/wiki/Betweenness_centrality) - Wikipedia - The graph metric that identifies bridge nodes connecting communities
