# 소프트웨어설계 3팀 프로젝트 "M2M"

<img src="https://user-images.githubusercontent.com/33691228/194996526-0bf43920-f65a-4f84-becf-7b8f1b4eecf8.png"/>
2021년도 2학기 소프트웨어설계 강의에서 프로젝트로 제작한, 오픈소스 Jitsi Meet의 커스텀 홈페이지입니다.<br/>
해당 강의는 오픈소스 회의방을 이용해 실제로 서비스가 가능한 웹서비스를 제작하는 것이 목표였습니다.<br/>
<br/>
저희 팀은 대학생 멘토와 멘티가 자유롭게 만나서 소통할 수 있는 공간을 만들기 위해 M2M 웹서비스를 제작하였습니다.<br/>
해당 프로젝트는 수업 기간 중 구글 클라우드서버와 파이어베이스를 이용해 접속할 수 있도록 개방하였습니다.<br/>
주 기능은 멘토와 멘티가 서로 만날 수 있는 "방 개설" 기능과 서로간에 메시지를 전달할 수 있는 채팅 기능입니다.<br/>
<br/>
<a href="https://github.com/CheeseCake116/jitsi_meet_sw3Team/blob/main/SW%203%EC%A1%B0%20%EB%B0%9C%ED%91%9C%EC%9E%90%EB%A3%8C.pdf">최종 발표자료</a><br/>
<br/>
<br/>

## 커스텀한 부분
css/_welcome_page.scss<br/>
css/_variables.scss<br/>
<br/>
images/homepage.png<br/>
images/kebabMenu.png<br/>
images/logo.png<br/>
images/logo_old.png<br/>
images/M2Mlogo.png<br/>
images/personImage.png<br/>
images/reload.png<br/>
images/reload_cool.png<br/>
images/reportImage.png<br/>
images/speech-bubble.png<br/>
images/welcomeImage.png<br/>
<br/>
react/features/welcome/components/AbstractWelcomePage copy.js (작업중 백업파일)<br/>
react/features/welcome/components/AbstractWelcomePage.js<br/>
react/features/welcome/components/WelcomePage.web.js<br/>
react/features/welcome/components/WelcomePage.web(2)~(8).js (작업중 백업파일)<br/>
react/features/welcome/components/WelcomePage_socketCustom.web.js (작업중 백업파일)<br/>
<br/>
<br/>
## 커스텀 설명
Jitsi Meet은 nginx와 react를 사용하는 오픈소스 회의 웹서비스입니다.<br/>
Jitsi Meet에 접속하면 먼저 welcome page가 등장하고, 이곳에서 원하는 방 이름을 입력하면<br/>
방이 새로 개설되거나 해당 이름의 방에 접속이 됩니다.<br/>
<br/>
이 프로젝트에서는 welcome page를 M2M의 홈페이지로 커스텀하였고, 홈페이지에서는 M2M을 통해 개설된 방의 목록을 보여주며<br/>
이 목록에서 방을 골라 회의방에 접속할 수 있는 구조로 제작하였습니다.<br/>
<br/>
서버는 초기에는 아마존의 AWS 서비스를 이용하려고 했으나, 프리 티어 서버는 램이 너무 적어서<br/>
램을 더 많이 주는 구글 클라우드 서비스를 이용하였고, 데이터베이스는 파이어베이스를 사용하였습니다.<br/>
<br/>
<br/>
<br/>
# <p align="center">Jitsi Meet</p>

Jitsi Meet is a set of Open Source projects which empower users to use and deploy
video conferencing platforms with state-of-the-art video quality and features.

<hr />

<p align="center">
<img src="https://raw.githubusercontent.com/jitsi/jitsi-meet/master/readme-img1.png" width="900" />
</p>

<hr />

Amongst others here are the main features Jitsi Meet offers:

* Support for all current browsers
* Mobile applications
* Web and native SDKs for integration
* HD audio and video
* Content sharing
* End-to-End Encryption
* Raise hand and reactions
* Chat with private conversations
* Polls
* Virtual backgrounds

And many more!

## Using Jitsi Meet

Using Jitsi Meet is straightforward, as it's browser based. Head over to [meet.jit.si](https://meet.jit.si) and give it a try. It's anonymous, scalable and free to use. All browsers are supported! 

Using mobile? No problem, you can either use your mobile web browser or our fully-featured
mobile apps:

| Android | Android (F-Droid) | iOS |
|:-:|:-:|:-:|
| [<img src="resources/img/google-play-badge.png" height="50">](https://play.google.com/store/apps/details?id=org.jitsi.meet) | [<img src="resources/img/f-droid-badge.png" height="50">](https://f-droid.org/en/packages/org.jitsi.meet/) | [<img src="resources/img/appstore-badge.png" height="50">](https://itunes.apple.com/us/app/jitsi-meet/id1165103905) |

If you are feeling adventurous and want to get an early scoop of the features as they are being
developed you can also sign up for our open beta testing here:

* [Android](https://play.google.com/apps/testing/org.jitsi.meet)
* [iOS](https://testflight.apple.com/join/isy6ja7S)

## Running your own instance

If you'd like to run your own Jitsi Meet installation head over to the [handbook](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-start) to get started.

We provide Debian packages and a comprehensive Docker setup to make deployments as simple as possible.
Advanced users also have the possibility of building all the components from source.

You can check the latest releases [here](https://jitsi.github.io/handbook/docs/releases).

## Jitsi as a Service

If you like the branding capabilities of running your own instance but you'd like
to avoid dealing with the complexity of monitoring, scaling and updates, JaaS might be
for you.

[8x8 Jitsi as a Service (JaaS)](https://jaas.8x8.vc) is an enterprise-ready video meeting platform that allows developers, organizations and businesses to easily build and deploy video solutions. With Jitsi as a Service we now give you all the power of Jitsi running on our global platform so you can focus on building secure and branded video experiences.

## Documentation

All the Jitsi Meet documentation is available in [the handbook](https://jitsi.github.io/handbook/).

## Security

For a comprehensive description of all Jitsi Meet's security aspects, please check [this link](https://jitsi.org/security).

For a detailed description of Jitsi Meet's End-to-End Encryption (E2EE) implementation,
please check [this link](https://jitsi.org/e2ee-whitepaper/).

For information on reporting security vulnerabilities in Jitsi Meet, see [SECURITY.md](./SECURITY.md).

## Contributing

If you are looking to contribute to Jitsi Meet, first of all, thank you! Please
see our [guidelines for contributing](CONTRIBUTING.md).

<br />
<br />

<footer>
<p align="center" style="font-size: smaller;">
Built with ❤️ by the Jitsi team at <a href="https://8x8.com" target="_blank">8x8</a> and our community.
</p>
</footer>
