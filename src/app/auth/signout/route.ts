import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseConfig, isDemoMode } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!isDemoMode() && hasSupabaseConfig()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
