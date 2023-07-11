import { VacationStatus } from "@prisma/client";
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
    workingType: z.enum(["remote", "office"]),
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
    const project = await ctx.prisma.project.findUnique({
      where: {
        id: input.id
      },
      include: {
        users: true
      }
    });
    return project;
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
});
