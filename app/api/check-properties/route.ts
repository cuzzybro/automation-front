import { NextResponse } from 'next/server';
import fs from 'fs';
import { PROPERTIES_FILE } from '@/lib/constants';

export async function GET() {

    try {

        const fileContent = fs.readFileSync(PROPERTIES_FILE, "utf8");

        const isEmpty = !fileContent.includes("userid=") || !fileContent.includes("f10pw=") || !fileContent.includes("pw=") ||
                        fileContent.includes("userid=\n") || fileContent.includes("f10pw=\n") || fileContent.includes("pw=\n");

        return NextResponse.json({ isEmpty }, { status: 200});

    } catch (error) {

        return NextResponse.json({ error: error }, { status: 400 });

    }
}