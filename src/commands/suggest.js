'use strict';

const Jade = require('@botsocket/jade');

module.exports = {

    name: 'suggest',
    description: 'Make a suggestion to make BotSocket better for everyone!',

    options: {
        suggestion: Jade.string()
            .min(10)
            .required()
            .description('Your suggestion. Must have at least 10 characters'),
    },

    handler(_, toolkit) {

        return toolkit.success({
            title: 'Successfully submitted your suggestion',
            description: 'Thank you for your contribution!',
        });
    },
};
