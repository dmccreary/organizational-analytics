---
title: Task Assignment Optimization Flow
description: Interactive flowchart showing how task assignment decisions balance skill match, workload capacity, and employee development goals using graph-based optimization.
---
# Task Assignment Optimization Flow

<iframe src="main.html" height="567px" width="100%" scrolling="no"></iframe>

[Run Task Assignment Optimization Flow Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/task-assignment-flow/main.html" height="567px" width="100%" scrolling="no"></iframe>
```

## Description

This MicroSim visualizes the decision workflow for assigning tasks to employees in a graph-modeled organization. When a task arrives, it first passes through a priority check, then follows one of two optimization paths:

- **High-priority path (left, indigo):** Optimizes for speed and fit. Candidates are filtered by skill match (at least 60%), workload capacity, and network bridging potential before assigning to the best match.
- **Backlog path (right, amber):** Optimizes for employee development. The system scans for candidates with 1-2 learning gaps, uses a relaxed capacity threshold (70%), and aligns assignments with quarterly development goals.

Both paths converge at a final tracking step that updates workload counters and logs events for analytics.

**How to use:**

- **Hover** over any flowchart node to see a description of the logic at that stage
- **Click** any node to see the Cypher query snippet that implements that step in a graph database
- **Check "Show Sample Data"** to display example task and candidate data flowing through each stage
- Press **Reset View** to close the Cypher panel

## Lesson Plan

**Learning Objective:** Students will design an automated task assignment workflow that balances skill match, workload capacity, and employee development goals.

**Bloom's Level:** Create (L6)

**Activities:**

1. Walk through each stage of the flowchart. For each node, click to view the Cypher query and discuss how the graph data model supports that operation
2. Enable "Show Sample Data" and trace a high-priority task through the left path. Why was Alice selected over Bob?
3. Trace a backlog task through the right path. Why is Dana a better growth assignment than Eve?
4. **Design challenge:** Modify the flowchart to handle a third path for "urgent but no skill match found" -- what fallback strategy would you design?
5. Discuss: What are the ethical implications of using network centrality (bridging potential) as a factor in task assignment?

**Assessment:** Students design their own task assignment workflow for a different organizational scenario (e.g., incident response, project staffing) and write the corresponding Cypher queries for at least three stages.

## Concepts Covered

- Task assignment as a graph optimization problem
- Skill matching using graph pattern matching
- Workload balancing with property constraints
- Betweenness centrality as a bridging metric
- Development-oriented assignment strategies
- Event tracking in organizational graphs

## References

1. [Task Assignment Problem - Wikipedia](https://en.wikipedia.org/wiki/Assignment_problem) - The mathematical foundations of optimal task assignment
2. [Betweenness Centrality - Wikipedia](https://en.wikipedia.org/wiki/Betweenness_centrality) - The graph metric used for network fit scoring
