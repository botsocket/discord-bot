'use strict';

const Bone = require('@botsocket/bone');
const Jade = require('@botsocket/jade');

const Release = require('./release');
const Suggest = require('./suggest');

const Api = require('../api');
const Toolkit = require('../toolkit');
const Config = require('../config');

const internals = {
    commands: {},
    types: {
        string: 3,
        number: 4,
        boolean: 5,
    },
};

internals.definitions = [
    Release,
    Suggest,
];

exports.register = function () {

    // Store definitions as name - definition

    for (const definition of internals.definitions) {
        if (definition.options) {
            definition.options = Jade.object(definition.options);
        }

        internals.commands[definition.name] = definition;
    }

    // Convert definitions into discord format

    const commands = [];
    for (const definition of internals.definitions) {
        const command = { ...definition };
        commands.push(command);

        delete command.handler;

        if (!command.options) {
            continue;
        }

        // Convert jade schema

        const schema = command.options;
        const description = schema.describe();
        const options = description.keys;
        const discordOptions = [];

        for (const key of Object.keys(options)) {
            const item = options[key];
            const type = internals.types[item.type];

            Bone.assert(type, `Unsupported type ${item.type} for option ${key}`);

            const option = { type, name: key };
            discordOptions.push(option);

            // Description

            Bone.assert(item.notes, `Missing description for option ${key}`);

            option.description = item.notes[0];

            if (item.flags) {

                // Name

                if (item.flags.label) {
                    option.name = item.flags.label;
                }

                // Required

                if (item.flags.presence === 'required') {
                    option.required = true;
                }

                // Valids

                if (item.flags.only &&
                    item.allows) {

                    Bone.assert(item.allows.length <= 10, `Option ${key} has more than 10 choices`);

                    option.choices = item.allows.map((choice) => {

                        return { name: choice, value: choice };
                    });
                }
            }
        }

        command.options = discordOptions;
    }

    // Request

    const promises = commands.map((command) => {

        return Api.post(`/applications/${Config.app}/guilds/${Config.guild}/commands`, {
            payload: command,
        });
    });

    return Promise.all(promises);
};

exports.handle = async function (interaction) {

    const definition = internals.commands[interaction.data.name];
    if (!definition) {
        return;
    }

    const command = {
        id: interaction.data.id,
        name: interaction.data.name,
        interaction: {
            id: interaction.id,
            token: interaction.token,
        },
        channel: interaction.channel_id,
        member: interaction.member,
        guild: interaction.guild_id,
    };

    const toolkit = new Toolkit(command);

    if (interaction.data.options) {
        command.options = {};

        for (const option of interaction.data.options) {
            command.options[option.name] = option.value;
        }

        // Validate options

        const result = definition.options.validate(command.options);
        if (result.errors) {
            return toolkit.error({
                title: 'Failed to process your command',
                description: `We detected a malformed option in your command: \`\`\`${result.errors[0].message}\`\`\``,
            });
        }

        command.options = result.value;
    }

    try {
        await definition.handler(command, toolkit);
    }
    catch (error) {
        console.log(error);
    }
};
