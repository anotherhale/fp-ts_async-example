import { pipe } from 'fp-ts/lib/pipeable'
import { IO } from 'fp-ts/lib/IO'
import { TaskEither, tryCatch, chain, fold } from "fp-ts/lib/TaskEither";
import * as T from 'fp-ts/lib/Task';
import { promises as fsPromises } from 'fs';
const yamlPromise = require('js-yaml-promise');

export interface AppConfig {
  service: {
    interface: string
    port: number
  };
}

function readFileAsyncAsTaskEither(path: string): TaskEither<Error, string> {
  return tryCatch(() => fsPromises.readFile(path, 'utf8'), reason => new Error(String(reason)))
}

function readYamlAsTaskEither(content: string): TaskEither<Error, AppConfig> {
  return tryCatch(() => yamlPromise.safeLoad(content), reason => new Error(String(reason)))
}

function getConf(filePath: string): TaskEither<Error, AppConfig> {
  return pipe(
    readFileAsyncAsTaskEither(filePath),
    chain(readYamlAsTaskEither)
  )
}

async function main(filePath: string): Promise<void> {
  const program: T.Task<void> = pipe(
    getConf(filePath),
    fold(e=>T.of(log(e)()),c=>T.of(log(c)()))
  );

  await program();
}

const log = (s: unknown): IO<void> => () => console.log(s)

main('./config.yaml')
main('./invalid-config.yaml')
main('./app-config.yaml')