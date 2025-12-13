/**
 * Run a map function over an array with a concurrency limit.
 * @param array Items to process
 * @param mapper Async function to run on each item
 * @param concurrency Max number of concurrent executions (default 5)
 */
export async function pMap<T, R>(
    array: T[],
    mapper: (item: T, index: number) => Promise<R>,
    concurrency = 5
): Promise<R[]> {
    const results: R[] = new Array(array.length);
    const executing: Promise<void>[] = [];

    let index = 0;

    for (const item of array) {
        const i = index++;
        const p = Promise.resolve().then(() => mapper(item, i));

        // Save result
        const pWrapper = p.then(res => {
            results[i] = res;
        });

        executing.push(pWrapper);

        if (executing.length >= concurrency) {
            await Promise.race(executing);
            // Remove completed promises from the executing list
            // Note: simple Promise.race doesn't tell us WHICH one finished easily without wrapping
            // But for simple "throttle", we can just wait for one. 
            // Better robust implementation below:
        }
    }

    // Actually, a simpler robust implementation:
    // array of functions that return promises
    const queue = array.map((item, i) => async () => {
        results[i] = await mapper(item, i);
    });

    const activeWorkers = new Set<Promise<void>>();

    for (const task of queue) {
        if (activeWorkers.size >= concurrency) {
            await Promise.race(activeWorkers);
        }

        const promise = task();
        // Prevent UnhandledPromiseRejection warning/exit by attaching a dummy handler immediately
        promise.catch(() => { });
        activeWorkers.add(promise);
        promise.finally(() => activeWorkers.delete(promise));
    }

    await Promise.all(activeWorkers);
    return results;
}
