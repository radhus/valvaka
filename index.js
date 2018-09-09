const puppeteer = require('puppeteer');

const {WebClient} = require('@slack/client');
const slack = new WebClient(process.env.SLACK_TOKEN);
const channelNames = process.env.CHANNEL_NAMES;

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
  {
    name: "Lund",
    url: "https://data.val.se/val/val2018/valnatt/K/kommun/12/81/index.html",
    selector: "#sida > div:nth-child(4) > table",
  },
];

puppeteer.launch().then(async (browser) => {
  const promises = checks.map(
    (check) => browser.newPage().then(async (page) => {
      await page.setViewport({width: 1200, height: 800, deviceScaleFactor: 2});

      await page.goto(check.url, {timeout: 300000});
      const overlay = await page.$(check.selector);
      const screenshot = await overlay.screenshot();

      const dt = new Date();
      const name = check.name + " " + dt.toLocaleDateString() + " " + dt.toLocaleTimeString();

      await slack.files.upload({
        filename: name,
        channels: channelNames,
        file: screenshot,
      });
    }).catch(error => console.error)
  );

  await Promise.all(promises);
  await browser.close();
});
