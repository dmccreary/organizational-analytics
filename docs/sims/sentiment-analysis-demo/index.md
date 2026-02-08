---
title: Sentiment Analysis Demo
description: Interactive sentiment analysis with pre-loaded organizational messages, a sentiment gauge, and token-level scoring
---

# Sentiment Analysis Demo

<iframe src="./main.html" width="100%" height="550px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Click a sample message** from the six workplace communication examples
2. **Watch the gauge** animate smoothly to show the overall sentiment score
3. **Read the token view** below the gauge to see which words drive the sentiment positive or negative
4. **Toggle Simple/Scored** to switch between categorical labels and numeric scores

## About

Sentiment analysis assigns a numeric score to text, indicating whether the tone is positive, negative, or neutral. In organizational analytics, sentiment scores become properties on communication events in the graph database, enabling queries like "Which teams have declining sentiment this quarter?" or "What topics correlate with negative employee communication?" The token-level view reveals how individual words contribute to the overall score.
