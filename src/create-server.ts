import {
  SimpleSecureWebsocketServer,
  SimpleSecureWebsocketServerCommonOptions,
  SimpleSecureWebsocketServerOptions,
  SimpleSecureWebsocketServerOptionsWithServerInstance,
} from "./types.ts";
import { defaultConnectionHandler, defaultRequestHandler } from "./handlers.ts";

function isOptionsWithServer(
  options: SimpleSecureWebsocketServerOptions,
): options is (
  & SimpleSecureWebsocketServerCommonOptions
  & SimpleSecureWebsocketServerOptionsWithServerInstance
) {
  return (options as SimpleSecureWebsocketServerOptionsWithServerInstance)
    .server !== undefined;
}

export const createSimpleSecureWebsocketServer: (
  opts: SimpleSecureWebsocketServerOptions,
) => SimpleSecureWebsocketServer = (options) => ({
  listen: async () => {
    const { socketHandler, requestHandler, connectionHandler } = options;

    const internalServer = isOptionsWithServer(options)
      ? options.server
      : await Deno.listenTls({
        port: options.port,
        certFile: options.certFile,
        keyFile: options.keyFile,
      });

    const rHandler = requestHandler
      ? requestHandler(socketHandler)
      : defaultRequestHandler(socketHandler);

    const internalConnectionHandler = connectionHandler
      ? connectionHandler(rHandler)
      : defaultConnectionHandler(rHandler);

    for await (const conn of internalServer) {
      internalConnectionHandler(conn);
    }
  },
});
