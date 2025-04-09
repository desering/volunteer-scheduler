import {
  consolidateHTMLConverters,
  convertLexicalToHTML as convert,
  defaultEditorConfig,
  defaultEditorFeatures,
  HTMLConverterFeature,
  sanitizeServerEditorConfig,
} from "@payloadcms/richtext-lexical";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { getPayloadInstance } from "./global-payload";

export const convertLexicalToHTML = async (
  data: SerializedEditorState<SerializedLexicalNode>,
) => {
  const editorConfig = defaultEditorConfig;
  editorConfig.features = [...defaultEditorFeatures, HTMLConverterFeature({})];
  const sanitizedEditorConfig = await sanitizeServerEditorConfig(
    editorConfig,
    (await getPayloadInstance()).config,
  );

  return await convert({
    converters: consolidateHTMLConverters({
      editorConfig: sanitizedEditorConfig,
    }),
    data,
  });
};
