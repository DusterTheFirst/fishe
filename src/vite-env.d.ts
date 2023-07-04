/// <reference types="vite/client" />

declare module "*.glb" {
    const path: string;
    export default path;
}