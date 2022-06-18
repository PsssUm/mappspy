import React from 'react';
import header from '../img/header.png'
import Location from './ListItems/Location';
import { getLocations } from '../utils/Utils';
import add_location from '../img/add_location.png'
import bridge from '@vkontakte/vk-bridge';

import { getDatabase, set, ref, onValue } from "firebase/database";

class Main extends React.Component {
   
	constructor(props){
		super(props)
        this.id = ""
        this.name = ""
        this.hash = ""
	}
	componentDidMount(){
        bridge.send("VKWebAppGetUserInfo");
        bridge.subscribe(this.onBridgeResult);
    }
    onBridgeResult = (e) => {
        switch (e.detail.type) {
            
            case "VKWebAppGetUserInfoResult":
                const currUser = e.detail.data
                console.log("currUser = " + JSON.stringify(currUser))
                this.id = currUser.id
                this.name = currUser.first_name + " " + currUser.last_name
                this.props.setMyData(this.id, this.name)
                this.hash = ""
                if (window.location.href.includes("#")){
                    this.hash = window.location.href.split("#")[1]
                }
                const checkIsUserIngame = ref(this.props.db, 'games/' + this.hash);
                console.log("this.hash = " + this.hash)
		        onValue(checkIsUserIngame, this.onUserFoundInDB);
                
            break;
            default: 
            break;
        }
    }
    onUserFoundInDB = (snapshot) => {
        var data = snapshot.val();
        console.log("onUserFoundInDB = " + JSON.stringify(data))
        if (data == null || data == undefined){
            return
        }
        var dataPlayers = data.players
        if (dataPlayers.length == 0){
            return
        }
        var iAmPlayers = dataPlayers.filter(player => player.id == this.id)
        if (iAmPlayers.length == 0){
            var isAdded = false
            for (let index = 0; index < dataPlayers.length; index++) {
                if (dataPlayers[index].id == -1 && dataPlayers[index].id != this.id){
                    dataPlayers[index].name = this.name
                    dataPlayers[index].id = this.id
                    isAdded = true
                    break
                } else if (index != 0 && dataPlayers[index].id == this.id){
                    this.props.openView('create')
                }
                
            }
            if (isAdded){
                data.players = dataPlayers
                set(ref(this.props.db, 'games/' + this.hash), data);
                this.props.openView('create')
            }
            
        }
        
        
    }
	start = () => {
        this.props.openView("create")
    }
	render() {
	  return (
		<div className="main_container">
            <img className="header_img" src={header}/>
            <p className="main_title">Локации игры</p>
            <p className="main_desc">Мирные игроки будут видеть одну и ту же локацию из этого списка</p>
            <div className="locations_container">            
                {this.props.locations.length > 0 && this.props.locations.map((item, index) => (
                    <Location location={item} key={index}/>
                ))}
                <Location openView={this.props.openView} location={{img : add_location, name : '', id : 1}}/>
            </div>
            <div onClick={this.start} className="btn hover">Начать игру</div>
            <div className="line"></div>
        </div>
	  )
	}
  }
  export default Main;
