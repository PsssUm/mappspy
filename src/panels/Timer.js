import React from 'react';
import left from '../img/left.svg'
import CircleProgress from '../utils/CircleProgress';


class Timer extends React.Component {
   
	constructor(props){
		super(props)
		
    }
    
	componentDidMount(){
	
    }
    
	stopTimer = () => {
        this.props.stopTimer()
    }
	render() {
        const percentage = ((this.props.allSeconds - this.props.currentTimerSeconds) / this.props.allSeconds)*100
      
        return (
            <div className="main_container gradient_bg">
                <div onClick={this.props.back} className="left_cont">
                    <img className="left" src={left}/>
                </div>
                {(this.props.currentTimerSeconds != 0 && this.props.currentTimerSeconds != undefined) && <p className="timer_text center">{new Date(this.props.currentTimerSeconds * 1000).toISOString().substring(14, 19)}</p>}
                {(this.props.isMainTimer || !this.props.isMultiplayer) && <div onClick={this.stopTimer} className="btn hover player_btn">Завершить</div>}
                <CircleProgress style={{width : '210px'}} percentage={percentage}/>
            </div>
	  )
	}
  }
  export default Timer;
