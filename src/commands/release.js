'use strict';

module.exports = {

    name: 'release',
    description: 'When can I use BotSocket?',

    handler(_, toolkit) {

        return toolkit.info({
            title: 'BotSocket release date',
            description: '9:00am GMT 26th March 2021',
        });
    },
};
