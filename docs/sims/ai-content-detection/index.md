---
title: AI Content Detection Pipeline
description: Interactive flowchart showing three parallel detection paths (perplexity, stylometric, behavioral) converging to classify communications as AI-assisted or human-authored.
image: /sims/ai-content-detection/ai-content-detection.png
og:image: /sims/ai-content-detection/ai-content-detection.png
twitter:image: /sims/ai-content-detection/ai-content-detection.png
social:
   cards: false
---
# AI Content Detection Pipeline

<iframe src="main.html" height="502px" scrolling="no"></iframe>

[Run the AI Content Detection Pipeline MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## Description

This interactive flowchart visualizes how incoming communications pass through three parallel detection paths — Perplexity Analysis, Stylometric Analysis, and Behavioral Signals — to determine whether content is likely AI-generated. Each path produces a score that feeds into a weighted composite score. Use the threshold slider to adjust the classification boundary and see how it affects the AI_ASSISTED vs. HUMAN_AUTHORED tagging. Click any detection path to see a detailed description.

## Lesson Plan

### Learning Objective
Students will assess incoming communications using multiple detection signals to determine the likelihood of AI generation and decide on appropriate tagging.

### Activities
1. Explore each detection path by clicking to see detailed descriptions
2. Adjust the threshold slider to see how classification changes
3. Discuss the tradeoffs of setting the threshold too high vs. too low
4. Consider which detection method is most robust to adversarial manipulation
