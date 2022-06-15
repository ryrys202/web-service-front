<script>
	import socket from "./socket"
	let shown = false
	let linkUrl = ""

	export function show() {
		shown = true;
	}
	export function hide() {
		shown = false;
	}

	export function createRoom() {
		// CreateRoomRequestPacket(String name)
		socket.emit('createRoom', {name: ""}, (response) =>{
			// CreateRoomResponsePacket(String roomId, String userId, String name)
			var data = JSON.parse(response)
			console.log(window.location.href + data.roomId)
			linkUrl = window.location.href + data.roomId
		})
	}

	function copyUrl() {
		var copyText = document.getElementById("copyLink")
		navigator.clipboard.writeText(copyText.innerHTML)
		document.getElementById('modal-content').style.transitionDuration = "0.8s"
		document.getElementById('copyButton').style.transitionDuration = "0.8s"
		document.getElementById('copyButton').innerHTML = "Скопировано"
		document.getElementById('copyButton').style.backgroundColor = "white"
		document.getElementById('modal-content').style.border = "#00FF21 solid 4px"
		document.getElementById('copyButton').style.color = "#00FF21"
	}
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.keyCode == 27) {
			hide();
		}
	}}
/>

{#if shown}
	<!-- The Modal -->
	<div id="myModal" class="creatorNameModal">
		<!-- Modal content -->
		<div id = "modal-content" class="modal-content rounded-[15px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1a73e8] flex flex-col place-content-center">
			<div class="flex flex-row w-full h-[20%] justify-end">
			<p class="lg2 w-full text-center text-white text-[4.5vh]">
				Ваша ссылка на конференцию
			</p>
			<span class="close absolute place-self-end" on:click={() => hide()}>&times;</span>
			</div>
			<div class="relative flex flex-row justify-center place-self-center w-[100%] h-[100%]">
				<p id="copyLink" class="lg2 text-white p-[5px] text-[3vh] place-self-center pl-[10px] rounded-[25px] w-[50%] h-[25%] bg-black/50 text-center">{linkUrl}</p>
			</div>
			<div class="relative flex flex-row justify-end gap-[2%] self-end w-full h-[30%]">
				<button class="close1 rounded-[25px]" id="copyButton" on:click={copyUrl}> Копировать ссылку</button>
				<button class="close1 rounded-[25px]" on:click={() => hide()}>
					Отмена
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* The Modal (background) */
	.creatorNameModal {
		position: fixed; /* Stay in place */
		z-index: 1; /* Sit on top */
		left: 0;
		top: 0;
		width: 100%; /* Full width */
		height: 100%; /* Full height */
		background-color: rgb(0, 0, 0); /* Fallback color */
		background-color: rgba(0, 0, 0, 0.6); /* Black w/ opacity */
		-webkit-animation-name: fadeIn; /* Fade in the background */
		-webkit-animation-duration: 0.8s;
		animation-name: fadeIn;
		animation-duration: 0.8s;
	}

	/* Modal Content/Box */
	.modal-content {
		position: relative;
		padding: 20px;
		width: 45%; /* Could be more or less, depending on screen size */
		height: 45%;
		min-width: 160px;
		min-height: 200px;
		border: 4px white solid;
		-webkit-animation-name: slideIn;
		-webkit-animation-duration: 0.8s;
		animation-name: slideIn;
		animation-duration: 0.8s;
	}

	/* The Close Button */
	.close {
		color: rgb(255, 255, 255);
		float: right;
		font-size: 28px;
		font-weight: bold;
		font-family: Roboto;
	}

	.close:hover,
	.close:focus {
		color: #d8d7d5;
		text-decoration: none;
		cursor: pointer;
	}

	.close1 {
		color: rgb(255, 255, 255);
		border: solid;
		width: 20%;
		font-family: Roboto;
		font-size: 2.5vh;
		font-weight: bold;
	}

	.close1:hover,
	.close1:focus {
		color: #d8d7d5;
		text-decoration: none;
		cursor: pointer;
		transition: 0.3s;
	}

	.close1:active {
		color: white;
		background: #d8d7d5;
		text-decoration: none;
		cursor: pointer;
		transition: 0s
	}

	.lg2 {
		font-family: Roboto;
	}

	@-webkit-keyframes slideIn {
		from {
			bottom: -300px;
			opacity: 0;
		}
		to {
			bottom: 0;
			opacity: 1;
		}
	}

	@keyframes slideIn {
		from {
			bottom: -300px;
			opacity: 0;
		}
		to {
			bottom: 0;
			opacity: 1;
		}
	}

	@-webkit-keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>