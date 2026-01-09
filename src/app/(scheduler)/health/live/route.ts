// https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/
export const GET = async () => {
  return Response.json({ status: "ok" });
};
