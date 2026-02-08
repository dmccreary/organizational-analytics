---
title: Influence Network Visualization
description: Interactive force-directed graph revealing formal leaders, informal influencers, and bridge builders across a 35-employee organizational network using PageRank and betweenness centrality.
---

# Influence Network Visualization

This MicroSim lets you explore how organizational influence takes different forms beyond the formal hierarchy. The same network of 35 employees is viewed through four different lenses, revealing that the people who hold official titles are not always the ones who hold the most sway.

Toggle between views to discover **formal leaders** (managers and directors), **informal leaders** (high-PageRank individuals without management titles), and **bridge builders** (people with high betweenness centrality who connect otherwise separate communities). Look for Bea -- a quiet non-manager who bridges three departments and shows up as a key influencer in every lens except the formal one.

<iframe src="./main.html" width="100%" height="580px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

## How to Use

- **Click the toggle buttons** at the top to switch between influence lenses: All, Formal Leaders, Informal Leaders, and Bridge Builders.
- **Hover over a node** to see a tooltip with the employee's name, title, department, PageRank score, and betweenness centrality.
- **Click a node** to pin its detail panel so you can compare multiple employees.
- **Drag nodes** to rearrange the layout. The force-directed simulation will continue to settle around your changes.
- Node **size** reflects PageRank (larger nodes have more influence). Edge **thickness** reflects communication frequency.

## About

This simulation demonstrates a core insight from organizational analytics: influence is multi-dimensional. Someone with a VP title may have low betweenness centrality if they only communicate within their own silo. Meanwhile, a mid-level individual contributor who regularly collaborates across three departments can be the most structurally important person in the network.

The four views correspond to different analytical questions:

| View | Question Answered |
|------|-------------------|
| **All** | What does the overall communication network look like? |
| **Formal Leaders** | Who holds official authority? |
| **Informal Leaders** | Who has disproportionate influence without a title? |
| **Bridge Builders** | Who connects otherwise isolated communities? |

Understanding these distinctions helps organizations identify hidden talent, reduce single points of failure, and design more resilient communication structures.
