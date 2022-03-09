# Atomic Swap

Trade any number of assets against any other number of assets without the need for escrow! NFTs, Tokens, adahandle - anything - everything.

## Links

- [Atomic Swap](https://atomic-swap.io/)
- [Twitter](https://twitter.com/_atomicswap)
- [Discord](https://discord.com/invite/ZqpN4TuJ6a)

## Handling secrets

Secrets must be stored in a name with the format `secrets.ts` in the `functions/src/` directory.
(This ensures that they are ignored by git.) You get the secrets from (blockfrost)[https://blockfrost.io].

Example:

```typescript
export const BLOCKFROST_ID_MAINNET = "...";
export const BLOCKFROST_ID_TESTNET = "...";
```

## Getting Up and Running

### Install & Build

1. `npm install`
2. `cd functions`
3. `npm install`
4. Add secrets as explained in "Handling Secrets"
5. `npm run build`
6. `cd ..`
7. `npm run build`

### Serving

After building you can serve the application using by running `firebase emulators:start` and `npm run preview`

### Hot Reloading

When developing you don't need to build the app but can use `firebase emulators:start` and `npm run dev`.
Note that while the frontend is rebuilt automatically the backend must be recomiled before you can serve new versions.

### TODO

## 1.7

- [ ] Stable session links
- [ ] Order tx construction by addresses in alphabetical order
- [ ] Handle serverless firebase being down
- [ ] Add explicit offline mode
- [ ] Handle blockfrost being down
- [ ] Make distinction between data with/without metadata?
- [ ] Offline experience (react-detect-offline)
- [ ] /null in the join session link! You have lost connection!
- [ ] Text & Layer Styles
- [ ] https://www.npmjs.com/package/use-local-storage
- [ ] Check that browser supports data + audio - show proper messeges otherwise
- [ ] Add state for when brokage servers are down
- [ ] How to deal with tokens when we don't have the metadata?

## Future

- [ ] Do all rizzo improvements
- [ ] Only show connect wallet when you are sent a link!
- [ ] Add trade link somewhere it can always be copied.
- [ ] Auto connect to your wallet!
- [ ] Connecting wallet should be a seperate step
- [ ] Asset verification is not a setting!
- [ ] Styling of ADAHandles
- [ ] Add a bunch of verified tokens?
- [ ] Semantic Tokens
- [ ] Component Styles
- [ ] Notifications
- [ ] use boolean
- [ ] Remove the refresh website hack
- [ ] use the wasm package isntead of asmjs
- [ ] Refactor to support 3 new themes (hide them so users can't use them).
- [ ] Check that the browser supports the API's we are using.
- [ ] Chat dies when reloading in dev mode
- [ ] Find asset metadata as quickly as possible/Be clear when there is/isn't metadata
- [ ] design ghost mascot + create pfp project
- [ ] Fix speed when signing tx
- [ ] Don't mix assets from different networks!
- [ ] Assets should be added in correct order

### Metrics update

- [ ] show that other people have used the project!
- [ ] Decentralized mode!
- [ ] When connecting wallet they have to sign something...
- [ ] nbr of visitors
- [ ] nbr unqiue wallets/day
- [ ] How much mainnet?
- [ ] How much testnet?
- [ ] How often offer is made?
- [ ] How often sign?
- [ ] How often reject?
- [ ] What is our conversion rate?
  - [ ] https://www.youtube.com/watch?v=PGqX9fpweyc
  - [ ] nbr of users that add an asset
  - [ ] nbr of users that

## NOTE

To install `react-kawaii` I used the command `npm install --save --legacy-peer-deps react-kawaii`
since the newer version of npm is stricter in regards to breaking changes.
