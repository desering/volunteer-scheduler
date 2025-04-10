import {
  consolidateHTMLConverters,
  convertLexicalToHTML as convert,
  defaultEditorConfig,
  defaultEditorFeatures,
  HTMLConverterFeature,
  sanitizeServerEditorConfig,
} from "@payloadcms/richtext-lexical";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";
import config from "@payload-config";

export const convertLexicalToHTML = async (
  data: SerializedEditorState<SerializedLexicalNode>,
) => {
  const editorConfig = defaultEditorConfig;
  editorConfig.features = [...defaultEditorFeatures, HTMLConverterFeature({})];

  const sanitizedEditorConfig = await sanitizeServerEditorConfig(
    editorConfig,
    await config,
  );

  return await convert({
    converters: consolidateHTMLConverters({
      editorConfig: sanitizedEditorConfig,
    }),
    data,
  });
};
