import { NextResponse } from 'next/server';
import fs from 'fs';
import path from "path";

export async function GET() {

    const filePath = path.join(process.cwd(), "public", "test-scripts", "user.properties");

    try {

        const fileContent = fs.readFileSync(filePath, "utf8");

        const isEmpty = !fileContent.includes("userid=") || !fileContent.includes("f10pw=") || !fileContent.includes("pw=") ||
                        fileContent.includes("userid=\n") || fileContent.includes("f10pw=\n") || fileContent.includes("pw=\n");

        return NextResponse.json({ isEmpty }, { status: 200});

    } catch (error) {

        return NextResponse.json({ error: error }, { status: 400 });

    }
}