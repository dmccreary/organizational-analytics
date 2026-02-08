---
title: Retention Priority Matrix
description: Interactive 2x2 scatter plot mapping employees by flight risk and organizational impact, with department filtering and contagion link visualization for retention prioritization.
---

# Retention Priority Matrix

The **Retention Priority Matrix** is an interactive scatter plot that maps employees along two critical dimensions: their **flight risk score** (likelihood of leaving) and their **organizational impact score** (how much their departure would affect the organization). This creates a 2x2 matrix that helps HR and leadership teams prioritize retention efforts where they matter most.

<iframe src="./main.html" width="100%" height="530px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Explore the quadrants** -- employees in the top-right "Critical" zone have both high flight risk and high organizational impact and should be the top priority for retention efforts.
2. **Filter by department** -- click any department button at the top to highlight that department's employees and dim the rest. Click "All" to reset.
3. **Toggle contagion links** -- click the "Show Contagion Links" button to reveal dashed red lines connecting at-risk employees who communicate frequently. When one person leaves, connected colleagues often follow.
4. **Hover over a dot** to see a tooltip with the employee's name, title, department, risk score, impact score, and the factors contributing to their flight risk.
5. **Click a dot** to pin a detailed information panel on the right side of the chart.

## About This Simulation

In organizational analytics, retention modeling combines multiple data signals -- compensation benchmarks, tenure patterns, engagement survey responses, manager relationship quality, and market demand for specific skills -- into a composite flight risk score. The organizational impact score reflects factors like centrality in the communication network, institutional knowledge, revenue attribution, and team dependencies.

The **contagion links** feature illustrates a key insight from network science: employee departures rarely happen in isolation. When a well-connected team member leaves, their close collaborators experience increased flight risk -- a phenomenon sometimes called "turnover contagion." Graph databases are particularly well-suited for modeling these interconnected risk patterns, since the relationships between employees are stored as first-class edges that can be traversed efficiently.

This simulation uses synthetic data across five departments to demonstrate how a retention priority matrix helps organizations move from reactive exit interviews to proactive talent retention strategies.
