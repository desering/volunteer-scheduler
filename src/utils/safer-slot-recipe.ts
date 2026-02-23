import type { SlotRecipeConfig } from "@pandacss/dev";
import type {
  SlotRecipeConfig as CodegenSlotRecipeConfig,
  SlotRecipeVariantRecord,
} from "styled-system/types";

export function defineSaferSlotRecipe<
  S extends string = string,
  T extends SlotRecipeVariantRecord<S> = SlotRecipeVariantRecord<S>,
>(config: CodegenSlotRecipeConfig<S, T>): SlotRecipeConfig {
  return config as SlotRecipeConfig;
}
