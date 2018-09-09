const puppeteer = require('puppeteer');

const { WebClient } = require('@slack/client');
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
];


checks.forEach((check) => {
  (async () => {
    var browser = await puppeteer.launch();

    var page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

    await page.goto(check.url);
    var overlay = await page.$(check.selector);
    var screenshot = await overlay.screenshot();

    var dt = new Date()
    var name = check.name + " " + dt.toLocaleDateString() + " " + dt.toLocaleTimeString();
    slack.files.upload({
      filename: name,
      channels: channelNames,
      file: screenshot,
    }).then((res) => {
      console.log(res);
    }).catch(console.error);

    await browser.close();

  })()
})