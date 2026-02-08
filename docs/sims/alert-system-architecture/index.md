---
title: Alert System Architecture
description: Interactive five-stage pipeline diagram showing how graph metrics flow through threshold evaluation, aggregation, routing, and feedback loops to generate actionable organizational alerts.
---

# Alert System Architecture

The **Alert System Architecture** diagram visualizes the five-stage pipeline that transforms graph metric computations into actionable notifications for organizational stakeholders. It demonstrates threshold evaluation, alert aggregation, intelligent routing, and the feedback loop that refines the system over time.

<iframe src="./main.html" width="100%" height="570px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Click any stage box** to see an expanded description of its function in the detail panel below.
2. **Click "Animate Alert"** to watch a sample alert flow through all five stages from left to right as an animated particle. In Stress State, multiple particles are spawned to show how aggregation handles volume.
3. **Toggle between "Normal State" and "Stress State"** to see how the pipeline behaves under normal operation (mostly green thresholds) versus a retention crisis (multiple amber/red breaches).
4. **Review the routing rules** shown below Stage 4 -- different alert types route to different recipients, with individual risk alerts privacy-protected to the direct manager only.
5. **Note the feedback loop** (dashed amber line) curving from Stage 5 back to Stage 2, representing the continuous refinement of thresholds based on whether alerts drove action and whether metrics subsequently changed.

## About This Simulation

An effective alerting system has five components: threshold configuration, alert routing, aggregation to prevent notification flooding, cooldown periods to suppress repeat alerts, and feedback loops that learn which alerts drive action. This architecture diagram shows how these components connect in a left-to-right pipeline, embedding the ethical principles from Chapter 6 directly into the notification routing -- individual risk signals are never broadcast widely. The design mirrors a leafcutter colony's pheromone alerting system: strong enough to prompt action, smart enough to quiet down when the situation resolves.
