import { BasicWallet } from "cardano-web-bridge-wrapper/lib/BasicWallet";

export type Env = {
  wallet: BasicWallet | undefined;
  changeWallet: (wallet: BasicWallet) => void;
};
