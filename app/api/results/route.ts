import { NextResponse } from "next/server";
import fs from "fs";
import { RESULTS_DIR } from "@/app/lib/constants";

export async function GET() {

    try {

        if ( !fs.existsSync( RESULTS_DIR ) ) return NextResponse.json({ results: [] });

        const files = fs.readdirSync( RESULTS_DIR ).filter( file => file.endsWith( ".log" ) );
        return NextResponse.json( { results: files } );

    } catch ( error ) {
        return NextResponse.json( { message: 'Failed to load results', error: error }, { status: 500 } );
    }
}