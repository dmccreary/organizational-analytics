---
title: Pathfinding Algorithms Visualizer
description: Interactive comparison of unweighted BFS shortest path vs weighted Dijkstra shortest path
---

# Pathfinding Algorithms Visualizer

<iframe src="./main.html" width="100%" height="670px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Click a node** to set it as the source (amber highlight)
2. **Click another node** to set it as the target (gold highlight)
3. **Click "BFS Path"** to find the unweighted shortest path (fewest hops)
4. **Click "Dijkstra"** to find the weighted shortest path (lowest total cost)
5. **Click "Reset"** to clear and try a different pair

## About

In unweighted graphs, the shortest path is the one with the fewest edges. But when edges have weights (like communication frequency), Dijkstra's algorithm finds the path with the lowest total cost — which may take more hops but follows stronger connections.
