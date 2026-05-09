import { randomBytes, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = `hl_cli_${randomBytes(24).toString("base64url")}`;
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const admin = getSupabaseAdminClient();
    const { error: insertError } = await admin.from("cli_connect_tokens").insert({
      token_hash: tokenHash,
      user_id: session.user.id,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: expiresAt,
    });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message || "Failed to create token" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      token,
      expiresAt,
      expiresInSeconds: 600,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
