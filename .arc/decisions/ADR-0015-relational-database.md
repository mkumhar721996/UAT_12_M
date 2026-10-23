---
id: ADR-0015
category: component
title: Relational Database
status: accepted
superseded_by: null
component_id: comp_relational_database
responsibility: 'Stores core platform data: users, roles, workflow definitions, tasks,
  approvals, process state, and audit trail; runs on Amazon RDS for PostgreSQL (Multi-AZ,
  point-in-time backups copied cross-region).'
kind: managed_service
split_reason: Backing data store the project needs but doesn't build itself.
evidence: 'Human: ''RDS PostgreSQL, S3, SQS, no separate engine''.'
contested: true
alternatives_considered:
- Aurora PostgreSQL
consequences:
- Simpler and cheaper per-organization floor than Aurora, which suits hundreds of
  stacks
- Scaling is vertical plus read replicas rather than Aurora's storage-level scaling
---

## Context

Human: 'RDS PostgreSQL, S3, SQS, no separate engine'.

## Decision

Stores core platform data: users, roles, workflow definitions, tasks, approvals, process state, and audit trail; runs on Amazon RDS for PostgreSQL (Multi-AZ, point-in-time backups copied cross-region).

Kept separate because Backing data store the project needs but doesn't build itself..

## Alternatives considered

- Aurora PostgreSQL

## Consequences

- Simpler and cheaper per-organization floor than Aurora, which suits hundreds of stacks
- Scaling is vertical plus read replicas rather than Aurora's storage-level scaling
