/* eslint-disable @typescript-eslint/no-require-imports */
const { exec } = require("child_process");

exec("jmeter", (error, stdout, stderr) => {
    if (error) {
        console.error(error);
        return;
    }
    if (stderr) {
        console.error(stderr);
    }
    console.log(stdout);
});