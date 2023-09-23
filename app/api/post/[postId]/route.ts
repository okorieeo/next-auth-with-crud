import { prismadb } from "@/lib/db";
import { NextResponse } from "next/server";

export const GET =async (req:Request, { params }: { params: {postId: string }}) => {
    try {
        const  { postId } = params
        const post = await prismadb.post.findUnique({
           where: {
            id: postId
           } 
        })

        if(!post){
            return NextResponse.json(
            {message: "Ops post not found"},
            {status: 404}
        )
        }
        return NextResponse.json({message: 'Ok', post }, { status: 200 })
     
    }catch (error){
        return NextResponse.json({ message: "An error occured", error}.error, {status:500})
    }
};

export const PATCH = async (req: Request, { params }: { params: {postId: string }}) => {
    try {
        const body = await req.json();
        const {title, content, published} = body;
        const  { postId } = params

       const post = await prismadb.post.findUnique({
           where: {
            id: postId
           } 
        })

        if(!post){
            return NextResponse.json(
            {message: "Ops post not found"},
            {status: 404}
        )
        }
        const updatedPost = await prismadb.post.update({
           where: {
            id: postId
           },
           data: {
                title,
                content,
                published
            } 
        })


        return NextResponse.json({message: 'post updated successfully', updatedPost }, { status: 200 })
     
    }catch (error){
        return NextResponse.json({ message: "An error occured", error}.error, {status:500})
    }
};

export const DELETE = async (req: Request, { params }: { params: {postId: string }}) => {
    try {
        const  { postId } = params

       const post = await prismadb.post.findUnique({
           where: {
            id: postId
           } 
        })

        if(!post){
            return NextResponse.json(
            {message: "Ops post not found"},
            {status: 404}
        )
        }
        const updatedPost = await prismadb.post.delete({
           where: {
            id: postId
           },
        })

        return NextResponse.json({message: 'post deleted successfully', updatedPost }, { status: 200 })
     
    }catch (error){
        return NextResponse.json({ message: "An error occured", error}.error, {status:500})
    }
};