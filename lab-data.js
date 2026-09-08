// ---------------------------------------------------------------------------
// Lab data — the rows every interactive widget in the Excel lessons runs on.
//
// The lessons quote real figures from the full 9,994-row Sample Superstore
// file. Widgets can't ship 9,994 rows, and faking the full totals would teach
// numbers the learner can't check. So the interactive pieces use this 32-row
// *practice extract* instead: same columns, same column letters, same shapes
// (four regions, three categories, discounts, a few loss-making rows), small
// enough that a learner can verify any result by reading the grid.
//
// Column letters match the real import exactly, so `R` really is Sales and
// `M` really is Region — the formulas printed in the lessons work here too.
// ---------------------------------------------------------------------------

export const COLUMNS = [
  { key: "A", name: "Row ID", type: "num" },
  { key: "B", name: "Order ID", type: "text" },
  { key: "C", name: "Order Date", type: "date" },
  { key: "D", name: "Ship Date", type: "date" },
  { key: "E", name: "Ship Mode", type: "text" },
  { key: "F", name: "Customer ID", type: "text" },
  { key: "G", name: "Customer Name", type: "text" },
  { key: "H", name: "Segment", type: "text" },
  { key: "I", name: "Country", type: "text" },
  { key: "J", name: "City", type: "text" },
  { key: "K", name: "State", type: "text" },
  { key: "L", name: "Postal Code", type: "num" },
  { key: "M", name: "Region", type: "text" },
  { key: "N", name: "Product ID", type: "text" },
  { key: "O", name: "Category", type: "text" },
  { key: "P", name: "Sub-Category", type: "text" },
  { key: "Q", name: "Product Name", type: "text" },
  { key: "R", name: "Sales", type: "money" },
  { key: "S", name: "Quantity", type: "num" },
  { key: "T", name: "Discount", type: "pct" },
  { key: "U", name: "Profit", type: "money" },
];

export const COL_BY_KEY = Object.fromEntries(COLUMNS.map((c) => [c.key, c]));

// Compact row form keeps the source readable: the order matches COLUMNS with
// Country and Product Name dropped (they never vary / never matter here) and
// filled back in when the rows are expanded below.
// [id, orderId, orderDate, shipDate, shipMode, custId, custName, segment,
//  city, state, zip, region, prodId, category, subCat, sales, qty, disc, profit]
const RAW = [
  [1,"CA-2016-152156","2016-11-08","2016-11-11","Second Class","CG-12520","Claire Gute","Consumer","Henderson","Kentucky",42420,"South","FUR-BO-10001798","Furniture","Bookcases",261.96,2,0,41.91],
  [2,"CA-2016-152156","2016-11-08","2016-11-11","Second Class","CG-12520","Claire Gute","Consumer","Henderson","Kentucky",42420,"South","FUR-CH-10000454","Furniture","Chairs",731.94,3,0,219.58],
  [3,"CA-2016-138688","2016-06-12","2016-06-16","Second Class","DV-13045","Darrin Van Huff","Corporate","Los Angeles","California",90036,"West","OFF-LA-10000240","Office Supplies","Labels",14.62,2,0,6.87],
  [4,"US-2015-108966","2015-10-11","2015-10-18","Standard Class","SO-20335","Sean O'Donnell","Consumer","Fort Lauderdale","Florida",33311,"South","FUR-TA-10000577","Furniture","Tables",957.58,5,0.45,-383.03],
  [5,"US-2015-108966","2015-10-11","2015-10-18","Standard Class","SO-20335","Sean O'Donnell","Consumer","Fort Lauderdale","Florida",33311,"South","OFF-ST-10000760","Office Supplies","Storage",22.37,2,0.2,2.52],
  [6,"CA-2014-115812","2014-06-09","2014-06-14","Standard Class","BH-11710","Brosina Hoffman","Consumer","Los Angeles","California",90032,"West","FUR-FU-10001487","Furniture","Furnishings",48.86,7,0,14.17],
  [7,"CA-2014-115812","2014-06-09","2014-06-14","Standard Class","BH-11710","Brosina Hoffman","Consumer","Los Angeles","California",90032,"West","OFF-AR-10002833","Office Supplies","Art",7.28,4,0,1.97],
  [8,"CA-2014-115812","2014-06-09","2014-06-14","Standard Class","BH-11710","Brosina Hoffman","Consumer","Los Angeles","California",90032,"West","TEC-PH-10002275","Technology","Phones",907.15,6,0.2,90.72],
  [9,"CA-2014-115812","2014-06-09","2014-06-14","Standard Class","BH-11710","Brosina Hoffman","Consumer","Los Angeles","California",90032,"West","OFF-BI-10003910","Office Supplies","Binders",18.50,3,0.2,5.78],
  [10,"CA-2014-115812","2014-06-09","2014-06-14","Standard Class","BH-11710","Brosina Hoffman","Consumer","Los Angeles","California",90032,"West","OFF-AP-10002892","Office Supplies","Appliances",114.90,5,0,34.47],
  [11,"CA-2014-115812","2014-06-09","2014-06-14","Standard Class","BH-11710","Brosina Hoffman","Consumer","Los Angeles","California",90032,"West","FUR-TA-10001539","Furniture","Tables",1706.18,9,0.2,85.31],
  [12,"CA-2014-115812","2014-06-09","2014-06-14","Standard Class","BH-11710","Brosina Hoffman","Consumer","Los Angeles","California",90032,"West","TEC-PH-10002033","Technology","Phones",911.42,4,0.2,68.36],
  [13,"CA-2017-114412","2017-04-15","2017-04-20","Standard Class","AA-10480","Andrew Allen","Consumer","Concord","North Carolina",28027,"South","OFF-PA-10002365","Office Supplies","Paper",15.55,3,0.2,5.44],
  [14,"CA-2016-161389","2016-12-05","2016-12-10","Standard Class","IM-15070","Irene Maddox","Consumer","Seattle","Washington",98103,"West","OFF-BI-10003656","Office Supplies","Binders",407.98,3,0.2,132.59],
  [15,"US-2015-118983","2015-11-22","2015-11-26","Standard Class","HP-14815","Harold Pawlan","Home Office","Fort Worth","Texas",76106,"Central","OFF-AP-10002311","Office Supplies","Appliances",68.81,5,0.8,-123.86],
  [16,"US-2015-118983","2015-11-22","2015-11-26","Standard Class","HP-14815","Harold Pawlan","Home Office","Fort Worth","Texas",76106,"Central","OFF-BI-10000756","Office Supplies","Binders",2.54,3,0.8,-3.82],
  [17,"CA-2017-105893","2017-11-11","2017-11-18","Standard Class","PK-19075","Pete Kriz","Consumer","Madison","Wisconsin",53711,"Central","OFF-ST-10004186","Office Supplies","Storage",665.88,6,0,13.32],
  [18,"CA-2016-167164","2016-05-13","2016-05-15","Second Class","AG-10270","Alejandro Grove","Consumer","West Jordan","Utah",84084,"West","OFF-ST-10000107","Office Supplies","Storage",55.50,2,0,9.99],
  [19,"CA-2016-143336","2016-08-27","2016-09-01","Second Class","ZD-21925","Zuschuss Donatelli","Consumer","San Francisco","California",94109,"West","OFF-AR-10003056","Office Supplies","Art",8.56,2,0,2.48],
  [20,"CA-2016-143336","2016-08-27","2016-09-01","Second Class","ZD-21925","Zuschuss Donatelli","Consumer","San Francisco","California",94109,"West","TEC-PH-10001949","Technology","Phones",213.48,3,0.2,16.01],
  [21,"CA-2017-137330","2017-12-09","2017-12-13","Standard Class","KB-16585","Ken Black","Corporate","Fremont","Nebraska",68025,"Central","OFF-AR-10000246","Office Supplies","Art",19.46,7,0,5.06],
  [22,"CA-2015-121755","2015-01-16","2015-01-20","Second Class","EH-13945","Eric Hoffmann","Consumer","Los Angeles","California",90049,"West","OFF-BI-10001634","Office Supplies","Binders",113.33,3,0.2,39.67],
  [23,"US-2017-156909","2017-07-16","2017-07-18","Second Class","SF-20065","Sandra Flanagan","Consumer","Philadelphia","Pennsylvania",19140,"East","FUR-CH-10002774","Furniture","Chairs",71.37,2,0.3,-1.02],
  [24,"CA-2016-107727","2016-10-19","2016-10-23","Second Class","MA-17560","Matt Abelman","Home Office","Houston","Texas",77095,"Central","OFF-PA-10002684","Office Supplies","Paper",29.47,3,0.2,9.95],
  [25,"CA-2014-149734","2014-09-01","2014-09-05","Standard Class","LC-16885","Lena Creighton","Consumer","New York City","New York",10024,"East","TEC-AC-10003832","Technology","Accessories",90.57,3,0,25.36],
  [26,"CA-2015-135545","2015-03-11","2015-03-14","First Class","KM-16375","Kunst Miller","Consumer","New York City","New York",10009,"East","TEC-MA-10002412","Technology","Machines",1044.63,3,0.1,116.07],
  [27,"CA-2017-129714","2017-02-26","2017-02-26","Same Day","AS-10285","Alejandro Savely","Corporate","New York City","New York",10035,"East","OFF-BI-10004182","Office Supplies","Binders",746.41,4,0.2,242.58],
  [28,"CA-2017-129714","2017-02-26","2017-02-26","Same Day","AS-10285","Alejandro Savely","Corporate","New York City","New York",10035,"East","FUR-BO-10004834","Furniture","Bookcases",1044.44,6,0.5,-459.55],
  [29,"US-2016-118689","2016-10-02","2016-10-09","Standard Class","TS-21205","Tracy Simmons","Corporate","Atlanta","Georgia",30318,"South","TEC-CO-10004722","Technology","Copiers",1799.99,5,0,629.99],
  [30,"CA-2015-117415","2015-12-27","2015-12-31","Standard Class","BS-11380","Bill Shonely","Corporate","Chicago","Illinois",60653,"Central","FUR-FU-10004017","Furniture","Furnishings",68.81,4,0.6,-51.61],
  [31,"CA-2014-113768","2014-04-23","2014-04-28","Standard Class","GA-14515","Gary Aldrich","Home Office","Seattle","Washington",98115,"West","TEC-AC-10001998","Technology","Accessories",545.94,3,0,152.86],
  [32,"US-2016-134026","2016-09-14","2016-09-19","Standard Class","MC-17605","Maureen Chin","Consumer","Dallas","Texas",75217,"Central","FUR-CH-10004218","Furniture","Chairs",524.38,5,0.3,-59.93],
];

const KEYS = ["A","B","C","D","E","F","G","H","J","K","L","M","N","O","P","R","S","T","U"];

// Excel stores a date as days since 1899-12-30. Every widget that does date
// maths goes through this, so `=D2-C2` behaves exactly as it does in a sheet.
export function toSerial(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000);
}

export function fromSerial(serial) {
  const ms = Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000;
  return new Date(ms);
}

// A date value carries its serial number *and* knows it's a date, so the grid
// can render "11/8/2016" while formulas see 42682.
export class DateValue {
  constructor(serial) {
    this.serial = serial;
  }
  valueOf() {
    return this.serial;
  }
}

export const ROWS = RAW.map((r) => {
  const row = {};
  KEYS.forEach((key, i) => {
    row[key] = r[i];
  });
  row.C = new DateValue(toSerial(row.C));
  row.D = new DateValue(toSerial(row.D));
  row.I = "United States";
  row.Q = `${row.P} — ${row.N.slice(-5)}`;
  return row;
});

// Distinct values, in the order the lessons list them.
export const REGIONS = ["Central", "East", "South", "West"];
export const CATEGORIES = ["Furniture", "Office Supplies", "Technology"];
export const SEGMENTS = ["Consumer", "Corporate", "Home Office"];
export const SHIP_MODES = ["Standard Class", "Second Class", "First Class", "Same Day"];

// The real full-dataset figures the lesson prose quotes. Widgets that talk
// about the whole 9,994-row file read from here so the two never drift apart.
export const FULL = {
  rows: 9994,
  sales: 2297201,
  profit: 286397,
  byRegion: { Central: 501240, East: 678781, South: 391722, West: 725458 },
  byCategory: { Furniture: 742000, "Office Supplies": 719047, Technology: 836154 },
  crosstab: {
    Central: { Furniture: 163797, "Office Supplies": 167026, Technology: 170416 },
    East: { Furniture: 208291, "Office Supplies": 205516, Technology: 264974 },
    South: { Furniture: 117299, "Office Supplies": 125651, Technology: 148772 },
    West: { Furniture: 252613, "Office Supplies": 220853, Technology: 251992 },
  },
  // Monthly sales, 2014–2017, used by the trend charts.
  monthly: {
    2014: [14237, 4520, 55691, 28295, 23648, 34595, 33946, 27909, 81777, 31453, 78629, 69545],
    2015: [18174, 11951, 38726, 34196, 30132, 24798, 28765, 36898, 64596, 31404, 75973, 74920],
    2016: [18542, 22979, 51715, 38750, 56988, 40344, 39262, 31116, 73410, 59688, 79412, 96999],
    2017: [43971, 20301, 58872, 36522, 44261, 52982, 45264, 63121, 87866, 77776, 118448, 83829],
  },
  // Sub-category profit — the loss-makers are the point of the exception chart.
  subCategoryProfit: [
    ["Tables", -17725], ["Bookcases", -3473], ["Supplies", -1189], ["Fasteners", 950],
    ["Machines", 3384], ["Labels", 5546], ["Art", 6528], ["Envelopes", 6964],
    ["Furnishings", 13059], ["Appliances", 18138], ["Storage", 21279], ["Chairs", 26590],
    ["Binders", 30222], ["Paper", 34053], ["Accessories", 41937], ["Phones", 44516],
    ["Copiers", 55618],
  ],
  // Profit by Category, folded up from the sub-categories below. The three
  // figures sum to `profit` above, which is the check that the fold is right —
  // and the gap between Furniture's sales and its profit is the whole reason
  // the combo chart in the charts lesson exists.
  byCategoryProfit: { Furniture: 18451, "Office Supplies": 122491, Technology: 145455 },
  // Average margin by discount band — the finding the dashboard project chases.
  discountBands: [
    ["0%", 0.29], ["10%", 0.19], ["20%", 0.06], ["30%", -0.12],
    ["40%", -0.28], ["50%", -0.66], ["60%", -0.96], ["70%+", -1.28],
  ],
};

// Which Category each Sub-Category rolls up to. Used to fold `subCategoryProfit`
// into `byCategoryProfit`; kept here so the two can never disagree.
export const SUBCATEGORY_PARENT = {
  Bookcases: "Furniture", Chairs: "Furniture", Furnishings: "Furniture", Tables: "Furniture",
  Appliances: "Office Supplies", Art: "Office Supplies", Binders: "Office Supplies",
  Envelopes: "Office Supplies", Fasteners: "Office Supplies", Labels: "Office Supplies",
  Paper: "Office Supplies", Storage: "Office Supplies", Supplies: "Office Supplies",
  Accessories: "Technology", Copiers: "Technology", Machines: "Technology", Phones: "Technology",
};

// Distinct-value helper used by several widgets to build dropdowns.
export function distinct(colKey) {
  return [...new Set(ROWS.map((r) => r[colKey]))].sort();
}
