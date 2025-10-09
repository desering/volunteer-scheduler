import { ThemeSwitchButton } from "@/components/theme-switch-button";
import { useAuth } from "@/providers/auth";
import { Container } from "styled-system/jsx";
import { panda } from "styled-system/jsx/factory";
import { button } from "styled-system/recipes/button";

export default async function NavBar() {
  const { user } = useAuth();

  return (
    <Container marginTop="4">
      <panda.nav display="flex" justifyContent="space-between">
        <panda.div display="flex" gap="4">
          <a href="/" className={button({ variant: "outline" })}>
            Shifts
          </a>
          {user?.roles?.includes("admin") && (
            <a href="/admin" className={button({ variant: "outline" })}>
              Manage Shifts
            </a>
          )}
        </panda.div>

        <panda.div display="flex" gap="4">
          <ThemeSwitchButton />
          {user ? (
            <>
              <a
                href="/account/my-events"
                className={button({ variant: "outline" })}
              >
                My Shifts
              </a>
              <a href="/account" className={button({ variant: "solid" })}>
                {user.preferredName}
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
          )}
        </panda.div>
      </panda.nav>
    </Container>
  );
}
