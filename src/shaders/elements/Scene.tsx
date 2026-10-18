import { ElementsCollection } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export interface SceneProps {
  mark?: "openai" | "n";
  opacity?: number;
}

export function Scene({ mark = "n", opacity = 1.00 }: SceneProps) {
  return (
    <div className="shader-frame w-full h-full absolute inset-0 overflow-hidden pointer-events-auto">
      <ElementsCollection
        variant="water"
        speed={1.00}
        size={1.00}
        particleAmount={1.00}
        hue={0}
        saturation={1.00}
        brightness={1.00}
        opacity={opacity}
        mark={mark}
      />
    </div>
  );
}
