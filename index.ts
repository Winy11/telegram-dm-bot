const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID || "";

function isAdmin(userId: string): boolean {
  return ADMIN_ID !== "" && userId === ADMIN_ID;
}

// ── Admin Panel ─────────────────────────────────────────
if (data === "admin_panel") {
  if (!isAdmin(userId)) return;
  const [{ count: userCount }] = await db.select({ count: db.$count(botUsersTable) }).from(botUsersTable);
  const sessions = await db.select().from(adminSessionsTable);
  await bot.sendMessage(chatId, m.adminPanel(Number(userCount), sessions.length), {
    parse_mode: "HTML",
    reply_markup: adminPanelKeyboard(),
  });
  return;
}

// ── Admin: Add New Account ──────────────────────────────
if (data === "admin_add_account") {
  if (!isAdmin(userId)) return;
  pendingState.set(fromId, { step: "admin_awaiting_phone" });
  await bot.sendMessage(chatId, m.adminAddAccount, { parse_mode: "HTML", reply_markup: cancelKeyboard() });
  return;
}

// ── Admin: All Accounts list ────────────────────────────
if (data === "admin_all_accounts") {
  if (!isAdmin(userId)) return;
  const sessions = await db.select().from(adminSessionsTable);
  if (sessions.length === 0) {
    await bot.sendMessage(chatId, m.adminNoAccounts, { parse_mode: "HTML", reply_markup: adminPanelKeyboard() });
    return;
  }
  const items = sessions.map((s, i) => {
    return `${i + 1}. 📱 <code>${s.phoneNumber}</code>\n   📅 ${s.createdAt.toLocaleDateString("en-IN")}`;
  }).join("\n\n");

  const removeButtons = sessions.map((s) => [
    { text: `🗑️ Remove ${s.phoneNumber}`, callback_data: `admin_remove_${s.id}` },
  ]);
  await bot.sendMessage(chatId, m.adminAccounts(items), {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [...removeButtons, [{ text: "◀️ Back", callback_data: "admin_panel" }]],
    },
  });
  return;
}

// ── Admin: All Bot Users ────────────────────────────────
if (data === "admin_all_users") {
  if (!isAdmin(userId)) return;
  const users = await db.select().from(botUsersTable);
  if (users.length === 0) {
    await bot.sendMessage(chatId, m.adminNoUsers, { parse_mode: "HTML", reply_markup: adminPanelKeyboard() });
    return;
  }
  const items = users.map((u, i) => {
    const name = `${u.firstName}${u.lastName ? " " + u.lastName : ""}`;
    const hasSession = u.phoneSession ? "✅" : "❌";
    return `${i + 1}. 👤 <b>${name}</b>${u.username ? ` (@${u.username})` : ""}\n   ID: <code>${u.telegramId}</code> | Account: ${hasSession}`;
  }).join("\n\n");
  await bot.sendMessage(chatId, m.adminUsers(items), { parse_mode: "HTML", reply_markup: adminPanelKeyboard() });
  return;
}

// ── Admin: Remove Account ───────────────────────────────
if (data.startsWith("admin_remove_")) {
  if (!isAdmin(userId)) return;
  const sessionId = parseInt(data.replace("admin_remove_", ""), 10);
  await db.delete(adminSessionsTable).where(eq(adminSessionsTable.id, sessionId));
  await bot.sendMessage(chatId, m.adminAccountRemoved, { parse_mode: "HTML", reply_markup: adminPanelKeyboard() });
  return;
    }
