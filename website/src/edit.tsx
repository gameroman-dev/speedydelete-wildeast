
import {html} from '@codemirror/lang-html';
import {Project} from '@wildeast/core';
import {JSX, query, makeShowHideButton} from './jsx';
import {CodeEditor} from './code_editor';
import {getProject, setProject} from './idb_manager';


const TEMPLATES = {
    default: `<!DOCTYPE html>
<html>
    <head>
        <title>{{title}}</title>
        <meta charset="utf-8">
        <style>

* {
    box-sizing: border-box;
}

body {
    font-family: Arial, Helvetica, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
}

        </style>
    </head>
    <body>
        <h1>{{title}}</h1>
        <div>This is your new project!</div>
    </body>
</html>`,
};


const editor = query('#editor');
const resizer = query('#resizer');
const runner = query('#runner') as HTMLIFrameElement;


const name = (new URLSearchParams(window.location.search)).get('name');
if (name === undefined) {
    window.stop();
}

if (!('wildeastUsername' in localStorage)) {
    localStorage.wildeastUsername = window.prompt('Enter username:');
}

let project = await getProject(name);
if (project === undefined) {
    project = new Project({
        name: name,
        version: '0.1.0',
        license: 'UNLICENSED',
        author: localStorage.wildeastUsername,
        title: localStorage.wildeastNewProjectTitle ?? name,
        description: '(No description provided)',
    });
    project.write('index.html', TEMPLATES[localStorage.wildeastNewProjectTemplate].replaceAll('{{title}}', project.title));
    setProject(project);
}

const codeEditor = <CodeEditor lang={html()} value={project.read('index.html')} />;
editor.append(codeEditor);
runner.srcdoc = project.read('index.html');


query('#save-button').addEventListener('click', () => {
    const data = codeEditor.view.state.doc;
    project.write('index.html', data);
    setProject(project);
    runner.srcdoc = project.read('index.html');
    alert('Saved!');
});


let isResizing = false;

resizer.addEventListener('mousedown', () => {
    isResizing = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
    });
});

function handleMouseMove(event: MouseEvent) {
    if (isResizing) {
        const containerWidth = resizer.parentElement.clientWidth;
        const leftWidth = event.clientX;
        const rightWidth = containerWidth - leftWidth - resizer.offsetWidth;
        if (leftWidth > 100 && rightWidth > 100) {
            editor.style.flex = `0 0 ${leftWidth}px`;
            runner.style.flex = `0 0 ${rightWidth}px`;
        }
    }
}


makeShowHideButton(query('#info-button'), editor, query('#info'));

let titleInput = query('#info-input-title') as HTMLInputElement;
titleInput.value = project.title;

let descriptionInput = query('#info-input-description') as HTMLInputElement;
descriptionInput.value = project.description;

let versionInput = query('#info-input-version') as HTMLInputElement;
versionInput.value = project.version;

query('#info-save').addEventListener('click', async () => {
    project.title = titleInput.value;
    project.description = descriptionInput.value;
    project.version = versionInput.value;
    await setProject(project);
    alert('Saved!');
});


query('#share-button').addEventListener('click', () => {
    const blob = new Blob([project.export()]);
    const url = URL.createObjectURL(blob);
    const filename = project.name + '.project';
    (<a href={url} download={filename}></a>).click();
    URL.revokeObjectURL(url);
});
