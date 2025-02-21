
import {Project, type ProjectDisplayInfo} from '@wildeast/core';
import {showOpenFilePicker} from 'show-open-file-picker';
import {JSX, query, makeShowHideButton} from './jsx';
import {getAllProjectsMetadata, setProject} from './idb_manager';


const defaultThumbnail = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';


function ProjectList({infos, global = false}: {infos: ProjectDisplayInfo[], global?: unknown}): HTMLDivElement {
    return (
        <div class='projects'>
            {infos.map(info => (
                <a class='project' href={`${global ? 'run' : 'edit'}.html?name=${info.name}${global ? '&global=true' : ''}`}>
                    <div class='title'>{info.title}</div>
                    <div class='description'>{info.description}</div>
                    <div class='author'>{info.author}</div>
                    <img src={info.thumbnail ?? defaultThumbnail} />
                </a>
            ))}
        </div>
    );
}

const response = await fetch('global_projects/index.json');
if (response.ok) {
    let data = await response.json() as ProjectDisplayInfo[];
    for (let i = data.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
    }
    query('#global .projects').append(<ProjectList infos={data} global />);
} else {
    query('#global .projects').innerHTML = `${response.status} ${response.statusText} while fetching global_projects/index.json`;
}

async function addLocalProjects() {
    const elt = query('#local .projects');
    for (const child of elt.children) {
        child.remove();
    }
    elt.append(<ProjectList infos={await getAllProjectsMetadata()} />);
}

addLocalProjects();


const localGlobalSwitch = query('#local-global-switch');
makeShowHideButton(localGlobalSwitch, query('#local'), query('#global'), (shown) => {
    localGlobalSwitch.textContent = shown ? 'My Projects' : 'Community Projecrs';
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
    localStorage.wildeastNewProjectTitle = title;
    localStorage.wildeastNewProjectTemplate = (query('#create-input-template') as HTMLSelectElement).value;
    window.location.replace(`edit.html?${new URLSearchParams({name})}`);
});

const pickerOptions = {
    types: [
        {
            description: 'Wild East projects',
            accept: {
                'application/x-wildeast-project': ['.project'],
            },
        },
    ],
};

query('#import-button').addEventListener('click', async () => {
    let handle: FileSystemFileHandle;
    try {
        // @ts-ignore
        [handle] = await showOpenFilePicker(pickerOptions);
    } catch (error) {
        if (error instanceof DOMException) {
            return;
        } else {
            throw error;
        }
    }
    const data = await (await handle.getFile()).arrayBuffer();
    setProject(Project.import(new Uint8Array(data)));
    addLocalProjects();
    createFormElt.style.display = 'none';
});
