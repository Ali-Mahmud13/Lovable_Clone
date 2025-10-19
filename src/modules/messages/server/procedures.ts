import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { prisma } from "@/lib/database";
import { inngest } from "@/inngest/client";

export const messagesRouter = createTRPCRouter({
  // Define your procedures here
  getMany: baseProcedure.query(async () => {
        const messages= await (prisma as any).message.findMany({
            orderBy:{
                updatedAt: "desc"
            }
        });
        return messages;
    
  }),
  create: baseProcedure.input(z.object({
    value: z.string().min(1,{message: "Message is required"}),


  }))
  .mutation(async ({ input }) => {
    const createdMessage = await (prisma as any).message.create({
      data: {
        content: input.value,
        role: "USER",
        type: "RESULT",
      },
  })
  await inngest.send({
    name: "code-agent/run",
    data: {
        value: input.value
    }
    });
    return createdMessage;

    }),
    
});

