import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {

    try {

        const resultsDir = path.join(process.cwd(), "public", "results");
        if (!fs.existsSync(resultsDir)) return NextResponse.json({ results: [] });

        const files = fs.readdirSync(resultsDir).filter(file => file.endsWith(".log"));
        return NextResponse.json({ results: files });

    } catch (error) {
        return NextResponse.json({ message: 'Failed to load results', error: error }, { status: 500 });
    }
}