const puppeteer = require('puppeteer');

const { WebClient } = require('@slack/client');
const slack = new WebClient(process.env.SLACK_TOKEN);

const checks = [
  {
    name: "Riksdag",
    url: "https://data.val.se/val/val2018/valnatt/R/rike/index.html",
    selector: "#sida > div:nth-child(4) > table",
  },
  {
    name: "Göteborg",
    url: "https://data.val.se/val/val2018/valnatt/K/kommun/14/80/index.html",
    selector: "#sida > div:nth-child(4) > table",
  },
];


checks.forEach((check) => {
  (async () => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

    await page.goto(check.url);
    const overlay = await page.$(check.selector);
    const screenshot = await overlay.screenshot();

    const dt = new Date();
    const name = check.name + " " + dt.toLocaleDateString() + " " + dt.toLocaleTimeString();
    slack.files.upload({
      filename: name,
      channels: "#radhuset",
      file: screenshot,
    }).then((res) => {
      console.log(res);
    }).catch(console.error);

    await browser.close();

  })()
});