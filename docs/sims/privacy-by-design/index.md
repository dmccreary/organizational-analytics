---
title: Privacy by Design Architecture
description: Interactive p5.js layered architecture diagram showing twelve privacy controls across the Data Collection, Storage, Analysis, and Reporting layers, with collapsible layers and a scoring mode for assessing an analytics system.
image: /sims/privacy-by-design/privacy-by-design.png
og:image: /sims/privacy-by-design/privacy-by-design.png
twitter:image: /sims/privacy-by-design/privacy-by-design.png
social:
   cards: false
quality_score: 100
---

# Privacy by Design Architecture

<iframe src="main.html" height="547px" width="100%" scrolling="no" style="border: 2px solid #303F9F; border-radius: 8px;"></iframe>

[Run the Privacy by Design Architecture MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Privacy by design means building privacy protections into the architecture of an analytics system from the start, instead of adding them after something goes wrong. This MicroSim shows the four layers that data passes through on its way from raw events to finished reports, and the three privacy controls that belong at each layer:

| Layer | Controls |
|---|---|
| **Data Collection** | Metadata Only, Pseudonymize at Ingestion, Purpose Declaration |
| **Storage** | Encryption, Access Controls, Identity Vault Separation |
| **Analysis** | Aggregate by Default, Query Logging, Minimum Group Size |
| **Reporting** | Department-Level Results, Small Cell Suppression, Data Provenance |

Data flows downward from raw data at the top to reports at the bottom. The indigo bar on the right is a reminder that privacy controls span every layer. A system that is strong in three layers and empty in the fourth is not private by design.

## How to Use

1. **Hover over any control** to read what it does and see an example in the panel at the bottom. Click a control to keep its explanation on screen.
2. **Click a layer header** to collapse or expand that layer. Collapsing layers helps you focus on one part of the stack.
3. **Check "Score Your System."** A check box appears on every control. Click the controls that a system has in place. The layer headers show a score out of 3 and the bottom panel shows the total out of 12 with a short assessment that names the weakest layer.
4. **Choose a sample system** from the "Start from" list to assess an architecture that is already filled in:
    - **Rushed pilot** has four controls and nothing at the Reporting layer.
    - **Careful rollout** has ten controls and two remaining gaps.
5. Choose **Blank checklist** to clear every check box and score a system of your own.

The assessment rule is simple and stated on screen: a layer with no controls is a critical gap, because protection added elsewhere can be undone there.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/privacy-by-design/main.html"
        height="547px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Learning Objective

Students will assess whether an organizational analytics architecture incorporates adequate privacy-by-design principles at each layer. (Bloom's Taxonomy: Evaluate)

### Audience

College students and working professionals in information systems, human resources analytics, and enterprise architecture.

### Duration

15-20 minutes

### Prerequisites

- Anonymization and pseudonymization
- The difference between aggregate and individual-level analysis

### Activities

1. **Learn the controls** (5 min): Hover over all twelve controls. For each layer, write one sentence describing what could go wrong if that layer had no controls.
2. **Assess the rushed pilot** (5 min): Load "Example: rushed pilot." Before reading the assessment, decide whether the system is adequate and why. Then compare your judgment with the on-screen verdict. Which three controls would you add first? Check them and watch the score change.
3. **Assess the careful rollout** (4 min): Load "Example: careful rollout." Two controls are missing. Argue whether the system should launch as it is, and what risk each gap leaves open.
4. **Score a real or imagined system** (5 min): Load the blank checklist and score an analytics system you know or one described by your instructor. Report the total, the weakest layer, and your recommendation.

### Discussion Questions

- Is a score of 9 of 12 always better than a score of 8 of 12? Construct a case where it is not.
- Which control would be hardest to add after a system is already in production? Which would be easiest?
- Pseudonymization happens at the Collection layer, but the identity vault is protected at the Storage layer. Why do these two controls depend on each other?

### Assessment

Students write a short architecture review of a described analytics system. The review gives a score for each layer, names the weakest layer, and justifies a go or no-go recommendation with reference to specific missing controls.

## References

1. [Privacy by design](https://en.wikipedia.org/wiki/Privacy_by_design) - Wikipedia - History and principles of the approach developed by Ann Cavoukian.
2. [General Data Protection Regulation](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation) - Wikipedia - The EU regulation whose Article 25 requires data protection by design and by default.
3. [Pseudonymization](https://en.wikipedia.org/wiki/Pseudonymization) - Wikipedia - Background on replacing identifying fields with artificial identifiers.
4. [Role-based access control](https://en.wikipedia.org/wiki/Role-based_access_control) - Wikipedia - Background on restricting system access by role.
5. [p5.js Reference](https://p5js.org/reference/) - p5.js - Documentation for the JavaScript library used to build this MicroSim.
