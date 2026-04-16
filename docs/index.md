---
layout: home

hero:
  name: depdet
  text: Hunt down deprecated API usages
  tagline: Scans your JS/TS project for @deprecated JSDoc symbols and maps each one to its replacement. Zero config, CI-ready.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: CLI Reference
      link: /cli-reference
    - theme: alt
      text: View on GitHub
      link: https://github.com/zaxovaiko/depdet

features:
  - title: Zero config
    details: Drop it in any project. Auto-respects .gitignore, detects tsconfig.json, skips @generated files. No setup required.
  - title: Source + deps
    details: Scans both your source files and node_modules type definitions — finds deprecated usage no matter where the symbol comes from.
  - title: Replacement hints
    details: Extracts replacement info from {@link X}, "Use X instead", "Replaced by X", "Prefer X" — human and machine readable.
  - title: Three output formats
    details: Pretty table for humans, JSON for LLMs, Markdown for PR descriptions. Pipe anywhere.
  - title: CI-ready
    details: Use --fail-on-found to block deploys when deprecated APIs are detected.
  - title: Programmatic API
    details: Import scan() directly for custom tooling, scripts, or editor integrations.
---
