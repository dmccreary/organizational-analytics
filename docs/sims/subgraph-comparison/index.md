---
title: Subgraph Comparison
description: Split-screen comparison of two department subgraphs with computed network metrics
---

# Subgraph Comparison

<iframe src="./main.html" width="100%" height="550px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Select departments** using the buttons at the top of each panel to choose which two departments to compare
2. **Compare the network diagrams** to visually see differences in connectivity patterns
3. **Read the metrics** below each graph: node count, edge count, density, clustering coefficient, and average path length
4. **Check the comparison bar** at the bottom -- metrics highlighted in amber differ by more than 20%

## About

Different departments develop different communication structures depending on their work style. Engineering teams may have dense, clustered networks for code review and pair programming. Sales teams may have sparser networks with a more hub-and-spoke pattern around team leads. This MicroSim lets you place any two departments side by side and immediately see how their internal connectivity compares across standard graph metrics.

## Key Metrics

- **Density** measures the fraction of all possible edges that actually exist. Higher density means more direct connections between team members.
- **Clustering Coefficient** measures how often a person's contacts are also connected to each other. High clustering indicates tight-knit groups.
- **Average Path Length** measures the typical number of hops to get from one person to another. Shorter paths mean faster information flow.
