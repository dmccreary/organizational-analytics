---
title: Event Log Anatomy
description: Interactive diagram showing the anatomy of a single event log record with required and optional fields, with toggle between Email and Chat event examples.
quality_score: 80
image: /sims/event-log-anatomy/event-log-anatomy.png
og:image: /sims/event-log-anatomy/event-log-anatomy.png
twitter:image: /sims/event-log-anatomy/event-log-anatomy.png
social:
   cards: false
---
# Event Log Anatomy

<iframe src="main.html" height="487px" width="100%" scrolling="no"></iframe>

[Run Event Log Anatomy Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/organizational-analytics/sims/event-log-anatomy/main.html" height="487px" width="100%" scrolling="no"></iframe>
```

## Description

This infographic MicroSim visualizes the anatomy of a single event log record — the fundamental building block of employee event streams. The diagram displays the six **required fields** (Event ID, Timestamp, Actor, Action, Target, Source System) in indigo with solid borders, and five **optional metadata fields** in amber with dashed borders.

**How to use:**

- **Hover** over any field to see a tooltip explaining its purpose and an example value
- **Toggle** between "Email Event" and "Chat Event" using the buttons to see how the same structure applies to different source systems

## Lesson Plan

**Learning Objective:** Students will describe the core fields of an event log entry and explain why each is necessary for organizational analytics.

**Bloom's Level:** Understand (L2)

**Activities:**

1. Have students hover over each required field and write a one-sentence explanation of why that field is essential
2. Toggle between Email and Chat examples — identify which fields change and which stay the same
3. Discuss: What would happen if the Timestamp field were missing? What about the Actor field?

**Assessment:** Ask students to design an event log entry for a new source system (e.g., a video conferencing platform) with all required and at least three optional fields.

## References

1. [Event Log - Wikipedia](https://en.wikipedia.org/wiki/Event_log) - Overview of event logging concepts and their role in system monitoring
2. [ISO 8601 - Wikipedia](https://en.wikipedia.org/wiki/ISO_8601) - The international standard for date and time representation used in timestamps
