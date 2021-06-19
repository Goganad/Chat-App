import React from 'react';
import {DataContext} from './ChatApp';
import classnames from 'classnames';
import UsersList from './UsersList';

const Names = [
    '',
    'Stu Mackenzie',
    'John Doe',
    'Cook Craig',
    'Thom Yorke',
    'Andrew Vanwyngarden',
];

export const WelcomeScreen = ({name, setData}) => (
    <div className='container valign-wrapper'>
        <div className='row'>
            <h4 className='center'>Welcome! Pick your name</h4>
            <div className={'input-field  col s12 m12'}>
                <select value={name} onChange={e => setData({name: e.target.value})}>
                    {
                        Names.map(item => <option key={item} value={item}>{item || 'Names'}</option>)
                    }
                </select>
            </div>
            <input type={'text'}
                   value={name}
                   placeholder='Name'
                   onChange={e => setData({name: e.target.value})}
            />
            <button className="btn waves-effect waves-light right"
                    disabled={!name}
                    type="submit"
                    onClick={e => {
                        e.preventDefault();
                        setData({name, openChat: true});
                    }}
                    name="action">
                Submit
                <i className="material-icons right">send</i>
            </button>
        </div>
    </div>
);


export const Sidebar = () => (
    <DataContext.Consumer>
        {
            ({connected, getUsersList, askForChannelName}) => (
                <div className='sidebar'>
                    <UserNameCard/>
                    {
                        connected &&
                        <a className="waves-effect waves-light btn-small new-channel"
                           href='#0'
                           onClick={askForChannelName}>
                            <i className="material-icons left">control_point</i>
                            Create channel
                        </a>
                    }

                    <ChannelsList/>
                    {
                        connected && <UsersList getUsersList={getUsersList}/>
                    }
                </div>
            )
        }
    </DataContext.Consumer>
);

const UserNameCard = () => (
    <DataContext.Consumer>
        {
            ({connected, userName}) =>
                <div className="card blue-grey darken-1">
                    <div className="card-content white-text">
                        <span className="card-title">{userName}</span>
                    </div>
                    <div className="card-action">
                        <a href="#0" className='status'>
                            <i className='material-icons tiny'>{connected ? 'check_circle' : 'sync'}</i>
                            &nbsp;{connected ? 'Connected' : 'Connecting...'}</a>
                    </div>
                </div>
        }
    </DataContext.Consumer>
);

const ChannelsList = () => (
    <DataContext.Consumer>
        {
            ({channels}) =>
                <ul className="collection with-header">
                    <li className="collection-header"><h6>Channels</h6></li>
                    {
                        Object.keys(channels).map(
                            id => (channels[id].isPublic)
                                ? <PublicChannel key={id}
                                                 id={id}
                                                 {...channels[id]}
                                />
                                : null
                        )
                    }
                </ul>
        }
    </DataContext.Consumer>
);

const PublicChannel = ({id, name, isPublic}) => (
    <DataContext.Consumer>
        {
            ({unreadChannels, activeChannel, setActiveChannel}) =>
                <li onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveChannel(id, false, null);
                }}
                    className={classnames("collection-item", activeChannel && activeChannel.id === id && 'active')}>
                    <ChannelPublicIcon isPublic={isPublic}/>&nbsp;
                    {
                        unreadChannels[id] && <UnreadMessagesIcon/>
                    }
                    {name}
                </li>
        }
    </DataContext.Consumer>
);

export const ChannelPublicIcon = ({isPublic}) => <i className="material-icons tiny">{isPublic ? 'public' : 'lock'}</i>;

export const UnreadMessagesIcon = () => <i className="material-icons left tiny light-green-text message">message</i>;