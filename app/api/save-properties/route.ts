import { NextResponse } from "next/server";
import fs from 'fs';
import path from "path";

export async function POST(req: Request) {

    try {
        const { userid, f10pw, pw } = await req.json();

        if (userid==undefined || f10pw==undefined || pw==undefined) return NextResponse.json({ error: "All properties required" }, { status: 400 });

        const filePath = path.join(process.cwd(), "public", "test-scripts", "user.properties");

        const content = `userid=${userid}\nf10pw=${f10pw}\npw=${pw}\n`;

        fs.writeFileSync(filePath, content, "utf8");

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (err) {

        return NextResponse.json({ error: err ?? 'failed to save properties' }, { status: 500 });

    }
}