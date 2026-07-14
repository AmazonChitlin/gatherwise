import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { CivicStatus } from "@/components/civic";
import {
  officialSourceInventory,
  type OfficialSourceInventoryItem,
} from "@/prisma/seed-data/source-inventory";

export const metadata: Metadata = {
  title: "Sources",
  description:
    "Browse the official state, county, and city source records reviewed for the Gatherwise Arizona pilot.",
  alternates: { canonical: "/sources" },
};

const jurisdictionOrder = ["state", "county", "city"] as const;

export default function SourcesPage() {
  const groups = groupSources(officialSourceInventory);
  const reviewedCount = officialSourceInventory.filter(
    (source) => source.verificationStatus === "official_reviewed",
  ).length;

  return (
    <main className="civic-sources-page">
      <section className="civic-sources-hero" aria-labelledby="sources-title">
        <div className="civic-public-wrap civic-sources-hero__inner">
          <div>
            <p className="civic-data-label-shared">
              Source index · Arizona pilot
            </p>
            <h1 id="sources-title">
              The evidence should be easier to inspect than the claim.
            </h1>
          </div>
          <dl>
            <div>
              <dt>{officialSourceInventory.length}</dt>
              <dd>Inventory records</dd>
            </div>
            <div>
              <dt>{reviewedCount}</dt>
              <dd>Officially reviewed</dd>
            </div>
            <div>
              <dt>{groups.length}</dt>
              <dd>Jurisdictions</dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        className="civic-source-method"
        aria-labelledby="source-method-title"
      >
        <div className="civic-public-wrap civic-source-method__inner">
          <h2 id="source-method-title">How to read this index</h2>
          <p>
            Review date records when Gatherwise last checked the source, not a
            promise that the page has not changed since.
          </p>
          <p>
            A reviewed source does not mean every possible event rule has been
            modeled. Open the official page before relying on a result.
          </p>
        </div>
      </section>

      <div className="civic-public-wrap civic-source-index">
        {groups.map((group, index) => (
          <section
            className="civic-source-jurisdiction"
            key={group.name}
            aria-labelledby={`source-group-${index}`}
          >
            <header>
              <span aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p>{group.type}</p>
                <h2 id={`source-group-${index}`}>{group.name}</h2>
              </div>
              <strong>{group.sources.length} records</strong>
            </header>
            <div className="civic-source-agencies">
              {group.agencies.map((agency) => (
                <section
                  key={agency.name}
                  aria-labelledby={`agency-${slugify(group.name)}-${slugify(agency.name)}`}
                >
                  <h3
                    id={`agency-${slugify(group.name)}-${slugify(agency.name)}`}
                  >
                    {agency.name}
                  </h3>
                  <ul>
                    {agency.sources.map((source) => (
                      <SourceRow key={source.id} source={source} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function SourceRow({ source }: { source: OfficialSourceInventoryItem }) {
  const reviewed = source.verificationStatus === "official_reviewed";
  const status = reviewed
    ? "Official source"
    : source.verificationStatus === "needs_review"
      ? "Needs review"
      : "Research pending";

  return (
    <li className="civic-source-row">
      <div className="civic-source-row__title">
        <CivicStatus tone={reviewed ? "source" : "caution"}>
          {status}
        </CivicStatus>
        <h4>{source.sourceName}</h4>
        <p>{source.sourceCategory}</p>
      </div>
      <dl>
        <div>
          <dt>Review date</dt>
          <dd>{source.lastChecked ?? "Not reviewed"}</dd>
        </div>
        <div>
          <dt>Record ID</dt>
          <dd>{source.id}</dd>
        </div>
      </dl>
      {source.sourceUrl ? (
        <a
          className="civic-source-index-link focus-ring"
          href={source.sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          <span>Open official source</span>
          <small>{displayUrl(source.sourceUrl)}</small>
          <ExternalLink aria-hidden="true" />
        </a>
      ) : (
        <span className="civic-source-index-link civic-source-index-link--disabled">
          No verified URL
        </span>
      )}
    </li>
  );
}

function groupSources(sources: OfficialSourceInventoryItem[]) {
  return [...new Set(sources.map((source) => source.jurisdictionName))]
    .map((name) => {
      const jurisdictionSources = sources.filter(
        (source) => source.jurisdictionName === name,
      );
      const type = jurisdictionSources[0].jurisdictionType;
      const agencies = [
        ...new Set(jurisdictionSources.map((source) => source.agencyName)),
      ].map((agencyName) => ({
        name: agencyName,
        sources: jurisdictionSources.filter(
          (source) => source.agencyName === agencyName,
        ),
      }));
      return { name, type, sources: jurisdictionSources, agencies };
    })
    .sort(
      (left, right) =>
        jurisdictionOrder.indexOf(left.type) -
        jurisdictionOrder.indexOf(right.type),
    );
}

function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
