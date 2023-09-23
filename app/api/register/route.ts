import { prismadb } from "@/lib/db";
import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import activationEmail from "@/app/emails/activationEmail"; 
import { sendEmail } from "@/lib/email"
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";



export const POST = async (req: Request) => {

    try{
        const body = await req.json();
        const { email, password, firstName, lastName } = body;

        if(!email || !password || !firstName || !lastName){
            return NextResponse.json({ message: 'Missing email or password or firstname'}, {status: 400})
        }

        const exist = await prismadb.user.findUnique({
           where: {
            email: email
           } 
        })

        if (exist){
            return NextResponse.json({ message: 'User already exist'}, {status: 400})
        }
        const hashedPassword = await bcrypt.hash(password, 12)


        const user = await prismadb.user.create({
           data:{ 
            email,
            password: hashedPassword, 
            firstName,
            lastName,
           }
        })
        const {password: newPassword, ...res} = user
        const token = await prismadb.verificationToken.create({
            data: {
                token: `${randomUUID()}${randomUUID()}`.replace(/-/g, ''),
                userId: user.id
            }
        })
        const domain = process.env.DOMAIN
        const url = `${domain}/activate/${token.token}`
        // const url = 'google.com'

        console.log(url)

        await sendEmail({
            to: email,
            subject: "Next auth authentication",
            html: render(activationEmail({url: url, name: 'emmanuel'})),
        });
        return NextResponse.json({ message: 'user account created', user: res }, {status: 201})
    }catch (error){
        return NextResponse.json({ message: "An error occured", error}.error, {status:500})
    }
}