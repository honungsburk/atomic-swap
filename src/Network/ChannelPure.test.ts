import { ChannelPure } from "./ChannelPure";
import { expect, test } from "vitest";

////////////////////////////////////////////////////////////////////////////////
// Test Helpers
////////////////////////////////////////////////////////////////////////////////

function createChannelPair(): [ChannelPure<number>, ChannelPure<number>] {
  const channel1 = new ChannelPure<number>("1");
  const channel2 = new ChannelPure<number>("2");
  channel1.connect(channel2);
  channel2.connect(channel1);
  return [channel1, channel2];
}

////////////////////////////////////////////////////////////////////////////////
// Channel.sendSafe
////////////////////////////////////////////////////////////////////////////////

test("Channel.sendSafe - will trigger onReceive when sending", () => {
  const [channel1, channel2] = createChannelPair();
  let msg: number | undefined = undefined;
  channel2.onReceive((n) => (msg = n));
  channel1.sendSafe(1);
  expect(msg).toBe(1);
});

test("Channel.sendSafe - will not trigger onReceive if send happened earlier", () => {
  const [channel1, channel2] = createChannelPair();
  let msg: number | undefined = undefined;
  channel1.sendSafe(1);
  channel2.onReceive((n) => (msg = n));
  expect(msg).toBe(undefined);
});

test("Channel.sendSafe - will hold messages until there is a connection", () => {
  const channel1 = new ChannelPure<number>("1");
  const channel2 = new ChannelPure<number>("2");
  let msg: number | undefined = undefined;
  channel1.sendSafe(1);
  channel2.onReceive((n) => (msg = n));
  channel1.connect(channel2);
  channel2.connect(channel1);
  expect(msg).toBe(1);
});

// TODO: Add more tests
