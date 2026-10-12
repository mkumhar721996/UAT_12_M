---
id: ADR-0008
category: nfr
title: "NFR: scale \u2014 100-500 organizations; 10,000-50,000 registered users; 500-1,000\
  \ concurrent\u2026"
status: accepted
superseded_by: null
dimension: scale
metric: organizations, registered users, and concurrent users (aggregate across all
  single-tenant deployments)
threshold: 100-500 organizations; 10,000-50,000 registered users; 500-1,000 concurrent
  users
component_id: null
needs_dedicated_tracking: true
evidence: 'Human: ''Organizations (Tenants): 100-500 organizations; Registered Users:
  10,000-50,000 users; Concurrent Users: 500-1,000 concurrent users''.'
---

## Context

Human: 'Organizations (Tenants): 100-500 organizations; Registered Users: 10,000-50,000 users; Concurrent Users: 500-1,000 concurrent users'.

## Decision

organizations, registered users, and concurrent users (aggregate across all single-tenant deployments): 100-500 organizations; 10,000-50,000 registered users; 500-1,000 concurrent users
