/**
 * Helper function to delay execution.
 * @param ms - The number of milliseconds to delay.
 * @param reason - Optional reason for the delay (for logging purposes).
 * @returns A promise that resolves after the specified delay.
 */
export function delay(ms: number, reason?: string): Promise<void> {
  if (reason) {
    console.log(`Delaying for ${ms}ms: ${reason}`);
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      if (reason) {
        console.log(`Finished delay: ${reason}`);
      }
      resolve();
    }, ms);
  });
}
