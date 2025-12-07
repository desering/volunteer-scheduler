import {
  CalendarDaysIcon,
  CalendarSyncIcon,
  CircleUserRoundIcon,
  History,
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

export const NavBar = async () => {
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
                    <Menu.Item asChild value="account">
                      <Link href="/account">
                        <HStack gap="2">
                          <CircleUserRoundIcon />
                          Account
                        </HStack>
                      </Link>
                    </Menu.Item>
                    <Menu.Item asChild value="my-shifts">
                      <Link href="/account/my-events">
                        <HStack gap="2">
                          <CalendarDaysIcon />
                          My Shifts
                        </HStack>
                      </Link>
                    </Menu.Item>
                    <Menu.Item asChild value="past-shifts">
                      <Link href="/account/past-events">
                        <HStack gap="2">
                          <History />
                          Past Shifts
                        </HStack>
                      </Link>
                    </Menu.Item>
                    {user?.roles?.includes("admin") && (
                      <Menu.Item asChild value="manage-shifts">
                        <Link href="/admin">
                          <HStack gap="2">
                            <CalendarSyncIcon />
                            Manage Shifts
                          </HStack>
                        </Link>
                      </Menu.Item>
                    )}
                    <Menu.Item value="sign-out" onClick={signOut}>
                      <HStack gap="2">
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
};
