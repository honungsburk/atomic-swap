import { BasicWallet } from "./Cardano/CIP30/Wallet";

export type Env = {
  wallet: BasicWallet | undefined;
  changeWallet: (wallet: BasicWallet) => void;
};
