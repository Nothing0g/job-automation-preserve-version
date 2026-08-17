import { describe, expect, it, vi } from "vitest";
import { createOrReusePersonalUser, personalWorkspaceOpenId } from "./personalWorkspace";

describe("direct personal workspace identity", () => {
  it("uses the owner identity when one is configured", () => {
    expect(personalWorkspaceOpenId("owner-open-id")).toBe("owner-open-id");
    expect(personalWorkspaceOpenId("")).toBe("personal-workspace-owner");
  });

  it("creates the fallback identity once, then returns the durable record", async () => {
    const stored = { openId: "owner-open-id", id: 7 };
    const find = vi.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce(stored);
    const create = vi.fn().mockResolvedValue(undefined);
    await expect(createOrReusePersonalUser({ ownerOpenId: "owner-open-id", find, create })).resolves.toEqual(stored);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ openId: "owner-open-id", loginMethod: "direct-access", role: "admin" }));
    expect(find).toHaveBeenNthCalledWith(1, "owner-open-id");
    expect(find).toHaveBeenNthCalledWith(2, "owner-open-id");
  });

  it("reuses an existing record without creating a second personal user", async () => {
    const existing = { openId: "owner-open-id", id: 7 };
    const find = vi.fn().mockResolvedValue(existing);
    const create = vi.fn();
    await expect(createOrReusePersonalUser({ ownerOpenId: "owner-open-id", find, create })).resolves.toEqual(existing);
    expect(create).not.toHaveBeenCalled();
  });
});
