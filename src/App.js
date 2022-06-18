import React from 'react';
import ReactDOM from 'react-dom';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, AdaptivityProvider, AppRoot, Root, Panel } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import './styles/styles.css'
import Main from './panels/Main';
import CreateGame from './panels/CreateGame';
import { getLocations } from './utils/Utils';
import Timer from './panels/Timer';
import CircleProgress from './utils/CircleProgress';
import CreateLocation from './panels/CreateLocation';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, set, ref, onValue } from "firebase/database";

const firebaseConfig = {
	apiKey: "AIzaSyCI91wZXP2eaX-PDZ7vcUQITTDrKjksPBQ",
	authDomain: "vk-mini-apps-3d40e.firebaseapp.com",
	projectId: "vk-mini-apps-3d40e",
	storageBucket: "vk-mini-apps-3d40e.appspot.com",
	messagingSenderId: "313555575143",
	appId: "1:313555575143:web:64979e52b58521bf25cfc2",
	databaseURL:'https://vk-mini-apps-3d40e-default-rtdb.europe-west1.firebasedatabase.app/',
	measurementId: "G-8VWSLCYJHK"
  };

class App extends React.Component {
   
	constructor(){
		super()
		this.state = {
			activeView : 'main',
			locations : getLocations(),
			timerTime : 0,
			currentTimerSeconds : 0,
			flashDetails : "",
			allSeconds : 0,
			db : {},
			myId : "",
			myName : "",
			savedData : {},
			isMultiplayer : false
		}
		this.flashesCount = 0
		this.isMainTimer = false
		this.timerShown = false
	}
	componentDidMount(){
		const app = initializeApp(firebaseConfig);
		const analytics = getAnalytics(app);
		this.database = getDatabase(app);
		this.setState({db : this.database})
		this.hash = ""
        if (window.location.href.includes("#")){
            this.hash = window.location.href.split("#")[1]
        }
		this.subscribeBD()
	}
	subscribeBD = () => {
        const checkIsUserIngame = ref(this.database, 'games/' + this.hash);
		onValue(checkIsUserIngame, this.onFoundInDB);
	}
	onFoundInDB = (snapshot) => {
		var data = snapshot.val();
		if (data != undefined && data != null){
			if (data.timerTime != 0){
				if (!this.timerShown){
					this.timerShown = true
					this.setState({activeView : 'timer'})
				}
				this.setState({timerTime : data.timerTime, currentTimerSeconds : data.currentTimerSeconds, allSeconds : data.allSeconds, savedData : data})
				this.multiplayerTimer()
				//setTimeout(this.multiplayerTimer, 1000);
			} else {
				this.setState({currentTimerSeconds : 0, allSeconds : 0})
			}
		}
	}
	setFlash = (level) => {
		bridge.send("VKWebAppFlashSetLevel", {"level": level}).then(data => { 
            this.setState({flashDetails : ""})
        }).catch(error => { 
            this.setState({flashDetails : "Нет доступа к фонарику"})
        });
	}
	back = () => {
		this.setState({activeView : 'main'})
	}
	setMyData = (id, name) => {
		this.setState({myId : id, myName : name})
	}
	openView = (view) => {
		this.setState({activeView : view})

	}
	setTimer = (playersCount, dbData) => {
		const plusSeconds = playersCount*60000
		if (dbData != undefined){
			this.isMainTimer = true
			this.setState({isMainTimer : true, isMultiplayer : true})
			this.hash = ""
            if (window.location.href.includes("#")){
                this.hash = window.location.href.split("#")[1]
			}
			const data = dbData
			data.timerTime = Date.now() + plusSeconds
			data.currentTimerSeconds = plusSeconds/1000
			data.allSeconds = plusSeconds/1000
			set(ref(this.database, 'games/' + this.hash), data);
		} else {	
			this.setState({activeView : 'timer', timerTime : Date.now() + plusSeconds, currentTimerSeconds : plusSeconds/1000, allSeconds : plusSeconds/1000, isMultiplayer : false})
			setTimeout(this.timeoutTimer, 1000);
		}
		
	}
	stopTimer = () => {
		this.setState({activeView : 'main'})
		this.setState({timerTime : 0, currentTimerSeconds : 0, allSeconds : 0, savedData : undefined})
		set(ref(this.database, 'games/' + this.hash), null);
		this.isMainTimer = false
		this.timerShown = false
		this.setState({isMainTimer : false})
	}
	startFlash = () => {
		this.setFlash(1)
		setTimeout(this.flashTimeout, 1000);
	}
	flashTimeout = () => {
		this.setFlash(0)
		this.flashesCount += 1 
		if (this.flashesCount > 2){
			this.flashesCount = 0
		} else {
			setTimeout(this.startFlash, 1000);
		}
	}
	timeoutTimer = () => {
		const seconds = parseInt(Math.round((this.state.timerTime - Date.now())/1000))
		
		if (seconds > 0){
			this.setState({currentTimerSeconds : seconds})
			setTimeout(this.timeoutTimer, 1000);
		} else {
			this.startFlash()
			this.setState({timerTime : 0, currentTimerSeconds : 0})
		}
	}

	multiplayerTimer = () => {
		if (this.isMainTimer){
			setTimeout(this.mainTimeout, 1000);
		} else {
			
			const data = this.state.savedData
			if (data == undefined){
				return
			}
			this.setState({currentTimerSeconds : data.currentTimerSeconds, timeoutTimer : data.timeoutTimer})
			if (data.currentTimerSeconds <= 0){
				this.startFlash()
				this.setState({timerTime : 0, currentTimerSeconds : 0})
			}
		}
	}
	mainTimeout = () => {
		const data = this.state.savedData
		if (data == undefined){
			return
		}
		data.currentTimerSeconds -= 1
		if (data.currentTimerSeconds > 0){
			set(ref(this.database, 'games/' + this.hash), data);
		} else {
			this.startFlash()
			this.setState({timerTime : 0, currentTimerSeconds : 0})
			data.currentTimerSeconds = 0
			data.timeoutTimer = 0
			data.allSeconds = 0
			set(ref(this.database, 'games/' + this.hash), data);
		}
		
	}
	updateLocations = () => {
		this.setState({locations : getLocations()})
	}
	openTimer = () => {
		this.openView('timer')
	}
	render() {
	  return (
		<AdaptivityProvider>
			<AppRoot>
				
					<Root activeView={this.state.activeView}>
						<View id="main" activePanel="main_panel">
							<Panel id="main_panel">
								<Main setMyData={this.setMyData} db={this.state.db} locations={this.state.locations} openView={this.openView}/>
							</Panel>
						</View>
						<View id="create" activePanel="create_panel">
							<Panel id="create_panel">
								<CreateGame myId={this.state.myId} myName={this.state.myName} db={this.state.db} setTimer={this.setTimer} locations={this.state.locations} back={this.back}/>
							</Panel>
						</View>
						<View id="timer" activePanel="timer_panel">
							<Panel id="timer_panel">
								<Timer isMultiplayer={this.state.isMultiplayer} isMainTimer={this.state.isMainTimer} currentTimerSeconds={this.state.currentTimerSeconds} allSeconds={this.state.allSeconds} stopTimer={this.stopTimer} back={this.back}/>
							</Panel>
						</View>
						<View id="create_location" activePanel="create_location_panel">
							<Panel id="create_location_panel">
								<CreateLocation updateLocations={this.updateLocations} openView={this.openView} back={this.back}/>
							</Panel>
						</View>
					</Root>
					{(this.state.currentTimerSeconds > 0 && this.state.activeView != "timer") && 
						<div onClick={this.openTimer} className="timer_all_screens">
							<p className="timer_all_text">{new Date(this.state.currentTimerSeconds * 1000).toISOString().substring(14, 19)}</p>
							<CircleProgress style={{width : '42px', marginLeft : '3px'}} percentage={((this.state.allSeconds - this.state.currentTimerSeconds) / this.state.allSeconds)*100}/>
						</div>
					}
					
			</AppRoot>
			
		</AdaptivityProvider>
	  )
	}
  }
  export default App;
  
  ReactDOM.render(
	<App/>
  ,
  document.getElementById('root')
  );