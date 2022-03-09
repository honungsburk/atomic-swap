/**
 * A very simple ID generators
 */
export default class IDGenerator {
  private id;

  constructor() {
    this.id = 0;
  }

  /**
   *
   * @returns a unqiue ID
   */
  generate(): string {
    this.id += 1;
    return this.id.toString();
  }
}
