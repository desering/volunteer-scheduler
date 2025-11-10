# Dependabot

This document explains how we review, merge and deploy dependency update PRs
opened by [Dependabot](https://docs.github.com/en/code-security/getting-started/dependabot-quickstart-guide).

The Dependabot configuration file is located at
[`.github/dependabot.yml`](../.github/dependabot.yml).

## Introduction

_Skip this section if you are familiar with the challenges of releasing and
updating software._

Each dependency upgrade holds an inherent risk of breaking something that might
have gone unnoticed. The challenge is to find a balance between fully testing
every upgrade before deploying it, and simply deploying any upgrade without
testing it. Luckily, there are a few ways to introduce nuance to this spectrum.

A very common approach to software release versioning is called
[Semantic Versioning (semver)](https://semver.org/), which uses the following
format:

```
vMAJOR.MINOR.PATCH
```

* Breaking changes / incompatible changes are released as `MAJOR` increments.
* Additional functionality that is backwards compatible is released as `MINOR` increments.
* Backwards compatible bug fixes are released as `PATCH` increments.

This means that, **ideally**, `PATCH` and `MINOR` version upgrades should always
work without any code changes.

> [!IMPORTANT]  
> Releases are created by humans, and we all make mistakes. Sometimes, software
> maintainers accidentally release code changes as `MINOR` or `PATCH` versions
> that end up containing a breaking change, or people might consider different
> things breaking changes.

Also, not all software maintainers follow the `semver` approach. In those cases,
the rules above do not apply. However, experience and comon sense can help here:
For example, if a dependency that is used in backend server communication
introduces a problem (e.g. `@tanstack/react-query` or `@payloadcms/db-postgres`),
the impact is much higher than if a dependency used for visual effects breaks
(e.g. `lucide-react` or `canvas-confetti`). With that in mind, merging a `MINOR`
upgrade of the one might be risky, whereas it is probably acceptable to do so
for the other.

## Why we care about dependency updates

Keeping a project's dependencies up to date is good practice:

* Newer versions include performance, stability and reliability improvements
* Known vulnerabilities are fixed through security patches
* Access to new features and APIs
* Reduced technical debt and version drift leads to easier long-term maintenance and upgrades
* Improved developer experience and documentation quality

## Guidelines

We consider the following packages "high risk" and therefore require manual
local testing for any upgrades to those dependencies:
1. `next`
2. The `payload` package family
3. Any change/PR that includes type and/or schema changes

Any `MAJOR` upgrades must be locally tested before approving and merging them.

`MINOR` and `PATCH` updates can be approved and merged after carefully reviewing
the changelog and determining that there is no impact on how we use the
dependency.

If any update ends up requiring additional code changes to make the update
compatible, an approving review from another maintainer is required.

Any upgrades to `devDependencies` can be merged without local testing as long as
the build and all checks are green.
