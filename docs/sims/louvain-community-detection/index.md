---
title: Louvain Community Detection
description: Interactive visualization of the Louvain algorithm detecting communities in an organizational network
---

# Louvain Community Detection

<iframe src="./main.html" width="100%" height="550px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Click "Step"** to advance the algorithm one iteration, watching nodes migrate between communities
2. **Click "Run"** to animate the full detection process automatically
3. **Click "Reset"** to return all nodes to their initial individual communities
4. **Hover over a node** to see its name and current community assignment
5. **Drag nodes** to rearrange the layout

## About

The Louvain algorithm detects communities by optimizing *modularity* -- a measure of how densely connected nodes are within groups compared to between groups. Starting with every node in its own community, the algorithm iteratively moves nodes to neighboring communities where they increase modularity the most. Watch as the 16-node organizational network naturally separates into its departmental clusters, revealing Engineering, Product, Sales, and Operations groups.
