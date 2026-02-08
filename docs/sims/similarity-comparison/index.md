---
title: Similarity Comparison
description: Interactive comparison of Jaccard and cosine similarity for employee pairs in a weighted network
---

# Similarity Comparison

<iframe src="./main.html" width="100%" height="550px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Click two nodes** to select an employee pair (first click = amber highlight, second click = gold highlight)
2. **View the Jaccard panel** (bottom-left) showing the intersection-over-union of neighbor sets as a Venn diagram
3. **View the Cosine panel** (bottom-right) showing the vector dot-product calculation with actual weights
4. **Toggle "Show Weights"** to display or hide edge weight labels on the graph
5. **Click "Reset"** to clear the selection and start over

## About

Jaccard similarity measures overlap of *who* two employees are connected to (ignoring how strongly), while cosine similarity accounts for *how strongly* they connect. This means two employees can have high Jaccard similarity (many shared contacts) but different cosine similarity (very different interaction intensities). Selecting different pairs reveals when these two measures agree and when they diverge.
