import { NextResponse } from "next/server";
import fs from "fs";
import { PROPERTIES_FILE } from "@/lib/constants";

export async function GET() {

    try {
        const fileContent = fs.readFileSync( PROPERTIES_FILE, 'utf8' );
        const properties: { [key: string]: string } = {};

        fileContent.split("\n").forEach((line) => {
            const [key, value] = line.split('=');
            if (key && value !== undefined ) {
                properties[key.trim()] = value.trim();
            }
        });

        return NextResponse.json(properties, {
            status: 200,
        });
    } catch (err) {
        return NextResponse.json({ error: err ?? "Failed to read properties file" }, { status: 500 });
    }

}