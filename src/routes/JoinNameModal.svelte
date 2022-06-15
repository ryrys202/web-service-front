<script>
	import { userName } from './stores';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { toast } from '@zerodevx/svelte-toast';
	let shown = false;
	let answer = '';

	const options = {
		theme: {
			'--toastBackground': '#F56565',
			'--toastBarBackground': '#C53030'
		}
	};

	export function show() {
		shown = true;
	}
	export function hide() {
		shown = false;
	}

	function confirmName() {
		userName.set(answer);
	}
	function cancelName() {
		toast.push('Вы не ввели имя. Переводим вас на главную страницу', {
			onpop: () => {
				location.href = 'http://videovstrechi.space';
			}
		});
	}
</script>

<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />

{#if shown}
	<!-- The Modal -->
	<div id="myModal" class="joinNameModal">
		<!-- Modal content -->
		<div class="modal-content top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-[15px] bg-[#1a73e8] flex flex-col place-content-center">
			<div class="flex flex-row w-full h-[20%] justify-end">
				<p class="lg2 w-full text-center text-white text-[4.5vh]">Введите имя</p>
				<span class="close absolute place-self-end" on:click={() => cancelName()} on:click={() => hide()}>&times;</span>
			</div>	
			<form
				on:submit|preventDefault={() => confirmName}
				class="lg2 relative flex flex-row justify-center place-self-center w-[100%] h-[100%]"
			>
				<input
					bind:value={answer}
					class="form-control place-self-center pl-[10px] rounded-[25px] w-[50%] h-[25%] text-[18px]"
				/>
			</form>
			<div class="relative flex flex-row justify-end gap-[2%] self-end w-full h-[30%]">
				<button
					class="lg2 close1 rounded-[25px]"
					type="submit"
					on:click={() => confirmName()}
					on:click={() => hide()}
				>
					Принять
				</button>
				<button class="lg2 close1 rounded-[25px]" on:click={() => cancelName()} on:click={() => hide()}>
					Отмена
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* The Modal (background) */
	.joinNameModal {
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
		width: 17%;
		font-family: Roboto;
		font-size: 2.6vh;
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

	:root {
		--toastContainerTop: auto;
		--toastContainerRight: auto;
		--toastContainerBottom: 8rem;
		--toastContainerLeft: calc(50vw - 8rem);
	}
</style>
