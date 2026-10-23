---
id: ADR-0017
category: component
title: Job Queue
status: accepted
superseded_by: null
component_id: comp_job_queue
responsibility: Decouples the Workflow API from asynchronous background processing,
  carrying jobs (notifications, async process steps) to the Workflow Worker; runs
  on Amazon SQS.
kind: managed_service
split_reason: Needed to support async notifications and background process execution
  per the stated 'scalable, cloud-native' requirement.
evidence: 'Human: ''RDS PostgreSQL, S3, SQS, no separate engine''.'
---

## Context

Human: 'RDS PostgreSQL, S3, SQS, no separate engine'.

## Decision

Decouples the Workflow API from asynchronous background processing, carrying jobs (notifications, async process steps) to the Workflow Worker; runs on Amazon SQS.

Kept separate because Needed to support async notifications and background process execution per the stated 'scalable, cloud-native' requirement..
