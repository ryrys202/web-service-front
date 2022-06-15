<script>
	import { goto } from '$app/navigation';
	import { transition_in } from 'svelte/internal';
	import CreatorNameModal from './CreatorNameModal.svelte';
	import socket from './socket';

	let creatorNameModal;
</script>

<svelte:head>
	<title>Видеовстречи</title>
	<link
		href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="relative w-screen h-screen flex flex-col bg-cover bg-[#e3e3e3]">
	<div
		class="relative w-screen h-[9%] bg-[#1a73e8] rounded-b-[15px]"
	>
		<button
			class="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 left-[6%] text-white text-[3.5vh] hover:top-[61%] hover:text-[#d8d7d5] hover:ease-in-out hover:duration-300"
		>
			Видеовстречи
		</button>
	</div>
	<button
		on:click={creatorNameModal.createRoom()}
		on:click={() => creatorNameModal.show()}
		class="button absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[22%] h-[22%] rounded-[15px] padding-[20px] bg-[#1a73e8] duration-700 ring-white hover:ring-[#d8d7d5] ring-4"
	>
		<p class="text-[4.5vh] text-white duration-700 hover:text-[#d8d7d5] m-[10px]">Создать конференцию</p>
	</button>
	<CreatorNameModal bind:this={creatorNameModal} />
</div>
<style>
	.button {
		font-family: Roboto;
	}
	.lg1 {
		font-family: Roboto;
	}
</style>
