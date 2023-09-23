import { NextResponse } from 'next/server'
import { prismadb } from '@/lib/db';
import { verifyJwt } from "@/lib/jwt";
import { getSession } from "next-auth/client"

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
  const accessToken = req.headers.get("authorization");
  console.log(res.headers)
    if (!accessToken || !verifyJwt(accessToken)) {
        return new Response(
        JSON.stringify({
            error: "unauthorized",
        }),
        {
            status: 401,
        }
        );
    }
    const session = await getSession({ req })
    console.log(session)
    try{
        const body = await req.json();
        const { title, content, published } = body;

        const post = await prismadb.post.create({
           data:{ 
            title,
            content, 
            published,
            authorId: '95441eda-29c3-43a5-8300-f28d10dee79b'
           }
        })
        return NextResponse.json({ message: 'post created', post}, {status: 201})
    }catch (error){
        return NextResponse.json({ message: "An error occured", error}.error, {status:500})
    }
}