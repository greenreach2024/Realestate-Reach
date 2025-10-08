# OpenStreetMap / ArcGIS / Vancouver Open Data Portal — Quick References

## OpenStreetMap

- **Tag semantics for `place=neighbourhood` (and the broader [`Key:place`](https://wiki.openstreetmap.org/wiki/Key:place))**  
  Consult the OpenStreetMap wiki for the `Key:place` entry to understand how neighbourhoods fit within the place hierarchy, typical tagging practices (e.g., `name`, `name:xx` for language variants, `wikidata` links), and guidance on when to use `place=neighbourhood` versus `place=suburb` or `place=quarter`.
- **Overpass API examples for neighbourhood queries (bounded to a city)**  
  Example query:  
  ```
  [out:json][timeout:120];
  area["name"="Toronto"]["boundary"="administrative"]["admin_level"="8"]->.searchArea;
  (
    node["place"="neighbourhood"](area.searchArea);
    way["place"="neighbourhood"](area.searchArea);
    relation["place"="neighbourhood"](area.searchArea);
  );
  out geom;
  ```  
  Replace the city name and `admin_level` as needed for other municipalities. Use [overpass-turbo.eu](https://overpass-turbo.eu/) to run and export results (GeoJSON, KML, etc.).
- **Geofabrik extracts for bulk ingest**  
  Download regional `.pbf` extracts from [Geofabrik](https://download.geofabrik.de/) for Canada, Ontario, or British Columbia. These weekly-updated files allow offline processing via tools like `osmium`, `osmium-tool`, or `osm2pgsql`. Leverage the "subregions" folder for provincial subsets, or the "other" folder for specialized cuts if the default boundaries do not match your needs.

## ArcGIS

- **ArcGIS Living Atlas entry point**  
  Access the [Living Atlas of the World](https://livingatlas.arcgis.com/en/home/) to browse curated, authoritative layers (base maps, demographics, infrastructure). Use the search filters for region, content type, and publisher to surface municipal or national datasets relevant to Canadian cities.
- **Canada Content Dashboard**  
  Esri Canada's [Content Dashboard](https://canadacontent.maps.arcgis.com/home/item.html?id=9f5a2f35b4774aaeb43d3eb531ede797) highlights new and updated Canadian-hosted ArcGIS Online items, including census, boundaries, and infrastructure layers. Bookmark for periodic review to stay current on additions that might enhance neighbourhood analytics.
- **Toronto Neighbourhoods feature layer**  
  The City of Toronto maintains an authoritative neighbourhood boundary layer on ArcGIS Online: [Neighbourhoods (City of Toronto)](https://services.arcgis.com/S9th0jAJ7bqgIRjw/ArcGIS/rest/services/Neighbourhoods/FeatureServer). Use the REST endpoint for programmatic access (GeoJSON, FeatureServer queries) or add it directly into ArcGIS Pro, QGIS (via ArcGIS REST connector), or web maps.

## Vancouver Open Data Portal

- **Local area boundary dataset overview**  
  Visit the [Local Area Boundary](https://opendata.vancouver.ca/explore/dataset/local-area-boundary/information/) dataset page for summary metadata. The 22 official local areas are stable administrative neighbourhoods used by the City of Vancouver; review the "Description" and "Attribution" sections for context and usage rights.
- **Export view for GeoJSON/CSV downloads**  
  Use the [Export](https://opendata.vancouver.ca/explore/dataset/local-area-boundary/export/) tab to download data in GeoJSON, Shapefile, CSV, and other formats. Apply filters or select specific fields before exporting to streamline downstream processing.
- **Tabular preview for field inspection**  
  The [Explore Data](https://opendata.vancouver.ca/explore/dataset/local-area-boundary/table/) tab offers a sortable table view; use it to inspect field names (e.g., `name`, `area_km2`, `geo_point_2d`) and sample values prior to integrating the dataset into ETL pipelines or analytics workflows.
