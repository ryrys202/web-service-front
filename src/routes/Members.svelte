<script>
	import socket from './socket';
	import { userName, adminStatus, secret, globalUserId } from './stores';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { toast } from '@zerodevx/svelte-toast';
	
	let shown = false;
	let members = [];
	let i = 0;
	let getLastItem = (thePath) => thePath.substring(thePath.lastIndexOf('/') + 1);

	export function show() {
		shown = true;
	}
	export function hide() {
		shown = false;
	}

	socket.on('startCall', async (arg) => {
		var obj = {
			name: arg.name,
			userId: arg.userId
		};
		members[i] = obj;
		i++;
	});

	socket.on('createOffer', async (arg) => {
		var obj = {
			name: arg.name,
			userId: arg.offerFromId
		};
		members[i] = obj;
		i++;
	});

	function kickUser(user) {
		socket.emit(
			'kickUser',
			{
				roomId: getLastItem(window.location.href),
				userId: $globalUserId,
				adminSecret: $secret,
				userToKick: user
			},
			(response) => {
				var data = JSON.parse(response);
				if (data.status == true) {
					toast.push('Пользователь был исключен', {
						theme: {
							'--toastBackground': '#48BB78',
							'--toastBarBackground': '#2F855A'
						}
					});
				}
			}
		);
	}
</script>

{#if shown}
	<!-- Modal content -->
	<div class="membersDiv absolute top-1/2 transform -translate-y-1/2  rounded-[15px] mb-[9%] mr-[5px] w-[25%] h-[82%] right-[0px] bg-[#1a73e8]/50 border-2 border-white">
		<div id="memberGrid" class="memberGrid flex flex-col justify-center p-[20px] gap-[10px]">
			<div class="text-white text-[20px]">Вы ({$userName})</div>
			{#each members as member}
				<div id={member.userId} class="flex flex-row justify-between">
					<p class="text-white text-[3vh]">{member.name}</p>
					{#if $adminStatus == true}
						<span class="close place-self-end text-[3vh]" on:click={() => kickUser(member.userId)}
							>&times;</span
						>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	/* Modal Content/Box */
	.membersDiv {
		-webkit-animation-name: slideIn;
		-webkit-animation-duration: 0.4s;
		animation-name: slideIn;
		animation-duration: 0.4s;
		z-index: 1;
	}

	.close {
		color: rgb(255, 255, 255);
		float: right;
		font-size: 28px;
		font-weight: bold;
		font-family: Roboto;
	}

	.close:hover,
	.close:focus {
		color: #e3e3e3;
		text-decoration: none;
		cursor: pointer;
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
