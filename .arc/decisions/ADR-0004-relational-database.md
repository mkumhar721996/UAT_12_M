---
id: ADR-0004
category: component
title: Relational Database
status: accepted
superseded_by: null
component_id: comp_relational_database
responsibility: 'Stores core platform data: users, roles, workflow definitions, tasks,
  approvals, process state, and audit trail. Specific product not yet decided.'
kind: managed_service
split_reason: Backing data store the project needs but doesn't build itself.
evidence: Implied by 'Workflow design and configuration', 'Task and approval management',
  'Process execution and tracking' capabilities.
---

## Context

Implied by 'Workflow design and configuration', 'Task and approval management', 'Process execution and tracking' capabilities.

## Decision

Stores core platform data: users, roles, workflow definitions, tasks, approvals, process state, and audit trail. Specific product not yet decided.

Kept separate because Backing data store the project needs but doesn't build itself..
