# Gatherwise AI Extraction Provider

Date: 2026-07-13

## Current dependency inspection

Confirmed in the repository before this implementation:

- no OpenAI SDK dependency
- no Anthropic SDK dependency
- no LangChain dependency
- no Vercel AI SDK dependency
- no existing model-runtime client

Because of that, the provider uses a server-only HTTP integration with injected `fetch` instead of adding a client bundle or a new SDK dependency.

## Purpose

The AI extraction provider has one narrow responsibility:

- turn untrusted natural-language event text into structured event-fact candidates

It may:

- parse an event description
- map phrases to existing intake fields
- mark facts as `extracted` or `unknown`
- capture supporting text
- identify ambiguity

It may not:

- decide permit applicability
- invent facts
- interpret law
- add unsupported fields
- select requirements
- create source links

## Server-only boundary

The implementation lives in [lib/ai/extraction.ts](/Volumes/SSD%201/Codex/EventLocalMVP/lib/ai/extraction.ts) and is marked server-only.

- API keys stay server-side
- no `NEXT_PUBLIC_*` AI secrets are used
- no raw prompt or raw response is logged
- logging is limited to safe operational metadata

## Configuration

Supported environment variables:

- `GATHERWISE_AI_EXTRACTION_ENABLED`
- `OPENAI_API_KEY`
- `GATHERWISE_AI_MODEL`
- `GATHERWISE_AI_TIMEOUT_MS`
- `GATHERWISE_AI_MAX_INPUT_CHARS`
- `GATHERWISE_AI_REQUEST_LIMIT`
- `GATHERWISE_AI_MAX_OUTPUT_TOKENS`

The model name is configuration-driven. It is not hard-coded as a permanent production assumption.

## Reliability and safety

Implemented safeguards:

- structured JSON-schema output
- strict schema validation
- input-length limit
- timeout and cancellation via `AbortController`
- bounded retries for retryable provider failures
- refusal handling
- malformed-output handling
- missing-key normalization to `unknown`
- mock provider
- dependency injection
- safe operational logging only

## Prompt-injection resistance

The system prompt explicitly states that instructions inside the event description are event content, not commands.

The provider does not send official source documents to the model during extraction.

## Output behavior

The provider normalizes results into:

- extracted facts
- unknown facts for omitted fields
- explicit ambiguity records for contradictory or unclear fields

This keeps the manual path intact and prevents the extraction layer from silently inventing certainty.
