import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createExtractionService,
  createOpenAIExtractionProvider,
  ExtractionConfigError,
  ExtractionInputLimitError,
  ExtractionMalformedOutputError,
  ExtractionProviderError,
  ExtractionRefusalError,
  ExtractionRequestLimitError,
  ExtractionTimeoutError
} from "@/lib/ai/extraction";

const requestSchema = z.object({
  description: z.string().trim().min(20, "Add a few sentences about the event.")
});

const logger = {
  info(metadata: object) {
    console.info("gatherwise_ai_extract", metadata);
  },
  warn(metadata: object) {
    console.warn("gatherwise_ai_extract", metadata);
  },
  error(metadata: object) {
    console.error("gatherwise_ai_extract", metadata);
  }
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.flatten().fieldErrors.description?.[0] ??
          "Add a short event description before continuing."
      },
      { status: 400 }
    );
  }

  try {
    const service = createExtractionService({
      provider: createOpenAIExtractionProvider(),
      logger
    });
    const result = await service.extract(parsed.data.description);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ExtractionConfigError) {
      return NextResponse.json(
        {
          message:
            "Describe my event is unavailable right now. Use the guided form instead."
        },
        { status: 503 }
      );
    }

    if (error instanceof ExtractionInputLimitError) {
      return NextResponse.json({ message: error.message }, { status: 413 });
    }

    if (error instanceof ExtractionTimeoutError) {
      return NextResponse.json(
        {
          message:
            "The description review took too long. Try again or use the guided form."
        },
        { status: 504 }
      );
    }

    if (error instanceof ExtractionRequestLimitError) {
      return NextResponse.json(
        {
          message:
            "The description path is temporarily limited. Use the guided form for now."
        },
        { status: 429 }
      );
    }

    if (error instanceof ExtractionRefusalError) {
      return NextResponse.json(
        {
          message:
            "We could not turn that description into structured event facts. Try the guided form instead."
        },
        { status: 422 }
      );
    }

    if (
      error instanceof ExtractionMalformedOutputError ||
      error instanceof ExtractionProviderError
    ) {
      return NextResponse.json(
        {
          message:
            "We could not extract event details safely. You can retry or use the guided form."
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        message:
          "We could not review that description right now. Use the guided form instead."
      },
      { status: 500 }
    );
  }
}
