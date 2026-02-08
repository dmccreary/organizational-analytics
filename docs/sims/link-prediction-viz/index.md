---
title: Link Prediction Visualization
description: Interactive organizational graph showing existing edges and predicted future edges using common neighbors, Jaccard, and Adamic-Adar scoring methods
---

# Link Prediction Visualization

<iframe src="./main.html" width="100%" height="580px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Select a prediction method** -- click "Common Neighbors," "Jaccard," or "Adamic-Adar" to switch scoring algorithms
2. **Adjust the threshold** -- drag the slider to control which predicted edges are visible (higher threshold = fewer, stronger predictions)
3. **Hover a predicted edge** -- the info panel shows the two people, their score, shared neighbors, and a brief explanation
4. **Hover a node** -- highlights all existing and predicted connections for that person
5. **Drag nodes** -- rearrange the layout by clicking and dragging any node

## About

Link prediction estimates which connections are likely to form next in a social or organizational network. The three methods shown here work by analyzing the local neighborhood structure around each unconnected pair of nodes:

- **Common Neighbors** counts how many mutual connections two people share -- the simplest and most intuitive approach
- **Jaccard Coefficient** normalizes by the total neighborhood size, penalizing pairs where one person has far more connections than the other
- **Adamic-Adar** weights shared neighbors by the inverse log of their degree, giving more credit to shared connections who are selective rather than broadly connected
