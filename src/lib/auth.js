import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("recipehub");

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000/",
  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(db, {
    client
  }),

  emailAndPassword: { 
    enabled: true, 
  },

  socialProviders: {
    google: { 
      clientId: process.env.GOOGLE_CLIENT_ID, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "user",
        required: false,
        input: true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: user.role || "user",
            },
          };
        },
      },
    },
  },

  /* session: {
    cookieName: "token",
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60
    },
  }, */

  /* plugins: [
    jwt({
      jwt: {
        expirationTime: "7d",
      },
      schema: {
        jwks: {
          tableName: "jwks",
        },
      },
    })
  ], */
});