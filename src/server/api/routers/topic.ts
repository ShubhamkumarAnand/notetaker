import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const topicRouter = createTRPCRouter({
	getAll: protectedProcedure.query(({ ctx }) => {
		return ctx.prisma.topic.findMany({
			where: {
				userId: ctx.session.user.id,
			},
		});
	}),
	create: protectedProcedure
		.input(z.object({ title: z.string() }))
		.mutation(({ ctx, input }) => {
			return ctx.prisma.topic.create({
				data: {
					title: input.title,
					userId: ctx.session.user.id,
				},
			});
		}),
});
