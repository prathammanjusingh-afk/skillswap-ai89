import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/?tab=dashboard";

  if (code) {
    const cookieStore = cookies();
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dylunnfzciikfsgdtobi.supabase.co";
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_gulb45Kp4KL9PEae27PWig_SeyCXCsf";

    // Build the target destination URL
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";
    let targetUrl = `${requestUrl.origin}${next}`;
    if (!isLocalEnv && forwardedHost) {
      targetUrl = `https://${forwardedHost}${next}`;
    }

    const response = NextResponse.redirect(targetUrl);

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          } catch {
            // Handled safely in Server Component / route handler
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
            response.cookies.set({ name, value: "", ...options });
          } catch {
            // Handled safely in Server Component / route handler
          }
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    } else {
      console.error("[OAuth Callback] Code exchange error:", error.message);
      return NextResponse.redirect(
        `${requestUrl.origin}/?auth_error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // If code exchange failed or wasn't provided, redirect back to home with an auth error notice
  return NextResponse.redirect(
    `${requestUrl.origin}/?auth_error=oauth_exchange_failed`
  );
}
