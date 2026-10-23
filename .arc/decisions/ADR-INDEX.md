# ADR Index

One line per decision — the rule, not the reasoning. Read the full ADR (`.arc/decisions/ADR-NNNN-*.md`) for context and rationale.

| ADR | Category | Status | Title |
|---|---|---|---|
| ADR-0001 | component | accepted | Web App |
| ADR-0002 | component | accepted | Workflow API |
| ADR-0003 | component | superseded by ADR-0014 | Workflow Worker |
| ADR-0004 | component | superseded by ADR-0015 | Relational Database |
| ADR-0005 | component | superseded by ADR-0016 | Object Storage |
| ADR-0006 | component | superseded by ADR-0017 | Job Queue |
| ADR-0007 | component | accepted | Identity Provider |
| ADR-0008 | nfr | accepted | NFR: scale — 100-500 organizations; 10,000-50,000 registered users; 500-1,000 concurrent… |
| ADR-0009 | nfr | accepted | NFR: scale (Workflow API) — 1-5 million requests/month |
| ADR-0010 | nfr | accepted | NFR: scale (Workflow Worker) — 100,000+ executions/month |
| ADR-0011 | nfr | accepted | NFR: availability — 99.9% uptime, 24/7 availability |
| ADR-0012 | deployment_target | superseded by ADR-0020 | Deployment target: AWS, container-based deployment on Amazon ECS Fargate; one stack per… |
| ADR-0013 | integration_surface | accepted | Integration: Identity Providers (SSO) (bidirectional) |
| ADR-0014 | component | accepted | Workflow Worker |
| ADR-0015 | component | accepted | Relational Database |
| ADR-0016 | component | accepted | Object Storage |
| ADR-0017 | component | accepted | Job Queue |
| ADR-0018 | nfr | accepted | NFR: recovery point objective — 15 minutes |
| ADR-0019 | nfr | accepted | NFR: recovery time objective — 4 hours |
| ADR-0020 | deployment_target | accepted | Deployment target: AWS, containers on Amazon ECS Fargate, one stack per organization… |
| ADR-0021 | integration_surface | accepted | Integration: Amazon SES (outbound) |
| ADR-0022 | cross_cutting | accepted | Cross-cutting: auth |
| ADR-0023 | cross_cutting | accepted | Cross-cutting: multi-tenancy |
| ADR-0024 | cross_cutting | accepted | Cross-cutting: compliance and data residency |
| ADR-0025 | cross_cutting | accepted | Cross-cutting: api edge |
