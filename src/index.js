'use strict';

require('dotenv').config();

const Quartz = require('@botsocket/quartz');

const Api = require('./api');
const Commands = require('./commands');
const Config = require('./config');

const internals = {};

internals.bootstrap = async function () {

    // Setup commands

    await Commands.register();

    // Fetch gateway url

    const response = await Api.get('/gateway');

    // Connect to Discord gateway

    const client = Quartz.client(response.payload.url, {
        token: Config.token,
        intents: ['DIRECT_MESSAGES', 'GUILD_MEMBERS'],
    });

    client.onDispatch = internals.onDispatch;

    client.connect();
};

internals.onDispatch = function (event, data) {

    if (event === 'READY') {
        return console.log('Ready');
    }

    if (event === 'INTERACTION_CREATE') {
        return Commands.handle(data);
    }
};

internals.bootstrap();
