---
title: Multi-Entity Query Visualization
description: Step-through p5.js MicroSim that executes a multi-entity Cypher query one clause at a time, highlighting the matched nodes and edges in a sample organizational graph and building the result table.
image: /sims/multi-entity-query/multi-entity-query.png
og:image: /sims/multi-entity-query/multi-entity-query.png
twitter:image: /sims/multi-entity-query/multi-entity-query.png
social:
   cards: false
quality_score: 100
---

# Multi-Entity Query Visualization

<iframe src="main.html" height="552px" width="100%" scrolling="no" style="border: 2px solid #303F9F; border-radius: 8px;"></iframe>

[Run the Multi-Entity Query Visualization MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

The chapter's sample query crosses employees, a project, departments, communication edges, and a license in a single statement. That is a lot to read at once. This MicroSim runs the query one clause at a time against a small graph of eight nodes so you can watch the pattern narrow from three candidates to two result rows.

The question the query answers: *Which employees work on the Cloud Migration project, communicate daily with someone outside their own department, and hold a Jira license?*

The sample graph contains:

- Four `:Employee` nodes: Maria and James (Engineering), Carlos and Aisha (Product)
- Two `:Department` nodes, one `:Project` node (Cloud Migration), and one `:License` node (Jira)
- `WORKS_ON`, `WORKS_IN`, `COMMUNICATES_WITH` (daily and weekly), and `HOLDS_LICENSE` edges

At each step the graph highlights what the current clause matches, the query panel marks the lines being executed, and the table underneath records the bindings found so far for each candidate `e`.

!!! note "A conceptual trace"
    A real graph database chooses its own execution order with a query planner, and it matches the whole `MATCH` pattern together. The clause-by-clause order shown here is a teaching model. The result rows are the same either way.

## How to Use

1. Press **Next** to execute one clause, or **Play** to run all seven steps automatically. **Back** returns to the previous step and **Reset** returns to the start.
2. Before each press of **Next**, predict which nodes and edges will light up, and which rows of the table will change.
3. Watch for the two places where the pattern eliminates something:
    - The `WHERE myDept <> otherDept` step crosses out the daily edges between Maria and James, because both are in Engineering.
    - The `HOLDS_LICENSE` step drops Carlos as a candidate, because he has no Jira license.
4. **Hover over any node** to see its properties.
5. Use the **Speed** slider to change how long each step stays on screen during playback.
6. Uncheck **Show Query** to give the graph the full width. On narrow screens the query is hidden until you check the box.

The small gold **e** tag marks the employees that are still candidates for the variable `e`. A red tag with a line through it marks a candidate that has been dropped.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/multi-entity-query/main.html"
        height="552px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Learning Objective

Students will execute a multi-entity Cypher query and trace the traversal path through the organizational graph model. (Bloom's Taxonomy: Apply)

### Audience

College students and working professionals in information systems, human resources analytics, and enterprise architecture.

### Duration

15 minutes

### Prerequisites

- Cypher `MATCH`, `WHERE`, `RETURN`, and `ORDER BY`
- The node types and edge types of the organizational graph model from this chapter

### Activities

1. **Read the query** (3 min): With the MicroSim at Step 1, read the Cypher text. In your own words, write the question it answers.
2. **Predict and step** (7 min): Press Next once per clause. Before each press, write down which employees you expect to remain as candidates. Compare your prediction with the table.
3. **Explain the result** (3 min): At the final step, explain why Maria has a `cross_dept_contacts` value of 2 even though she has three daily contacts, and why Carlos does not appear at all.
4. **Modify the query on paper** (2 min): Change `{frequency: 'daily'}` to `{frequency: 'weekly'}`. Using the graph, work out which rows would be returned.

### Discussion Questions

- Carlos passes every clause except the last one. What would the result be if the `HOLDS_LICENSE` line were removed?
- The query uses `count(DISTINCT other)`. In this dataset, would `count(other)` give a different answer? When could it?
- How many tables and joins would the same question need in a relational database?

### Assessment

Students are given a different question about the same graph, for example "Which employees in Product communicate daily with someone on the Cloud Migration project?", and write the Cypher query, list the nodes and edges it matches, and give the result rows.

## References

1. [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/current/) - Neo4j - Reference for `MATCH` patterns, `WHERE` filtering, aggregation with `count(DISTINCT ...)`, and `ORDER BY`.
2. Robinson, I., Webber, J., & Eifrem, E. (2015). *Graph Databases* (2nd ed.). O'Reilly Media.
3. [Cypher (query language)](https://en.wikipedia.org/wiki/Cypher_(query_language)) - Wikipedia - Overview of the declarative graph query language used in this book.
4. [p5.js Reference](https://p5js.org/reference/) - p5.js - Documentation for the JavaScript library used to build this MicroSim.
