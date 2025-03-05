import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
    const { testFile } = await req.json();
    if(!testFile) return NextResponse.json({ error: 'No test file provided'}, { status: 400});

    const testPath = path.join(process.cwd(), 'public', 'test-scripts', testFile);
    const resultsDir = path.join(process.cwd(), `public`, `results`);
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(resultsDir, `${testFile}-${timestamp}.log`);
    const logStream = fs.createWriteStream(logFile, { flags: 'a'});

    const jmeterCommand = 'jmeter';

    try {

        const process = spawn(jmeterCommand, ['-n', '-t', testPath]);

        const encoder = new TextEncoder();
        
        return new Response(
            new ReadableStream({
                start(controller) {
                    process.stdout.on('data', (data) => {
                        const message = `data: ${data.toString()}`
                        controller.enqueue(encoder.encode(message));
                        logStream.write(data);
                    });
                    process.stderr.on('data', (data) => {
                        const errorMessage = `data: ERROR: ${data.toString()}`
                        controller.enqueue(encoder.encode(errorMessage));
                        logStream.write(data);
                    });
                    process.on('close', (code) => {
                        logStream.write(`\nTest finished with exit code: ${code}\n`);
                        logStream.end();
                        controller.enqueue(encoder.encode(`\nTest finished with exit code ${code}`));
                        controller.close();
                    });
                }
            }), {
                headers: { 
                    'Content-Type': 'text/event-stream' ,
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                }
            }
        );
    } catch (error) {
        return NextResponse.json({ message: 'Failed to execute test', error: error }, { status: 500 });
    }
}