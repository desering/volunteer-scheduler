---
import { actions } from "astro:actions";
import Layout from "../layout.astro";
import NavBar from "../../../components/navbar.astro";
import { Container, Flex, panda } from "../../../../styled-system/jsx";
import { button } from "../../../../styled-system/recipes/button";

if (!Astro.locals.user) {
  return Astro.redirect("/auth/login");
}

const events = await Astro.callAction(
  actions.getUpcomingEventsForCurrentUser,
  {},
);
---

<Layout title="Volunteering Schedule">
  <NavBar />

  <Container marginTop={{ base: 4, xl: 20 }} marginBottom="4">
    <panda.h1 fontSize="xl" fontWeight="medium" marginBottom={3}>My account details</panda.h1>

    <panda.p marginBottom={3}>Name: {Astro.locals.user.preferredName}</>
    <panda.p marginBottom={3}>Email: {Astro.locals.user.email}</>
    <panda.p marginBottom={3}>Phone Number: {Astro.locals.user.phoneNumber}</>

    <panda.p marginBottom={3}>
      To change your data, please talk to a shift coordinator or someone from the admin team of De Sering.
    </panda.p>

    <Flex flexDir="column" gap="10">
      <a href="/src/app/(scheduler)/auth/logout" class={button({ size: "lg", variant: "outline" })}>
        Logout
      </a>
    </Flex>
  </Container>
</Layout>
