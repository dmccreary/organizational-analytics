---
title: Trend Analysis Dashboard
description: Four-metric time series dashboard with linear regression trends, confidence bands, and compound trend interpretation for detecting fragmentation, burnout, and recovery patterns.
---

# Trend Analysis Dashboard

The **Trend Analysis Dashboard** tracks four key organizational metrics over time to reveal gradual shifts that periodic snapshots would miss. It demonstrates how linear regression, confidence bands, and compound trend interpretation surface patterns like silent fragmentation, burnout waves, and post-reorg recovery.

<iframe src="./main.html" width="100%" height="570px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Scan the four sparkline panels** showing Collaboration Index, Silo Risk, Sentiment Pulse, and Retention Health over the selected time range. Each panel shows the data line, a dashed trend regression line, and a shaded confidence band.
2. **Adjust the time range** using the buttons (8 Weeks, 3 Months, 6 Months, 12 Months) to see how trends differ across horizons. Short-term trends may show noise; longer ranges reveal structural shifts.
3. **Hover over any data point** to see exact week number and metric value.
4. **Read the Trend Interpretation panel** at the bottom, which automatically detects compound signals from the combination of all four metric trends. Color-coded badges indicate severity.
5. **Toggle "Compare Metrics"** to overlay all four metrics on a single normalized chart for direct visual comparison.

## About This Simulation

The synthetic data contains embedded patterns: a burnout wave around weeks 15-25 (rising communication, declining sentiment), a post-reorg disruption at week 30, and slow silo formation starting at week 35. The highest-value insight comes from comparing trends across related metrics -- declining collaboration plus rising insularity tells a single fragmentation story. This simulation demonstrates the trend analysis principles from Chapter 14.
