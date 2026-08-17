import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GmailComposeAction } from "../components/GmailComposeAction";

describe("GmailComposeAction", () => {
  it("renders an active compose anchor and recipient-entry guidance when no contact is stored", () => {
    const markup = renderToStaticMarkup(createElement(GmailComposeAction, {
      composeUrl: "https://mail.google.com/mail/?view=cm&body=Draft",
      recipient: "",
    }));
    expect(markup).toContain("Compose in Gmail");
    expect(markup).toContain('href="https://mail.google.com/mail/?view=cm&amp;body=Draft"');
    expect(markup).toContain("add it in Gmail before you send");
  });

  it("renders an active compose anchor and saved-recipient guidance when a contact exists", () => {
    const markup = renderToStaticMarkup(createElement(GmailComposeAction, {
      composeUrl: "https://mail.google.com/mail/?view=cm&to=hiring%40example.com",
      recipient: "hiring@example.com",
    }));
    expect(markup).toContain("Compose in Gmail");
    expect(markup).toContain("Your saved recipient is included");
    expect(markup).toContain('target="_blank"');
  });
});
