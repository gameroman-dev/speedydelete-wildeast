
import {FileSystem, setCwdGetter, setUidGetter, setGidGetter} from 'fake-node/_fs';

// remove dependancy on fake-node for _fs
setCwdGetter(() => '/');
setUidGetter(() => 0);
setGidGetter(() => 0);


export interface ProjectDisplayInfo {
    name: string;
    title: string;
    description: string;
    author: string;
    thumbnail?: string;
}

export interface ProjectInfo extends ProjectDisplayInfo {
    version: string;
    license: string;
}


const exportHeader = 'wildeast project\n';

const decoder = new TextDecoder();


export class Project implements ProjectInfo {

    fs: FileSystem;

    constructor(fs: FileSystem);
    constructor(info: ProjectInfo);
    constructor(fs_or_info: FileSystem | ProjectInfo) {
        if (fs_or_info instanceof FileSystem) {
            this.fs = fs_or_info;
        } else {
            this.fs = new FileSystem();
            this.fs.writeTo('project.json', '{}');
            this.name = fs_or_info.name;
            this.version = fs_or_info.version;
            this.title = fs_or_info.title;
            this.description = fs_or_info.description;
            this.author = fs_or_info.author;
            this.license = fs_or_info.license;
            this.thumbnail = fs_or_info.thumbnail;
        }
    }

    read(path: string): string {
        return this.fs.readFrom(path);
    }

    write(path: string, data: string): void {
        this.fs.writeTo(path, data);
    }

    getProjectInfo(): ProjectInfo {
        return JSON.parse(this.read('project.json'));
    }

    setProjectInfo(info: ProjectInfo): void {
        this.write('project.json', JSON.stringify(info));
    }

    export(): Uint8Array {
        const data = this.fs.fsExport();
        let out = new Uint8Array(exportHeader.length + data.length);
        out.set((new TextEncoder()).encode(exportHeader), 0);
        out.set(data, exportHeader.length);
        return out;
    }

    static import(data: Uint8Array): Project {
        const header = (new TextDecoder()).decode(data.slice(0, exportHeader.length));
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

    get thumbnail(): string | undefined {
        return this.getProjectInfo().thumbnail;
    }

    set thumbnail(value: string | undefined) {
        let info = this.getProjectInfo();
        info.thumbnail = value;
        this.setProjectInfo(info);
    }

}
