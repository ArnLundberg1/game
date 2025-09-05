let playerMoney = 20000;
let stations = [];
let activeAlarms = [];
let config = null;

async function loadConfig() {
  const response = await fetch('config.cfg');
  config = await response.json();
}

function updateMoneyDisplay() {
  document.getElementById('money').innerText = `Pengar: ${playerMoney} kr`;
}

// Skapa station
function createStation(type) {
  const stationData = config.stations.find(s => s.type === type);
  if (!stationData) return alert("Stationstyp finns inte!");
  if (playerMoney < stationData.cost) return alert("Inte tillräckligt med pengar!");
  
  playerMoney -= stationData.cost;
  stations.push({type: type, units: [], maxUnits: 5});
  updateMoneyDisplay();
  alert(`${type} byggd!`);
}

// Lägg till enhet i station
function addUnitToStation(stationIndex, unitType) {
  const station = stations[stationIndex];
  const unitData = config.units.find(u => u.type === unitType);
  if (!unitData) return alert("Enhet finns inte!");
  if (station.units.length >= station.maxUnits) return alert("Stationen har max antal enheter!");
  
  station.units.push({type: unitType, fuel: 100});
  alert(`${unitType} placerad i ${station.type}`);
}

// Skapa alarm
function createAlarm() {
  const alarmData = config.alarms[Math.floor(Math.random() * config.alarms.length)];
  const alarm = {...alarmData, started: false};
  activeAlarms.push(alarm);

  const map = document.getElementById('map-container');
  const alarmEl = document.createElement('div');
  alarmEl.className = 'alarm';
  alarmEl.innerText = alarm.name;
  alarmEl.style.left = `${Math.random() * 700}px`;
  alarmEl.style.top = `${Math.random() * 500}px`;

  alarmEl.addEventListener('click', () => respondToAlarm(alarm));
  map.appendChild(alarmEl);
}

// Hantera larm
function respondToAlarm(alarm) {
  const station = stations[0]; // För enkelhet: alltid station 0
  const missingUnits = alarm.requiredUnits.filter(req => 
    !station.units.some(u => u.type === req)
  );
  if (missingUnits.length > 0) {
    return alert(`Stationen saknar enheter: ${missingUnits.join(', ')}`);
  }

  if (!alarm.started) {
    alarm.started = true;
    setTimeout(() => {
      const reward = Math.floor(Math.random() * (alarm.rewardMax - alarm.rewardMin + 1)) + alarm.rewardMin;
      playerMoney += reward;
      updateMoneyDisplay();
      alert(`Larm klart! Du fick ${reward} kr.`);
      activeAlarms = activeAlarms.filter(a => a !== alarm);
    }, alarm.duration);
  }
}

// Initiera
loadConfig().then(() => {
  updateMoneyDisplay();
  createStation('brandstation');
  addUnitToStation(0, 'brandbil');

  setInterval(createAlarm, 5000); // Skapa larm var 5:e sekund
});

