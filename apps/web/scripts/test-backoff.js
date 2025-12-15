
const calculateBackoff = (attempt) => {
    const baseDelay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s...
    const jitter = Math.random() * 500; // 0-500ms jitter
    return Math.min(baseDelay + jitter, 30000); // Max 30s delay
};

console.log('Testing Backoff Jitter...');
for (let i = 1; i <= 5; i++) {
    const delays = [];
    for (let j = 0; j < 5; j++) {
        delays.push(calculateBackoff(i));
    }
    const min = Math.min(...delays);
    const max = Math.max(...delays);
    const base = 1000 * Math.pow(2, i - 1);

    console.log(`Attempt ${i} (Base ${base}ms): Range [${min.toFixed(0)} - ${max.toFixed(0)}]ms`);

    if (min < base) console.error(`❌ Error: Delay below base for attempt ${i}`);
    if (max > base + 500) console.error(`❌ Error: Jitter exceeded 500ms for attempt ${i}`);
}
console.log('✅ Jitter logic verified.');
