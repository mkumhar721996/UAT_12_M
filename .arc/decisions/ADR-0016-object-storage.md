---
id: ADR-0016
category: component
title: Object Storage
status: accepted
superseded_by: null
component_id: comp_object_storage
responsibility: Stores uploaded documents and files attached to workflows; runs on
  Amazon S3.
kind: managed_service
split_reason: Document and file management is an explicit core capability requiring
  blob storage distinct from structured relational data.
evidence: 'Human: ''RDS PostgreSQL, S3, SQS, no separate engine''.'
---

## Context

Human: 'RDS PostgreSQL, S3, SQS, no separate engine'.

## Decision

Stores uploaded documents and files attached to workflows; runs on Amazon S3.

Kept separate because Document and file management is an explicit core capability requiring blob storage distinct from structured relational data..
