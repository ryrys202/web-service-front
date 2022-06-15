<script context = "module">
	export const prerender = false;
</script>

<script>
	import { onMount } from 'svelte';
	import JoinNameModal from './JoinNameModal.svelte';
	import { userName, adminStatus, globalUserId, secret } from './stores';
	import Members from './Members.svelte';
	import socket from './socket';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { toast } from '@zerodevx/svelte-toast';
	let joinNameModal;
	let yourUserId;
	let yourUserName;
	let members;
	let membList = false;
	let vidOff = true;
	let muted = true;
	let localStream;
	let pc1;
	let outputMessage = '';
	let mainList = [];
	let randomColor = Math.floor(Math.random() * 16777215).toString(16);

	const getLastItem = (thePath) => thePath.substring(thePath.lastIndexOf('/') + 1);

	const options = {
		theme: {
			'--toastBackground': '#F56565',
			'--toastBarBackground': '#C53030'
		}
	};
	const offerOptions = {
		offerToReceiveAudio: 1,
		offerToReceiveVideo: 1
	};

	const iceConfiguration = {
		iceServers: [
			{
				urls: 'stun:stun.l.google.com:19302'
			},
			{
				urls: 'turn:turn.themeeter.ru:3478',
				username: 'dimchik',
				credential: '4PkBWwRwkq4YZi'
			}
		]
	};

	onMount(async () => {
		joinNameModal.show();
		wait();
	});

	function wait() {
		if ($userName == '') {
			setTimeout(wait, 100);
		} else {
			start();
		}
	}

	async function start() {
		try {
			const stream = await navigator.mediaDevices
				.getUserMedia({
					video: true,
					audio: true
				})
				.then((stream) => {
					localStream = stream;
					yourUserId = socket.id;
					addVideoStream(yourUserId, 'Вы (' + $userName + ')');
					const vid = document.getElementById(yourUserId);
					vid.muted = true;
					vid.srcObject = localStream;
					vid.addEventListener('loadedmetadata', () => {
						vid.play();
					});
				});
		} catch (error) {
			console.log(error);
			toast.push('Вы не разрешили доступ к видео и микрофону. Переводим вас на главную страницу', {
				onpop: () => {
					location.href = 'http://videovstrechi.space';
				}
			});
		}
		joinRoom();
	}

	function joinRoom() {
		// JoinRoomRequestPacket(String roomId, String userId, String name, boolean useVideo, boolean useAudio)
		socket.emit(
			'joinRoom',
			{
				roomId: getLastItem(window.location.href),
				userId: $globalUserId,
				name: $userName,
				useVideo: true,
				useAudio: true
			},
			(response) => {
				var data = JSON.parse(response);
				console.log($globalUserId);
				if (data.exists === false) {
					toast.push('Такой комнаты не существует', {
						onpop: () => {
							location.href = 'http://themeeter.ru';
						}
					});
				} else {
					globalUserId.set(data.userId);
					adminStatus.set(data.isAdmin);
					secret.set(data.adminSecret);
					console.log($globalUserId);
					console.log($adminStatus);
					console.log($secret);
					socket.emit('startCall', {
						roomId: getLastItem(window.location.href),
						userId: $globalUserId,
						name: $userName
					});
				}
			}
		);
	}

	socket.on('startCall', async (arg) => {
		console.log(arg);
		pc1 = new RTCPeerConnection(iceConfiguration);
		var obj = {
			name: arg.name,
			userFrom: arg.userId,
			pc: pc1
		};
		mainList[arg.userId] = obj;
		addVideoStream(arg.userId, arg.name);

		localStream.getTracks().forEach((track) => obj.pc.addTrack(track, localStream));

		const offer = await obj.pc.createOffer(offerOptions);
		await onCreateOfferSuccess(offer, arg.userId, obj.pc);
		obj.pc.addEventListener('track', gotRemoteStream(arg.userId));
		obj.pc.addEventListener('connectionstatechange', (ev) => {
			disconnectDetect(arg.userId);
		});
		obj.pc.addEventListener('icecandidate', (e) => onIceCandidate(e));
		console.log('1');
	});

	async function onCreateOfferSuccess(desc, user, pc) {
		await pc.setLocalDescription(desc);
		socket.emit('createOffer', {
			roomId: getLastItem(window.location.href),
			offerFromId: $globalUserId,
			name: $userName,
			offerToId: user,
			offerBody: desc
		});
	}

	socket.on('createOffer', async (arg) => {
		console.log(arg);
		pc1 = new RTCPeerConnection(iceConfiguration);
		var obj = {
			name: arg.name,
			userFrom: arg.offerFromId,
			pc: pc1
		};
		mainList[arg.offerFromId] = obj;
		addVideoStream(arg.offerFromId, arg.name);
		obj.pc.addEventListener('track', gotRemoteStream(arg.offerFromId));

		localStream.getTracks().forEach((track) => obj.pc.addTrack(track, localStream));

		await obj.pc.setRemoteDescription(arg.offerBody);
		const answer = await obj.pc.createAnswer();
		await onCreateAnswerSuccess(answer, arg.offerFromId, obj.pc);
		obj.pc.addEventListener('connectionstatechange', (ev) => {
			disconnectDetect(arg.offerFromId);
		});
		obj.pc.addEventListener('icecandidate', (e) => onIceCandidate(e));
		console.log('2');
	});

	async function onCreateAnswerSuccess(desc, user, pc) {
		await pc.setLocalDescription(desc);
		socket.emit('answerOffer', {
			roomId: getLastItem(window.location.href),
			answerFromId: $globalUserId,
			answerToId: user,
			answerBody: desc
		});
	}

	socket.on('answerOffer', async (arg) => {
		console.log(arg);
		await mainList[arg.answerFromId].pc.setRemoteDescription(arg.answerBody);
		console.log('3');
	});

	socket.on('connect_error', (err) => {
		console.log(`connect_error due to ${err.message}`);
	});

	socket.on('kickUser', (arg) => {
		console.log('Вас исключили');
		toast.push('Администратор конференции исключил вас', {
			onpop: () => {
				location.href = 'http://videovstrechi.space';
			}
		});
	});
	// IncomingChatMessagePacket(String roomId, String userId, String message)
	socket.on('chatMessage', (arg) => {
		var messageDiv = document.createElement('div');
		var div1 = document.createElement('div');
		var messageFrom = document.createElement('p');
		var messageTime = document.createElement('p');
		var message = document.createElement('p');
		div1.style.cssText = 'display: flex; justify-content: space-between';
		message.style.cssText =
			'display:vertical-align:center; padding:5px; color: black; font-size: 2.5vh; overflow-wrap: break-word; line-height: 120%';
		message.innerHTML = arg.message;
		messageFrom.style.cssText =
			'display:vertical-align:center; padding:5px; color: black; font-size: 2.4vh; overflow-wrap: break-word;';
		messageFrom.innerHTML = arg.name;
		messageTime.style.cssText =
			'display:vertical-align:center; float: right; padding:5px; color: black; font-size: 2.3vh; overflow-wrap: break-word;';
		var currentTime = new Date().toLocaleTimeString().slice(0, -3);
		messageTime.innerHTML = currentTime;
		messageDiv.style.cssText =
			'flex-shrink: 0; height: auto; place-self: start; max-width: 60%; min-width: 20%; min-height: 5%; background-color: white; margin-top: 10px; margin-bot: 10px; border-top-right-radius: 10px; border-bottom-right-radius: 10px;';
		div1.appendChild(messageFrom);
		div1.appendChild(messageTime);
		messageDiv.appendChild(div1);
		messageDiv.appendChild(message);
		document.getElementById('messageList').appendChild(messageDiv);
	});

	function sendMessage() {
		if (outputMessage !== '') {
			socket.emit(
				'chatMessage',
				{
					roomId: getLastItem(window.location.href),
					fromId: $globalUserId,
					name: $userName,
					message: outputMessage
				},
				(response) => {
					var data = JSON.parse(response);
					console.log(data.status);
					if (data.status === false) {
						toast.push('Ваше сообщение слишком длинное', {
							theme: {
								'--toastBackground': '#F56565',
								'--toastBarBackground': '#C53030'
							}
						});
						console.log('Сообщение слишком длинное');
					} else {
						var messageDiv = document.createElement('div');
						var div1 = document.createElement('div');
						var messageFrom = document.createElement('p');
						var messageTime = document.createElement('p');
						var message = document.createElement('p');
						div1.style.cssText = 'display: flex; justify-content: space-between';
						message.style.cssText =
							'display:vertical-align:center; padding:5px; color: black; font-size: 2.5vh; overflow-wrap: break-word; line-height: 120%';
						message.innerHTML = outputMessage;
						messageFrom.style.cssText =
							'display:vertical-align:center; padding:5px; color: black; font-size: 2.4vh; overflow-wrap: break-word;';
						messageFrom.innerHTML = $userName;
						messageTime.style.cssText =
							'display:vertical-align:center; float: right; padding:5px; color: black; font-size: 2.3vh; overflow-wrap: break-word;';
						var currentTime = new Date().toLocaleTimeString().slice(0, -3);
						messageTime.innerHTML = currentTime;
						messageDiv.style.cssText =
							'flex-shrink: 0; height: auto; place-self: end; max-width: 60%; min-width: 20%; min-height: 5%; background-color: white; margin-top: 10px; margin-bot: 10px; border-top-left-radius: 10px; border-bottom-left-radius: 10px;';
						div1.appendChild(messageFrom);
						div1.appendChild(messageTime);
						messageDiv.appendChild(div1);
						messageDiv.appendChild(message);
						document.getElementById('messageList').appendChild(messageDiv);
						outputMessage = '';
						document.getElementById('messageBox').value = '';
					}
				}
			);
		}
	}

	async function onIceCandidate(event) {
		socket.emit('iceCandidate', {
			roomId: getLastItem(window.location.href),
			iceFromId: $globalUserId,
			iceCandidateBody: event.candidate
		});
	}

	socket.on('iceCandidate', async (arg) => {
		await mainList[arg.iceFromId].pc.addIceCandidate(arg.iceCandidateBody);
		console.log('4');
	});

	function gotRemoteStream(userId, e) {
		let vid = document.getElementById(userId);
		mainList[userId].pc.ontrack = (e) => (vid.srcObject = e.streams[0]);
		console.log('5');
		vid.addEventListener('loadedmetadata', () => {
			vid.play();
		});
	}

	function disconnectDetect(user, ev) {
		if (
			mainList[user].pc.connectionState === 'disconnected' ||
			mainList[user].pc.connectionState === 'failed' ||
			mainList[user].pc.connectionState === 'closed'
		) {
			console.log('Выполняется');
			var id = document.getElementById(user + 'Div');
			videoGrid.removeChild(id);
		}
		console.log(mainList[user].pc.iceConnectionState);
		console.log('Не выполняется');
	}

	function addVideoStream(userId, name) {
		const div = document.createElement('div');
		div.style.cssText =
			'position:relative; object-fit: contain; display: flex; width: 100%; height: 100%; overflow: hidden;';
		div.setAttribute('id', userId + 'Div');
		const video = document.createElement('video');
		video.setAttribute('id', userId);
		video.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:15px';
		const div1 = document.createElement('div');
		div1.style.cssText = 'position:absolute;top:0px;left:0px;width:100%;height:100%';
		const circle = document.createElement('div');
		circle.style.cssText =
			'height: 15vh; width: 15vh; margin: 0px auto; text-align: center; position: absolute; top: 0; left: 0; bottom: 0; right: 0; margin: auto';
		circle.style.opacity = '0';
		circle.style.border = 'solid 3px white';
		circle.style.borderRadius = '9999px';
		circle.style.backgroundColor = '#' + randomColor;
		circle.id = userId + 'circle';
		const currentUserName = document.createElement('div');
		currentUserName.style.cssText =
			'position:absolute; width:100%; height:15%; background-color:rgba(0,0,0,0.3); bottom:0px; right:0px; z-index:1; color:white; border-radius:15px; font-size: 2.3vh';
		const text = document.createElement('p');
		text.style.cssText = 'padding-left:10px;color:white';
		text.innerHTML = name;
		currentUserName.appendChild(text);
		div.appendChild(circle);
		div1.appendChild(currentUserName);
		div.appendChild(div1);
		div.appendChild(video);
		videoGrid.append(div);
	}

	function videoOff() {
		if (vidOff == true) {
			document.getElementById('button1').style.backgroundImage =
				"url('/img/buttons/button1_2.png')";
			document.getElementById('button1').style.border = 'solid 3px #FF0000';
			vidOff = false;
			document.getElementById(yourUserId + 'circle').style.opacity = '1';
		} else {
			document.getElementById('button1').style.backgroundImage =
				"url('/img/buttons/button1_1.png')";
			document.getElementById('button1').style.border = '';
			vidOff = true;
			document.getElementById(yourUserId + 'circle').style.opacity = '0';
		}
	}

	function videoOff1() {
		localStream.getTracks().forEach((track) => {
			// audio or video
			if (track.kind === 'video') {
				track.enabled = !track.enabled;
			}
		});
	}

	function mute() {
		if (muted == true) {
			document.getElementById('button2').style.backgroundImage =
				"url('/img/buttons/button2_2.png')";
			document.getElementById('button2').style.border = 'solid 3px #FF0000';
			muted = false;
		} else {
			document.getElementById('button2').style.backgroundImage =
				"url('/img/buttons/button2_1.png')";
			document.getElementById('button2').style.border = '';
			muted = true;
		}
	}

	function mute1() {
		localStream.getTracks().forEach((track) => {
			// audio or video
			if (track.kind === 'audio') {
				track.enabled = !track.enabled;
			}
		});
	}

	function back() {
		location.href = 'http://videovstrechi.space';
	}

	function memberlist() {
		if (membList == false) {
			members.show();
			membList = true;
		} else {
			members.hide();
			membList = false;
		}
	}
</script>

<svelte:head>
	<title>Видеовстречи</title>
	<link
		href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="relative w-screen h-screen flex flex-col bg-cover bg-[#e3e3e3] gap-[5px]"
>
	<div
		class="relative w-screen h-[9%] bg-[#1a73e8] rounded-b-[15px]"
	>
		<button
			class="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 left-[6%] text-white text-[3.5vh] hover:top-[61%] hover:text-[#d8d7d5] hover:ease-in-out hover:duration-300"
			on:click={() => back()}
		>
			Видеовстречи
		</button>
		<button
			class="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 right-[5%] text-white text-[3.5vh] hover:top-[61%] hover:text-[#d8d7d5] hover:ease-in-out hover:duration-300"
			on:click={() => memberlist()}
		>
			Участники
		</button>
	</div>
	<Members bind:this={members} />
	<div class="h-[91%] flex flex-row gap-[5px] object-contain ml-[5px]">
		<div class="relative myWindow relative rounded-[15px] w-[75%] h-full bg-black/70 p-[5px]">
			<div id="videoGrid" class="videoGrid relative w-full mx-[10px] h-full mt-[10px]" />
			<div
				class="panel1 relative flex flex-row justify-center bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10%] h-[7%] gap-[7%] p-[7px]"
			>
				<button
					id="button1"
					class="w-[23%] h-full rounded-full hover:border-[3px] hover:border-[#ff8c00] bg-[url('/img/buttons/button1_1.png')] bg-contain bg-center"
					on:click={() => videoOff()}
					on:click={() => videoOff1()}
				/>
				<button
					id="button2"
					class="w-[23%] h-full rounded-full hover:border-[3px] hover:border-[#ff8c00] bg-[url('/img/buttons/button2_1.png')] bg-contain bg-center"
					on:click={() => mute()}
					on:click={() => mute1()}
				/>
				<button
					class="w-[23%] h-full rounded-full hover:border-[3px] hover:border-[#ff8c00] bg-[url('/img/buttons/button3.png')] bg-contain bg-center"
					on:click={() => back()}
				/>
			</div>
		</div>
		<JoinNameModal bind:this={joinNameModal} />
		<div class="relative rounded-[15px] w-[25%] h-full mr-[5px]">
			<div class="bg-black/70 rounded-t-[15px] border-2 border-[#7E7E7E] h-[80%]">
				<div
					id="messageList"
					class="messageList relative w-full h-full max-h-full flex flex-col overflow-y-auto top-[0px] left-[0px] pb-[10px]"
				/>
			</div>
			<div class="relative bg-[#42464D] rounded-b-[15px] border-2 border-[#7E7E7E] h-[20%] p-[4%]">
				<textarea
					bind:value={outputMessage}
					id="messageBox"
					class="border-2 rounded-[10px] border-[#7E7E7E] pl-[3px] pr-[3px] w-[78%] h-full"
				/>
				<button
					on:click={sendMessage}
					class="absolute rounded-full w-[12%] h-[40%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 right-0 bg-[url('/img/buttons/send.png')] bg-contain bg-center hover:ring-2 hover:ring-[#ff8c00] active:mt-[5px]"
				/>
			</div>
		</div>
	</div>
</div>
<SvelteToast {options} />

<style>
	.panel1 {
		position: absolute;
		left: 50%;
		bottom: 0%;
		transform: translateX(-50%);
		width: 300px;
		height: 50px;
		border-radius: 15px;
		background-color: rgb(0, 0, 0, 0.2);
		opacity: 0.2;
	}

	.panel1:hover {
		background-color: rgb(0, 0, 0, 0.6);
		opacity: 1;
	}

	.videoGrid {
		display: grid;
		gap: 15px;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(3, 1fr);
	}
</style>
