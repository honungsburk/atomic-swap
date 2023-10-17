import { NetworkID } from "cardano-web-bridge-wrapper";
import * as Types from "./Types";

function validator<A>(isValid: (x: any) => x is A, x: any): A | Types.Error {
  if (isValid(x) || Types.isError(x)) {
    return x;
  }
  throw new Error("API returned an unexpected result");
}

export default class BlockFrostAPI implements Types.API {
  private basePath: string;

  constructor(networkID: NetworkID) {
    const getUrl = window.location;
    const websitePath = getUrl.protocol + "//" + getUrl.host + "/";

    const mainnetPath = "api/blockfrost/mainnet";
    const preprodPath = "api/blockfrost/preprod";
    // const previewPath = "api/blockfrost/preview";

    // Currently we can not distinguish between preview and preprod
    // because both have the same network id, 0. Which is stupid but they haven't
    // updated CIP 30 yet...
    //
    // link: https://github.com/cardano-foundation/CIPs/issues/489

    if (networkID === "Mainnet") {
      this.basePath = websitePath + mainnetPath;
    } else {
      this.basePath = websitePath + preprodPath;
    }
  }

  async health(): Promise<Types.Health | Types.Error> {
    const result = await this.getRequest(`/health`);
    return validator(Types.isHealth, result);
  }

  async assetsById(unit: string): Promise<Types.Asset | Types.Error> {
    const result = await this.getRequest(`/assets/${unit}`);
    return validator(Types.isAsset, result);
  }

  async blocksLatest(): Promise<Types.Block | Types.Error> {
    const result = await this.getRequest(`/blocks/latest`);
    return validator(Types.isBlock, result);
  }

  async epochsParameters(
    epoch: number
  ): Promise<Types.ProtocolParameters | Types.Error> {
    const result = await this.getRequest(`/epochs/${epoch}/parameters`);
    return validator(Types.isProtocolParameters, result);
  }

  async txs(hash: string): Promise<Types.Transaction | Types.Error> {
    const result = await this.getRequest(`/txs/${hash}`);
    return validator(Types.isTransaction, result);
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
