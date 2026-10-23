---
id: ADR-0019
category: nfr
title: "NFR: recovery time objective \u2014 4 hours"
status: accepted
superseded_by: null
dimension: recovery time objective
metric: time to restore service after a regional loss (RTO)
threshold: 4 hours
component_id: null
needs_dedicated_tracking: true
evidence: 'Human: ''Multi-AZ everywhere, RPO 15 min, RTO 4 h, backups only cross-region''.'
---

## Context

Human: 'Multi-AZ everywhere, RPO 15 min, RTO 4 h, backups only cross-region'.

## Decision

time to restore service after a regional loss (RTO): 4 hours
