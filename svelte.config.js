import sveltePreprocess from 'svelte-preprocess';
//import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = { 
	preprocess: sveltePreprocess,
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false
		}),
		trailingSlash: 'never',
		prerender: {
			// This can be false if you're using a fallback (i.e. SPA mode)
			default: true
		  }
	}
};

export default config;

