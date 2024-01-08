const findCacheDir = require('find-cache-dir');
const Cache = require("file-system-cache").default;

const cache = Cache({
    basePath: findCacheDir({ name: 'storybook' }),
    ns: 'storybook'
});

const cache_data = {
    success: true,
    time: 3155760000000,
    data: {
        "latest": { "version": "0", "info": null},
        "next": { "version": "0", "info": null},
    },
};

cache.set('lastUpdateCheck', cache_data).then(
    () => console.log("Saved lastUpdateCheck to storybook's cache")
);