const generateOneKarutaByRandom = ()=>{
	return Math.floor(Math.random() * 10);
}


const generateKaruta16ByRandom = ()=>{
	let karutas = [];
	for(let i = 0; i < 16; i++){
		karutas.push(generateOneKarutaByRandom());
	}
	return karutas;
}


const app = new Vue({
	el: '.app',
	data: {
		karutas: generateKaruta16ByRandom(),
		currentSelectedIndexes: [],
		completedKarutaIndexes: [],
	},
	methods: {
		selectKaruta(index){
			if(this.completedKarutaIndexes.includes(index)){
				return; // 如果已经翻牌了那么不处理
			}
		},
		startGame(){
			this.karutas = generateKaruta16ByRandom();
			this.currentSelectedIndexes = [];
			this.completedKarutaIndexes = [];
		},
		theEnd(){

		}
	},
});