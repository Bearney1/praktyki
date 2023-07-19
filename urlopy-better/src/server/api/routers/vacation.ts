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
    getAllForUser: protectedProcedure.query(async ({ ctx }) => {
      const r = await ctx.prisma.vacation.findMany({
        where: {
            user: {
                id: ctx.session.user.id
            }
        },
        distinct: ["startDate", "endDate", "reason", "workingType"],

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
            const project = await ctx.prisma.project.findMany({
                where: {
                    users: {
                        some: {
                            id: userId
                        }
                    }
                }});
            if (!project) {
                throw new Error("Project not found");
            }
            for (let i = 0; i < project.length; i++) {
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
                                id: project[i]!.id
                            }
                        }
                    }
                });
            }
            // const r = await ctx.prisma.vacation.create({
            //     data: {
            //         startDate: input.startDate,
            //         endDate: input.endDate,
            //         reason: input.reason,
            //         workingType: input.workingType,
            //         user: {
            //             connect: {
            //                 id: userId
            //             }
            //         },
            //         project: {
            //             connect: {

            //         }
            //     }
            // });

            // return r;
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
        id: z.string(),
        day: z.date(),
        sortBy: z.enum(["Type", "StartDate", "EndDate", "Name", "None"]),
        sortType: z.enum(["asc", "desc"])
      })).query(async ({ ctx, input }) => {
       
        const today = input.day
       
        
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
          },
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
        if (input.sortBy === "Type") {
          if (input.sortType === "asc") {
            allUsersForToday.sort((a, b) => {
              if (a.Type && b.Type) {
                return a.Type.localeCompare(b.Type);
              }
              if (a.Type && !b.Type) {
                return -1;
              }
              if (!a.Type && b.Type) {
                return 1;
              }
              return 0;
            });
          }
          if (input.sortType === "desc") {
            allUsersForToday.sort((a, b) => {
              if (a.Type && b.Type) {
                return b.Type.localeCompare(a.Type);
              }
              if (a.Type && !b.Type) {
                return 1;
              }
              if (!a.Type && b.Type) {
                return -1;
              }
              return 0;
            });
          }
        }
        if (input.sortBy === "StartDate") {
          if (input.sortType === "asc") {
            allUsersForToday.sort((a, b) => {
              if (a.startDate && b.startDate) {
                return a.startDate.getTime() - b.startDate.getTime();
              }
              if (a.startDate && !b.startDate) {
                return -1;
              }
              if (!a.startDate && b.startDate) {
                return 1;
              }
              return 0;
            });
          }
          if (input.sortType === "desc") {
            allUsersForToday.sort((a, b) => {
              if (a.startDate && b.startDate) {
                return b.startDate.getTime() - a.startDate.getTime();
              }
              if (a.startDate && !b.startDate) {
                return 1;
              }
              if (!a.startDate && b.startDate) {
                return -1;
              }
              return 0;
            });
          }
        }
        if (input.sortBy === "EndDate") {
          if (input.sortType === "asc") {
            allUsersForToday.sort((a, b) => {
              if (a.endDate && b.endDate) {
                return a.endDate.getTime() - b.endDate.getTime();
              }
              if (a.endDate && !b.endDate) {
                return -1;
              }
              if (!a.endDate && b.endDate) {
                return 1;
              }
              return 0;
            });
          }
          if (input.sortType === "desc") {
            allUsersForToday.sort((a, b) => {
              if (a.endDate && b.endDate) {
                return b.endDate.getTime() - a.endDate.getTime();
              }
              if (a.endDate && !b.endDate) {
                return 1;
              }
              if (!a.endDate && b.endDate) {
                return -1;
              }
              return 0;
            });
          }
        }
        if (input.sortBy === "Name") {
          if (input.sortType === "asc") {
            allUsersForToday.sort((a, b) => {
              if (a.name && b.name) {
                return a.name.localeCompare(b.name);
              }
              if (a.name && !b.name) {
                return -1;
              }
              if (!a.name && b.name) {
                return 1;
              }
              return 0;
            });
          }
          if (input.sortType === "desc") {
            allUsersForToday.sort((a, b) => {
              if (a.name && b.name) {
                return b.name.localeCompare(a.name);
              }
              if (a.name && !b.name) {
                return 1;
              }
              if (!a.name && b.name) {
                return -1;
              }
              return 0;
            });
          }
        }



        return allUsersForToday;
    
      }
      ),
      getAllCountAndOnVacationCount: protectedProcedure.input(z.object({
        id: z.string(),
        day: z.date()
      })).query(async ({ ctx, input }) => {
        interface Count {
          online: number;
          onVacation: number;
        }
        const today = input.day;
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
  