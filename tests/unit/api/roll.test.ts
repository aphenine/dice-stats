/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/roll/route";
import { rollerService } from "@/roller/services/roller";

function get(query: string) {
    return GET(new NextRequest(`http://localhost/api/roll${query}`));
}

function post(body: unknown) {
    return POST(new NextRequest("http://localhost/api/roll", {
        method: "POST",
        body: typeof body === "string" ? body : JSON.stringify(body),
        headers: { "content-type": "application/json" },
    }));
}

describe("/api/roll", () => {
    afterEach(() => jest.restoreAllMocks());

    it("rolls an expression once by default via GET", async () => {
        jest.spyOn(rollerService, "rollDice").mockReturnValue(4);

        const response = await get("?expression=total(3d6)");

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            expression: "total(3d6)",
            type: "scalar",
            times: 1,
            samples: [12],
        });
    });

    it("rolls an expression several times via POST and reports array results", async () => {
        jest.spyOn(rollerService, "rollDice").mockReturnValue(2);

        const response = await post({ expression: "remove(3d6, 1)", times: 2 });

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            expression: "remove(3d6, 1)",
            type: "array",
            times: 2,
            samples: [[2, 2], [2, 2]],
        });
    });

    it("returns 400 with the parse error for an invalid expression", async () => {
        const response = await get("?expression=total(3d6,%20d4)");

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            error: "total(array, scalar) does not match total(array) or total(scalar, scalar...) (at position 0)",
        });
    });

    it("returns 400 when the expression is missing", async () => {
        expect((await get("")).status).toBe(400);
        expect((await post({})).status).toBe(400);
    });

    it("returns 400 for a bad times value", async () => {
        expect((await get("?expression=d6&times=0")).status).toBe(400);
        expect((await get("?expression=d6&times=1.5")).status).toBe(400);
        expect((await post({ expression: "d6", times: "lots" })).status).toBe(400);
    });

    it("returns 400 for a non-JSON body", async () => {
        const response = await post("not json");

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Request body must be JSON" });
    });
});
