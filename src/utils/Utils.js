import casino from '../img/casino.png'
import pirates from '../img/pirates.png'
import liner from '../img/liner.png'
import spa from '../img/spa.png'
import to from '../img/to.png'
import war from '../img/war.png'
export function getRandomInt(max) {
    const min = 1
    let difference = max - min;

    // generate random number 
    let rand = Math.random();

    // multiply with difference 
    rand = Math.floor( rand * difference);

    // add with min value 
    rand = rand + min;

    return rand;
}
export function getLocations() {
    var locations = [{img : casino, name : ''}, {img : pirates, name : ''}, {img : liner, name : ''}, {img : spa, name : ''}, {img : to, name : ''}, {img : war, name : ''}]
    var savedLocations = getSavedLocation()
    if (savedLocations != null && savedLocations != undefined && savedLocations.length > 0){
        savedLocations.forEach(loc => {
            locations.push(loc)
        });
        
    }
    console.log("locations = " + JSON.stringify(locations))
    return locations
}
export function getRandomLocation() {
    const locations = getLocations()
    return locations[getRandomInt(locations.length)]
}
export const addLocation = (location) => {
    var locations = getSavedLocation()
    if (locations == null || locations == undefined){
        locations = []
    }
    locations.push(location)
    localStorage.setItem('locations', JSON.stringify(locations));
}
export const getSavedLocation = () => {
    return JSON.parse(localStorage.getItem('locations'))
};