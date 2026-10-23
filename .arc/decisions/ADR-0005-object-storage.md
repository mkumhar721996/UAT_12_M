---
id: ADR-0005
category: component
title: Object Storage
status: superseded
superseded_by: ADR-0016
component_id: comp_object_storage
responsibility: Stores uploaded documents and files attached to workflows. Specific
  product not yet decided.
kind: managed_service
split_reason: Document and file management is an explicit core capability requiring
  blob storage distinct from structured relational data.
evidence: 'Human: ''Document and file management'' listed as a core capability.'
---

## Context

Human: 'Document and file management' listed as a core capability.

## Decision

Stores uploaded documents and files attached to workflows. Specific product not yet decided.

Kept separate because Document and file management is an explicit core capability requiring blob storage distinct from structured relational data..
