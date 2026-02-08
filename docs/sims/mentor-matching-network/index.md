---
title: Mentor-Mentee Matching Network
description: Interactive bipartite graph visualization of mentor-mentee pairing with skill similarity, network proximity, and cross-departmental reach scoring.
quality_score: 80
image: /sims/mentor-matching-network/mentor-matching-network.png
og:image: /sims/mentor-matching-network/mentor-matching-network.png
twitter:image: /sims/mentor-matching-network/mentor-matching-network.png
social:
   cards: false
---
# Mentor-Mentee Matching Network

<iframe src="main.html" height="502px" width="100%" scrolling="no"></iframe>

[Run Mentor-Mentee Matching Network Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/mentor-matching-network/main.html" height="502px" width="100%" scrolling="no"></iframe>
```

## Description

This bipartite graph visualization shows the mentor-mentee matching process from the perspective of a graph database. The mentee (Priya Sharma, a Junior Data Analyst in Marketing Analytics) appears on the left, five candidate mentors appear on the right, and shared skill nodes form a bridge in the center. Pairing scores are computed from skill similarity, cross-departmental reach, and shared project history -- all factors that a graph-based matching algorithm would traverse.

**How to use:**

- **Hover over a mentor candidate** to highlight the skills they share with Priya and see a detailed score breakdown tooltip
- **Click a skill diamond** to highlight all people connected to that skill
- Toggle **Show Growth Skills** to reveal skills that mentors have but Priya does not yet -- these represent learning opportunities
- Adjust the **Cross-Dept Weight** slider to see how weighting cross-department exposure changes the pairing recommendations in real time
- The **gold ring** highlights the best overall match based on current weights
- **Dashed amber lines** connect the mentee to each candidate, with thickness proportional to the pairing score

## About This Simulation

Mentor-mentee matching is a natural graph problem. In a labeled property graph, employees are nodes with skill, department, and tenure properties; HAS_SKILL edges link people to their competencies; and WORKS_WITH or COLLABORATES_ON edges capture network proximity. A matching algorithm traverses these relationships to find candidates who maximize skill overlap (for coaching relevance), cross-departmental reach (for career breadth), and shared project context (for trust and rapport).

The scoring model in this simulation combines three factors:

| Factor | Weight Source | Purpose |
|--------|-------------|---------|
| **Skill Similarity** | Jaccard-like overlap | Ensures the mentor can coach relevant skills |
| **Cross-Department Bonus** | Slider-adjustable | Rewards mentors from different departments for broader exposure |
| **Shared Project Bonus** | Number of past collaborations | Reflects pre-existing trust and communication patterns |

By adjusting the cross-department weight slider, students can observe how different organizational priorities -- deep specialization versus broad network exposure -- shift which mentor rises to the top.

## Lesson Plan

**Learning Objective:** Students will assess the quality of mentor-mentee pairings by examining skill similarity, network proximity, and cross-departmental reach within the organizational graph.

**Bloom's Level:** Evaluate (L5)

**Activities:**

1. With the slider at the default (40%), identify the best match and explain why that mentor scores highest by examining the shared skills and score breakdown
2. Move the slider to 0% (pure similarity) and then to 100% (maximum cross-department weighting) -- describe how the best match changes and what each extreme implies for the mentee's development
3. Toggle "Show Growth Skills" and identify which mentor offers the most growth skills -- discuss whether growth potential should factor into the matching algorithm
4. Click individual skill nodes and observe which mentors share that skill -- propose a Cypher query that would find all employees who share a given skill with a target mentee

**Assessment:** Students design a scoring function for a different matching scenario (e.g., project team assembly or succession planning) and explain which graph relationships their function would traverse and why.

## References

1. [Mentoring - Wikipedia](https://en.wikipedia.org/wiki/Mentoring) - Overview of mentoring relationships and organizational mentoring programs
2. [Bipartite graph - Wikipedia](https://en.wikipedia.org/wiki/Bipartite_graph) - The graph structure used to model matching problems
3. [Jaccard index - Wikipedia](https://en.wikipedia.org/wiki/Jaccard_index) - The similarity measure underlying skill overlap scoring
