
import {Project} from '@wildeast/core';
import {getProject} from './idb_manager';
import {query} from './jsx';

let iframe = query('iframe') as HTMLIFrameElement;

window.addEventListener('load', async () => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    if (name === null) {
        return;
    }
    let project;
    if (params.get('global') === 'true') {
        const response = await fetch(`global_projects/${name}.project`);
        if (response.ok) {
            const data = new Uint8Array(await response.arrayBuffer());
            project = Project.import(data);
        } else if (response.status === 404) {
            iframe.srcdoc = `<pre>Global project ${name} does not exist.</pre>`;
            return;
        } else {
            throw new Error(`HTTP ${response.status} ${response.statusText} while fetching global project ${name}`);
        }
    } else {
        project = await getProject(name);
    }
    iframe.srcdoc = project.fs.readFrom('index.html');
    query('#title').textContent = `Running ${project.title}`;
});
