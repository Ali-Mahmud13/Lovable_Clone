import { inngest } from "./client";
import { createAgent, openai } from '@inngest/agent-kit';




export const helloWorld = inngest.createFunction(
 { id: "hello-world" },
 { event: "test/hello.world" },
 async ({ event, step }) => {
  
   const codeAgent = createAgent({
 name: 'Code Agent',
 system: "You are an expert Next.js developer. You write readable, mainainable code. You write simple Next.js and React snippets",
 model: openai({model:'gpt-3.5-turbo'}), // Use GPT-4 for higher quality output
});
const { output } = await codeAgent.run(
 `write the following snippet: ${event.data.value}`,
);
console.log(output);
// [{ role: 'assistant', content: 'function removeUnecessaryWhitespace(...' }]


    return { output };
 },
);
