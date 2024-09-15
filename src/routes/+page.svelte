<script>
	import { Protocol, PMTiles } from 'pmtiles';
	import maplibregl from 'maplibre-gl';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	const style = `${base}/data/styles/grayscale.json`;

	const PMTILES_URL = 'https://pub-d38145745fe247a1b3acb61ef28034c6.r2.dev/peru.pmtiles';

	let protocol = new Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	const p = new PMTiles(PMTILES_URL);
	protocol.add(p);

	onMount(() => {
		const initialize = { lng: -77.03778, lat: -12.06649, zoom: 13.5 };
		p.getHeader().then((h) => {
			const map = new maplibregl.Map({
				container: 'map',
				zoom: initialize.zoom,
				center: [initialize.lng, initialize.lat],
				style: style
			});
		});
	});
</script>

<div id="map"></div>

<style>
	#map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
	}
</style>
