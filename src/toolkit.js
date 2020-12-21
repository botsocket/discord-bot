'use strict';

const Bone = require('@botsocket/bone');

const Api = require('./api');

const internals = {
    modes: ['success', 'warn', 'error', 'info'],
    colors: {
        success: 0x2ecc71,
        warn: 0xe67e22,
        error: 0xe74c3c,
        info: 0x3498db,
    },
};

internals.toolkit = function () {

    const Toolkit = class {
        constructor(command) {

            this._command = command;
        }

        respond(response) {

            Bone.assert(typeof response === 'string' || typeof response === 'object', 'Response must be a string or an embed object');

            const payload = {
                type: 4,
                data: {},
            };

            if (typeof response === 'string') {
                payload.data.content = response;
            }
            else {
                payload.data.embeds = [response];
            }

            const interaction = this._command.interaction;
            const url = `/interactions/${interaction.id}/${interaction.token}/callback`;

            return Api.post(url, { payload });
        }
    };

    for (const mode of internals.modes) {
        Toolkit.prototype[mode] = function (embed) {

            Bone.assert(typeof embed === 'object', 'Embed must be an object');

            const decorated = internals.embed(embed, mode);
            return this.respond(decorated);
        };
    }

    return Toolkit;
};

module.exports = internals.toolkit();

internals.embed = function (embed, mode) {

    embed.footer = { text: embed.footer || 'BotSocket | botsocket.com' };
    embed.timestamp = embed.timestamp || new Date();
    embed.color = internals.colors[mode];

    return embed;
};
