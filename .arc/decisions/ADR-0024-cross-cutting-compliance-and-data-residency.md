---
id: ADR-0024
category: cross_cutting
title: 'Cross-cutting: compliance and data residency'
status: accepted
superseded_by: null
component_id: null
decision: No compliance regime (SOC 2, GDPR, HIPAA, etc.) and no data-residency constraint
  apply. Data may live in the single AWS region; standard encryption at rest and in
  transit is still the default for managed services.
evidence: 'Human: ''No compliance regime or residency constraint''.'
---

## Context

Human: 'No compliance regime or residency constraint'.

## Decision

No compliance regime (SOC 2, GDPR, HIPAA, etc.) and no data-residency constraint apply. Data may live in the single AWS region; standard encryption at rest and in transit is still the default for managed services.
