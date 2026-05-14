import cron from "node-cron";
import { db } from "./db";
import { scheduledMessagesTable, botUsersTable } from "./db";
import { and, eq, lte } from "drizzle-orm";
import { sendMessageAsUser } from "./gramjs";

export function startScheduler(): void {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const pending = await db.select().from(scheduledMessagesTable)
        .where(and(eq(scheduledMessagesTable.status, "pending"), lte(scheduledMessagesTable.scheduledAt, now)));

      for (const msg of pending) {
        try {
          const [sender] = await db.select({ phoneSession: botUsersTable.phoneSession })
            .from(botUsersTable).where(eq(botUsersTable.telegramId, msg.senderTelegramId));

          if (!sender?.phoneSession) {
            await db.update(scheduledMessagesTable).set({ status: "failed" }).where(eq(scheduledMessagesTable.id, msg.id));
            continue;
          }
          // ✅ User ke apne account se DM bhejta hai
          await sendMessageAsUser(sender.phoneSession, msg.targetUserId, msg.messageText);
          await db.update(scheduledMessagesTable).set({ status: "sent", sentAt: new Date() }).where(eq(scheduledMessagesTable.id, msg.id));
        } catch {
          await db.update(scheduledMessagesTable).set({ status: "failed" }).where(eq(scheduledMessagesTable.id, msg.id));
        }
      }
    } catch {}
  });
    }
