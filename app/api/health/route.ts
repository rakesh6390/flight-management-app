import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Example Route Handler using the server Supabase client.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({
    ok: true,
    authenticated: !!user,
  });
}
