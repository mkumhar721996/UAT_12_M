---
id: ADR-0025
category: cross_cutting
title: 'Cross-cutting: api edge'
status: accepted
superseded_by: null
component_id: null
decision: The Web App calls the Workflow API directly over HTTPS through an Application
  Load Balancer in each stack; no API gateway or BFF for now. A gateway can be introduced
  later if a public API or webhooks are added.
evidence: 'Human: ''Direct via load balancer, no gateway for now''.'
contested: true
alternatives_considered:
- API gateway in front with public API planned
- BFF for the Web App only
consequences:
- Rate limiting, API keys and external-consumer auth are not provided at the edge
  until a gateway is added
- Fewer components and lower cost per stack
---

## Context

Human: 'Direct via load balancer, no gateway for now'.

## Decision

The Web App calls the Workflow API directly over HTTPS through an Application Load Balancer in each stack; no API gateway or BFF for now. A gateway can be introduced later if a public API or webhooks are added.

## Alternatives considered

- API gateway in front with public API planned
- BFF for the Web App only

## Consequences

- Rate limiting, API keys and external-consumer auth are not provided at the edge until a gateway is added
- Fewer components and lower cost per stack
