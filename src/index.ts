import { config } from "dotenv";
config();

import { ApolloServer } from "apollo-server";
import { schema } from "./graphql/schema";
import logger from "./utils/logger";


const server = new ApolloServer({
    schema,
})

server.listen().then(({ url }) => {
    logger.info(`🚀 Server ready at ${url}`);
  });