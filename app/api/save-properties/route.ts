import { NextResponse } from "next/server";
import fs from "fs";
import type { Properties } from "@/app/lib/types";
import { PROPERTIES_FILE } from "@/app/lib/constants";

interface RequestBody {
  properties?: { [key: string]: string }; // Key-value pairs to update or add
}


async function readProperties(): Promise<Properties> {
  try {
    const content = fs.readFileSync(PROPERTIES_FILE, "utf-8");
    const properties: Properties = {};
    content.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value !== undefined) {
        properties[key.trim()] = value.trim();
      }})
    return properties;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw new Error(`Failed to read properties file: ${err}`);
  }
}

async function writeProperties(properties: Properties): Promise<void> {
  try {
    const content = Object.entries(properties)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
    fs.writeFileSync(PROPERTIES_FILE, content, "utf-8");
  } catch (err) {
    throw new Error(`Failed to write properties file: ${err}`);
  }
}

export async function POST(req: Request) {
  try {
    const { properties } = await req.json() as RequestBody;

    if (!properties || typeof properties !== "object" || Object.keys(properties).length === 0) {
      return NextResponse.json({ error: "Properties object is required and must not be empty" }, { status: 400 });
    }

    // Validate keys and values
    for (const [key, value] of Object.entries(properties)) {
      if (!key || typeof key !== "string" || typeof value !== "string") {
        return NextResponse.json({ error: `Invalid key or value for ${key}` }, { status: 400 });
      }
      if (key.includes("=") || key.includes("\n") || value.includes("\n")) {
        return NextResponse.json({ error: `Key ${key} or its value contains invalid characters` }, { status: 400 });
      }
    }

    const existingProps = await readProperties();
    const updatedProps = { ...existingProps, ...properties };

    await writeProperties(updatedProps);

    const updatedKeys = Object.keys(properties).join(", ");
    return NextResponse.json(
      { success: true, message: `Modified properties: ${updatedKeys}` },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error processing request:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const properties = await readProperties();
    return NextResponse.json({ success: true, properties }, { status: 200 });
  } catch (err) {
    console.error("Error reading properties:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to read properties" },
      { status: 500 }
    );
  }
}