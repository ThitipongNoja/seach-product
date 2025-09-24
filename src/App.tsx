import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import "./App.css";

interface Item {
  id: string;
  name: string;
  price: number;
  source: string;
}

const App: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [data, setData] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setIsLoading(true);
    setError("");
    
    fetch("/data.csv")
      .then((res) => {
        if (!res.ok) throw new Error("CSV file not found");
        return res.text();
      })
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              console.warn("CSV parsing warnings:", results.errors);
            }
            
            const parsedData: Item[] = (results.data as any[])
              .map((row, index) => ({
                id: row.id ? String(row.id).trim() : String(index + 1),
                name: row.name ? String(row.name).trim() : "",
                price: row.price ? Number(row.price) : 0,
                source: row.source ? String(row.source).trim() : "",
              }))
              .filter((row) => row.name !== ""); // เอาเฉพาะเช็คชื่อ ไม่เช็ค id
            
            setData(parsedData);
            setIsLoading(false);
          },
          error: (error : any) => {
            setError(`เกิดข้อผิดพลาดในการแปลงข้อมูล CSV: ${error.message}`);
            setIsLoading(false);
          }
        });
      })
      .catch((err) => {
        console.error("Error loading CSV:", err);
        setError(`ไม่สามารถโหลดไฟล์ CSV ได้: ${err.message}`);
        setIsLoading(false);
      });
  }, []);

  // ปรับปรุงการค้นหาให้ดีขึ้น
  const filteredData: Item[] = data.filter((item) => {
    const searchTerm = search.toLowerCase().trim();
    
    if (!searchTerm) return true; // แสดงทั้งหมดถ้า search ว่าง
    
    const name = (item.name || "").toLowerCase().trim();
    const id = (item.id || "").toLowerCase().trim();
    const source = (item.source || "").toLowerCase().trim();
    const price = String(item.price || "");
    
    // ค้นหาในทุกฟิลด์
    return (
      name.includes(searchTerm) ||
      id.includes(searchTerm) ||
      source.includes(searchTerm) ||
      price.includes(searchTerm)
    );
  });

  // แสดงสถานะโหลด
  if (isLoading) {
    return (
      <div className="dark-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // แสดงข้อผิดพลาด
  if (error) {
    return (
      <div className="dark-container">
        <div className="error-container">
          <h2>เกิดข้อผิดพลาด</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-container">
      <h1>🛒 รายการสินค้า</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="ค้นหาด้วยชื่อ, ID, แหล่ง หรือราคา..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        {search && (
          <div className="search-info">
            พบ {filteredData.length} รายการจากทั้งหมด {data.length} รายการ
          </div>
        )}
      </div>

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
              filteredData.map((item: Item, index: number) => (
                <tr key={`${item.id}-${index}`}>
                  <td style={{ width: "130px" }}>{item.id}</td>
                  <td style={{ width: "50vh" }}>{item.name}</td>
                  <td style={{ width: "100px" }}>
                    {item.price.toLocaleString()} บาท
                  </td>
                  <td style={{ width: "50vh" }}>{item.source}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="no-data">
                  {search ? "ไม่พบข้อมูลที่ตรงกับการค้นหา" : "ไม่พบข้อมูล"}
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
