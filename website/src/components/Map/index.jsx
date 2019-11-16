/* eslint-disable max-len, no-underscore-dangle */
import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import styled from 'style'
import { hasWindow } from 'util/dom'
import { getCenterAndZoom } from './util'
import StyleSelector from './StyleSelector'

import { siteMetadata } from '../../../gatsby-config'

// This wrapper must be positioned relative for the map to be able to lay itself out properly
const Wrapper = styled.div`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  position: relative;
  flex: 1 0 auto;
`

const Map = ({
  width,
  height,
  zoom,
  center,
  bounds,
  padding,
  styles,
  sources,
  layers,
  minZoom,
  maxZoom,
}) => {
  const { mapboxToken } = siteMetadata

  if (!mapboxToken) {
    console.error(
      'ERROR: Mapbox token is required in gatsby-config.js siteMetadata'
    )
  }

  // if there is no window, we cannot render this component
  if (!hasWindow) {
    return null
  }

  // this ref holds the map DOM node so that we can pass it into Mapbox GL
  const mapNode = useRef(null)

  // this ref holds the map object once we have instantiated it, so that we
  // can use it in other hooks
  const mapRef = useRef(null)

  // construct the map within an effect that has no dependencies
  // this allows us to construct it only once at the time the
  // component is constructed.
  useEffect(() => {
    let mapCenter = center
    let mapZoom = zoom

    // If bounds are available, use these to establish center and zoom when map first loads
    if (bounds && bounds.length === 4) {
      const { center: boundsCenter, zoom: boundsZoom } = getCenterAndZoom(
        mapNode.current,
        bounds,
        padding
      )
      mapCenter = boundsCenter
      mapZoom = boundsZoom
    }

    // Token must be set before constructing map
    mapboxgl.accessToken = mapboxToken

    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: `mapbox://styles/mapbox/${styles[0]}`,
      center: mapCenter,
      zoom: mapZoom,
      minZoom,
      maxZoom,
    })
    mapRef.current = map
    window.map = map // for easier debugging and querying via console

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    if (styles.length > 1) {
      map.addControl(
        new StyleSelector({
          styles,
          token: mapboxToken,
        }),
        'bottom-left'
      )
    }

    // map.on('load', () => {
    //   console.log('map onload')
    //   // add sources
    //   Object.entries(sources).forEach(([id, source]) => {
    //     map.addSource(id, source)
    //   })

    //   // add layers
    //   layers.forEach(layer => {
    //     map.addLayer(layer)
    //   })
    // })

    map.on('load', function() {
      // Add a geojson point source.
      // Heatmap layers also work with a vector tile source.
      map.addSource('earthquakes', {
      "type": "geojson",
      // "data": "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
      "data": "https://v9qyepmcue.execute-api.eu-central-1.amazonaws.com/test"
      });
       
      map.addLayer({
      "id": "earthquakes-heat",
      "type": "heatmap",
      "source": "earthquakes",
      "maxzoom": 9,
      "paint": {
      // Increase the heatmap weight based on frequency and property magnitude
      "heatmap-weight": [
      "interpolate",
      ["linear"],
      ["get", "mag"],
      0, 0,
      6, 1
      ],
      // Increase the heatmap color weight weight by zoom level
      // heatmap-intensity is a multiplier on top of heatmap-weight
      "heatmap-intensity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0, 1,
      9, 3
      ],
      // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
      // Begin color ramp at 0-stop with a 0-transparancy color
      // to create a blur-like effect.
      "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0, "rgba(33,102,172,0)",
      0.2, "rgb(103,169,207)",
      0.4, "rgb(209,229,240)",
      0.6, "rgb(253,219,199)",
      0.8, "rgb(239,138,98)",
      1, "rgb(178,24,43)"
      ],
      // Adjust the heatmap radius by zoom level
      "heatmap-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0, 2,
      9, 20
      ],
      // Transition from heatmap to circle layer by zoom level
      "heatmap-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      7, 1,
      9, 0
      ],
      }
      }, 'waterway-label');
       
      map.addLayer({
      "id": "earthquakes-point",
      "type": "circle",
      "source": "earthquakes",
      "minzoom": 7,
      "paint": {
      // Size circle radius by earthquake magnitude and zoom level
      "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      7, [
      "interpolate",
      ["linear"],
      ["get", "mag"],
      1, 1,
      6, 4
      ],
      16, [
      "interpolate",
      ["linear"],
      ["get", "mag"],
      1, 5,
      6, 50
      ]
      ],
      // Color circle by earthquake magnitude
      "circle-color": [
      "interpolate",
      ["linear"],
      ["get", "mag"],
      1, "rgba(33,102,172,0)",
      2, "rgb(103,169,207)",
      3, "rgb(209,229,240)",
      4, "rgb(253,219,199)",
      5, "rgb(239,138,98)",
      6, "rgb(178,24,43)"
      ],
      "circle-stroke-color": "white",
      "circle-stroke-width": 1,
      // Transition from heatmap to circle layer by zoom level
      "circle-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      7, 0,
      8, 1
      ]
      }
      }, 'waterway-label');
      });

    // hook up map events here, such as click, mouseenter, mouseleave
    // e.g., map.on('click', (e) => {})

    // when this component is destroyed, remove the map
    return () => {
      map.remove()
    }
  }, [])

  // You can use other `useEffect` hooks to update the state of the map
  // based on incoming props.  Just beware that you might need to add additional
  // refs to share objects or state between hooks.

  return (
    <Wrapper width={width} height={height}>
      <div ref={mapNode} style={{ width: '100%', height: '100%' }} />
      {/* <StyleSelector map={mapRef.current} styles={styles} token={mapboxToken} /> */}
    </Wrapper>
  )
}

Map.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
  bounds: PropTypes.arrayOf(PropTypes.number),
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  styles: PropTypes.arrayOf(PropTypes.string),
  padding: PropTypes.number,
  sources: PropTypes.object,
  layers: PropTypes.arrayOf(PropTypes.object),
}

Map.defaultProps = {
  width: 'auto',
  height: '100%',
  center: [0, 0],
  zoom: 0,
  bounds: null,
  minZoom: 0,
  maxZoom: 24,
  styles: ['light-v9', 'dark-v9', 'streets-v11'],
  padding: 0.1, // padding around bounds as a proportion
  sources: {},
  layers: [],
}

export default Map
