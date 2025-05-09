declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  const src: string;
  export default src;
}

//Purpose: TypeScript doesn't natively know how to handle SVG files when they're imported in code. This declaration file tells TypeScript what to expect when you import an SVG.
