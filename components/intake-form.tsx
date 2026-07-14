"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  EventLocalIcon,
  type EventLocalIconName
} from "@/components/eventlocal-icons";
import {
  countyOptions,
  eventTypeOptions,
  recurrenceOptions,
  supportedJurisdictions,
  useCaseOptions,
  venueTypeOptions
} from "@/lib/config";
import { defaultIntakeValues } from "@/lib/intake-defaults";
import { eventFactFieldKeys } from "@/lib/event-facts";
import type { ReviewFact } from "@/lib/intake-review";
import {
  REVIEWED_INTAKE_SCHEMA_VERSION,
  reviewedIntakeSubmissionSchema
} from "@/lib/reviewed-intake";
import {
  intakeSchema,
  partialIntakeSchema,
  type IntakeInput,
  type PartialIntakeInput
} from "@/lib/schemas";

type TentSizeRange = NonNullable<IntakeInput["tentSizeRange"]>;
type IndoorOrOutdoor = NonNullable<IntakeInput["indoorOrOutdoor"]>;

type IntakeFormProps = {
  initialValues?: PartialIntakeInput;
  introText?: string;
  reviewFacts?: ReviewFact[];
};

export function IntakeForm({
  initialValues,
  introText = "Start with the basics, then add any details you know. Optional details help Gatherwise match pilot rules more precisely, but you can leave them off if they do not apply.",
  reviewFacts
}: IntakeFormProps) {
  const router = useRouter();
  const [values, setStoredValues] = useState<PartialIntakeInput>(
    initialValues ?? defaultIntakeValues
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const touchedFieldsRef = useRef(new Set<keyof IntakeInput>());
  const isReviewedSession = Boolean(reviewFacts?.length);

  function setValues(
    updater: (current: PartialIntakeInput) => PartialIntakeInput
  ) {
    setStoredValues((current) => {
      const next = updater(current);

      if (isReviewedSession) {
        for (const key of eventFactFieldKeys) {
          if (!Object.is(current[key], next[key])) {
            touchedFieldsRef.current.add(key);
          }
        }
      }

      return next;
    });
  }

  useEffect(() => {
    if (initialValues) {
      setStoredValues(initialValues);
      touchedFieldsRef.current.clear();
    }
  }, [initialValues]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = isReviewedSession
      ? partialIntakeSchema.safeParse(values)
      : intakeSchema.safeParse(values);

    if (!result.success) {
      setErrors(formatErrors(result.error.flatten().fieldErrors));
      setSubmitError("");
      return;
    }

    setErrors({});
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const requestBody = isReviewedSession
        ? reviewedIntakeSubmissionSchema.parse({
            intake: result.data,
            review: {
              schemaVersion: REVIEWED_INTAKE_SCHEMA_VERSION,
              facts: reviewFacts?.map((fact) => ({
                key: fact.key,
                status:
                  fact.reviewStatus === "needs_review"
                    ? "extracted"
                    : fact.reviewStatus,
                value: fact.reviewStatus === "unknown" ? null : fact.value,
                evidenceText: fact.evidenceText
              })),
              touchedFields: [...touchedFieldsRef.current]
            }
          })
        : result.data;
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      const payload = (await response.json()) as {
        intakeId?: string;
        snapshot?: string;
        errors?: Record<string, string>;
        message?: string;
      };

      if (!response.ok || (!payload.intakeId && !payload.snapshot)) {
        setErrors(payload.errors ?? {});
        setSubmitError(
          payload.message ??
            "We could not save this intake yet. Please check the form and try again."
        );
        return;
      }

      if (payload.intakeId) {
        router.push(`/results?intakeId=${payload.intakeId}`);
        return;
      }

      router.push(`/results?snapshot=${payload.snapshot}`);
    } catch {
      setSubmitError("We could not reach the intake service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      {submitError ? (
        <div className="rounded-[var(--radius-control)] border border-[var(--accent)] bg-[var(--alert-soft)] p-3 text-sm leading-6 text-[var(--alert-strong)]">
          {submitError}
        </div>
      ) : null}

      <div className="rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-muted)] p-4 text-sm leading-6 text-[var(--muted)]">
        {introText}
      </div>

      <Section
        description="Choose the closest city or rule area for where the event will happen."
        meta="Required"
        title="Location"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            error={errors.city}
            label="City or rule area"
            onChange={(city) => setValues((current) => ({ ...current, city }))}
            options={supportedJurisdictions.map(({ code, label }) => ({
              value: code,
              label
            }))}
            value={values.city ?? ""}
          />
          <SelectField
            error={errors.county}
            label="County"
            onChange={(county) =>
              setValues((current) => ({ ...current, county }))
            }
            options={countyOptions}
            value={values.county ?? ""}
          />
        </div>
      </Section>

      <Section
        description="Give the event a name and pick the closest description. It does not have to be perfect."
        meta="Required"
        title="Event basics"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            error={errors.eventName}
            helper="A working name is fine."
            label="Event, booth, or business name"
          >
            <input
              className="focus-ring w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  eventName: event.target.value
                }))
              }
              placeholder="Example: Downtown record swap"
              value={values.eventName ?? ""}
            />
          </Field>
          <Field
            error={errors.expectedAttendance}
            helper="Use your best estimate."
            label="Expected attendance"
          >
            <input
              className="focus-ring w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm"
              min={1}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  expectedAttendance: event.target.value
                    ? Number(event.target.value)
                    : undefined
                }))
              }
              type="number"
              value={values.expectedAttendance ?? ""}
            />
          </Field>
          <SelectField
            error={errors.useCase}
            label="Closest use case"
            onChange={(useCase) =>
              setValues((current) => ({ ...current, useCase }))
            }
            options={useCaseOptions}
            value={values.useCase ?? ""}
          />
          <SelectField
            error={errors.eventType}
            label="Event type"
            onChange={(eventType) =>
              setValues((current) => ({ ...current, eventType }))
            }
            options={eventTypeOptions}
            value={values.eventType ?? ""}
          />
        </div>
      </Section>

      <Section
        description="Tell us whether people will be selling, vending, or organizing multiple booths."
        meta="Required"
        title="Selling and vendors"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            error={errors.vendorCount}
            helper="Use 1 for a single booth or truck."
            label="How many vendors or booths?"
          >
            <input
              className="focus-ring w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm"
              min={1}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  vendorCount: event.target.value
                    ? Number(event.target.value)
                    : undefined
                }))
              }
              type="number"
              value={values.vendorCount ?? ""}
            />
          </Field>
          <Toggle
            checked={values.hasRetailSales === true}
            label="Retail items or taxable goods will be sold"
            onChange={(hasRetailSales) =>
              setValues((current) => ({ ...current, hasRetailSales }))
            }
          />
        </div>
      </Section>

      <Section
        description="Answer what you know about food, drinks, sampling, or a food truck. Skip anything that does not apply."
        meta="Optional details"
        title="Food and drinks"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle
            checked={values.hasFood === true}
            label="Food or drinks will be served or sampled"
            onChange={(hasFood) =>
              setValues((current) => ({ ...current, hasFood }))
            }
          />
          <Toggle
            checked={values.hasFoodTruck === true}
            label="A food truck is involved"
            onChange={(hasFoodTruck) =>
              setValues((current) => ({ ...current, hasFoodTruck }))
            }
          />
          <Toggle
            checked={values.foodIsPrepackaged === true}
            label="Food is prepackaged"
            onChange={(foodIsPrepackaged) =>
              setValues((current) => ({ ...current, foodIsPrepackaged }))
            }
          />
          <Toggle
            checked={values.foodIsOpenOrPreparedOnSite === true}
            label="Food will be open, handled, or prepared on site"
            onChange={(foodIsOpenOrPreparedOnSite) =>
              setValues((current) => ({
                ...current,
                foodIsOpenOrPreparedOnSite
              }))
            }
          />
          <Toggle
            checked={values.foodRequiresTemperatureControl === true}
            label="Food needs to stay hot or cold"
            onChange={(foodRequiresTemperatureControl) =>
              setValues((current) => ({
                ...current,
                foodRequiresTemperatureControl
              }))
            }
          />
          <Toggle
            checked={values.foodSampling === true}
            label="Food or drink samples will be offered"
            onChange={(foodSampling) =>
              setValues((current) => ({
                ...current,
                foodSampling
              }))
            }
          />
          <Toggle
            checked={values.drinksWithIceOrGarnish === true}
            label="Drinks include ice, garnish, or open preparation"
            onChange={(drinksWithIceOrGarnish) =>
              setValues((current) => ({
                ...current,
                drinksWithIceOrGarnish
              }))
            }
          />
          <Toggle
            checked={values.commissaryOrBaseOfOperations === true}
            label="Food vendor has a commissary or base of operations"
            onChange={(commissaryOrBaseOfOperations) =>
              setValues((current) => ({
                ...current,
                commissaryOrBaseOfOperations
              }))
            }
          />
          <Toggle
            checked={values.believesFoodExemptionMayApply === true}
            label="Vendor thinks a food exemption may apply"
            onChange={(believesFoodExemptionMayApply) =>
              setValues((current) => ({
                ...current,
                believesFoodExemptionMayApply
              }))
            }
          />
        </div>
      </Section>

      <Section
        description="Use this only if alcohol is part of the event. Gatherwise will not tell you alcohol is allowed; it will point to items to review."
        meta="Optional details"
        title="Alcohol"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle
            checked={values.hasAlcohol === true}
            label="Alcohol is involved"
            onChange={(hasAlcohol) =>
              setValues((current) => ({ ...current, hasAlcohol }))
            }
          />
          <Toggle
            checked={values.alcoholSold === true}
            label="Alcohol will be sold"
            onChange={(alcoholSold) =>
              setValues((current) => ({
                ...current,
                alcoholSold
              }))
            }
          />
          <Toggle
            checked={values.alcoholServedFree === true}
            label="Alcohol will be served free"
            onChange={(alcoholServedFree) =>
              setValues((current) => ({
                ...current,
                alcoholServedFree
              }))
            }
          />
          <Toggle
            checked={values.alcoholByob === true}
            label="Guests may bring their own alcohol (BYOB)"
            onChange={(alcoholByob) =>
              setValues((current) => ({
                ...current,
                alcoholByob
              }))
            }
          />
          <Toggle
            checked={values.alcoholOnPublicProperty === true}
            label="Alcohol would be on public property"
            onChange={(alcoholOnPublicProperty) =>
              setValues((current) => ({
                ...current,
                alcoholOnPublicProperty
              }))
            }
          />
        </div>
      </Section>

      <Section
        description="Tell us about tents, stages, power, heat, or fuel. These details can matter for fire or setup review."
        meta="Optional details"
        title="Structures, fire, and power"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle
            checked={values.hasTemporaryStructure === true}
            label="Temporary structure, tent, stage, or canopy"
            onChange={(hasTemporaryStructure) =>
              setValues((current) => ({ ...current, hasTemporaryStructure }))
            }
          />
          <Toggle
            checked={values.hasGenerator === true}
            label="Generator or temporary power"
            onChange={(hasGenerator) =>
              setValues((current) => ({ ...current, hasGenerator }))
            }
          />
          <Toggle
            checked={values.hasOpenFlame === true}
            label="Open flame, cooking flame, or heating element"
            onChange={(hasOpenFlame) =>
              setValues((current) => ({ ...current, hasOpenFlame }))
            }
          />
          <Toggle
            checked={values.tentOrCanopy === true}
            label="Tent or canopy"
            onChange={(tentOrCanopy) =>
              setValues((current) => ({
                ...current,
                tentOrCanopy
              }))
            }
          />
          <Toggle
            checked={values.temporaryStageOrPlatform === true}
            label="Temporary stage or platform"
            onChange={(temporaryStageOrPlatform) =>
              setValues((current) => ({
                ...current,
                temporaryStageOrPlatform
              }))
            }
          />
          <Toggle
            checked={values.cookingHeatSource === true}
            label="Cooking heat source"
            onChange={(cookingHeatSource) =>
              setValues((current) => ({
                ...current,
                cookingHeatSource
              }))
            }
          />
          <Toggle
            checked={values.propaneOrFuelUse === true}
            label="Propane, fuel, or fuel-powered equipment"
            onChange={(propaneOrFuelUse) =>
              setValues((current) => ({ ...current, propaneOrFuelUse }))
            }
          />
          <SelectField
            error={errors.tentSizeRange}
            label="Tent or canopy size"
            onChange={(tentSizeRange) =>
              setValues((current) => ({
                ...current,
                tentSizeRange: tentSizeRange as TentSizeRange
              }))
            }
            options={[
              { value: "none", label: "No tent or canopy" },
              {
                value: "small-under-400-sq-ft",
                label: "Small, under 400 square feet"
              },
              {
                value: "large-400-sq-ft-or-more",
                label: "Large, 400 square feet or more"
              },
              { value: "not-sure", label: "Not sure yet" }
            ]}
            value={values.tentSizeRange ?? "none"}
          />
        </div>
      </Section>

      <Section
        description="Use these if the setup touches public space, streets, sidewalks, parking, traffic flow, or a city park."
        meta="Optional details"
        title="Property and public space"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField
            error={errors.propertyUse}
            label="Where will setup happen?"
            onChange={(propertyUse) =>
              setValues((current) => ({
                ...current,
                propertyUse
              }))
            }
            options={venueTypeOptions}
            value={values.propertyUse ?? ""}
          />
          <SelectField
            error={errors.indoorOrOutdoor}
            label="Indoor or outdoor?"
            onChange={(indoorOrOutdoor) =>
              setValues((current) => ({
                ...current,
                indoorOrOutdoor: indoorOrOutdoor as IndoorOrOutdoor
              }))
            }
            options={[
              { value: "indoor", label: "Indoor" },
              { value: "outdoor", label: "Outdoor" },
              { value: "both", label: "Both indoor and outdoor" },
              { value: "not-sure", label: "Not sure yet" }
            ]}
            value={values.indoorOrOutdoor ?? ""}
          />
          <Toggle
            checked={values.hasStreetSidewalkOrParkingImpact === true}
            label="Street, sidewalk, or parking impacts"
            onChange={(hasStreetSidewalkOrParkingImpact) =>
              setValues((current) => ({
                ...current,
                hasStreetSidewalkOrParkingImpact
              }))
            }
          />
          <Toggle
            checked={values.cityParkOrFacility === true}
            label="City park or city facility"
            onChange={(cityParkOrFacility) =>
              setValues((current) => ({
                ...current,
                cityParkOrFacility
              }))
            }
          />
          <Toggle
            checked={values.privateProperty === true}
            label="Private property"
            onChange={(privateProperty) =>
              setValues((current) => ({ ...current, privateProperty }))
            }
          />
          <Toggle
            checked={values.publicProperty === true}
            label="Public property"
            onChange={(publicProperty) =>
              setValues((current) => ({ ...current, publicProperty }))
            }
          />
          <Toggle
            checked={values.venueOrPropertyOwnerPermission === true}
            label="Venue or property owner permission is in progress"
            onChange={(venueOrPropertyOwnerPermission) =>
              setValues((current) => ({
                ...current,
                venueOrPropertyOwnerPermission
              }))
            }
          />
          <Toggle
            checked={values.streetClosure === true}
            label="Street closure"
            onChange={(streetClosure) =>
              setValues((current) => ({
                ...current,
                streetClosure
              }))
            }
          />
          <Toggle
            checked={values.sidewalkUseOrClosure === true}
            label="Sidewalk use or closure"
            onChange={(sidewalkUseOrClosure) =>
              setValues((current) => ({
                ...current,
                sidewalkUseOrClosure
              }))
            }
          />
          <Toggle
            checked={values.parkingLotUse === true}
            label="Parking lot will be used for setup"
            onChange={(parkingLotUse) =>
              setValues((current) => ({
                ...current,
                parkingLotUse
              }))
            }
          />
          <Toggle
            checked={values.parkingSpacesBlocked === true}
            label="Parking spaces will be blocked"
            onChange={(parkingSpacesBlocked) =>
              setValues((current) => ({
                ...current,
                parkingSpacesBlocked
              }))
            }
          />
          <Toggle
            checked={values.trafficControlNeeded === true}
            label="Traffic control may be needed"
            onChange={(trafficControlNeeded) =>
              setValues((current) => ({
                ...current,
                trafficControlNeeded
              }))
            }
          />
          <Toggle
            checked={values.rightOfWayUse === true}
            label="Public right-of-way may be used"
            onChange={(rightOfWayUse) =>
              setValues((current) => ({
                ...current,
                rightOfWayUse
              }))
            }
          />
        </div>
      </Section>

      <Section
        description="Add sound, signs, tickets, or promotion details if they apply. These are optional but useful."
        meta="Optional details"
        title="Sound, signs, and promotion"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle
            checked={values.hasAmplifiedSound === true}
            label="Amplified sound or performance audio"
            onChange={(hasAmplifiedSound) =>
              setValues((current) => ({ ...current, hasAmplifiedSound }))
            }
          />
          <Toggle
            checked={values.temporarySignage === true}
            label="Temporary signage"
            onChange={(temporarySignage) =>
              setValues((current) => ({ ...current, temporarySignage }))
            }
          />
          <Toggle
            checked={values.banners === true}
            label="Banners"
            onChange={(banners) =>
              setValues((current) => ({ ...current, banners }))
            }
          />
          <Toggle
            checked={values.ticketedEvent === true}
            label="Ticketed event"
            onChange={(ticketedEvent) =>
              setValues((current) => ({ ...current, ticketedEvent }))
            }
          />
          <Toggle
            checked={values.admissionFee === true}
            label="Admission fee"
            onChange={(admissionFee) =>
              setValues((current) => ({ ...current, admissionFee }))
            }
          />
          <Toggle
            checked={values.publicAdvertising === true}
            label="Public advertising or public promotion"
            onChange={(publicAdvertising) =>
              setValues((current) => ({ ...current, publicAdvertising }))
            }
          />
        </div>
      </Section>

      <Section
        description="Dates and recurrence help turn matched rules into a planning timeline."
        meta="Required"
        title="Timing"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field error={errors.eventDate} label="Event date">
            <input
              className="focus-ring w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  eventDate: event.target.value
                }))
              }
              type="date"
              value={values.eventDate ?? ""}
            />
          </Field>
          <SelectField
            error={errors.recurrence}
            label="One-time or recurring?"
            onChange={(recurrence) =>
              setValues((current) => ({
                ...current,
                recurrence,
                recurringEvent: recurrence === "recurring"
              }))
            }
            options={recurrenceOptions}
            value={values.recurrence ?? ""}
          />
        </div>
      </Section>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <button
          className="local-button focus-ring w-full bg-[var(--primary)] text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/45 border-t-white"
            />
          ) : null}
          {isSubmitting ? "Building your readiness summary..." : "Build my readiness summary"}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          className="focus-ring min-h-[44px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]"
          onClick={() => {
            setStoredValues(initialValues ?? defaultIntakeValues);
            touchedFieldsRef.current.clear();
            setErrors({});
            setSubmitError("");
          }}
          type="button"
        >
          Reset form
        </button>
      </div>
      <p
        aria-live="polite"
        className="text-center text-sm leading-6 text-[var(--muted)]"
        role="status"
      >
        {isSubmitting
          ? "Saving your details and matching pilot guidance. This usually takes a moment."
          : "You can review the result before taking any next step."}
      </p>
    </form>
  );
}

function SelectField({
  error,
  label,
  onChange,
  options,
  value
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  value: string;
}) {
  return (
    <Field error={error} label={label}>
      <select
        className="focus-ring w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {value === "" ? (
          <option disabled value="">
            Choose an answer
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Field({
  children,
  error,
  helper,
  label
}: {
  children: React.ReactNode;
  error?: string;
  helper?: string;
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {helper ? (
        <span className="mb-2 block text-xs leading-5 text-[var(--muted)]">
          {helper}
        </span>
      ) : null}
      {children}
      {error ? (
        <span className="mt-1.5 block text-sm leading-5 text-[var(--accent)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function Section({
  children,
  description,
  meta,
  title
}: {
  children: React.ReactNode;
  description: string;
  meta?: string;
  title: string;
}) {
  const iconName = sectionIconName(title);

  return (
    <fieldset className="local-card border-l-4 border-l-[var(--primary)] p-4">
      <legend className="px-1">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-3 py-1 text-sm font-bold text-white">
          <EventLocalIcon className="h-4 w-4 text-[var(--primary)]" name={iconName} />
          {title}
        </span>
      </legend>
      <div className="mb-3 mt-2 flex flex-wrap items-start justify-between gap-2">
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
        {meta ? (
          <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--primary-strong)]">
            {meta}
          </span>
        ) : null}
      </div>
      {children}
    </fieldset>
  );
}

function sectionIconName(title: string): EventLocalIconName {
  const icons: Record<string, EventLocalIconName> = {
    Alcohol: "alcohol",
    "Event basics": "basics",
    "Food and drinks": "food",
    Location: "city",
    "Property and public space": "property",
    "Selling and vendors": "booth",
    "Sound, signs, and promotion": "sound",
    "Structures, fire, and power": "tent",
    Timing: "calendar"
  };

  return icons[title] ?? "check";
}

function Toggle({
  checked,
  label,
  onChange
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-14 items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
      <span className="text-sm leading-5">{label}</span>
      <button
        aria-pressed={checked}
        className={`focus-ring relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-[var(--secondary)]" : "bg-[var(--line-strong)]"
        }`}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </label>
  );
}

function formatErrors(fieldErrors: Record<string, string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(fieldErrors).flatMap(([key, messages]) =>
      messages?.[0] ? [[key, messages[0]]] : []
    )
  );
}
