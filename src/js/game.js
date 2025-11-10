export const Game = {
  canvas:null,
  ctx:null,
  width:0,
  height:0,
  state:{
    stardust:0,
    clickValue:1,
    rebirthMultiplier:1,
    cosmicEssence:0,
    producers:[
      {name:"Asteroid Miner", count:0, baseCost:10, baseDPS:1},
      {name:"Comet Harvester", count:0, baseCost:100, baseDPS:10},
      {name:"Planet Extractor", count:0, baseCost:500, baseDPS:50},
      {name:"Galaxy Engine", count:0, baseCost:2000, baseDPS:200},
      {name:"Nebula Collector", count:0, baseCost:10000, baseDPS:1000}
    ],
    upgrades:[
      {name:"Click Booster", level:0, baseCost:50, multiplier:2, type:"color"},
      {name:"Cosmic Amplifier", level:0, baseCost:200, multiplier:1, flat:5, type:"flat"},
      {name:"Auto Collector", level:0, baseCost:500, multiplier:1.5, type:"dps"}
    ],
    settings:{clickSound:true,eventSound:true,purchaseSound:true,bgAnim:true}
  },
  mouse:{x:0,y:0},
  targets:[],
  gun:{x:0,y:0,angle:0,color:"#fff"}
};
