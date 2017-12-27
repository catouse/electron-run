import clipboard from './clipboard';
import crypto from './crypto';
import EventEmitter from './event-emitter';
import env from './env';
import ui from './ui';
import dialog from './dialog';
import notify from './notify';
import config from '../common/config';
import net from './net';
import setting from './setting';

const platform = {
    type: 'browser',
    setting,
    clipboard,
    crypto,
    EventEmitter,
    env,
    ui,
    notify,
    config,
    net,
    dialog,
};

if(DEBUG) {
    global.$.Platform = platform;
}

export default platform;
