
import {FileSystem, encode, decode} from 'fake-node/_fs';


export interface ProjectInfo {
    name: string;
    version: string;
    title: string;
    description: string;
    author: string;
    license: string;
    plays: number;
}


const exportHeader = 'wildeast project\n';


export class Project implements ProjectInfo {

    fs: FileSystem;

    constructor(fs: FileSystem);
    constructor(info: ProjectInfo);
    constructor(fs_or_info: FileSystem | ProjectInfo) {
        if (fs_or_info instanceof FileSystem) {
            this.fs = fs_or_info;
        } else {
            this.fs = new FileSystem();
            this.name = fs_or_info.name;
            this.version = fs_or_info.version;
            this.description = fs_or_info.description;
            this.author = fs_or_info.author;
            this.license = fs_or_info.license;
            this.plays = fs_or_info.plays;
        }
    }

    getProjectInfo(): ProjectInfo {
        return JSON.parse(this.fs.readFrom('project.json'));
    }

    setProjectInfo(info: ProjectInfo): void {
        this.fs.writeTo('project.json', JSON.stringify(info, undefined, 4));
    }

    export(): Uint8Array {
        const data = this.fs.fsExport();
        let out = new Uint8Array(exportHeader.length + data.length);
        out.set(encode(exportHeader), 0);
        out.set(data, exportHeader.length);
        return out;
    }

    static import(data: Uint8Array): Project {
        const header = decode(data.slice(0, exportHeader.length));
        if (header !== exportHeader) {
            throw new TypeError(`invalid project file: ${data}`);
        }
        return new Project(FileSystem.fsImport(data.slice(exportHeader.length)));
    }

    get name(): string {
        return this.getProjectInfo().name;
    }

    set name(value: string) {
        let info = this.getProjectInfo();
        info.name = value;
        this.setProjectInfo(info);
    }

    get version(): string {
        return this.getProjectInfo().version;
    }

    set version(value: string) {
        let info = this.getProjectInfo();
        info.version = value;
        this.setProjectInfo(info);
    }

    get title(): string {
        return this.getProjectInfo().title;
    }

    set title(value: string) {
        let info = this.getProjectInfo();
        info.title = value;
        this.setProjectInfo(info);
    }

    get description(): string {
        return this.getProjectInfo().description;
    }

    set description(value: string) {
        let info = this.getProjectInfo();
        info.description = value;
        this.setProjectInfo(info);
    }

    get author(): string {
        return this.getProjectInfo().author;
    }

    set author(value: string) {
        let info = this.getProjectInfo();
        info.author = value;
        this.setProjectInfo(info);
    }

    get license(): string {
        return this.getProjectInfo().license;
    }

    set license(value: string) {
        let info = this.getProjectInfo();
        info.license = value;
        this.setProjectInfo(info);
    }

    get plays(): number {
        return this.getProjectInfo().plays;
    }

    set plays(value: number) {
        let info = this.getProjectInfo();
        info.plays = value;
        this.setProjectInfo(info);
    }

}
