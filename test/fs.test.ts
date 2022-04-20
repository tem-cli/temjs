import { TemDir } from "../fs";
import * as pth from "path";
import * as fs from "fs";
import * as common from "./common";
import { expect, assert } from "chai";
import { NotATemDirError } from "../errors";

// Test output and itermediate files
const OUTDIR = pth.join(common.OUTDIR, "fs");
const TEMDIR = pth.join(OUTDIR, "temdir");
const NOT_A_TEMDIR = pth.join(OUTDIR, "not_a_temdir");
const TEMDIR1 = pth.join(TEMDIR, "temdir1");
const TEMDIR2 = pth.join(TEMDIR1, "temdir2");
const NOT_A_TEMDIR2 = pth.join(TEMDIR2, "not_a_temdir2");

let temdir: TemDir;
let temdir1: TemDir;

describe("TemDir", () => {
    before(() => {
        common.prepare("fs");
        for (const dir of [
            TEMDIR,
            TEMDIR1,
            TEMDIR2,
            NOT_A_TEMDIR,
            NOT_A_TEMDIR2,
        ])
            fs.mkdirSync(dir);
    });
    it("Initialize temdirs", () => {
        temdir = TemDir.init(TEMDIR);
        assert.ok(fs.lstatSync(temdir.path).isDirectory());
        TemDir.init(TEMDIR1);
        TemDir.init(TEMDIR2);
    });
    it("constructor", () => {
        // Valid temdir
        new TemDir(TEMDIR);

        // Invalid temdir
        expect(() => {
            new TemDir(NOT_A_TEMDIR);
        }).to.throw(NotATemDirError);

        // Automatically find temdir in hierarchy
        const cwd = process.cwd();
        process.chdir(NOT_A_TEMDIR2);
        assert.equal(pth.resolve(new TemDir().path), TEMDIR2);
        process.chdir(cwd);
    });
    it("parent", () => {
        temdir = new TemDir(TEMDIR);
        temdir1 = new TemDir(TEMDIR1);
        assert.ok((temdir1.parent as TemDir).equals(temdir));
        assert.equal(temdir.parent, OUTDIR);
    });
    it("temParent", () => {
        temdir = new TemDir(TEMDIR);
        temdir1 = new TemDir(TEMDIR1);
        assert.ok(temdir1.temParent?.equals?.(temdir));
        // We would just be asserting temdir.temParent == null, if we could guarantee that the tests/ directory is
        // not in a hierarchy that has a temdir
        assert.ok(temdir.temParent == null || temdir.temParent.path != OUTDIR);
    });
});
