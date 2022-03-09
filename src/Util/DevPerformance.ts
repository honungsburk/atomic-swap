export function log(tag: string, fn: () => void) {
  const copyStartTime = performance.now();
  fn();
  const copyEndTime = performance.now();
  console.log(`${tag}: ${copyEndTime - copyStartTime} ms`);
}
