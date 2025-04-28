import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {

    try {

      const testDir = path.join(process.cwd(), 'public', 'test-scripts');

      const files = fs.readdirSync(testDir).filter(file => file.endsWith('.jmx'));

      return NextResponse.json({ tests: files });

    } catch (error) {

      return NextResponse.json( { message: 'Failed to load test scripts', error: error }, { status: 500 } );

    }

}
