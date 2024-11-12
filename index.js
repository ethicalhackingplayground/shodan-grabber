const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const minimist = require("minimist");
(async () => {
  const chalk = (await import("chalk")).default;

  // Parse arguments
  const args = minimist(process.argv.slice(2));
  const query = args.query;

  if (!query) {
    console.error(
      chalk.red("⚠️  Please specify a query with the --query argument.")
    );
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync("output")) {
    fs.mkdirSync("output");
  }

  // List of different categories
  const categories = [
    "asn",
    "bitcoin.ip",
    "bitcoin.ip_count",
    "bitcoin.port",
    "bitcoin.user_agent",
    "bitcoin.version",
    "city",
    "cloud.provider",
    "cloud.region",
    "cloud.service",
    "country",
    "cpe",
    "device",
    "domain",
    "has_screenshot",
    "hash",
    "http.component",
    "http.component_category",
    "http.favicon.hash",
    "http.headers_hash",
    "http.html_hash",
    "http.robots_hash",
    "http.status",
    "http.title",
    "http.waf",
    "ip",
    "isp",
    "link",
    "mongodb.database.name",
    "ntp.ip",
    "ntp.ip_count",
    "ntp.more",
    "ntp.port",
    "org",
    "os",
    "port",
    "postal",
    "product",
    "redis.key",
    "region",
    "rsync.module",
    "screenshot.hash",
    "screenshot.label",
    "snmp.contact",
    "snmp.location",
    "snmp.name",
    "ssh.cipher",
    "ssh.fingerprint",
    "ssh.hassh",
    "ssh.mac",
    "ssh.type",
    "ssl.alpn",
    "ssl.cert.alg",
    "ssl.cert.expired",
    "ssl.cert.extension",
    "ssl.cert.fingerprint",
    "ssl.cert.issuer.cn",
    "ssl.cert.pubkey.bits",
    "ssl.cert.pubkey.type",
    "ssl.cert.serial",
    "ssl.cert.subject.cn",
    "ssl.chain_count",
    "ssl.cipher.bits",
    "ssl.cipher.name",
    "ssl.cipher.version",
    "ssl.ja3s",
    "ssl.jarm",
    "ssl.version",
    "state",
    "tag",
    "telnet.do",
    "telnet.dont",
    "telnet.option",
    "telnet.will",
    "telnet.wont",
    "uptime",
    "version",
    "vuln",
    "vuln.verified",
  ];

  // Max parallel tasks and delay between retries
  const MAX_PARALLEL = 10;
  const RETRY_DELAY_MS = 30000;

  async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  (async () => {
    const browser = await puppeteer.launch();

    // Function to process a single category
    async function processCategory(category) {
      const page = await browser.newPage();
      const url = `https://www.shodan.io/search/facet?query=${encodeURIComponent(
        query
      )}&facet=${category}`;

      let response;
      let retries = 0;

      // Retry loop to handle rate limiting
      while (retries < 3) {
        response = await page.goto(url);

        // Check if we received a 200 response
        if (response && response.status() === 200) {
          console.log(
            chalk.greenBright(
              `✔️  Successfully retrieved data for ${chalk.cyanBright(
                category
              )}`
            )
          );
          break;
        } else {
          console.log(
            chalk.yellow(
              `⏳ Rate limit detected for ${chalk.magenta(
                category
              )}. Retrying in ${RETRY_DELAY_MS / 1000} seconds...`
            )
          );
          retries++;
          await delay(RETRY_DELAY_MS);
        }
      }

      // Scrape IPs from the page
      const cat = await page.evaluate(() => {
        const catElements = document.querySelectorAll("strong");
        return Array.from(catElements).map((e) =>
          e.innerHTML.replace(/["']/g, "")
        );
      });

      if (cat.length === 0) {
        console.error(
          chalk.redBright(
            `❌ Failed to retrieve data for ${chalk.cyan(category)}`
          )
        );
        await page.close();
        return;
      }

      // Save IPs to file
      const filePath = path.join("output", `${category}.txt`);
      fs.writeFileSync(filePath, cat.join("\n"));

      console.log(
        chalk.bold.green(
          `💾 data for ${chalk.cyanBright(category)} saved to ${chalk.underline(
            filePath
          )}`
        )
      );
      await page.close();
    }

    // Process categories in batches of MAX_PARALLEL
    console.log(
      chalk.blueBright("\n🚀 Starting multithreaded Shodan scraping...\n")
    );
    for (let i = 0; i < categories.length; i += MAX_PARALLEL) {
      const batch = categories.slice(i, i + MAX_PARALLEL);
      await Promise.all(batch.map((category) => processCategory(category)));
    }

    console.log(
      chalk.greenBright("\n🎉 All tasks completed! Closing browser...\n")
    );
    await browser.close();
  })();
})();
