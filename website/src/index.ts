
import {type ProjectDisplayInfo} from '@wildeast/core';


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


function createProjectListEntryElement(info: ProjectDisplayInfo, global: boolean = false): HTMLAnchorElement {
    let out = create('a', 'project');
    out.href = `./run.html?name=${info.name}${global ? '&global=true' : ''}`;
    let iconElt = document.createElement('img');
    iconElt.src = info.thumbnail ?? blankImage;
    out.appendChild(iconElt);
    let infoElt = create('div', 'info');
    infoElt.appendChild(create('div', 'title', info.title));
    infoElt.appendChild(create('div', 'description', info.description));
    let extraInfoElt = create('div', 'extra-info');
    extraInfoElt.appendChild(create('div', 'author', String(info.author)));
    extraInfoElt.appendChild(create('div', 'plays', String(info.plays)));
    infoElt.appendChild(extraInfoElt);
    out.appendChild(infoElt);
    return out;
}

function displayProjectList(elt: HTMLElement, projects: ProjectDisplayInfo[], global: boolean = false) {
    elt.append(...projects.map((project) => createProjectListEntryElement(project, global)));
}

(async () => {
    const response = await fetch('global_projects/index.json');
    if (response.ok) {
        let data = await response.json() as ProjectDisplayInfo[];
        data = data.sort((a, b) => a.plays - b.plays);
        displayProjectList(query('#global .projects'), data, true);
    } else {
        query('#global .projects').innerHTML = `${response.status} ${response.statusText} while fetching global_projects/index.json`;
    }
})();
