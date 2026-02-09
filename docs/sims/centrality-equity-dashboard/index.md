---
title: Centrality Equity Dashboard
description: Interactive three-panel dashboard showing centrality metric distributions across demographic groups with equity ratio indicators.
quality_score: 82
image: /sims/centrality-equity-dashboard/centrality-equity-dashboard.png
og:image: /sims/centrality-equity-dashboard/centrality-equity-dashboard.png
twitter:image: /sims/centrality-equity-dashboard/centrality-equity-dashboard.png
social:
   cards: false
---
# Centrality Equity Dashboard

<iframe src="main.html" width="100%" height="602px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen scrolling="no"></iframe>

[Run the Centrality Equity Dashboard MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

[Edit the Centrality Equity Dashboard MicroSim Esing the p5.js Editor](https://editor.p5js.org/dmccreary/sketches/SeXm2IEeo)

## About This MicroSim

This three-panel dashboard visualizes how network centrality metrics are distributed across demographic groups. The grouped bar chart (top) compares average centrality across groups. The box plot (bottom-left) shows the full distribution for a selected metric. The equity ratio panel (bottom-right) summarizes the gap between the highest and lowest performing groups using color-coded indicators.

Select different centrality metrics to focus the box plot, and toggle between raw centrality and tenure-controlled values to separate structural effects from seniority effects.

## Lesson Plan

### Learning Objective
Students will assess centrality distribution across demographic groups, evaluate whether network structure creates equitable access, and propose interventions.

### Activities
1. **Compare Groups**: Examine the bar chart to identify which group has the highest and lowest centrality
2. **Examine Distributions**: Switch between metrics in the box plot to see if gaps are consistent
3. **Evaluate Equity**: Read the equity ratios and discuss what "equitable" means in a network context
4. **Control for Tenure**: Toggle the tenure control and discuss how seniority affects centrality

### Assessment
- Interpret the equity ratio and explain what a value of 0.36 means
- Compare raw vs tenure-controlled metrics and explain the difference
- Propose three network interventions to improve centrality equity

## References

1. [Centrality](https://en.wikipedia.org/wiki/Centrality) - Wikipedia - Foundational concepts for network centrality metrics
2. [Social Network Analysis](https://en.wikipedia.org/wiki/Social_network_analysis) - Wikipedia - Methods for analyzing organizational networks
