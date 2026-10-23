---
id: ADR-0020
category: deployment_target
title: "Deployment target: AWS, containers on Amazon ECS Fargate, one stack per organization\u2026"
status: accepted
superseded_by: null
component_id: null
decision: 'AWS, containers on Amazon ECS Fargate, one stack per organization (single-tenant),
  in a single primary AWS region initially. Two environments: production and staging.
  Every stack is provisioned automatically via infrastructure as code. Every tier
  (Fargate tasks, RDS PostgreSQL, SQS, S3) is multi-AZ to meet 99.9% uptime. Backups
  are copied cross-region only, with no standby second region; recovery after regional
  loss is an automated restore within RTO 4 h / RPO 15 min. Optimized for simplicity
  and operational efficiency early on, able to scale as adoption grows.'
evidence: 'Human: ''Prod and staging, automated provisioning via IaC''; earlier: ''AWS
  ... ECS Fargate; Single AWS region initially'' and ''Multi-AZ everywhere, RPO 15
  min, RTO 4 h, backups only cross-region''.'
contested: true
alternatives_considered:
- Dev, staging and prod environments
- Prod only with manual provisioning
consequences:
- 'IaC pipeline is a core deliverable: onboarding an organization and disaster recovery
  both depend on it'
- Staging is a single shared environment, with no per-developer dev environment
---

## Context

Human: 'Prod and staging, automated provisioning via IaC'; earlier: 'AWS ... ECS Fargate; Single AWS region initially' and 'Multi-AZ everywhere, RPO 15 min, RTO 4 h, backups only cross-region'.

## Decision

AWS, containers on Amazon ECS Fargate, one stack per organization (single-tenant), in a single primary AWS region initially. Two environments: production and staging. Every stack is provisioned automatically via infrastructure as code. Every tier (Fargate tasks, RDS PostgreSQL, SQS, S3) is multi-AZ to meet 99.9% uptime. Backups are copied cross-region only, with no standby second region; recovery after regional loss is an automated restore within RTO 4 h / RPO 15 min. Optimized for simplicity and operational efficiency early on, able to scale as adoption grows.

## Alternatives considered

- Dev, staging and prod environments
- Prod only with manual provisioning

## Consequences

- IaC pipeline is a core deliverable: onboarding an organization and disaster recovery both depend on it
- Staging is a single shared environment, with no per-developer dev environment
