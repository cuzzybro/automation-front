import { NextResponse } from 'next/server';
import fs from 'fs';
import { TEST_DIR } from '@/app/lib/constants';

export async function GET() {

    try {

      const files = fs.readdirSync(TEST_DIR).filter(file => file.endsWith('.jmx'));

      return NextResponse.json({ tests: files });

    } catch (error) {

      return NextResponse.json( { message: 'Failed to load test scripts', error: error }, { status: 500 } );

    }

}
