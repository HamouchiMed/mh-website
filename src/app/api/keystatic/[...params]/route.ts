import { makeRouteHandler } from "@keystatic/next/route-handler";
import config, { useGithub } from "../../../../../keystatic.config";

const handler = makeRouteHandler({ config });
const enabled = process.env.NODE_ENV !== "production" || useGithub;
const disabled = () => new Response("Not found", { status: 404 });

export const GET = enabled ? handler.GET : disabled;
export const POST = enabled ? handler.POST : disabled;
