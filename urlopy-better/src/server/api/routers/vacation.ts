import { z } from "zod";
import { MyVacation } from "~/pages/vacations/vacations";
import {
  createTRPCRouter,
  publicProcedure,
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
            userId: ctx.session.user.id
            }
        });
        r.map((v) => {
            const vacation : MyVacation = {
                id: v.id,
                startDate: v.startDate,
                endDate: v.endDate,
                status: v.status,
            }
            return vacation;
        });
        return r;
        
    })
  });
  