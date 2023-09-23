import { NextResponse } from 'next/server'
import { prismadb } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const GET =async (req:Request, res: Response) => {
    try{
        const posts = await prismadb.post.findMany();
        // if (posts.length === 0) {
        //     return new NextResponse("posts not found", { status: 404 });
        // }
        return NextResponse.json({ message: "ok", posts }, { status: 200 })
    } catch (error){
        return NextResponse.json({ message: "An error occured", error}.error, {status:500})
    }
};

export const POST = async (req: Request, res: Response) => {
    // const session = await getServerSession(authOptions)
    try{
        const body = await req.json();
        const { title, content, published } = body;

        const post = await prismadb.post.create({
           data:{ 
            title,
            content, 
            published,
            authorId: '452a7b1f-e1b2-4b3a-9655-5a87decec886'
           }
        })
        return NextResponse.json({ message: 'post created', post}, {status: 201})
    }catch (error){
        return NextResponse.json({ message: "An error occured", error}.error, {status:500})
    }
}