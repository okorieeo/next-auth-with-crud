import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text", placeholder: "jsmith@company.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }
        // Add logic here to look up the user from the credentials supplied
        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        const user = await res.json();
        
        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },

    async session({ session, token }) {
      session.user = token as any;
      return session;
    },
  },
});

export { handler as GET, handler as POST };



// import NextAuth from 'next-auth';
// import GithubProvider from 'next-auth/providers/github';
// import GoogleProvider from 'next-auth/providers/google';
// import Credentials from 'next-auth/providers/credentials';
// import { compare } from 'bcrypt';
// import { PrismaAdapter } from '@next-auth/prisma-adapter';
// import prismadb from '@/lib/db';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient()
// export const authOptions = {
//   providers: [
//     GithubProvider({
//       clientId: process.env.GITHUB_ID || '',
//       clientSecret: process.env.GITHUB_SECRET || '',
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID || '',
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
//     }),
//     Credentials({
//       id: 'credentials',
//       name: 'Credentials',
//       credentials: {
//         email: {
//           label: 'Email',
//           type: 'text',
//           placeholder: 'johndoe@company.com',
//         },
//         password: {
//           label: 'Password',
//           type: 'passord',
//           placeholder: 'your password',
//         }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error('Email and password required');
//         }

//         const user = await prismadb.user.findUnique({ where: {
//           email: credentials.email
//         }});

//         if (!user || !user.password) {
//           throw new Error('Email does not exist');
//         }

//         if(!user.active){
//           throw new Error('user account not activated')
//         }

//         const isCorrectPassword = await compare(credentials.password, user.password);

//         if (!isCorrectPassword) {
//           throw new Error('Incorrect password');
//         }

//         return user;
//       }
//     })
//   ],
//   pages: {
//     signIn: '/sign-in'
//   },
//   debug: process.env.NODE_ENV === 'development',
// //   adapter: PrismaAdapter(prismadb),
//   adapter: PrismaAdapter(prismadb),
//   session: { strategy: 'jwt' },
//   jwt: {
//     secret: process.env.NEXTAUTH_JWT_SECRET,
//   },
//   secret: process.env.NEXTAUTH_SECRET
// };

// export default NextAuth(authOptions);
