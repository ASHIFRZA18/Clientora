import { google } from "googleapis";

export const googleOAuthClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

export function getGoogleConsentUrl() {
  return googleOAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "consent",
  });
}

export async function getGoogleProfile(code: string) {
  const { tokens } = await googleOAuthClient.getToken(code);
  googleOAuthClient.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: googleOAuthClient });
  const { data } = await oauth2.userinfo.get();

  if (!data.email) {
    throw new Error("Google did not return an email address");
  }

  return {
    email: data.email,
    name: data.name ?? data.email.split("@")[0],
    googleId: data.id!,
  };
}