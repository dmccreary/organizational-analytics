---
title: GNN Message Passing
description: Animated visualization of Graph Neural Network message passing on a small organizational network
---

# GNN Message Passing

<iframe src="./main.html" width="100%" height="580px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Observe the initial state** where each node displays its original feature vector as three colored bars (centrality, tenure, performance)
2. **Click Layer 1** to watch messages flow from direct neighbors, blending each node's features with those of its immediate connections
3. **Click Layer 2** to propagate information one more hop, so that second-degree connections now influence every node's representation
4. **Hover over any node** to see its name and current feature values
5. **Click Reset** to return all nodes to their original feature vectors

## About

Graph Neural Networks learn node representations by iteratively aggregating information from neighbors. In each layer, every node collects feature vectors from its connections and combines them with its own. After one layer, a node knows about its direct neighbors. After two layers, it has absorbed information from two hops away. This simulation demonstrates that process on a small organizational graph centered on Maria, showing how network context enriches each person's representation beyond their individual attributes.
