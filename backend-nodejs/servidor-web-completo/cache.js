const cache = new Map();
module.exports = {
    get: (key) => {
        const item = cache.get(key);
        if (item && item.expires > Date.now()) return item.data;
        return null;
    },
    set: (key, data) => {
        cache.set(key, { data, expires: Date.now() + 60000 });
    }
};