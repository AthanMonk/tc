import React, { useState, useEffect } from "react";
import Papa from "papaparse";

const PRODUCT_TYPES = [
  {
    label: "CARBONLESS FORMS - Black",
    value: "black",
    csv: "https://raw.githubusercontent.com/AthanMonk/tc/refs/heads/main/1-Carbonless-Forms-Black.csv",
    options: [
      { label: "Sides", key: "Sides" },
      { label: "Parts/Paper Color", key: "Parts/Paper Color" },
      { label: "Size", key: "Size" },
      { label: "Quantity", key: "Quantity" },
    ],
  },
  {
    label: "CARBONLESS FORMS - Full Color",
    value: "fullcolor",
    csv: "https://raw.githubusercontent.com/AthanMonk/tc/refs/heads/main/2-Carbonless-Forms-Full-Color.csv",
    options: [
      { label: "Parts/Paper Color", key: "Parts/Paper Color" },
      { label: "Size", key: "Size" },
      { label: "Quantity", key: "Quantity" },
    ],
  },
];

function App() {
  const [productType, setProductType] = useState(PRODUCT_TYPES[0]);
  const [csvData, setCsvData] = useState([]);
  const [selections, setSelections] = useState({});
  const [price, setPrice] = useState("-");

  // Fetch CSV data when product type changes
  useEffect(() => {
    setSelections({});
    setPrice("-");
    Papa.parse(productType.csv, {
      download: true,
      header: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  }, [productType]);

  // Update price when selections change
  useEffect(() => {
    if (!csvData.length) return;
    // Find matching row
    const row = csvData.find((r) =>
      productType.options.every((opt) => r[opt.key] === selections[opt.key])
    );
    setPrice(row && row.Price ? `$${parseFloat(row.Price).toFixed(2)}` : "-");
  }, [selections, csvData, productType]);

  // Get unique values for each option
  const getOptionValues = (key) => {
    const values = csvData.map((row) => row[key]).filter(Boolean);
    return Array.from(new Set(values));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-2 py-6">
      {/* Price Display */}
      <div className="text-4xl font-bold mb-6 w-full text-center">
        {price}
      </div>
      {/* Product Type Dropdown */}
      <div className="mb-4 w-full max-w-md">
        <label className="block mb-1 text-sm font-medium">PRODUCT TYPE</label>
        <select
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none"
          value={productType.value}
          onChange={e => {
            const pt = PRODUCT_TYPES.find(pt => pt.value === e.target.value);
            setProductType(pt);
          }}
        >
          {PRODUCT_TYPES.map(pt => (
            <option key={pt.value} value={pt.value}>{pt.label}</option>
          ))}
        </select>
      </div>
      {/* Dynamic Option Menus */}
      <div className="w-full max-w-md space-y-4">
        {productType.options.map(opt => (
          <div key={opt.key}>
            <label className="block mb-1 text-sm font-medium">{opt.label}</label>
            <select
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none"
              value={selections[opt.key] || ""}
              onChange={e => setSelections(s => ({ ...s, [opt.key]: e.target.value }))}
            >
              <option value="">Select {opt.label}</option>
              {getOptionValues(opt.key).map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {/* Placeholder for custom finishing options */}
      {/* <div className="mt-6 w-full max-w-md">Custom finishing options coming soon...</div> */}
    </div>
  );
}

export default App;
