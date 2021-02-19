export default (name = 'app') => (...args: any[]) => console.log(`${name}:`, ...args);
