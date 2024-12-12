import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import WaveSurfer from "wavesurfer.js";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import { useWavesurfer } from "@wavesurfer/react";
import { Skeleton, Space } from "antd";

const WavDisplay = ({ videoRef }: { videoRef: HTMLVideoElement }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spectrogramRef = useRef<HTMLDivElement>(null);

  const [isWavReady, setIsWavReady] = useState(false);

  const plugins =
  useMemo(
    () => [
      Timeline.create({
        style: {
          fontSize: "13px",
        }
      }),
      RegionsPlugin.create(),
      Spectrogram.create({
        container: spectrogramRef.current || undefined,
        labels: true,
        height: 600,
      }),
    ],
    []
  );

  const { wavesurfer, isReady } = useWavesurfer({
    container: containerRef,
    height: 100,
    waveColor: "rgb(200, 0, 200)",
    progressColor: "rgb(100, 0, 100)",
    plugins: plugins,
    media: videoRef,
  });

  useEffect(() => {
    console.log(`isReady: ${isReady}`);
  }, [isReady]);

  return (
    <div style={{
      height: 300,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}>
      <div ref={containerRef} />
      <div ref={spectrogramRef} />
    </div>
  );
};

export default WavDisplay;
