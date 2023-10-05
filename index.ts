import { serve } from 'bun';
import { Hono, Context } from 'hono'
import { cors } from 'hono/cors'
import { runInNewContext } from "node:vm";

async function convertLog(ctx: Context) {
    const payload = await ctx.req.parseBody();
    if (!payload.code) return new Response(null, { status: 400 });

    try {
        const result = runInNewContext(payload.code as string);
        const response = `<p style="font-weight:bold;padding:8px;">${result.toString()}</p>`
        return new Response(response);
    } catch (error: any) {
        const response = `<p style="color:red;font-weight:bold;">${error.toString()}</p>`
        return new Response(response);
    }
}

const app = new Hono()

app.use('*',
    cors({
        origin: [process.env.ORIGIN ?? ""],
        allowMethods: ['GET', 'POST'],
        allowHeaders: ['hx-target', 'hx-request', 'hx-current-url'],
    })
)

app.post('/log', convertLog)

serve({ fetch: app.fetch, port: process.env.PORT })
