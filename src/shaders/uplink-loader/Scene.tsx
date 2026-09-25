import { UplinkLoader } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export function Scene() {
  return (
    <div className="shader-frame w-full h-full absolute inset-0 overflow-hidden pointer-events-auto">
      <UplinkLoader />
    </div>
  );
}
