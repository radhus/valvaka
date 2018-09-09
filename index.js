const puppeteer = require('puppeteer');

const { WebClient } = require('@slack/client');
const slack = new WebClient(process.env.SLACK_TOKEN);
const channelNames = process.env.CHANNEL_NAMES;

const checks = [
  {
    name: "Göteborg",
    url: "https://valresultat.svt.se/2018/31480.html",
    selector: "#scroll31480 > section.val_result-section.val_is-Kommunval > div.val_result-bars_and_map > section",
    evaluate: () => {
      document.querySelector('.val_result-bars-new--toggle-menu').remove()
    }
  },
  {
    name: "Lund",
    url: "https://valresultat.svt.se/2018/31281.html",
    selector: "#scroll31281 > section.val_result-section.val_is-Kommunval > div.val_result-bars_and_map > section",
    evaluate: () => {
      document.querySelector('.val_result-bars-new--toggle-menu').remove()
    }
  },
];

puppeteer.launch().then(async (browser) => {
  const promises = checks.map(
    ({ url, name, selector, evaluate }) => browser.newPage().then(async (page) => {
      await page.setViewport({width: 1200, height: 800, deviceScaleFactor: 2});
      await page.goto(url, {timeout: 300000});
      const overlay = await page.$(selector);

      if (evaluate !== undefined) {
        await page.evaluate(evaluate);
      }

      const screenshot = await overlay.screenshot();

      const dt = new Date();
      await slack.files.upload({
        filename: name + " " + dt.toLocaleDateString() + " " + dt.toLocaleTimeString(),
        channels: channelNames,
        file: screenshot,
      });
    }).catch(console.error)
  );

  await Promise.all(promises);
  await browser.close();
});
