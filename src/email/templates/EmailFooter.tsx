import {
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Tailwind,
} from "@react-email/components";

export const EmailFooter = () => {
  return (
    <Tailwind>
      <Section className="my-[40px] px-[32px]">
        <Row>
          <Column colSpan={4}>
            <Text className="my-[8px] font-semibold text-[16px] text-gray-900 leading-[24px]">
              De Sering
            </Text>
            <Text className="mt-[4px] mb-[0px] text-[16px] text-gray-500 leading-[24px]">
              Where Community Grows Through Food
            </Text>
          </Column>
          <Column align="right" className="table-cell align-bottom">
            <Row className="table-cell h-[44px] w-[56px] align-bottom">
              <Column className="pr-[8px]">
                <Link href="https://www.facebook.com/DeSeringAmsterdam/">
                  <Img
                    alt="Facebook"
                    height="36"
                    src="https://react.email/static/facebook-logo.png"
                    width="36"
                  />
                </Link>
              </Column>
              <Column>
                <Link href="https://www.instagram.com/de_sering/">
                  <Img
                    alt="Instagram"
                    height="36"
                    src="https://react.email/static/instagram-logo.png"
                    width="36"
                  />
                </Link>
              </Column>
            </Row>
            <Row>
              <Text className="my-[8px] font-semibold text-[16px] text-gray-500 leading-[24px]">
                Rhoneweg 6, 1043 AH Amsterdam
              </Text>
              <Text className="mt-[4px] mb-[0px] font-semibold text-[16px] text-gray-500 leading-[24px]">
                info@desering.org
              </Text>
            </Row>
          </Column>
        </Row>
      </Section>
    </Tailwind>
  );
};
