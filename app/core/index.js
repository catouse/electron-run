import notice from './notice';
import events from './events';
import models from './models';

const app = {
    notice,
    events,
    models
};

if (DEBUG) {
    global.$.App = app;
}

export default app;
