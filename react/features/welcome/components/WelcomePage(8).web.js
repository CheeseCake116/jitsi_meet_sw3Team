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
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
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
var roomData = null;
var accountData = null;

// Get a list of cities from your database
async function getRoomData(db) {
    const dbData = collection(db, 'roomData');
    const roomDocs = await getDocs(dbData);
    roomData = roomDocs.docs.map(doc => doc.data());
    console.log(roomData);
}

async function getAccountData(db) {
    const dbData = collection(db, 'accountData');
    const accountDocs = await getDocs(dbData);
    accountData = accountDocs.docs.map(doc => doc.data());
    console.log(accountData);
}

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
            signupname: '',
            generateRoomnames:
                interfaceConfig.GENERATE_ROOMNAMES_ON_WELCOME_PAGE,
            selectedTab: 0,
            Page: 1,
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
            roomData: [],
            mentoData: [],
            messageData: [],
            accountData: null,
            messageText: '',
            
            //"박민찬", "이연지", "정수환", "곽형수", "전창희", "최주원", "변지경", "박진석", "이상지", "송성훈", "홍승현", "김장군", "이세연", "최정웅", "서재균"],
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

        this.loadData()

        //                      -------------- 로그인 세션 처리 -------------
        let userNameObj = JSON.parse(window.sessionStorage.getItem("userName"));
        if (userNameObj) {
            this.setState({ username: userNameObj.name });
            this.confirmName(userNameObj.userid, userNameObj.password, userNameObj.name);
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
        this.setState({ Page: page });
    }

    loadData = () => {
        //                      -------------- mentodata 처리 -------------
        let _mentoData = JSON.parse(window.sessionStorage.getItem("mentoData"));
        if (!_mentoData) { // DB 데이터가 없는 경우 기본 정보 + 계정정보를 추가
            _mentoData = [
                {mento: "정수환", mentoID: "_test1", info: "데이터베이스 가르쳐드립니다"},
                {mento: "박진석", mentoID: "_test2", info: "백준 풀이 도와드립니다. 저녁 시간에 연락주세요"},
                {mento: "홍승현", mentoID: "_test3", info: "프로그래밍 기초 과제풀이 도와드려요"},
                {mento: "김장군", mentoID: "_test4", info: "수학 정수론 등"},
                {mento: "이세연", mentoID: "_test5", info: "주식 관련 질문주세요"}
            ]
            window.sessionStorage.setItem("mentoData", JSON.stringify(_mentoData));
        }
        this.setState({
            mentoData: _mentoData
        });

        //                      -------------- messageData 처리 -------------
        let messageObj = JSON.parse(window.sessionStorage.getItem("messageData"));
        if (!messageObj) {
            messageObj = {};
            window.sessionStorage.setItem("messageData", JSON.stringify(messageObj));
        }

        this.setState({
            messageData: messageObj
        });

        //                      -------------- roomData 처리 -------------
        let roomObj = JSON.parse(window.sessionStorage.getItem("roomData"));
        if (!roomObj) {
            roomObj = [
                { roomName: "SW설계", host: "곽진욱"},
                { roomName: "데이터베이스 과제방", host: "이연지"},
                { roomName: "알고리즘 시험대비", host: "박민찬"},
                { roomName: "기경개 듣는사람", host: "곽형수"},
                { roomName: "그냥 공부방", host: "전창희"},
                { roomName: "글솝 인공지능 수업", host: "최주원"},
                { roomName: "서역문 어케외움;", host: "이상지"},
                { roomName: "정수론 공부방", host: "송성훈"},
                { roomName: "심리학 들으시는분?", host: "변지경"}
            ];
            window.sessionStorage.setItem("roomData", JSON.stringify(roomObj));
        }

        this.setState({
            roomData: roomObj
        });

        //                      -------------- accountData 처리 -------------
        let accountObj = JSON.parse(window.sessionStorage.getItem("accountData"));
        if (!accountObj) {
            accountObj = {
                "_test1": { password: "test1", username: "정수환" },
                "_test2": { password: "test2", username: "박진석" },
                "_test3": { password: "test3", username: "홍승현" },
                "_test4": { password: "test4", username: "김장군" },
                "_test5": { password: "test5", username: "이세연" }
            }

            let mentoObj1 = {
                name: "정수환",
                userid: "_test1",
                password: "test1",
                friend: [],
                follow: [],
                follower: []
            };
            window.sessionStorage.setItem("JITSIuser" + "_test1", JSON.stringify(mentoObj1));

            let mentoObj2 = {
                name: "박진석",
                userid: "_test2",
                password: "test2",
                friend: [],
                follow: [],
                follower: []
            };
            window.sessionStorage.setItem("JITSIuser" + "_test2", JSON.stringify(mentoObj2));

            let mentoObj3 = {
                name: "홍승현",
                userid: "_test3",
                password: "test3",
                friend: [],
                follow: [],
                follower: []
            };
            window.sessionStorage.setItem("JITSIuser" + "_test3", JSON.stringify(mentoObj3));

            let mentoObj4 = {
                name: "김장군",
                userid: "_test4",
                password: "test4",
                friend: [],
                follow: [],
                follower: []
            };
            window.sessionStorage.setItem("JITSIuser" + "_test4", JSON.stringify(mentoObj4));

            let mentoObj5 = {
                name: "이세연",
                userid: "_test5",
                password: "test5",
                friend: [],
                follow: [],
                follower: []
            };
            window.sessionStorage.setItem("JITSIuser" + "_test5", JSON.stringify(mentoObj5));

            window.sessionStorage.setItem("accountData", JSON.stringify(accountObj));
        }

        this.setState({
            accountData: accountObj
        });

        getRoomData(db);
        getAccountData(db);
    }

    confirmName = (userid, password, username) => {
        // setState는 비동기라 저장이 느리므로 다른 변수에 다시 저장하여 state 저장과 local 저장을 독립적으로 처리한다.
        if (userid, password, username) {

            //                      -------------- userData 처리 -------------

            let userObj = JSON.parse(window.sessionStorage.getItem("JITSIuser" + userid));
            if (!userObj) { // 신규 계정인 경우
                userObj = {
                    name: username,
                    userid: userid,
                    password: password,
                    friend: [],
                    follow: [],
                    follower: []
                };
                
                window.sessionStorage.setItem("JITSIuser" + userid, JSON.stringify(userObj));
            }


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

            window.sessionStorage.setItem("userName", JSON.stringify(userNameObj)); // 세션 정보 저장
        }
    }

    signIn = () => {
        const { userid, password, accountData } = this.state;

        if (!userid) { alert("아이디를 입력해주세요."); return; }
        if (!password) { alert("비밀번호를 입력해주세요."); return; }

        if (accountData && userid in accountData) {
            if (accountData[userid].password == password) {
                this.loadData();
                this.confirmName(userid, password, accountData[userid].username);
                this.setState({
                    userid: '',
                    password: ''
                });
                this.pageFlip(1);
            }
            else {
                alert("비밀번호가 틀립니다.");
            }
        }
        else {
            alert("존재하지 않는 아이디입니다.");
        }
    }

    signUp = () => {
        const {userid, password, signupname, accountData } = this.state;

        if (!signupname) { alert("이름를 입력해주세요."); return; }
        if (!userid) { alert("아이디를 입력해주세요."); return; }
        if (!password) { alert("비밀번호를 입력해주세요."); return; }

        if (!accountData) {
            let accountObj = {
                "_test1": { password: "test1", username: "정수환" },
                "_test2": { password: "test2", username: "박진석" },
                "_test3": { password: "test3", username: "홍승현" },
                "_test4": { password: "test4", username: "김장군" },
                "_test5": { password: "test5", username: "이세연" },
                [`${userid}`]: { password: password, username: signupname }
            };
            window.sessionStorage.setItem("accountData", JSON.stringify(accountObj));
            alert("회원으로 가입되었습니다.");
            this.setState({
                accountData: accountObj,
                userid: '',
                password: '',
                signupname: ''
            });
            this.pageFlip(4);
        }
        else {
            if (userid in accountData) {
                alert("이미 존재하는 아이디입니다.\n다른 아이디를 사용해주세요.");
            }
            else {
                let accountObj = {
                    ...accountData,
                    [`${userid}`]: { password: password, username: signupname }
                };
                window.sessionStorage.setItem("accountData", JSON.stringify(accountObj));
                this.setState({
                    accountData: accountObj,
                    userid: '',
                    password: '',
                    signupname: ''
                });
                alert("회원으로 가입되었습니다.");
                this.pageFlip(4);
            }
        }
    }

    signOut = () => {
        const userNameObj = {
            name: '',
            userid: '',
            password: ''
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
            messageData: [],
            messageText: '',
            messageWith: ''
        });

        alert("로그아웃 되었습니다.");
        window.sessionStorage.setItem("userName", JSON.stringify(userNameObj)); // 세션 종료
    }

    _Message_With = (friendID) => {
        this.setState({ messageWith: friendID });
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
        const { accountData } = this.state;
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
                            <div className="header-menu-logo" onClick={ () => this.pageFlip(1) }></div>
                            <ul className="header-menu-ul">
                                <li className={`header-menu-li ${ this.state.Page == 1 && "bottom-red" }`} onClick={ () => this.pageFlip(1) }><p className="header-menu-li-p">멘토 찾기</p></li>
                                <li className={`header-menu-li ${ this.state.Page == 2 && "bottom-red" }`} onClick={ () => this.pageFlip(2) }><p className="header-menu-li-p">멘티방 참여</p></li>
                                <li className={`header-menu-li ${ this.state.Page == 3 && "bottom-red" }`} onClick={ () => this.pageFlip(3) }><p className="header-menu-li-p">팔로우 채팅</p></li>
                            </ul>
                            { !this.state.Login &&
                                <h3 className="header-menu-login" onClick={ () => this.pageFlip(4) }>로그인</h3>
                            }
                            { this.state.Login &&
                            <div className="header-menu-flex">
                                <div className = 'profile-container'>
                                    <div className = 'welcome-profile-image'></div>
                                    <h3 className = 'welcome-text'>{ name }</h3>
                                </div>
                                <h3 className="header-menu-login" onClick={ this.signOut }>로그아웃</h3>
                            </div>
                            }
                        </div>
                    </div>
                    {this.state.Page == 0 &&
                    <>
                        <div className = 'header'>
                            <h3 className='header-text'>멘토들의 프로필을 확인하거나<br/>나를 멘토로 등록할 수 있습니다.</h3>
                        </div>
                        <div className="mento-section">
                            <h3 className = "mento-section-text">멘토 프로필</h3>
                            { this._renderMento() }
                            { this.state.Login && this.state.mentoData.filter(mento => mento.mentoID == userid).length == 0 &&
                                <div className="mento-register-div">
                                    <h3 className="mento-register-text">멘토에 등록하기</h3>
                                    <input 
                                        className = "mento-register-input" 
                                        placeholder="멘토로서 간단한 소개"
                                        value = { this.state.mentoInfoText }
                                        onChange = { this.setMentoInfoText }>
                                    </input>
                                    <button className = "mento-register-button" onClick={ this._mentoRegister }>확인</button>
                                </div>
                            }
                        </div>
                    </>
                    }
                    {this.state.Page == 1 &&
                    <>
                        <div className = 'header'>
                            <h3 className='header-text'>멘토들의 프로필을 확인하거나<br/>나를 멘토로 등록할 수 있습니다.</h3>
                        </div>
                        <div className="mento-section">
                            <h3 className = "mento-section-text">멘토 프로필</h3>
                            { this._renderMento() }
                            { this.state.Login && this.state.mentoData.filter(mento => mento.mentoID == userid).length == 0 &&
                                <div className="mento-register-div">
                                    <h3 className="mento-register-text">멘토에 등록하기</h3>
                                    <input 
                                        className = "mento-register-input" 
                                        placeholder="멘토로서 간단한 소개"
                                        value = { this.state.mentoInfoText }
                                        onChange = { this.setMentoInfoText }>
                                    </input>
                                    <button className = "mento-register-button" onClick={ this._mentoRegister }>확인</button>
                                </div>
                            }
                        </div>
                    </>
                    }
                    {this.state.Page == 2 &&
                    <>
                    <div className = 'header'>
                        <h3 className='header-text'>멘티들의 방에 참여하거나 방을 생성해보세요.</h3>
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
                        <h3 className='header-text'>멘토와 멘티의 팔로우 채팅을 확인할 수 있습니다.</h3>
                    </div>
                        <div className="follow-section">
                            <div className="follow-container">
                                <div className = "friend-list-section">
                                    <h3 className = "friend-list-text">{ t('welcomepage.friendListText') } ({ wholeFollow.length })</h3>
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
                        <h3 className='header-text'>서비스를 이용하기 위해서는 로그인이 필요합니다.</h3>
                    </div>
                        <div className="login-section">
                            <h3 className="login-text">로그인</h3>
                            <p className="login-input-container">
                                <input 
                                    type="text" 
                                    className = "login-input" 
                                    value = { this.state.userid } 
                                    onChange = { this._onUserIDChange }
                                    placeholder = "아이디"
                                    autoFocus = "true"
                                    ></input>
                                <input 
                                    type="text" 
                                    className = "login-input" 
                                    value = { this.state.password } 
                                    onChange = { this._onPasswordChange }
                                    placeholder = "비밀번호"
                                    ></input>
                            </p>
                            <input 
                                type="button" 
                                className = "login-button" 
                                value="로그인" 
                                onClick = { () => this.signIn() }>
                            </input>
                            <input 
                                type="button" 
                                className = "login-button" 
                                value="회원가입" 
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
                            <h3 className='header-text'>서비스를 이용하기 위해서는 로그인이 필요합니다.</h3>
                        </div>
                            <div className="login-section">
                                <h3 className="login-text">회원가입</h3>
                                <p className="signup-input-container">
                                    <input 
                                        type="text" 
                                        className = "login-input" 
                                        value = { this.state.signupname } 
                                        onChange = { this._onSignupNameChange }
                                        placeholder = "이름"
                                        autoFocus = "true"
                                        ></input>
                                    <input 
                                        type="text" 
                                        className = "login-input" 
                                        value = { this.state.userid } 
                                        onChange = { this._onUserIDChange }
                                        placeholder = "아이디"
                                        ></input>
                                    <input 
                                        type="text" 
                                        className = "login-input" 
                                        value = { this.state.password } 
                                        onChange = { this._onPasswordChange }
                                        placeholder = "비밀번호"
                                        ></input>
                                </p>
                                <input 
                                    type="button" 
                                    className = "login-button" 
                                    value="확인" 
                                    onClick = { () => this.signUp(this.state.username) }>
                                </input>
                                <input 
                                    type="button" 
                                    className = "login-button" 
                                    value="돌아가기" 
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
    _onFormSubmit(event) {
        event.preventDefault();

        if (this.state.Login) {
            if (!this._roomInputRef || this._roomInputRef.reportValidity()) {
                const roomObj = [
                    { roomName: this.state.room, host: this.state.username },
                    ...this.state.roomData
                ];
                this.setState({ roomData: roomObj });
                window.sessionStorage.setItem("roomData", JSON.stringify(roomObj));
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

    _onSignupNameChange = (event) => {
        this.setState({ signupname: event.target.value});
    }

    setMentoInfoText = (event) => {
        this.setState({ mentoInfoText: event.target.value })
    }

    _mentoRegister = () => {
        const { mentoInfoText, mentoData } = this.state;
        const { name, userid } = this.state.userData;
        const mentoObj = [
            ...mentoData,
            { mento: name, mentoID: userid, info: mentoInfoText }
        ]
        this.setState({
            mentoData: mentoObj,
            mentoInfoText: ''
        });
        window.sessionStorage.setItem("mentoData", JSON.stringify(mentoObj));
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
        const wholeFollow = [
            ...follow,
            ...follower.filter(follower => !follow.includes(follower))
        ]
        return (
            <>
            { wholeFollow.map((friendID, index) => (
                <div className = "friend-box">
                    <div className = "friend-profile-image"></div>
                    <h3 className = "friend-name-text">{ accountData[friendID].username }</h3>
                    <div className = "friend-message-img" onClick = { () => this._Message_With(friendID) }></div>
                </div>
            ))}
            </>
        )
    }

    _renderMento = () => {
        const { mentoData } = this.state;
        const { follow, userid } = this.state.userData;
        return(
            <>
            <div className = "mento-profile-container">
                <table className = "mento-profile-table">
                    <tr height="40px">
                        <th width="200px">
                            이름
                        </th>
                        <th width="600px">
                            소개
                        </th>
                        <th width="200px">
                            팔로우
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
                                        <button className="follow-button" onClick={() => this._addFriendFromMento(mento.mentoID)}>+ 팔로우</button>
                                    }
                                    { follow.includes(mento.mentoID) &&
                                        <button className="unfollow-button" onClick={() => this._removeFriendFromMento(mento.mentoID)}>언팔로우</button>
                                    }
                                    { mento.mentoID == userid &&
                                        "팔로워 받는 중"
                                    }
                                </td>
                            </tr>
                        </>
                    ))}
                </table>
            </div>
            </>
        )
    }

    _addFriendFromMento = (newfriendID) => {
        if (this.state.Login) {
            const { follow, userid } = this.state.userData;
            const userObj = {
                ...this.state.userData,
                follow: [...follow, newfriendID]
            }

            this.setState({ userData: userObj });
            window.sessionStorage.setItem("JITSIuser" + userid, JSON.stringify(userObj));


            let mentoObj = JSON.parse(window.sessionStorage.getItem("JITSIuser" + newfriendID));
            mentoObj = {
                ...mentoObj,
                follower: [...mentoObj.follower, userid]
            };

            window.sessionStorage.setItem("JITSIuser" + newfriendID, JSON.stringify(mentoObj));
        }
        else {
            this.pageFlip(4);
        }
    }

    _removeFriendFromMento = (friendID) => {
        if (this.state.Login) {
            const { follow, userid } = this.state.userData;
            const userObj = {
                ...this.state.userData,
                follow: [...follow.filter(_follow => _follow != friendID)]
            }

            this.setState({ userData: userObj });
            window.sessionStorage.setItem("JITSIuser" + userid, JSON.stringify(userObj));


            let mentoObj = JSON.parse(window.sessionStorage.getItem("JITSIuser" + friendID));
            mentoObj = {
                ...mentoObj,
                follower: [...mentoObj.follower.filter(_follower => _follower != userid)]
            };

            window.sessionStorage.setItem("JITSIuser" + friendID, JSON.stringify(mentoObj));
        }
        else {
            this.pageFlip(4);
        }
    }

    _renderMessage() {
        const { messageWith, messageData } = this.state;
        const { userid } = this.state.userData;
        const { accountData } = this.state;
        let friendName = '';
        if (accountData && accountData[messageWith]) {
            friendName = accountData[messageWith].username;
        }
        let valueName = '';
        let messageObj = [];
        let divScroll = null;
        if ([`${userid}to${messageWith}`] in messageData) { // 내이름to친구이름
            valueName = userid + 'to' + messageWith
            messageObj = messageData[`${valueName}`];
        } else if ([`${messageWith}to${userid}`] in messageData) { // 친구이름to내이름
            valueName = messageWith + 'to' + userid
            messageObj = messageData[`${valueName}`];
        } else {
            valueName = userid + 'to' + messageWith
        }
        return (
            <div className="message-section">
                <div className="friend-message-section">
                    <h3 className="friend-message-text">{ friendName }</h3>
                    <div className="friend-message-scroll-section" ref={el => {divScroll = el;}}>
                    { messageObj.map((message, index) => (
                        <>
                            { message.sender == userid && this._renderMyMessage(message.text) }
                            { message.sender == messageWith && this._renderFriendMessage(friendName, message.text) }
                        </>
                    ))}
                    </div>
                </div>
                <div className = "send-message-section">
                    <input className = "input-message" onChange={ this._onMessageChange } value={ this.state.messageText }></input>
                    <button className = "message-send-button" onClick={ () => this._sendMessage(messageObj, valueName, userid, messageWith, this.state.messageText, divScroll)}>전송</button>
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

    _sendMessage(messageObj, _valueName, _senderID, _receiverID, _text, divScroll) {
        if (this.state.Login) {
            if (_receiverID) {
                let _messageObj = [
                    ...messageObj,
                    {sender: _senderID, text: _text}
                ];
        
                const _messageData = {
                    ...this.state.messageData,
                    [`${_valueName}`]: _messageObj
                }
        
                this.setState({ 
                    messageText: '',
                    messageData: _messageData
                });
                window.sessionStorage.setItem("messageData", JSON.stringify(_messageData));
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
