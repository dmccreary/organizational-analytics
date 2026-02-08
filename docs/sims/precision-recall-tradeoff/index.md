---
title: Precision-Recall Tradeoff
description: Interactive visualization of how classification threshold affects precision, recall, and organizational consequences
---

# Precision-Recall Tradeoff

<iframe src="./main.html" width="100%" height="550px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

1. **Drag the threshold slider** left or right to adjust the classification threshold from 0.0 to 1.0
2. **Watch the precision and recall bars** animate as the threshold changes
3. **Read the confusion matrix** to see how true positives, false positives, false negatives, and true negatives shift
4. **Check the consequence text** at the bottom for real-world organizational impact at each threshold level

## About

When predicting employee attrition, choosing a classification threshold involves a fundamental tradeoff. A low threshold flags more employees as flight risks (high recall) but generates many false alarms that overwhelm managers. A high threshold produces fewer false alarms (high precision) but misses employees who actually leave. This simulation uses a scenario of 100 employees where 18 actually departed, letting you explore how the threshold decision directly affects organizational outcomes.
