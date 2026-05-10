import chalk from "chalk";
import {
  clearRemoteSession,
  persistRemoteCredentials,
  hasStoredSession,
  isRemoteConfigured,
  getAuthedRemoteClient,
} from "../utils/supabase-remote.js";
import { getStore } from "../utils/storage.js";

export function authCommands(program) {
  const auth = program
    .command("auth")
    .description(
      "Optional cloud sign-in (offline local logs still work without this)"
    );

  auth
    .command("login")
    .description(
      "Sign in with a one-time token generated from the web app (Connect CLI)."
    )
    .requiredOption("-t, --token <token>", "One-time CLI connect token from the web app")
    .action(async (opts) => {
      const store = getStore();
      const token = String(opts.token ?? "").trim();
      if (!token) {
        console.error(chalk.red("Token is required. Use --token <value>."));
        process.exitCode = 1;
        return;
      }

      const apiBase = (
        process.env.HYDROLOOP_API_URL?.trim() ||
        "https://hydroloop-seven.vercel.app"
      ).replace(/\/+$/, "");

      const response = await fetch(`${apiBase}/api/cli/auth/exchange`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.session) {
        const message =
          payload?.error ||
          payload?.message ||
          `Token exchange failed (${response.status})`;
        console.error(chalk.red(message));
        process.exitCode = 1;
        return;
      }

      persistRemoteCredentials(store, {
        url: payload.supabaseUrl,
        anonKey: payload.supabaseAnonKey,
      });
      store.set("sb_access_token", payload.session.access_token);
      store.set("sb_refresh_token", payload.session.refresh_token);
      console.log(
        chalk.green("CLI connected. Queued logs will upload when you're online.") +
          chalk.dim("\nTip: hydroloop sync push — upload now")
      );
    });

  auth.command("logout").description("Clear saved cloud session").action(async () => {
    const store = getStore();
    if (hasStoredSession(store)) {
      const remote = await getAuthedRemoteClient(store);
      if (remote.ok) {
        await remote.supabase.auth.signOut();
      }
    }

    clearRemoteSession(store);
    console.log(chalk.dim("Cloud session cleared. Local hydration data untouched."));
  });

  auth.command("whoami").description("Show cloud session status").action(async () => {
    const store = getStore();

    if (!isRemoteConfigured(store)) {
      console.log(
        chalk.dim(
          "Remote not configured. Run hydroloop auth login --token <token> from web app settings."
        )
      );
      return;
    }

    if (!hasStoredSession(store)) {
      console.log(chalk.dim("Not signed in locally. hydroloop auth login --token <token>"));
      return;
    }

    const remote = await getAuthedRemoteClient(store);
    if (!remote.ok) {
      console.log(
        chalk.yellow(
          `Session stale or invalid (${remote.reason}). Run hydroloop auth login --token <token>`
        )
      );
      return;
    }

    const {
      data: { user },
    } = await remote.supabase.auth.getUser();

    console.log(`${chalk.bold("Signed in as")}: ${user?.email ?? user?.id ?? "?"}`);
    console.log(`${chalk.dim("User id:")} ${user?.id}`);
  });

  auth.addHelpText(
    "after",
    chalk.cyan(`
Token login:
  1) In Hydroloop web app: Settings -> Connect CLI -> generate token
  2) Run: hydroloop auth login --token <token>

Optional env:
  HYDROLOOP_API_URL — defaults to https://hydroloop-seven.vercel.app
  HYDROLOOP_SUPABASE_URL / HYDROLOOP_SUPABASE_ANON_KEY can override project target.`)
  );
}
