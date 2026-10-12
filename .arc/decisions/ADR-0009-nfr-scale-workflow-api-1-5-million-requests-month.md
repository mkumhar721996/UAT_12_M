---
id: ADR-0009
category: nfr
title: "NFR: scale (Workflow API) \u2014 1-5 million requests/month"
status: accepted
superseded_by: null
dimension: scale
metric: API request volume (aggregate), horizontally scalable
threshold: 1-5 million requests/month
component_id: comp_workflow_api
needs_dedicated_tracking: true
evidence: 'Human: ''API Requests: 1-5 million requests per month''; ''Horizontal scaling
  capability for API and Worker services''.'
---

## Context

Human: 'API Requests: 1-5 million requests per month'; 'Horizontal scaling capability for API and Worker services'.

## Decision

API request volume (aggregate), horizontally scalable: 1-5 million requests/month

Applies to Workflow API.
