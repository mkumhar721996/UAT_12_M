---
id: ADR-0023
category: cross_cutting
title: 'Cross-cutting: multi-tenancy'
status: accepted
superseded_by: null
component_id: null
decision: 'Single-tenant: one dedicated stack (API, Worker, database, queue, storage)
  per organization, so isolation is at the stack level. ''Tenant-aware permissions''
  for later external customer access apply within an organization''s own stack, not
  across organizations.'
evidence: 'Human: ''Keep a stack per organization''.'
contested: true
alternatives_considered:
- Shared stack with tenant_id on shared tables
- Shared stack with schema or database per tenant
- 'Hybrid: shared by default, dedicated stack for large organizations'
consequences:
- Hundreds of stacks to provision and operate, so automated provisioning (IaC) is
  essential
- Per-organization cost floor for database, queue and storage
- Strong tenant isolation and per-organization data residency are easy to achieve
---

## Context

Human: 'Keep a stack per organization'.

## Decision

Single-tenant: one dedicated stack (API, Worker, database, queue, storage) per organization, so isolation is at the stack level. 'Tenant-aware permissions' for later external customer access apply within an organization's own stack, not across organizations.

## Alternatives considered

- Shared stack with tenant_id on shared tables
- Shared stack with schema or database per tenant
- Hybrid: shared by default, dedicated stack for large organizations

## Consequences

- Hundreds of stacks to provision and operate, so automated provisioning (IaC) is essential
- Per-organization cost floor for database, queue and storage
- Strong tenant isolation and per-organization data residency are easy to achieve
