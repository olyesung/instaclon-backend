require("dotenv").config();
import { ApolloServer } from "apollo-server-express";
import { graphqlUploadExpress } from "graphql-upload";
import express from "express";
import logger from "morgan";
import { resolvers, typeDefs } from "./schema";
import { getUser } from "./users/users.utils";

const PORT = process.env.PORT;

// async function startServer() {
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     context: async ({ req }) => {
//       return {
//         loggedInUser: await getUser(req.headers.token),
//       };
//     },
//   });
//   await server.start();
//   const app = express();
//   app.use(graphqlUploadExpress());
//   server.applyMiddleware({ app });
//   await new Promise((func) => app.listen({ port: PORT }, func));
//   console.log(`🚀 Server: http://localhost:${PORT}${server.graphqlPath}`);
// }

// startServer();

async function startServer() {
  const server = new ApolloServer({
    resolvers,
    typeDefs,
    context: async ({ req }) => {
      return {
        loggedInUser: await getUser(req.headers.token),
      };
    },
  });

  await server.start();
  const app = express();
  app.use(graphqlUploadExpress());
  app.use(logger("tiny"));
  server.applyMiddleware({ app });
  app.listen({ port: PORT }, () => {
    console.log(`🚀Server is running on http://localhost:${PORT} ✅`);
  });
}

startServer();
