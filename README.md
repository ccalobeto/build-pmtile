# Publishing a pmtile with maplibre
It comes from `.../publishing-tiles/upload-pmtile`, which are the steps to upload a pmtile file to cloudfare r2.

## Basemaps for MapLibre
For a basemap you need: 
- tileset
- style
- fontstack or glyphs
- spritesheets or themes

MapLibre styles are JSON documents.

## Setup
### Use [maps](https://maps.protomaps.com/) tool
Upload your pmtile into the tool and go to the address bar to get the zoom level and coordinates. You will use it as a initial calibration when you create an instance of the map with MapLibre. 

Then select the `theme` and `get style json` to copy the clipboard.

### Save the file
Save the file in the path `static/data/styles/<filename>.json` and update the `url` key with the `Public R2.dev Bucket URL` which is the location of your pmtile in *cloudfare*.

### Use
Go to your `+page.svelte` import the style and use it when you create the instance.

### Use a package
You can use `protomaps-themes-base` package. [Review](https://docs.protomaps.com/basemaps/maplibre)