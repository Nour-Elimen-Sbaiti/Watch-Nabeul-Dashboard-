from django.http import HttpResponse, Http404
from .models import RasterLayer
import rasterio
from rasterio.warp import reproject, Resampling
from rasterio.crs import CRS
from rasterio.transform import from_bounds
import mercantile
import numpy as np
from PIL import Image
import io


def get_tile(request, layer_id, z, x, y):
    try:
        layer = RasterLayer.objects.get(pk=layer_id)
    except RasterLayer.DoesNotExist:
        raise Http404

    tile_bounds = mercantile.bounds(x, y, z)

    with rasterio.open(layer.file.path) as src:
        dst_crs = CRS.from_epsg(4326)
        tile_width = tile_height = 256

        dst_transform = from_bounds(
            tile_bounds.west, tile_bounds.south,
            tile_bounds.east, tile_bounds.north,
            tile_width, tile_height
        )

        data = np.zeros((src.count, tile_height, tile_width), dtype=np.uint8)

        reproject(
            source=rasterio.band(src, list(range(1, src.count + 1))),
            destination=data,
            src_transform=src.transform,
            src_crs=src.crs,
            dst_transform=dst_transform,
            dst_crs=dst_crs,
            resampling=Resampling.bilinear,
        )

        nodata = src.nodata

    # Build RGBA image with transparency
    if data.shape[0] >= 3:
        rgb = np.moveaxis(data[:3], 0, -1)
        alpha = np.full((tile_height, tile_width), 255, dtype=np.uint8)

        # Make NoData pixels transparent
        if nodata is not None:
            mask = np.all(data[:3] == int(nodata), axis=0)
        else:
            # If no NoData defined, make black pixels transparent
            mask = np.all(data[:3] == 0, axis=0)

        alpha[mask] = 0
        rgba = np.dstack((rgb, alpha))
        img = Image.fromarray(rgba, 'RGBA')

    else:
        gray = data[0]
        alpha = np.full((tile_height, tile_width), 255, dtype=np.uint8)
        alpha[gray == 0] = 0
        rgba = np.dstack((gray, gray, gray, alpha))
        img = Image.fromarray(rgba.astype(np.uint8), 'RGBA')

    buf = io.BytesIO()
    img.save(buf, format='PNG')
    resp = HttpResponse(buf.getvalue(), content_type='image/png')
    # Allow cross-origin access for tile images (development)
    resp["Access-Control-Allow-Origin"] = "*"
    resp["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept"
    return resp