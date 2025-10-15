import { NextResponse } from "next/server";

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  OAuthSignin: "There was a problem with the OAuth sign in.",
  OAuthCallback: "Error during OAuth callback. Try again later.",
  OAuthCreateAccount: "Could not create your account via OAuth.",
  EmailSignin: "Email sign in failed.",
  default: "An unknown error occurred. Please try again.",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const errorCode = searchParams.get("error") ?? "default";

  return NextResponse.json(
    { success: false, message: errorMessages[errorCode] },
    { status: 400 }
  );
}
