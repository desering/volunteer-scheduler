import type { DefaultNodeTypes } from "@payloadcms/richtext-lexical";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import NextLink from "next/link";
import { css } from "styled-system/css";

const linkClassName = css({
  textDecoration: "underline",
});

export const linkConverters: JSXConvertersFunction<DefaultNodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  link: ({ node, nodesToJSX }) => {
    const fields = node.fields;
    const children = nodesToJSX({ nodes: node.children });

    const getHref = (): string | undefined => {
      if (fields.linkType === "custom") {
        return fields.url ?? undefined;
      }
      const docValue = fields.doc?.value;
      if (typeof docValue === "string") {
        return docValue;
      }
      if (typeof docValue === "number") {
        return String(docValue);
      }
      if (docValue && typeof docValue === "object" && "slug" in docValue) {
        return String(docValue.slug);
      }
      return undefined;
    };

    const href = getHref();

    if (!href) {
      return <>{children}</>;
    }

    const isExternal =
      fields.linkType === "custom" &&
      (fields.url?.startsWith("http://") || fields.url?.startsWith("https://"));

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
        href={href}
        className={linkClassName}
        target={fields.newTab ? "_blank" : undefined}
      >
        {children}
      </NextLink>
    );
  },
});
