
import {Project} from 'wildeast';


export interface ProjectMetadata {
    id: string;
    name: string;
    version: string;
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
    db.createObjectStore('projects', {keyPath: 'id'});
    db.createObjectStore('project_metadata', {keyPath: 'id'});
}

async function getDB(): Promise<IDBDatabase> {
    let request = indexedDB.open('wildeast', 1);
    request.onupgradeneeded = (event) => initDB(request.result);
    return awaiter(request);
}

export async function getProject(id: string): Promise<Project> {
    return Project.import(await awaiter((await getDB()).transaction(['projects'], 'readonly').objectStore('projects').get(id)));
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
        id: project.id,
        data: project.export(),
    });
    transaction.objectStore('project_data').put({
        id: project.id,
        name: project.name,
        version: project.version,
        description: project.description,
        author: project.author,
        plays: project.plays,
    });
    return awaiter(transaction);
}
