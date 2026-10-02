---
title: Complete Organizational Graph Schema
description: Interactive vis-network meta-model of the complete organizational graph schema showing ten node types and thirteen edge types, with sample Cypher and a question picker for assessing what each element contributes.
image: /sims/org-graph-schema/org-graph-schema.png
og:image: /sims/org-graph-schema/org-graph-schema.png
twitter:image: /sims/org-graph-schema/org-graph-schema.png
social:
   cards: false
quality_score: 100
---

# Complete Organizational Graph Schema

<iframe src="main.html" height="602px" width="100%" scrolling="no" style="border: 2px solid #303F9F; border-radius: 8px;"></iframe>

[Run the Complete Organizational Graph Schema MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

This is the whole organizational model on one page. It is a **schema**, or meta-model: each box is a node *type* (a label such as `:Employee`) and each arrow is an edge *type* (such as `:WORKS_IN`). There are no individual people or departments here, only the kinds of things the graph can hold and the kinds of connections between them.

The diagram shows the ten node types and thirteen edge types from the chapter. `Employee` sits in the center because ten of the thirteen edge types start or end there. The three Employee-to-Employee edge types (`REPORTS_TO`, `COMMUNICATES_WITH`, and `MENTORED_BY`) are drawn as loops that leave `Employee` and return to it.

The dashed `Event` box stands for the `:CommunicationEvent` node used in the chapter's activity type example. It is not one of the ten core node types. It appears because `CLASSIFIED_AS` needs a source.

A schema is a set of design decisions, and every node type and edge type costs something to load and maintain. The question picker lets you judge which parts of the schema a given analytics question actually needs.

## How to Use

1. **Hover over a node type** to highlight every edge type connected to it. The Details panel gives its purpose, key properties, and the reason it earns a place in the model.
2. **Hover over an edge type** (the arrow or its label) to see its direction and properties.
3. **Click a node type** to see a sample Cypher `CREATE` statement taken from the chapter. Click it again, or click the background, to clear it.
4. **Choose a question** under "Assess the Schema." The node types and edge types needed to answer it stay lit and everything else dims. The Details panel explains how the answer is computed.
5. Use the navigation buttons to zoom or pan on a small screen.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/org-graph-schema/main.html"
        height="602px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Learning Objective

Students will assess the complete organizational graph schema, evaluating how each node type and edge type contributes to organizational analytics capability. (Bloom's Taxonomy: Evaluate)

### Audience

College students and working professionals in information systems, human resources analytics, and enterprise architecture.

### Duration

15-20 minutes

### Prerequisites

- The node types and edge types introduced earlier in this chapter
- Reading Cypher `CREATE` and `MATCH` patterns

### Activities

1. **Survey** (5 min): Hover over every node type. For each one, note how many edge types touch it. Rank the node types from most connected to least connected.
2. **Assess** (8 min): Work through all seven questions in the picker. For each, record the node types and edge types that stay lit. Build a tally of how often each element is used.
3. **Judge** (5 min): Using the tally, name the two elements you would build first and the two you would defer. Defend each choice in one sentence. The chapter's advice is to start minimal and expand deliberately. Does your ranking agree?

### Discussion Questions

- `Position` could have been a `title` property on `Employee`. What analytics capability would be lost?
- Three edge types connect `Employee` to `Employee`. Why are they separate types rather than one `RELATED_TO` edge with a `kind` property?
- Which question in the picker needs the fewest schema elements? Which needs the most? What does that suggest about the cost of answering each one?
- Propose one analytics question that this schema cannot answer. What node type or edge type would you add?

### Assessment

Students choose an analytics question that matters to an organization they know, list the minimum set of node types and edge types required to answer it, and justify one element they deliberately left out.

## References

1. Robinson, I., Webber, J., & Eifrem, E. (2015). *Graph Databases* (2nd ed.). O'Reilly Media.
2. [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/current/) - Neo4j - Reference for the `CREATE` and `MATCH` clauses used in the sample statements.
3. [Graph database](https://en.wikipedia.org/wiki/Graph_database) - Wikipedia - Overview of the labeled property graph model behind this schema.
4. [vis-network documentation](https://visjs.github.io/vis-network/docs/network/) - vis.js - The JavaScript library used to draw this schema.
