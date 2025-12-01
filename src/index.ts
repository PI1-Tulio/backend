import { env } from "./config/env";
import { httpServer } from "./servers/HTTPServer";
import { startWorkers } from "./servers/Workers";

(async () => {
  httpServer.listen(env.HTTP_PORT, () => {
    console.log(`HTTP and WebSocket Server is running on port ${env.HTTP_PORT}`);
  });

  await startWorkers();
  console.log("Workers started");
})();
