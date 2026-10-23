---
id: ADR-0018
category: nfr
title: "NFR: recovery point objective \u2014 15 minutes"
status: accepted
superseded_by: null
dimension: recovery point objective
metric: maximum data loss (RPO)
threshold: 15 minutes
component_id: null
needs_dedicated_tracking: true
evidence: 'Human: ''Multi-AZ everywhere, RPO 15 min, RTO 4 h, backups only cross-region''.'
---

## Context

Human: 'Multi-AZ everywhere, RPO 15 min, RTO 4 h, backups only cross-region'.

## Decision

maximum data loss (RPO): 15 minutes
