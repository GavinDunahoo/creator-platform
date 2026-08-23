interface Env {
  VIDEOS: R2Bucket;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/media/bodycam1.mp4") {
      const object = await env.VIDEOS.get("cam/bodycam1.mp4");

      if (!object) {
        return new Response("Video not found", {
          status: 404,
        });
      }

      return new Response(object.body, {
        headers: {
          "Content-Type": "video/mp4",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
