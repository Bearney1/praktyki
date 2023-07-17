import { User, VacationStatus } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
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
  getAllProjects: protectedProcedure
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
  getAllInfoProject: protectedProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    if (ctx.session.user.role !== "admin") {
      throw new Error("You are not admin");
    }
    const project = await ctx.prisma.project.findUnique({
      where: {
        id: input.id
      },
      include: {
        vacation:{
          orderBy: {
            createdAt: "desc"
          },
          include:{
            user: true
          }
        }
      }
    });
    return project;
  }
  ),
  updateStatus: protectedProcedure.input(z.object({
    id: z.string(),
    status: z.enum([VacationStatus.approved, VacationStatus.rejected, VacationStatus.pending, VacationStatus.new])
  })).mutation(async ({ ctx, input }) => {
    if (ctx.session.user.role !== "admin") {
      throw new Error("You are not admin");
    }
    const vacation = await ctx.prisma.vacation.update({
      where: {
        id: input.id
      },
      data: {
        status: input.status as VacationStatus
      }
    });
    return vacation;
  }),
  createVacation: protectedProcedure.input(z.object({
    startDate: z.date(),
    endDate: z.date(),
    reason: z.string(),
    workingType: z.enum(["remote", "vacation"]),
    userId: z.string(),
    projectId: z.string()
  })).mutation(
    async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new Error("You are not admin");
      }
      const r = await ctx.prisma.vacation.create({
        data: {
          startDate: input.startDate,
          endDate: input.endDate,
          reason: input.reason,
          workingType: input.workingType,
          user: {
            connect: {
              id: input.userId
            }
          },
          project: {
            connect: {
              id: input.projectId
            }
          }
        }
      });
      return r;
    }
  ),
  getUsersForProject: protectedProcedure.input(z.object({
    id: z.string()
  })).query(async ({ ctx, input }) => {
    if (ctx.session.user.role !== "admin") {
      throw new Error("You are not admin");
    }
    const v = await ctx.prisma.vacation.findMany({
      where: {
        projectId: input.id
      },
      include: {
        user: true
      }
    });
    return v;
  }
  ),
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "admin") {
      throw new Error("You are not admin");
    }
    const users = await ctx.prisma.user.findMany({
      include: {
        Project: true
      }
    });
    return users;
  }),
  changeUserRole: protectedProcedure.input(z.object({
    id: z.string(),
    role: z.enum(["admin", "user"])
  })).mutation(async ({ ctx, input }) => {
    if (ctx.session.user.role !== "admin") {
      throw new Error("You are not admin");
    }
    const user = await ctx.prisma.user.update({
      where: {
        id: input.id
      },
      data: {
        role: input.role
      }
    });
    return user;
  }
  ),
  updateProjectsForUser: protectedProcedure.input(z.object({
    id: z.string(),
    projects: z.array(z.string())
  })).mutation(async ({ ctx, input }) => {
    if (ctx.session.user.role !== "admin") {
      throw new Error("You are not admin");
    }
    const user = await ctx.prisma.user.update({
      where: {
        id: input.id
      },
      data: {
        Project: {
          set: input.projects.map((id) => ({
            id
          }))
        }
      },
      include: {
        Project: true
      }
    });

    return user;
  }),
  createProject: protectedProcedure.input(z.object({
    name: z.string(),
  })).mutation(async ({ ctx, input }) => {
    if (ctx.session.user.role !== "admin") {
      throw new Error("You are not admin");
    }
    const project = await ctx.prisma.project.create({
      data: {
        name: input.name
      }
    });
    return project;
  }
  ),
  getUsersForPojectAndCheckIfTheyAreInVacation: protectedProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
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
    // const usersNotInVacation = users.filter((user) => !usersInVacation.includes(user.id));
    // return usersNotInVacation;
    enum Status {
      vacation = "vacation",
      working = "working"
    }
    interface UserInVacation {
      id: string;
      name: string;
      avatar: string | null;
      status: Status;
    }
    let usersNotInVacation: UserInVacation[] = [];
    for (let i = 0; i < users.length; i++) {
      if (!usersInVacation.includes(users[i]!.id)) {
        usersNotInVacation = [...usersNotInVacation, {
          id: users[i]?.id,
          name: users[i]?.name,
          avatar: users[i]?.image,
          status: Status.working
        } as UserInVacation];
      } else {
        usersNotInVacation = [...usersNotInVacation, {
          id: users[i]?.id,
          name: users[i]?.name,
          avatar: users[i]?.image,
          status: Status.vacation
        } as UserInVacation];
      }
    }
    return usersNotInVacation;
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
});
