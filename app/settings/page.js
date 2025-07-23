'use client';

import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';

// Recursive function to flatten menu items with hierarchy indication
function flattenMenuItems(items, level = 0, parentKey = "") {
  let flat = [];
  items.forEach((item, idx) => {
    const key = parentKey + idx;
    flat.push({ ...item, level, key });
    if (item.children && item.children.length > 0) {
      flat = flat.concat(flattenMenuItems(item.children, level + 1, key + "-"));
    }
  });
  return flat;
}

export default function SettingsPage() {
  const shop = useAuthStore((state) => state.shop);
  const [menu, setMenu] = useState(null);
  const [flatMenu, setFlatMenu] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dropdown state
  const [topValue, setTopValue] = useState('');
  const [xAxis, setXAxis] = useState('all');
  const [yAxis, setYAxis] = useState('');

 useEffect(() => {
  if (!shop) return;
  setLoading(true);

  fetch(`https://${shop}/pages/menu`)
    .then(res => res.ok ? res.text() : Promise.reject('Failed to fetch menu'))
    .then(text => {
      let menuData = [];
      try {
        const data = JSON.parse(text);
        menuData = data.menu || [];
      } catch (e) {
        menuData = [];
      }
      console.log('Fetched menu:', menuData);
      setMenu(menuData);
      setFlatMenu(flattenMenuItems(menuData));
      setLoading(false);
    })
    .catch(err => {
      setMenu(null);
      setFlatMenu([]);
      setLoading(false);
      console.error(err);
    });
}, [shop]);

  // Helper to extract menu layers (level1, level2, level3), excluding Home, Catalog, Contact
  function getMenuLayers(menu) {
    if (!Array.isArray(menu)) return { level1: [], level2: [], level3: [] };
    const exclude = ["Home", "Catalog", "Contact"];
    const level1 = menu.map(item => item.title).filter(title => title && !exclude.includes(title));
    const level2 = menu.flatMap(item => (item.children || []).map(sub => sub.title).filter(title => title && !exclude.includes(title)));
    const level3 = menu.flatMap(item => (item.children || []).flatMap(sub => (sub.children || []).map(subsub => subsub.title).filter(title => title && !exclude.includes(title))));
    return { level1, level2, level3 };
  }

  const { level1, level2, level3 } = getMenuLayers(menu || []);

 // Only add options if there are items
const xAxisOptions = [
  { label: "All Products", value: "all" },
  ...(level1.length ? [{ label: level1.join(", "), value: "level1" }] : []),
  ...(level2.length ? [{ label: level2.join(", "), value: "level2" }] : []),
  ...(level3.length ? [{ label: level3.join(", "), value: "level3" }] : []),
];

  // Y-Axis options logic
  let yAxisOptions = [];
  let yAxisDisabled = true;
  if (topValue === "product" && xAxis !== "all" && xAxis !== "") {
    yAxisDisabled = false;
    if (xAxis === "level1") {
      if (level2.length > 0) {
        yAxisOptions = [
          { label: level2.join(", ") || "-", value: "level2" },
          { label: level3.join(", ") || "-", value: "level3" },
        ].filter(opt => opt.label !== "-");
      } else if (level3.length > 0) {
        yAxisOptions = [
          { label: level3.join(", ") || "-", value: "level3" }
        ].filter(opt => opt.label !== "-");
      }
    } else if (xAxis === "level2") {
      if (level3.length > 0) {
        yAxisOptions = [
          { label: level3.join(", ") || "-", value: "level3" }
        ].filter(opt => opt.label !== "-");
      }
    } else if (xAxis === "level3") {
      yAxisOptions = [
        { label: "Variants", value: "variants" }
      ];
    }
    if (yAxisOptions.length === 0) {
      yAxisOptions = [
        { label: "No options", value: "none" }
      ];
      yAxisDisabled = true;
    }
  } else {
    yAxisOptions = [
      { label: "None", value: "none" }
    ];
    yAxisDisabled = true;
  }

  // x/y axis dropdowns are disabled unless 'Product' is selected
  const axisDisabled = topValue !== "product";

  // Axis enable/disable logic
  const xAxisEnabled = topValue === "product";
  const yAxisEnabled = topValue === "product" && xAxis !== "all" && xAxis !== "";

  // Reset x/y axis if topValue changes away from product
  useEffect(() => {
    if (topValue !== "product") {
      setXAxis("all");
      setYAxis("");
    }
  }, [topValue]);
  useEffect(() => {
    setYAxis("");
  }, [xAxis]);

  return (
    <div className="w-full p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="mb-6 grid gap-4">
        <div>
          <label className="block mb-1 font-semibold">Product root</label>
          <select
            className="border px-2 py-1 rounded w-full"
            value={topValue}
            onChange={e => setTopValue(e.target.value)}
            disabled={loading}
          >
            <option value="">Select root option</option>
            <option value="home">Home</option>
            <option value="catalog">Catalog</option>
            <option value="contact">Contact</option>
            <option value="product">Product</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold">X-Axis display mode</label>
          <select
            className="border px-2 py-1 rounded w-full"
            value={xAxis}
            onChange={e => setXAxis(e.target.value)}
            disabled={!xAxisEnabled || loading}
            style={{ opacity: (!xAxisEnabled || loading) ? 0.5 : 1 }}
          >
            {xAxisOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Y-Axis display mode</label>
          <select
            className="border px-2 py-1 rounded w-full"
            value={yAxis}
            onChange={e => setYAxis(e.target.value)}
            disabled={!yAxisEnabled || yAxisDisabled || loading}
            style={{ opacity: (!yAxisEnabled || yAxisDisabled || loading) ? 0.5 : 1 }}
          >
            {yAxisOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
     
    </div>
  );
}