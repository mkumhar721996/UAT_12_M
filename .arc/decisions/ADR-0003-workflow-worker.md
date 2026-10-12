---
id: ADR-0003
category: component
title: Workflow Worker
status: accepted
superseded_by: null
component_id: comp_workflow_worker
responsibility: 'Executes background and asynchronous work: notifications/alerts and
  longer-running or scheduled workflow/process steps.'
kind: worker
split_reason: Notifications/alerts and async process execution are decoupled from
  the request/response API to support the stated scalability goal; one worker covers
  all background jobs to start.
talks_to:
- component_id: comp_job_queue
  interaction: async
  evidence: Worker consumes queued jobs for notifications/alerts and async process
    steps.
- component_id: comp_relational_database
  interaction: shared-storage
  evidence: Worker updates process/task state and reads data needed to execute background
    steps.
evidence: Human listed 'Notifications and alerts' and 'Process execution and tracking'
  as core capabilities; 'scalable, cloud-native' requirement.
---

## Context

Human listed 'Notifications and alerts' and 'Process execution and tracking' as core capabilities; 'scalable, cloud-native' requirement.

## Decision

Executes background and asynchronous work: notifications/alerts and longer-running or scheduled workflow/process steps.

Kept separate because Notifications/alerts and async process execution are decoupled from the request/response API to support the stated scalability goal; one worker covers all background jobs to start..

## Talks to

- **Job Queue** (async) — Worker consumes queued jobs for notifications/alerts and async process steps.
- **Relational Database** (shared-storage) — Worker updates process/task state and reads data needed to execute background steps.
