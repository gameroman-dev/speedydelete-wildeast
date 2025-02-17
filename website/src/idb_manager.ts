
import {Project} from '@wildeast/core';


export interface ProjectMetadata {
    name: string;
    version: string;
    title: string;
    description: string;
    author: string;
    plays: number;
}


function awaiter<T extends unknown>(request: IDBRequest<T>): Promise<T>;
function awaiter<T extends unknown>(request: IDBTransaction): Promise<void>;
function awaiter<T extends unknown>(request: IDBRequest<T> | IDBTransaction): Promise<T | void> {
    return new Promise((resolve, reject) => {
        if (request instanceof IDBRequest) {
            request.onsuccess = () => resolve(request.result);
        } else {
            request.oncomplete = () => resolve();
        }
        request.onerror = () => reject(request.error);
    });
}

async function initDB(db: IDBDatabase): Promise<void> {
    db.createObjectStore('projects', {keyPath: 'name'});
    db.createObjectStore('project_metadata', {keyPath: 'name'});
}

async function getDB(): Promise<IDBDatabase> {
    let request = indexedDB.open('wildeast', 1);
    request.onupgradeneeded = () => initDB(request.result);
    return awaiter(request);
}

export async function getProject(id: string): Promise<Project | undefined> {
    const data = await awaiter((await getDB()).transaction(['projects'], 'readonly').objectStore('projects').get(id));
    if (data === undefined) {
        return undefined;
    } else {
        return Project.import(data.data);
    }
}

export async function getProjectMetadata(id: string): Promise<ProjectMetadata> {
    return await awaiter((await getDB()).transaction(['project_metadata'], 'readonly').objectStore('project_metadata').get(id));
}


export async function getAllProjectsMetadata(): Promise<ProjectMetadata[]> {
    return await awaiter((await getDB()).transaction(['project_metadata'], 'readonly').objectStore('project_metadata').getAll());
}

export async function setProject(project: Project): Promise<void> {
    let transaction = (await getDB()).transaction(['projects', 'project_metadata'], 'readwrite');
    transaction.objectStore('projects').put({
        name: project.name,
        data: project.export(),
    });
    transaction.objectStore('project_metadata').put({
        name: project.name,
        version: project.version,
        title: project.title,
        description: project.description,
        author: project.author,
    });
    return awaiter(transaction);
}
