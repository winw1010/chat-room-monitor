'use strict';

const tmi = require('tmi.js');

const windowModule = require('./window-module');

let client = null;

function createChatRoom(id = '') {
    let clientTemp = new tmi.Client({
        channels: [id],
    });

    clientTemp.on('connected', (address, port) => {
        console.log(address + ':' + port);
        addDialog(null, `連線成功(Twitch ID: ${id})`);
    });

    clientTemp.on('disconnected', (reason) => {
        console.log(reason);
        addDialog(null, reason);
    });

    clientTemp.on('chat', (channel, userstate, message) => {
        console.log({ type: 'chat', userstate, message });
        addDialog(userstate, message);
    });

    clientTemp.on('subscription', (channel, username, methods, message, userstate) => {
        console.log({ type: 'subscription', username, methods, message, userstate });
        addDialog(userstate, message);
    });

    client = clientTemp;
}

function startFetch() {
    client.connect();
}

function stopFetch() {
    client.disconnect();
}

function addDialog(userstate, message) {
    windowModule.sendIndex(
        'add-dialog',
        userstate ? nameProcess(userstate, userstate['display-name']) : '',
        userstate ? textProcess(userstate, message) : message,
        userstate?.color
    );
}

function nameProcess(userstate, displayName = '') {
    let badges = '';

    if (userstate?.['badge-info']?.['subscriber']) {
        badges += `[${userstate['badge-info']['subscriber']}] `;
    }

    if (userstate.badges) {
        if (userstate.badges.staff) {
            badges += getBadge('Twitch Staff', 'd97c37bd-a6f5-4c38-8f57-4e4bef88af34');
        }

        if (userstate.badges.admin) {
            badges += getBadge('Admins', '9ef7e029-4cdf-4d4d-a0d5-e2b3fb2583fe');
        }

        if (userstate.badges.broadcaster) {
            badges += getBadge('Broadcasters', '5527c58c-fb7d-422d-b71b-f309dcb85cc1');
        }

        if (userstate.badges.moderator) {
            badges += getBadge('Chat Moderator', '3267646d-33f0-4b17-b3df-f923a41db1d0');
        }

        if (userstate.badges.partner) {
            badges += getBadge('Verified', 'd12a2e27-16f6-41d0-ab77-b780518f00a3');
        }

        if (userstate.badges.vip) {
            badges += getBadge('VIP', 'b817aba4-fad8-49e2-b88a-7cc744dfa6ec');
        }

        if (userstate.badges.no_video) {
            badges +=
                '<img class="img_badge" alt="[Watching without Video]" title="Watching without Video" src="https://assets.help.twitch.tv/article/img/659115-05.png"> ';
        }

        if (userstate.badges.no_audio) {
            badges +=
                '<img class="img_badge" alt="[Watching without Audio]" title="Watching without Audio" src="https://assets.help.twitch.tv/article/img/659115-04.png"> ';
        }

        if (userstate.badges.turbo) {
            badges += getBadge('Turbo', 'bd444ec6-8f34-4bf9-91f4-af1e3428d80f');
        }

        if (userstate.badges.premium) {
            badges += getBadge('Prime Gaming', 'a1dd5073-19c3-4911-8cb4-c464a7bc1510');
        }
    }

    return badges + displayName;
}

function textProcess(userstate, message = '') {
    let text = message;
    let emoteCodeList = [];

    if (userstate.emotes) {
        const emoteIdList = Object.getOwnPropertyNames(userstate.emotes);
        emoteIdList.sort((a, b) => b.length - a.length);

        for (let index = 0; index < emoteIdList.length; index++) {
            const emoteId = emoteIdList[index];
            const emoteIndexList = userstate.emotes[emoteId];

            if (emoteIndexList?.length > 0) {
                const startIndex = parseInt(emoteIndexList[0].split('-')[0]);
                const endIndex = parseInt(emoteIndexList[0].split('-')[1]);
                const emoteCode = text.slice(startIndex, endIndex + 1);

                if (text.includes(emoteCode)) {
                    emoteCodeList.push([emoteCode, getEmote(emoteCode, emoteId)]);
                }
            }
        }
    }

    for (let index = 0; index < emoteCodeList.length; index++) {
        const emoteCode = emoteCodeList[index];
        text = text.replaceAll(emoteCode[0], emoteCode[1]);
    }

    return text;
}

function getBadge(title, id) {
    return `<img class="img_badge" alt="[${title}"]" title="${title}" src="https://static-cdn.jtvnw.net/badges/v1/${id}/3"> `;
}

function getEmote(title, id) {
    return `<img class="img_emote" alt="[${title}]" title="${title}" src="https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/light/3.0">`;
}

exports.createChatRoom = createChatRoom;
exports.startFetch = startFetch;
exports.stopFetch = stopFetch;
