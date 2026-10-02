---
title: Transparency Maturity Model
description: Interactive p5.js maturity model with four levels of analytics transparency (Opaque, Notified, Informed, Participatory) and a six-question self-assessment that marks an organization's approximate level and lists the next steps.
image: /sims/transparency-maturity/transparency-maturity.png
og:image: /sims/transparency-maturity/transparency-maturity.png
twitter:image: /sims/transparency-maturity/transparency-maturity.png
social:
   cards: false
quality_score: 100
---

# Transparency Maturity Model

<iframe src="main.html" height="487px" width="100%" scrolling="no" style="border: 2px solid #303F9F; border-radius: 8px;"></iframe>

[Run the Transparency Maturity Model MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Transparency is the bridge between consent and trust. An analytics program that operates in secret eventually destroys the trust it depends on, however harmless the analysis. This MicroSim arranges analytics programs on a four-level scale, from dark to bright:

| Level | Name | What it looks like | Risk |
|---|---|---|---|
| 1 | **Opaque** | Analytics happen in secret. Employees are unaware data is collected. | High: trust erosion when discovered |
| 2 | **Notified** | Employees are told data is collected, with limited detail on methods or purpose. | Medium: compliance without buy-in |
| 3 | **Informed** | Purpose, methods, and access are documented. Employees can request their data. | Low: building trust |
| 4 | **Participatory** | Employees co-design analytics goals. Results are shared and discussed openly, and feedback drives the program. | Minimal: trust is an asset |

The small squares in the corner of each card are an openness meter: one more square is filled at each level.

## How to Use

1. **Hover over or click a level** to read an illustrative scenario and the step that moves a program up to the next level.
2. Press **Start Self-Assessment**. Think of an analytics program you know, or one your instructor describes, and answer the six yes or no questions. They are the six questions of the transparency checklist in this chapter.
3. After the sixth answer the diagram marks the program's **approximate level** with a "YOU ARE HERE" tag, shows your six answers, and lists what must change to reach the next level.
4. Press **Restart Self-Assessment** to try a different program.

### How the level is worked out

| To reach | These answers must be yes |
|---|---|
| Level 2 - Notified | Question 1 (a clear description of the program has been published) |
| Level 3 - Informed | Questions 1, 2, 3, and 6 (employees can see their data, know who has access, and limitations are documented) |
| Level 4 - Participatory | All six, including questions 4 and 5 (findings are shared back and a feedback channel exists) |

The result is approximate. Six yes answers show there is no gap on the checklist. They do not prove that employees truly help set the goals of the program, which is the defining feature of Level 4.

The scenarios are illustrations written for this course. They do not describe real organizations.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/transparency-maturity/main.html"
        height="487px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Learning Objective

Students will evaluate an organization's transparency maturity level and identify steps to improve. (Bloom's Taxonomy: Evaluate)

### Audience

College students and working professionals in information systems, human resources analytics, and enterprise architecture.

### Duration

15 minutes

### Prerequisites

- The four dimensions of transparency from this chapter: process, purpose, result, and limitation
- The components of data consent

### Activities

1. **Read the scale** (3 min): Hover over each level. In one sentence each, describe what an employee would know about the analytics program at that level.
2. **Evaluate a case** (5 min): Your instructor describes an analytics program (or use this one: *a company announced in an all-hands meeting that it analyzes collaboration data and published a methods page, but has never shared any findings with staff*). Run the self-assessment for it. Record the level and the listed next steps.
3. **Evaluate your own setting** (5 min): Run the self-assessment for an organization you know. Where you are unsure of an answer, treat it as "no" and note what you would need to find out.
4. **Plan the improvement** (2 min): Choose the single next step that would matter most to employees, and explain why.

### Discussion Questions

- Why can a Level 2 program be riskier than it looks? What does "compliance without buy-in" mean in practice?
- Two programs can both answer yes to five questions and land on different levels. Which question makes the difference, and is that fair?
- What would an employee need to see, not just be told, before they believed a program was at Level 4?

### Assessment

Students write a short evaluation of a described analytics program. The evaluation states the maturity level, cites the checklist answers that justify it, and recommends two specific steps to reach the next level.

## References

1. [Transparency (behavior)](https://en.wikipedia.org/wiki/Transparency_(behavior)) - Wikipedia - Background on openness, communication, and accountability in organizations.
2. [Capability Maturity Model](https://en.wikipedia.org/wiki/Capability_Maturity_Model) - Wikipedia - The origin of staged maturity models like the one used here.
3. [General Data Protection Regulation](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation) - Wikipedia - The EU regulation whose transparency and data access requirements underpin Levels 2 and 3.
4. [p5.js Reference](https://p5js.org/reference/) - p5.js - Documentation for the JavaScript library used to build this MicroSim.
