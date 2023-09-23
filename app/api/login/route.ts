import { prismadb } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signJwtAccessToken } from "@/lib/jwt";


export const POST = async (req: Request) => {

    try{
        const body = await req.json();
        const { email, password } = (body);

        const user = await prismadb.user.findUnique({
           where: {
            email: email
           } 
        })

        // if(!user?.email || !( await bcrypt.compare(password, user.password ))){
        //     return NextResponse.json({ message: 'Invalid credentials'}, {status: 400})

        // }


        if(!user?.emailVerified){
          return NextResponse.json({ message: 'user account not verified'}, {status: 400})
        }

        if(user && ( await bcrypt.compare(password, user.password ))){
            const { password, ...userWithoutPass } = user;
            const accessToken = signJwtAccessToken(userWithoutPass);
            console.log(accessToken)
            const result = {
            ...userWithoutPass,
            accessToken,
            };
            return new Response(JSON.stringify(result))
            // return NextResponse.json({ message: 'User found with valid credentials'}, {status: 200})

        } else return new Response(JSON.stringify(null))

        // if (exist){
        //     return NextResponse.json({ message: 'User already exist'}, {status: 400})
        // }


        return NextResponse.json({ message: 'user account created' }, {status: 201})
    }catch (error){
        return NextResponse.json({ message: "An error occured", error}.error, {status:500})
    }
}