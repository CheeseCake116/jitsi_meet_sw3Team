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
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, addDoc, setDoc, updateDoc, doc } from 'firebase/firestore/lite';
import { consolidateStreamedStyles } from 'styled-components';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

/**
 * The pattern used to validate room name.
 *
 * @type {string}
 */
export const ROOM_NAME_VALIDATE_PATTERN_STR = '^[^?&:\u0022\u0027%#]+$';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyAThBA3DXjI0yMmuIhN5Vw_iLdCqOZzfDw",
    authDomain: "jitsimeetdb.firebaseapp.com",
    projectId: "jitsimeetdb",
    storageBucket: "jitsimeetdb.appspot.com",
    messagingSenderId: "889346691784",
    appId: "1:889346691784:web:d5fc2938f42744ad7e4bfd",
    measurementId: "G-8XSPYVFBVW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
            userid: '',
            password: '',
            passwordCF: '',
            signupname: '',
            generateRoomnames:
                interfaceConfig.GENERATE_ROOMNAMES_ON_WELCOME_PAGE,
            selectedTab: 0,
            Page: 0,
            Login: false,
            mentoInfoText: '',
            messageWith: '',
            userData: {
                name: '',
                userid: '',
                password: '',
                friend: [],
                follow: [],
                follower: []
            },
            messageText: '',
            roomData: [],
            accountData: [],
            messageData: [],
            mentoData: []
            
            //"?????????", "?????????", "?????????", "?????????", "?????????", "?????????", "?????????", "?????????", "?????????", "?????????", "?????????", "?????????", "?????????", "?????????", "?????????"],
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
        this._renderPublicRoom = this._renderPublicRoom.bind(this);
        this._renderMessage = this._renderMessage.bind(this);
        this._renderMyMessage = this._renderMyMessage.bind(this);
        this._renderFriendMessage = this._renderFriendMessage.bind(this);
        this._onMessageChange = this._onMessageChange.bind(this);
        this._sendMessage = this._sendMessage.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
    }

    // Get a list of cities from your database
    getRoomData = async (db) => {
        const dbData = collection(db, 'roomData');
        const dataDocs = await getDocs(dbData);
        await this.setState({ roomData: dataDocs.docs.map(doc => doc.data()) });
    }

    getAccountData = async (db) => {
        const dbData = collection(db, 'accountData');
        const dataDocs = await getDocs(dbData);
        await this.setState({ accountData: dataDocs.docs.map(doc => doc.data()) });
    }

    getMessageData = async (db) => {
        const dbData = collection(db, 'messageData');
        const dataDocs = await getDocs(dbData);
        await this.setState({ messageData: dataDocs.docs[0].data().message });
    }

    getMentoData = async (db) => {
        const dbData = collection(db, 'mentoData');
        const dataDocs = await getDocs(dbData);
        await this.setState({ mentoData: dataDocs.docs.map(doc => doc.data()) });
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
        //document.title = interfaceConfig.APP_NAME;
        document.title = "M2M";

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

        this.loadData()

        //                      -------------- ????????? ?????? ?????? -------------
        // let userNameObj = JSON.parse(window.sessionStorage.getItem("userName"));
        // if (userNameObj) {
        //     this.confirmName(userNameObj.userid, userNameObj.password, userNameObj.name);
        // }
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
        this.setState({ Page: page });
        if (page == 2) {
            this.getRoomData(db);
        }
    }

    loadData = () => {
        this.getMentoData(db);
        this.getMessageData(db);
        this.getRoomData(db);
        this.getAccountData(db);
    }

    confirmName = (userid, password, username) => {
        // setState??? ???????????? ????????? ???????????? ?????? ????????? ?????? ???????????? state ????????? local ????????? ??????????????? ????????????.
        if (userid && password && username) {

            //                      -------------- userData ?????? -------------
            const { accountData } = this.state;
            const userObj = accountData.find(acc => acc.userid == userid && acc.password == password);
            if (userObj) {
                const userNameObj = {
                    name: username,
                    userid: userid,
                    password: password
                }

                this.setState({
                    username: username,
                    userData: userObj,
                    Login: true
                });
                // window.sessionStorage.setItem("userName", JSON.stringify(userNameObj)); // ?????? ?????? ??????
            }
        }
    }

    signIn = (event) => {
        event.preventDefault();
        console.log("signin");

        const { userid, password, accountData } = this.state;

        if (!userid) { alert("???????????? ??????????????????."); return; }
        if (!password) { alert("??????????????? ??????????????????."); return; }

        const userData = accountData && accountData.find(acc => acc.userid == userid);
        if (userData) {
            if (userData.password == password) {
                this.confirmName(userid, password, userData.name);
                this.pageFlip(0);
                this.setState({
                    userid: '',
                    password: '',
                    passwordCF: '',
                    signupname: ''
                });
                alert("????????? ???????????????.");
            }
            else {
                alert("??????????????? ????????????.");
            }
        }
        else {
            alert("???????????? ?????? ??????????????????.");
        }
    }

    signUp = async (event) => {
        event.preventDefault();
        console.log("signup");

        const {userid, password, passwordCF, signupname, accountData } = this.state;

        if (!signupname) { alert("????????? ??????????????????."); return; }
        if (!userid) { alert("???????????? ??????????????????."); return; }
        if (!password) { alert("??????????????? ??????????????????."); return; }
        if (!passwordCF) { alert("???????????? ???????????? ??????????????????."); return; }
        if (password != passwordCF) { alert("???????????? ??????????????? ???????????? ????????????."); return; }

        if (!accountData) {
            alert("?????? ??????");
        }
        else {
            if (accountData.find(acc => acc.userid == userid)) {
                alert("?????? ???????????? ??????????????????.\n?????? ???????????? ??????????????????.");
            }
            else {
                let accountObj = { 
                    userid: userid,
                    password: password,
                    name: signupname,
                    follow: [],
                    follower: []
                };
                this.setState({
                    userid: '',
                    password: '',
                    passwordCF: '',
                    signupname: ''
                });
                this.setState({ accountData: [...accountData, accountObj] });
                await setDoc(doc(db, "accountData", userid), accountObj);
                alert("???????????? ?????????????????????.");
                this.pageFlip(4);
            }
        }
    }

    signOut = () => {
        const userNameObj = {
            name: '',
            userid: '',
            password: '',
            passwordCF: ''
        }

        this.setState({
            Login: false,
            username: '',
            userData: {
                name: '',
                userid: '',
                password: '',
                friend: [],
                follow: [],
                follower: []
            },
            messageText: '',
            messageWith: ''
        });

        alert("???????????? ???????????????.");
        // window.sessionStorage.setItem("userName", JSON.stringify(userNameObj)); // ?????? ??????
    }

    _Message_With = (friendID) => {
        this.setState({ messageWith: friendID });
    }

    _reload = async (num) => {
        if (num == 1) {
            await this.getRoomData(db);
        } else if (num == 2) {
            await this.getAccountData(db);
        } else if (num == 3) {
            await this.getMessageData(db);
        } else if (num == 4) {
            await this.getMentoData(db);
        }
    }

    render() {
        const { _moderatedRoomServiceUrl, t } = this.props;
        const { DEFAULT_WELCOME_PAGE_LOGO_URL, DISPLAY_WELCOME_FOOTER } = interfaceConfig;
        const showAdditionalCard = this._shouldShowAdditionalCard();
        const showAdditionalContent = this._shouldShowAdditionalContent();
        const showAdditionalToolbarContent = this._shouldShowAdditionalToolbarContent();
        const contentClassName = showAdditionalContent ? 'with-content' : 'without-content';
        const footerClassName = DISPLAY_WELCOME_FOOTER ? 'with-footer' : 'without-footer';
        const { follow, follower, name, userid } = this.state.userData;
        const { mentoData } = this.state;
        const wholeFollow = [
            ...follow,
            ...follower.filter(follower => !follow.includes(follower))
        ]

        return (
            <>
                <div
                    className = { `welcome ${contentClassName} ${footerClassName}` }
                    id = 'welcome_page'>
                    <div className="header-menu">
                        <div className="header-menu-items">
                            {/* <div style="display: flex;">
                                
                                <h3 style="font-weight: bold;color:  black;font-size: 24px;margin: auto 10px;">Mantees</h3>
                            </div> */}
                            <div className="header-menu-logo" onClick={ () => this.pageFlip(0) }></div>
                            <ul className="header-menu-ul">
                                <li className={`header-menu-li ${ this.state.Page == 0 && "bottom-red" }`} onClick={ () => this.pageFlip(0) }><div className="homepage-button"></div></li>
                                <li className={`header-menu-li ${ this.state.Page == 1 && "bottom-red" }`} onClick={ () => this.pageFlip(1) }><p className="header-menu-li-p">?????? ??????</p></li>
                                <li className={`header-menu-li ${ this.state.Page == 2 && "bottom-red" }`} onClick={ () => this.pageFlip(2) }><p className="header-menu-li-p">????????? ??????</p></li>
                                <li className={`header-menu-li ${ this.state.Page == 3 && "bottom-red" }`} onClick={ () => this.pageFlip(3) }><p className="header-menu-li-p">????????? ??????</p></li>
                            </ul>
                            { !this.state.Login &&
                                <h3 className="header-menu-login" onClick={ () => this.pageFlip(4) }>?????????</h3>
                            }
                            { this.state.Login &&
                            <div className="header-menu-flex">
                                <div className = 'profile-container'>
                                    <div className = 'welcome-profile-image'></div>
                                    <h3 className = 'welcome-text'>{ name }</h3>
                                </div>
                                <h3 className="header-menu-login" onClick={ this.signOut }>????????????</h3>
                            </div>
                            }
                        </div>
                    </div>
                    {this.state.Page == 0 &&
                    <>
                        <div className = 'header'>
                            <h3 className='header-text'>M2M ?????? ?????? ?????? ?????????</h3>
                        </div>
                        <div className="mento-section">
                            <h3 className = "mento-section-text">M2M??? ?????? ?????? ???????????????.</h3>
                            <p className="intro-text"><b>M2M??? ??????????????? ???????????? ?????? ?????? ?????? ?????? ??????????????????.</b><br/>
                                ????????? ????????? ????????? ?????? ????????? ?????? ????????? ?????????, ????????? ???????????? ???????????? ????????? ??? ??? ????????????.<br/>
                                M2M????????? ????????? ????????? ????????? ??????????????? ?????? ????????? ???????????? ??? ????????? ?????? ????????? ???????????? ??????????????????.<br/>
                                ?????? ???????????? ??????????????? ?????? ????????? ????????? ????????? ????????? ????????? ??? ?????? ????????? ????????? ????????????.<br/>
                                <br/>
                                <b>????????? ????????? ?????? ?????? ????????? ??? ??? ????????????.</b><br/>
                                <b>?????? ??????</b> ????????? ????????? ????????? ???????????? ????????? ????????? ????????? ???????????????, ?????? ???????????? ?????? ????????? ???????????? ??? ????????????.<br/>
                                <b>????????? ??????</b> ????????? ?????? ??????????????? ????????????, ?????? ????????? ????????? ???????????? ?????? ???????????? ????????? ??? ??? ????????????.<br/>
                                <b>????????? ??????</b> ????????? ???????????? ???????????? ???????????? ????????????, ?????? ?????? ???????????? ???????????? ????????? ??? ????????????.<br/>
                                <br/>
                                <span>?????? ?????? ??????????????? M2M??? ????????? ???????????? ??????????????????.</span>
                            </p>
                        </div>
                    </>
                    }
                    {this.state.Page == 1 &&
                    <>
                        <div className = 'header'>
                            <h3 className='header-text'>???????????? ???????????? ???????????????<br/>?????? ????????? ????????? ??? ????????????.</h3>
                        </div>
                        <div className="mento-section">
                            <h3 className = "mento-section-text">?????? ?????????
                                <div className = "reload-button" onClick = { () => {this._reload(2); this._reload(4)} } title="????????????"></div>
                            </h3>
                            { this._renderMento() }
                            { this.state.Login && !mentoData.find(mento => mento.mentoID == userid) &&
                                <div className="mento-register-div">
                                    <h3 className="mento-register-text">????????? ????????????</h3>
                                    <input 
                                        className = "mento-register-input" 
                                        placeholder="???????????? ????????? ??????"
                                        value = { this.state.mentoInfoText }
                                        onChange = { this.setMentoInfoText }>
                                    </input>
                                    <button className = "mento-register-button" onClick={ this._mentoRegister }>??????</button>
                                </div>
                            }
                        </div>
                    </>
                    }
                    {this.state.Page == 2 &&
                    <>
                    <div className = 'header'>
                        <h3 className='header-text'>???????????? ?????? ??????????????? ?????? ??????????????????.</h3>
                    </div>
                        <div className="mentee-section">
                            { this._renderEnterRoom() }
                            <div className = "generated-room-list-section">
                                { this._renderPublicRoom() }
                            </div>
                        </div>
                        </>
                    }
                    {this.state.Page == 3 &&
                    <>
                    <div className = 'header'>
                        <h3 className='header-text'>????????? ????????? ????????? ????????? ????????? ??? ????????????.</h3>
                    </div>
                        <div className="follow-section">
                            <div className="follow-container">
                                <div className = "friend-list-section">
                                    <h3 className = "friend-list-text">{ t('welcomepage.friendListText') } ({ wholeFollow.length })
                                        <div className = "reload-button" onClick = { () => {this._reload(3); this._reload(4)} } title="????????????"></div>
                                    </h3>
                                    <div className = "friend-list">{ this._renderFriendList() }</div>
                                </div>
                                { this._renderMessage() }
                            </div>
                        </div>
                        </>
                    }
                    {this.state.Page == 4 &&
                    <>
                    <div className = 'header'>
                        <h3 className='header-text'>???????????? ???????????? ???????????? ???????????? ???????????????.</h3>
                    </div>
                        <div className="login-section">
                            <h3 className="login-text">?????????</h3>
                            <form onSubmit = { this.signIn }>
                                <p className="login-input-container">
                                    <input 
                                        type="text" 
                                        className = "login-input" 
                                        value = { this.state.userid } 
                                        onChange = { this._onUserIDChange }
                                        placeholder = "?????????"
                                        autoFocus = "true"
                                        ></input>
                                    <input 
                                        type="password" 
                                        className = "login-input" 
                                        value = { this.state.password } 
                                        onChange = { this._onPasswordChange }
                                        placeholder = "????????????"
                                        ></input>
                                </p>
                                <input 
                                    type="submit" 
                                    className = "login-button" 
                                    value="?????????" 
                                    onClick = { this.signIn }>
                                </input>
                            </form>
                            <input 
                                type="button" 
                                className = "login-button" 
                                value="????????????" 
                                onClick = { () => {
                                    this.setState({
                                        userid: '',
                                        password: '',
                                        signupname: ''
                                    });
                                    this.pageFlip(5);} }>
                            </input>
                        </div>
                    </>
                    }
                    {this.state.Page == 5 &&
                        <>
                        <div className = 'header'>
                            <h3 className='header-text'>???????????? ???????????? ???????????? ???????????? ???????????????.</h3>
                        </div>
                            <div className="login-section">
                                <h3 className="login-text">????????????</h3>
                                <form onSubmit = { this.signUp }>
                                    <p className="signup-input-container">
                                        <input 
                                            type="text" 
                                            className = "login-input" 
                                            value = { this.state.signupname } 
                                            onChange = { this._onSignupNameChange }
                                            placeholder = "??????"
                                            autoFocus = "true"
                                            ></input>
                                        <input 
                                            type="text" 
                                            className = "login-input" 
                                            value = { this.state.userid } 
                                            onChange = { this._onUserIDChange }
                                            placeholder = "?????????"
                                            ></input>
                                        <input 
                                            type="password" 
                                            className = "login-input" 
                                            value = { this.state.password } 
                                            onChange = { this._onPasswordChange }
                                            placeholder = "????????????"
                                            ></input>
                                        <input 
                                            type="password" 
                                            className = "login-input" 
                                            value = { this.state.passwordCF } 
                                            onChange = { this._onPasswordCFChange }
                                            placeholder = "???????????? ?????????"
                                            ></input>
                                        <input
                                            disabled
                                            type="text" 
                                            className = "login-input"
                                            placeholder = "????????? (?????? ???????????? ??? ??????)"
                                            ></input>
                                        <input 
                                            disabled
                                            type="text" 
                                            className = "login-input"
                                            placeholder = "????????? ?????? (?????? ???????????? ??? ??????)"
                                            ></input>
                                    </p>
                                    <input 
                                        type="submit" 
                                        className = "login-button" 
                                        value="??????" 
                                        onClick = { this.signUp }>
                                    </input>
                                </form>
                                <input 
                                    type="button" 
                                    className = "login-button" 
                                    value="????????????" 
                                    onClick = { () => {
                                        this.setState({
                                            userid: '',
                                            password: '',
                                            signupname: ''
                                        });
                                        this.pageFlip(4);} }>
                                </input>
                            </div>
                        </>
                        }
                </div>
            </>
        );
    }

    /**
     * Renders the insecure room name warning.
     
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

    _renderEnterRoom = () => {
        const { _moderatedRoomServiceUrl, t } = this.props;
        return (
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
        )
    }

    /**
     * Prevents submission of the form and delegates join logic.
     *
     * @param {Event} event - The HTML Event which details the form submission.
     * @private
     * @returns {void}
     */
    async _onFormSubmit(event) {
        event.preventDefault();

        if (this.state.Login) {
            if (!this._roomInputRef || this._roomInputRef.reportValidity()) {
                const roomObj = { roomName: this.state.room, host: this.state.username };
                this.setState({ roomData: [...this.state.roomData, roomObj] });
                await addDoc(collection(db, "roomData"), roomObj);
                this._onJoin();
            }
        }
        else {
            this.pageFlip(4);
        }
    }

    _enterSelectedRoom(customName) {
        if (this.state.Login) {
            this._onJoinCustom(customName);
        }
        else {
            this.pageFlip(4);
        }
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

    _onUserIDChange = (event) => {
        this.setState({ userid: event.target.value});
    }

    _onPasswordChange = (event) => {
        this.setState({ password: event.target.value});
    }

    _onPasswordCFChange = (event) => {
        this.setState({ passwordCF: event.target.value});
    }

    _onSignupNameChange = (event) => {
        this.setState({ signupname: event.target.value});
    }

    setMentoInfoText = (event) => {
        this.setState({ mentoInfoText: event.target.value })
    }

    _mentoRegister = async () => {
        const { mentoInfoText, mentoData } = this.state;
        const { name, userid } = this.state.userData;
        const mentoObj = { mento: name, mentoID: userid, info: mentoInfoText };
        this.setState({
            mentoData: [...mentoData, mentoObj],
            mentoInfoText: ''
        });
        //await addDoc(collection(db, "mentoData"), mentoObj);
        await setDoc(doc(db, "mentoData", userid), mentoObj);
    }

    _removeMento = async () => {
        const { mentoInfoText, mentoData } = this.state;
        const { userid } = this.state.userData;
        this.setState({
            mentoData: [...mentoData.filter(_mento => _mento.mentoID != userid)],
            mentoInfoText: ''
        });
        //await addDoc(collection(db, "mentoData"), mentoObj);
        await deleteDoc(doc(db, "mentoData", userid)).then(
            alert("?????? ????????? ?????????????????????.")
        );
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
     * Renders the friend list.
     * 
     * @returns {ReactElement}
     */
    _renderFriendList() {
        const { follow, follower } = this.state.userData;
        const { accountData } = this.state;
        const followerNotfollow = [...follower.filter(follower => !follow.includes(follower))]
        const wholeFollow = [
            ...follow.map((_follow, index) => (accountData.find(acc => acc.userid == _follow))),
            ...followerNotfollow.map((_follower, index) => (accountData.find(acc => acc.userid == _follower)))
        ]
        return (
            <>
            { wholeFollow.map((friend, index) => (
                <div className = "friend-box">
                    <div className = "friend-profile-image"></div>
                    <h3 className = "friend-name-text">{ friend.name }</h3>
                    {/* <h3 className = "friend-name-text">{ accountData.find(acc => acc.userid == friendID) && accountData.find(acc => acc.userid == friendID).name }</h3> */}
                    <div className = "friend-message-img" onClick = { () => this._Message_With(friend.userid) }></div>
                    <div className="report-button" onClick = { this._reportMento }></div>
                </div>
            ))}
            </>
        )
    }

    _renderMento = () => {
        const { follow, userid } = this.state.userData;
        const { mentoData } = this.state;
        const { accountData } = this.state;
        let followerCount = {}; // ????????? object ??????
        mentoData.forEach(mento => { // ????????? ??????????????? ????????? key?????? object??????
            followerCount[mento.mentoID] = accountData.find(acc => acc.userid == mento.mentoID); 
        })
        return(
            <>
            <div className = "mento-profile-container">
                <table className = "mento-profile-table">
                    <tr height="40px">
                        <th width="100px">
                            ??????
                        </th>
                        <th width="600px">
                            ??????
                        </th>
                        <th width="170px">
                            ?????????
                        </th>
                        <th width="100px">
                            ????????? ???
                        </th>
                        <th width="100px">
                            ??????
                        </th>
                    </tr>
                    { mentoData.map((mento, index) => (
                        <>
                            <tr height="40px">
                                <td>
                                    { mento.mento }
                                </td>
                                <td>
                                    { mento.info }
                                </td>
                                <td>
                                    { !follow.includes(mento.mentoID) && mento.mentoID != userid &&
                                        <button className="follow-button" onClick={() => this._addFriendFromMento(mento.mentoID)}>+ ?????????</button>
                                    }
                                    { follow.includes(mento.mentoID) &&
                                        <button className="unfollow-button" onClick={() => this._removeFriendFromMento(mento.mentoID)}>????????????</button>
                                    }
                                    { mento.mentoID == userid &&
                                        <button className="unfollow-button" onClick={ this._removeMento }>?????? ??????</button>
                                    }
                                </td>
                                <td>
                                    { followerCount[mento.mentoID] && followerCount[mento.mentoID].follower.length || 0}???
                                </td>
                                <td>
                                    <div className="report-button" onClick = { this._reportMento }></div>
                                </td>
                            </tr>
                        </>
                    ))}
                </table>
            </div>
            </>
        )
    }

    _reportMento = () => {
        if (this.state.Login) {
            var input = prompt('?????? ????????? ??????????????????');
            if (input) {
                alert("????????? ?????????????????????.");
            }
        } else {
            this.pageFlip(4);
        }
    }

    _addFriendFromMento = async (newfriendID) => {
        if (this.state.Login) {
            const { follow, userid } = this.state.userData;
            const userObj = {
                ...this.state.userData,
                follow: [...follow, newfriendID]
            }

            const dbData = collection(db, 'accountData');
            const dataDocs = await getDocs(dbData);
            const mentoDoc = dataDocs.docs.find(doc => doc.data().userid == newfriendID);
            const userRef = doc(db, "accountData", userid)
            const mentoRef = doc(db, "accountData", newfriendID)

            let mentoObj = mentoDoc && mentoDoc.data();
            if (mentoObj) {
                mentoObj = {
                    ...mentoObj,
                    follower: [...mentoObj.follower, userid]
                };
                await updateDoc(userRef, userObj);
                await updateDoc(mentoRef, mentoObj);
                await this.getAccountData(db);
                await this.getMentoData(db);
                this.setState({ userData: userObj });
            }
        }
        else {
            this.pageFlip(4);
        }
    }

    _removeFriendFromMento = async (friendID) => {
        if (this.state.Login) {
            const { follow, userid } = this.state.userData;
            const userObj = {
                ...this.state.userData,
                follow: [...follow.filter(_follow => _follow != friendID)]
            }

            const dbData = collection(db, 'accountData');
            const dataDocs = await getDocs(dbData);
            const mentoDoc = dataDocs.docs.find(doc => doc.data().userid == friendID);
            const userRef = doc(db, "accountData", userid)
            const mentoRef = doc(db, "accountData", friendID)

            let mentoObj = mentoDoc && mentoDoc.data();
            if (mentoObj) {
                mentoObj = {
                    ...mentoObj,
                    follower: [...mentoObj.follower.filter(_follower => _follower != userid)]
                };
                await updateDoc(userRef, userObj);
                await updateDoc(mentoRef, mentoObj);
                await this.getAccountData(db);
                await this.getMentoData(db);
                this.setState({ userData: userObj });
            }
        }
        else {
            this.pageFlip(4);
        }
    }

    _renderMessage() {
        const { messageWith, accountData, messageData } = this.state;
        const { userid } = this.state.userData;
        const friend = accountData && accountData.find(acc => acc.userid == messageWith)
        let friendName = '';
        if (friend) {
            friendName = friend.name;
        }
        let messageObj = messageData.filter(message => 
            (message.sender == userid && message.receiver == messageWith) || 
            (message.sender == messageWith && message.receiver == userid)
        );
        let divScroll = null;
        
        return (
            <div className="message-section">
                <div className="friend-message-section">
                    <h3 className="friend-message-text">{ friendName }</h3>
                    <div className="friend-message-scroll-section" ref={el => {divScroll = el;}}>
                    <>
                    { messageWith == '' && <p className="friend-message-intro-text">?????? ???????????? ????????? ????????? ???????????????.</p>}
                    { messageObj.map((message, index) => (
                        <>
                            { message.sender == userid && this._renderMyMessage(message.text) }
                            { message.sender == messageWith && this._renderFriendMessage(friendName, message.text) }
                        </>
                    ))}
                    </>
                    </div>
                </div>
                <div className = "send-message-section">
                    <input className = "input-message" onChange={ this._onMessageChange } value={ this.state.messageText }></input>
                    <button className = "message-send-button" onClick={ () => this._sendMessage(userid, messageWith, this.state.messageText, divScroll)}>??????</button>
                </div>
            </div>
        )
    }

    scrollToBottom = (el) => {
        el.scrollIntoView({ behavior: 'smooth' });
    };

    _renderMyMessage(text) {
        return (
            <div className="text-me-section">
                <div className="text-me">{ text }</div>
            </div>
        )
    }

    _renderFriendMessage(friendName, text) {
        return (
            <div className="text-friend-section">
                <h3 className="message-name">{ friendName }</h3>
                <div className="text-friend"> { text }</div>
            </div>
        )
    }

    _onMessageChange(event) {
        this.setState({ messageText: event.target.value });
    }

    async _sendMessage(_senderID, _receiverID, _text, divScroll) {
        if (this.state.Login) {
            if (_receiverID) {
                const messageObj = {sender: _senderID, receiver: _receiverID, text: _text};
                

                const dbData = collection(db, 'messageData');
                const dataDocs = await getDocs(dbData);

                const messageData = [...dataDocs.docs[0].data().message, messageObj]
                this.setState({
                    messageData: messageData,
                    messageText: ''
                });

                await setDoc(doc(db, "messageData", "messages"), {message: messageData});
                this.scrollToBottom(divScroll);
            }
        }
        else {
            this.pageFlip(4);
        }
    }
        
    /**
     * Renders the public rooms.
     * 
     * @returns {ReactElement}
     */
    _renderPublicRoom() {
        const { roomData } = this.state;
        return (
            <>
            { roomData.map((roomData, index) => (
                <>
                    <div className = "generated-room" onClick = {() =>  this._enterSelectedRoom(roomData.roomName) }>
                        <h3 className = "generated-room-name-text">{ roomData.roomName }</h3>
                        <div className = "generated-room-info">
                            <p className = "generated-room-host">Host { roomData.host }</p>
                        </div>
                    </div>
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
