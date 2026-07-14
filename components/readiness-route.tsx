"use client";

import { useState, useTransition } from "react";
import type { EventFactsDocument } from "@/lib/event-facts";
import type {
  ReadinessRouteNode,
  RequirementComparison,
  SimulatorChangeSet,
} from "@/lib/readiness-route";

type SimulationResponse = {
  route: ReadinessRouteNode[];
  comparison: RequirementComparison;
};

export function ReadinessRouteExperience({
  initialEventFacts,
  initialRoute,
}: {
  initialEventFacts: EventFactsDocument;
  initialRoute: ReadinessRouteNode[];
}) {
  const [route, setRoute] = useState(initialRoute);
  const [comparison, setComparison] = useState<RequirementComparison | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [changes, setChanges] = useState<SimulatorChangeSet>({
    city: initialEventFacts.locationScope.cityCode ?? "phoenix",
    propertyUse:
      initialEventFacts.locationScope.propertyUse ?? "private-property",
    expectedAttendance:
      typeof initialEventFacts.facts.find(
        (fact) => fact.key === "expectedAttendance",
      )?.value === "number"
        ? (initialEventFacts.facts.find(
            (fact) => fact.key === "expectedAttendance",
          )?.value as number)
        : 100,
    vendorCount:
      typeof initialEventFacts.facts.find((fact) => fact.key === "vendorCount")
        ?.value === "number"
        ? (initialEventFacts.facts.find((fact) => fact.key === "vendorCount")
            ?.value as number)
        : 1,
    hasFood:
      initialEventFacts.facts.find((fact) => fact.key === "hasFood")?.value ===
      true,
    hasAlcohol:
      initialEventFacts.facts.find((fact) => fact.key === "hasAlcohol")
        ?.value === true,
    hasAmplifiedSound:
      initialEventFacts.facts.find((fact) => fact.key === "hasAmplifiedSound")
        ?.value === true,
    hasStreetSidewalkOrParkingImpact:
      initialEventFacts.facts.find(
        (fact) => fact.key === "hasStreetSidewalkOrParkingImpact",
      )?.value === true,
    streetClosure:
      initialEventFacts.facts.find((fact) => fact.key === "streetClosure")
        ?.value === true,
  });

  function updateBoolean(key: keyof SimulatorChangeSet, checked: boolean) {
    setChanges((current) => ({ ...current, [key]: checked }));
  }

  function updateText(key: keyof SimulatorChangeSet, value: string | number) {
    setChanges((current) => ({ ...current, [key]: value }));
  }

  function resetSimulation() {
    setRoute(initialRoute);
    setComparison(null);
    setError(null);
  }

  async function handleSubmit(formData: FormData) {
    const payload: SimulatorChangeSet = {
      city: String(formData.get("city") ?? changes.city ?? "phoenix"),
      propertyUse: String(
        formData.get("propertyUse") ??
          changes.propertyUse ??
          "private-property",
      ),
      expectedAttendance: Number(formData.get("expectedAttendance") ?? 100),
      vendorCount: Number(formData.get("vendorCount") ?? 1),
      hasFood: formData.get("hasFood") === "true",
      hasAlcohol: formData.get("hasAlcohol") === "true",
      hasAmplifiedSound: formData.get("hasAmplifiedSound") === "true",
      hasStreetSidewalkOrParkingImpact:
        formData.get("hasStreetSidewalkOrParkingImpact") === "true",
      streetClosure: formData.get("streetClosure") === "true",
    };

    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/results/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventFacts: initialEventFacts,
            changes: payload,
          }),
        });

        if (!response.ok) {
          throw new Error("We could not compare that route change yet.");
        }

        const result = (await response.json()) as SimulationResponse;
        setRoute(result.route);
        setComparison(result.comparison);
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "We could not compare that route change yet.",
        );
      }
    });
  }

  return (
    <div className="civic-readiness-shell">
      <section
        aria-labelledby="readiness-route"
        className="civic-readiness-route"
      >
        <header className="civic-results-section-heading">
          <p className="civic-data-label-shared">
            Primary route · Deterministic
          </p>
          <h2 id="readiness-route">Follow the deterministic route</h2>
          <p>
            This route stays readable as a normal vertical list on small
            screens, with reduced motion, and when scripts are limited.
          </p>
        </header>
        <div className="civic-readiness-route__list">
          <div className="civic-readiness-route__line" aria-hidden="true" />
          {route.map((node, index) => (
            <details
              className={`civic-readiness-stop civic-readiness-stop--${node.kind}`}
              key={node.id}
              open={node.kind === "start" || node.kind === "end"}
            >
              <summary className="focus-ring">
                <span
                  aria-hidden="true"
                  className="civic-readiness-stop__marker"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="civic-readiness-stop__summary">
                  <div className="civic-readiness-stop__tokens">
                    <span className={tokenClassName(node.token)}>
                      {tokenLabel(node.kind)}
                    </span>
                    {node.sourceId ? (
                      <span className="civic-readiness-stop__source-id">
                        Source ID: {node.sourceId}
                      </span>
                    ) : null}
                  </div>
                  <h3>{node.title}</h3>
                  <p>{node.summary}</p>
                </div>
              </summary>
              <div className="civic-readiness-stop__details">
                {node.detailLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {node.sourceUrl ? (
                  <a
                    className="civic-source-link focus-ring"
                    href={node.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Check the official source
                  </a>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </section>

      <aside aria-labelledby="change-simulator" className="civic-simulator">
        <header className="civic-simulator__header">
          <p className="civic-data-label-shared">Event Change Simulator</p>
          <h2 id="change-simulator">Compare one route change</h2>
          <p>
            Duplicate the confirmed event facts, change one or more supported
            details, and compare the deterministic difference.
          </p>
        </header>
        <form
          className="civic-simulator__form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit(new FormData(event.currentTarget));
          }}
        >
          <div className="civic-simulator__fields">
            <label>
              City
              <select
                className="civic-simulator__control focus-ring"
                defaultValue={String(changes.city ?? "phoenix")}
                name="city"
                onChange={(event) => updateText("city", event.target.value)}
              >
                <option value="phoenix">Phoenix</option>
                <option value="tempe">Tempe</option>
                <option value="mesa">Mesa</option>
                <option value="scottsdale">Scottsdale</option>
                <option value="glendale">Glendale</option>
                <option value="peoria">Peoria</option>
                <option value="chandler">Chandler</option>
                <option value="gilbert">Gilbert</option>
              </select>
            </label>
            <label>
              Property type
              <select
                className="civic-simulator__control focus-ring"
                defaultValue={String(changes.propertyUse ?? "private-property")}
                name="propertyUse"
                onChange={(event) =>
                  updateText("propertyUse", event.target.value)
                }
              >
                <option value="private-property">Private property</option>
                <option value="parking-lot">
                  Parking lot or outdoor private space
                </option>
                <option value="public-property">Public property</option>
                <option value="park-or-plaza">Park or plaza</option>
                <option value="licensed-venue">Existing licensed venue</option>
              </select>
            </label>
            <label>
              Expected attendance
              <input
                className="civic-simulator__control focus-ring"
                defaultValue={Number(changes.expectedAttendance ?? 100)}
                min={1}
                name="expectedAttendance"
                onChange={(event) =>
                  updateText("expectedAttendance", Number(event.target.value))
                }
                type="number"
              />
            </label>
            <label>
              Vendor count
              <input
                className="civic-simulator__control focus-ring"
                defaultValue={Number(changes.vendorCount ?? 1)}
                min={1}
                name="vendorCount"
                onChange={(event) =>
                  updateText("vendorCount", Number(event.target.value))
                }
                type="number"
              />
            </label>
          </div>

          <fieldset className="civic-simulator__toggles">
            <legend>Quick route toggles</legend>
            <ToggleField
              checked={Boolean(changes.hasFood)}
              label="Food involved"
              name="hasFood"
              onChange={(checked) => updateBoolean("hasFood", checked)}
            />
            <ToggleField
              checked={Boolean(changes.hasAlcohol)}
              label="Alcohol involved"
              name="hasAlcohol"
              onChange={(checked) => updateBoolean("hasAlcohol", checked)}
            />
            <ToggleField
              checked={Boolean(changes.hasAmplifiedSound)}
              label="Amplified sound"
              name="hasAmplifiedSound"
              onChange={(checked) =>
                updateBoolean("hasAmplifiedSound", checked)
              }
            />
            <ToggleField
              checked={Boolean(changes.hasStreetSidewalkOrParkingImpact)}
              label="Street, sidewalk, or parking impact"
              name="hasStreetSidewalkOrParkingImpact"
              onChange={(checked) =>
                updateBoolean("hasStreetSidewalkOrParkingImpact", checked)
              }
            />
            <ToggleField
              checked={Boolean(changes.streetClosure)}
              label="Street closure"
              name="streetClosure"
              onChange={(checked) => updateBoolean("streetClosure", checked)}
            />
          </fieldset>

          <div className="civic-simulator__actions">
            <button
              className="civic-button civic-button--signal focus-ring"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Comparing route..." : "Compare route change"}
            </button>
            <button
              className="civic-results-action civic-results-action--light focus-ring"
              onClick={resetSimulation}
              type="button"
            >
              Reset comparison
            </button>
          </div>
        </form>

        <div aria-live="polite" className="civic-simulator__feedback">
          {error ? <p className="gw-inline-error">{error}</p> : null}
          {comparison ? <ComparisonSummary comparison={comparison} /> : null}
        </div>
      </aside>
    </div>
  );
}

function ComparisonSummary({
  comparison,
}: {
  comparison: RequirementComparison;
}) {
  const groups = [
    ["Added requirements", comparison.addedRequirements],
    ["Removed requirements", comparison.removedRequirements],
    ["Changed warnings", comparison.changedWarnings],
    ["Unchanged requirements", comparison.unchangedRequirements],
    ["Newly unresolved requirements", comparison.newlyUnresolvedRequirements],
  ] as const;

  return (
    <div className="civic-comparison">
      <div className="civic-comparison__summary">
        <h3>Deterministic route difference</h3>
        <ul>
          {comparison.changedFactLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      {groups.map(([label, items]) => (
        <section className="civic-comparison__group" key={label}>
          <div className="civic-comparison__heading">
            <h3>{label}</h3>
            <span aria-label={`${items.length} items`}>{items.length}</span>
          </div>
          {items.length === 0 ? (
            <p className="civic-comparison__empty">
              No items in this comparison group.
            </p>
          ) : (
            <ul className="civic-comparison__items">
              {items.map((item) => (
                <li key={`${label}:${item.ruleId}`}>
                  <strong>{item.title}</strong>
                  <p>{item.explanation}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

function ToggleField({
  checked,
  label,
  name,
  onChange,
}: {
  checked: boolean;
  label: string;
  name: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="civic-simulator-toggle">
      <span>{label}</span>
      <select
        className="civic-simulator-toggle__control focus-ring"
        defaultValue={checked ? "true" : "false"}
        name={name}
        onChange={(event) => onChange(event.target.value === "true")}
      >
        <option value="false">No</option>
        <option value="true">Yes</option>
      </select>
    </label>
  );
}

function tokenClassName(token: ReadinessRouteNode["token"]) {
  if (token === "official") {
    return "civic-route-token civic-route-token--official";
  }

  return token === "unknown"
    ? "civic-route-token civic-route-token--unknown"
    : "civic-route-token civic-route-token--verified";
}

function tokenLabel(kind: ReadinessRouteNode["kind"]) {
  switch (kind) {
    case "start":
      return "Start";
    case "fact":
      return "Fact marker";
    case "decision":
      return "Decision point";
    case "requirement":
      return "Requirement stop";
    case "missing":
      return "Missing-information fork";
    case "source":
      return "Source anchor";
    case "end":
      return "End state";
  }
}
