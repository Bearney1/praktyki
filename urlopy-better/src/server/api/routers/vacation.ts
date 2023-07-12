import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
export const vacationRouter = createTRPCRouter({
    // hello: publicProcedure
    //   .input(z.object({ text: z.string() }))
    //   .query(({ input }) => {
    //     return {
    //       greeting: `Hello ${input.text}`,
    //     };
    //   }),
  
    // getAll: publicProcedure.query(({ ctx }) => {
    //   return ctx.prisma.example.findMany();
    // }),
  
    // getSecretMessage: protectedProcedure.query(() => {
    //   return "you can now see this secret message!";
    // }),
    getAllForUser: protectedProcedure.input(z.object({projectId:z.string()})).query(async ({ ctx, input }) => {
        if (input.projectId === "") {
            const r = await ctx.prisma.vacation.findMany({
                where: {
                    user: {
                        id: ctx.session.user.id
                    }
                },
                orderBy: {
                    startDate: "desc"
                }
            });
            return r;
        }
        
        const r = await ctx.prisma.vacation.findMany({
            where: {
                user: {
                    id: ctx.session.user.id
                },
                project: {
                    id: input.projectId
                }
            },
            orderBy: {
                startDate: "desc"
            }
        });
        return r;
   
    }),
    getAllProjects: protectedProcedure.query(async ({ ctx }) => {
        const r = await ctx.prisma.project.findMany({
            where: {
                users: {
                    some: {
                        id: ctx.session.user.id
                    }
                }
            }
        });
        return r;
    }),

    createVacation: protectedProcedure.input(z.object({
        startDate: z.date(),
        endDate: z.date(),
        reason: z.string(),
        workingType: z.enum(["remote", "office"]),
        projectId: z.string()
    })).mutation(
        async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: userId
                }
            });
            if (!user) {
                throw new Error("User not found");
            }
            const project = await ctx.prisma.project.findFirst({
                where: {
                    id: input.projectId,
                }});

            const r = await ctx.prisma.vacation.create({
                data: {
                    startDate: input.startDate,
                    endDate: input.endDate,
                    reason: input.reason,
                    workingType: input.workingType,
                    user: {
                        connect: {
                            id: userId
                        }
                    },
                    project: {
                        connect: {
                            id: project?.id
                        }
                    }
                }
            });

            return r;
        }
    ),
    checkIfUserBelongsToAnyProject: protectedProcedure.query(async ({ ctx }) => {
        const r = await ctx.prisma.project.findFirst({
            where: {
                users: {
                    some: {
                        id: ctx.session.user.id
                    }
                }
            }
        });
        return r !== null;
    }
    ),
  });
  