---
title: Silo Detection Dashboard
description: Interactive network graph and department heatmap showing cross-team communication patterns, with adjustable insularity threshold to flag organizational silos.
---

# Silo Detection Dashboard

<iframe src="./main.html" width="100%" height="580px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

Organizational silos form when departments become insular — communicating heavily within their own team but rarely reaching across to others. This MicroSim visualizes a synthetic organization of six departments, letting you explore which teams are operating as silos and which serve as cross-team connectors.

The left panel displays an interactive network graph where employee nodes are clustered by department. Edge thickness between clusters represents how much interaction flows between teams. Departments that exceed the insularity threshold are flagged with a red border and labeled **SILO**.

The right panel shows a department-to-department heatmap. Diagonal cells (within-department interactions) are always dark. Off-diagonal cells reveal how much cross-team communication is happening. Light cells signal potential isolation.

## How to Use

1. **Adjust the insularity threshold** using the slider at the bottom of the canvas. Lowering the threshold flags more departments as silos; raising it is more lenient.
2. **Click a department cluster** in the network graph to highlight its corresponding row and column in the heatmap.
3. **Toggle between Volume and Sentiment** views using the button below the heatmap. Volume shows raw interaction counts; Sentiment shows the average tone of cross-team communications.
4. Watch how Engineering and Finance — the two most insular departments — light up as silos at the default threshold, while HR acts as a connector bridging multiple teams.

## About This MicroSim

This simulation demonstrates how graph-based metrics like **insularity scores** (the ratio of internal edges to total edges for a community) can reveal hidden organizational dynamics that traditional org charts miss. In a real deployment, these metrics would be computed from email metadata, Slack activity, or calendar overlap data stored in a labeled property graph database.

Key concepts illustrated:

- **Community detection** — grouping employees by interaction density
- **Insularity scoring** — measuring how self-contained a department's communication is
- **Cross-team interaction patterns** — identifying connector departments and isolated clusters
- **Threshold tuning** — understanding that "silo" is a spectrum, not a binary label
