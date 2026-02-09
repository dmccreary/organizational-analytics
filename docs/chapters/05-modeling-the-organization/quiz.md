# Quiz: Modeling the Organization

Test your understanding of graph data modeling for employees, organizations, hierarchies, communications, positions, projects, and activities with these review questions.

---

#### 1. Which of the following is the most important characteristic of a good employee identifier in a graph database?

<div class="upper-alpha" markdown>
1. It is immutable, unique, and non-semantic so it never changes over time
2. It encodes the employee's department and location for easy lookup
3. It uses the employee's full legal name to ensure human readability
4. It matches the employee's corporate email address for consistency
</div>

??? question "Show Answer"
    The correct answer is **A**. A good employee identifier must be immutable (never changes), unique (no two employees share it), and non-semantic (does not encode department, location, or role information that might change). Using names, emails, or department-based codes creates fragile identifiers that break when employees change roles, get married, or transfer departments. A stable system-generated ID like `EMP-10042` or a UUID satisfies all three requirements.

    **Concept Tested:** Employee Identifier

---

#### 2. When should an employee attribute be modeled as a separate node with a dated relationship rather than as a property on the Employee node?

<div class="upper-alpha" markdown>
1. When the attribute is a string data type rather than a numeric data type
2. When the attribute is required for Cypher queries
3. When the attribute is shared by fewer than ten employees
4. When you need to track the history of that attribute's changes over time
</div>

??? question "Show Answer"
    The correct answer is **D**. The key modeling decision for employee attributes is whether you need only the current value (store as a property) or the full history of changes (model as a separate node with dated relationships). For example, an employee's current title can be a property, but their title history is better captured through a chain of `:HOLDS_POSITION` relationships to `:Position` nodes with start and end dates. The data type or number of employees sharing the attribute is not relevant to this decision.

    **Concept Tested:** Employee Attributes

---

#### 3. In the organizational graph model, which edge type connects a Department node to a Division node to represent the structural hierarchy?

<div class="upper-alpha" markdown>
1. `:REPORTS_TO`
2. `:WORKS_IN`
3. `:PART_OF`
4. `:HEADED_BY`
</div>

??? question "Show Answer"
    The correct answer is **C**. The `:PART_OF` edge connects structural units to their parent containers in the organizational hierarchy. Departments connect to Divisions via `:PART_OF`, and Divisions connect to the Organization via `:PART_OF`. The `:REPORTS_TO` edge connects employees to their managers (people, not structural units). `:WORKS_IN` connects employees to departments, and `:HEADED_BY` connects a department to the employee who leads it.

    **Concept Tested:** Organizational Hierarchy

---

#### 4. A company uses both solid-line and dotted-line reporting in a matrix organization. How does the graph model distinguish between these reporting types?

<div class="upper-alpha" markdown>
1. By creating separate node types called `:SolidManager` and `:DottedManager`
2. By using a `type` property on the `:REPORTS_TO` edge with values like `'solid'` or `'dotted'`
3. By storing all reporting information in a relational junction table outside the graph
4. By creating two entirely separate graphs, one for each reporting type
</div>

??? question "Show Answer"
    The correct answer is **B**. Graph databases handle matrix reporting elegantly by using a `type` property on the `:REPORTS_TO` edge. An employee can have multiple `:REPORTS_TO` edges, each with different type values such as `'solid'`, `'dotted'`, `'temporary'`, or `'mentor'`. This avoids the complexity of junction tables in relational databases and keeps all reporting relationships queryable through the same edge type with property-based filtering.

    **Concept Tested:** Reporting Lines

---

#### 5. What is the primary trade-off between aggregate communication edges and event-level communication edges in the graph model?

<div class="upper-alpha" markdown>
1. Aggregate edges support temporal analysis while event-level edges do not
2. Event-level edges preserve time-series resolution but create a larger graph than aggregate edges
3. Aggregate edges require more storage space than event-level edges
4. Event-level edges cannot capture communication channel information
</div>

??? question "Show Answer"
    The correct answer is **B**. Event-level edges preserve temporal resolution, allowing you to analyze how communication patterns change over time, but they create far more edges in the graph. Aggregate edges consolidate multiple communications into a single edge with properties like `message_count` and `frequency`, making queries faster and the graph smaller. However, aggregate edges sacrifice the ability to perform time-series analysis. Many production systems use both approaches: event-level for recent data and aggregates for historical periods.

    **Concept Tested:** Communication Frequency

---

#### 6. An analyst wants to determine what percentage of an employee's time is allocated to each project. Which property on the `:WORKS_ON` edge captures this information?

<div class="upper-alpha" markdown>
1. The `allocation` property
2. The `role` property
3. The `priority` property
4. The `estimated_hours` property
</div>

??? question "Show Answer"
    The correct answer is **A**. The `allocation` property on the `:WORKS_ON` edge is a decimal between 0 and 1 that represents the percentage of an employee's time dedicated to a project. When you sum allocations across all projects for an employee, you can detect over-allocation (total exceeding 1.0), which is a common precursor to burnout. The `priority` property belongs on the Project node, `role` describes the employee's function on the project, and `estimated_hours` is a Task-level property.

    **Concept Tested:** Task Assignments

---

#### 7. Why are positions modeled as separate nodes rather than stored as properties on the Employee node?

<div class="upper-alpha" markdown>
1. Because graph databases cannot store string values as properties on nodes
2. Because storing positions as properties would violate database normalization rules that apply to all graph databases
3. Because positions have their own identity and lifecycle, and modeling them as nodes enables career path tracking across multiple employees
4. Because Neo4j requires a minimum of ten node types in any graph schema
</div>

??? question "Show Answer"
    The correct answer is **C**. Positions are modeled as separate `:Position` nodes because they represent entities with their own identity (title, level, salary band) and lifecycle. Multiple employees may hold the same position over time, and one employee may progress through multiple positions. Connecting employees to positions via `:HOLDS_POSITION` edges with temporal properties (start_date, end_date) enables career path analysis, succession planning, and organizational role mapping that would be impossible with simple node properties.

    **Concept Tested:** Modeling Positions

---

#### 8. Which of the following best describes the purpose of modeling onboarding as a graph?

<div class="upper-alpha" markdown>
1. To replace the HR department's existing onboarding checklist system
2. To ensure every new hire receives identical onboarding experiences
3. To generate automated performance reviews during the probationary period
4. To capture both the onboarding process steps and the relationships they create, such as mentor assignments
</div>

??? question "Show Answer"
    The correct answer is **D**. Modeling onboarding as a graph captures not only the sequence of steps (HR Paperwork, Equipment Setup, Mentor Assignment) through `:OnboardingProcess` and `:OnboardingStep` nodes, but also the new relationships created during onboarding, such as `:MENTORED_BY` edges. This enables analytical questions like how long onboarding takes on average, which steps are bottlenecks, and whether mentored new hires are retained longer. The graph model captures the relational richness of onboarding, not just the checklist.

    **Concept Tested:** Onboarding Data Model

---

#### 9. A graph query traverses Employee, Project, Department, Communication, and License nodes in a single Cypher statement. What advantage does this demonstrate over a relational SQL approach?

<div class="upper-alpha" markdown>
1. Graph databases execute queries faster than relational databases regardless of the query type
2. Cypher reads like natural language when expressing multi-entity relationship traversals, avoiding the complexity of multiple SQL JOINs
3. Cypher automatically encrypts sensitive employee data during query execution
4. Graph databases store more data per node than relational databases store per row
</div>

??? question "Show Answer"
    The correct answer is **B**. The sample query in this chapter traverses five node types and four edge types in a single readable Cypher statement. The equivalent SQL query would require at least four JOINs across five tables, subqueries for cross-department filtering, and significant cognitive overhead. Cypher's pattern-matching syntax naturally expresses relationship traversals, making complex organizational queries more readable and maintainable. This is not about encryption, storage density, or universal speed advantages.

    **Concept Tested:** Modeling Communication

---

#### 10. Which best practice helps prevent duplicate nodes when loading data into an organizational graph?

<div class="upper-alpha" markdown>
1. Manually reviewing each node before insertion
2. Limiting the graph to fewer than 1,000 nodes total
3. Using only numeric data types for all properties
4. Creating unique constraints on identifier properties for each node type
</div>

??? question "Show Answer"
    The correct answer is **D**. Creating unique constraints on identifier properties (such as `employee_id`, `dept_id`, `project_id`) ensures that the database rejects duplicate insertions automatically. This is a core best practice: every node type should have a unique constraint on its ID property, making lookups fast and preventing duplicates. Manual review does not scale, limiting node counts is impractical, and data types have no bearing on duplicate prevention.

    **Concept Tested:** Organization Attributes

---
