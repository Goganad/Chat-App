import React from 'react';
import PropTypes from 'prop-types';
import {DataContext} from './ChatApp';

class UsersList extends React.Component {
    static propTypes = {
        getUsersList: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.getUsersList();
    }

    render() {
        return (
            <DataContext.Consumer>
                {
                    ({users, setActiveChannel, userName, DMChannels, unreadChannels}) => (
                        <ul className="collection with-header users">
                            <li className="collection-header"><h6>Direct Messages</h6></li>
                            {
                                Object.keys(users).map(
                                    name =>
                                        <li key={name}
                                            onClick={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setActiveChannel(DMChannels[name] || null, true, name);
                                            }}
                                            className="collection-item">
                                            {
                                                users[name].online
                                                    ? <i className="material-icons green-text">lens</i>
                                                    : <i className="material-icons grey-text">radio_button_unchecked</i>
                                            }
                                            {name}
                                            {name === userName ? ' (you)' : null}
                                            {
                                                unreadChannels[DMChannels[name]] &&
                                                <i className="material-icons right tiny green-text message">message</i>
                                            }
                                        </li>
                                )
                            }
                        </ul>
                    )
                }
            </DataContext.Consumer>
        )
    }
}

export default UsersList;