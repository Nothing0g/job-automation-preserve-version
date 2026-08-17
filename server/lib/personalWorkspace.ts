export type DirectAccessUserSeed = {
  openId: string;
  name: string;
  loginMethod: string;
  role: "admin";
  lastSignedIn: Date;
};

export function personalWorkspaceOpenId(ownerOpenId?: string) {
  return ownerOpenId || "personal-workspace-owner";
}

/**
 * The durable direct-access identity contract used by the personal workspace.
 * It reuses the owner record whenever present and creates it exactly once when
 * the workspace is opened for the first time.
 */
export async function createOrReusePersonalUser<T extends { openId: string }>(options: {
  ownerOpenId?: string;
  find: (openId: string) => Promise<T | undefined>;
  create: (seed: DirectAccessUserSeed) => Promise<void>;
}): Promise<T> {
  const openId = personalWorkspaceOpenId(options.ownerOpenId);
  const existing = await options.find(openId);
  if (existing) return existing;
  await options.create({ openId, name: "Personal workspace", loginMethod: "direct-access", role: "admin", lastSignedIn: new Date() });
  const created = await options.find(openId);
  if (!created) throw new Error("Could not initialize the personal workspace");
  return created;
}
