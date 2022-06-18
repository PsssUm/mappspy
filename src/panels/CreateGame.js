import React from 'react';
import { getRandomLocation, getLocations, getRandomInt } from '../utils/Utils';
import left from '../img/left.svg'
import spy from '../img/spy.png'
import card from '../img/card.png'
import header_player from '../img/header_player.svg'
import Player from './ListItems/Player';
import bridge from '@vkontakte/vk-bridge';
import { getDatabase, set, ref, onValue } from "firebase/database";
import DbPlayer from './ListItems/DbPlayer';
class CreateGame extends React.Component {
   
	constructor(props){
		super(props)
		this.state = {
            playersCount : "",
            step : "counter",
            currentPlayer : -1,
            isTurnedCard : false,
            players : [],
            isMultiplayer : false,
            multiplayerCard : {},
            dbData : {}
        }
        this.countChanged = this.countChanged.bind(this)
        this.playerNameChanged = this.playerNameChanged.bind(this)
        this.newHash = "new_game1"
	}
	componentDidMount(){
        bridge.subscribe(this.onBridgeResult);
        this.subscribeBD()
    }
    componentDidUpdate(newProps){
        if (this.props != newProps){
            this.subscribeBD()
        }
    }
    subscribeBD = () => {
        // this.hash = ""
        // if (window.location.href.includes("#")){
        //     this.hash = window.location.href.split("#")[1]
        // }
        const checkIsUserIngame = ref(this.props.db, 'games/' + this.newHash);
		onValue(checkIsUserIngame, this.onFoundInDB);
    }
    onBridgeResult = (e) => {
        switch (e.detail.type) {
            case "VKWebAppShareResult":
                console.log("VKWebAppShareResult")
                set(ref(this.props.db, 'games/' + this.newHash), {timerTime : 0, players : this.state.players});
                
            break;
            
            default:
            break;
        }
    }
    onFoundInDB = (snapshot) => {
        var data = snapshot.val();
        console.log("onFoundInDB = " + JSON.stringify(data))
        if (data == null || data == undefined){
            return
        }
        var dataPlayers = data.players
        if (dataPlayers.length == 0){
            return
        }
        this.setState({players : dataPlayers})
        for (let index = 0; index < dataPlayers.length; index++) {
            const element = dataPlayers[index];
            if (index != 0 && element.id == this.props.myId){
                this.setState({step : 'own_multiplayer_card', multiplayerCard : element})
                break
            }
        }
        const emptyIds = dataPlayers.filter(player => player.id == -1)
        if (emptyIds.length == 0 && this.state.isMultiplayer){
            this.setState({step : 'own_multiplayer_card', multiplayerCard : dataPlayers[0]})
            console.log("emptyIds.length == 0")
        }
        this.setState({dbData : data})
    }
	countChanged(event){
        if (event){
            var value = event.target.value
            this.setState({playersCount : value})
        }
    }
    ready = () => {
        const step = this.state.step
        if (step == "counter"){
            var players = []
            for (let index = 0; index < this.state.playersCount; index++) {
                if (index == 0){
                    players.push({name : this.props.myName, id : this.props.myId, isSpy : false})
                } else {
                    players.push({name : 'Игрок ' + (index + 1), id : -1, isSpy : false})
                }
            }
            this.setState({step : 'players', players : players})
        } else if (step == "players"){
            this.setState({step : 'spy'})
        } else if (step == "spy"){
            this.setState({step : 'how_play'})
        } else if (step == "how_play"){
            this.generateCards()
            this.setState({step : 'cards_ready', isMultiplayer : false})
        } else if (step == "cards_ready"){
            if (this.state.isMultiplayer){
                this.props.setTimer(this.state.playersCount, this.state.dbData)
            } else {
                this.setState({step : '', currentPlayer : 1})
            }
        } else {
            this.setState({currentPlayer : this.state.currentPlayer + 1})
        }
    }
    back = () => {
        const step = this.state.step
        if (step == "counter"){
            this.props.back()
        } else if (step == "players"){
            this.setState({step : 'counter'})
        } else if (step == "spy"){
            this.setState({step : 'players'})
        } else if (step == "how_play"){
            this.setState({step : 'spy'})
        } else if (step == "cards_ready"){
            this.setState({step : 'how_play'})
        } else {
            this.setState({step : 'counter'})
        }
    }
    next = () => {
        if (this.state.isTurnedCard && this.state.currentPlayer == this.state.playersCount){
            this.props.setTimer(this.state.playersCount)
            return
        }
        if (!this.state.isTurnedCard){
            this.setState({isTurnedCard : true})
        } else {
            this.setState({currentPlayer : this.state.currentPlayer + 1, isTurnedCard : false})
        }

    }
    generateCards = () => {
        const locations = this.props.locations
        this.randomLocation = locations[getRandomInt(locations.length)]
        this.firstSpy = getRandomInt(this.state.playersCount)
        this.secondSpy = 0
        if (this.state.playersCount > 8){
            this.secondSpy = this.getSecondSpy(this.firstSpy)
        }
        var players = this.state.players
        if (players.length > this.firstSpy - 1){
            players[this.firstSpy - 1].isSpy = true
        }
        if (this.secondSpy != 0 && players.length > this.secondSpy - 1){
            players[this.secondSpy - 1].isSpy = true
        }
        for (let index = 0; index < players.length; index++) {
            players[index].randomLocation = this.randomLocation
        }
        this.setState({players : players})
        
        console.log("this.firstSpy = " + this.firstSpy)
        console.log("this.secondSpy = " + this.secondSpy)
       
    }
    getSecondSpy = (firstSpy) => {
        var secondSpy = getRandomInt(this.state.playersCount)
        if (secondSpy == firstSpy){
            this.getSecondSpy(firstSpy)
        } else {
            return secondSpy
        }
    }
    playerNameChanged(name, index){
        var players = this.state.players
        players[index].name = name
        this.setState({players : players})
    }
    openMultiplayer = () => {
        this.generateCards()
        this.setState({step : 'cards_ready', isMultiplayer : true})
    }
    shareToFriends = () => {
        bridge.send("VKWebAppShare", {"link": "https://vk.com/app8196651#" + this.newHash});
    }
    startMultiplayer = () => {
        this.props.setTimer(this.state.playersCount, this.state.dbData)
    }
	render() {
        const playersCount = this.state.playersCount
        var isError = playersCount <3 || playersCount > 16
        if (playersCount == "" || playersCount == undefined){
            isError = false
        }
        if (this.state.step == 'players'){
            const emptyNames = this.state.players.filter(player => (player.name == "" || player.name == undefined))
            if (emptyNames.length > 0){
                isError = true
            }
        }
        var isShowStartMultiplayer = false
        if (this.state.isMultiplayer){
            const emptyIds = this.state.players.filter(player => player.id == -1)
            if (emptyIds.length > 0){
                isError = true
            } else {
                isShowStartMultiplayer = true
            }
        }
        var btnText = this.state.step == "counter" ? "Готово" : (this.state.step == "spy" || this.state.step == "players") ? "Дальше" : this.state.step == "how_play" ? "Все на одном смартфоне" : this.state.step == "cards_ready" ? "Начать" : ""
        if (this.state.step == "own_multiplayer_card") {
            return(
                    <div>
                        <div className="player_header">
                            <img className="player_header_img" src={header_player}/>
                            <p className="center player_header_title">{this.state.multiplayerCard.name}</p>
                        </div>
                        <div className="center">
                            <div className="relative">
                                <img className="spy_img" src={this.state.multiplayerCard.isSpy ? spy : this.state.multiplayerCard.randomLocation.img}/>
                                {(this.state.multiplayerCard.randomLocation.name != "" && !this.state.multiplayerCard.isSpy) && <p style={{fontSize : '21px', fontWeight : '600', whiteSpace : 'break-spaces'}} className="center custom_loc_name">{this.state.multiplayerCard.randomLocation.name}</p>}
                            </div>
                            <p className="player_img_desc">Не показывайте никому эту карту</p>

                        </div>
                        {this.state.isMultiplayer && <div onClick={this.startMultiplayer} style={{bottom : '64px', left : '30px', position : 'fixed'}} className="btn hover player_btn">Начать</div>}

                    </div>)
         } else if (this.state.currentPlayer != -1) {
            return(
                <div>
                    <div className="player_header">
                        <img className="player_header_img" src={header_player}/>
                        {this.state.players[this.state.currentPlayer - 1] != undefined && <p className="center player_header_title">{this.state.players[this.state.currentPlayer - 1].name}</p>}
                    </div>
                    <div className="center">
                        <div className="relative">
                            <img className="spy_img" src={this.state.isTurnedCard ? (this.state.currentPlayer == this.firstSpy || this.state.currentPlayer == this.secondSpy) ? spy : this.randomLocation.img : card}/>
                            {(this.state.isTurnedCard && this.randomLocation.name != "" && this.state.currentPlayer != this.firstSpy && this.state.currentPlayer != this.secondSpy) && <p style={{fontSize : '21px', fontWeight : '600', whiteSpace : 'break-spaces'}} className="center custom_loc_name">{this.randomLocation.name}</p>}
                        </div>
                        <p className="player_img_desc">{this.state.isTurnedCard ? "Не показывайте никому эту карту" : ""}</p>
                    </div>
                    
                    <div onClick={this.next} className="btn hover player_btn">{this.state.isTurnedCard ? this.state.currentPlayer == this.state.playersCount ? "Начать игру" : "Следующий игрок" : "Перевернуть карту"}</div>

                </div>)
        } else {
            return(
            <div className="main_container gradient_bg">
                <div onClick={this.back} className="left_cont">
                    <img className="left" src={left}/>
                </div>
                {this.state.step == "counter" && <div>
                    <p className="create_title">Сколько игроков?</p>
                    <input type='number' value={this.playersCount} onChange={this.countChanged} className="player_count_input" />
                    <p style={isError ? {color : '#FF8979'} : {}} className="player_desc hover">Для игры нужно 3-16 человек</p>
                </div>}
                {this.state.step == "players" && <div>
                    {this.state.players.map((item, index) => (
                        <Player playerNameChanged={this.playerNameChanged} player={item} key={index} index={index}/>
                    ))}
                    <div style={{height : '120px', width : '100vw'}}/>
                </div>}
                {this.state.step == "spy" && <div>
                    <p className="create_title">У вас будет {this.state.playersCount > 8 ? "2 шпиона" : "1 шпион"}</p>
                    <div className="center">
                        <img className="spy_img" src={spy}/>
                        <p className="player_desc hover">Ему попадётся такая карта</p>
                    </div>
                </div>}
                {this.state.step == "how_play" && <div>
                    <p className='center mult_title'>Как вы будете играть?</p>
                    <div onClick={this.openMultiplayer} style={{bottom : '136px'}} className="btn hover player_btn">каждый на своём</div>
                </div>}
                
                {this.state.step == "cards_ready" && <div>
                    <p className="create_title">Карты распределены,<br/>можно начинать!</p>
                    <p className="cards_ready_desc">{this.state.isMultiplayer ?  "Каждый игрок увидит локацию на экране своего смартфона, а таймер должен быть синхронизирован между всеми в раунде." : "Передавайте смартфон друг другу по очереди — каждый будет видеть только свою карту. После того, как все ознакомятся с картами, начнётся обратный отсчёт времени."}</p>
                    {this.state.isMultiplayer && this.state.players.map((item, index) => (
                        <DbPlayer player={item} key={index} index={index}/>
                    ))}
                     <div style={{height : '220px', width : '100vw'}}/>
                    {this.state.isMultiplayer && <div onClick={this.shareToFriends} style={{bottom : '64px'}} className="btn hover player_btn">Позвать друзей</div>}
                </div>}
                
                {(this.state.step != '' && !this.state.isMultiplayer) && <div style={isError || playersCount == "" || playersCount == undefined  ? {opacity : 0.2, pointerEvents : 'none'} : {}} onClick={this.ready} className="btn hover player_btn">{btnText}</div>}
            </div>)
        }
        
	}
  }
  export default CreateGame;
