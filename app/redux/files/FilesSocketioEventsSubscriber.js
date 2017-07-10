import { 
    renewFiles, 
} from './actions';

import Connector from '../SocketConnector.jsx';
import FilesSocketioEventsEmitter from './FilesSocketioEventsEmitter.js';


class FilesEventsSubsriber {
    /* Singleton class for managing events subscription for the projects */
    constructor(store) {
        this.store = store;
        this.connector = new Connector('files');

        this.connector.after_connected((x) => {
            this.emitter = new FilesSocketioEventsEmitter();
            this.emitter.renewFiles();
        });

        this.basic_events_registration();
    }

    basic_events_registration() {
        /* Register handlers on basic events */

        // Received all projects in one message
        this.register_socketio_handler('files:all:get:back', renewFiles);
    }

    register_socketio_handler(eventName, callback) {
        /* Just a wrapper for connector.listen */
        this.connector.listen(eventName, (x) => {
            this.store.dispatch(callback(x));
        });
    }
}

export default FilesEventsSubsriber;