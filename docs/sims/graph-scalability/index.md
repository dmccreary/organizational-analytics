---
title: Graph Scalability Strategies
description: Interactive infographic showing vertical scaling, horizontal scaling, and query optimization strategies for graph databases
quality_score: 85
---
# Graph Scalability Strategies

<iframe src="main.html" height="502px" width="100%" scrolling="no"></iframe>

[View Graph Scalability Strategies Fullscreen](./main.html){ .md-button .md-button--primary }

## Overview
This MicroSim presents three graph database scalability strategies as interactive cards. Students adjust an organization size slider to see which strategies are recommended at different scales, reinforcing the relationship between data volume and architectural decisions.

## How to Use
1. Drag the "Organization Size" slider from 1K to 1M employees
2. Watch which strategy cards become highlighted as the organization grows
3. Read the estimated node and edge counts for each org size
4. Compare advantages and limitations of each approach

## Key Concepts
- **Vertical scaling** adds more resources to a single server -- effective up to ~100M nodes
- **Horizontal scaling** distributes the graph across a cluster -- needed for very large graphs
- **Query optimization** improves performance at any scale by writing smarter queries
- The right strategy depends on your organization's size and query patterns

## References
- [Neo4j Scalability](https://neo4j.com/developer/guide-performance-tuning/)
