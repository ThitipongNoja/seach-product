import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import "./App.css";

interface Item {
  id: number;
  name: string;
  price: number;
  source: string;
}

const App: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [data, setData] = useState<Item[]>([]);

  useEffect(() => {
  fetch("/data.csv") // <- ต้องใช้ root path
    .then((res) => {
      if (!res.ok) throw new Error("CSV file not found");
      return res.text();
    })
    .then((csvText) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData: Item[] = (results.data as any[])
            .map((row) => ({
              id: row.id ? Number(row.id) : 0,
              name: row.name ? row.name : "",
              price: row.price ? Number(row.price) : 0,
              source: row.source ? row.source : "",
            }))
            .filter((row) => row.id !== 0 && row.name !== "");
          setData(parsedData);
        },
      });
    })
    .catch((err) => console.error("Error loading CSV:", err));
}, []);


  const filteredData: Item[] = data.filter((item) => {
    const name = item.name || "";
    const id = item.id != null ? item.id.toString() : "";
    return name.toLowerCase().includes(search.toLowerCase()) || id.includes(search);
  });

  return (
    <div className="dark-container">
      <h1>🛒 รายการสินค้า</h1>

      <input
        type="text"
        placeholder="ค้นหาด้วยชื่อหรือ ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <div className="table-wrapper">
        <table className="dark-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ชื่อ</th>
              <th>ราคา</th>
              <th>แหล่ง</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item: Item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.price} บาท</td>
                  <td>{item.source}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="no-data">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
