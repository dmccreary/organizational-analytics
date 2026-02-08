---
title: Summarization Pipeline
description: Interactive three-column workflow showing raw meeting transcript through summarization to graph-ready structured output
---

# Summarization Pipeline

<iframe src="./main.html" width="100%" height="540px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Read the transcript** in the left column showing a team meeting discussion
2. **Click "Extractive" or "Abstractive"** to switch summarization modes in the center column
3. **Hover over output items** in the right column to see which transcript lines they connect to (highlighted in amber)
4. **Observe the arrows** flowing left to right showing the transformation pipeline

## About

Meeting summarization is a critical NLP step in organizational analytics. Raw transcripts contain valuable signals -- decisions, action items, topic shifts, and sentiment -- but they must be distilled into structured properties before they can enrich a graph database. Extractive summarization selects key sentences verbatim, while abstractive summarization generates new condensed text. The structured output on the right shows what gets attached as properties to meeting event nodes in the organizational graph.
