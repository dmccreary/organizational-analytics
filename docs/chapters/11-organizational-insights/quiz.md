# Quiz: Organizational Insights

Test your understanding of how graph algorithms and NLP techniques extract actionable organizational insights with these review questions.

---

#### 1. In a composite influence score, betweenness centrality receives the highest weight (0.30) among the four centrality measures. Why is brokerage weighted most heavily?

<div class="upper-alpha" markdown>
1. Controlling information flow between groups is the strongest single predictor of organizational influence
2. Betweenness centrality is the easiest metric to compute accurately on large graphs
3. Betweenness centrality correlates most strongly with formal job title and seniority
4. Betweenness produces the largest raw numerical values among centrality measures
</div>

??? question "Show Answer"
    The correct answer is **A**. Brokerage — sitting on information flow paths between groups — is the strongest single predictor of organizational influence because it represents control over how information, ideas, and decisions move between otherwise disconnected parts of the organization. People in high-betweenness positions can filter, amplify, or redirect communication, giving them outsized impact regardless of formal authority.

    **Concept Tested:** Influence Detection

---

#### 2. How are informal leaders algorithmically distinguished from formal leaders in an organizational graph?

<div class="upper-alpha" markdown>
1. Informal leaders have higher degree centrality but lower PageRank than formal leaders
2. Informal leaders are detected by filtering for high PageRank combined with non-management job titles
3. Informal leaders appear only in unsupervised clustering results, not in centrality analyses
4. Informal leaders have the most cross-department communication edges
</div>

??? question "Show Answer"
    The correct answer is **B**. Informal leaders are identified through a combination of high network influence metrics (particularly PageRank and betweenness centrality) and low formal authority — filtering out employees whose titles contain "Director," "VP," "Manager," or "Chief." These individuals exert leadership influence without holding leadership titles, and the algorithm reveals them by contrasting network position against organizational hierarchy.

    **Concept Tested:** Informal Leaders

---

#### 3. You run a Cypher query comparing the shortest formal reporting path between an engineer and the CEO (7 hops) with the shortest communication path (3 hops). What does this discrepancy most likely indicate?

<div class="upper-alpha" markdown>
1. The formal reporting structure has too many management layers
2. The CEO is spending too much time communicating with individual contributors
3. The communication graph contains data quality errors in edge recording
4. Information is bypassing formal channels through efficient informal shortcuts
</div>

??? question "Show Answer"
    The correct answer is **D**. When the communication path is significantly shorter than the hierarchy path, it indicates that information bypasses formal channels through informal shortcuts. This is not necessarily problematic — it often means the organization has developed efficient workarounds. However, if certain hierarchy levels are consistently bypassed, it may signal communication bottlenecks or trust deficits at those levels that warrant investigation.

    **Concept Tested:** Information Flow Analysis

---

#### 4. A graph analysis reveals that removing a single moderate-degree employee would disconnect two large departments. What type of vulnerability does this represent?

<div class="upper-alpha" markdown>
1. Knowledge concentration risk
2. Turnover contagion exposure
3. A communication bottleneck at an articulation point
4. A fragmentation pattern requiring community detection
</div>

??? question "Show Answer"
    The correct answer is **C**. This employee is an articulation point (also called a cut vertex) — a node whose removal disconnects the graph. The chapter emphasizes that the most dangerous bottlenecks are not obvious high-degree hubs but moderate-degree nodes that sit on the only path between large groups. The mitigation is to build redundant cross-department connections through cross-training and adding team members to key communication channels.

    **Concept Tested:** Communication Bottlenecks

---

#### 5. A community detection analysis reveals an insularity score of 0.91 for the Data Science team, meaning 91% of their communication stays within the group. Under what condition should this be classified as a silo rather than a naturally cohesive team?

<div class="upper-alpha" markdown>
1. When the team has more than 20 members
2. When the team's average sentiment score is below the organizational average
3. When the team's internal communication density is high and its external communication density is unusually low relative to organizational norms
4. When the team's PageRank distribution is concentrated in one or two members
</div>

??? question "Show Answer"
    The correct answer is **C**. A community is not automatically a silo — teams should communicate heavily with each other since they share work. A silo forms when internal communication density is high *and* external communication density is unusually low compared to organizational norms. The distinction matters because some teams legitimately need high internal cohesion while still maintaining healthy external connections. Context and comparison against organizational baselines determine whether insularity is functional or problematic.

    **Concept Tested:** Silo Detection

---

#### 6. A Cypher query identifies three skills each held by only a single employee in the organization. According to the vulnerability analysis framework, what risk level does this represent and what is the recommended mitigation?

<div class="upper-alpha" markdown>
1. Medium risk; monitor through quarterly reviews
2. High risk; redistribute work assignments across departments
3. Critical risk; implement targeted knowledge transfer programs pairing holders with mentees
4. Low risk; document the skills in the knowledge management system
</div>

??? question "Show Answer"
    The correct answer is **C**. Skills held by a single person represent critical knowledge concentration risk — the organization is one resignation letter away from losing that capability entirely. The recommended mitigation is a targeted knowledge transfer program that pairs current holders with mentees and documents tacit knowledge. Skills held by two people are classified as high risk, and three or more holders reduce the risk to medium.

    **Concept Tested:** Knowledge Concentration

---

#### 7. An employee's flight risk composite score includes declining degree centrality, shrinking ego network, increasing external communication ratio, declining sentiment, and reduced meeting participation. Which of these signals carries the highest weight in the scoring model described in the chapter?

<div class="upper-alpha" markdown>
1. Decreasing degree centrality over time (0.30)
2. Shrinking ego network density (0.20)
3. Declining sentiment in communications (0.15)
4. Increasing external-to-internal communication ratio (0.20)
</div>

??? question "Show Answer"
    The correct answer is **A**. In the flight risk composite score presented in the chapter, decreasing degree centrality over time carries the highest weight at 0.30. This reflects that an employee communicating with fewer people over a 90-day window is the strongest individual graph-based signal of impending departure. The shrinking ego network and external communication ratio each carry 0.20, while sentiment and meeting decline rate each carry 0.15.

    **Concept Tested:** Flight Risk Detection

---

#### 8. What distinguishes disengagement signals from an employee's natural introversion when analyzing communication network patterns?

<div class="upper-alpha" markdown>
1. Introverts have lower PageRank scores while disengaged employees have lower betweenness scores
2. Disengagement is measured as deviation from an individual's own baseline, not comparison to organizational norms
3. Introverted employees never initiate new connections while disengaged employees stop responding to existing ones
4. Disengagement can only be confirmed through sentiment analysis, not through network metrics alone
</div>

??? question "Show Answer"
    The correct answer is **B**. The crucial distinction is change over time relative to the individual's own baseline. An employee who has always maintained a small, tight network is not disengaging — that is their natural communication style. Disengagement signals are detected when an employee's communication volume, connection count, or network position deviates significantly from their personal historical pattern. Comparing against individual baselines prevents false-flagging naturally introverted employees.

    **Concept Tested:** Disengagement Signals

---

#### 9. An employee's contagion exposure score is 0.25, meaning 25% of their communication network has departed in the past 90 days. According to the turnover contagion model, why is this employee at elevated risk?

<div class="upper-alpha" markdown>
1. They will be reassigned additional workload from departed colleagues, increasing burnout
2. Their day-to-day support network is evaporating, and departures propagate through communication networks
3. They are statistically more likely to have received a competing job offer from the same recruiter
4. Their performance rating will decline due to reduced collaboration capacity
</div>

??? question "Show Answer"
    The correct answer is **B**. Turnover contagion is the phenomenon where departures propagate through communication networks — they are not independent events. An employee with 25% of their network recently departed faces dual risk: the social influence of seeing colleagues leave (which normalizes departure as an option) and the practical erosion of their day-to-day support network. Research consistently shows that turnover clusters in networks, making close connections to recent departures a strong predictor of future departure.

    **Concept Tested:** Turnover Contagion

---

#### 10. In the retention priority matrix, an employee is classified as "WATCH - Proactive engagement." Which combination of flight risk and organizational impact scores produces this classification?

<div class="upper-alpha" markdown>
1. Flight risk above 0.6 and organizational impact above 0.6
2. Flight risk above 0.6 and organizational impact at or below 0.6
3. Flight risk at or below 0.6 and organizational impact at or below 0.6
4. Flight risk at or below 0.6 and organizational impact above 0.6
</div>

??? question "Show Answer"
    The correct answer is **D**. The "WATCH - Proactive engagement" category applies to employees with low current flight risk (at or below 0.6) but high organizational impact (above 0.6). These employees are not currently showing departure signals, but their network position, knowledge, and influence make them so valuable that the organization should proactively engage them to prevent them from ever entering the risk zone. The goal is prevention rather than reaction.

    **Concept Tested:** Retention Analytics

---
