import { NetworkID } from "cardano-web-bridge-wrapper";
import * as Types from "./Types";

export default class BlockFrostAPI implements Types.API {
  private basePath: string;

  constructor(networkID: NetworkID) {
    const getUrl = window.location;
    const websitePath = getUrl.protocol + "//" + getUrl.host + "/";

    const mainnetPath = "api/blockfrost/mainnet";
    const testnetPath = "api/blockfrost/testnet";

    if (networkID === "Mainnet") {
      this.basePath = websitePath + mainnetPath;
    } else {
      this.basePath = websitePath + testnetPath;
    }
  }

  async health(): Promise<Types.Health | Types.Error> {
    const result = await this.getRequest(`/health`);
    return result as Types.Health | Types.Error;
  }

  async assetsById(unit: string): Promise<Types.Asset | Types.Error> {
    const result = await this.getRequest(`/assets/${unit}`);
    return result as Types.Asset | Types.Error;
  }

  async blocksLatest(): Promise<Types.Block | Types.Error> {
    const result = await this.getRequest(`/blocks/latest`);
    return result as Types.Block | Types.Error;
  }

  async epochsParameters(
    epoch: number
  ): Promise<Types.ProtocolParameters | Types.Error> {
    const result = await this.getRequest(`/epochs/${epoch}/parameters`);
    return result as Types.ProtocolParameters | Types.Error;
  }

  async txs(hash: string): Promise<Types.Transaction | Types.Error> {
    const result = await this.getRequest(`/txs/${hash}`);
    return result as Types.Transaction | Types.Error;
  }

  private async getRequest(
    endpoint: string,
    headers: Headers = {},
    body?: any
  ): Promise<any> {
    let result: any;

    const maxIterations = 12;
    let iterations = 0;
    while (
      (!result || result.status_code === 500) &&
      iterations <= maxIterations
    ) {
      if (result) {
        await delay(100 * 2 ** iterations);
      }
      const rawResult = await fetch(this.basePath + endpoint, {
        headers: {
          ...headers,
          "User-Agent": "atomic-swap",
          "Cache-Control": "no-cache",
        },
        method: body ? "POST" : "GET",
        body,
      });
      result = await rawResult.json();
      iterations += 1;
    }

    return result;
  }
}

/**
 *
 * @param delayInMs the number of milliseconds to delay
 * @returns a promise that resolves after the given number of milliseconds
 */
export async function delay(delayInMs: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delayInMs);
  });
}

interface Headers {
  [key: string]: string;
}
