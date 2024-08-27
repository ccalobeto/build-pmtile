<script>
	import { Protocol, PMTiles } from 'pmtiles';
	import maplibregl from 'maplibre-gl';
	import { onMount } from 'svelte';
	import layers from 'protomaps-themes-base';

	const PMTILES_URL = 'https://pub-d38145745fe247a1b3acb61ef28034c6.r2.dev/peru.pmtiles';

	let protocol = new Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	const p = new PMTiles(PMTILES_URL);
	protocol.add(p);

	onMount(() => {
		p.getHeader().then((h) => {
			const map = new maplibregl.Map({
				container: 'map',
				zoom: 5,
				center: [h.centerLon, h.centerLat],
				style: {
					version: 8,
					glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
					sprite: 'https://protomaps.github.io/basemaps-assets/sprites/v3/dark',
					sources: {
						protomaps: {
							type: 'vector',
							url: `pmtiles://${PMTILES_URL}`,
							attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
						}
					},
					layers: layers('protomaps', 'light')
				}
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
