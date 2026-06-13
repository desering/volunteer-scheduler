export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node");
  }

  const Pyroscope = require("@pyroscope/nodejs");

  Pyroscope.init({
    serverAddress: "http://localhost:4040",
    appName: "volunteer-scheduler",
    // Enable CPU time collection for wall profiles
    // This is required for CPU profiling functionality
    wall: {
      collectCpuTime: true,
    },
  });

  Pyroscope.start();
}
