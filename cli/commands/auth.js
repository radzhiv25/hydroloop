import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import chalk from "chalk";
import { createClient } from "@supabase/supabase-js";
import {
  clearRemoteSession,
  getSupabaseCredentials,
  persistTokensFromSession,
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
    .command("login <email>")
    .description(
      "Sign in with email + password (set HYDROLOOP_PASSWORD to skip prompt)"
    )
    .option("-p, --password <pwd>", "Password (prefer env HYDROLOOP_PASSWORD)")
    .action(async (email, opts) => {
      const store = getStore();
      const { url, anonKey } = getSupabaseCredentials();
      if (!url || !anonKey) {
        console.error(
          chalk.red(
            "Missing Supabase env. Set HYDROLOOP_SUPABASE_URL + HYDROLOOP_SUPABASE_ANON_KEY\n" +
              "(or NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY)."
          )
        );
        process.exitCode = 1;
        return;
      }

      let password =
        opts.password ??
        process.env.HYDROLOOP_PASSWORD ??
        process.env.HYDROLOOP_CLI_PASSWORD;

      if (!password) {
        const rl = readline.createInterface({ input: stdin, output: stdout });
        password = await rl.question(`${chalk.dim("Password: ")}`);
        rl.close();
      }

      if (!password?.trim()) {
        console.error(chalk.red("Password required."));
        process.exitCode = 1;
        return;
      }

      const supabase = createClient(url, anonKey, {
        auth: { persistSession: false, detectSessionInUrl: false },
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.session) {
        console.error(chalk.red(error?.message ?? "Login failed."));
        process.exitCode = 1;
        return;
      }

      persistTokensFromSession(store, data.session);
      console.log(
        chalk.green("Signed in. Queued CLI logs will upload when you're online.") +
          chalk.dim("\nTip: hydroloop sync push — upload now")
      );
    });

  auth.command("logout").description("Clear saved cloud session").action(async () => {
    const store = getStore();
    const creds = getSupabaseCredentials();

    if (creds.url && creds.anonKey && hasStoredSession(store)) {
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

    if (!isRemoteConfigured()) {
      console.log(chalk.dim("Remote not configured (env vars missing)."));
      return;
    }

    if (!hasStoredSession(store)) {
      console.log(chalk.dim("Not signed in locally. hydroloop auth login <email>"));
      return;
    }

    const remote = await getAuthedRemoteClient(store);
    if (!remote.ok) {
      console.log(
        chalk.yellow(`Session stale or invalid (${remote.reason}). hydroloop auth login`)
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
Env:
  HYDROLOOP_SUPABASE_URL / HYDROLOOP_SUPABASE_ANON_KEY (preferred), or NEXT_PUBLIC_*.
  HYDROLOOP_PASSWORD — non-interactive password for scripts only.`)
  );
}
