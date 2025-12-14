# Contributing to `volunteer-scheduler`

Below you'll find a set of guidelines for how to contribute to
`volunteer-scheduler`.

## Did you find a bug or do you want to request a feature?

Please first have a look at our project board and check if a similar issue
already exists:
* https://github.com/orgs/desering/projects/2/views/1

If not, then you're welcome to create a new issue in the leftmost "New" column.

We regularly check for new issues, to plan and prioritise upcoming work. If your
issue is particularly important, please feel free to give us a poke on
[WhatsApp/Tech Circle](https://chat.whatsapp.com/Itp0i2AWFxGEOLg0N83cHZ) or
[Mattermost/Tech Circle](https://mattermost.desering.org/de-sering/channels/tech-circle).

## Picking up an issue

If you want to work on an issue, please have a look at the "Ready" column of our
project board:
* https://github.com/orgs/desering/projects/2/views/1

Signal that you are picking up a specific issue by moving it to the "In
Progress" column and adding yourself as an assignee.

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

Since trunk-based development uses short-lived feature-branches, branch names
are not that important - we do not use it to inform any of our workflows or
automations. Simply make use of branch names to make your life as a developer
easier:

* Include the number of the issue you are working on. GitHub can then suggest
  linking related issues when you submit a PR.
* Include a short description of the work done.

Here are some example branch names: `123-past-events`, `69-instrumentation`,
`420-email-templates`, `999-fix-calendar-render-bug`

**Conventional commits**

If your PR contains a clean commit history following
[conventional commits](https://www.conventionalcommits.org/en/v1.0.0/), then
your changes can be rebased onto the `main` branch. Otherwise, we are going to
squash your changes and write a fitting commit message ourselves to ensure that
the commit history of the `main` branch is clean.

**Pull Requests**

If your PR is related to an issue, then link the issue in your PR description.
You can use "Fixes #123", "Closes #45" or "Resolves #222" to automatically close
the issue after your PR is merged.

Each PR is automatically deployed to a preview environment - watch out for a
comment on your PR mentioning `volunteer-scheduler-preview`. Use this deployment
to inspect and test your changes in a "live" environment.

Requirements:

1. All automated checks must pass.
2. If your code change affects the UI or UX of the application, then it must be
   tested on mobile.
3. Your PR needs to be reviewed and approved by one of the project maintainers.

Currently, maintainers are:

* [spaaacetoast](https://github.com/spaaacetoast)
* [baer95](https://github.com/baer95)

After your PR is merged, a new version of the `volunteer-scheduler` including
your changes will automatically be built and deployed to
https://schedule.desering.org/. This should take no more than 5 minutes.
