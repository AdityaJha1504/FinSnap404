
document.addEventListener("DOMContentLoaded", () => {
  const summaryEl = document.getElementById("portfolio-summary");
  const assetTable = document.getElementById("portfolio-table-body");
  const form = document.getElementById("add-asset-form");

  // 🔽 Dependent Dropdown Logic with logos
  const typeSelect = document.getElementById("asset_type");
  const nameSelect = document.getElementById("asset_name");
  const priceInput = document.getElementById("purchase_price");

  const ASSETS = {
    "Stocks": {
      "Apple": { price: 175, logo: "assets/logos/apple.png" },
      "Google": { price: 142, logo: "assets/logos/google.png" },
      "Tesla": { price: 195, logo: "assets/logos/tesla.png" },
      "Amazon": { price: 124, logo: "assets/logos/amazon.png" },
      "Netflix": { price: 400, logo: "assets/logos/netflix.png" },
      "Microsoft": { price: 290, logo: "assets/logos/microsoft.png" },
      "Meta": { price: 320, logo: "assets/logos/meta.png" }
    },
    "Crypto": {
      "Bitcoin": { price: 30000, logo: "assets/logos/bitcoin.png" },
      "Ethereum": { price: 1900, logo: "assets/logos/ethereum.png" },
      "Cardano": { price: 0.35, logo: "assets/logos/cardano.png" },
      "Solana": { price: 24, logo: "assets/logos/solana.png" },
      "XRP": { price: 0.5, logo: "assets/logos/xrp.png" },
      "Polkadot": { price: 5.5, logo: "assets/logos/polkadot.png" },
      "Dogecoin": { price: 0.06, logo: "assets/logos/dogecoin.png" }
    },
    "Real Estate": {
      "Rental House": { price: 150000, logo: "assets/logos/house.png" },
      "Office Space": { price: 300000, logo: "assets/logos/office.png" },
      "Retail Unit": { price: 220000, logo: "assets/logos/retail.png" },
      "Condo": { price: 180000, logo: "assets/logos/condo.png" },
      "Warehouse": { price: 350000, logo: "assets/logos/warehouse.png" },
      "Farm Land": { price: 100000, logo: "assets/logos/farm.png" },
      "Studio Apartment": { price: 125000, logo: "assets/logos/apartment.png" }
    },
    "Commodities": {
      "Gold": { price: 1950, logo: "assets/logos/gold.png" },
      "Silver": { price: 25, logo: "assets/logos/silver.png" },
      "Oil": { price: 75, logo: "assets/logos/oil.png" },
      "Natural Gas": { price: 3.2, logo: "assets/logos/gas.png" },
      "Copper": { price: 4.3, logo: "assets/logos/copper.png" },
      "Wheat": { price: 6.5, logo: "assets/logos/wheat.png" },
      "Coffee": { price: 1.7, logo: "assets/logos/coffee.png" }
    },
    "Bonds": {
      "US Treasury 10Y": { price: 1000, logo: "assets/logos/bond.png" },
      "Municipal Bond": { price: 500, logo: "assets/logos/bond.png" },
      "Corporate Bond A": { price: 1000, logo: "assets/logos/bond.png" },
      "Corporate Bond B": { price: 1000, logo: "assets/logos/bond.png" },
      "Savings Bond": { price: 250, logo: "assets/logos/bond.png" },
      "Inflation-Protected": { price: 1000, logo: "assets/logos/bond.png" },
      "Zero-Coupon": { price: 1000, logo: "assets/logos/bond.png" }
    }
  };

  typeSelect?.addEventListener("change", () => {
    const selectedType = typeSelect.value;
    nameSelect.innerHTML = "<option value=''>Select Asset</option>";
    if (ASSETS[selectedType]) {
      for (const name in ASSETS[selectedType]) {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        nameSelect.appendChild(opt);
      }
    }
    priceInput.value = "";
  });

  nameSelect?.addEventListener("change", () => {
    const type = typeSelect.value;
    const name = nameSelect.value;
    if (ASSETS[type] && ASSETS[type][name]) {
      priceInput.value = ASSETS[type][name].price;
    } else {
      priceInput.value = "";
    }
  });

  const performanceChart = new Chart(document.getElementById("performanceChart"), {
    type: "line",
    data: { labels: [], datasets: [{ label: "Value Over Time", data: [], borderColor: "#007bff", fill: false }] },
    options: { responsive: true }
  });

  const assetTypeChart = new Chart(document.getElementById("assetTypeChart"), {
    type: "pie",
    data: { labels: [], datasets: [{ data: [], backgroundColor: ["#f66", "#6f6", "#66f", "#fc3", "#3cf"] }] },
    options: { responsive: true }
  });

  const chartSelector = document.getElementById("chartSelector");
  chartSelector?.addEventListener("change", (e) => {
    const selected = e.target.value;
    document.getElementById("performanceChart").style.display = selected === "performance" ? "block" : "none";
    document.getElementById("assetTypeChart").style.display = selected === "distribution" ? "block" : "none";
  });

  async function fetchSummary() {
    const res = await fetch("/api/summary");
    const data = await res.json();
    summaryEl.textContent = `Assets: ${data.total_assets} | Total Value: $${parseFloat(data.total_value).toFixed(2)}`;
  }

  async function fetchAssets() {
    const res = await fetch("/api/assets");
    const assets = await res.json();
    assetTable.innerHTML = "";
    for (const asset of assets) {
      const normalizedType = asset.asset_type.charAt(0).toUpperCase() + asset.asset_type.slice(1).toLowerCase();
      const normalizedName = asset.asset_name.replace(" Inc.", ""); // remove suffix if needed

const logo = ASSETS[normalizedType]?.[normalizedName]?.logo || "";

const imgHTML = logo ? `<img src="${logo}" alt="" style="height: 20px; vertical-align: middle; margin-right: 6px;">` : "";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${imgHTML}${asset.asset_name}</td>
        <td>${asset.asset_type}</td>
        <td>${asset.quantity}</td>
        <td>$${parseFloat(asset.purchase_price).toFixed(2)}</td>
        <td>${asset.purchase_date}</td>
        <td><button class="btn" onclick="deleteAsset(${asset.id})">Delete</button></td>
      `;
      assetTable.appendChild(row);
    }
  }
  

  async function fetchCharts() {
    const res1 = await fetch("/api/charts/performance");
    const perf = await res1.json();
    performanceChart.data.labels = perf.labels;
    performanceChart.data.datasets[0].data = perf.values;
    performanceChart.update();

    const res2 = await fetch("/api/charts/distribution");
    const dist = await res2.json();
    assetTypeChart.data.labels = dist.labels;
    assetTypeChart.data.datasets[0].data = dist.values;
    assetTypeChart.update();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    form.reset();
    await fetchSummary();
    await fetchAssets();
    await fetchCharts();
  });

  window.deleteAsset = async (id) => {
    await fetch("/api/assets/" + id, { method: "DELETE" });
    await fetchSummary();
    await fetchAssets();
    await fetchCharts();
  };

  fetchSummary();
  fetchAssets();
  fetchCharts();
});
