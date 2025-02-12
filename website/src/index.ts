
import {Project} from '@wildeast/core';


const blankImage = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';


function createDiv(className: string = '', textContent: string | null = null): HTMLDivElement {
    let out = document.createElement('div');
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


function createProjectListEntryElement(project: Project): HTMLDivElement {
    let out = createDiv('project');
    let icon = document.createElement('img');
    icon.src = project.thumbnail ?? blankImage;
    out.appendChild(icon);
    let info = createDiv('info');
    info.appendChild(createDiv('title', project.title));
    info.appendChild(createDiv('description', project.description));
    let extraInfo = createDiv('extra-info');
    extraInfo.appendChild(createDiv('plays', String(project.plays)));
    extraInfo.appendChild(createDiv('author', String(project.author)));
    info.appendChild(extraInfo);
    out.appendChild(info);
    return out;
}

function displayProjectList(elt: HTMLElement, projects: Project[]) {
    elt.append(...projects.map(createProjectListEntryElement));
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
]);
