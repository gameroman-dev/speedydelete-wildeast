
import {readFileSync, writeFileSync, rmSync} from 'fs';
import {promises as readline} from 'readline';
import {Project, type ProjectDisplayInfo} from '@wildeast/core';
import {minify} from 'minify';


const VALID_NAME = /^[a-z0-9._~-]+$/;


function error(message: any): void {
    console.error(message);
    process.exit(1);
}


async function main(): Promise<void> {
    const rl = readline.createInterface(process.stdin, process.stdout);
    const name = await rl.question('name: ');
    if (!name.match(VALID_NAME)) {
        error('invalid name: ' + name);
    }
    const title = await rl.question('title: ');
    if (title.length > 32) {
        error('title too long, max 32 characters');
    }
    const description = await rl.question('description: ');
    if (description.length > 128) {
        error('description too long, max 128 characters');
    }
    const author = await rl.question('author: ');
    if (author.length > 16) {
        error('author too long, max 16 characters');
    }
    const playsText = await rl.question('plays: ');
    const plays = Number(playsText);
    if (Number.isNaN(plays)) {
        error('not a number: ' + playsText);
    }
    const thumbnail = await rl.question('thumbnail: ');
    const metadata: ProjectDisplayInfo = {
        name: name,
        title: title,
        description: description,
        author: author,
        plays: plays,
        thumbnail: thumbnail === '' ? undefined : thumbnail,
    }
    const project = new Project({
        ...metadata,
        version: '1.0.0',
        license: 'UNLICENSED',
    });
    const codeLocation = await rl.question('code (url or path): ');
    let code: string;
    if (codeLocation.startsWith('http://') || codeLocation.startsWith('https://')) {
        const response = await fetch(codeLocation);
        if (response.ok) {
            code = await response.text();
        } else {
            console.error(response.status, response.statusText);
            return;
        }
    } else {
        code = readFileSync(codeLocation).toString('utf8');
    }
    writeFileSync('.temp.html', code);
    console.log('minifying');
    code = await minify('.temp.html', {});
    project.fs.writeTo('index.html', code);
    rmSync('.temp.html');
    writeFileSync(`dist/global_projects/${project.name}.project`, project.export());
    const projectIndex = JSON.parse(readFileSync('dist/global_projects/index.json').toString('utf8'));
    projectIndex.push(metadata);
    writeFileSync('dist/global_projects/index.json', JSON.stringify(projectIndex));
}

main().then(() => process.exit(0));
