---
id: ADR-0007
category: component
title: Identity Provider
status: accepted
superseded_by: null
component_id: comp_identity_provider
responsibility: Integrates with each organization's own external identity provider
  (Microsoft Entra ID, Okta, or any OIDC/SAML-compatible provider) via SSO for authentication;
  the platform does not run its own user directory. Applies role-based access control
  once a user is authenticated.
kind: managed_service
split_reason: Auth/RBAC is a core capability; buying SSO integration (vs. building
  a custom user store) fits the single-tenant, per-organization deployment model.
evidence: 'Human: ''Microsoft Entra ID (Azure AD), Okta, OIDC / SAML-compatible providers,
  Single Sign-On (SSO)''.'
---

## Context

Human: 'Microsoft Entra ID (Azure AD), Okta, OIDC / SAML-compatible providers, Single Sign-On (SSO)'.

## Decision

Integrates with each organization's own external identity provider (Microsoft Entra ID, Okta, or any OIDC/SAML-compatible provider) via SSO for authentication; the platform does not run its own user directory. Applies role-based access control once a user is authenticated.

Kept separate because Auth/RBAC is a core capability; buying SSO integration (vs. building a custom user store) fits the single-tenant, per-organization deployment model..
