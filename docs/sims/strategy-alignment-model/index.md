---
title: Strategy Alignment Graph Model
description: Interactive three-layer graph visualization showing how individual tasks connect through projects to strategic objectives, with alignment strength indicators.
quality_score: 82
image: /sims/strategy-alignment-model/strategy-alignment-model.png
og:image: /sims/strategy-alignment-model/strategy-alignment-model.png
twitter:image: /sims/strategy-alignment-model/strategy-alignment-model.png
social:
   cards: false
---
# Strategy Alignment Graph Model

<iframe src="main.html" height="542px" scrolling="no"
    style="overflow: hidden; width: 100%; border: 2px solid #303F9F; border-radius: 8px;"
    allow="fullscreen" allowfullscreen></iframe>

[Run the Strategy Alignment Graph Model MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

This interactive graph model visualizes the three-layer alignment chain that connects individual tasks to projects to strategic objectives. Edge thickness represents alignment strength (0.0 to 1.0), making it easy to see which work streams directly support organizational strategy.

Hover over a strategic objective to highlight its connected projects and tasks. Click any project to see its alignment score. Notice the unaligned projects with dashed borders -- they represent work that may need strategic justification or redirection.

## How to Use

- **Hover over a strategic objective** (gold hexagon) to highlight all connected projects and tasks, dimming unconnected elements.
- **Hover over an unaligned project** to see a tooltip warning about missing strategic alignment.
- **Click any project** to open a detail panel showing its alignment score, linked objective, and task list.
- **Click the Reset View button** or click on empty space to clear any selection.
- Edge **thickness** on the gold ALIGNS_WITH edges reflects the alignment strength (0.0 to 1.0).
- Projects with **dashed red borders** are not aligned to any strategic objective.

## Lesson Plan

### Learning Objective
Students will connect organizational activities (tasks, projects) to strategic objectives through a layered graph model and analyze alignment patterns.

### Activities
1. **Explore Alignment**: Hover over each strategic objective to see which projects and tasks support it
2. **Identify Gaps**: Find the unaligned projects and discuss why they might exist
3. **Calculate Alignment**: Estimate the overall alignment percentage by counting aligned vs total tasks
4. **Discussion**: What should leadership do about unaligned projects?

### Assessment
- Draw the ALIGNS_WITH and PART_OF relationship schema
- Calculate a department-level alignment score from the visual data
- Propose how to connect orphaned projects to strategic objectives

## References

1. [Strategic Alignment](https://en.wikipedia.org/wiki/Strategic_alignment) - Wikipedia - Foundational concept for connecting work to strategy
2. [OKR (Objectives and Key Results)](https://en.wikipedia.org/wiki/OKR) - Wikipedia - Popular framework for strategy alignment
