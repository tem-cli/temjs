import * as fs from "fs";
import * as pth from "path";

export const TESTDIR = __dirname;
export const OUTDIR = pth.join(TESTDIR, "_out");

export function prepare(module: string) {
    recreateDir(pth.join(OUTDIR, module));
}

function recreateDir(path: string) {
    try {
        fs.rmSync(path, {recursive: true});
    } catch (err) {
        console.debug(err);
    }
    fs.mkdirSync(path);
}
