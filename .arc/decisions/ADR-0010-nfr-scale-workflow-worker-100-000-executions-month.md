---
id: ADR-0010
category: nfr
title: "NFR: scale (Workflow Worker) \u2014 100,000+ executions/month"
status: accepted
superseded_by: null
dimension: scale
metric: workflow executions processed (aggregate), horizontally scalable
threshold: 100,000+ executions/month
component_id: comp_workflow_worker
needs_dedicated_tracking: true
evidence: 'Human: ''Workflow Executions: 100,000+ workflow executions per month'';
  ''Horizontal scaling capability for API and Worker services''.'
---

## Context

Human: 'Workflow Executions: 100,000+ workflow executions per month'; 'Horizontal scaling capability for API and Worker services'.

## Decision

workflow executions processed (aggregate), horizontally scalable: 100,000+ executions/month

Applies to Workflow Worker.
