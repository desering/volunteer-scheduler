import config from "@payload-config";
import { type Payload, getPayload as _getPayload } from "payload";

let _payload: Payload | undefined = undefined;

export const getPayload = async (): Promise<Payload> => {
	if (_payload !== undefined) return _payload;

	_payload = await _getPayload({ config });
	return _payload;
};
