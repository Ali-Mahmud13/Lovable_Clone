import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {

    //imagine this is a download or some other long running task
    await step.sleep("wait-a-moment", "10s");

    //imagine this is a transcription or some other long running task
    await step.sleep("wait-a-moment", "10s");

    await step.sleep("wait-a-moment", "5s");
    return { message: `Hello ${event.data.email}!` };
  },
);