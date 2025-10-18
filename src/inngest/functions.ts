import { inngest } from "./client";
import {Sandbox} from "@e2b/code-interpreter"
import { createAgent, openai, createTool, createNetwork, Agent } from "@inngest/agent-kit";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import { PROMPT } from "@/prompt";



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
 description:"An expert coding agent",
 system: PROMPT,
 model: openai({model:'gpt-4.1',
  defaultParameters:{ temperature:0.1}
 }), // Use GPT-4 for higher quality output
 tools: [
  createTool({
    name: "terminal",
    description: "Use the terminal to run commands",
    parameters: z.object({
      command: z.string()
    }),
    handler: async ({command}, {step}) => {
      return await step?.run("terminal",async ()=>{ //we used question mark because step can be undefined
        const buffers={stdout:"", stderr:""};
        try{
          const sandbox= await getSandbox(sanboxID);
          const result= await sandbox.commands.run(command, {onStdout:(data: string)=>{
            buffers.stdout+=data;
          }
          , onStderr:(data: string)=>{
            buffers.stderr+=data;
          }});
          return result.stdout;
        }
        catch(e){
          console.error(`Command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`);
          return `Command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;

        }
      }) 
    }
   }),
  createTool({
    name:"CreateOrUpdateFiles",
    description:"Create or update files in the code interpreter sandbox",
    parameters:z.object({
      files:z.array(z.object({
        path:z.string(),
        content:z.string()
      }),
      ),
    }),
    handler: async ({files}, {step,network})=>{
      const newFiles=await step?.run("CreateOrUpdateFiles", async ()=>{
        try{
          const updatedFiles= network.state.data.files || {};
          const sandbox= await getSandbox(sanboxID);
          for (const file of files){
            await sandbox.files.write(file.path, file.content);
            updatedFiles[file.path]=file.content;
          }
          return updatedFiles;
        }
        catch(e){
          return "Error: "+ e;
        }
      });
      if(typeof newFiles==="object"){
        network.state.data.files=newFiles;
      }
    }

  }),
createTool({
  name:"readFiles",
  description:"Read files from the code interpreter sandbox",
  parameters:z.object({
    files:z.array(z.string()),
  }),
  handler: async({files},{step})=>{
    return await step?.run("readFiles",  async ()=>{
      try{

        const sandbox= await getSandbox(sanboxID);
        const contents=[];
        for (const file of files){
          const content= await sandbox.files.read(file);
          contents.push({path:file, content});
        }
        return JSON.stringify(contents);

      }catch(e){
        return "Error: "+ e;
      }
    })
  }
})
],
lifecycle: {onResponse: async({result,network})=>{
  const lastAssistantMessageText=lastAssistantTextMessageContent(result);
  
  if(lastAssistantMessageText && network){
    if(lastAssistantMessageText.includes("<task_summary>")){
      network.state.data.summary=lastAssistantMessageText;
    }

  }
  return result;

}}

});
const network=createNetwork({
  name: "coding-agent-network",
  agents: [codeAgent],
  maxIter: 15, //limit how may loops agent can do
  router: async ({network})=>{
    const summary=network.state.data.summary;

    if (summary){
      return;
    }
    return codeAgent
  },

});
const result= await network.run(event.data.value);

//getting sandbox url to run the code
const sandboxURL=await step.run("get-sandbox-url", async ()=>{
  const sandbox= await getSandbox(sanboxID);
  const host= sandbox.getHost(3000); //creates a port under the host 3000
  return `https://${host}`;

});
    return { 
       url: sandboxURL,
      title: "Fragment",
    files: result.state.data.files,
  summary: result.state.data.summary
};
 },
);
