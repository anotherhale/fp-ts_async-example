import { pipe } from 'fp-ts/lib/pipeable'
import { TaskEither, tryCatch, chain, map, getOrElse } from "fp-ts/lib/TaskEither";
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
    map(printConfig),
    getOrElse(e => {
      return T.of(undefined);
    })
  );

  await program();
}

main('./app-config.yaml')