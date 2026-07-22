// convex/auth.config.ts
// Clerk JWT issuer configuration for Convex.
//
// IMPORTANT: You must set CLERK_JWT_ISSUER_DOMAIN as an environment variable
// in the Convex Dashboard → Settings → Environment Variables.
//
// Value: https://clerk.resumeflow.harshithkumar.in
//
// This tells Convex how to validate incoming Clerk JWTs.

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
