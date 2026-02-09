# Quiz: Reporting and Dashboards

Test your understanding of reporting foundations, executive dashboards, dashboard design principles, data visualization, real-time discovery, pattern and anomaly detection, trend analysis, and alerting systems with these review questions.

---

#### 1. What is the cardinal principle of effective organizational analytics reporting?

<div class="upper-alpha" markdown>
1. Present data in the order it was discovered during analysis
2. Use the same report format for all audiences to maintain consistency
3. Match the depth and format of the report to the audience receiving it
4. Always include the full algorithmic detail so stakeholders can verify results
</div>

??? question "Show Answer"
    The correct answer is **C**. The chapter identifies audience-appropriate abstraction as the cardinal principle of reporting. Your data team needs raw centrality distributions, your VP of HR needs silo alerts and retention risk quadrants, and your CEO needs three numbers and a trend arrow. The same underlying graph produces entirely different presentations depending on who will consume the information. Presenting discovery order rather than audience-appropriate information is explicitly called out as the biggest reporting mistake.

    **Concept Tested:** Reporting

---

#### 2. In the operational report's team communication health query, what does an internal density below 0.15 indicate?

<div class="upper-alpha" markdown>
1. The team is communicating effectively with high collaboration rates
2. The team is communicating sparsely enough to raise concerns and should be reviewed
3. The team has too many external connections that dilute internal focus
4. The team's communication data has not been properly loaded into the graph
</div>

??? question "Show Answer"
    The correct answer is **B**. An internal density below 0.15 means fewer than 15% of possible within-team connections are active. The chapter's query classifies this as "LOW - Review collaboration," indicating the team is communicating so sparsely that it raises concerns about collaboration health. This threshold should be calibrated to organizational norms rather than adopted blindly, but it provides a useful baseline for flagging teams that may need intervention.

    **Concept Tested:** Operational Reports

---

#### 3. An executive dashboard presents KPIs following a consistent design pattern. What three elements does this pattern include for each KPI?

<div class="upper-alpha" markdown>
1. A single primary number, a visual indicator of acceptable range, and a trend showing direction of change
2. A detailed data table, a statistical significance test, and a recommendation paragraph
3. A pie chart breakdown, a year-over-year comparison, and a budget impact estimate
4. An algorithm name, a confidence interval, and a list of affected employees
</div>

??? question "Show Answer"
    The correct answer is **A**. The chapter specifies that each KPI on an executive dashboard follows the same design pattern: a single primary number (the metric value), a visual indicator of whether it is within an acceptable range (green, amber, or red), and a trend showing the direction of change (sparkline or arrow). Executives do not need algorithmic detail -- they need to quickly scan whether each organizational health indicator is within bounds and moving in the right direction.

    **Concept Tested:** Executive Dashboards

---

#### 4. Which dashboard design principle states that related metrics should be visually grouped using proximity and similarity rather than explicit lines and boxes?

<div class="upper-alpha" markdown>
1. Progressive disclosure
2. Tufte's data-ink ratio
3. Consistent visual encoding
4. Gestalt grouping
</div>

??? question "Show Answer"
    The correct answer is **D**. Gestalt grouping is the dashboard design principle that leverages the human visual system's automatic detection of spatial proximity and visual similarity. When related KPIs -- such as those about network health -- are placed close together and styled similarly, users perceive them as a group without needing explicit borders or dividing lines. The chapter notes that explicit borders add clutter, so spatial arrangement and visual similarity should do the grouping work.

    **Concept Tested:** Dashboard Design

---

#### 5. When visualizing centrality scores on a chart, the chapter warns about a specific pitfall related to chart baselines. What is the recommended solution?

<div class="upper-alpha" markdown>
1. Always start the y-axis at zero to maintain honest proportions
2. Show both a truncated axis for comparison with a clear baseline annotation, or use a percent-change visualization
3. Use logarithmic scales for all centrality metrics
4. Replace charts entirely with numeric tables for precise comparison
</div>

??? question "Show Answer"
    The correct answer is **B**. Centrality scores are often small decimals where the difference between 0.12 and 0.08 represents a meaningful 50% change. A y-axis starting at zero makes both bars look nearly identical, while a truncated axis starting at 0.07 makes the difference visually dramatic but potentially misleading. The chapter recommends showing both representations -- a truncated axis with a clear annotation of the baseline -- or using a percent-change visualization that makes the relative difference explicit without distortion.

    **Concept Tested:** Data Visualization

---

#### 6. In the real-time discovery architecture, community assignments are recommended to refresh at what interval?

<div class="upper-alpha" markdown>
1. Hourly
2. Daily
3. Weekly
4. Monthly
</div>

??? question "Show Answer"
    The correct answer is **C**. The chapter's tiered refresh rate table recommends weekly refresh for community assignments. The rationale is that community detection algorithms (like Louvain) are computationally expensive and community structure is inherently slow-moving -- it changes only with significant organizational shifts rather than daily interactions. By contrast, communication volume refreshes hourly, centrality and risk scores refresh daily, and network resilience also refreshes weekly.

    **Concept Tested:** Real-time Discovery

---

#### 7. A pattern detection scan identifies a central node connected to many peripheral nodes that have few connections to each other. What organizational pattern does this represent?

<div class="upper-alpha" markdown>
1. The Star Pattern, indicating a hub-and-spoke management style
2. The Hourglass Pattern, indicating a communication bottleneck between clusters
3. The Clique Decay Pattern, indicating team fragmentation over time
4. The Isolation Drift Pattern, indicating an employee moving toward the network periphery
</div>

??? question "Show Answer"
    The correct answer is **A**. The Star Pattern describes a central node (typically a manager) connected to many peripheral nodes (team members) who have few connections among themselves. This signals a hub-and-spoke management style where the manager serves as the only connection point between team members. It is detected by finding nodes with high degree centrality whose neighbors have low degree centrality. The Hourglass Pattern, by contrast, involves two large clusters connected through a single bridge node.

    **Concept Tested:** Pattern Detection

---

#### 8. The chapter describes three levels at which anomaly detection operates in organizational analytics. Which of the following is an example of a graph-level anomaly?

<div class="upper-alpha" markdown>
1. An individual employee whose communication volume drops by 60% in a single week
2. Two departments whose cross-team interactions suddenly drop from 50 to 5 per week
3. A sudden increase in the number of connected components or a rapid change in average path length
4. A single manager whose sentiment score plunges from 0.7 to 0.2
</div>

??? question "Show Answer"
    The correct answer is **C**. The chapter distinguishes three anomaly levels: node-level (individual employee metric outliers like communication volume drops), edge-level (sudden changes in relationships between entities like departments), and graph-level (structural changes to overall network topology). A sudden increase in connected components, a significant shift in average path length, or a rapid change in modularity are graph-level anomalies. These are rare but high-impact, usually corresponding to major organizational events like restructurings, layoffs, or mergers.

    **Concept Tested:** Anomaly Detection

---

#### 9. According to the chapter, which combination of concurrent metric trends signals a potential "burnout wave" in the organization?

<div class="upper-alpha" markdown>
1. Declining collaboration combined with rising silo insularity
2. Declining cross-community idea flow combined with shrinking bridge builders
3. Volatile metrics stabilizing combined with new connections forming
4. Rising communication volume combined with declining sentiment
</div>

??? question "Show Answer"
    The correct answer is **D**. The chapter's trend signal table identifies a burnout wave as the compound pattern of rising communication volume with declining sentiment -- people are communicating more but with decreasing satisfaction, indicating overwork without fulfillment. This is displayed as a red sparkline with a caution icon on the dashboard. By contrast, declining collaboration with rising insularity signals silent fragmentation, and declining idea flow with shrinking bridges signals innovation cooling.

    **Concept Tested:** Trend Analysis

---

#### 10. In an effective alerting system, what is the purpose of the feedback loop component?

<div class="upper-alpha" markdown>
1. To automatically fix the organizational problems that triggered the alert
2. To track whether stakeholders took action and whether the metric subsequently changed, enabling threshold refinement
3. To route alerts to additional stakeholders if the first recipient does not respond
4. To generate weekly summary reports of all alerts fired during the period
</div>

??? question "Show Answer"
    The correct answer is **B**. The feedback loop is described as the most overlooked component of an alerting system. It tracks whether stakeholders took action in response to an alert and whether the metric subsequently changed. Over time, this feedback enables the system to learn which alerts drive action (and should be kept) and which get ignored (and should be refined or removed). This transforms the alerting system from a static notification mechanism into an adaptive intelligence that continuously improves its relevance and effectiveness.

    **Concept Tested:** Alerting Systems
