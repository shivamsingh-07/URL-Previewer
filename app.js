const ejs = require("ejs");
const puppeteer = require("puppeteer");
const express = require("express");
const app = express();

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
	if (!req.query.url) res.render("index", { data: null });
	else {
		// Fetching Process
		let url = "http://" + req.query.url;
		let browser = await puppeteer.launch();
		let webpage = await browser.newPage();

		console.log("Fetching Data...");
		await webpage.goto(url, { waitUntil: "networkidle2" });

		let data = await webpage.evaluate(() => {
			var metas = document.getElementsByTagName("meta");
			var name, title, desc, img;

			for (var meta of metas) {
				if (meta.getAttribute("property") === "og:site_name") {
					name = meta.getAttribute("content");
				}
				if (meta.getAttribute("property") === "og:title") {
					title = meta.getAttribute("content");
				}
				if (meta.getAttribute("property") === "og:description") {
					desc = meta.getAttribute("content");
				}
				if (meta.getAttribute("property") === "og:image") {
					img = meta.getAttribute("content");
				}
			}

			var links = document.getElementsByTagName("link");
			for (var link of links) {
				if (!img && link.getAttribute("rel") === "icon") {
					img = link.getAttribute("href");
				}
			}

			return {
				name,
				title,
				desc,
				img
			};
		});

		console.log("Data Recieved!");
		data.url = url;
		res.render("index", { data: data });
		await browser.close();
	}
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Listening at " + port + "..."));
