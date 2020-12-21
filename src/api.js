'use strict';

const Bornite = require('@botsocket/bornite');

const Config = require('./config');
const Package = require('../package');

module.exports = Bornite.custom({
    baseUrl: 'https://discord.com/api/v8',
    validateStatus: true,
    headers: {
        Authorization: `Bot ${Config.token}`,
        'User-Agent': `DiscordBot (https://botsocket.com, ${Package.version})`,
    },
});
