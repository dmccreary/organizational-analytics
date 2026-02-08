---
title: ETL Event-to-Graph Transform
description: Interactive step-through visualization showing how a single raw event record is decomposed into graph nodes and edges during ETL transformation.
quality_score: 80
image: /sims/etl-event-to-graph/etl-event-to-graph.png
og:image: /sims/etl-event-to-graph/etl-event-to-graph.png
twitter:image: /sims/etl-event-to-graph/etl-event-to-graph.png
social:
   cards: false
---
# ETL Event-to-Graph Transform

<iframe src="main.html" height="502px" width="100%" scrolling="no"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>

[Run ETL Event-to-Graph Fullscreen](./main.html){ .md-button .md-button--primary }

```html
<iframe src="{{site.baseurl}}/sims/etl-event-to-graph/main.html"
        height="502px" width="100%" scrolling="no"
        style="border: 2px solid #303F9F; border-radius: 8px;"
        allow="fullscreen" allowfullscreen></iframe>
```

## Description

This MicroSim walks you through the **ETL (Extract, Transform, Load) transform phase** — the
critical middle step where a flat event record is decomposed into the nodes and
edges that make up a labeled property graph. A single email, chat message, or
calendar invite contains implicit relationships between people; the transform
rules make those relationships explicit so they can be stored in a graph database
and queried with Cypher.

Click the **Step** button to advance through the six-step transformation
one rule at a time. On the left you will see the raw event record with the
relevant fields highlighted. In the center column the active transform rule
lights up — either creating a node via MERGE (so duplicates are avoided) or
creating an edge. On the right the graph builds incrementally: first the sender
node appears, then each recipient node, and finally the directed edges that
capture "who contacted whom."

Use the **Event Type** toggle to switch between Email, Chat, and Calendar events
and observe how the same three rules apply regardless of event type — only the
edge label changes. Press **Reset** at any time to start over.

## Lesson Plan

**Learning Objective:** Students will demonstrate how a single raw event record
is decomposed into multiple graph elements (nodes and edges) during the ETL
transform phase. *(Bloom's Level 3 — Apply; Level 4 — Analyze)*

### Activities

1. **Guided walkthrough** — Step through all six stages for an Email event
   while the instructor narrates each rule.
2. **Compare event types** — Toggle to Chat and Calendar. Identify what stays
   the same (node creation) and what changes (edge label).
3. **Predict the output** — Before clicking Step, ask students to predict
   how many nodes and edges a four-recipient meeting invite would produce.
4. **Sketch your own** — Give students a raw event JSON for a Slack thread
   with five participants. Have them draw the resulting graph on paper before
   verifying with the sim.

### Assessment

- Can the student explain why MERGE is used for nodes but CREATE is used for
  edges?
- Can the student calculate the number of nodes and edges produced from an
  event with *n* recipients?
- Can the student describe how this transform preserves the temporal ordering
  of interactions?

## References

1. Robinson, I., Webber, J., & Eifrem, E. (2015). *Graph Databases: New
   Opportunities for Connected Data* (2nd ed.). O'Reilly Media.
2. Neo4j Documentation — [ETL Tool](https://neo4j.com/labs/etl-tool/) and
   [MERGE clause](https://neo4j.com/docs/cypher-manual/current/clauses/merge/).
3. Needham, M. & Hodler, A. (2019). *Graph Algorithms: Practical Examples in
   Apache Spark and Neo4j*. O'Reilly Media.
