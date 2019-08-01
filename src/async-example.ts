import { pipe } from 'fp-ts/lib/pipeable'
import { IO } from 'fp-ts/lib/IO'

import { chain } from "fp-ts/lib/Task";
import { fold as foldE,left,right } from 'fp-ts/lib/Either'
import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither";

import { promises as fsPromises } from 'fs';
const yaml = require('js-yaml-promise');
const path = require('path');

export interface AppConfig {
    service: {
        interface: string
        port: number
    };
}

function readFileAsync(path: string): TaskEither<Error, string> {
    return tryCatch(() => fsPromises.readFile(path, 'utf8'), reason => new Error(String(reason)))
}

function readYaml(content: string): TaskEither<Error, AppConfig> {
    return tryCatch(() => yaml.safeLoad(content), reason => new Error(String(reason)))
}

// I am not sure how to work with Tasks in TP-TS
// below are some experiments trying to get these async dependent tasks to work

// https://gcanti.github.io/fp-ts/recipes/async.html#work-with-a-list-of-dependent-tasks
// Does not compile - result needs to be a string but is a Either<Error,string>. 
// I have tried to pipe and fold to get the string but it just gets messy and fails to work

// function getConfViaChain(filePath:string){
//     return pipe(
//         readFileAsync(filePath),
//         chain(result=>readYaml(result))
//     )().then(c=>right(c)).catch(e=>left(e))
// }

// Compiles but returns a pending promise
function getConf(filePath:string){
    return pipe(
        readFileAsync(path.resolve(filePath))()).then(
            file=>pipe(file,foldE(
                e=>left(e),
                r=>right(readYaml(r)().then(yaml=>
                    pipe(yaml,foldE(
                        e=>left(e),
                        c=>right(c)
                    ))
                ).catch(e=>left(e)))
        )   )
        ).catch(e=>left(e))
}

const log = (s: unknown): IO<void> => () => console.log(s)

getConf('./app-config.yaml').then(c=>log(c)())