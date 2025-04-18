import { submitQuery, search, checkLayer } from './query.js';
import {drawPoints, generateDataTable } from './drawpoints.js';

  // Event listener for the Apply button
  document.addEventListener('DOMContentLoaded', () => {
    const applyBtn = document.getElementById('applyQuery');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const query = document.getElementById('query');
        const county = document.getElementById('county');
        const district = document.getElementById('district');
        const season = document.getElementById('season');

        var filters = {
            query: parseInt(query.value),
            county: parseInt(county.value),
            district: parseInt(district.value),
            season: parseInt(season.value),
        };
        localStorage.setItem('filters', JSON.stringify(filters));
        filters = [
            filters.query !== 0 ? query.options[filters.query].text : 0,
            filters.county !== 0 ? county.options[filters.county].text : 0,
            filters.district !== 0 ? district.options[filters.district].text : 0,
            filters.season !== 0 ? season.options[filters.season].text : 0
        ];

        submitQuery(filters).then(data => {
            console.log("Query result:", data);
            if (data && data.rows.length > 0) {
                drawPoints(data, "dollar");
                generateDataTable(data);
            } else {
                alert("No results found");
            }
        });
      });
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
  
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => {
        const text = searchInput.value.trim();
        if (text !== "") {
          search(text).then(data => {
            if (data && data.rows.length > 0) {
              drawPoints(data, "dollar");
              generateDataTable(data);
            } else {
              alert("No results found");
            }
          });
          
        //   if (data.rows && data.rows.length > 0) {
        //     draw_points(data.rows, "dollar"); // Assuming this function uses the raw row data
        //     generateDataTable(data.columns, data.rows); // Provide both columns and data
      
        //     // const firstCol = data.columns[0];
        //     // if (firstCol === "product_id") {
        //     //   draw_pie_chart(text, "product_id", "county");
        //     //   draw_pie_chart(text, "product_id", "season");
        //     // } else if (firstCol === "product_name") {
        //     //   draw_pie_chart(text, "product_name", "county");
        //     //   draw_pie_chart(text, "product_name", "season");
        //     // } else if (firstCol === "primary_category") {
        //     //   draw_pie_chart(text, "primary_category", "county");
        //     //   draw_pie_chart(text, "primary_category", "season");
        //     // }
        //   } else {
        //     window.alert("no result");
        //   }
        }
      });
    }
  });


// // resources/js/dashboard.js
// document.addEventListener("DOMContentLoaded", () => {
//     // 1) Leaflet map
//     const map = L.map("map").setView([25.03, 121.5], 10);
//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution: "",
//     }).addTo(map);
  
//     // 2) DataTable
//     const table = $("#dataTable").DataTable({
//       processing: true,
//       serverSide: true,
//       ajax: {
//         url: "/api/data",  // implement later
//         data: (d) => {
//           $("#filterForm").serializeArray()
//             .forEach((f) => (d[f.name] = f.value));
//         },
//       },
//       columns: [
//         { data: "product_id" },
//         { data: "product_name" },
//         { data: "arrival_address_normalized" },
//         { data: "lat" },
//         { data: "long" },
//         { data: "count" },
//       ],
//     });
  
//     // 3) Charts
//     const countyChart   = new Chart($("#countyChart"),   { type: "pie", data: {} });
//     const districtChart = new Chart($("#districtChart"), { type: "pie", data: {} });
//     const seasonChart   = new Chart($("#seasonChart"),   { type: "pie", data: {} });
  
//     // 4) “Apply” button refresh
//     $("#btnApply").on("click", () => {
//       table.ajax.reload();
//       // later: fetch & update charts + map layers
//     });
//   });
  

  
  const towndict ={'台北市':['松山區', '大安區', '中正區', '萬華區', '大同區', '中山區', '文山區', '南港區', '內湖區', '士林區', '北投區', '信義區'],
    '台中市':['中區', '東區', '南區', '西區', '北區', '西屯區', '南屯區', '北屯區', '豐原區', '東勢區', '大甲區', '清水區', '沙鹿區', '梧棲區', '后里區', '神岡區', '潭子區', '大雅區', '新社區', '石岡區', '外埔區', '大安區', '烏日區', '大肚區', '龍井區', '霧峰區', '太平區', '大里區', '和平區'],
    '基隆市':['中正區', '七堵區', '暖暖區', '仁愛區', '中山區', '安樂區', '信義區'],
    '台南市':['東區', '南區', '北區', '安南區', '安平區', '中西區', '新營區', '鹽水區', '柳營區', '白河區', '後壁區', '東山區', '麻豆區', '下營區', '六甲區', '官田區', '大內區', '佳里區', '西港區', '七股區', '將軍區', '北門區', '學甲區', '新化區', '善化區', '新市區', '安定區', '山上區', '左鎮區', '仁德區', '歸仁區', '關廟區', '龍崎區', '玉井區', '楠西區', '南化區', '永康區'],
    '高雄市':['鹽埕區', '鼓山區', '左營區', '楠梓區', '三民區', '新興區', '前金區', '苓雅區', '前鎮區', '旗津區', '小港區', '鳳山區', '林園區', '大寮區', '大樹區', '大社區', '仁武區', '鳥松區', '岡山區', '橋頭區', '燕巢區', '田寮區', '阿蓮區', '路竹區', '湖內區', '茄萣區', '永安區', '彌陀區', '梓官區', '旗山區', '美濃區', '六龜區', '甲仙區', '杉林區', '內門區', '茂林區', '桃源區', '那瑪夏區'],'新北市':['新莊區', '林口區', '五股區', '蘆洲區', '三重區', '泰山區', '新店區', '石碇區', '深坑區', '坪林區', '烏來區', '板橋區', '三峽區', '鶯歌區', '樹林區', '中和區', '土城區', '瑞芳區', '平溪區', '雙溪區', '貢寮區', '金山區', '萬里區', '淡水區', '汐止區', '三芝區', '石門區', '八里區', '永和區'],'宜蘭縣':['宜蘭市', '頭城鎮', '礁溪鄉', '壯圍鄉', '員山鄉', '羅東鎮', '五結鄉', '冬山鄉', '蘇澳鎮', '三星鄉', '大同鄉', '南澳鄉'],'桃園市':['桃園區', '大溪區', '中壢區', '楊梅區', '蘆竹區', '大園區', '龜山區', '八德區', '龍潭區', '平鎮區', '新屋區', '觀音區', '復興區'],'嘉義市':['東區', '西區'],'新竹縣':['竹東鎮', '關西鎮', '新埔鎮', '竹北市', '湖口鄉', '橫山鄉', '新豐鄉', '芎林鄉', '寶山鄉', '北埔鄉', '峨眉鄉', '尖石鄉', '五峰鄉'],'苗栗縣':['苗栗市', '苑裡鎮', '通霄鎮', '公館鄉', '銅鑼鄉', '三義鄉', '西湖鄉', '頭屋鄉', '竹南鎮', '頭份市', '造橋鄉', '後龍鎮', '三灣鄉', '南庄鄉', '大湖鄉', '卓蘭鎮', '獅潭鄉', '泰安鄉'],'南投縣':['南投市', '埔里鎮', '草屯鎮', '竹山鎮', '集集鎮', '名間鄉', '鹿谷鄉', '中寮鄉', '魚池鄉', '國姓鄉', '水里鄉', '信義鄉', '仁愛鄉'],'彰化縣':['彰化市', '鹿港鎮', '和美鎮', '北斗鎮', '員林市', '溪湖鎮', '田中鎮', '二林鎮', '線西鄉', '伸港鄉', '福興鄉', '秀水鄉', '花壇鄉', '芬園鄉', '大村鄉', '埔鹽鄉', '埔心鄉', '永靖鄉', '社頭鄉', '二水鄉', '田尾鄉', '埤頭鄉', '芳苑鄉', '大城鄉', '竹塘鄉', '溪州鄉'],'新竹市':['東區', '北區', '香山區'],'雲林縣':['斗六市', '斗南鎮', '虎尾鎮', '西螺鎮', '土庫鎮', '北港鎮', '古坑鄉', '大埤鄉', '莿桐鄉', '林內鄉', '二崙鄉', '崙背鄉', '麥寮鄉', '東勢鄉', '褒忠鄉', '臺西鄉', '元長鄉', '四湖鄉', '口湖鄉', '水林鄉'],'嘉義縣':['朴子市', '布袋鎮', '大林鎮', '民雄鄉', '溪口鄉', '新港鄉', '六腳鄉', '東石鄉', '義竹鄉', '鹿草鄉', '太保市', '水上鄉', '中埔鄉', '竹崎鄉', '梅山鄉', '番路鄉', '大埔鄉', '阿里山鄉'],'屏東縣':['屏東市', '潮州鎮', '東港鎮', '恆春鎮', '萬丹鄉', '長治鄉', '麟洛鄉', '九如鄉', '里港鄉', '鹽埔鄉', '高樹鄉', '萬巒鄉', '內埔鄉', '竹田鄉', '新埤鄉', '枋寮鄉', '新園鄉', '崁頂鄉', '林邊鄉', '南州鄉', '佳冬鄉', '琉球鄉', '車城鄉', '滿州鄉', '枋山鄉', '三地門鄉', '霧臺鄉', '瑪家鄉', '泰武鄉', '來義鄉', '春日鄉', '獅子鄉', '牡丹鄉'],'花蓮縣':['花蓮市', '光復鄉', '玉里鎮', '新城鄉', '吉安鄉', '壽豐鄉', '鳳林鎮', '豐濱鄉', '瑞穗鄉', '富里鄉', '秀林鄉', '萬榮鄉', '卓溪鄉'],'台東縣':['台東市', '成功鎮', '關山鎮', '卑南鄉', '大武鄉', '太麻里鄉', '東河鄉', '長濱鄉', '鹿野鄉', '池上鄉', '綠島鄉', '延平鄉', '海端鄉', '達仁鄉', '金峰鄉', '蘭嶼鄉'],'金門縣':['金湖鎮', '金沙鎮', '金城鎮', '金寧鄉', '烈嶼鄉', '烏坵鄉'],'澎湖縣':['馬公市', '湖西鄉', '白沙鄉', '西嶼鄉', '望安鄉', '七美鄉'],'連江縣':['南竿鄉', '北竿鄉', '莒光鄉', '東引鄉']}


  document.addEventListener('DOMContentLoaded', () => {
    const countySelect = document.getElementById('county');
    const districtSelect = document.getElementById('district');
    const seasonSelect = document.getElementById('season');
    const querySelect = document.getElementById('query');

    // Listen for changes in the county dropdown
    countySelect.addEventListener('change', () => {
      const selectedCounty = countySelect.options[countySelect.selectedIndex].text;
      const districts = towndict[selectedCounty] || [];
    console.log("Selected County:", selectedCounty, districts);
      // Clear existing district options
      districtSelect.innerHTML = '';
  
      // Add default placeholder
      const defaultOption = document.createElement('option');
      defaultOption.text = '-- All --';
      defaultOption.value = 0;
      districtSelect.appendChild(defaultOption);
  
      // Add new district options
      districts.forEach((d, i) => {
        const option = document.createElement("option");
        option.value = i+1;    // index as value (0, 1, 2, ...)
        option.text = d;     // district name as visible text
        districtSelect.appendChild(option);
      });
      districtSelect.addEventListener('change', () => {
        console.log("Selected District:", districtSelect.value);
      });
    });

    querySelect.addEventListener('change', () => {
        if (querySelect.value == 3) {
            seasonSelect.value = 0;
            seasonSelect.disabled = true;
        }
        else {
            seasonSelect.disabled = false;
        }
      }
    );

  });


  
document.addEventListener("DOMContentLoaded", function () {
    const query = document.getElementById("query");
    const county = document.getElementById("county");
    const district = document.getElementById("district");
    const season = document.getElementById("season");
    const layerDistrict = document.getElementById("layerDistrict");
    const layerCounty = document.getElementById("layerCounty");
    
    // 🧠 Load from localStorage if saved
    const layerSettings = JSON.parse(localStorage.getItem("layerSettings"));
    if (layerSettings) {
      layerDistrict.checked = layerSettings.district ?? false;
      layerCounty.checked = layerSettings.county ?? false;
      
      if (layerDistrict.checked) {
        checkLayer(layerDistrict.id);
      }
      if (layerCounty.checked) {
        checkLayer(layerCounty.id);
      }
    }

    const saved = JSON.parse(localStorage.getItem("filters"));
    console.log("Saved filters:", saved);
  
    if (saved) {
      // Restore query and season directly
      query.value = saved.query || 0;
      county.value = saved.county || 0;
      season.value = saved.season || 0;
      
      // Populate district based on restored county
      const selectedCounty = county.options[county.value].text;
      const districts = towndict[selectedCounty] || [];
      // Clear and repopulate district dropdown
      district.innerHTML = '';
      const defaultOption = document.createElement("option");
      defaultOption.text = "-- All --";
      defaultOption.value = 0;
      district.appendChild(defaultOption);
        
      districts.forEach((d, i) => {
        const option = document.createElement("option");
        option.value = i+1;    // index as value (0, 1, 2, ...)
        option.text = d;     // district name as visible text
        district.appendChild(option);
      });
      district.value = saved.district || 0;
    }
  });
  


  document.addEventListener("DOMContentLoaded", function () {
    const layerDistrict = document.getElementById("layerDistrict");
    const layerCounty = document.getElementById("layerCounty");
    
  
    // 💾 Save on change
    layerDistrict.addEventListener("change", () => {
      const settings = {
        district: layerDistrict.checked,
        county: layerCounty.checked,
      };
      localStorage.setItem("layerSettings", JSON.stringify(settings));

      checkLayer(layerDistrict.id);
    });
  
    layerCounty.addEventListener("change", () => {
      const settings = {
        district: layerDistrict.checked,
        county: layerCounty.checked,
      };
      localStorage.setItem("layerSettings", JSON.stringify(settings));

      checkLayer(layerCounty.id);
    });
  });


  

//   function loadLayers() {
//     const checkboxes = document.getElementById("layers").getElementsByTagName("input");
//     for (let each of checkboxes) {
//       const checkboxId = each.id + "Checkbox";
//       const saved = localStorage.getItem(checkboxId);
//       if (saved === "true") {
//         each.checked = true;
//         checkLayer(each.id);
//       } else {
//         each.checked = false;
//       }
//     }
//   }

// for map pop up window button
document.addEventListener('click', function (e) {
    const searchBtn = e.target.closest('.map-popup-btn');

    // Only respond if the clicked element is a map popup search button
    if (searchBtn) {
        const searchText = searchBtn.dataset.search;
        if (searchText) {
            search(searchText).then(data => {
                if (data && data.rows.length > 0) {
                    drawPoints(data, "dollar");
                    generateDataTable(data);
                } else {
                    alert("No results found");
                }
              });
        }
    }
});



let savedLayers = {};
let layerCount = 0;

import { markersArray, infoWindows } from './drawpoints.js';

document.getElementById("saveLayerBtn").addEventListener("click", () => {
  if (!markersArray || markersArray.length === 0) {
    // alert("No markers to save!");
    return;
  }

  const currentLayerId = `layer_${++layerCount}`;
//   savedLayers[currentLayerId] = [...markersArray];
 savedLayers[currentLayerId] = markersArray.map((marker, i) => ({
    marker,
    infoWindow: infoWindows[i], // assumes same order
  }));

  // Create checkbox
  const label = document.createElement("label");
  label.className = "form-check-label";
  label.innerText = `Layer ${layerCount}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "form-check-input me-1";
  checkbox.checked = true;
  checkbox.id = currentLayerId;

//   checkbox.addEventListener("change", function () {
//     const visible = this.checked;
//     savedLayers[currentLayerId].forEach(marker => marker.setVisible(visible));
//   });
checkbox.addEventListener("change", function () {
    const visible = this.checked;
    savedLayers[currentLayerId].forEach(({ marker, infoWindow }) => {
      marker.setVisible(visible);
      if (!visible) infoWindow.close(); // close if layer is hidden
    });
  });
  const wrapper = document.createElement("div");
  wrapper.className = "form-check";
  wrapper.appendChild(checkbox);
  wrapper.appendChild(label);

  document.getElementById("customLayers").appendChild(wrapper);
});