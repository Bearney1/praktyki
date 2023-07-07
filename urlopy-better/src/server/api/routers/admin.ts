import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
//   hello: publicProcedure
//     .input(z.object({ text: z.string() }))
//     .query(({ input }) => {
//       return {
//         greeting: `Hello ${input.text}`,
//       };
//     }),

//   getAll: publicProcedure.query(({ ctx }) => {
//     return ctx.prisma.example.findMany();
//   }),

//   getSecretMessage: protectedProcedure.query(() => {
//     return "you can now see this secret message!";
//   }),
getAllProjects: protectedProcedure.input(z.object({q:z.string()})).query(async ({ctx, input}) => {
    if (!input.q) {
    const projects = await ctx.prisma.project.findMany();
    return projects;
    }
    const projects = await ctx.prisma.project.findMany({
        where: {
            name: {
                contains: input.q,
                mode: "insensitive",
            },
        },
    });
    return projects;            
  }),
});
