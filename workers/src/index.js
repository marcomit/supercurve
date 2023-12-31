import { Hono } from "hono";
import { cors } from 'hono/cors';

const app = new Hono();
app.use('/*', cors());

app.get("/highscores", async (c) => {
	const { results } = await c.env.DB.prepare(`select score, user, timestamp from highscores order by score desc LIMIT 0, 10`).all();
	return c.json(results);
});

app.post("/highscores", async (c) => {
	const { user, score } = await c.req.json();

	if (!user || score == null) return c.status(422).text("Missing values");

	const { success } = await c.env.DB.prepare(`insert into highscores (user, score, timestamp) values (?, ?, ?)`)
		.bind(user, score, new Date().toISOString())
		.run();

	if (success) {
		const { results } = await c.env.DB.prepare(`select score, user, timestamp from highscores order by score desc LIMIT 0, 10`).all();
		return c.json(results);
	} else {
		c.status(500);
		return c.text("Something went wrong");
	}
});

export default app;
