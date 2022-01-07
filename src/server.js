require("dotenv").config();
import { createServer } from "http";
import { ApolloServer } from "apollo-server-express";
import { graphqlUploadExpress } from "graphql-upload";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { execute, subscribe } from "graphql";
import express from "express";
import logger from "morgan";
import { resolvers, typeDefs } from "./schema";
import { getUser } from "./users/users.utils";

const PORT = process.env.PORT;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  app.use(graphqlUploadExpress());
  app.use(logger("tiny"));
  app.use("/static", express.static("uploads"));
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: async ({ token }) => {
        if (!token) {
          throw new Error("You can't listen.");
        }
        const loggedInUser = await getUser(token);
        return {
          loggedInUser,
        };
      },
    },

    { server: httpServer, path: "/graphql" }
  );
  const apollo = new ApolloServer({
    schema,
    context: async (ctx) => {
      if (ctx.req) {
        return {
          loggedInUser: await getUser(ctx.req.headers.token),
        };
      } else {
        const {
          connection: { context },
        } = ctx;
        return {
          loggedInUser: context.loggedInUser,
        };
      }
    },
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  await apollo.start();
  apollo.applyMiddleware({ app });

  httpServer.listen(PORT, () => {
    console.log(`🚀Server is running on http://localhost:${PORT} ✅`);
  });
}

startServer();
