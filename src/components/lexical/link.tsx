import type { LinkFields } from "@payloadcms/richtext-lexical";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { css } from "styled-system/css";

type CustomLinkComponentProps = {
  children: ReactNode;
  fields: LinkFields;
};

export const CustomLinkComponent = ({
  children,
  fields,
}: CustomLinkComponentProps) => {
  const href = fields.linkType === "custom" ? fields.url : fields.doc?.value;

  if (!href) {
    return <>{children}</>;
  }

  const isExternal =
    fields.linkType === "custom" &&
    (fields.url?.startsWith("http://") || fields.url?.startsWith("https://"));

  const linkClassName = css({
    textDecoration: "underline",
  });

  if (isExternal) {
    return (
      <a
        href={href}
        className={linkClassName}
        target={fields.newTab ? "_blank" : undefined}
        rel={fields.newTab ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink
      href={href as string}
      className={linkClassName}
      target={fields.newTab ? "_blank" : undefined}
    >
      {children}
    </NextLink>
  );
};
