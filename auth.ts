// import NextAuth from "next-auth"
// import GitHub from "next-auth/providers/github"
// import Google from "next-auth/providers/google"
// import { client } from "./sanity/lib/client";
// import { writeClient } from "./sanity/lib/write-client";
// import { AUTHOR_BY_GITHUB_ID_QUERY } from "./sanity/lib/queries";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [
//     GitHub,
//     Google
//   ],
//   callbacks: {
//     async signIn({ user: { name, email, image }, account, profile: { id, login, bio } }) {
//       const existingUser = await client.withConfig({ useCdn: false }).fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id });

//       if(!existingUser) {
//         await writeClient.create({
//           _type: "author",
//           id: id,
//           name: name,
//           username: login,
//           email: email,
//           image: image,
//           bio: bio || "",
//         });
//       }

//       return true;
//     },

//     async jwt({ token, account, profile }) {
//       if(account && profile) {
//         const user = await client.withConfig({useCdn: false}).fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id: profile?.id });

//         token.id = user?._id;
//       }

//       return token;
//     },

//     async session({ session, token }) {
//       Object.assign(session, { id: token.id });
//       return session;
//     }
//   }
// })

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { client } from "./sanity/lib/client";
import { writeClient } from "./sanity/lib/write-client";
import { AUTHOR_BY_GITHUB_ID_QUERY } from "./sanity/lib/queries";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      let id = profile?.id;
      let username = profile?.login;
      let bio = profile?.bio || "";

      if (account.provider === "google") {
        id = profile?.sub;
        username = profile?.email?.split("@")[0];
        bio = profile?.locale || "";
      }

      const provider = account.provider;

      const existingUser = await client
        .withConfig({ useCdn: false })
        .fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id });

      const now = new Date().toISOString();

      if (!existingUser) {
        await writeClient.create({
          _type: "author",
          id,
          provider,
          name: user.name,
          username,
          email: user.email,
          image: user.image,
          bio,
          lastLogin: now,
        });
      } else {
        try {
          await writeClient
            .patch(existingUser._id)
            .set({ lastLogin: now })
            .commit();
        } catch (error) {
          if (error instanceof Error) {
            console.error("Failed to update last login:", error.message);
          } else {
            console.error("Failed to update last login:", error);
          }
        }
      }

      return true;
    },

    async jwt({ token, account, profile }) {
      if (account && profile) {
        const id = account.provider === "google" ? profile.sub : profile.id;
        const user = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id });
        token.id = user?._id;
        token.username = user?.username;
      }

      return token;
    },

    async session({ session, token }) {
      Object.assign(session, {
        id: token.id,
        username: token.username,
      });
      return session;
    },
  },
});
