import { css } from "styled-system/css/css";
import { Container, HStack, panda } from "styled-system/jsx";
import { vstack } from "styled-system/patterns";
import { button } from "styled-system/recipes/button";
import { input } from "styled-system/recipes/input";
import { link } from "styled-system/recipes";
import {headers as getHeaders} from "next/dist/server/request/headers";
import {getPayload} from "payload";
import config from "@payload-config";
import {redirect} from "next/navigation";

export default async function Page() {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (user) {
    redirect("/");
  }

  const errors: string[] = [];

  return (
    <panda.div
      display="flex"
      minHeight="screen"
      width="screen"
      justifyContent="center"
      alignItems="center"
    >
      <Container>
        <form method="POST" className={vstack({alignItems: "stretch"})}>
          {
            errors.map((error) => (
              <panda.div
                className={css({
                  color: "gray.1",
                  backgroundColor: "tomato",
                  paddingX: "4",
                  paddingY: "2",
                })}
              >
                <panda.div>{error}</panda.div>
              </panda.div>
            ))
          }

          <panda.div width="full">
            <label htmlFor="preferredName">Preferred Name:</label>
            <input
              type="text"
              id="preferredName"
              name="preferredName"
              required
              className={input({
                size: "lg",
              })}
            />
            <p>This will be visible to everyone</p>
          </panda.div>

          <panda.div width="full">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className={input({
                size: "lg",
              })}
            />
          </panda.div>

          <panda.div width="full">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              required
              className={input({
                size: "lg",
              })}
            />
          </panda.div>

          <panda.div width="full">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className={input({
                size: "lg",
              })}
            />
          </panda.div>

          <panda.div width="full">
            <label htmlFor="password">Confirm Password:</label>
            <input
              type="password"
              id="password-again"
              name="password-again"
              required
              className={input({
                size: "lg",
              })}
            />
          </panda.div>

          <HStack>
            <a
              type="button"
              href="/"
              className={[
                button({size: "lg", variant: "outline"}),
                css({flexGrow: 1}),
              ]}
            >
              Cancel
            </a>
            <button
              type="submit"
              className={[
                button({size: "lg", variant: "solid"}),
                css({flexGrow: 1}),
              ]}
            >
              Register
            </button>
          </HStack>

          <div className={[css({textAlign: "center", marginY: '10px'})]}>
            Already have an account? <a href='/auth/login' className={[link()]}>Login</a>
          </div>
        </form>
      </Container>
    </panda.div>
  );
}
