---
id: ADR-0001
category: component
title: Web App
status: accepted
superseded_by: null
component_id: comp_web_app
responsibility: Web-based UI for internal employees and business administrators to
  design/configure workflows, execute and monitor tasks and approvals, view reports/dashboards,
  and manage documents, with role-based access. Initial release targets internal employees
  and administrators only; external customer/business-user access is deferred and,
  when added, will use this same Web App with role-based and tenant-aware permissions
  rather than a separate app.
kind: web_ui
split_reason: Single client for all current and future user roles; a distinct runtime
  (browser) from the API, per the human's description of a web-based application.
talks_to:
- component_id: comp_workflow_api
  interaction: sync
  evidence: Web App is the UI client for the API-driven platform the human described.
- component_id: comp_identity_provider
  interaction: sync
  evidence: User authentication is a core capability; browser-based login flows typically
    call the identity provider directly.
evidence: 'Human: ''External customer/business-user access is deferred from the initial
  build ... it should use the same Web App with role-based access control and tenant-aware
  permissions, rather than a separate customer-facing application.'''
---

## Context

Human: 'External customer/business-user access is deferred from the initial build ... it should use the same Web App with role-based access control and tenant-aware permissions, rather than a separate customer-facing application.'

## Decision

Web-based UI for internal employees and business administrators to design/configure workflows, execute and monitor tasks and approvals, view reports/dashboards, and manage documents, with role-based access. Initial release targets internal employees and administrators only; external customer/business-user access is deferred and, when added, will use this same Web App with role-based and tenant-aware permissions rather than a separate app.

Kept separate because Single client for all current and future user roles; a distinct runtime (browser) from the API, per the human's description of a web-based application..

## Talks to

- **Workflow API** (sync) — Web App is the UI client for the API-driven platform the human described.
- **Identity Provider** (sync) — User authentication is a core capability; browser-based login flows typically call the identity provider directly.
