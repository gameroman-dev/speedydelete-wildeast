
import {Project} from '@wildeast/core';


const blankImage = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';


function create<T extends keyof HTMLElementTagNameMap>(tagName: T, className: string = '', textContent: string | null = null): HTMLElementTagNameMap[T] {
    let out = document.createElement(tagName);
    out.className = className;
    out.textContent = textContent;
    return out;
}

function query(query: string): HTMLElement {
    const out = document.querySelector(query);
    if (out === null) {
        throw new TypeError(`missing query ${query}`);
    }
    return out as HTMLElement;
}


function createProjectListEntryElement(project: Project, global: boolean = false): HTMLAnchorElement {
    const info = project.getProjectInfo();
    let out = create('a', 'project');
    out.href = `./run.html?name=${info.name}${global ? '&global=true' : ''}`;
    let iconElt = document.createElement('img');
    iconElt.src = project.thumbnail ?? blankImage;
    out.appendChild(iconElt);
    let infoElt = create('div', 'info');
    infoElt.appendChild(create('div', 'title', info.title));
    infoElt.appendChild(create('div', 'description', project.description));
    let extraInfoElt = create('div', 'extra-info');
    extraInfoElt.appendChild(create('div', 'author', String(project.author)));
    extraInfoElt.appendChild(create('div', 'plays', String(project.plays)));
    infoElt.appendChild(extraInfoElt);
    out.appendChild(infoElt);
    return out;
}

function displayProjectList(elt: HTMLElement, projects: Project[], global: boolean = false) {
    elt.append(...projects.map((project) => createProjectListEntryElement(project, global)));
}

displayProjectList(query('#global .projects'), [
    new Project({
        name: 'wbr',
        version: '1.0.0',
        title: 'What Beats Rock?',
        description: 'Play Rock Paper Scissors but it... keeps going?',
        author: 'kyle',
        license: 'UNLICENSED',
        plays: 9700000,
        thumbnail: 'https://www.whatbeatsrock.com/icon.ico',
    }),
], true);
