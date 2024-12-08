/// <reference path="../../shared/payload-types.ts" />

import type { Payload } from "payload";
import type { User } from "../../shared/payload-types";
declare global {
	namespace App {
		interface Locals {
			user?: User;
			payload: Payload;
		}
	}
}
