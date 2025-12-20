"use client";

import { Toaster as ArkToaster, Toast } from "@ark-ui/react/toast";
import { createStyleContext, panda } from "styled-system/jsx";
import { toast } from "styled-system/recipes";

const { withProvider, withContext } = createStyleContext(toast);

export const Root = withProvider(Toast.Root, "root");
export const Title = withContext(Toast.Title, "title");
export const Description = withContext(Toast.Description, "description");
export const ActionTrigger = withContext(Toast.ActionTrigger, "actionTrigger");
export const CloseTrigger = withContext(Toast.CloseTrigger, "closeTrigger");
export const Toaster = panda(ArkToaster);
