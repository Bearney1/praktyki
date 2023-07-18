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
        workingType: z.enum(["remote", "vacation"]),
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




    // from admin
getAllProjectsF: protectedProcedure
    .input(z.object({ q: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new Error("You are not admin");
      }
      if (!input.q) {
        const projects = await ctx.prisma.project.findMany(
          {
            include: {
              users: true,
            },
          }
        );
        return projects;
      }
      const projects = await ctx.prisma.project.findMany({
        where: {
          name: {
            contains: input.q,
            mode: "insensitive",
          },
        },
        include: {
          users: true,
        },
      });
      return projects;
    }),
    getUsersForProjectForToday: protectedProcedure.input(z.object({
        id: z.string()
      })).query(async ({ ctx, input }) => {
        if (ctx.session.user.role !== "admin") {
          throw new Error("You are not admin");
        }
        const today = new Date();
        const v = await ctx.prisma.vacation.findMany({
          where: {
            projectId: input.id,
            startDate: {
              lte: today
            },
            endDate: {
              gte: today
            }
          },
          include: {
            user: true
          }
        });
        const allUsers = await ctx.prisma.project.findUnique({
          where: {
            id: input.id
          },
          include: {
            users: true
          }
        });
       
        interface UserInVacation {
          id: string;
          name: string;
          avatar: string | null;
          startDate: Date | null;
          endDate: Date | null;
          Type: string | null;
        }
        let usersInVacation: UserInVacation[] = [];
        for (let i = 0; i < v.length; i++) {
          usersInVacation = [...usersInVacation, {
            id: v[i]?.user?.id,
            name: v[i]?.user?.name,
            avatar: v[i]?.user?.image,
            startDate: v[i]?.startDate,
            endDate: v[i]?.endDate,
            Type: v[i]?.workingType
          } as UserInVacation];
        }
        const usersNotInVacation = allUsers!.users.filter((user) => !usersInVacation.map((user) => user.id).includes(user.id));
        let usersNotInVacationWithStatus: UserInVacation[] = [];
        for (let i = 0; i < usersNotInVacation.length; i++) {
          usersNotInVacationWithStatus = [...usersNotInVacationWithStatus, {
            id: usersNotInVacation[i]?.id,
            name: usersNotInVacation[i]?.name,
            avatar: usersNotInVacation[i]?.image,
            startDate: null,
            endDate: null,
            Type: "office",
          } as UserInVacation];
        }
        const allUsersForToday = [...usersInVacation, ...usersNotInVacationWithStatus];
        return allUsersForToday;
    
      }
      ),
      getAllCountAndOnVacationCount: protectedProcedure.input(z.object({
        id: z.string(),
      })).query(async ({ ctx, input }) => {
        interface Count {
          online: number;
          onVacation: number;
        }
        const today = new Date();
        const project = await ctx.prisma.project.findUnique({
          where: {
            id: input.id
          },
          include: {
            users: true
          }
        });
        const users = project!.users;
        const vacations = await ctx.prisma.vacation.findMany({
          where: {
            startDate: {
              lte: today
            },
            endDate: {
              gte: today
            },
            projectId: input.id
          }
        });
        const usersInVacation = vacations.map((vacation) => vacation.userId);
        const usersNotInVacation = users.filter((user) => !usersInVacation.includes(user.id));
        const count: Count = {
          online: usersNotInVacation.length,
          onVacation: usersInVacation.length
        };
        return count;
      }),
  });
  