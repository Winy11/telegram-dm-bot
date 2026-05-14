import cron from "node-cron";
import { db } from "./db";
import { botUsersTable } from "./db";
import { isNotNull } from "drizzle-orm";
import { checkAndRestoreBio } from "./gramjs";

export function startBioMonitor(): void {
  cron.schedule("*/30 * * * *", async () => {
    try {
      const users = await db.select({ telegramId: botUsersTable.telegramId, phoneSession: botUsersTable.phoneSession })
        .from(botUsersTable).where(isNotNull(botUsersTable.phoneSession));
      for (const user of users) {
        if (!user.phoneSession) continue;
        try { await checkAndRestoreBio(user.phoneSession); } catch {}
      }
    } catch {}
  });
}
