import * as functions from "firebase-functions";
import * as express from "express";
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import * as Secrets from "./secrets";

const app = express();

// See README for how to add secrets!
const MAINNET = new BlockFrostAPI({
  projectId: Secrets.BLOCKFROST_ID_MAINNET,
});

const TESTNET = new BlockFrostAPI({
  projectId: Secrets.BLOCKFROST_ID_TESTNET,
});

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
const blockfrost = "/blockfrost";
const testnet = blockfrost + "/testnet";
const mainnet = blockfrost + "/mainnet";

// Redirect to blockfrost
// Replies are cached so as to limit the load on the blockfrost API
app.get(testnet + "/health", (req, res) =>
  blockfrostWrap(res, () => TESTNET.health())
);
app.get(mainnet + "/health", (req, res) =>
  blockfrostWrap(res, () => MAINNET.health())
);
app.get(testnet + "/assets/:unit", (req, res) =>
  blockfrostWrap(res, () => TESTNET.assetsById(req.params.unit))
);
app.get(mainnet + "/assets/:unit", (req, res) =>
  blockfrostWrap(res, () => MAINNET.assetsById(req.params.unit))
);
app.get(testnet + "/blocks/latest", (req, res) =>
  blockfrostWrap(res, () => TESTNET.blocksLatest())
);
app.get(mainnet + "/blocks/latest", (req, res) =>
  blockfrostWrap(res, () => MAINNET.blocksLatest())
);
app.get(testnet + "/epochs/:epoch/parameters", (req, res) =>
  blockfrostWrap(res, () =>
    TESTNET.epochsParameters(parseInt(req.params.epoch))
  )
);
app.get(mainnet + "/epochs/:epoch/parameters", (req, res) =>
  blockfrostWrap(res, () =>
    MAINNET.epochsParameters(parseInt(req.params.epoch))
  )
);
app.get(testnet + "/txs/:hash", (req, res) =>
  blockfrostWrap(res, () => TESTNET.txs(req.params.hash))
);
app.get(mainnet + "/txs/:hash", (req, res) =>
  blockfrostWrap(res, () => MAINNET.txs(req.params.hash))
);

// Clever redirection so we can use /blockfrost as api
const main = express();
main.use("/api", app);

// Expose Express API as a single Cloud Function:
exports.main = functions.https.onRequest(main);
