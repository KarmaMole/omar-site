import type React from "react";
import { RootLayout } from "@payloadcms/next/layouts";
import { importMap } from "./admin/importMap";
import config from "@payload-config";
import "@payloadcms/next/css";
import "./custom.scss";

type Args = {
  children: React.ReactNode;
};

const serverFunction: import("payload").ServerFunctionClient = async function (
  args
) {
  "use server";
  const { handleServerFunctions, payloadServerFunction } = await import(
    "@payloadcms/next/utilities"
  );
  return handleServerFunctions({
    args,
    configPromise: config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
);

export default Layout;
