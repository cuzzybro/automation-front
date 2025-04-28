import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    const filePath = path.join( process.cwd(), "public", "test-scripts", "user.properties" );

    try {
        const fileContent = fs.readFileSync( filePath, 'utf8' );
        const properties: { [key: string]: string } = {};

        fileContent.split("\n").forEach((line) => {
            const [key, value] = line.split('=');
            if (key && value !== undefined ) {
                properties[key.trim()] = value.trim();
            }
        });

        return NextResponse.json({
            userid: properties["userid"] || "",
            f10pw: properties["f10pw"] || "",
            pw: properties["pw"] || "",
        },{
            status: 200,
        });
    } catch (err) {
        return NextResponse.json({ error: err ?? "Failed to read properties file" }, { status: 500 });
    }

}