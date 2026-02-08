---
title: NLP Enrichment Pipeline
description: Interactive visualization showing how raw text flows through NLP stages to produce graph-ready properties
---

# NLP Enrichment Pipeline

<iframe src="./main.html" width="100%" height="530px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Click any pipeline stage** to see a detailed explanation of what happens at that step
2. **Click "Animate"** to watch a sample email subject flow through all five NLP stages with highlighting
3. **Watch the data transform** from raw text into structured graph properties at each step

## About

Before organizational text data can be stored in a graph database, it passes through a series of NLP enrichment stages. Raw emails, chat messages, and meeting transcripts are tokenized, analyzed for entities, sentiment, topics, and emotion, then structured into properties that attach to nodes and edges in the organizational graph. This pipeline turns unstructured communication into queryable organizational intelligence.
