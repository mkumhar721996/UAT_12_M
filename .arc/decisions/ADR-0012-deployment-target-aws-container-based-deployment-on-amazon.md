---
id: ADR-0012
category: deployment_target
title: "Deployment target: AWS, container-based deployment on Amazon ECS Fargate;\
  \ one stack per\u2026"
status: superseded
superseded_by: ADR-0020
component_id: null
decision: AWS, container-based deployment on Amazon ECS Fargate; one stack per organization
  (single-tenant) deployed within a single AWS region initially. Optimized for simplicity/operational
  efficiency early on, with ability to scale as adoption grows.
evidence: 'Human: ''Cloud Provider: AWS; Hosting Model: Container-based deployment
  using Amazon ECS Fargate; Region: Single AWS region initially; Budget Constraint:
  Optimize for simplicity and operational efficiency during the early stages, with
  the ability to scale as adoption grows''.'
---

## Context

Human: 'Cloud Provider: AWS; Hosting Model: Container-based deployment using Amazon ECS Fargate; Region: Single AWS region initially; Budget Constraint: Optimize for simplicity and operational efficiency during the early stages, with the ability to scale as adoption grows'.

## Decision

AWS, container-based deployment on Amazon ECS Fargate; one stack per organization (single-tenant) deployed within a single AWS region initially. Optimized for simplicity/operational efficiency early on, with ability to scale as adoption grows.
