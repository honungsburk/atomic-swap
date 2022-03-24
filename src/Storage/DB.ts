import { NetworkID } from "cardano-web-bridge-wrapper";
import Dexie, { Table } from "dexie";

export type IAssetIdentifierData = {
  id?: number;
  name: string;
  networkID: NetworkID;
  identifier: string;
  list: "Whitelist" | "Blacklist";
};

export class Database extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  assetIdentifiers!: Table<IAssetIdentifierData>;

  constructor() {
    super("Database");
    this.version(4).stores({
      assetIdentifiers:
        "++id, name, &identifier, [networkID+list], [list+networkID]", // Primary key and indexed props
    });
  }
}

export const db = new Database();
