# About the Project
This project *builds a tileset of Perú* using [Protomaps](https://docs.protomaps.com/). Also teach you how to make a custom **maplibre style** to use it in as a basemap in your viz projects.

## A quick process to upload a pmtile
To build a maplibre style, you need a tileset (pmtile). These are the steps:

1. Extract the pmtile

Edit the bounding box of the area to extract in the `pmtileExtraction` bash script. Use [klokantech](https://boundingbox.klokantech.com/) to select the area and then execute:
```bash
npm run extract-pmtile
```

2. Publish the pmtile in cloudfare

Edit the name of the downloaded pmtile and edit the name of the bucket in the `upload2cloudflare.js` script. Then execute the following command if your file is less than 2GiB. 
```bash
npm run upload-pmtile
```

Don't forget to create and `.env` file, because the script use cloudflare credentials.

> [!IMPORTANT]
> If your file > 2GiB, use `rclone` as detail later.

3. Use the pmtile

Go to *static/data/styles* and edit the `url` key with your recent pmtile in `Public R2.dev Bucket URL`. Finally in `src/routes/+page.svelte` edit the path of recent custom style.

## Detail process to upload a pmtile
### Getting Started
Install [pmtiles](https://formulae.brew.sh/formula/pmtiles) 

Find the recently [OSM data](https://maps.protomaps.com/builds/)

Use [klokantech](https://boundingbox.klokantech.com/) or [bboxfinder](http://bboxfinder.com/) to choose the **bbox** or extract it from a topojson layer property called *bbox*. 

### Extract the pmtile
Extraction
```
pmtiles extract https://build.protomaps.com/20240822.pmtiles peru.pmtiles --bbox=-81.32810348999999,-18.349025360999974,-68.65308935299998,-0.03860596899994562
```

Check your extracted pmtile in [maps](https://maps.protomaps.com).

### Storage a PMTile bigger than 2Gib
Here we use a r2 bucket from cloudfare to storage the pmtile. Here we will use S3-compatible storage in cloudflare with a tool called `rclone`. There another way using **workers**.

Here are the steps:

- Create your **r2 bucket** called `protomaps-sample-dataset` in cloudfare.

- Due pmtiles are big files, you must install the cli tool called *rclone*. Read Full documentation [here](https://developers.cloudflare.com/r2/examples/rclone/). 
```
brew install rclone
```

- Then generate R2 API tokens `access_key_id` and `access_key_secret`.

- Edit config `rclone.conf` file with the id, secret and endpoint. Go to vim /Users/carlosalbertoleonliza/.config/rclone/rclone.conf 
```
 [r2demo]
type = s3
provider = Cloudflare
access_key_id = abc123
secret_access_key = xyz456
endpoint = https://<accountid>.r2.cloudflarestorage.com
acl = private
no_check_bucket = true
```

- Upload your pmtile to your bucket called `protomaps-sample-datasets`.
```
rclone copy ./download-pmtiles/great_britain.pmtiles r2demo:protomaps-sample-datasets
```

### Verify the uploaded file
Go to cloudfare R2 UI or look it with this command. 
```
rclone tree r2demo:
```

![](./images/upload-message.png)

Or using `show` command with the R2 storage `Public R2.dev Bucket URL` 
```bash
pmtiles show https://pub-d38145745fe247a1b3acb61ef28034c6.r2.dev/peru.pmtiles
```

Or using `show` command and **endpoints**.
```bash
export AWS_ACCESS_KEY_ID=MY_KEY
export AWS_SECRET_ACCESS_KEY=MY_SECRET
pmtiles show peru.pmtiles --bucket=s3://geotiles\?endpoint=https://a7a8d6fc7e011ba0a1eb32259515cde6.r2.cloudflarestorage.com\&region=auto
```

### Adding allowed domains
For security purposes use allowed domains; go to your bucket settings *CORS Policy* and configure your `Allowed Origins`. Use this template.
```bash
{
  "AllowedOrigins": [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://ccalobeto.github.io"
  ],
  "AllowedMethods": [
    "GET",
    "HEAD"
  ],
  "AllowedHeaders": [
    "range",
    "if-match"
  ],
  "ExposeHeaders": [
    "etag"
  ],
  "MaxAgeSeconds": 3000
}
```

### Using the Bucket URL in your custom style
Once your *pmtiles* file is uploaded, go to your bucket settings *Public access/R2.dev subdomain*, copy the `Public R2.dev Bucket URL` and use it in the `key` property in your custom style.

### References
1. [A script to create a bucket and upload a file with `@aws-sdk/client-s3` library](https://www.youtube.com/watch?v=6Y_clyTpmAk) (done).

## Publishing a pmtile with MapLibre
### Basemaps for MapLibre
Remembert to use a basemap you need: 
- A pmtile (or tileset)
- A style
- A ontstack or glyphs
- A spritesheet or themes

MapLibre styles are JSON documents.

### Setup a Maplibre style
- Upload your pmtile into this [protomap tool](https://maps.protomaps.com/) and go to the address bar to get the zoom level and coordinates. You will use it as a initial calibration when you create an instance of the map with MapLibre. 

- Then select the `flavor` (theme) click `get style json` button and copy the generated file to clipboard.

- Save the copied into a file in the path `static/data/styles/<filename>.json`, then edit the `url` key with the `Public R2.dev Bucket URL` which is the location of your pmtile in *cloudfare*.

This is pe-style.json

```js
  "sources": {
    "protomaps": {
      "type": "vector",
      "attribution": "<a href=\"https://github.com/protomaps/basemaps\">Protomaps</a> © <a href=\"https://openstreetmap.org\">OpenStreetMap</a>",
      "url": "pmtiles://<Public R2.dev Bucket URL>/peru.pmtiles"
    }
  },
  ...
```

#### Use a custom maplibre style in your viz project
Go to your `src/routes/+page.svelte` import the style and use it.

#### Use of themes
You can also use `protomaps-themes-base` package to enhance your maplibre styles. Review [here](https://docs.protomaps.com/basemaps/maplibre).

## Reproduce the map
Execute
```bash
npm run dev
```
