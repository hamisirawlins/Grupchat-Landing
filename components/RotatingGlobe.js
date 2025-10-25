"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set your Mapbox access token from environment
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const RotatingGlobe = ({
  center = [0, 0],
  zoom = 2.0,
  pitch = 10,
  styleUrl = "mapbox://styles/mapbox/satellite-v9",
  spinSpeedDegPerSec = 2,
}) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Mapbox map
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: center,
      zoom: zoom,
      pitch: pitch,
      projection: "globe",
      cooperativeGestures: false,
      interactive: false,
    });

    mapRef.current = map;

    map.on("style.load", () => {
      map.setFog({});

      // Hide labels (cities, countries, POIs) by turning off symbol layers
      const style = map.getStyle();
      if (style?.layers) {
        for (const layer of style.layers) {
          // Most label layers are of type 'symbol' in Mapbox styles
          if (layer.type === "symbol") {
            map.setLayoutProperty(layer.id, "visibility", "none");
          }
        }
      }
    });

    map.on("load", () => {});

    map.on("error", (e) => {});

    // Start spinning animation
    let last = performance.now();
    let spinning = true;
    const speed = spinSpeedDegPerSec;
    const loop = (t) => {
      if (!spinning) return;
      const d = (t - last) / 1000;
      last = t;

      const current = map.getCenter();
      let nextLng = current.lng + d * speed;
      if (nextLng > 180) nextLng -= 360;
      if (nextLng < -180) nextLng += 360;
      map.setCenter([nextLng, 0]);
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);

    // Cleanup function
    return () => {
      spinning = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [center, zoom, pitch, styleUrl, spinSpeedDegPerSec]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    />
  );
};

export default RotatingGlobe;
