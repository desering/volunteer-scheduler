# Contributing to `volunteer-scheduler`

Below you'll find a set of guidelines for how to contribute to
`volunteer-scheduler`.

## Did you find a bug or do you want to request a feature?

Please first have a look at our project board and check if a similar issue
already exists:
* https://github.com/orgs/desering/projects/2/views/1

If not, then you're welcome to create a new issue in the leftmost "New" column.

## How issues are refined and prioritized

We regularly look through the column of new issues, to plan and prioritize
upcoming work. If your issue is particularly important, please feel free to give
us a poke on
[WhatsApp/Tech Circle](https://chat.whatsapp.com/Itp0i2AWFxGEOLg0N83cHZ) or
[Mattermost/Tech Circle](https://mattermost.desering.org/de-sering/channels/tech-circle).

## Picking up an issue

If you want to work on an issue, please have a look at the "Ready to be picked
up" column of our project board:
* https://github.com/orgs/desering/projects/2/views/1

Signal that you are picking up a specific issue by moving it to the "In
progress" column and adding yourself as an assignee.

Have a look at
[Get started with development](README.md#how-to-get-started-with-development)
to set up your local dev environment.

## Conventions

**Trunk-based development**

We use [trunk-based development](https://trunkbaseddevelopment.com/) to
collaborate effectively and enable Continuous Integration and Continuous
Delivery practices (CI/CD). Try to submit PRs with small, self-contained and
easily reviewable change sets - for example, implement sending emails and
generating iCalendar events in two separate PRs instead of combining them into
one. This way, a feature can be done quicker, and you can celebrate a success
for one thing without having to wait for the other thing to be done and fully
worked out.

**Branch names**

Use branch names to make your life as a developer easier:
* Include the number of the issue you are working on. GitHub can then suggest
  linking related issues when you submit a PR.
* Include a short description of the work done.

Here are some example branch names: `123-past-events`, `69-instrumentation`,
`420-email-templates`, `999-fix-calendar-render-bug`

We do not use branch names in any of our workflows or automations.

**Conventional commits**

If your PR contains a clean commit history following
[conventional commits](https://www.conventionalcommits.org/en/v1.0.0/), then
your changes can be rebased onto the `main` branch. Otherwise, we are going to
squash your changes and write a fitting commit message ourselves to ensure that
the commit history of the `main` branch is clean.

## Pull Requests

Open a draft pull request first, and only mark it as "Ready for review" after
you are confident that your feature is done to the best of your knowledge and
all items in the pull request template are checked.

Opening a non-draft pull-request or marking a pull request as "Ready for review"
automatically requests reviews from maintainers, so please be careful with using
that until you are sure.

Always link the issue your PR is related to in your PR description. If you
submit a PR that is not based on an issue in our project board, we might not be
able to accept your contribution - creating an issue beforehand to confirm
requirements and implementation details with us beforehand is a good way to
ensure that your time and effort is not wasted. You can use "Fixes #123",
"Closes #45" or "Resolves #222" to automatically close the issue after your PR
is merged.

Each PR is automatically deployed to a preview environment - watch out for a
comment on your PR mentioning `volunteer-scheduler-preview`. Use this deployment
to inspect and test your changes in a "live" environment.

## Requirements

**Generally**

1. All automated checks must pass.

2. If you are submitting changes to the UI/UX (`*.tsx` files), please also
   consult our [Frontend guidelines](Frontend%20guidelines.md) document and then
   request a review from the `desering/frontend-reviewers` group.

3. Your PR needs to be reviewed and approved by one of the project maintainers.

Currently, maintainers are:

* [spaaacetoast](https://github.com/spaaacetoast)
    * Focus: frontend, UI, UX
    * Expect a review within 1 week or by Sunday
* [baer95](https://github.com/baer95)
    * Focus: backend, automation, deployments
    * Expect a review within a few days

The final decision about accepting a contribution lies with the maintainers, and
fulfilling all requirements does not guarantee that your change will be merged.

That said, if your PR is complete, we are probably going to accept it (we're not
monsters :)).

After your PR is merged, a new version of the `volunteer-scheduler` including
your changes will automatically be built and deployed to
https://schedule.desering.org/. This should take no more than 5 minutes.
