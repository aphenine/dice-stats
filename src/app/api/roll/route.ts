import { NextRequest, NextResponse } from "next/server";
import { ParseError } from "@/roller/parser/parse";
import { MAX_SAMPLES, sampleExpression } from "@/roller/services/sample";

/**
 * Rolls a dice expression.
 *
 *   GET  /api/roll?expression=total(3d6)&times=10
 *   POST /api/roll  { "expression": "total(3d6)", "times": 10 }
 *
 * `times` defaults to 1. Responds 400 with { error } for bad input.
 */
export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    return roll(params.get("expression"), params.get("times"));
}

export async function POST(request: NextRequest) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return error("Request body must be JSON");
    }

    if (typeof body !== "object" || body === null) {
        return error("Request body must be a JSON object");
    }

    const { expression, times } = body as Record<string, unknown>;

    return roll(expression, times);
}

function roll(expression: unknown, times: unknown) {
    if (typeof expression !== "string" || expression.trim() === "") {
        return error("'expression' is required");
    }

    const count = times === undefined || times === null || times === "" ? 1 : Number(times);
    if (!Number.isInteger(count) || count < 1 || count > MAX_SAMPLES) {
        return error(`'times' must be an integer between 1 and ${MAX_SAMPLES}`);
    }

    try {
        return NextResponse.json(sampleExpression(expression, count));
    } catch (e) {
        if (e instanceof ParseError) {
            return error(e.message);
        }
        throw e;
    }
}

function error(message: string) {
    return NextResponse.json({ error: message }, { status: 400 });
}
