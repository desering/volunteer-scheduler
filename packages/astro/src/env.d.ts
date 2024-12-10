/// <reference path="../.astro/types.d.ts" />
/// <reference path="../../shared/payload-types.ts" />
/// <reference types="astro/client" />

import type { Payload } from "payload";
import type { User } from "../../shared/payload-types";
import type { SvgAttributes, SvgProperties } from "styled-system/types/csstype";
import type { JSX } from "solid-js";

declare global {
	namespace App {
		interface Locals {
			user?: User;
			payload: Payload;
		}
	}
}

// https://github.com/unplugin/unplugin-icons/issues/253
declare module "icons:solid/*" {
	import type { ComponentProps, JSX } from "solid-js";

	const component: (props: ComponentProps<"svg">) => JSX.Element;
	export default component;
}

declare module "icons:astro/*" {
	const component: (
		props: astroHTML.JSX.SVGAttributes,
	) => astroHTML.JSX.Element;
	export default component;
}
