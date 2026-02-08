---
title: Inclusion Network Map
description: Interactive force-directed graph comparing segregated and integrated communication networks with nodes colored by demographic group and inclusion metrics.
quality_score: 82
image: /sims/inclusion-network-map/inclusion-network-map.png
og:image: /sims/inclusion-network-map/inclusion-network-map.png
twitter:image: /sims/inclusion-network-map/inclusion-network-map.png
social:
   cards: false
---
# Inclusion Network Map

<iframe src="main.html" width="100%" height="552px" scrolling="no"
    style="border: 2px solid #303F9F; border-radius: 8px;"
    allow="fullscreen" allowfullscreen></iframe>

[Run the Inclusion Network Map MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

This interactive network visualization compares two organizational communication structures: a segregated network where employees cluster by demographic group, and an integrated network where cross-group connections are abundant. Node colors represent demographic groups, node size represents degree centrality, and edge styling distinguishes within-group from cross-group communication.

Toggle between the two network configurations to see how structural inclusion affects centrality distribution, cross-group edge ratios, and overall integration scores. Click any node to highlight its connections and see whether they cross group boundaries.

## How to Use

- **Toggle button**: Click "Show Integrated" or "Show Segregated" to switch between network configurations with a smooth animated transition.
- **Hover over a node**: See a tooltip with the employee's name, group, degree centrality, and integration score.
- **Click a node**: Highlight all its connections, colored by same-group (gray) vs cross-group (blended color). Click again to deselect.
- **Drag nodes**: Rearrange the layout by dragging any node. The force-directed simulation adjusts around your changes.
- **Metric panel** (bottom-left): Shows overall integration score, cross-group edge ratio, and centrality equity ratio.
- **White border**: Nodes with a thick white border have integration scores above 0.6, meaning most of their connections cross group boundaries.

## Lesson Plan

### Learning Objective
Students will critique an organization's inclusion patterns by examining whether the communication network integrates diverse employees or clusters them into peripheral subgroups.

### Activities
1. **Compare Networks**: Toggle between segregated and integrated views and note the differences in node placement and edge patterns.
2. **Read the Metrics**: Compare integration scores, cross-group ratios, and equity ratios between views.
3. **Find Peripheral Nodes**: In the segregated view, identify nodes with few connections and note their groups.
4. **Discussion**: What organizational practices might create the segregated pattern? What interventions could move toward integration?

### Assessment
- Define network integration score and explain what values indicate inclusion vs segregation.
- Compare the metric panels between the two configurations and interpret the differences.
- Propose three concrete actions to improve cross-group connectivity.

## References

1. [Diversity (business)](https://en.wikipedia.org/wiki/Diversity_(business)) - Wikipedia - Context for why network inclusion matters
2. [Homophily](https://en.wikipedia.org/wiki/Homophily) - Wikipedia - Explains why networks tend toward segregation without intervention
