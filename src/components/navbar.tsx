import { panda } from "styled-system/jsx/factory";
import { button } from "styled-system/recipes/button";
import { ThemeSwitchButton } from "./theme-switch-button";
import { Container } from "styled-system/jsx";

export default function NavBar({ user }) {
  return (
      <Container marginTop="4">
        <panda.nav display="flex" justifyContent="space-between">
          <panda.div display="flex" gap="4">
            <a href="/public" className={button({ variant: "outline" })}>Shifts</a>

            {
                user?.roles?.includes("admin") && (
                    <a href="/admin" className={button({ variant: "outline" })}>
                      Manage Shifts
                    </a>
                )
            }
          </panda.div>

          <panda.div display="flex" gap="4">
            <ThemeSwitchButton />

            {
              user ? (
                  <>
                    <a href="/src/app/(scheduler)/account/my-events" className={button({ variant: "outline" })}>
                      My Shifts
                    </a>
                    <a href="/src/app/(scheduler)/account" className={button({ variant: "solid" })}>
                      {user.preferredName}
                    </a>
                  </>
              ) : (
                  <>
                    <a href="/src/app/(scheduler)/auth/login" className={button({ variant: "outline" })}>
                      Login
                    </a>
                    <a href="/src/app/(scheduler)/auth/register" className={button({ variant: "solid" })}>
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
