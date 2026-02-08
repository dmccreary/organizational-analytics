---
title: Skill Gap Heatmap
description: Interactive heatmap showing skill coverage across teams, with cells colored by gap severity to help differentiate individual skill gaps from systemic training gaps.
image: /sims/skill-gap-heatmap/skill-gap-heatmap.png
og:image: /sims/skill-gap-heatmap/skill-gap-heatmap.png
twitter:image: /sims/skill-gap-heatmap/skill-gap-heatmap.png
social:
   cards: false
---
# Skill Gap Heatmap

<iframe src="main.html" width="100%" height="550px"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

[Run the Skill Gap Heatmap MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

This interactive heatmap visualizes skill coverage across six teams and ten technical skills. Each cell is colored by gap severity: green for well-covered skills (80-100%), amber for moderate gaps (40-79%), and red for critical gaps (0-39%). The summary bar at the bottom shows organization-wide averages and highlights skills that are candidates for training programs.

In organizational analytics, skill gap analysis is a natural application of graph databases. Employees, skills, certifications, and training programs form a rich property graph where MATCH queries can reveal patterns invisible in flat spreadsheets -- like which teams share skill deficits (suggesting a systemic gap) versus which teams have unique weaknesses (suggesting targeted hiring or training).

## How to Use

1. **Hover** over any cell to see the team name, skill, coverage percentage, and the number of members with and without that skill
2. **Click a column header** (skill name) to sort teams by that skill's coverage -- click again to reverse the sort order
3. **Click a row header** (team name) to highlight that team's entire row for easy comparison across skills
4. **Check "Show Critical Only"** to dim all cells except those below 40% coverage, making critical gaps stand out
5. **Click "Reset Sort"** to restore the original team order and clear highlights
6. **Review the summary bar** at the bottom to see org-wide skill coverage and identify training program candidates (marked with a star)

## Lesson Plan

### Learning Objective

Students will differentiate between individual skill gaps and systemic training gaps by analyzing skill coverage patterns across teams and roles.

### Bloom Taxonomy Level

**Analyze (Level 4)** -- Students must examine coverage patterns, distinguish individual from systemic gaps, and interpret the heatmap to draw conclusions about training priorities.

### Warm-Up Activity (5 minutes)

Ask students: "If three different teams all lack the same skill, is that a coincidence or a pattern? How would you tell the difference?"

### Guided Exploration (15 minutes)

1. **Identify Critical Gaps**: Use the "Show Critical Only" filter. Which skills appear red across multiple teams? These are systemic gaps.
2. **Sort by Skill**: Click the "Spark" column header. Notice that almost every team has low coverage. Compare this with "Git" -- where most teams are well-covered.
3. **Team-Level Analysis**: Click on "Customer Success" in the row headers. This team has uniquely low coverage across many skills -- suggesting a different kind of intervention than a single training program.
4. **Org-Wide Patterns**: Look at the summary bar. Which skills fall below 50%? These are training program candidates that would benefit the entire organization.

### Discussion Questions

1. What is the difference between a skill that is critically low in one team versus across the entire organization? How would your recommended intervention differ?
2. The "Customer Success" team shows low coverage in most technical skills. Does this represent a "gap" that needs closing, or does it reflect appropriate role specialization? How would you decide?
3. If you could fund only two training programs, which skills would you prioritize based on this heatmap? Defend your choice using both the cell-level and summary-bar data.

### Assessment

- Given a new heatmap, identify at least two systemic skill gaps and two team-specific gaps
- Write a Cypher query that would produce this kind of coverage analysis from a graph database storing employee-skill relationships
- Propose a training program plan that addresses the most impactful gaps first, with justification based on coverage patterns

## Graph Database Connection

In a labeled property graph, skill gap analysis maps naturally to the data model:

```
(:Employee)-[:HAS_SKILL {proficiency: 'intermediate'}]->(:Skill)
(:Employee)-[:MEMBER_OF]->(:Team)
(:Skill)-[:REQUIRED_BY]->(:Role)
```

A Cypher query to compute team-skill coverage might look like:

```cypher
MATCH (t:Team)<-[:MEMBER_OF]-(e:Employee)
WITH t, count(e) AS teamSize
MATCH (t)<-[:MEMBER_OF]-(e2:Employee)-[:HAS_SKILL]->(s:Skill)
WITH t, s, teamSize, count(DISTINCT e2) AS skilled
RETURN t.name AS team, s.name AS skill,
       round(100.0 * skilled / teamSize) AS coverage_pct
ORDER BY coverage_pct ASC
```

This query leverages the graph's native relationship traversal to compute coverage percentages without complex joins -- exactly the kind of analysis that graph databases excel at compared to relational approaches.
