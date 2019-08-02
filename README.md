# fp-ts_async-example
FP-TS Async-Example (read file/parse yaml asynchronously)

Learning FP-TS and trying to work with some real world examples.

This project is my experimentation with `FP-TS` asychronous `Task`.  I was able to successfully work with a synchronous version of this project here: https://github.com/anotherhale/fp-ts_sync-example. I was able to resolve the issues with the initial async code  thanks to @MnZrK from this SO post: https://stackoverflow.com/questions/57316857/resolved-how-to-chain-dependent-taskeither-operations-in-fp-ts.

`npm run build`

`npm run start `

Resulting application output:
```
Error: Error: ENOENT: no such file or directory, open './config.yaml'
    at /home/ahale/dev/fp-ts_async-example/src/async-example.js:44:123
    at /home/ahale/dev/fp-ts_async-example/node_modules/fp-ts/lib/TaskEither.js:111:113

Error: YAMLException: end of the stream or a document separator is expected at line 2, column 12:
      interface: "127.0.0.1"
               ^
    at /home/ahale/dev/fp-ts_async-example/src/async-example.js:47:116
    at /home/ahale/dev/fp-ts_async-example/node_modules/fp-ts/lib/TaskEither.js:111:113

{ service: { interface: '127.0.0.1', port: 9090 } }

```
