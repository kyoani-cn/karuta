const generateOneKarutaByRandom = ()=>{
	return Math.floor(Math.random() * 10);
}


const generateKaruta16ByRandom = ()=>{
	let karutas = [
		1,2,3,4,5,6,7,8,
		1,2,3,4,5,6,7,8,
	];
	
	karutas = karutas.sort((a, b)=>Math.random() - 0.5);
	
	return karutas;
}
const getUnixTime = ()=>{
	return +new Date();
}

const app = new Vue({
	el: '.app',
	data: {
		karutas: generateKaruta16ByRandom(),
		currentSelectedIndexes: [],
		completedKarutaIndexes: [],
		lockedByUUIDs: [],
		startUnixTime: 0,
		endUnixTime: 0,
		duration: 60, // 单位秒
		nowUnixTime: getUnixTime(),
		timer: null,
	},
	computed:{
		locked(){
			return !!this.lockedByUUIDs.length;
		},
		remainNumber(){
			return 16 - this.completedKarutaIndexes.length;
		},
		remainTime(){
			let num = this.duration - Math.floor((this.nowUnixTime - this.startUnixTime) / 1000);

			if(num < 0) num = 60;
			
			return num;
		}
	},
	methods: {
		selectKaruta(index){
			if(this.completedKarutaIndexes.includes(index)){
				return; // 如果已经翻牌了那么不处理
			}

			if(this.currentSelectedIndexes.length >= 2){
				return; // 如果已经有两张牌了那么不处理
			}

			this.currentSelectedIndexes.push(index);

			this.confirmCurrentKaruta();
		},
		confirmCurrentKaruta(){
			const { currentSelectedIndexes, karutas } = this;
			if(currentSelectedIndexes.length !== 2){
				return;
			}

			const [index1, index2] = currentSelectedIndexes;

			const karuta1 = karutas[index1];
			const karuta2 = karutas[index2];

			if(karuta1 === karuta2){
				this.completedKarutaIndexes.push(index1);
				this.completedKarutaIndexes.push(index2);
				this.currentSelectedIndexes = [];
			}else{
				// 翻转回去，相当于罚了1秒
				const uuid = 'failed';
				this.lockedByUUIDs.push(uuid);
				setTimeout(()=>{
					this.currentSelectedIndexes = [];
					this.lockedByUUIDs = this.lockedByUUIDs.filter(item => item !== uuid);
				}, 1000);
			}

		},
		startGame(){
			this.karutas = generateKaruta16ByRandom();
			this.currentSelectedIndexes = [];
			this.completedKarutaIndexes = [];
			this.startUnixTime = getUnixTime();
			this.step();
			this.startTimer();
		},
		startTimer(){
			clearInterval(this.timer);
			this.timer = setInterval(()=>{
				app.step();
			}, 200);
		},
		theEnd(){
			this.endUnixTime = getUnixTime();
			console.log('游戏结束');
			clearInterval(this.timer);
		},
		step(){
			this.nowUnixTime = getUnixTime();

			if(this.remainNumber <= 0){
				this.theEnd();
			}
		}
	},
});


const loadImage = (url)=>{
	return new Promise((resolve, reject)=>{
		const image = new Image();
		image.src = url;
		image.onload = ()=>{
			resolve(image);
		};
	});
}

const canvasToBlobURL = (canvas)=>{
	return new Promise((resolve, reject)=>{
		canvas.toBlob((blob)=>{
			const blobURL = URL.createObjectURL(blob);
			resolve(blobURL);
		});
	});
}

const karutaImagesURL = 'karuta@2x.webp';
const fetchKarutaImages = async ()=>{
	const response = await fetch(karutaImagesURL);
	const blob = await response.blob();
	
	// 按照 160 * 200 的尺寸 3*3 切割 480 * 600 的原始图片
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	canvas.width = 160;
	canvas.height = 200;

	const image = await loadImage(URL.createObjectURL(blob));

	let cssText = '';
	for(let i = 0; i < 9; i++){
		const x = i % 3;
		const y = Math.floor(i / 3);
		ctx.drawImage(image, x * 160, y * 200, 160, 200, 0, 0, 160, 200);

		const blobURL = await canvasToBlobURL(canvas);

		cssText	+= `.karuta-image-${i}{background-image:url(${blobURL});}`;
		// console.log(i, blobURL);
	}

	const style = document.createElement('style');
	style.innerHTML = cssText;
	document.head.appendChild(style);
}


fetchKarutaImages();