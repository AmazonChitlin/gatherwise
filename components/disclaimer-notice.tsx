import { CalloutPanel } from "@/components/ui";

export function DisclaimerNotice() {
  return (
    <CalloutPanel className="p-4">
      <h2 className="text-base font-semibold text-[var(--verified-strong)]">
        Informational guidance only
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Gatherwise is not a legal service and does not submit permits.
        Guidance is general information only, not legal advice. Requirements
        can change, and some items need review, so always check the official
        source and confirm deadlines, fees, and forms with the relevant agency.
      </p>
    </CalloutPanel>
  );
}
