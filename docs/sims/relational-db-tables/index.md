---
title: Relational Database Tables
description: Interactive diagram showing how relational databases use tables, rows, columns, and foreign keys to store and link organizational data.
quality_score: 85
---

# Relational Database Tables

<iframe src="./main.html" width="100%" height="442" style="border: 2px solid #303F9F; border-radius: 8px;" scrolling="no"></iframe>

[Open Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

This interactive diagram illustrates the fundamental building blocks of a relational database. You'll see two tables -- **Employees** and **Departments** -- connected by foreign key relationships, just like you'd find in any HR information system.

Hover over rows to highlight them, and explore the dashed arrows to see how foreign keys link data across tables. Notice how `dept_id` in the Employees table points to the matching `dept_id` in the Departments table, and `head_id` in the Departments table points back to an employee.

## Key Concepts

- **Primary Key (PK):** A column that uniquely identifies each row in a table, shown with a gold background.
- **Foreign Key (FK):** A column that references a primary key in another table, creating a link between tables. Shown with an amber background and dashed arrows.
- **Rows:** Individual records (e.g., one employee or one department).
- **Columns:** Attributes of each record (e.g., name, title, department).

## Why This Matters

Before we dive into graph databases, it helps to understand how most organizations store their data today. Relational databases have been the default for decades, and they work well for structured, tabular data. But as you'll see in later chapters, some questions -- like "who are the hidden influencers in our communication network?" -- push relational databases to their limits.

## Lesson Plan

**Bloom Level:** Understand (L2)

**Learning Objective:** Students will explain how relational databases use tables, rows, columns, and foreign keys to store and link data.

### Activities

1. **Explore the Diagram:** Hover over each row and each foreign key arrow. Can you trace how the tables connect?
2. **Identify the Relationships:** Which employee heads the Engineering department? How do you know from the table data alone?
3. **Think About Limitations:** What if you wanted to find all the people Maria communicates with, and then all the people *they* communicate with? How many JOINs would that require?
4. **Discussion:** Why might storing organizational relationships in tables become unwieldy as the network grows?
