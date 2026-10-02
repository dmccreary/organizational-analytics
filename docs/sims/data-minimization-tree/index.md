---
title: Data Minimization Decision Tree
description: Interactive p5.js decision tree that guides analysts through four yes or no questions to decide whether a data element should be collected for an organizational analytics project, with sample scenarios, feedback, and a try-your-own mode.
image: /sims/data-minimization-tree/data-minimization-tree.png
og:image: /sims/data-minimization-tree/data-minimization-tree.png
twitter:image: /sims/data-minimization-tree/data-minimization-tree.png
social:
   cards: false
quality_score: 100
---

# Data Minimization Decision Tree

<iframe src="main.html" height="552px" width="100%" scrolling="no" style="border: 2px solid #303F9F; border-radius: 8px;"></iframe>

[Run the Data Minimization Decision Tree MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Data minimization is the principle of collecting and keeping only the data needed for a stated purpose. It is a requirement of GDPR (Article 5(1)(c)) and a habit of every responsible analytics program. The hard part is applying it one data element at a time, when "we might need it someday" is always a tempting answer.

This decision tree turns the principle into four yes or no questions:

1. Is this data element needed to answer your stated analytics question?
2. Can the question be answered with aggregated data instead?
3. Can the question be answered with pseudonymized data?
4. Is there explicit consent and legal basis for identifiable collection?

The questions run from the least intrusive option to the most intrusive. Each one offers a way to stop early with less data. The five outcomes are color coded:

| Color | Meaning | Outcomes |
|---|---|---|
| Gold | Collect | Collect with full audit trail and retention schedule |
| Amber | Collect with restrictions | Collect at aggregate level only; Pseudonymize at ingestion |
| Red | Do not collect | Document why it was excluded; Redesign the analysis question |

## How to Use

1. **Choose a scenario.** Each of the five samples gives an analytics question and a data element. Between them they reach all five outcomes.
2. **Answer the highlighted question** with the **Yes** or **No** button. If your answer matches the model answer, the path advances and the panel explains why. If it does not, the panel explains the reasoning and waits for you to reconsider.
3. **Read the decision.** When you reach an outcome, the panel states the decision and a justification built from your answers. That sentence is what you would record in a data inventory.
4. **Hover over any box** to see an example data element and the reasoning for that question or outcome.
5. **Choose "Try your own..."**, type a data element in the text box, and walk the tree using your own judgment. There are no model answers in this mode.
6. Press **Start Over** to walk the tree again.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/data-minimization-tree/main.html"
        height="552px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Learning Objective

Students will justify data collection decisions using the principle of data minimization, distinguishing between necessary and excessive data elements. (Bloom's Taxonomy: Evaluate)

### Audience

College students and working professionals in information systems, human resources analytics, and enterprise architecture.

### Duration

15-20 minutes

### Prerequisites

- Anonymization, pseudonymization, and aggregation
- Data consent and the idea of a stated purpose

### Activities

1. **Guided practice** (7 min): Work through all five sample scenarios. For each, write down the outcome and the one-sentence justification shown in the panel. Note any question where your first answer differed from the model answer.
2. **Compare two scenarios** (4 min): "Identity, opt-in support program" and "Identity, flagging low emailers" involve almost the same data element and give opposite outcomes. Explain what differs between them. Is it the data, or the question being asked?
3. **Try your own** (6 min): Choose "Try your own..." and evaluate three data elements for a project you can imagine, such as meeting calendar entries, chat message text, or badge swipe times. Record each decision and its justification.
4. **Challenge a decision** (3 min): Trade one of your justifications with a partner. Each partner argues for a less intrusive outcome than the one recorded.

### Discussion Questions

- Why are the questions asked in this order? What would go wrong if the consent question came first?
- The tree treats "Do not collect" as a legitimate result, not a failure. How would you explain that to a stakeholder who wants the data?
- The last outcome says to redesign the analysis question. Rewrite "Which individuals send the fewest emails?" so that it can be answered with aggregated data.

### Assessment

Students submit a data inventory of five data elements for a proposed analytics project. For each element they give the outcome from the tree and a justification that cites the answer to every question on the path.

## References

1. [Data minimization](https://en.wikipedia.org/wiki/Data_minimization) - Wikipedia - The principle of limiting collection to what is necessary for a specific purpose.
2. [General Data Protection Regulation](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation) - Wikipedia - The EU regulation that lists data minimization among its principles for processing personal data.
3. [Pseudonymization](https://en.wikipedia.org/wiki/Pseudonymization) - Wikipedia - Background on replacing identifying fields with artificial identifiers.
4. [Decision tree](https://en.wikipedia.org/wiki/Decision_tree) - Wikipedia - Background on tree-structured decision models.
5. [p5.js Reference](https://p5js.org/reference/) - p5.js - Documentation for the JavaScript library used to build this MicroSim.
