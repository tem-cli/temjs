
export class NoTemDirInHierarchyError extends Error {
    constructor(path: string) {
        super(path);
    }
}

export class NotATemDirError extends Error {
    constructor(path: string) {
        super(path);
    }
}

export class TemInitializedError extends Error {
    constructor(path: string) {
        super(path);
    }
}