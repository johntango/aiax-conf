import type { PrismaClient } from "@prisma/client";

export const createRepositories = (prisma: PrismaClient) => {
  const interest = {
    create: async (data: { name: string; email: string; affiliation?: string; notes?: string }) => {
      return prisma.interest.create({ data });
    },
    listAll: async () => prisma.interest.findMany({ orderBy: { createdAt: "desc" } })
  } as const;

  const attendees = {
    create: async (data: { name: string; email: string; affiliation?: string }) => {
      return prisma.attendee.create({ data });
    },
    linkCheckout: async (id: string, sessionId: string) => {
      return prisma.attendee.update({ where: { id }, data: { stripeSessionId: sessionId } });
    },
    markPaid: async (id: string, paymentIntentId: string | null) => {
      return prisma.attendee.update({ where: { id }, data: { status: "PAID", stripePaymentIntentId: paymentIntentId ?? undefined } });
    },
    listAll: async () => prisma.attendee.findMany({ orderBy: { createdAt: "desc" } })
  } as const;

  return { interest, attendees } as const;
};
