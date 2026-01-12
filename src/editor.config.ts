import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const editor = lexicalEditor({
  features: ({ defaultFeatures }) =>
    defaultFeatures.map((feature) => {
      if (feature.key === "link") {
        return {
          ...feature,
          props: {
            ...feature.props,
            Component: "@/components/lexical/link#CustomLinkComponent",
          },
        };
      }
      return feature;
    }),
});
