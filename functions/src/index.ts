import * as functions from "firebase-functions";
import * as express from "express";
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import * as Secrets from "./secrets";
import { ErrorMiddleware } from "./error-middleware";
import { MissingRouteMiddleware } from "./missing-route-middleware";

const app = express();

type API = {
  api: BlockFrostAPI;
  network: string;
};

const APIs: API[] = [
  {
    api: new BlockFrostAPI({
      projectId: Secrets.BLOCKFROST_ID_MAINNET,
      network: "mainnet",
    }),
    network: "/mainnet",
  },

  {
    api: new BlockFrostAPI({
      projectId: Secrets.BLOCKFROST_ID_PREPROD,
      network: "preprod",
    }),
    network: "/preprod",
  },

  {
    api: new BlockFrostAPI({
      projectId: Secrets.BLOCKFROST_ID_PREVIEW,
      network: "preview",
    }),
    network: "/preview",
  },
];

/**
 *
 * @param res our response
 * @param fn the function to compute the reponse
 * @returns
 */
async function blockfrostWrap(res: any, fn: () => Promise<any>) {
  try {
    const result = await fn();
    return res.send(result);
  } catch (error) {
    return res.send(error);
  }
}

for (const api of APIs) {
  let base = "/blockfrost" + api.network;
  app.get(base + "/health", (req, res) =>
    blockfrostWrap(res, () => api.api.health())
  );
  app.get(base + "/assets/:unit", (req, res) =>
    blockfrostWrap(res, () => api.api.assetsById(req.params.unit))
  );
  app.get(base + "/blocks/latest", (req, res) =>
    blockfrostWrap(res, () => api.api.blocksLatest())
  );
  app.get(base + "/epochs/:epoch/parameters", (req, res) =>
    blockfrostWrap(res, () =>
      api.api.epochsParameters(parseInt(req.params.epoch))
    )
  );
  app.get(base + "/txs/:hash", (req, res) =>
    blockfrostWrap(res, () => api.api.txs(req.params.hash))
  );
}

// Clever redirection so we can use /blockfrost as api
const main = express();
main.use("/api", app);
app.use(MissingRouteMiddleware);
main.use(ErrorMiddleware);

// Expose Express API as a single Cloud Function:
exports.main = functions.https.onRequest(main);
