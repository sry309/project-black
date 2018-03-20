import React, {Component} from "react";
import {connect} from "react-redux";
import _ from "lodash";
import { Message } from "semantic-ui-react";
import {Portal} from 'react-portal';

import {dismissNotification} from "./actions";


const NOTIFICATION_CONTAINER_STYLE = {
    fontFamily: 'inherit',
    position: 'fixed',
    width: 320,
    padding: '0 10px 10px 10px',
    zIndex: 9998,
    WebkitBoxSizing: 'border-box',
    MozBoxSizing: 'border-box',
    boxSizing: 'border-box',
    height: 'auto',
    top: '0px',
    bottom: 'auto',
    left: 'auto',
    right: '0px'    
};


// const NOTIFICATION_STYLE = {
//     position: 'relative',
//     width: '100%',
//     cursor: 'pointer',
//     borderRadius: '2px',
//     fontSize: '13px',
//     margin: '10px 0 0',
//     padding: '10px',
//     display: 'block',
//     WebkitBoxSizing: 'border-box',
//     MozBoxSizing: 'border-box',
//     boxSizing: 'border-box',
//     opacity: 0,
//     transition: '0.3s ease-in-out',
//     WebkitTransform: 'translate3d(0, 0, 0)',
//     transform: 'translate3d(0, 0, 0)',
//     willChange: 'transform, opacity',
// };


const Notification = ({message, header, type, id, onCloseClick=_.noop}) => {
    let headerText = header;
    let messageText = message;

    if(!headerText) {
        headerText = message;
        messageText = null;
    }
    const messageHeader = headerText ? <Message.Header>{headerText}</Message.Header> : null;
    // Turn the type string into a boolean prop with the same name
    const typeProp = type.toLowerCase();
    const typeObj = { [typeProp] : true};

    if(messageText) {
        const messagePieces = messageText.split("\n");
        messageText = messagePieces.map(piece => <div key={piece}>{piece}</div>);
    }

    const onDismiss = () => onCloseClick(id);

    return (
        <Message {...typeObj} onDismiss={onDismiss} >
            {messageHeader}
            <Message.Content>{messageText}</Message.Content>
        </Message>
    );
}


const actions = {dismissNotification};

export class NotificationManager extends Component {
    render() {
        let {notifications = []} = this.props;

        const renderedNotifications = notifications.map( notification => {
            const {id} = notification.payload;

            return (
                <Notification
                    key={id}
                    onCloseClick={this.props.dismissNotification}
                    {...notification.payload}
                />
            )
        });

        return (
            <Portal isOpened={true} key="notificationsPortal">
                <div style={NOTIFICATION_CONTAINER_STYLE}>
                    {renderedNotifications}
                </div>
            </Portal>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
    	notifications: state.notifications
    }
}

export default connect(mapStateToProps, actions)(NotificationManager);