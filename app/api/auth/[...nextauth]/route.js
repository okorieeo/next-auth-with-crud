import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prismadb from '@/lib/db';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()
export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'johndoe@company.com',
        },
        password: {
          label: 'Password',
          type: 'passord',
          placeholder: 'your password',
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const user = await prismadb.user.findUnique({ where: {
          email: credentials.email
        }});

        if (!user || !user.password) {
          throw new Error('Email does not exist');
        }

        if(!user.active){
          throw new Error('user account not activated')
        }

        const isCorrectPassword = await compare(credentials.password, user.password);

        if (!isCorrectPassword) {
          throw new Error('Incorrect password');
        }

        return user;
      }
    })
  ],
//   pages: {
//     signIn: '/auth'
//   },
  debug: process.env.NODE_ENV === 'development',
//   adapter: PrismaAdapter(prismadb),
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);
