import { panda } from "styled-system/jsx/factory";
import { button } from "styled-system/recipes/button";
import { ThemeSwitchButton } from "../../packages/astro/src/components/theme-switch-button";
import { Container } from "styled-system/jsx";

export default function NavBar() {
  return (
    <Container marginTop="4">
      <panda.nav display="flex" justifyContent="space-between">
        <panda.div display="flex" gap="4">
          <a href="/packages/astro/public" className={button({ variant: "outline" })}>Shifts</a>

          {
            Astro.locals.user?.roles?.includes("admin") && (
              <a href="/admin" className={button({ variant: "outline" })}>
                Manage Shifts
              </a>
            )
          }
        </panda.div>

        <panda.div display="flex" gap="4">
          <ThemeSwitchButton />
          {
            Astro.locals.user ? (
              <>
                <a href="/account/my-events" className={button({ variant: "outline" })}>
                  My Shifts
                </a>
                <a href="/account" className={button({ variant: "solid" })}>
                  {Astro.locals.user.preferredName}
                </a>
              </>
            ) : (
              <>
                <a href="/auth/login" className={button({ variant: "outline" })}>
                  Login
                </a>
                <a href="/auth/register" className={button({ variant: "solid" })}>
                  Register
                </a>
              </>
            )
          }
        </panda.div>
      </panda.nav>
    </Container>
  );
}
