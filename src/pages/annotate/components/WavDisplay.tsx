import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import { useWavesurfer } from "@wavesurfer/react";

const WavDisplay = ({
  videoRef,
  eventBoundary,
  setEventBoundary,
}: {
  videoRef: HTMLVideoElement;
  eventBoundary: number[];
  setEventBoundary: React.Dispatch<React.SetStateAction<number[]>>;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spectrogramRef = useRef<HTMLDivElement>(null);

  const regions = useMemo(() => RegionsPlugin.create(), []);

  const { wavesurfer, isReady } = useWavesurfer({
    container: containerRef,
    height: 100,
    waveColor: "rgb(200, 0, 200)",
    progressColor: "rgb(100, 0, 100)",
    plugins: useMemo(
      () => [
        regions,
        Timeline.create({
          style: {
            fontSize: "13px",
          },
        }),
      ],
      []
    ),
    media: videoRef,
  });

  useEffect(() => {
    wavesurfer?.registerPlugin(
      Spectrogram.create({
        container: spectrogramRef.current || undefined,
        height: 300, // FIXME: This won't work, height is always 64
        fftSamples: 1024,
        labels: true,
        scale: "mel",
        windowFunc: "hann",
      })
    );

    wavesurfer?.once("redrawcomplete", () => {
      regions.addRegion({
        start: eventBoundary[0],
        end: eventBoundary[1],
        content: "Resize / Drag me",
        color: "hsla(400, 100%, 30%, 0.1)",
        drag: true,
        resize: true,
      });
    });

    regions.on("region-updated", (region) => {
      region.start = Number(region.start.toFixed(2));
      region.end = Number(region.end.toFixed(2));
      setEventBoundary([region.start, region.end]);
    });
  }, [wavesurfer]);

  useEffect(() => {
    const [ region ] = regions.getRegions();
    if (
      region &&
      (region.start !== eventBoundary[0] || region.end !== eventBoundary[1])
    ) {
      region.setOptions({
        start: eventBoundary[0],
        end: eventBoundary[1],
      });
    }
  }, [eventBoundary]);

  return (
    <>
      <div ref={containerRef} />
      <div ref={spectrogramRef} />
    </>
  );
};

export default WavDisplay;
