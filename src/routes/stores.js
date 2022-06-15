import { writable } from "svelte/store"
import { persist, sessionStorage } from "@macfja/svelte-persistent-store"

export const userName = writable(0)
export const adminStatus = writable(0)
export const globalUserId = persist(writable(0), sessionStorage(), 'globalUserId')
export const secret = persist(writable(0), sessionStorage(), 'secret')

