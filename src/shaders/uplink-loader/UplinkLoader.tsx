import { useState, useEffect, type CSSProperties } from "react";

import uplinkLoaderSource from "./uplink-loader.html?raw";

export { ElementsCollection } from "../elements/ElementsBackground";

export type UplinkLoaderProps = {
  className?: string;
  style?: CSSProperties;
  onComplete?: () => void;
  onProgress?: (progress: number, phase: string) => void;
};

export function UplinkLoader({ className = "", style, onComplete, onProgress }: UplinkLoaderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'uplink-progress') {
        onProgress?.(e.data.progress, e.data.phase);
      } else if (e.data?.type === 'uplink-complete') {
        onComplete?.();
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, [onComplete, onProgress]);

  return (
    <div
      className={`uplink-loader${className ? ` ${className}` : ""}`}
      data-state={ready ? "ready" : "loading"}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "transparent",
        ...style,
      }}
    >
      <iframe
        title="Uplink progress loader"
        srcDoc={uplinkLoaderSource}
        sandbox="allow-scripts"
        loading="eager"
        onLoad={() => setReady(true)}
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
          background: "transparent",
        }}
      />
    </div>
  );
}

