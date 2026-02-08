---
title: Modeling the Organization
description: Building the graph data model for employees, organizations, hierarchies, communications, positions, projects, and activities
generated_by: claude skill chapter-content-generator
date: 2026-02-07 16:45:00
version: 0.04
---

# Modeling the Organization

## Summary

This chapter builds the graph data model for the organizational domain. Students learn how to represent employees, organizations, departments, hierarchies, communication patterns, positions, projects, and task assignments as nodes and edges in a graph. The chapter covers modeling communication channels and frequency, onboarding data, license tracking, and activity types.

## Concepts Covered

This chapter covers the following 19 concepts from the learning graph:

1. Modeling Employees
2. Employee Attributes
3. Employee Identifier
4. Modeling Organizations
5. Organization Attributes
6. Organizational Hierarchy
7. Department Structure
8. Reporting Lines
9. Modeling Communication
10. Communication Channels
11. Communication Frequency
12. Communication Volume
13. Modeling Positions
14. Roles and Titles
15. Modeling Projects
16. Task Assignments
17. Onboarding Data Model
18. License Tracking
19. Activity Types

## Prerequisites

This chapter builds on concepts from:

- [Chapter 2: Graph Database Fundamentals](../02-graph-database-fundamentals/index.md)
- [Chapter 3: Employee Event Streams](../03-employee-event-streams/index.md)

---

## The Blueprint Phase

![Aria the Analytics Ant](../../img/aria.png){ width="100", align="right" }

> "Gorgeous data deserves a gorgeous model. We've loaded our data, we've built our pipelines — now it's time to design the graph that brings the whole organization to life. My antennae are tingling — this is my favorite chapter."
> — Aria

In the previous chapters, you learned what graph databases are, how employee event streams generate raw data, and how pipelines move that data into your graph. Now comes the moment that separates a pile of data from an analytical powerhouse: the **data model**.

Think of this chapter as the architectural blueprint for your organizational graph. Just as an architect decides where walls, doors, and corridors go before construction begins, you'll decide what becomes a node, what becomes an edge, and which properties each element carries. Get the model right, and every query you write in later chapters will feel natural and expressive. Get it wrong, and you'll be fighting your own schema for the rest of the project.

In my colony, we had 500,000 ants and millions of tunnels. But the map that changed everything wasn't the one that listed every ant and every tunnel — it was the one that captured the *relationships*: which chambers connected to which, what each passage carried, who traveled where and when. That's what we're building here. Not a list, but a living model.

This chapter covers 19 concepts — more than any other chapter in the course. Don't let that intimidate you. Each concept builds naturally on the last, and by the end, you'll have a comprehensive schema that models an entire organization. Six legs, one insight at a time.

## Modeling Employees: The Fundamental Node

Every organizational graph starts with the same question: how do you represent a person? In graph database terms, an employee is a **node** — the most fundamental entity in your model. The `:Employee` label identifies these nodes as people within the organization.

**Modeling employees** means deciding what information lives *on* the node as properties and what information belongs in separate nodes connected by edges. This decision shapes every query you'll write.

### Employee Identifiers

Before assigning any other property, you need a reliable **employee identifier** — a unique value that distinguishes one employee from every other. This is more consequential than it sounds. Names aren't unique (your company might have three "James Johnsons"). Email addresses change when people get married or promoted. Departments and titles shift constantly.

The best practice is to assign or adopt a **stable, system-generated identifier** — typically an alphanumeric employee ID like `EMP-10042` or a UUID. This identifier should be:

- **Immutable** — it never changes for the lifetime of the employee record
- **Unique** — no two employees share it, even across mergers and acquisitions
- **Non-semantic** — it doesn't encode department, location, or role information that might change

In Cypher, creating an employee node with an identifier looks like this:

```cypher
CREATE (e:Employee {
  employee_id: 'EMP-10042',
  first_name: 'Maria',
  last_name: 'Chen',
  email: 'maria.chen@acme.com',
  hire_date: date('2021-03-15'),
  status: 'active'
})
```

### Employee Attributes

With the identifier in place, you attach **employee attributes** — the properties that describe who this person is and where they fit in the organization. These attributes divide into two categories:

| Category | Examples | Change Frequency |
|---|---|---|
| **Stable attributes** | employee_id, first_name, last_name, date_of_birth, hire_date | Rarely or never |
| **Dynamic attributes** | email, title, department, location, status, salary_band | Changes with career events |

A critical modeling decision is which dynamic attributes belong on the Employee node itself versus which should be modeled as separate nodes with dated relationships. For instance, an employee's *current* title can live as a property on the node, but their *title history* is better captured through a chain of `:HELD_POSITION` relationships to `:Position` nodes (we'll model those later in this chapter).

!!! tip "Aria's Insight"
    Here's a rule of thumb for what goes on the node: if you only ever need the *current* value, make it a property. If you need the *history* of that value, make it a separate node with a dated relationship. In my colony, every ant's current chamber assignment was a simple label. But to track which ants had *moved* between chambers — and when — I needed edges with timestamps. Same principle, different species.

Here's a more complete employee node with common attributes:

```cypher
CREATE (e:Employee {
  employee_id: 'EMP-10042',
  first_name: 'Maria',
  last_name: 'Chen',
  email: 'maria.chen@acme.com',
  hire_date: date('2021-03-15'),
  status: 'active',
  location: 'Seattle',
  cost_center: 'CC-1200',
  employment_type: 'full-time'
})
```

## Modeling Organizations and Departments

Employees don't exist in isolation — they belong to structures. **Modeling organizations** means creating the container nodes that represent companies, divisions, business units, and departments. In a graph, each of these is a node, and their relationships to each other form the organizational tree.

### Organization Attributes

An `:Organization` node represents the top-level entity — the company or institution itself:

```cypher
CREATE (org:Organization {
  org_id: 'ORG-001',
  name: 'Acme Corporation',
  industry: 'Technology',
  founded: date('1998-06-01'),
  headquarters: 'San Francisco',
  employee_count: 4500
})
```

**Organization attributes** capture the identity and characteristics of the enterprise: its name, industry classification, geographic headquarters, founding date, and workforce size. For multi-company analytics (mergers, subsidiaries, joint ventures), each entity gets its own `:Organization` node, connected by relationship edges like `:SUBSIDIARY_OF` or `:PARENT_OF`.

### Department Structure

Beneath the organization sits the **department structure** — the formal grouping of people into functional units. Departments are modeled as `:Department` nodes:

```cypher
CREATE (eng:Department {
  dept_id: 'DEPT-ENG',
  name: 'Engineering',
  budget: 2400000,
  headcount: 85,
  created_date: date('1998-06-01')
})

CREATE (prod:Department {
  dept_id: 'DEPT-PROD',
  name: 'Product',
  budget: 1200000,
  headcount: 32,
  created_date: date('2005-01-15')
})
```

Departments connect to the organization via a `:PART_OF` relationship, and employees connect to departments via `:WORKS_IN`:

```cypher
MATCH (eng:Department {dept_id: 'DEPT-ENG'}),
      (org:Organization {org_id: 'ORG-001'})
CREATE (eng)-[:PART_OF]->(org)
```

```cypher
MATCH (maria:Employee {employee_id: 'EMP-10042'}),
      (eng:Department {dept_id: 'DEPT-ENG'})
CREATE (maria)-[:WORKS_IN {since: date('2021-03-15')}]->(eng)
```

In an ant colony, different castes occupy different chambers — fungus farmers in the garden chambers, soldiers near the entrance tunnels, foragers along the surface routes. The chamber structure *is* the department structure. And just like in human organizations, the real story isn't just who belongs where, but how those chambers connect. That's where hierarchy and reporting lines come in.

### Organizational Hierarchy

The **organizational hierarchy** captures the vertical structure — how departments nest within divisions, divisions within business units, and business units within the enterprise. In a graph, this becomes a tree of `:REPORTS_UP_TO` or `:PART_OF` edges:

```cypher
// Departments within divisions
CREATE (eng)-[:PART_OF]->(techDiv:Division {name: 'Technology'})
CREATE (data)-[:PART_OF]->(techDiv)
CREATE (prod)-[:PART_OF]->(prodDiv:Division {name: 'Product & Design'})
CREATE (design)-[:PART_OF]->(prodDiv)

// Divisions within the organization
CREATE (techDiv)-[:PART_OF]->(org)
CREATE (prodDiv)-[:PART_OF]->(org)
```

This tree structure enables powerful queries. Want every department under a division? Traverse down. Want the path from a front-line team to the CEO's office? Traverse up. Want to compare hierarchy depth across business units? Count the edges.

#### Diagram: Organizational Hierarchy Graph

<iframe src="../../sims/org-hierarchy-graph/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Organizational Hierarchy Graph</summary>
Type: graph-model

Bloom Taxonomy: Understand (L2)
Bloom Verb: illustrate
Learning Objective: Students will illustrate how organizational hierarchy is represented as a tree of nodes and PART_OF edges in a graph database.

Purpose: Visualize a three-level organizational hierarchy showing Organization, Division, and Department nodes connected by PART_OF relationships.

Node types:
1. Organization (large rounded rectangle, indigo #303F9F) — "Acme Corporation"
2. Division (medium rounded rectangle, indigo-light #5C6BC0) — "Technology", "Product & Design", "Operations"
3. Department (small rounded rectangle, amber #D4880F) — "Engineering", "Data Science", "Product", "Design", "HR", "Finance"

Edge types:
1. PART_OF (solid arrow, dark gray) — directed from child to parent

Layout: Top-down tree. Organization at top, Divisions in middle row, Departments at bottom row. Edges flow upward (child PART_OF parent).

Interactive features:
- Hover a node to highlight all ancestors (path to root) in amber
- Click a node to highlight all descendants in gold
- Tooltip shows node properties

Visual style: Clean tree layout with Aria color scheme. Rounded corners on all nodes. Subtle shadow on nodes.

Responsive design: Scale tree to fit container width. On narrow screens, allow horizontal scrolling.

Implementation: vis-network with hierarchical layout (direction: "UD")
</details>

### Reporting Lines

While organizational hierarchy captures the structure of *units*, **reporting lines** capture the structure of *people*. The `:REPORTS_TO` edge connects an employee to their direct manager:

```cypher
MATCH (maria:Employee {employee_id: 'EMP-10042'}),
      (james:Employee {employee_id: 'EMP-10005'})
CREATE (maria)-[:REPORTS_TO {since: date('2021-03-15')}]->(james)
```

Reporting lines create a separate tree that overlays the department structure. An employee `:WORKS_IN` a department, but they `:REPORTS_TO` a specific person — and that person might not even be in the same department. Matrix organizations, dotted-line reporting, and cross-functional teams all create reporting structures that diverge from the neat department tree.

This is exactly why graph databases shine. In a relational database, modeling dotted-line reporting alongside solid-line reporting requires extra junction tables and convoluted queries. In a graph, you simply add different edge types:

```cypher
// Solid-line reporting
CREATE (maria)-[:REPORTS_TO {type: 'solid', since: date('2021-03-15')}]->(james)

// Dotted-line reporting for a cross-functional project
CREATE (maria)-[:REPORTS_TO {type: 'dotted', since: date('2024-01-10'),
        context: 'AI Initiative'}]->(vp_product)
```

| Reporting Type | Edge Property | Use Case |
|---|---|---|
| Solid-line | `type: 'solid'` | Primary manager for performance reviews |
| Dotted-line | `type: 'dotted'` | Secondary reporting for projects or matrix structures |
| Temporary | `type: 'temporary'` | Acting manager during leave or transitions |
| Mentorship | `type: 'mentor'` | Formal mentoring relationship (not managerial) |

## Modeling Communication

If the org chart tells you how the organization is *designed*, communication data tells you how it *actually operates*. **Modeling communication** is where organizational analytics gets its deepest insights — and where your graph model needs its most careful design.

### Communication as Edges

Every communication event — an email sent, a chat message, a meeting attended — becomes an edge in the graph. The fundamental pattern is:

```cypher
CREATE (sender)-[:COMMUNICATED_WITH {
  channel: 'email',
  timestamp: datetime('2025-09-15T14:30:00'),
  direction: 'outbound',
  thread_id: 'THR-88421'
}]->(recipient)
```

But real organizational communication involves several dimensions that the model must capture.

### Communication Channels

**Communication channels** are the medium through which people interact. Each channel has different characteristics that affect how you interpret the data:

| Channel | Data Source | What It Reveals |
|---|---|---|
| Email | Mail server metadata | Formal communication, decision trails, external contacts |
| Chat/IM (Slack, Teams) | Messaging platform API | Informal collaboration, quick questions, team cohesion |
| Meetings (Calendar) | Calendar system | Scheduled collaboration, decision-making groups |
| Video calls | Conference platform logs | Remote collaboration patterns |
| Document co-editing | Collaboration platform | Deep work partnerships, knowledge sharing |
| Code reviews | Version control system | Technical mentorship, quality assurance relationships |

Modeling channels as a property on the `:COMMUNICATED_WITH` edge lets you filter and analyze communication patterns by medium. An employee who communicates heavily via email but rarely via chat may have a very different collaboration style from one who lives in Slack channels.

In my colony, we had our own "channels" — pheromone trails for routine logistics, antenna-to-antenna contact for urgent alerts, and vibrational signals for colony-wide emergencies. Different channels for different purposes. Your organization works the same way — and your model should capture that distinction.

### Communication Frequency and Volume

**Communication frequency** measures how often two people communicate over a period — daily, weekly, monthly. **Communication volume** measures the total count of interactions. Both can be modeled as edge properties, but the approach depends on your analytical needs.

For **aggregate analysis** (who are the most frequent communicators?), create a single edge between two people and update frequency and volume properties as new events arrive:

```cypher
MATCH (a:Employee {employee_id: 'EMP-10042'}),
      (b:Employee {employee_id: 'EMP-10099'})
MERGE (a)-[c:COMMUNICATES_WITH]->(b)
ON CREATE SET c.channel = 'email',
              c.first_contact = date('2023-01-10'),
              c.message_count = 1,
              c.frequency = 'sporadic'
ON MATCH SET  c.message_count = c.message_count + 1,
              c.last_contact = date('2025-09-15'),
              c.frequency = CASE
                WHEN c.message_count > 200 THEN 'daily'
                WHEN c.message_count > 50  THEN 'weekly'
                WHEN c.message_count > 12  THEN 'monthly'
                ELSE 'sporadic'
              END
```

For **temporal analysis** (how did communication patterns change over time?), keep individual communication events as edges, each with its own timestamp. This approach creates more edges but preserves the time dimension.

The choice between aggregate and event-level modeling is one of the most important design decisions in your graph. Aggregate edges make queries faster and the graph smaller. Event-level edges preserve temporal resolution and enable time-series analysis. Many production systems use both: event-level edges for recent data and rolled-up aggregate edges for historical periods.

!!! note "Design Decision: Aggregate vs. Event-Level Communication Edges"
    If you only need to know *who communicates with whom and how much*, use aggregate edges. If you need to know *when communication patterns changed*, *whether communication increased before someone left*, or *how information spread through the network over hours and days*, you need event-level edges. Most analytical systems start with aggregates and add event-level edges for the time windows that matter most.

#### Diagram: Communication Network Model

<iframe src="../../sims/communication-network-model/main.html" width="100%" height="520px" scrolling="no"></iframe>

<details markdown="1">
<summary>Communication Network Model</summary>
Type: graph-model

Bloom Taxonomy: Analyze (L4)
Bloom Verb: differentiate
Learning Objective: Students will differentiate between aggregate and event-level communication edge models, analyzing the trade-offs of each approach.

Purpose: Show the same communication data modeled two ways — aggregate edges (single thick edge with count/frequency) vs. event-level edges (multiple thin edges with timestamps) — and let students compare.

Layout: Split view.
- Left panel: "Aggregate Model" — 5 employee nodes with single weighted edges between communicating pairs. Edge thickness proportional to message_count. Edge labels show frequency (daily/weekly/monthly).
- Right panel: "Event-Level Model" — Same 5 employee nodes with multiple thin edges (one per communication event). Each edge shows timestamp on hover.

Node types:
1. Employee (circles, amber #D4880F) — same 5 employees in both panels: Maria, James, Aisha, Carlos, Li

Edge types (Left panel):
- COMMUNICATES_WITH (solid, amber #D4880F, varying thickness) — properties: message_count, frequency, channels list

Edge types (Right panel):
- SENT_MESSAGE (thin dashed, amber #D4880F) — properties: timestamp, channel, direction

Interactive features:
- Hover over aggregate edge: tooltip shows message_count, frequency, channel breakdown
- Hover over event edge: tooltip shows timestamp and channel
- Toggle button: "Show Edge Count" displays total edges in each model for comparison
- Slider: "Time Window" filters event-level edges to show only a date range, demonstrating temporal analysis capability

Visual style: Aria color scheme. Left panel has clean, minimal edges. Right panel is intentionally denser to illustrate the data volume trade-off.

Responsive design: Stack panels vertically on narrow screens.

Implementation: vis-network with two separate network instances side by side
</details>

## Modeling Positions, Roles, and Titles

Not every attribute belongs directly on the Employee node. **Modeling positions** as separate nodes creates a powerful layer that tracks career movement across the organization.

### Positions as Nodes

A `:Position` node represents a specific role at a specific level within a department:

```cypher
CREATE (p:Position {
  position_id: 'POS-SE-3',
  title: 'Senior Engineer',
  level: 'IC-3',
  department: 'Engineering',
  salary_band: 'Band-7',
  is_management: false
})
```

Employees connect to positions through a `:HOLDS_POSITION` relationship that carries temporal properties:

```cypher
MATCH (maria:Employee {employee_id: 'EMP-10042'}),
      (pos:Position {position_id: 'POS-SE-3'})
CREATE (maria)-[:HOLDS_POSITION {
  start_date: date('2023-06-01'),
  end_date: null,
  is_current: true
}]->(pos)
```

### Roles and Titles

**Roles and titles** often mean different things. A *title* is what appears on a business card — "Senior Engineer," "Product Manager," "VP of Operations." A *role* describes what the person actually does in a given context — "Tech Lead for the migration project," "Scrum Master for Team Alpha," "Hiring Committee Member."

Modeling both gives you richer analytical capability:

```cypher
// Title lives on the Position node
CREATE (pos:Position {title: 'Senior Engineer', level: 'IC-3'})

// Roles are separate relationships or nodes
CREATE (maria)-[:HAS_ROLE {
  role: 'Tech Lead',
  context: 'Cloud Migration Project',
  since: date('2024-04-01')
}]->(project)
```

This separation matters because a single employee can hold one position but play multiple roles across projects and committees. Trying to cram all of that into properties on the Employee node creates a tangled mess. Separate nodes and edges keep the model clean and queryable.

## Modeling Projects and Task Assignments

Projects are where cross-functional collaboration happens — and where the formal org chart often breaks down entirely. **Modeling projects** as nodes lets you see which people from which departments come together to deliver work.

```cypher
CREATE (proj:Project {
  project_id: 'PROJ-2025-CLOUD',
  name: 'Cloud Migration',
  status: 'active',
  start_date: date('2024-01-15'),
  target_end_date: date('2025-06-30'),
  priority: 'high',
  budget: 850000
})
```

### Task Assignments

Within projects, **task assignments** connect employees to specific pieces of work. Tasks can be modeled as nodes themselves or as edges, depending on the granularity you need:

```cypher
// Task as a node (for detailed tracking)
CREATE (task:Task {
  task_id: 'TASK-4521',
  name: 'Migrate Auth Service',
  status: 'in_progress',
  estimated_hours: 40,
  actual_hours: 28
})

// Connect task to project
CREATE (task)-[:BELONGS_TO]->(proj)

// Assign employee to task
CREATE (maria)-[:ASSIGNED_TO {
  assigned_date: date('2024-09-01'),
  role: 'lead',
  estimated_completion: date('2024-10-15')
}]->(task)
```

For simpler models where individual task tracking isn't needed, the assignment can be a direct edge from employee to project:

```cypher
CREATE (maria)-[:WORKS_ON {
  role: 'Tech Lead',
  allocation: 0.6,
  start_date: date('2024-01-15')
}]->(proj)
```

The `allocation` property (a decimal between 0 and 1) captures what percentage of the employee's time goes to this project. When you sum allocations across all projects for an employee, you can detect over-allocation — a common precursor to burnout.

| Model Element | Granularity | Best For |
|---|---|---|
| Employee `:WORKS_ON` Project | Coarse | Portfolio-level analysis, resource allocation |
| Employee `:ASSIGNED_TO` Task, Task `:BELONGS_TO` Project | Fine | Workload analysis, dependency tracking, sprint planning |

## Onboarding, Licenses, and Activity Types

The final layer of the organizational model captures processes, compliance, and behavioral classification — three areas that round out the picture of how an organization operates day to day.

### Onboarding Data Model

**Onboarding** is one of the most graph-natural processes in any organization. A new hire goes through a series of steps — paperwork, equipment provisioning, system access, training modules, mentor assignment, team introduction — and each step involves different people, systems, and timelines.

Modeling onboarding as a graph captures both the process and the relationships it creates:

```cypher
// Create onboarding process node
CREATE (onb:OnboardingProcess {
  onboarding_id: 'ONB-2025-0042',
  employee_id: 'EMP-10042',
  start_date: date('2021-03-15'),
  target_completion: date('2021-04-15'),
  status: 'completed'
})

// Connect to the new hire
CREATE (maria)-[:UNDERWENT]->(onb)

// Connect onboarding steps
CREATE (step1:OnboardingStep {name: 'HR Paperwork', completed: true,
        completed_date: date('2021-03-15')})
CREATE (step2:OnboardingStep {name: 'Equipment Setup', completed: true,
        completed_date: date('2021-03-16')})
CREATE (step3:OnboardingStep {name: 'Mentor Assignment', completed: true,
        completed_date: date('2021-03-17')})

CREATE (onb)-[:INCLUDES {sequence: 1}]->(step1)
CREATE (onb)-[:INCLUDES {sequence: 2}]->(step2)
CREATE (onb)-[:INCLUDES {sequence: 3}]->(step3)

// Mentor relationship created during onboarding
CREATE (maria)-[:MENTORED_BY {
  start_date: date('2021-03-17'),
  context: 'onboarding'
}]->(mentor:Employee {employee_id: 'EMP-10005'})
```

The onboarding model also enables powerful questions about organizational health. How long does onboarding take on average? Which steps are bottlenecks? Do employees who complete onboarding faster build communication networks more quickly? Are mentored new hires retained longer than un-mentored ones?

### License Tracking

**License tracking** models the software, certifications, and access rights assigned to employees. This is especially valuable for cost management and compliance:

```cypher
CREATE (lic:License {
  license_id: 'LIC-JIRA-2025',
  software: 'Jira',
  type: 'professional',
  annual_cost: 150.00,
  vendor: 'Atlassian'
})

CREATE (maria)-[:HOLDS_LICENSE {
  assigned_date: date('2021-03-16'),
  expiry_date: date('2026-03-16'),
  last_used: date('2025-09-14'),
  usage_frequency: 'daily'
}]->(lic)
```

When licenses are modeled in the graph alongside communication and project data, you can identify costly misalignments: employees paying for tools they rarely use, teams sharing a single license when they each need their own, or departing employees whose licenses aren't reclaimed. The `last_used` and `usage_frequency` properties on the edge are particularly valuable for optimization queries.

### Activity Types

**Activity types** classify the different kinds of work and interaction captured in the graph. Rather than treating all communication and collaboration as identical, activity types let you segment and compare:

```cypher
CREATE (at:ActivityType {
  type_id: 'ACT-CODE-REVIEW',
  name: 'Code Review',
  category: 'collaboration',
  department_scope: 'Engineering'
})

CREATE (at2:ActivityType {
  type_id: 'ACT-1ON1',
  name: 'One-on-One Meeting',
  category: 'management',
  department_scope: 'all'
})
```

Connecting events to activity types creates a classification layer that enriches every analytical query:

```cypher
MATCH (event:CommunicationEvent {event_id: 'EVT-99201'}),
      (actType:ActivityType {type_id: 'ACT-CODE-REVIEW'})
CREATE (event)-[:CLASSIFIED_AS]->(actType)
```

Common activity types in an organizational analytics model include:

- **Collaboration** — code reviews, document co-editing, brainstorming sessions
- **Management** — one-on-ones, performance reviews, team standups
- **Knowledge sharing** — training sessions, mentoring meetings, tech talks
- **Decision-making** — steering committee meetings, approval workflows
- **Social** — coffee chats, team lunches, virtual happy hours
- **Administrative** — expense approvals, time tracking, system maintenance

These categories aren't just labels — they enable questions like "What percentage of an employee's interactions are collaborative versus administrative?" or "Do teams with more knowledge-sharing activities have lower turnover?"

## The Complete Organizational Graph Model

Let's step back and see the full picture. Here's the complete set of node types and edge types that comprise the organizational graph model:

#### Diagram: Complete Organizational Graph Schema

<iframe src="../../sims/org-graph-schema/main.html" width="100%" height="600px" scrolling="no"></iframe>

<details markdown="1">
<summary>Complete Organizational Graph Schema</summary>
Type: graph-model

Bloom Taxonomy: Evaluate (L5)
Bloom Verb: assess
Learning Objective: Students will assess the complete organizational graph schema, evaluating how each node type and edge type contributes to organizational analytics capability.

Purpose: Display the complete graph schema showing all node types and their relationship types as a meta-model diagram.

Node types (each as a labeled rounded rectangle):
1. Employee (amber #D4880F)
2. Organization (indigo #303F9F)
3. Department (indigo-light #5C6BC0)
4. Division (indigo-light #5C6BC0)
5. Position (gold #FFD700)
6. Project (amber-dark #B06D0B)
7. Task (amber-light #F5C14B)
8. License (champagne #FFF8E7 with indigo border)
9. OnboardingProcess (champagne #FFF8E7 with amber border)
10. ActivityType (champagne #FFF8E7 with gold border)

Edge types (labeled arrows between node types):
- WORKS_IN: Employee -> Department
- REPORTS_TO: Employee -> Employee
- HOLDS_POSITION: Employee -> Position
- COMMUNICATES_WITH: Employee -> Employee
- WORKS_ON: Employee -> Project
- ASSIGNED_TO: Employee -> Task
- HOLDS_LICENSE: Employee -> License
- UNDERWENT: Employee -> OnboardingProcess
- PART_OF: Department -> Division -> Organization
- BELONGS_TO: Task -> Project
- HEADED_BY: Department -> Employee
- MENTORED_BY: Employee -> Employee
- CLASSIFIED_AS: Event -> ActivityType

Interactive features:
- Hover over any node type to highlight all edges connected to it
- Hover over any edge type to see its properties listed in a tooltip
- Click a node type to see a sample Cypher CREATE statement
- Legend shows color coding for node types

Visual style: Clean schema diagram with generous spacing. Aria color scheme. Dark edges on light background.

Responsive design: Allow zoom and pan for narrow screens.

Implementation: vis-network with hierarchical layout, Employee node centered
</details>

### Node Types Summary

| Node Label | Purpose | Key Properties |
|---|---|---|
| `:Employee` | People in the organization | employee_id, name, email, hire_date, status |
| `:Organization` | Top-level company entity | org_id, name, industry, headquarters |
| `:Division` | Mid-level grouping | name, leader |
| `:Department` | Functional team unit | dept_id, name, budget, headcount |
| `:Position` | Role definition with level | position_id, title, level, salary_band |
| `:Project` | Work initiative | project_id, name, status, priority, budget |
| `:Task` | Individual work item | task_id, name, status, estimated_hours |
| `:License` | Software or certification | license_id, software, annual_cost, vendor |
| `:OnboardingProcess` | New hire integration | onboarding_id, start_date, status |
| `:ActivityType` | Classification of interactions | type_id, name, category |

### Edge Types Summary

| Edge Type | From | To | Key Properties |
|---|---|---|---|
| `:WORKS_IN` | Employee | Department | since |
| `:REPORTS_TO` | Employee | Employee | since, type (solid/dotted) |
| `:COMMUNICATES_WITH` | Employee | Employee | channel, frequency, message_count |
| `:HOLDS_POSITION` | Employee | Position | start_date, end_date, is_current |
| `:WORKS_ON` | Employee | Project | role, allocation, start_date |
| `:ASSIGNED_TO` | Employee | Task | assigned_date, role |
| `:HOLDS_LICENSE` | Employee | License | assigned_date, expiry_date, usage_frequency |
| `:UNDERWENT` | Employee | OnboardingProcess | — |
| `:MENTORED_BY` | Employee | Employee | start_date, context |
| `:PART_OF` | Dept/Div | Div/Org | — |
| `:HEADED_BY` | Department | Employee | appointed_date |
| `:BELONGS_TO` | Task | Project | — |
| `:CLASSIFIED_AS` | Event | ActivityType | — |

## Putting It All Together: A Sample Query

With the complete model in place, let's see how these elements combine to answer a real organizational question. Suppose you want to find employees who work on the Cloud Migration project, communicate daily with people outside their department, and hold an active Jira license:

```cypher
MATCH (e:Employee)-[:WORKS_ON]->(p:Project {name: 'Cloud Migration'}),
      (e)-[:WORKS_IN]->(myDept:Department),
      (e)-[comm:COMMUNICATES_WITH {frequency: 'daily'}]->(other:Employee),
      (other)-[:WORKS_IN]->(otherDept:Department),
      (e)-[:HOLDS_LICENSE]->(lic:License {software: 'Jira'})
WHERE myDept <> otherDept
RETURN e.first_name + ' ' + e.last_name AS employee,
       myDept.name AS department,
       count(DISTINCT other) AS cross_dept_contacts,
       lic.annual_cost AS jira_cost
ORDER BY cross_dept_contacts DESC
```

This single query traverses employees, projects, departments, communications, and licenses — five node types and four edge types — in a readable, declarative statement. Try writing that in SQL with JOINs across five tables. You would need at least four JOINs, subqueries for the cross-department filter, and the cognitive overhead would be significant. In Cypher, the query reads almost like the question itself.

#### Diagram: Multi-Entity Query Visualization

<iframe src="../../sims/multi-entity-query/main.html" width="100%" height="500px" scrolling="no"></iframe>

<details markdown="1">
<summary>Multi-Entity Query Visualization</summary>
Type: microsim

Bloom Taxonomy: Apply (L3)
Bloom Verb: execute
Learning Objective: Students will execute a multi-entity Cypher query and trace the traversal path through the organizational graph model.

Purpose: Animate the execution of the sample query above, showing how the graph database traverses from Employee to Project, Department, Communication, and License nodes.

Layout: Graph visualization showing 8-10 nodes from the sample organizational data with all relevant edge types.

Animation sequence:
1. All nodes dimmed. Query text displayed at top.
2. MATCH clause 1: Employee nodes connected to Cloud Migration project highlight (amber pulse)
3. MATCH clause 2: WORKS_IN edges to Department nodes highlight (indigo pulse)
4. MATCH clause 3: COMMUNICATES_WITH edges to other employees highlight (amber dashed pulse)
5. WHERE clause: Cross-department filter eliminates same-department pairs (dimmed edges)
6. MATCH clause 4: HOLDS_LICENSE edges to Jira license node highlight (gold pulse)
7. RETURN: Matching employees glow and results table appears below

Interactive features:
- Play/pause button to control animation
- Step forward/backward buttons
- Speed control slider
- Reset button
- Hover over highlighted nodes to see their properties during any step

Visual style: Dark background for contrast. Aria color scheme for node highlights. Each step annotated with the corresponding Cypher clause.

Responsive design: Scale to container width. On narrow screens, move query text to a collapsible panel.

Implementation: p5.js with canvas-based controls, timed animation steps
</details>

## Model Evolution and Best Practices

A data model is never truly finished. As your organization evolves — new departments form, projects spin up and wind down, communication tools change — your graph model evolves with it. Here are the principles that keep the model healthy:

- **Start minimal, expand deliberately.** Begin with Employee, Department, and COMMUNICATES_WITH. Add Position, Project, and License nodes only when your analytical questions demand them.
- **Name edges as verbs.** `:WORKS_IN`, `:REPORTS_TO`, `:COMMUNICATES_WITH` — these read like natural language. Avoid generic edges like `:RELATED_TO` or `:HAS`.
- **Use properties for attributes, nodes for entities.** If something has its own identity and lifecycle, it deserves to be a node. If it's a descriptor, it's a property.
- **Index your identifiers.** Every node type should have a unique constraint on its ID property. This makes lookups fast and prevents duplicates.
- **Version your schema.** Document each node type, edge type, and their properties. When the model changes, note what changed and why.

```cypher
// Create unique constraints for each node type
CREATE CONSTRAINT FOR (e:Employee) REQUIRE e.employee_id IS UNIQUE;
CREATE CONSTRAINT FOR (d:Department) REQUIRE d.dept_id IS UNIQUE;
CREATE CONSTRAINT FOR (p:Project) REQUIRE p.project_id IS UNIQUE;
CREATE CONSTRAINT FOR (pos:Position) REQUIRE pos.position_id IS UNIQUE;
CREATE CONSTRAINT FOR (lic:License) REQUIRE lic.license_id IS UNIQUE;
```

## Chapter Summary

> "Look at you — you just designed an entire organizational graph model, covering everything from the individual employee to the enterprise hierarchy, from communication patterns to license tracking. That's the blueprint for serious organizational analytics. In my colony, it took me three months of crawling through tunnels to map this out. You did it in one chapter. Not bad at all."
> — Aria

Let's stash the big ideas before we move on:

- **Modeling employees** starts with the Employee node — the fundamental building block of any organizational graph. Every person gets a node with a stable, unique **employee identifier** and a set of **employee attributes** divided into stable (name, hire date) and dynamic (title, department) categories.

- **Modeling organizations** creates the container structure — `:Organization`, `:Division`, and `:Department` nodes connected by `:PART_OF` edges. **Organization attributes** capture identity and characteristics, while **department structure** represents the functional grouping of people.

- **Organizational hierarchy** forms a tree of structural relationships, while **reporting lines** capture the management relationships between individuals — including solid-line, dotted-line, and temporary reporting through edge properties.

- **Modeling communication** captures how people actually interact. **Communication channels** (email, chat, meetings, code reviews) become properties on edges. **Communication frequency** and **communication volume** measure the intensity of relationships, modeled as either aggregate edges or event-level edges depending on your analytical needs.

- **Modeling positions** separates the role from the person, enabling career path tracking. **Roles and titles** capture both formal position titles and context-specific roles across projects.

- **Modeling projects** and **task assignments** reveal cross-functional collaboration patterns. Projects are nodes; assignments are edges with allocation and role properties.

- The **onboarding data model** captures the new hire integration process as a graph of steps, mentors, and milestones. **License tracking** models software and certification assignments for cost and compliance analysis. **Activity types** classify interactions into categories that enable behavioral analysis.

- The complete model uses 10 node types and 13+ edge types, all queryable through Cypher. Start minimal and expand deliberately as your analytical questions demand.

In the next chapter, we'll tackle the ethical, privacy, and security dimensions of working with this data — because building a powerful model is only half the responsibility. Follow the trail — the data always leads somewhere, but we need to make sure it leads somewhere good.

Six legs, one insight at a time. You've got this.
