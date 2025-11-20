import { Container, panda } from "styled-system/jsx";
export const Footer = async () => {
  return (
    <Container marginBottom="4">
      <panda.nav display="flex" justifyContent="center">
        <panda.div display="flex" padding="10">
          made with &lt;3 by volunteers at de sering
        </panda.div>
      </panda.nav>
    </Container>
  );
};
