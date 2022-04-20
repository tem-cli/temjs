import * as pth from "path";
import * as process from "process";
import * as fs from "fs";
import {NotATemDirError, NoTemDirInHierarchyError, TemInitializedError} from "./errors";

export type AnyPath = string | TemDir;

export class TemDir {
    path: string;
    constructor(path?: AnyPath) {
        if (path instanceof TemDir) {
            this.path = path.path;
            return;
        } else if (path == undefined) {
            for (let dir of iterateHierarchy(process.cwd())) {
                if (TemDir.hasDotTem(dir)) {
                    this.path = dir;
                    break;
                }
            }
            // @ts-ignore
            if (!this.path)
                throw new NoTemDirInHierarchyError(process.cwd());
        } else if (typeof path === "string") {
            if (TemDir.hasDotTem(path))
                this.path = path;
            else
                throw new NotATemDirError(path);
        } else {
            throw TypeError("Parameter 'path' must be a string or TemDir.")
        }
    }

    get parent(): AnyPath {
        let parent = pth.dirname(this.path);
        try {
            return new TemDir(parent);
        } catch (err) {
            return parent;
        }
    }

    get temParent(): TemDir | null {
        let parent = this.parent as any;
        let directory = parent.path || parent;
        const root = pth.parse(directory).root;
        while (directory != root) {
            try {
                return new TemDir(directory);
            } catch (err) {
                directory = pth.dirname(directory);
            }
        }
        return null;
    }

    equals(temdir: TemDir) {
        return this.path == temdir.path;
    }

    /**
     * Initialize a temdir at `path`.
     * @param path Path to initialize at.
     * @param force Re-initialize temdir from scratch.
     * @returns The newly initialized temdir at `path`.
     */
    static init(path: string, force: boolean = false) {
        const dotTem = pth.join(path, ".tem");
        try {
            let temdir = new TemDir(path);
            if (force)
                fs.rmSync(dotTem);
            else
                throw new TemInitializedError(temdir.path);
            return temdir;
        } catch (err) {
            if (!(err instanceof NotATemDirError))
                throw err;
        }
        fs.mkdirSync(dotTem, {recursive: true});
        fs.mkdirSync(pth.join(dotTem, "path"), {recursive: true});
        fs.mkdirSync(pth.join(dotTem, "hooks"), {recursive: true});
        fs.mkdirSync(pth.join(dotTem, "env"), {recursive: true});
        // TODO create subdirs for shell-env
        // TODO copy system config
        return new TemDir(path);
    }

    private static hasDotTem(path: string) {
        let dotTem = pth.join(path, ".tem");
        return fs.existsSync(dotTem) && fs.lstatSync(dotTem).isDirectory();
    }
}

export class DotDir {
}

function* iterateHierarchy(path: string | TemDir) {
    if (path instanceof TemDir)
        path = path.path
    yield path;
    while (true) {
        path = pth.dirname(path);
        yield path;
        if (path == "/")
            break;
    }
}