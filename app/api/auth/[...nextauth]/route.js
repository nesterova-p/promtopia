import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google"
import {connectToDatabase} from "@utils/database";
import User from "@models/user";
import {signIn} from "next-auth/react";

/*
console.log({
    clientId: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
})
*/

const handler = NextAuth({
    providers: [GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
    ],
    async session({session}) {
        const sessionUser = await User.findOne({
            email: session.user.email,
        })
        session.user.id = sessionUser._id.toString();

        return session;
    },
    async signIn({profile}){
        try{
            await connectToDatabase();

            // check if user already exists
            const userExist = await User.findOne({email: profile.email});
            // if not - create a new user
            if(!userExist) {
                await User.create({
                    email: profile.email,
                    username: profile.username.replace(" ", "").toLowerCase(),
                    imaege: profile.picture
                })
            }
            return true;
        }
        catch(error){
            console.log(error);
            return false;
        }
    }

})

export {handler as GET, handler as POST};