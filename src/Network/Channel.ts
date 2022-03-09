/**
 * The different states a channel can be in
 */
export type ChannelState =
  | "Initalized"
  | "Waiting"
  | "Connected"
  | "Reconnecting"
  | "Destroyed";

/**
 * A two way comuncation channel between two web browsers
 */
export interface Channel<T> {
  /**
   * Disconnect gracefully and release all resources
   */
  destroy(): void;

  /**
   * Send to the other side of the channel
   */
  send(data: T): void;

  /**
   * Send to the other side of the channel but buffer it and send when there
   * is a connection
   */
  sendSafe(data: T): void;

  /**
   *
   * @param callFn triggers whenever data is received
   */
  onReceive(callFn: (data: T) => void): () => void;

  /**
   *
   * @param callFn triggers whenever the channel has its state changed
   */
  onStateChange(
    callFn: (state: ChannelState, previous: ChannelState) => void
  ): () => void;

  /**
   * Note: In most implementations an errors will probaly result in the connection being fatal
   *
   * @param callFn triggers whenever there is an error
   */
  onError(callFn: (data: any) => void): () => void;

  /**
   *
   * @returns the current state of the channel
   */
  getState(): ChannelState;

  /**
   *
   * @returns the id of the channel
   */
  getID(): string;

  /**
   * it is okay to call this function twice with the same id. If it
   * is already connected it will simply succeed.
   *
   * @param peerID the id of the peer with which you wan to connect to
   */
  connectTo(peerID: string): void;
}
