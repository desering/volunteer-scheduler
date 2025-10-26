import Link from "next/link";
import { Container } from "styled-system/jsx";
import { panda } from "styled-system/jsx/factory";
import { ThemeSwitchButton } from "@/components/theme-switch-button";
import { getUser } from "@/lib/services/get-user";
import { Button } from "./ui/button";

export default async function NavBar() {
  const { user } = await getUser();

  return (
    <Container marginTop="4" width="100%">
      <panda.nav display="flex" justifyContent="space-between">
        <panda.div display="flex" gap="4">
          <Button asChild variant="outline">
            <Link href="/">Shifts</Link>
          </Button>
          {/* {user?.roles?.includes("admin") && (

            <a href="/admin" className={button({ variant: "outline" })}>
              Manage Shifts
            </a>
          )} */}
        </panda.div>

        <panda.div display="flex" gap="4">
          <ThemeSwitchButton />
          {user ? (
            <Button asChild variant="solid">
              <Link href="/account">{user.preferredName}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button asChild variant="solid">
                <Link href="/auth/register">Become a volunteer</Link>
              </Button>
            </>
          )}
        </panda.div>
      </panda.nav>
    </Container>
  );
}
