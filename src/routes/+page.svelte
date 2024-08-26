<script>
	import { Protocol, PMTiles } from 'pmtiles';
	import maplibregl from 'maplibre-gl';
	import { onMount } from 'svelte';

	const PMTILES_URL = 'https://pmtiles.io/protomaps(vector)ODbL_firenze.pmtiles';

	let protocol = new Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);

	const p = new PMTiles(PMTILES_URL);
	protocol.add(p);

	onMount(() => {
		p.getHeader().then((h) => {
			const map = new maplibregl.Map({
				container: 'map',
				zoom: h.maxZoom - 2,
				center: [h.centerLon, h.centerLat],
				style: {
					version: 8,
					sources: {
						example_source: {
							type: 'vector',
							url: `pmtiles://${PMTILES_URL}`,
							attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
						}
					},
					layers: [
						{
							id: 'buildings',
							source: 'example_source',
							'source-layer': 'landuse',
							type: 'fill',
							paint: {
								'fill-color': 'steelblue'
							}
						},
						{
							id: 'roads',
							source: 'example_source',
							'source-layer': 'roads',
							type: 'line',
							paint: {
								'line-color': 'black'
							}
						},
						{
							id: 'mask',
							source: 'example_source',
							'source-layer': 'mask',
							type: 'fill',
							paint: {
								'fill-color': 'white'
							}
						}
					]
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
