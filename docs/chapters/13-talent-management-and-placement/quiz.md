# Quiz: Talent Management and Placement

Test your understanding of mentoring matching, skill gap analysis, placement optimization, career path analysis, onboarding effectiveness, merger integration, and reorganization impact with these review questions.

---

#### 1. In the mentoring matching query, the scoring formula weights skill similarity at 60% and shared project neighborhoods at 40%. What does the "growthSkills" list in the query output represent?

<div class="upper-alpha" markdown>
1. Skills that both the mentor and mentee need to learn together
2. Skills the mentor possesses that the mentee does not yet have
3. Skills required by the mentee's upcoming projects
4. Skills that have the highest demand across the organization
</div>

??? question "Show Answer"
    The correct answer is **B**. The growthSkills list identifies skills that the candidate mentor possesses but the mentee lacks. These represent what the mentor could teach the mentee and are central to the matching philosophy: the best mentoring relationships balance enough similarity for rapport with enough difference for growth. A mentor who is an exact clone of the mentee has nothing new to teach, so the growth skills list quantifies the learning opportunity each pairing offers.

    **Concept Tested:** Mentoring Matching

---

#### 2. In the mentor-mentee pairing score, the query awards a 20% bonus for cross-department matches. What is the primary reason for this design choice?

<div class="upper-alpha" markdown>
1. Cross-department mentors always have more available capacity
2. Within-department mentors create conflicts of interest with performance reviews
3. Cross-departmental mentoring expands the mentee's network beyond their immediate silo
4. Cross-department pairs generate more communication events for the graph
</div>

??? question "Show Answer"
    The correct answer is **C**. The cross-department bonus is deliberate because mentoring that crosses departmental boundaries gives the mentee access to a broader network. As the chapter explains, community detection analysis from Chapter 8 showed that cross-departmental connections are critical for long-term career development. The best mentors transfer not just knowledge but also network access. Aria reinforces this: experienced foragers introduce newcomers to ants along the entire trail.

    **Concept Tested:** Mentor-mentee Pairing

---

#### 3. A skill gap analysis reveals that a Cloud Migration team of 8 members has only 1 person with Kubernetes skills. According to the chapter, what type of risk does this represent?

<div class="upper-alpha" markdown>
1. A compliance risk requiring immediate regulatory reporting
2. A financial risk from overspending on cloud infrastructure
3. A skill-based single point of failure analogous to centrality bottlenecks
4. A training gap that requires a formal organizational training program
</div>

??? question "Show Answer"
    The correct answer is **C**. The chapter explicitly draws a parallel between competency gaps and the network concepts from Chapter 7. Having only one person with a critical skill creates a skill-based single point of failure: if that person goes on leave, gets reassigned, or leaves the company, the entire team's core project stalls. This is the same structural vulnerability concept as a communication bottleneck, applied to competencies rather than communication paths.

    **Concept Tested:** Skill Gap Analysis

---

#### 4. Training gap detection flags a skill when the gap percentage exceeds what threshold?

<div class="upper-alpha" markdown>
1. 30% of role holders lack the required skill
2. 50% of role holders lack the required skill
3. 70% of role holders lack the required skill
4. 90% of role holders lack the required skill
</div>

??? question "Show Answer"
    The correct answer is **B**. The training gap detection query uses a threshold of 50%, flagging skills where more than half the people in a role lack the required competency. The chapter further explains that when the gap count exceeds 20 and the gap percentage exceeds 70%, the finding warrants a formal training program rather than ad hoc individual development plans. The 50% threshold in the query is the initial filter for identifying systemic rather than individual deficiencies.

    **Concept Tested:** Training Gap Detection

---

#### 5. In the placement optimization query, why is existing connections to current project members weighted at 20% of the placement score?

<div class="upper-alpha" markdown>
1. Because people who already know team members reduce onboarding friction and accelerate their contribution
2. Because existing connections indicate higher seniority levels within the organization
3. Because project managers request that new team members already know their colleagues
4. Because the graph database processes connection queries faster than skill queries
</div>

??? question "Show Answer"
    The correct answer is **A**. The chapter states that the third factor in placement scoring -- existing connections to current project members -- "matters more than you might expect." Placing someone who already knows members of the project team reduces the time needed to integrate them and accelerates how quickly they can contribute meaningful work. This is a practical application of network proximity: prior relationships create trust and communication channels that do not need to be built from scratch.

    **Concept Tested:** Placement Optimization

---

#### 6. How does backlog task assignment differ from optimal task assignment in its optimization objective?

<div class="upper-alpha" markdown>
1. Backlog assignment prioritizes speed and skill coverage while optimal assignment prioritizes cost savings
2. Backlog assignment uses machine learning while optimal assignment uses only graph queries
3. Both approaches use identical optimization criteria applied to different task queues
4. Backlog assignment optimizes for employee development opportunities while optimal task assignment optimizes for speed and skill fit
</div>

??? question "Show Answer"
    The correct answer is **D**. The chapter draws a clear distinction between the two assignment approaches. Optimal task assignment handles urgent, high-priority tasks where skill fit and speed dominate the scoring. Backlog task assignment addresses lower-priority tasks waiting in the queue and deliberately optimizes for secondary objectives: employee development, cross-training, and workload leveling. The backlog query targets employees who can learn one or two new skills while completing the work, turning backlog clearance into a development engine.

    **Concept Tested:** Backlog Task Assignment

---

#### 7. In the career guidance query, what does a "Stretch" readiness level indicate about a recommended next role?

<div class="upper-alpha" markdown>
1. The employee is overqualified and the role would not challenge them
2. The employee has more than 80% of the required skills and is ready immediately
3. The employee should be automatically promoted into the role within 30 days
4. The employee has fewer than 50% of the required skills and would need significant development investment
</div>

??? question "Show Answer"
    The correct answer is **D**. The career guidance query classifies recommended roles into three readiness levels: "Ready" (skill readiness above 80%), "Developing" (50% to 80%), and "Stretch" (below 50%). A Stretch role represents an ambitious but achievable goal that requires significant development investment. The chapter frames these levels as tools for structuring conversations between employees and managers about career planning, with each level implying a different preparation timeline and upskilling strategy.

    **Concept Tested:** Career Guidance

---

#### 8. Healthy onboarding network growth shows a characteristic curve. Which pattern does the chapter describe as typical for well-integrated new hires?

<div class="upper-alpha" markdown>
1. Linear growth at a constant rate throughout the first 90 days
2. Rapid growth in weeks 1-4, steady expansion in weeks 5-8, and plateauing around weeks 9-12
3. Slow initial growth that accelerates exponentially after week 8
4. A flat period for the first 6 weeks followed by sudden network expansion
</div>

??? question "Show Answer"
    The correct answer is **B**. The chapter describes a characteristic onboarding curve: rapid network growth in weeks 1-4 as the new hire makes initial connections, steady expansion in weeks 5-8 as they deepen and broaden their network, and plateauing around weeks 9-12 as they settle into stable collaboration patterns. Employees whose network growth stalls early -- such as plateauing at 5 connections by week 3 -- are at risk of isolation and disengagement and should receive targeted intervention.

    **Concept Tested:** Onboarding Effectiveness

---

#### 9. Which of the following is a key metric used in integration monitoring to assess whether an onboarding system is working at the cohort level?

<div class="upper-alpha" markdown>
1. Time to Network Threshold -- average weeks until a new hire reaches 15 unique connections
2. Average salary increase of new hires within the first year
3. Number of training courses completed per new hire
4. Number of one-on-one meetings scheduled with the direct manager
</div>

??? question "Show Answer"
    The correct answer is **A**. The chapter lists four key integration monitoring metrics: Time to Network Threshold (average weeks until a new hire reaches 15 unique connections), Cross-Department Penetration (percentage connecting with 3+ departments within 90 days), Mentor Activation Rate (percentage of mentoring pairs showing actual communication), and Network Similarity Convergence (how quickly new hires resemble their team's network profile). These graph-based metrics track actual integration rather than process completion.

    **Concept Tested:** Integration Monitoring

---

#### 10. After a merger, cross-legacy communication must exceed what percentage to be classified as "Integrating well" in the chapter's merger integration query?

<div class="upper-alpha" markdown>
1. 10%
2. 15%
3. 20%
4. 30%
</div>

??? question "Show Answer"
    The correct answer is **D**. The merger integration query classifies integration status based on the percentage of communication edges that cross the legacy organization boundary. Above 30% is classified as "Integrating well," between 15% and 30% is "Progressing," and below 15% indicates "Silos persist." The chapter notes that in healthy mergers, cross-legacy communication starts near zero and climbs steadily over 12 to 18 months, with structural interventions needed if it stalls below 15% after six months.

    **Concept Tested:** Merger Integration
