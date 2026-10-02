---
title: Data Consent Framework
description: Interactive p5.js flowchart of the five components of meaningful data consent (Notice, Purpose, Scope, Access, Recourse) with a feedback loop and a scenario picker for applying each component to an organizational analytics project.
image: /sims/data-consent-framework/data-consent-framework.png
og:image: /sims/data-consent-framework/data-consent-framework.png
twitter:image: /sims/data-consent-framework/data-consent-framework.png
social:
   cards: false
quality_score: 100
---

# Data Consent Framework

<iframe src="main.html" height="517px" width="100%" scrolling="no" style="border: 2px solid #303F9F; border-radius: 8px;"></iframe>

[Run the Data Consent Framework MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

Consent in organizational analytics is more than an opt-in checkbox. The data involved (email headers, calendar entries, chat metadata) is produced as a byproduct of everyday work, and employees may not know it is being captured. Meaningful consent has five components, shown here as a workflow:

1. **Notice** - communicate what data is collected in plain language
2. **Purpose** - state explicitly why the data is being analyzed
3. **Scope** - define boundaries: what will and won't be analyzed
4. **Access** - disclose who sees results and at what granularity
5. **Recourse** - provide channels for questions, objections, and exclusion

The amber arrow on the left runs from Recourse back to Notice. Consent is an ongoing relationship: when the scope of the analytics changes, the whole sequence is repeated.

The MicroSim lets you apply the framework to three scenarios instead of only reading it. Each scenario shows what every component would look like in practice.

## How to Use

1. **Choose a scenario** from the drop-down list below the diagram.
2. **Click each stage** in order. The panel on the right shows what the component requires, how it applies to the chosen scenario, and a self-check question. The number badge turns gold once you have opened a stage.
3. **Hover over a stage** to see an example of wording an organization might use for that component.
4. Select **"Adding sentiment analysis to email."** This scenario changes the scope of an existing program, so the feedback loop is emphasized and the panel reminds you that consent must be refreshed.
5. Work through all five stages for each scenario. The progress line at the bottom of the panel tracks how many you have reviewed.

The examples and scenario text are illustrations written for this course. They are not legal templates.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/data-consent-framework/main.html"
        height="517px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Learning Objective

Students will apply the components of meaningful data consent to organizational analytics scenarios. (Bloom's Taxonomy: Apply)

### Audience

College students and working professionals in information systems, human resources analytics, and enterprise architecture.

### Duration

15 minutes

### Prerequisites

- The difference between communication metadata and communication content
- The central principle of this chapter: analytics should help people, not surveil them

### Activities

1. **Walk the framework** (4 min): With the first scenario selected, click through all five stages and read each "Apply it" statement. Answer each self-check question for that scenario.
2. **Spot the scope change** (4 min): Switch to "Adding sentiment analysis to email." For each stage, write down what is different from the first scenario. Explain why the earlier consent does not cover the new analysis.
3. **Apply it yourself** (7 min): Choose a new scenario that is not in the list, such as analyzing meeting attendance to reduce meeting overload. Write one sentence for each of the five components, using the on-screen examples as a model.

### Discussion Questions

- Which of the five components is most often skipped in practice? What goes wrong when it is?
- The burnout scenario limits scope to patterns across departments. Why does that boundary matter to the people whose data is used?
- What events, other than adding a new kind of analysis, should send a program back around the feedback loop?

### Assessment

Students draft a one-page consent notice for an analytics project of their choice. The notice must address all five components, state at least one thing that will not be analyzed, and name the trigger that would require consent to be refreshed.

## References

1. [General Data Protection Regulation](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation) - Wikipedia - Overview of the EU regulation whose lawful basis, purpose limitation, and transparency requirements shape consent for people data.
2. [Informed consent](https://en.wikipedia.org/wiki/Informed_consent) - Wikipedia - Background on the principle that people should understand and agree to how they are affected.
3. [Privacy by design](https://en.wikipedia.org/wiki/Privacy_by_design) - Wikipedia - The related principle of building privacy protections into a system from the start.
4. [p5.js Reference](https://p5js.org/reference/) - p5.js - Documentation for the JavaScript library used to build this MicroSim.
