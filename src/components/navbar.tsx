import { panda } from "styled-system/jsx/factory";
import { button } from "styled-system/recipes/button";
import { ThemeSwitchButton } from "@/components/theme-switch-button";
import { Container } from "styled-system/jsx";
import { headers as getHeaders } from "next/headers";
import config from "@payload-config";
import { getPayload } from "payload";
import { HydrateClientUser } from "./hydrate-client-user";

export default async function NavBar() {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  return (
    <Container marginTop="4">
      <HydrateClientUser user={user ?? undefined} />
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
