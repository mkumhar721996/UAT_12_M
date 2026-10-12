---
id: ADR-0006
category: component
title: Job Queue
status: accepted
superseded_by: null
component_id: comp_job_queue
responsibility: Decouples the Workflow API from asynchronous background processing,
  carrying jobs (notifications, async process steps) to the Workflow Worker. Specific
  product not yet decided.
kind: managed_service
split_reason: Needed to support async notifications and background process execution
  per the stated 'scalable, cloud-native' requirement.
evidence: 'Human: ''Notifications and alerts''; ''scalable, cloud-native'' requirement.'
---

## Context

Human: 'Notifications and alerts'; 'scalable, cloud-native' requirement.

## Decision

Decouples the Workflow API from asynchronous background processing, carrying jobs (notifications, async process steps) to the Workflow Worker. Specific product not yet decided.

Kept separate because Needed to support async notifications and background process execution per the stated 'scalable, cloud-native' requirement..
