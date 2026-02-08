---
title: Retention Risk Pipeline
description: Interactive left-to-right pipeline showing how graph metrics, NLP signals, and behavioral events feed into a composite retention risk model with contagion overlay
---

# Retention Risk Pipeline

<iframe src="./main.html" width="100%" height="530px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Click any pipeline stage** (input stream, processing step, or output category) to see a detail panel at the bottom describing the algorithms and data involved
2. **Toggle Contagion** button shows or hides the contagion overlay processing stage and the contagion alert output category, demonstrating how network effects amplify individual risk signals
3. **Watch the data particles** flow left to right through the pipeline, visualizing how information moves from raw signals through processing to actionable risk categories
4. **Click Reset** to clear the detail panel and return to the default view

## About

This simulation visualizes the complete retention risk pipeline used in organizational analytics. Three categories of input signals -- graph metrics from the collaboration network, NLP signals from communication analysis, and behavioral events from HR systems -- merge into a feature engineering stage. The engineered features feed a machine learning prediction model that classifies employees into risk tiers: low risk (monitor quarterly), watch (monthly check-in), and high risk (immediate intervention).

The optional contagion overlay adds a network-aware layer that detects when departure risk spreads through tightly connected teams, triggering team-level action rather than just individual interventions. This reflects research showing that turnover is often contagious within close-knit organizational clusters.
