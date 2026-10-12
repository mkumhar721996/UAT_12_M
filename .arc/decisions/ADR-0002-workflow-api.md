---
id: ADR-0002
category: component
title: Workflow API
status: accepted
superseded_by: null
component_id: comp_workflow_api
responsibility: Core API for authentication/RBAC, workflow design and configuration,
  task and approval management, process execution and tracking, reporting, and document
  metadata; serves the Web App and future external integrations. A single unified
  API with clear internal domain boundaries (workflows, tasks, documents, reporting)
  rather than separate services per domain.
kind: api_service
split_reason: Human stated the architecture should be 'API-driven'; separates business
  logic from the web client. Kept as one unified API initially rather than splitting
  per domain.
talks_to:
- component_id: comp_identity_provider
  interaction: sync
  evidence: API must validate RBAC/authentication on incoming requests per 'User authentication
    and role-based access control' capability.
- component_id: comp_relational_database
  interaction: shared-storage
  evidence: API reads/writes workflow, task, and user data per core capabilities.
- component_id: comp_object_storage
  interaction: shared-storage
  evidence: API handles 'Document and file management' capability, storing/retrieving
    files.
- component_id: comp_job_queue
  interaction: async
  evidence: API enqueues background work (notifications, async process steps) for
    the Workflow Worker.
evidence: 'Human: ''One unified API initially, with clear domain boundaries internally.'''
---

## Context

Human: 'One unified API initially, with clear domain boundaries internally.'

## Decision

Core API for authentication/RBAC, workflow design and configuration, task and approval management, process execution and tracking, reporting, and document metadata; serves the Web App and future external integrations. A single unified API with clear internal domain boundaries (workflows, tasks, documents, reporting) rather than separate services per domain.

Kept separate because Human stated the architecture should be 'API-driven'; separates business logic from the web client. Kept as one unified API initially rather than splitting per domain..

## Talks to

- **Identity Provider** (sync) — API must validate RBAC/authentication on incoming requests per 'User authentication and role-based access control' capability.
- **Relational Database** (shared-storage) — API reads/writes workflow, task, and user data per core capabilities.
- **Object Storage** (shared-storage) — API handles 'Document and file management' capability, storing/retrieving files.
- **Job Queue** (async) — API enqueues background work (notifications, async process steps) for the Workflow Worker.
