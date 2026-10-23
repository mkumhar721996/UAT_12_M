---
id: ADR-0022
category: cross_cutting
title: 'Cross-cutting: auth'
status: accepted
superseded_by: null
component_id: null
decision: Authentication is delegated to each organization's external identity provider
  via SSO (OIDC/SAML). The platform enforces role-based access control in the Workflow
  API and Web App and holds no user directory of its own.
evidence: 'Human: ''User authentication and role-based access control''; SSO via Entra
  ID, Okta, OIDC/SAML.'
---

## Context

Human: 'User authentication and role-based access control'; SSO via Entra ID, Okta, OIDC/SAML.

## Decision

Authentication is delegated to each organization's external identity provider via SSO (OIDC/SAML). The platform enforces role-based access control in the Workflow API and Web App and holds no user directory of its own.
