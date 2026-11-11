// main root file

import { env } from './config/env';
import { createAPP } from "./app";
import { logger } from "./lib/logger";

const app = createAPP()

app.listen(env.port, () => {
    logger.info(`Server is now running on port http://localhost:${env.port}`);
});