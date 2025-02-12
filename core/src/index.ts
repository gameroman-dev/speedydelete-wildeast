
import {FileSystem} from 'fake-node/_fs';


export interface ProjectInfo {
    name: string;
    version: string;
    title: string;
    description: string;
    author: string;
    license: string;
    plays: number;
}


export class Project implements ProjectInfo {

    fs: FileSystem;

    constructor(name: string, info: ProjectInfo) {
        this.fs = new FileSystem();
    }

    getProjectInfo(): ProjectInfo {
        return JSON.parse(this.fs.readFrom('project.json'));
    }

    setProjectInfo(info: ProjectInfo): void {
        this.fs.writeTo('project.json', JSON.stringify(info, undefined, 4));
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
