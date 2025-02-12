
const fs = require('fs');
const {Project} = require('@wildeast/core');

const project = new Project({
    name: 'wbr',
    version: '1.0.0',
    title: 'What Beats Rock?',
    description: 'Play Rock Paper Scissors but it... keeps going?',
    author: 'kyle',
    license: 'UNLICENSED',
    plays: 9700000,
    thumbnail: 'https://www.whatbeatsrock.com/icon.ico',
});

project.fs.writeTo('index.html', `<!DOCTYPE html>
<html>
    <head>
        <title>What Beats Rock?</title>
        <meta charset="utf-8" />
    </head>
    <body>
        <h1>What Beats Rock?</h1>
    </body>
</html>`);

fs.writeFileSync(`dist/global_projects/${project.name}.project`, project.export());

// const data = fs.readFileSync('dist/global_projects/wbr.project');
// console.log('read data:', Project.import(data).fs.readFrom('index.html'));
