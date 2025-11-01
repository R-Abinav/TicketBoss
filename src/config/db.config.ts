import { PrismaClient } from '@prisma/client';
import { ENV } from './env.config';

//Single instance for prisma
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || 
                        new PrismaClient({
                            log: ENV.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
                        });

if(ENV.NODE_ENV !== 'production'){
    globalForPrisma.prisma = prisma;
}

//Function to connect to DB
export async function connectDB(){
    try{
        await prisma.$connect();
        console.log("Database connected successfully!")
    }catch(err){
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

//Initial seed for the Db
export async function seedDB(){
    try{
        const existingEvent = await prisma.event.findUnique({
            where: {
                eventId: 'node-meetup-2025'
            }
        });

        if(!existingEvent){
            await prisma.event.create({
                data:{
                    eventId: 'node-meetup-2025',
                    name: 'Node.js Meet-Up',
                    totalSeats: 500,
                    availableSeats: 500,
                    version: 0
                }
            });

            console.log("Database Seeded Successfully!");
        }else{
            console.log("Event already exists -> Skipping initial seed!");
        }
    }catch(err){
        console.error("Error in seeding the DB: ", err);
    }
}

export async function disconnectDB(){
    await prisma.$disconnect();
}


