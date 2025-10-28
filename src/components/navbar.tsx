import {
  CalendarDaysIcon,
  CalendarSyncIcon,
  CircleUserRoundIcon,
  LogOutIcon,
  MenuIcon,
} from "lucide-react";
import Link from "next/link";
import { Container, HStack, panda } from "styled-system/jsx";
import { signOut } from "@/actions/auth/sign-out";
import { ThemeSwitchButton } from "@/components/theme-switch-button";
import { getUser } from "@/lib/services/get-user";
import { Button } from "./ui/button";
import { Menu } from "./ui/menu";

export default async function NavBar() {
  const { user } = await getUser();

  return (
    <Container marginTop="4" width="100%">
      <panda.nav display="flex" justifyContent="space-between">
        <panda.div display="flex" gap="4">
          <Button asChild variant="outline">
            <Link href="/">Shifts</Link>
          </Button>
        </panda.div>

        <panda.div display="flex" gap="4">
          <ThemeSwitchButton />
          {user ? (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button asChild variant="solid">
                  <HStack gap="2">
                    <MenuIcon />
                    {user.preferredName}
                  </HStack>
                </Button>
              </Menu.Trigger>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.ItemGroup>
                    <Menu.Item value="account">
                      <HStack gap="2">
                        <CircleUserRoundIcon />
                        <Link href="/account">Account</Link>
                      </HStack>
                    </Menu.Item>
                    <Menu.Item value="my-shifts">
                      <HStack gap="2">
                        <CalendarDaysIcon />
                        <Link href="/account/my-events">My Shifts</Link>
                      </HStack>
                    </Menu.Item>
                    {user?.roles?.includes("admin") && (
                      <Menu.Item value="manage-shifts">
                        <HStack gap="2">
                          <CalendarSyncIcon />
                          <Link href="/admin">Manage Shifts</Link>
                        </HStack>
                      </Menu.Item>
                    )}
                    <Menu.Item value="sign-out">
                      <HStack gap="2" onClick={signOut}>
                        <LogOutIcon />
                        Sign out
                      </HStack>
                    </Menu.Item>
                  </Menu.ItemGroup>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
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
