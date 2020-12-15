const xlsx = require("xlsx");
const workbook = xlsx.readFile(__dirname + "/" + "file.xlsx");

function readXlsx(req, res, next) {
  let sheet = workbook.SheetNames;
  let longTermData = [];
  let shortTermData = [];
  let pieChartData = [];
  sheet.forEach((y) => {
    let worksheet = workbook.Sheets[y];
    let headers = {};

    for (let z in worksheet) {
      if (z[0] === "!") continue;
      let col = z.substring(0, 1);
      let row = parseInt(z.substring(1));
      let value = worksheet[z].v;

      if (row == 2 && col <= "E") {
        headers[col] = value;
      }
      if (row == 2 && col > "F" && col < "L") {
        headers[col] = value;
      }
      if (row == 2 && col >= "M" && col < "O") {
        headers[col] = value;
        console.log(col, row);
      }
      if (!longTermData[row]) longTermData[row] = {};
      if (!shortTermData[row]) shortTermData[row] = {};
      if (!pieChartData[row]) pieChartData[row] = {};
      if (col <= "E") {
        longTermData[row][headers[col]] = value;
      }
      if (col > "F" && col < "L") {
        shortTermData[row][headers[col]] = value;
      }
      if (col >= "M" && col < "O") {
        pieChartData[row][headers[col]] = value;
      }
    }
    // console.log(longTermData, shortTermData, pieChartData);
  });
  longTermData.shift();
  longTermData.shift();
  longTermData.shift();
  longTermData.pop();
  shortTermData.shift();
  shortTermData.shift();
  shortTermData.shift();
  shortTermData.pop();
  shortTermData.pop();
  pieChartData.shift();
  pieChartData.shift();
  pieChartData.shift();

  req.body.longTermData = longTermData;
  req.body.shortTermData = shortTermData;
  req.body.pieChartData = pieChartData;
  next();
}

module.exports = {
  readXlsx,
};
