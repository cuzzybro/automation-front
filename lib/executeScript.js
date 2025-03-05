import { exec } from "child_process";

export function runShellScript() {
    return new Promise((resolve, reject) => {
        exec("jmeter -n -t './testing.jmx'", (err, stdout, stderr) => {
            if (err) {
                console.log("err caught")
                return reject(err.message);
            }
            if(stderr){
                console.log("stderr caught")
                return reject(stderr);
            }
            return resolve(stdout);
        });
    });
}