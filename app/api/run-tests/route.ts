import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { TEST_DIR, RESULTS_DIR } from "@/app/lib/constants";

export async function POST(req: Request) {

    const { testFiles } = await req.json();

    if ( !testFiles || !Array.isArray(testFiles) || testFiles.length === 0 ) {
        return NextResponse.json( { error: 'No test file provided'}, { status: 400} );
    }

    if ( !fs.existsSync( RESULTS_DIR ) ) fs.mkdirSync( RESULTS_DIR );

    const jmeterCommand = `jmeter`;

    const responseStream = new ReadableStream({
        start( controller ) {

            async function runTestsSequentially() {

                for ( const testFile of testFiles ) {

                    const testPath = path.join( TEST_DIR, testFile );

                    const timestamp = new Date().toISOString().replace( /[:.]/g, '-' );

                    const logFile = path.join( RESULTS_DIR, `${testFile}-${timestamp}.log` );

                    const logStream = fs.createWriteStream( logFile, { flags: 'a' } );

                    controller.enqueue( `\nRunning test: ${testFile}\n` );

                    // to use the properties set in the user.properties file in a particular directory, jmeter should be launched from there
                    // using cwd option in spawn you can provide the directory path and ensure jmeter launches from there
                    const jr = spawn(jmeterCommand , ['-n', '-t', testPath], { cwd: TEST_DIR });

                    await new Promise( (resolve) => {
                        jr.stdout.on( 'data', ( data ) => {
                            controller.enqueue( data );
                            logStream.write( data );
                        });
                        jr.stderr.on( 'data', ( data ) => {
                            controller.enqueue( data );
                            logStream.write( data );
                        });
                        jr.on( 'close', ( code ) => {
                            logStream.write( `\nTest finished with exit code: ${code}\n` );
                            logStream.end();
                            controller.enqueue( `\nTest finished with exit code ${code}\n` );
                            resolve( null );
                        });
                    });
                }

                controller.close();

            }

            runTestsSequentially();

        }
    });

    return new Response( responseStream, {
        headers: { 'Content-Type': "text/plain" }
    });

}