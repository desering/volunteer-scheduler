import { getPayload } from "payload";
import payloadConfig from "@payload-config";

let payloadInstance: ReturnType<typeof getPayload> | null = null;

export const getPayloadInstance = () => {
  if (!payloadInstance) {
    payloadInstance = getPayload({ config: payloadConfig });
  }
  return payloadInstance;
};
