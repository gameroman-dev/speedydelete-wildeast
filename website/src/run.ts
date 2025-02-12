
import {Project} from '@wildeast/core';

let frameWindow = document.querySelector('iframe')?.contentWindow;

window.addEventListener('load', async () => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    if (name === null) {
        return;
    }
    if (params.get('global') === 'true') {
        const response = await fetch(`global_projects/${name}.project`);
        if (response.ok) {
            const data = new Uint8Array(await response.arrayBuffer());
            const project = Project.import(data);
            if (frameWindow) {
                frameWindow.document.body.innerHTML = project.fs.readFrom('index.html');
            }
        } else if (response.status === 404 && frameWindow) {
            frameWindow.document.body.innerHTML = `<pre>Global project ${name} does not exist.</pre>`;
        } else {
            throw new Error(`HTTP ${response.status} ${response.statusText} while fetching global project ${name}`);
        }
    } else {

    }
});
