// My Schedules — callback handler
if (data === "my_schedules") {
  const schedules = await db.select().from(scheduledMessagesTable)
    .where(and(eq(scheduledMessagesTable.senderTelegramId, userId), eq(scheduledMessagesTable.status, "pending")));

  if (schedules.length === 0) {
    await bot.sendMessage(chatId, m.noSchedules, { parse_mode: "HTML", reply_markup: backKeyboard() });
    return;
  }

  const items = schedules.map((s, i) => {
    const d = new Date(s.scheduledAt);
    const h = d.getHours();
    const min = String(d.getMinutes()).padStart(2, "0");
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "am" : "pm";
    const preview = s.messageText.slice(0, 40) + (s.messageText.length > 40 ? "..." : "");
    return `${i + 1}. ⏰ <b>${displayH}:${min}${ampm}</b> → <code>${s.targetUserId}</code>\n   💬 <i>${preview}</i>`;
  }).join("\n\n");

  const cancelButtons = schedules.map((s) => [
    { text: `❌ Cancel #${s.id}`, callback_data: `cancel_schedule_${s.id}` },
  ]);

  await bot.sendMessage(chatId, m.mySchedules(items), {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: [...cancelButtons, [{ text: "◀️ Back", callback_data: "dashboard" }]] },
  });
  return;
}

// Cancel a specific schedule
if (data.startsWith("cancel_schedule_")) {
  const scheduleId = parseInt(data.replace("cancel_schedule_", ""), 10);
  await db.delete(scheduledMessagesTable)
    .where(and(eq(scheduledMessagesTable.id, scheduleId), eq(scheduledMessagesTable.senderTelegramId, userId)));
  await bot.sendMessage(chatId, m.scheduleCancelled, { parse_mode: "HTML", reply_markup: dashboardKeyboard() });
  return;
    }
