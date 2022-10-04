'use strict';

const { LiveChat } = require('youtube-chat');

const windowModule = require('./window-module');

let liveChat;

function createChatRoom(id = '', isChannelId = false) {
    try {
        let currentId = '';
        let lastError = '';
        let liveChatTemp;

        if (isChannelId) {
            // If channelId is specified, liveId in the current stream is automatically acquired.
            // Recommended
            liveChatTemp = new LiveChat({ channelId: id });
        } else {
            // Or specify LiveID in Stream manually.
            liveChatTemp = new LiveChat({ liveId: id });
        }

        // Emit at start of observation chat.
        // liveId: string
        liveChatTemp.on('start', (liveId) => {
            console.log(liveId);
            addDialog('', '連線成功');
        });

        // Emit at end of observation chat.
        // reason: string?
        liveChatTemp.on('end', (reason) => {
            console.log(reason);
            addDialog('', reason);
        });

        // Emit at receive chat.
        // chat: ChatItem
        liveChatTemp.on('chat', (chatItem) => {
            console.log(chatItem);

            try {
                let author = chatItem.author;
                let name = '';
                let text = '';

                // set name
                if (author?.thumbnail) {
                    // =s64-c-k-c0x00ffffff-no-rj
                    name += `<img class="img_thumbnail" alt="[${author?.thumbnail?.alt}]" title="${author?.thumbnail?.alt}" src="${author?.thumbnail?.url}"> `;
                }

                name += author?.name + ' ';

                if (author.badge) {
                    // =s32-c-k
                    name += `<img class="img_badge" alt="[${author?.badge?.thumbnail?.alt}]" title="${author?.badge?.thumbnail?.alt}" src="${author?.badge?.thumbnail?.url}">`;
                }

                // set text
                for (let index = 0; index < chatItem.message.length; index++) {
                    const message = chatItem.message[index];

                    if (message.text) {
                        text += message.text;
                    } else {
                        // =w24-h24-c-k-nd
                        text += `<img class="img_emote" alt="[${message.alt}]" title="${message.alt}" src="${message.url}">`;
                    }
                }

                addDialog(name, text);
            } catch (error) {
                console.log(error);
            }
        });

        // Emit when an error occurs
        // err: Error or any
        liveChatTemp.on('error', (error) => {
            if (lastError.toString() != error.toString()) {
                lastError = error;
            } else {
                return;
            }

            console.error(error);
            addDialog('', error);

            if (error.includes(`reading '0'`)) {
                addDialog('', 'Restart chat room.');
                createChatRoom(currentId, isChannelId);
            }
        });

        liveChat = liveChatTemp;
    } catch (error) {
        console.error(error);
    }
}

async function startFetch() {
    // Start fetch loop
    const ok = await liveChat.start();

    if (!ok) {
        console.log('Failed to start, check emitted error');
    }
}

function stopFetch() {
    // Stop fetch loop
    liveChat.stop();
}

function addDialog(name, text) {
    windowModule.sendIndex('add-dialog', name, text);
}

exports.createChatRoom = createChatRoom;
exports.startFetch = startFetch;
exports.stopFetch = stopFetch;
