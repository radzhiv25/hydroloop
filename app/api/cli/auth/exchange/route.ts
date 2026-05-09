import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { token?: string } | null;
    const token = body?.token?.trim();
    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const tokenHash = sha256(token);
    const admin = getSupabaseAdminClient();

    const { data: row, error: selectError } = await admin
      .from("cli_connect_tokens")
      .select("token_hash, access_token, refresh_token, expires_at, used_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }
    if (!row) {
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });
    }
    if (row.used_at) {
      return NextResponse.json({ error: "Token already used." }, { status: 401 });
    }
    if (new Date(row.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Token expired." }, { status: 401 });
    }

    const { error: updateError } = await admin
      .from("cli_connect_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token_hash", tokenHash)
      .is("used_at", null);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Server missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session: {
        access_token: row.access_token,
        refresh_token: row.refresh_token,
      },
      supabaseUrl,
      supabaseAnonKey,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
