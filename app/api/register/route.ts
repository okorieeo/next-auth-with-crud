import { prismadb } from "@/lib/db";
import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import activationEmail from "@/app/emails/activationEmail"; 
import { sendEmail } from "@/lib/email"
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { z } from "zod";

// const pass = z.custom<`${number}pass`>((val) => {
//   const one = '^(?=.*[A-Za-z])(?=.*d)(?=.*[@$!%*#?&])[A-Za-zd@$!%*#?&]{8,}$'
//   const two = '^[0-9a-fA-F]{24}$'
//   const three =  `${one}${two}`
//   return /^\d+px$/.test(val as string);
// });
// for validation npm i zod
const userSchema = z
.object({
    email: z.string().min(1, 'Email is required').email('Invalid Email'),
    firstName: z.string().min(1, 'first name is required'),
    lastName: z.string().min(1, 'last name is required'),
    password: z
    .string()
    .min(8, "Must be at least 8 characters in length")
    // .refine((value) => /^(?=.*[A-Za-z])(?=.*d)(?=.*[@$!%*#?&])[A-Za-zd@$!%*#?&]{8,}[0-9a-fA-F]{24}$/.test(value), 'Name should contain only alphabets')
    // .refine((value) => /^[0-9a-fA-F]{24}$/.test(value), 'Please enter both firstname and lastname')
    // .regex(new RegExp("^(?=.*[A-Za-z])(?=.*d)(?=.*[@$!%*#?&])[A-Za-zd@$!%*#?&]{8,}$"))
    // .regex(new RegExp("^[0-9a-fA-F]{24}$"))
    
})
export const POST = async (req: Request) => {

    try{
        const body = await req.json();
        const { email, password, firstName, lastName } = userSchema.parse(body);

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
        const domain = process.env.NEXTAUTH_URL
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