/* global interfaceConfig */

import React from 'react';

import { isMobileBrowser } from '../../base/environment/utils';
import { translate, translateToHTML } from '../../base/i18n';
import { Icon, IconWarning } from '../../base/icons';
import { Watermarks } from '../../base/react';
import { connect } from '../../base/redux';
import { CalendarList } from '../../calendar-sync';
import { RecentList } from '../../recent-list';
import { SettingsButton, SETTINGS_TABS } from '../../settings';

import { AbstractWelcomePage, _mapStateToProps } from './AbstractWelcomePage';
import Tabs from './Tabs';

/**
 * The pattern used to validate room name.
 *
 * @type {string}
 */
export const ROOM_NAME_VALIDATE_PATTERN_STR = '^[^?&:\u0022\u0027%#]+$';

/**
 * The Web container rendering the welcome page.
 *
 * @augments AbstractWelcomePage
 */
class WelcomePage extends AbstractWelcomePage {
    /**
     * Default values for {@code WelcomePage} component's properties.
     *
     * @static
     */
    static defaultProps = {
        _room: ''
    };

    /**
     * Initializes a new WelcomePage instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,

            generateRoomnames:
                interfaceConfig.GENERATE_ROOMNAMES_ON_WELCOME_PAGE,
            selectedTab: 0,
            secondPage: false,
            roomList: 2,
            friendAddMode: false,
            kebabMenuVisible: false,
            userData: {
                name: '',
                friend: [],
                myroom: [],
                recommendedFriend: [],
                recentFriend: []
            },
            roomData: [
                { roomName: "SW설계 회의방", host: "곽진욱", private: false},
                { roomName: "KNU 방", host: "이연지", private: false},
                { roomName: "민찬이와 친구들", host: "박민찬", private: true},
                { roomName: "로아 들어와", host: "곽형수", private: false},
                { roomName: "공부방", host: "전창희", private: true},
                { roomName: "오늘 회의 시작합니다", host: "최주원", private: true},
                { roomName: "메이플 주보돌이팟", host: "이상지", private: false},
                { roomName: "몬헌 밀라갈사람", host: "송성훈", private: false},
                { roomName: "과제 남았으면 들어와", host: "변지경", private: false},
            ]
        };

        /**
         * The HTML Element used as the container for additional content. Used
         * for directly appending the additional content template to the dom.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalContentRef = null;

        this._roomInputRef = null;

        /**
         * The HTML Element used as the container for additional toolbar content. Used
         * for directly appending the additional content template to the dom.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalToolbarContentRef = null;

        this._additionalCardRef = null;

        /**
         * The template to use as the additional card displayed near the main one.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalCardTemplate = document.getElementById(
            'welcome-page-additional-card-template');

        /**
         * The template to use as the main content for the welcome page. If
         * not found then only the welcome page head will display.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalContentTemplate = document.getElementById(
            'welcome-page-additional-content-template');

        /**
         * The template to use as the additional content for the welcome page header toolbar.
         * If not found then only the settings icon will be displayed.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalToolbarContentTemplate = document.getElementById(
            'settings-toolbar-additional-content-template'
        );

        // Bind event handlers so they are only bound once per instance.
        this._onFormSubmit = this._onFormSubmit.bind(this);
        this._enterSelectedRoom = this._enterSelectedRoom.bind(this);
        this._onRoomChange = this._onRoomChange.bind(this);
        this._onUserNameChange = this._onUserNameChange.bind(this);
        this._setAdditionalCardRef = this._setAdditionalCardRef.bind(this);
        this._setAdditionalContentRef
            = this._setAdditionalContentRef.bind(this);
        this._setRoomInputRef = this._setRoomInputRef.bind(this);
        this._setAdditionalToolbarContentRef
            = this._setAdditionalToolbarContentRef.bind(this);
        this._onTabSelected = this._onTabSelected.bind(this);
        this._renderFriendList = this._renderFriendList.bind(this);
        this._renderFriendRoom = this._renderFriendRoom.bind(this);
        this._renderPublicRoom = this._renderPublicRoom.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
    }

    /**
     * Implements React's {@link Component#componentDidMount()}. Invoked
     * immediately after this component is mounted.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        super.componentDidMount();

        document.body.classList.add('welcome-page');
        document.title = interfaceConfig.APP_NAME;

        if (this.state.generateRoomnames) {
            this._updateRoomname();
        }

        if (this._shouldShowAdditionalContent()) {
            this._additionalContentRef.appendChild(
                this._additionalContentTemplate.content.cloneNode(true));
        }

        if (this._shouldShowAdditionalToolbarContent()) {
            this._additionalToolbarContentRef.appendChild(
                this._additionalToolbarContentTemplate.content.cloneNode(true)
            );
        }

        if (this._shouldShowAdditionalCard()) {
            this._additionalCardRef.appendChild(
                this._additionalCardTemplate.content.cloneNode(true)
            );
        }

        const userName = JSON.parse(window.localStorage.getItem("userName"));
        let userData = null;

        if (userName) {
            if (userName.name) {
                userData = JSON.parse(window.localStorage.getItem(userName.name));
            }
        }

        if (userData) {
            if (userData.name) {
                this.setState({
                    username: userData.name,
                    userData: userData
                });
                this.pageFlip(true);
            }
        }
    }

    /**
     * Removes the classname used for custom styling of the welcome page.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        super.componentWillUnmount();

        document.body.classList.remove('welcome-page');
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement|null}
     */
    pageFlip = (page) => {
        this.setState({ secondPage: page });
    }

    confirmName = () => {
        // setState는 비동기라 저장이 느리므로 다른 변수에 다시 저장하여 state 저장과 local 저장을 독립적으로 처리한다.
        if (this.state.username) {
            let userObj = JSON.parse(window.localStorage.getItem(this.state.username));
            if (!userObj) {
                userObj = {
                    name: this.state.username,
                    friend: [],
                    myroom: [],
                    recommendedFriend: ["박민찬", "이연지", "정수환", "곽형수", "전창희", "최주원", "변지경", "박진석", "이상지", "송성훈", "홍승현"],
                    recentFriend: ["김장군", "이세연", "최정웅", "서재균"]
                }
            }
            
            const userNameObj = {
                name: this.state.username
            }

            this.setState({ 
                userData: userObj
            });

            window.localStorage.setItem(this.state.username, JSON.stringify(userObj));
            window.localStorage.setItem("userName", JSON.stringify(userNameObj));
            this.pageFlip(true);
        }
    }

    signOut = () => {
        const userNameObj = {
            name: ''
        }

        this.setState({ username: '' });
        window.localStorage.setItem("userName", JSON.stringify(userNameObj));
        this.pageFlip(false);
        this.deactiveFriendAddMode();
    }

    roomListToFriend = () => {
        this.setState({ roomList: 1 });
    }

    roomListToPublic = () => {
        this.setState({ roomList: 2 });
    }

    activeFriendAddMode = () => {
        this.setState({ friendAddMode: true });
    }

    deactiveFriendAddMode = () => {
        this.setState({ friendAddMode: false });
    }

    render() {
        const { _moderatedRoomServiceUrl, t } = this.props;
        const { DEFAULT_WELCOME_PAGE_LOGO_URL, DISPLAY_WELCOME_FOOTER } = interfaceConfig;
        const showAdditionalCard = this._shouldShowAdditionalCard();
        const showAdditionalContent = this._shouldShowAdditionalContent();
        const showAdditionalToolbarContent = this._shouldShowAdditionalToolbarContent();
        const contentClassName = showAdditionalContent ? 'with-content' : 'without-content';
        const footerClassName = DISPLAY_WELCOME_FOOTER ? 'with-footer' : 'without-footer';

        return (
            <>
                {!this.state.secondPage &&
                    <div
                        className = { `welcome ${contentClassName} ${footerClassName}` }
                        id = 'welcome_page'>
                        <div className = 'welcome-watermark'>
                            <Watermarks defaultJitsiLogoURL = { DEFAULT_WELCOME_PAGE_LOGO_URL } />
                        </div>
                        <div className = 'header'>
                            <div className = 'welcome-page-settings'>
                                <SettingsButton
                                    defaultTab = { SETTINGS_TABS.CALENDAR } />
                                { showAdditionalToolbarContent
                                    ? <div
                                        className = 'settings-toolbar-content'
                                        ref = { this._setAdditionalToolbarContentRef } />
                                    : null
                                }
                            </div>
                            <div className = 'header-image' />
                            <div className = 'header-container'>
                                <h1 className = 'header-text-title'>
                                    { t('welcomepage.headerTitle') }
                                </h1>
                                <span className = 'header-text-subtitle'>
                                    { t('welcomepage.headerSubtitle')}
                                </span>
                                <div id = 'enter_room'>
                                    <h3 className='username-text'>{ t('welcomepage.userNameText') }</h3>
                                    <div className = 'enter-room-input-container'>
                                        <form onSubmit = { this.confirmName }>
                                            <input
                                                aria-disabled = 'false'
                                                aria-label = 'User name input'
                                                // autoFocus = { true }
                                                className = 'enter-room-input'
                                                id = 'user_name_field'
                                                onChange = { this._onUserNameChange }
                                                pattern = { ROOM_NAME_VALIDATE_PATTERN_STR }
                                                // placeholder = { this.state.roomPlaceholder }
                                                // ref = { this._setRoomInputRef }
                                                title = { t('welcomepage.userNameAllowedChars') }
                                                type = 'text'
                                                value = { this.state.username } />
                                            <div
                                                className = { _moderatedRoomServiceUrl
                                                    ? 'warning-with-link'
                                                    : 'warning-without-link' }>
                                                { this._renderInsecureRoomNameWarning() }
                                            </div>
                                        </form>
                                    </div>
                                    <button
                                        aria-disabled = 'false'
                                        aria-label = 'Start meeting'
                                        className = 'welcome-page-button'
                                        id = 'enter_room_button'
                                        onClick = { this.confirmName }
                                        tabIndex = '0'
                                        type = 'button'>
                                        { t('welcomepage.nameCheck') }
                                    </button>
                                </div>

                                { _moderatedRoomServiceUrl && (
                                    <div id = 'moderated-meetings'>
                                        <p>
                                            {
                                                translateToHTML(
                                                t, 'welcomepage.moderatedMessage', { url: _moderatedRoomServiceUrl })
                                            }
                                        </p>
                                    </div>)}
                            </div>
                        </div>

                        { /*<div className = 'welcome-cards-container'>
                            <div className = 'welcome-card-row'>
                                <div className = 'welcome-tabs welcome-card welcome-card--blue'>
                                    { this._renderTabs() }
                                </div>
                                { showAdditionalCard
                                    ? <div
                                        className = 'welcome-card welcome-card--dark'
                                        ref = { this._setAdditionalCardRef } />
                                    : null }
                            </div>

                            { showAdditionalContent
                                ? <div
                                    className = 'welcome-page-content'
                                    ref = { this._setAdditionalContentRef } />
                                : null }
                        </div> */ }
                        { DISPLAY_WELCOME_FOOTER && this._renderFooter()}
                    </div>
                }
                {/* 두번째 페이지 */}
                {this.state.secondPage &&
                    <div
                        className = { `welcome ${contentClassName} ${footerClassName}` }
                        id = 'welcome_page'>
                        <div className = 'welcome-watermark'>
                            <Watermarks defaultJitsiLogoURL = { DEFAULT_WELCOME_PAGE_LOGO_URL } />
                        </div>
                        <div className = 'header'>
                            <div className = 'welcome-page-settings'>
                                <SettingsButton
                                    defaultTab = { SETTINGS_TABS.CALENDAR } />
                                { showAdditionalToolbarContent
                                    ? <div
                                        className = 'settings-toolbar-content'
                                        ref = { this._setAdditionalToolbarContentRef } />
                                    : null
                                }
                            </div>
                            <div className = 'header-image' />
                            <div className = 'header-container'>
                                <div className = 'waiting-container'>
                                    <button className = 'waiting-container-close' onClick= { this.signOut }>X</button>
                                    <div className = 'profile-container'>
                                        <div className = 'welcome-profile-image'></div>
                                        <h3 className = 'welcome-text'>{ this.state.username }</h3>
                                    </div>
                                    <div className = "enter-room-section">
                                        <div className = "friend-list-section">
                                            <h3 className = "friend-list-text">{ t('welcomepage.friendListText') } ({ this.state.userData.friend.length })</h3>
                                            <div className = "friend-list">
                                                { this._renderFriendList() }
                                            </div>
                                            { !this.state.friendAddMode && 
                                                <button className = "friend-add-button" onClick = { this.activeFriendAddMode }>+ 친구 추가</button>
                                            }
                                            { this.state.friendAddMode && 
                                                <button className = "friend-add-complete-button" onClick = { this.deactiveFriendAddMode }>완료</button>
                                            }
                                        </div>
                                        { !this.state.friendAddMode &&
                                            <div className = "room-section">
                                                {/* <h3 className = "generate-room-text">{ t('welcomepage.generateRoomText') }</h3> */}
                                                <div id = 'enter_room'>
                                                    <h3 className='username-text'>{ t('welcomepage.roomNameText') }</h3>
                                                    <div className = 'enter-room-input-container'>
                                                        <form onSubmit = { this._onFormSubmit }>
                                                            <input
                                                                aria-disabled = 'false'
                                                                aria-label = 'Meeting name input'
                                                                // autoFocus = { true }
                                                                className = 'enter-room-input'
                                                                id = 'enter_room_field'
                                                                onChange = { this._onRoomChange }
                                                                pattern = { ROOM_NAME_VALIDATE_PATTERN_STR }
                                                                // placeholder = { this.state.roomPlaceholder }
                                                                ref = { this._setRoomInputRef }
                                                                title = { t('welcomepage.roomNameAllowedChars') }
                                                                type = 'text'
                                                                value = { this.state.room } />
                                                            <div
                                                                className = { _moderatedRoomServiceUrl
                                                                    ? 'warning-with-link'
                                                                    : 'warning-without-link' }>
                                                                { this._renderInsecureRoomNameWarning() }
                                                            </div>
                                                        </form>
                                                    </div>
                                                    <button
                                                        aria-disabled = 'false'
                                                        aria-label = 'Start meeting'
                                                        className = 'welcome-page-button'
                                                        id = 'enter_room_button'
                                                        onClick = { this._onFormSubmit }
                                                        tabIndex = '0'
                                                        type = 'button'>
                                                        { t('welcomepage.startMeeting') }
                                                    </button>
                                                </div>
                                                <div className = "generated-room-list">
                                                    <div className = "generated-room-list-menu">
                                                        <h3
                                                            className = "generated-room-list-text"
                                                            onClick = { this.roomListToFriend }>
                                                                { t('welcomepage.generatedRoomListText1') }
                                                        </h3>
                                                        <h3
                                                            className = "generated-room-list-text"
                                                            onClick = { this.roomListToPublic }>
                                                                { t('welcomepage.generatedRoomListText2') }
                                                        </h3>
                                                    </div>
                                                    <hr className = "generated-room-hr"/>
                                                    { this.state.roomList == 1 &&
                                                        <div className = "generated-room-list-section">
                                                            { this._renderFriendRoom() }
                                                        </div>
                                                    }
                                                    { this.state.roomList == 2 &&
                                                        <div className = "generated-room-list-section">
                                                            { this._renderPublicRoom() }
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        }
                                        { this.state.friendAddMode &&
                                            <div className = "friend-add-section">
                                                <div className = "friend-add-board">
                                                    <div className = "recommend-friend-section">
                                                        <h3 className = "friend-add-section-text">추천 친구 ({ this.state.userData.recommendedFriend.length })</h3>
                                                        <div className = "recommend-friend-list">
                                                            { this._renderRecommendedFriendList() }
                                                        </div>
                                                    </div>
                                                    <div className = "recent-people-section">
                                                        <h3 className = "friend-add-section-text">최근 만난 사람들 ({ this.state.userData.recentFriend.length })</h3>
                                                        <div className = "recent-people-list">
                                                            { this._renderRecentFriendList() }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>

                                { _moderatedRoomServiceUrl && (
                                    <div id = 'moderated-meetings'>
                                        <p>
                                            {
                                                translateToHTML(
                                                t, 'welcomepage.moderatedMessage', { url: _moderatedRoomServiceUrl })
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        { /*<div className = 'welcome-cards-container'>
                            <div className = 'welcome-card-row'>
                                <div className = 'welcome-tabs welcome-card welcome-card--blue'>
                                    { this._renderTabs() }
                                </div>
                                { showAdditionalCard
                                    ? <div
                                        className = 'welcome-card welcome-card--dark'
                                        ref = { this._setAdditionalCardRef } />
                                    : null }
                            </div>

                            { showAdditionalContent
                                ? <div
                                    className = 'welcome-page-content'
                                    ref = { this._setAdditionalContentRef } />
                                : null }
                        </div> */ }
                        { DISPLAY_WELCOME_FOOTER && this._renderFooter()}
                    </div>
                }
            </>
        );
    }

    /**
     * Renders the insecure room name warning.
     *
     * @inheritdoc
     */
    _doRenderInsecureRoomNameWarning() {
        return (
            <div className = 'insecure-room-name-warning'>
                <Icon src = { IconWarning } />
                <span>
                    { this.props.t('security.insecureRoomNameWarning') }
                </span>
            </div>
        );
    }

    /**
     * Prevents submission of the form and delegates join logic.
     *
     * @param {Event} event - The HTML Event which details the form submission.
     * @private
     * @returns {void}
     */
    _onFormSubmit(event) {
        event.preventDefault();

        if (!this._roomInputRef || this._roomInputRef.reportValidity()) {
            const userObj = {
                ...this.state.userData,
                myroom: [
                    ...this.state.userData.myroom,
                    {
                        roomName: this.state.room,
                        host: this.state.username,
                        private: false
                    }
                ]
            };
            window.localStorage.setItem(this.state.username, JSON.stringify(userObj));
            this._onJoin();
        }
    }

    _enterSelectedRoom(customName) {
        this._onJoinCustom(customName);
    }

    /**
     * Overrides the super to account for the differences in the argument types
     * provided by HTML and React Native text inputs.
     *
     * @inheritdoc
     * @override
     * @param {Event} event - The (HTML) Event which details the change such as
     * the EventTarget.
     * @protected
     */
    _onRoomChange(event) {
        super._onRoomChange(event.target.value);
    }

    /**
     * Overrides the super to account for the differences in the argument types
     * provided by HTML and React Native text inputs.
     *
     * @inheritdoc
     * @override
     * @param {Event} event - The (HTML) Event which details the change such as
     * the EventTarget.
     * @protected
     */
    _onUserNameChange(event) {
        super._onUserNameChange(event.target.value);
    }

    /**
     * Callback invoked when the desired tab to display should be changed.
     *
     * @param {number} tabIndex - The index of the tab within the array of
     * displayed tabs.
     * @private
     * @returns {void}
     */
    _onTabSelected(tabIndex) {
        this.setState({ selectedTab: tabIndex });
    }

    /**
     * Move a friend from the recommended friend list to the friend list.
     * 
     * @param {String} newfriend 
     */
    _addFriendFromRecommended(newfriend) {
        const { recommendedFriend, friend, name } = this.state.userData;
        const userObj = {
            ...this.state.userData,
            recommendedFriend: [...recommendedFriend.filter(name => name !== newfriend)],
            friend: [...friend, newfriend]
        }

        this.setState({ userData: userObj });
        window.localStorage.setItem(name, JSON.stringify(userObj));
    }

    /**
     * Move a friend from the recent friend list to the friend list.
     * 
     * @param {String} newfriend 
     */
    _addFriendFromRecent(newfriend) {
        const { recentFriend, friend, name } = this.state.userData;
        const userObj = {
            ...this.state.userData,
            recentFriend: [...recentFriend.filter(name => name !== newfriend)],
            friend: [...friend, newfriend]
        }

        this.setState({ userData: userObj });
        window.localStorage.setItem(name, JSON.stringify(userObj));
    }
    
    /**
     * Renders the friend list.
     * 
     * @returns {ReactElement}
     */
    _renderFriendList() {
        return (
            <>
            { this.state.userData.friend.map((friend, index) => (
                <div className = "friend-box">
                    <div className = "friend-profile-image"></div>
                    <h3 className = "friend-name-text">{ friend }</h3>
                    <div className = "friend-message-img"></div>
                </div>
            ))}
            </>
        )
    }
    
    /**
     * Renders the recommended friend list.
     * 
     * @returns {ReactElement}
     */
    _renderRecommendedFriendList() {
        return (
            <>
            { this.state.userData.recommendedFriend.map((friend, index) => (
                <div className = "friend-box">
                    <div className = "friend-profile-image"></div>
                    <h3 className = "friend-name-text">{ friend }</h3>
                    <button className = "friend-add-button2" onClick = { () => this._addFriendFromRecommended(friend) }>+</button>
                </div>
            ))}
            </>
        )
    }
    
    /**
     * Renders the recent friend list.
     * 
     * @returns {ReactElement}
     */
    _renderRecentFriendList() {
        return (
            <>
            { this.state.userData.recentFriend.map((friend, index) => (
                <div className = "friend-box">
                    <div className = "friend-profile-image"></div>
                    <h3 className = "friend-name-text">{ friend }</h3>
                    <button className = "friend-add-button2" onClick = { () => this._addFriendFromRecent(friend) }>+</button>
                </div>
            ))}
            </>
        )
    }
    
    /**
     * Renders the friend rooms.
     * 
     * @returns {ReactElement}
     */
    _renderFriendRoom() {
        const { friend, myroom } = this.state.userData;
        const { roomData } = this.state;
        return (
            <>
            { myroom.map((roomData, index) => (
                <div className = "generated-room" onClick = {() =>  this._enterSelectedRoom(roomData.roomName) }>
                <h3 className = "generated-room-name-text">{ roomData.roomName }</h3>
                <div className = "generated-room-info">
                    <p className = "generated-room-host">Host { roomData.host }</p>
                    { roomData.private &&
                        <p className = "generated-room-constraint">친구만</p>
                    }
                </div>
            </div>
            ))}
            { roomData.map((roomData, index) => (
                <>
                { friend.includes(roomData.host)  &&
                    <div className = "generated-room" onClick = {() =>  this._enterSelectedRoom(roomData.roomName) }>
                        <h3 className = "generated-room-name-text">{ roomData.roomName }</h3>
                        <div className = "generated-room-info">
                            <p className = "generated-room-host">Host { roomData.host }</p>
                            { roomData.private &&
                                <p className = "generated-room-constraint">친구만</p>
                            }
                        </div>
                    </div>
                }
                </>
            ))}
            </>
        )
    }
    
    /**
     * Renders the public rooms.
     * 
     * @returns {ReactElement}
     */
    _renderPublicRoom() {
        const { myroom } = this.state.userData;
        const { roomData } = this.state;
        return (
            <>
            { myroom.map((roomData, index) => (
                <div className = "generated-room" onClick = {() =>  this._enterSelectedRoom(roomData.roomName) }>
                <h3 className = "generated-room-name-text">{ roomData.roomName }</h3>
                <div className = "generated-room-info">
                    <p className = "generated-room-host">Host { roomData.host }</p>
                    { roomData.private &&
                        <p className = "generated-room-constraint">친구만</p>
                    }
                </div>
            </div>
            ))}
            { roomData.map((roomData, index) => (
                <>
                { !(roomData.private) &&
                    <div className = "generated-room" onClick = {() =>  this._enterSelectedRoom(roomData.roomName) }>
                        <h3 className = "generated-room-name-text">{ roomData.roomName }</h3>
                        <div className = "generated-room-info">
                            <p className = "generated-room-host">Host { roomData.host }</p>
                        </div>
                    </div>
                }
                </>
            ))}
            </>
        )
    }
    
    /**
     * Renders the footer.
     *
     * @returns {ReactElement}
     */
    _renderFooter() {
        const { t } = this.props;
        const {
            MOBILE_DOWNLOAD_LINK_ANDROID,
            MOBILE_DOWNLOAD_LINK_F_DROID,
            MOBILE_DOWNLOAD_LINK_IOS
        } = interfaceConfig;

        return (<footer className = 'welcome-footer'>
            <div className = 'welcome-footer-centered'>
                <div className = 'welcome-footer-padded'>
                    <div className = 'welcome-footer-row-block welcome-footer--row-1'>
                        <div className = 'welcome-footer-row-1-text'>{t('welcomepage.jitsiOnMobile')}</div>
                        { /*<a
                            className = 'welcome-badge'
                            href = { MOBILE_DOWNLOAD_LINK_IOS }>
                            <img
                                alt = { t('welcomepage.mobileDownLoadLinkIos') }
                                src = './images/app-store-badge.png' />
                        </a>
                        <a
                            className = 'welcome-badge'
                            href = { MOBILE_DOWNLOAD_LINK_ANDROID }>
                            <img
                                alt = { t('welcomepage.mobileDownLoadLinkAndroid') }
                                src = './images/google-play-badge.png' />
                        </a>
                        <a
                            className = 'welcome-badge'
                            href = { MOBILE_DOWNLOAD_LINK_F_DROID }>
                            <img
                                alt = { t('welcomepage.mobileDownLoadLinkFDroid') }
                                src = './images/f-droid-badge.png' />
                        </a> */ }
                    </div>
                </div>
            </div>
        </footer>);
    }

    /**
     * Renders tabs to show previous meetings and upcoming calendar events. The
     * tabs are purposefully hidden on mobile browsers.
     *
     * @returns {ReactElement|null}
     */
    _renderTabs() {
        if (isMobileBrowser()) {
            return null;
        }

        const { _calendarEnabled, _recentListEnabled, t } = this.props;

        const tabs = [];

        if (_calendarEnabled) {
            tabs.push({
                label: t('welcomepage.calendar'),
                content: <CalendarList />
            });
        }

        if (_recentListEnabled) {
            tabs.push({
                label: t('welcomepage.recentList'),
                content: <RecentList />
            });
        }

        if (tabs.length === 0) {
            return null;
        }

        return (
            <Tabs
                onSelect = { this._onTabSelected }
                selected = { this.state.selectedTab }
                tabs = { tabs } />);
    }

    /**
     * Sets the internal reference to the HTMLDivElement used to hold the
     * additional card shown near the tabs card.
     *
     * @param {HTMLDivElement} el - The HTMLElement for the div that is the root
     * of the welcome page content.
     * @private
     * @returns {void}
     */
    _setAdditionalCardRef(el) {
        this._additionalCardRef = el;
    }

    /**
     * Sets the internal reference to the HTMLDivElement used to hold the
     * welcome page content.
     *
     * @param {HTMLDivElement} el - The HTMLElement for the div that is the root
     * of the welcome page content.
     * @private
     * @returns {void}
     */
    _setAdditionalContentRef(el) {
        this._additionalContentRef = el;
    }

    /**
     * Sets the internal reference to the HTMLDivElement used to hold the
     * toolbar additional content.
     *
     * @param {HTMLDivElement} el - The HTMLElement for the div that is the root
     * of the additional toolbar content.
     * @private
     * @returns {void}
     */
    _setAdditionalToolbarContentRef(el) {
        this._additionalToolbarContentRef = el;
    }

    /**
     * Sets the internal reference to the HTMLInputElement used to hold the
     * welcome page input room element.
     *
     * @param {HTMLInputElement} el - The HTMLElement for the input of the room name on the welcome page.
     * @private
     * @returns {void}
     */
    _setRoomInputRef(el) {
        this._roomInputRef = el;
    }

    /**
     * Returns whether or not an additional card should be displayed near the tabs.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowAdditionalCard() {
        return interfaceConfig.DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD
            && this._additionalCardTemplate
            && this._additionalCardTemplate.content
            && this._additionalCardTemplate.innerHTML.trim();
    }

    /**
     * Returns whether or not additional content should be displayed below
     * the welcome page's header for entering a room name.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowAdditionalContent() {
        return interfaceConfig.DISPLAY_WELCOME_PAGE_CONTENT
            && this._additionalContentTemplate
            && this._additionalContentTemplate.content
            && this._additionalContentTemplate.innerHTML.trim();
    }

    /**
     * Returns whether or not additional content should be displayed inside
     * the header toolbar.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowAdditionalToolbarContent() {
        return interfaceConfig.DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT
            && this._additionalToolbarContentTemplate
            && this._additionalToolbarContentTemplate.content
            && this._additionalToolbarContentTemplate.innerHTML.trim();
    }
}

export default translate(connect(_mapStateToProps)(WelcomePage));
