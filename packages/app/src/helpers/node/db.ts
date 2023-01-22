import { PrismaClient } from '@prisma/client'
import * as process from "process";

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const db =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
        errorFormat: process.env.NODE_ENV === "production" ? 'minimal' : 'pretty',
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db