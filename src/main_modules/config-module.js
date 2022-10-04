'use strict';

// file module
const fileModule = require('./file-module');

// config location
const configLocation = fileModule.getUserDataPath('setting', 'config.json');

// default config
const defaultConfig = {
    user: {
        id: 'tsm_imperialhal',
        type: 'twitch',
    },
    indexWindow: {
        x: null,
        y: null,
        width: null,
        height: null,
        alwaysOnTop: true,
        focusable: true,
        hideButton: true,
        hideDialog: true,
        hideDialogTimeout: 30,
        backgroundColor: '#20202050',
    },
    dialog: {
        color: '#FFFFFF',
        fontSize: '1.1',
        spacing: '1',
        radius: '0',
        backgroundColor: '#202020A0',
    },
    system: {
        firstTime: true,
    },
};

// load config
function loadConfig() {
    try {
        let config = fileModule.jsonReader(configLocation, false);

        // fix old bug
        if (Array.isArray(config)) {
            throw null;
        }

        const mainNames = Object.getOwnPropertyNames(defaultConfig);
        mainNames.forEach((mainName) => {
            if (config[mainName]) {
                // skip checking when value is channel
                if (mainName === 'channel') {
                    return;
                }

                // add property
                const subNames = Object.getOwnPropertyNames(defaultConfig[mainName]);
                subNames.forEach((subName) => {
                    if (config[mainName][subName] === null || config[mainName][subName] === undefined) {
                        config[mainName][subName] = defaultConfig[mainName][subName];
                    }
                });

                // delete redundant property
                const subNames2 = Object.getOwnPropertyNames(config[mainName]);
                if (subNames.length !== subNames2.length) {
                    subNames2.forEach((subName) => {
                        if (
                            defaultConfig[mainName][subName] === null ||
                            defaultConfig[mainName][subName] === undefined
                        ) {
                            delete config[mainName][subName];
                        }
                    });
                }
            } else {
                config[mainName] = defaultConfig[mainName];
            }
        });

        config.system.firstTime = false;

        return config;
    } catch (error) {
        saveDefaultConfig();
        return defaultConfig;
    }
}

// save config
function saveConfig(config) {
    try {
        fileModule.jsonWriter(configLocation, config);
    } catch (error) {
        console.log(error);
    }
}

// get default config
function getDefaultConfig() {
    return defaultConfig;
}

// save default config
function saveDefaultConfig() {
    try {
        fileModule.jsonWriter(configLocation, defaultConfig);
    } catch (error) {
        console.log(error);
    }
}

// module exports
module.exports = {
    loadConfig,
    saveConfig,
    getDefaultConfig,
};
