import { NextResponse } from "next/server";
import fs from "fs/promises";
import { Properties } from "@/app/lib/types";
import { PROPERTIES_FILE } from "@/app/lib/constants";

async function readProperties(): Promise<Properties> {
  try {
    const content = await fs.readFile(PROPERTIES_FILE, "utf-8");
    const properties: Properties = {};
    content.split("\n").forEach((line) => {
      const prop = line.trim();
      if (prop && !prop.startsWith("#") && !prop.startsWith("!")) {
        const [key, value] = prop.split("=", 2);
        if (key && value !== undefined) {
          properties[key.trim()] = value.trim();
        }
      }
    });
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
    await fs.writeFile(PROPERTIES_FILE, content, "utf-8");
  } catch (err) {
    throw new Error(`Failed to write properties file: ${err}`);
  }
}

export async function DELETE(req: Request) {
  try {
    const { key } = await req.json();

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Key is required and must be a string" }, { status: 400 });
    }

    if (key.includes("=") || key.includes("\n")) {
      return NextResponse.json({ error: "Key contains invalid characters" }, { status: 400 });
    }

    const properties = await readProperties();

    if (!properties[key]) {
      return NextResponse.json({ error: `Key "${key}" does not exist` }, { status: 400 });
    }

    delete properties[key];
    await writeProperties(properties);

    return NextResponse.json({ success: true, message: `Deleted property: ${key}` }, { status: 200 });
  } catch (err) {
    console.error("Error deleting property:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to delete property" },
      { status: 500 }
    );
  }
}