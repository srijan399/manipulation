import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import Reddit from "next-auth/providers/reddit";

const {
    GOOGLE_ID,
    GOOGLE_SECRET,
    GITHUB_ID,
    GITHUB_SECRET,
    REDDIT_ID,
    REDDIT_SECRET,
} = process.env;

if (
    !GOOGLE_ID ||
    !GOOGLE_SECRET ||
    !GITHUB_ID ||
    !GITHUB_SECRET ||
    !REDDIT_ID ||
    !REDDIT_SECRET
) {
    throw new Error(
        "Google ID and Secret must be provided in environment variables."
    );
}

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: GOOGLE_ID,
            clientSecret: GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Github({
            clientId: GITHUB_ID,
            clientSecret: GITHUB_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Reddit({
            clientId: REDDIT_ID,
            clientSecret: REDDIT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    debug: true,
    // callbacks: {
    //     async jwt({ token, user }) {
    //         if (user) {
    //             token.id = user.id;
    //         }
    //         return token;
    //     },
    //     async session({ session, token }) {
    //         session.user.id = token.id; // Add ID to session
    //         return session;
    //     },
    // },
});

export { handler as GET, handler as POST };
