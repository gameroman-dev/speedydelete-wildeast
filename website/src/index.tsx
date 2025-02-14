
import {type ProjectDisplayInfo} from '@wildeast/core';
import {JSX, query, type Node} from './jsx';
void JSX;


const defaultThumbnail = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';


function ProjectList({infos, global = false}: {infos: ProjectDisplayInfo[], global?: unknown}): Node {
    return (
        <div class='projects'>
            {infos.map(info => (
                <a class='project' href={`run.html?name=${info.name}&global=${Boolean(global)}`}>
                    <div class='title'>{info.title}</div>
                    <div class='description'>{info.description}</div>
                    <div class='author'>{info.author}</div>
                    <div class='plays'>{info.plays}</div>
                    <img src={info.thumbnail ?? defaultThumbnail} />
                </a>
            ))}
        </div>
    );
}

(async () => {
    const response = await fetch('global_projects/index.json');
    if (response.ok) {
        let data = await response.json() as ProjectDisplayInfo[];
        data = data.sort((a, b) => b.plays - a.plays);
        query('#global .projects').append(<ProjectList infos={data} global />);
    } else {
        query('#global .projects').innerHTML = `${response.status} ${response.statusText} while fetching global_projects/index.json`;
    }
})();


let localSection = query('#local');
let globalSection = query('#global');
let localGlobalSwitch = query('#local-global-switch');
let globalShown = true;
localGlobalSwitch.addEventListener('click', () => {
    globalShown = !globalShown;
    if (globalShown) {
        localGlobalSwitch.textContent = 'My Projects';
        globalSection.style.display = 'block';
        localSection.style.display = 'none';
    } else {
        localGlobalSwitch.textContent = 'Community Projects';
        globalSection.style.display = 'none';
        localSection.style.display = 'block';
    }
});


let createFormElt = query('#create-form');
query('#open-create-form-button').addEventListener('click', () => {
    createFormElt.style.display = 'flex';
});
query('#create-form .x-button').addEventListener('click', () => {
    createFormElt.style.display = 'none';
});

query('#create-button').addEventListener('click', () => {
    const name = (query('#create-input-name') as HTMLInputElement).value;
    const title = (query('#create-input-title') as HTMLInputElement).value;
    if (!name.match(/^[a-z0-9._~\-]*$/)) {
        alert('ID contains invalid characters');
        return;
    }
    if (name.length > 16) {
        alert('ID cannot be more than 16 characters');
        return;
    }
    if (title.length > 32) {
        alert('Name cannot be more than 32 characters');
        return;
    }
    if (name.length === 0 || title.length === 0) {
        alert('ID or name cannot be empty');
        return;
    }
    localStorage.wildeastNextGameTitle = title;
    window.location.replace(`edit.html?${new URLSearchParams({name})}`);
});
