---
title: Communication Network Model
description: Side-by-side vis-network comparison of aggregate and event-level communication edges built from the same four weeks of messages, with an edge count toggle and a time window filter.
image: /sims/communication-network-model/communication-network-model.png
og:image: /sims/communication-network-model/communication-network-model.png
twitter:image: /sims/communication-network-model/communication-network-model.png
social:
   cards: false
quality_score: 100
---

# Communication Network Model

<iframe src="main.html" height="522px" width="100%" scrolling="no" style="border: 2px solid #303F9F; border-radius: 8px;"></iframe>

[Run the Communication Network Model MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

How you store a conversation decides which questions you can ask about it later. This MicroSim takes one small dataset — 40 messages exchanged among five employees over four working weeks — and models it two ways:

- **Aggregate model (left):** one `COMMUNICATES_WITH` edge per pair of people. The edge carries a `message_count`, a `frequency` label, and a channel breakdown. Edge thickness shows the count.
- **Event-level model (right):** one `SENT_MESSAGE` edge per message. Each dashed arrow carries its own `timestamp`, `channel`, and direction.

Both panels show the same five `:Employee` nodes in the same positions. Only the edges differ: 6 on the left, 40 on the right.

!!! note "About the frequency labels"
    The chapter's Cypher example assigns `daily`, `weekly`, or `monthly` from `message_count` thresholds (200, 50, and 12) over a full message history. This MicroSim uses a four-week sample, so the labels are scaled to messages per week: four or more is `daily`, one or more is `weekly`, and anything less is `monthly`.

## How to Use

1. **Hover over an edge on the left.** The info bar shows the aggregate properties: `message_count`, `frequency`, the channel breakdown, and the first and last contact dates.
2. **Hover over a dashed arrow on the right.** The info bar shows a single message: its timestamp, channel, and who sent it.
3. **Check "Show Edge Count"** to reveal how many edges each model stores. Predict the two numbers before you check the box.
4. **Move the "Time Window" slider** from "All 4 weeks" to a single week. The event-level panel redraws with only that week's messages and the info bar lists the count for each pair. The aggregate panel cannot change, because its edges have no timestamps.

Things to look for as you step through the weeks:

- Maria and James exchange fewer messages each week (5, 5, 4, then 2).
- Maria and Aisha exchange more (0, 1, 3, then 5).
- The aggregate edges still say Maria and James are `daily` and Maria and Aisha are `weekly`. The trend is invisible in that model.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/communication-network-model/main.html"
        height="522px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Learning Objective

Students will differentiate between aggregate and event-level communication edge models, analyzing the trade-offs of each approach. (Bloom's Taxonomy: Analyze)

### Audience

College students and working professionals in information systems, human resources analytics, and enterprise architecture.

### Duration

15 minutes

### Prerequisites

- Nodes, edges, and edge properties in the labeled property graph model
- The `COMMUNICATES_WITH` edge pattern and the `MERGE ... ON CREATE / ON MATCH` example from this chapter

### Activities

1. **Predict** (3 min): Before touching the controls, estimate how many edges each model needs for this dataset. Check "Show Edge Count" and compare.
2. **Compare** (5 min): Hover over the Maria and James edge on the left and write down its properties. Then hover over three of the Maria and James arrows on the right. List one question each model can answer that the other cannot answer as easily.
3. **Analyze change over time** (5 min): Step the Time Window slider through Weeks 1 to 4. Record the weekly counts for Maria and James and for Maria and Aisha. Describe the trend, and explain why the aggregate model hides it.
4. **Decide** (2 min): For each question below, choose the model you would build.
    - Who are the ten most connected people in the company?
    - Did communication with a manager drop in the month before an employee resigned?
    - How quickly did news of a reorganization spread through the network?

### Discussion Questions

- The event-level model here has almost seven times as many edges as the aggregate model after only four weeks. What happens to that ratio after a year?
- Many production systems keep event-level edges for recent data and roll older periods up into aggregates. What do you lose, and what do you gain, when a month is rolled up?
- Could you rebuild the aggregate model from the event-level model? Could you rebuild the event-level model from the aggregate model?

### Assessment

Students write a short design recommendation (one paragraph) for a stated analytics question, naming the edge model they would use, the properties each edge must carry, and one trade-off they are accepting.

## References

1. Robinson, I., Webber, J., & Eifrem, E. (2015). *Graph Databases* (2nd ed.). O'Reilly Media.
2. [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/current/) - Neo4j - Reference for `MERGE` with `ON CREATE SET` and `ON MATCH SET`, the pattern used to maintain aggregate edges.
3. [Organizational network analysis](https://en.wikipedia.org/wiki/Organizational_network_analysis) - Wikipedia - Background on analyzing communication patterns inside organizations.
4. [vis-network documentation](https://visjs.github.io/vis-network/docs/network/) - vis.js - The JavaScript library used to draw both network panels.
