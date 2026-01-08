# Vision, Strategy and Roadmap

## Context

De Sering is scaling from a small, highly relational volunteer group (~100
people) to a much larger organization (1,000+ volunteers). The Scheduler
redesign is driven by this shift: the need for a structured system that supports
volunteer growth, empowerment, and long-term engagement. Informal tools like
WhatsApp groups, shared calendars, and manual follow-ups no longer provide the
visibility or continuity required at this level of complexity.

Existing coordination systems (e.g. TeamUp) focus primarily on filling shifts,
with limited insight into volunteer participation over time. Volunteers often
lack clarity on how to grow or take on greater responsibility, while
coordinators lack data on skills, training and engagement. This makes it
difficult to intentionally develop new coordinators and leaders as the community
expands.

The Scheduler aims to centralize shifts, trainings, events, and communication in
a single platform that supports both participation and progression. This
document provides shared context and direction to align contributors and guide
sustainable development as De Sering continues to evolve.

## Vision — Why & Where

> Vision Statement:
> To build an open, community-owned coordination system that enables volunteer
> organizations to scale sustainably.

The Volunteer Scheduler is an open, community-owned coordination system designed
to support volunteer organizations at scale. Its purpose is not only to
coordinate shifts, but to provide clear, durable structures for participation,
training, and leadership over time.

The system is designed to make opportunities and capacity visible. Volunteers
should be able to see shifts, trainings, events, and gatherings in one place,
understand how roles connect, and identify ways to deepen their involvement.
Coordinators should have an overview of skills, training, and engagement,
enabling more intentional planning and development.

The Scheduler is purpose-built for volunteer-driven organizations and
prioritizes transparency, customizability, and maintainability over generic
convenience. In the long term, it is intended to function as open-source
infrastructure that can be reused by other community organizations, while
supporting De Sering’s sustainability and independence.

## Strategy — How & What to Focus On

To support De Sering’s growth and realize the Scheduler’s vision, we are making
a small set of deliberate strategic choices about what to build, how to build
it, and what to prioritize.

**Custom-Built**

De Sering is building the Scheduler instead of using tools like Google Calendar
or Teamup, which are limited to basic scheduling. A custom system allows us to
support volunteer growth, model roles and trainings, and avoid pricing and
platform constraints as we scale.

**Focus on Growth and Visibility**

The Scheduler prioritizes clarity for both volunteers and coordinators.
Volunteers can easily discover shifts, trainings and events, while coordinators
gain visibility into participation, skills and capacity to support intentional
planning.

**Built for Contribution**

The Scheduler prioritizes contributor accessibility through widely used
technologies, clear ownership, and roadmap-aligned contributions.

**Open Source by Intent**

The Scheduler is designed to be open-sourced and reusable, guiding architectural
and scope decisions toward long-term shared infrastructure.

## Roadmap — When & In What Order

### 1. Tags & Filtering for Tags

1. Introduce a structured tagging system that allows admins to define and manage
   reusable tags and enables users to filter events using inclusion- and
   exclusion-based checkboxes. This improves event discoverability and supports
   consistent filtering across shifts, trainings, and other kinds of events.

### 2. Locations & Filtering for Locations

1. Introduce locations as a first-class concept, allowing admins to assign one
   or more locations to events and enabling users to filter events by location.
   This improves clarity around where events take place and lays the foundation
   for future location metadata such as addresses and maps.

### 3. Pinned Banner for Announcements

1. Provide admins with a clear, high-visibility way to communicate important
   announcements on the Scheduler landing page.

### 4. Skills

1. Provide a structured way for coordinators to understand, teach, and record
   what volunteers know how to do, without relying on personal memory.
2. Skills represent discrete, practical capabilities and are tracked as binary
   signals (learned / not learned).
3. Volunteers can learn skills automatically through training events or manually
   during volunteer shifts when a coordinator teaches a skill on the spot.
4. Each skill has a canonical skill page that acts as a teaching guide and can
   be viewed digitally or printed for use during shifts.
   Skills are internal coordination tools, not public achievements, and are
   designed to support consistent teaching, intentional task assignment, and
   volunteer development as Sering scales.

### TBD

**Querying the Volunteer Database**

* We need a way for admins/coordinators to be able to Query the volunteer database. It would be ideal if they could do it in various ways/degrees of complexity:
    * For every event, they can look at the volunteers who have signed up, and see volunteer data. Some questions we want to be able to answer:
        * How many experienced volunteers (>5 shifts) do we have for a given event?
        * Which volunteers have completed what trainings?
        * What trainings should we develop/plan for to unlock/unblock the next wave of volunteers?
        * What does our pipeline look like, from 1st shift/Onboarding to Returning volunteer to Experienced volunteer to Coordinator etc?
    * For a given shift, a coordinator should be able to look at the list of volunteers signed up, and get a quick snapshot of skills / experience w Sering. This way they can use that info to guide - so that volunteers can be given diff tasks they havent done before so they aren’t bored + they can learn new things. Coordinators can also pair newbies w someone more experienced etc even if they dont know those people intimately. They can also recommend them specific shifts or trainings to take in the future.
* Querying should help us unlock these use cases:
    * Show me "all volunteers that have done a Coordinator shift on Tuesdays in the last 3 months"
    * Show me "all volunteers who have done a Sunday Shift + Onboarding"
        * Then we can contact all of those via email/WhatsApp to Send an invitation to a get-together (during which we can hold the next level training for ‘advanced’ volunteers)
* Database vs. custom Roles Issue
    * Roles today are custom typed each time rather than a dropdown from a database. This limits us for the Querying.

**Full Calendar View Functionality**

* Today the Scheduler has a “Daily” view, but no option to view on a P1 Monthly basis (nor P1 Weekly, P1 Multi Day)

**Special Event**

* Ability to give a simplified overview of an event (E.g. participation vs helping out) that isn’t overwhelming
* Shifts within an Event
