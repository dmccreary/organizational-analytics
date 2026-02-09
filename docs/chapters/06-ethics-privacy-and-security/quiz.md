# Quiz: Ethics, Privacy, and Security

Test your understanding of ethical frameworks, privacy protections, and security measures for responsible organizational analytics with these review questions.

---

#### 1. What is the central ethical principle of organizational analytics as presented in this chapter?

<div class="upper-alpha" markdown>
1. Analytics should help people, not surveil them, pursuing aggregate insights over individual monitoring
2. Analytics should maximize return on investment for the organization above all other considerations
3. Analytics should only be conducted after receiving written consent from every individual employee
4. Analytics results should be shared publicly to ensure full transparency with external stakeholders
</div>

??? question "Show Answer"
    The correct answer is **A**. The chapter establishes that organizational analytics should help people, not surveil them. The focus should be on aggregate insights that improve organizational health (reducing burnout, improving collaboration, eliminating bottlenecks) rather than individual monitoring. The same centrality algorithm that reveals a hidden organizational hero can also build a digital panopticon. The ethical distinction lies not in the technology but in the intent and safeguards applied.

    **Concept Tested:** Ethics of Privacy

---

#### 2. Which of the following is NOT a required component of meaningful data consent in organizational analytics?

<div class="upper-alpha" markdown>
1. Notice about what data is collected in plain language
2. A guarantee that analytics will always produce positive findings about teams
3. Purpose specification explaining why data is being analyzed
4. Recourse mechanisms for employees who want to raise concerns
</div>

??? question "Show Answer"
    The correct answer is **B**. Meaningful data consent requires notice (what data is collected), purpose specification (why it is analyzed), scope limitation (what will and will not be examined), access disclosure (who sees results), and recourse (what happens if an employee objects). Guaranteeing positive findings is not a component of consent and would undermine the integrity of the analytics program. Consent is about transparency and respect, not about controlling outcomes.

    **Concept Tested:** Data Consent

---

#### 3. Under GDPR, what happens to data that has been pseudonymized?

<div class="upper-alpha" markdown>
1. It is no longer considered personal data and falls outside GDPR scope entirely
2. It must be deleted within 30 days of pseudonymization
3. It is still considered personal data but qualifies for relaxed processing requirements
4. It can be freely shared with third parties without any restrictions
</div>

??? question "Show Answer"
    The correct answer is **C**. Pseudonymized data remains personal data under GDPR because re-identification is possible through the secured mapping key. However, pseudonymization qualifies for relaxed processing requirements compared to fully identifiable data. This is a critical distinction from anonymization, which irreversibly removes identity and places data outside GDPR scope. Pseudonymization is often the pragmatic choice for organizational analytics because it protects individuals in daily analysis while preserving the ability to link insights back to real people when a legitimate need arises.

    **Concept Tested:** Pseudonymization

---

#### 4. Why is anonymizing graph data more challenging than anonymizing tabular data?

<div class="upper-alpha" markdown>
1. Graph databases do not support data deletion operations
2. Anonymization software is not available for graph database platforms
3. Graph data contains more rows than relational databases
4. Network topology and connection patterns can re-identify individuals even without name labels
</div>

??? question "Show Answer"
    The correct answer is **D**. Graph data faces a unique challenge called structural re-identification. Even if you strip every name and attribute from the graph, the topology -- the pattern of connections -- can reveal who someone is. For example, if only one node has 200 outgoing edges and a direct link to the CEO node, the identity is obvious without any label. Mitigation strategies include edge perturbation, k-anonymity for graphs, and aggregation to department-level representations.

    **Concept Tested:** Anonymization

---

#### 5. A company is designing its organizational analytics system. At which stage should privacy protections be incorporated?

<div class="upper-alpha" markdown>
1. Only after a data breach has occurred and remediation is required
2. During the final reporting phase when dashboards are built
3. From the very beginning, embedded into the architecture at every layer
4. Only when the legal department requests a compliance review
</div>

??? question "Show Answer"
    The correct answer is **C**. Privacy by design, formalized by Ann Cavoukian and codified in GDPR Article 25, requires that privacy protections be embedded into the architecture from the beginning, not bolted on as an afterthought. This means making deliberate decisions at the data collection layer (collect metadata, not content), the storage layer (encrypt, separate identity vault), the analysis layer (default to aggregates, log queries), and the reporting layer (suppress small cell counts, include provenance). Waiting until a breach or a compliance review is reactive rather than proactive.

    **Concept Tested:** Privacy by Design

---

#### 6. An analyst needs to determine which ethical framework would emphasize respecting employee rights regardless of the potential benefits of the analysis. Which framework applies?

<div class="upper-alpha" markdown>
1. Utilitarian ethics
2. Virtue ethics
3. Deontological ethics
4. Consequentialist ethics
</div>

??? question "Show Answer"
    The correct answer is **C**. Deontological ethics asks whether an analysis respects the fundamental rights of the people involved, regardless of the outcome. Under this framework, certain practices are wrong even if they produce good outcomes. Monitoring individual employees without their knowledge violates their dignity and autonomy, even if the monitoring leads to useful insights. Utilitarian ethics focuses on whether benefits outweigh harms, and virtue ethics focuses on what a responsible analyst would do. Deontological thinking underpins data protection regulations like GDPR.

    **Concept Tested:** Ethical Frameworks

---

#### 7. In a role-based access control matrix for organizational analytics, which role should have the ability to resolve pseudonyms to real identities?

<div class="upper-alpha" markdown>
1. Department Manager
2. Privacy Officer
3. Data Engineer
4. Executive
</div>

??? question "Show Answer"
    The correct answer is **B**. In a well-designed RBAC matrix, only the Privacy Officer should have the ability to re-identify pseudonyms, and all such actions should be fully audited. This enforces the principle of separation of duties: the analyst who runs queries should not hold the re-identification key. Department Managers see only their department's aggregate metrics. Data Engineers maintain infrastructure but should not see data content. Executives view aggregate dashboards without individual-level access.

    **Concept Tested:** Role-based Access Control

---

#### 8. What does the principle of data minimization require in organizational analytics?

<div class="upper-alpha" markdown>
1. Collecting and retaining only the data necessary for the stated analytical purpose
2. Storing all available data indefinitely in case future analyses require it
3. Minimizing the number of analysts who can access the graph database
4. Reducing the total number of nodes in the graph to improve query performance
</div>

??? question "Show Answer"
    The correct answer is **A**. Data minimization, a core requirement of GDPR Article 5(1)(c), means collecting and retaining only the data necessary for the stated purpose. In practice, this means collecting metadata rather than content, aggregating where possible, stripping unnecessary attributes, and using sampling when full datasets are not required. Storing everything indefinitely creates growing liability. Data minimization is not about limiting analyst access (that is RBAC) or reducing node counts for performance reasons.

    **Concept Tested:** Data Minimization

---

#### 9. Which type of encryption protects data as it moves between the HRIS system and the graph database?

<div class="upper-alpha" markdown>
1. Encryption at rest
2. Field-level encryption
3. Key management encryption
4. Encryption in transit
</div>

??? question "Show Answer"
    The correct answer is **D**. Encryption in transit protects data as it moves between systems, using Transport Layer Security (TLS) as the standard protocol. This covers data flowing from the HRIS to the data pipeline, from the pipeline to the graph database, and from the database to the analyst's dashboard. Encryption at rest protects stored data on disk. Field-level encryption protects specific sensitive attributes within the database. Key management is the practice of securely storing encryption keys, not a type of encryption itself.

    **Concept Tested:** Data Encryption

---

#### 10. What is the primary purpose of maintaining audit trails in an organizational analytics system?

<div class="upper-alpha" markdown>
1. To improve the speed of Cypher queries against the graph database
2. To provide a chronological record of who accessed what data, when, and what they did with it
3. To automatically anonymize employee data after a specified retention period
4. To generate weekly reports summarizing organizational communication patterns
</div>

??? question "Show Answer"
    The correct answer is **B**. Audit trails create a chronological record of all interactions with the organizational graph, including authentication events, query execution, data access, re-identification events, export events, and configuration changes. They serve three purposes: accountability (who did what), compliance (meeting regulatory requirements), and forensics (investigating incidents). Audit trail data should itself be protected in an append-only log. Audit trails do not affect query performance, perform anonymization, or generate analytical reports.

    **Concept Tested:** Audit Trails

---
