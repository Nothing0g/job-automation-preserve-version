export type ManualContextForm = {
  jobDescription: string;
  contextMode: "full" | "limited";
};

/** Converts the user-reviewed fallback text into full job context without adding any inferred details. */
export function applyManualPostingContext<T extends ManualContextForm>(form: T, pastedText: string): T {
  return {
    ...form,
    jobDescription: pastedText.trim(),
    contextMode: "full",
  };
}

export function hasSufficientManualContext(pastedText: string) {
  return pastedText.trim().length >= 40;
}
