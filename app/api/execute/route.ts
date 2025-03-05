import { NextResponse } from "next/server";
import { exec } from 'child_process';

export async function GET() {
    try {
        const command = `jmeter -n -t "/Users/les/projects/next/automation-front/lib/tests/testing.jmx"`;

        return await new Promise((resolve) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('JMeter execution error:', error);
                    resolve(NextResponse.json({ success: false, error: stderr || error.message}));
                    return;
                }
                console.log('JMeter output', stdout);
                resolve(NextResponse.json({ success: true, message: 'test executed successfully'}));
            });
        });
        
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message });
    }
}