---
title: Career Path Explorer
description: Interactive radial graph visualization of career mobility paths with skill readiness scoring, historical transition frequency, and two-hop role exploration.
---

# Career Path Explorer

The **Career Path Explorer** is an interactive radial graph visualization that helps students evaluate career path options for an individual employee by analyzing historical role transitions, skill readiness, and network positioning. This MicroSim demonstrates how graph databases model career mobility as a network of role nodes connected by transition edges, weighted by historical frequency and annotated with skill readiness scores.

<iframe src="./main.html" width="100%" height="527px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

<a href="./main.html" target="_blank" class="md-button md-button--primary">Open Full Screen</a>

## How to Use

1. **Explore the radial tree** -- the center node (amber) is the current role. First-ring nodes are immediate next-step roles, and outer-ring nodes are two-step destinations.
2. **Read the color coding** -- green nodes indicate high skill readiness (>80%), amber nodes indicate developing readiness (50--80%), and gray nodes are stretch roles (<50% readiness).
3. **Examine edge thickness** -- thicker edges represent career transitions taken by more people historically. Dashed edges indicate paths taken by fewer than 3 people.
4. **Hover over any node** to see a detailed tooltip with required skills, skill readiness percentage, historical transition count, and average transition time.
5. **Click a role node** to recenter the visualization on that role and explore its career paths. Only roles with known next steps can be recentered.
6. **Check "Show Skill Gaps"** to overlay the missing skills on developing and stretch roles, helping identify what training would be needed.
7. **Adjust the Min Frequency slider** to filter out uncommon career paths and focus on the most frequently traveled transitions.

## About This Simulation

In organizational analytics, career path modeling treats each job role as a **node** and each historical career transition as a **directed edge** in a graph. The edge weight captures how many employees have made that transition, and the average duration provides timing context. When stored in a graph database, these paths can be traversed efficiently using Cypher queries like:

```
MATCH path = (current:Role {name: 'Data Analyst'})-[:TRANSITIONS_TO*1..2]->(future:Role)
RETURN path, relationships(path) AS transitions
```

The **skill readiness** score compares an employee's current skill profile against the required skills for each target role. This is computed as the ratio of matching skills to total required skills, with proficiency levels factored in. Graph databases excel at this kind of multi-hop, relationship-rich analysis because they store connections natively rather than requiring expensive join operations.

This simulation uses synthetic data representing common career paths in a technology organization's analytics function. The radial layout makes it easy to visually compare path options, while the interactive controls let students filter and focus their analysis -- skills that translate directly to building career recommendation engines with real organizational data.

## Lesson Plan

### Learning Objective

Students will evaluate career path options for an individual employee by analyzing historical role transitions, skill readiness, and network positioning.

### Bloom Level

**Evaluate (Level 5)** -- Students must analyze multiple career paths, assess skill readiness, consider historical frequency, and recommend optimal career development strategies.

### Activities

1. **Identify the highest-readiness path** -- Starting from "Data Analyst," which next-step role has the highest skill readiness? What does this tell you about the employee's current skill profile?

2. **Analyze stretch roles** -- Enable "Show Skill Gaps" and examine the stretch roles. Which role has the most missing skills? What training program would you recommend?

3. **Evaluate path frequency** -- Set the Min Frequency slider to 5. Which paths disappear? What does low frequency tell you about a career transition -- is it risky, rare, or newly created?

4. **Two-step planning** -- Click on "Senior Analyst" to recenter. Now evaluate the two-step career paths from Data Analyst through Senior Analyst. Which endpoint offers the best combination of readiness and historical precedent?

5. **Graph database connection** -- Write a Cypher query that would find all two-hop career paths from a given role, ordered by the number of historical transitions. How would you add a WHERE clause to filter by minimum skill readiness?
