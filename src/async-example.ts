import { pipe } from 'fp-ts/lib/pipeable'
import { getOrElse } from 'fp-ts/lib/Either'
import { TaskEither, tryCatch, map, chain } from "fp-ts/lib/TaskEither";
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

const defaultConfig: AppConfig = {
  service: {
    interface: 'localhost',
    port: 8080
  }
}

function readFileAsyncAsTaskEither(path: string): TaskEither<unknown, string> {
  return tryCatch(() => fsPromises.readFile(path, 'utf8'), e => e)
}

function readYamlAsTaskEither(content: string): TaskEither<unknown, AppConfig> {
  return tryCatch(() => yamlPromise.safeLoad(content), e => e)
}

function getConf(filePath: string): TaskEither<unknown, AppConfig> {
  return pipe(
    readFileAsyncAsTaskEither(filePath),
    chain(readYamlAsTaskEither)
  )
}

function printConfig(config: AppConfig): AppConfig {
  console.log("AppConfig is: ", config);
  return config;
}

async function main(filePath: string): Promise<void> {
  const program: T.Task<void> = pipe(
    getConf(filePath),
    // The following line is not compiling:
    // Argument of type '<E>(fa: TaskEither<E, AppConfig>) => TaskEither<E, AppConfig>' is not assignable to parameter of type '(a: TaskEither<unknown, AppConfig>) => Either<unknown, Task<any>>'.
    //  Type 'TaskEither<unknown, AppConfig>' is not assignable to type 'Either<unknown, Task<any>>'.
    //  Type 'TaskEither<unknown, AppConfig>' is missing the following properties from type 'Right<Task<any>>': _tag, rightts(2345)
    map(printConfig),
    getOrElse(e => {
      return T.of(defaultConfig);
    })
  );

  await program;
}

main('./app-config.yaml')