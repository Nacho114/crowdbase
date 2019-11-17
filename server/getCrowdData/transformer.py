
DEVICE_ID_TO_LOC = {
    'pi1': [6.562143, 46.518774, 0],
    'pi2': [6.561868, 46.518270, 0],
    'pi3': [6.563111, 46.518574, 0]
}

GET_STATS = {
    'pi1': [20, 6],
    'pi2': [20, 6],
    'pi3': [20, 6]
}


def to_geojson_format(item):
    
    count = item['count']
    timestamp = item['timestamp']
    deviceId = item['deviceId']
    
    location = DEVICE_ID_TO_LOC[deviceId]
    
    # avg_count, std_div_count = GET_STATS[deviceId]
    # import random
    # mag = random.randint(0, 6)#abs(count - avg_count) / std_div_count
    mag = count
    
    geo_item = {}
    geo_item['type'] = 'Feature'
    
    geo_item['properties'] = { "id": deviceId, "mag": mag, "time": timestamp, "felt": None, "tsunami": 0 }
    
    geo_item['geometry'] = { "type": "Point", "coordinates": location }
    
    return geo_item
    
    
def transform_to_geojson(items):
    
    geojson_items = {}
    
    geojson_items['type'] = "FeatureCollection"
    
    geojson_items['crs'] = { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } }
    
    
    geojson_items['features'] = []
    
    for item in items:
        geo_item = to_geojson_format(item)
        geojson_items['features'].append(geo_item)
        
    return geojson_items