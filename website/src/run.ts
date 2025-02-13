
import {Project} from '@wildeast/core';

let frame = document.querySelector('iframe');

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
            if (frame) {
                frame.srcdoc = project.fs.readFrom('index.html');
            }
        } else if (response.status === 404 && frame && frame.contentWindow) {
            frame.contentWindow.document.body.innerHTML = `<pre>Global project ${name} does not exist.</pre>`;
        } else {
            throw new Error(`HTTP ${response.status} ${response.statusText} while fetching global project ${name}`);
        }
    } else {

    }
});
