---

# Shodan-Grabber

Shodan-Grabber is a Node.js tool for scraping IP addresses and other information from Shodan's web interface. It utilizes Puppeteer for web scraping and handles rate limits by implementing retries with delays. The tool can run multiple scraping tasks in parallel and outputs the data to text files.

## Features

- Scrapes IP addresses and details based on categories specified by Shodan.
- Batches multiple tasks with a limit on parallel execution.
- Detects rate limiting and automatically retries after a delay.
- Customizable search query via command-line arguments.
- Colorful, hacker-themed output using [Chalk](https://github.com/chalk/chalk).

## Requirements

- **Node.js** v16 or higher
- **Puppeteer** for browser automation
- **Chalk** for colorful console output

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ethicalhackingplayground/shodan-grabber.git
   cd shodan-grabber
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Usage

To run Shodan-Grabber, specify your search query using the `--query` argument.

```bash
node index.js --query="example.com"
```

### Example

```bash
node index.js --query="bmw.com"
```

This command will scrape IPs and related data for categories associated with "bmw.com" from Shodan and save the output into separate files in the `output` directory.

### Options

- **--query**: Required. Specify the search query for Shodan.

## Output

Results are saved in the `output` directory, where each category gets its own `.txt` file.

Example structure:

```
output/
├── asn.txt
├── bitcoin.ip.txt
├── country.txt
└── http.title.txt
```

Each file contains the scraped IPs and other details as plain text.

## Configuration

### Customize Parallel Tasks and Retry Delay

You can customize the following constants in `index.js`:

- `MAX_PARALLEL`: The maximum number of parallel tasks (default is `10`).
- `RETRY_DELAY_MS`: The delay in milliseconds before retrying when rate-limited (default is `30000`).

### Future Plans

In the future, Shodan-Grabber may be ported to GoLang or Rust to improve performance and reduce the dependency on Node.js.

## Contributing

Feel free to open issues or submit pull requests. Contributions are welcome!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
