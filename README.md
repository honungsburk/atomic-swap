# Faucet

Mint your own custom tokens in a completely decentralized way.

## Fix issue

if you get the error `Error: error:0308010C:digital envelope routines::unsupported`
while running `npm run start` add this to your terminal:

```bash
export NODE_OPTIONS=--openssl-legacy-provider
```

## Handling secrets

Secrets must be stored in a name with the format `secrets.(development|production).ts` in the `functions/src/` directory.
(This ensures that they are ignored by git.)
And follow the format in `secret-type.ts`

Example:

```typescript
export const BLOCKFROST_ID_MAINNET = "...";
export const BLOCKFROST_ID_TESTNET = "...";
```

## PWA

NOTE: Service workers can not be used from private browsing in firefox! Bad way to cache assets!

- [API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache)

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

## TODO

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

- [] link to https://cardanoscan.io/address/016e97768d8ec17c93d97f12fe52256d43431deaebbb51e14cfb160fdd27540567add2c659e07e1066d29edb2b7a4d582692fdfe7061db8bee
- [] show that other people have used the project!
- [] Decentralized mode!
- [] When connecting wallet they have to sign something...
- [] nbr of visitors
- [] nbr unqiue wallets/day
- [] How much mainnet?
- [] How much testnet?
- [] How often offer is made?
- [] How often sign?
- [] How often reject?
- [] What is our conversion rate?
  - [] https://www.youtube.com/watch?v=PGqX9fpweyc
  - [] nbr of users that add an asset
  - [] nbr of users that

#### Landing Page

- [] Has a call to action?
  - [] Is there a magic moment? (UNderstand that you can trade whatever for whatever)
- [] One sentence that explains exactly what it is. one sentance
- [] who else is already using it?
- [] how much is it? what is the catch?
- [] where can I get help?

## AUDIt

- Is Json.parse safe?

#### NOTE

To install `react-kawaii` I used the command `npm install --save --legacy-peer-deps react-kawaii`
since the newer version of npm is stricter in regards to breaking changes.

Same is true for `react-custom-scrollbars`
