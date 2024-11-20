import chalk from "chalk";
import dayjs from "dayjs";

// Method to color mapping
const methodColors = {
  GET: chalk.green,
  POST: chalk.yellowBright,
  PUT: chalk.blueBright,
  PATCH: chalk.hex("#8F00FF"),
  DELETE: chalk.hex("#FFA500"),
};

// Function to get color based on status code
function colorByStatusCode(statusCode) {
  if (statusCode >= 200 && statusCode < 300) {
    return chalk.green;
  } else if (statusCode >= 300 && statusCode < 400) {
    return chalk.yellow;
  } else if (statusCode >= 400) {
    return chalk.red;
  } else {
    return chalk.reset;
  }
}

export default function logger(req, res, next) {
  const timestamp = dayjs().format("DD-MM-YYYY, hh:mm:ss A");
  const route = req.originalUrl || req.url;
  const method = methodColors[req.method]
    ? methodColors[req.method](req.method)
    : chalk.gray(req.method);

  // Capture the original response object's end method
  const originalEnd = res.end;

  // Override the response object's end method to capture response code
  res.end = function (...args) {
    const responseCode = res.statusCode;
    const coloredStatusCode = colorByStatusCode(responseCode)(responseCode);
    const logMessage = `${chalk.gray(timestamp)} - ${method} - ${chalk.blue(
      route
    )} - ${coloredStatusCode}`;

    console.log(logMessage);

    // Call the original end method
    originalEnd.apply(res, args);
  };

  next();
}
