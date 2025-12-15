import { css } from "styled-system/css";
import { Container, panda } from "styled-system/jsx";

export const LayoutFooter = () => (
  <Container>
    <panda.footer display="flex" justifyContent="center">
      <panda.p paddingBlock="10" textAlign="center">
        Made with
        <panda.span
          aria-label="love"
          role="img"
          paddingInline="2"
          position="relative"
          insetBlockStart="1px"
        >
          &#10084;&#65039;
        </panda.span>
        by volunteers at De Sering &ndash;&nbsp;
        <panda.a
          href="https://wiki.desering.org/en/circles/tech"
          target="_blank"
          rel="noopener noreferrer"
          className={css({
            textDecoration: "underline",
            _hover: {
              color: "gray.11",
            },
          })}
        >
          Join the Tech Circle to help!
        </panda.a>
      </panda.p>
    </panda.footer>
  </Container>
);
