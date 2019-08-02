import { pipe } from 'fp-ts/lib/pipeable'
import { getOrElse, fold as foldE, left, right,Either } from 'fp-ts/lib/Either'
import { TaskEither, tryCatch, map } from "fp-ts/lib/TaskEither";
import * as T from 'fp-ts/lib/Task';
import { promises as fsPromises } from 'fs';
const yamlPromise = require('js-yaml-promise');

// const path = require('path');
export interface AppConfig {
    service: {
        interface: string
        port: number
    };
}

function readFileAsyncAsTaskEither(path: string): TaskEither<unknown, string> {
    return tryCatch(() => fsPromises.readFile(path, 'utf8'), reason => new Error(String(reason)))
}

function readYamlAsTaskEither(content: string): TaskEither<unknown, AppConfig> {
    return tryCatch(() => yamlPromise.safeLoad(content), e=>e)
}
 

// I am not sure how to work with Tasks in TP-TS
// below are some experiments trying to get these async dependent tasks to work

// function getConf(filePath:string):TaskEither<Error,AppConfig>{
//     return pipe(
//         readFileAsyncAsTaskEither(filePath),
//         chain(readYamlAsTaskEither)
//     )
// }
function getConf(filePath:string):Either<Error,AppConfig>{
  return pipe(
    readFileAsyncAsTaskEither(filePath)()).then(
          file=>pipe(file,foldE(
              e=>left(e),
              r=>right(readYamlAsTaskEither(r)().then(yaml=>
                  pipe(yaml,foldE(
                      e=>left(e),
                      c=>right(c)
                  ))
              ).catch(e=>left(e)))
      )   )
      ).catch(e=>left(e))
}
function printConfig(config: AppConfig): AppConfig {
    console.log("AppConfig is: ", config);
    return config;
  }
  
  async function main(filePath: string): Promise<void> {
    const program: T.Task<void> = pipe(
      getConf(filePath),
      map(printConfig),
      getOrElse(e => {
        return T.of(undefined);
      })
    );
  
    await program;
  }

  main('./app-config.yaml')