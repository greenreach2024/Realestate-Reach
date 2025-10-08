# Contributing to Realestate Reach

Thanks for your interest in helping build a buyer-first real estate marketplace. This guide outlines how to work with the repository and collaborate effectively.

## Table of contents

1. [Ground rules](#ground-rules)
2. [Ways to contribute](#ways-to-contribute)
3. [Development workflow](#development-workflow)
4. [Commit messages](#commit-messages)
5. [Pull request checklist](#pull-request-checklist)
6. [Community and support](#community-and-support)

## Ground rules

* Review and abide by our [Code of Conduct](CODE_OF_CONDUCT.md).
* Assume positive intent, be respectful, and default to asynchronous communication.
* Protect customer and partner data; never upload proprietary or personally identifiable information.

## Ways to contribute

* **Product feedback** – Use the feature request template to share ideas that make the buyer registry more valuable.
* **Bug reports** – File reproducible issues with clear steps, expected vs. actual behavior, and environment details.
* **Documentation** – Improve specs, ADRs, and onboarding guides to keep stakeholders aligned.
* **Engineering** – Pick an issue from the backlog (or propose one) and follow the workflow below.

## Development workflow

1. Fork the repository (or create a feature branch if you have direct access).
2. Create an issue describing the change if one doesn’t exist already.
3. Work in a dedicated branch, keeping commits focused and logically grouped.
4. Run local checks (lint, tests, type checks) before pushing. The CI workflow mirrors these commands where available.
5. Open a pull request using the provided template. Reference related issues and add screenshots for UI changes.
6. Request review from the CODEOWNERS and address feedback promptly.

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) to make changelog generation easier. Examples:

* `feat: add wishlist geofencing controls`
* `fix: prevent duplicate buyer onboarding emails`
* `docs: capture Azure maps decision`

## Pull request checklist

Before requesting a review, ensure that:

- [ ] The change is covered by an issue with acceptance criteria.
- [ ] Tests, linters, and type checkers pass locally (where applicable).
- [ ] Documentation, ADRs, and screenshots are updated.
- [ ] You have added or updated relevant labels and milestones.
- [ ] Security-sensitive changes have been reviewed with the platform/security lead.

## Community and support

* For help or pairing, reach out in the `#realestate-reach-dev` Slack channel.
* Security vulnerabilities should be reported via the process in [SECURITY.md](SECURITY.md).
* Questions about roadmap or priorities can be raised during weekly product syncs or posted in GitHub Discussions (when enabled).

Welcome aboard!
