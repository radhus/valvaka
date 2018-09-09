const puppeteer = require('puppeteer');

const {WebClient} = require('@slack/client');
const slack = new WebClient(process.env.SLACK_TOKEN);
const channelNames = process.env.CHANNEL_NAMES;

const checks = [
  {
    name: "Göteborg",
    url: "https://valresultat.svt.se/2018/31480.html",
    selector: "#scroll31480 > section.val_result-section.val_is-Kommunval > div.val_result-bars_and_map > section",
  },
  {
    name: "Lund",
    url: "https://valresultat.svt.se/2018/31281.html",
    selector: "#scroll31281 > section.val_result-section.val_is-Kommunval > div.val_result-bars_and_map > section",
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
