import { inngest } from "./client";
import {Sandbox} from "@e2b/code-interpreter"
import { createAgent, openai } from "@inngest/agent-kit";
import { getSandbox } from "./utils";




export const helloWorld = inngest.createFunction(
 { id: "hello-world" },
 { event: "test/hello.world" },
 async ({ event, step }) => {
  //getting sanbox id for the template we created
  const sanboxID= await step.run("get-sandbox-id", async ()=>{
    const sandbox=await Sandbox.create("lovable-clone-nextjs-test2");
    return sandbox.sandboxId;
  });
  
   const codeAgent = createAgent({
 name: 'Code Agent',
 system: "You are an expert Next.js developer. You write readable, mainainable code. You write simple Next.js and React snippets",
 model: openai({model:'gpt-3.5-turbo'}), // Use GPT-4 for higher quality output
});
const { output } = await codeAgent.run(
 `write the following snippet: ${event.data.value}`,
);
console.log(output);

//getting sandbox url to run the code
const sandboxURL=await step.run("get-sandbox-url", async ()=>{
  const sandbox= await getSandbox(sanboxID);
  const host= sandbox.getHost(3000); //creates a port under the host 3000
  return `https://${host}`;
});
    return { output, sandboxURL  };
 },
);
