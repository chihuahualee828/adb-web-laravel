import { submitQuery, search, checkLayer, unCheckLayer, currentRequestToken } from './query.js';
import {drawPoints, createLayer } from './drawpoints.js';
import { MarkerClusterer } from "@googlemaps/markerclusterer";
let currentResponseData = null;
import { drawPieChart, generateDataTable, abortAllCharts } from './drawpPie.js';
import { moveToCurrentPosition } from './mapUtils.js';

// Expose to window so initMap can call it if map loads later/earlier
window.moveToCurrentPosition = moveToCurrentPosition;
// Try to move immediately if map is already ready
if (window.map) {
  moveToCurrentPosition();
}

  // Event listener for the Apply button
  document.addEventListener('DOMContentLoaded', () => {    const currentLocBtn = document.getElementById('currentLocBtn');
    if (currentLocBtn) {
        currentLocBtn.addEventListener('click', moveToCurrentPosition);
    }

    const applyBtn = document.getElementById('applyQuery');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        abortAllCharts();
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

        if(filters.query == 0) {   
            alert("Please select a query");
            return;
        }

        filters = {
            query : filters.query !== 0 ? query.options[filters.query].text : 0,
            county : filters.county !== 0 ? county.options[filters.county].text : 0,
            district : filters.district !== 0 ? district.options[filters.district].text : 0,
            season : filters.season !== 0 ? season.options[filters.season].text : 0
        };
        
        submitQuery(filters).then(response => {
            if (!response || response.token !== currentRequestToken) {
                console.log('Stale request ignored');
                return; // ignore stale
            }
            const data = response.data;
            console.log("Query result:", data);
            if (data && data.rows.length > 0) {
              
                if (data.pagination && data.pagination.last_page > 1) {
                    console.warn(`Data truncated. Showing page ${data.pagination.current_page} of ${data.pagination.last_page}. Total records: ${data.pagination.total}`);
                    // Optional: You could show a UI notification here
                    // appendBotMessage(`Note: Showing first ${data.pagination.per_page} results of ${data.pagination.total}.`);
                }

                currentResponseData = data;
                drawPoints(data, "dollar");
                generateDataTable(data);
                if(filters.query == "Best Seller"){
					const product_id = data.rows[0][data.fields.indexOf("product_id")];
                    console.log("Product ID:", product_id);
                    setTimeout(() => {
                        drawPieChart({ searchText: product_id, searchBy: "product_id", groupBy: "county" });
                        drawPieChart({ searchText: product_id, searchBy: "product_id", groupBy: "district", county: filters.county });
                        drawPieChart({ searchText: product_id, searchBy: "product_id", groupBy: "season" });
                    }, 0 );
				}else if (filters.query == "Top Category") {
					const primary_category = data.rows[0][data.fields.indexOf("primary_category")];
                    console.log("Product Category:", primary_category);
                    setTimeout(() => {
                        drawPieChart({ searchText: primary_category, searchBy: "primary_category", groupBy: "county" });
                        drawPieChart({ searchText: primary_category, searchBy: "primary_category", groupBy: "district", county: filters.county });
                        drawPieChart({ searchText: primary_category, searchBy: "primary_category", groupBy: "season" });
                    }, 0 );
				}

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
        abortAllCharts();
        const text = searchInput.value.trim();
        if (text !== "") {
          search(text).then(response => {
            if (!response || response.token !== currentRequestToken) {
                console.log('Stale request ignored');
                return; // ignore stale
            }
            const data = response.data;
            if (data.rows && data.rows.length > 0) {
                currentResponseData = data;
                drawPoints(data, "dollar");
                generateDataTable(data);
                
                if(data.fields.indexOf("product_id")==0){
                    const product_id = data.rows[0][data.fields.indexOf("product_id")];
                    setTimeout(() => {
                        drawPieChart({ searchText: product_id, searchBy: "product_id", groupBy: "county" });
                        drawPieChart({ searchText: product_id, searchBy: "product_id", groupBy: "district"});
                        drawPieChart({ searchText: product_id, searchBy: "product_id", groupBy: "season" });
                    }, 0 );
                }else if(data.fields.indexOf("product_name")==0){
                    const product_name = data.rows[0][data.fields.indexOf("product_name")];
                    setTimeout(() => {
                        drawPieChart({ searchText: product_name, searchBy: "product_name", groupBy: "county" });
                        drawPieChart({ searchText: product_name, searchBy: "product_name", groupBy: "district"});
                        drawPieChart({ searchText: product_name, searchBy: "product_name", groupBy: "season" });
                    }, 0 );
                }else if(data.fields.indexOf("primary_category")==0){
                    const primary_category = data.rows[0][data.fields.indexOf("primary_category")];
                    setTimeout(() => {
                        drawPieChart({ searchText: primary_category, searchBy: "primary_category", groupBy: "county" });
                        drawPieChart({ searchText: primary_category, searchBy: "primary_category", groupBy: "district"});
                        drawPieChart({ searchText: primary_category, searchBy: "primary_category", groupBy: "season" });
                    }, 0 );
                }
            
            } else {
              alert("No results found");
            }
          });
          

        }
      });
    }
  });

  

  
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
        if (querySelect.value == 0) {
            countySelect.value = 0;
            countySelect.disabled = true;
            districtSelect.value = 0;
            districtSelect.disabled = true;
            seasonSelect.value = 0;
            seasonSelect.disabled = true;
        } else if (querySelect.value == 3) {
            countySelect.disabled = false;
            districtSelect.disabled = false;
            seasonSelect.value = 0;
            seasonSelect.disabled = true;
        } else {
            countySelect.disabled = false;
            districtSelect.disabled = false;
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
    if (query.value == 0) {
        county.value = 0;
        county.disabled = true;
        district.value = 0;
        district.disabled = true;
        season.value = 0;
        season.disabled = true;
    } else if (query.value == 3) {
        season.disabled = true;
    }
  });
  


  document.addEventListener("DOMContentLoaded", function () {
    const layerDistrict = document.getElementById("layerDistrict");
    const layerCounty = document.getElementById("layerCounty");
    
        // 🧠 Load from localStorage if saved
    const layerSettings = JSON.parse(localStorage.getItem("layerSettings"));
    if (layerSettings) {
        // layerDistrict.checked = layerSettings.district ?? false;
        // layerCounty.checked = layerSettings.county ?? false;
        
        if (layerSettings.district) {
            layerDistrict.classList.add("active");
            checkLayer(layerDistrict.id);
        }
        if (layerSettings.county) {
            layerCounty.classList.add("active");
            checkLayer(layerCounty.id);
        }
    }
    // // 💾 Save on change
    // layerDistrict.addEventListener("change", () => {
    //   const settings = {
    //     district: layerDistrict.checked,
    //     county: layerCounty.checked,
    //   };
    //   localStorage.setItem("layerSettings", JSON.stringify(settings));

    //   checkLayer(layerDistrict.id);
    // });
  
    // layerCounty.addEventListener("change", () => {
    //   const settings = {
    //     district: layerDistrict.checked,
    //     county: layerCounty.checked,
    //   };
    //   localStorage.setItem("layerSettings", JSON.stringify(settings));

    //   checkLayer(layerCounty.id);
    // });

    // Handle toggle logic
    function toggleLayer(layerEl, key) {
        layerEl.classList.toggle("active");
        // Save to localStorage
        const settings = {
            district: layerDistrict.classList.contains("active"),
            county: layerCounty.classList.contains("active"),
        };
        localStorage.setItem("layerSettings", JSON.stringify(settings));

        if (layerEl.classList.contains("active")) {
            checkLayer(key); // 🔁 Update layer visibility
        } else {
            unCheckLayer(key); // 🔁 Hide layer
        }
    }

    // 👂 Add event listeners
    layerDistrict.addEventListener("click", () => toggleLayer(layerDistrict, "layerDistrict"));
    layerCounty.addEventListener("click", () => toggleLayer(layerCounty, "layerCounty"));

    
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
        abortAllCharts();
        const searchText = searchBtn.dataset.search;
        if (searchText) {
            search(searchText).then(response => {
                if (!response || response.token !== currentRequestToken) {
                    console.log('Stale request ignored');
                    return; // ignore stale
                }
                const data = response.data;

                if (data && data.rows.length > 0) {
                    currentResponseData = data;
                    drawPoints(data, "dollar");
                    generateDataTable(data);
                    if(data.fields.indexOf("product_id")==0){
                        const product_id = data.rows[0][data.fields.indexOf("product_id")];
                        setTimeout(() => {
                            drawPieChart({ searchText: product_id, searchBy: "product_id", groupBy: "county" });
                            drawPieChart({ searchText: product_id, searchBy: "product_id", groupBy: "district"});
                            drawPieChart({ searchText: product_id, searchBy: "product_id", groupBy: "season" });
                        }, 0 );
                    }else if(data.fields.indexOf("product_name")==0){
                        const product_name = data.rows[0][data.fields.indexOf("product_name")];
                        setTimeout(() => {
                            drawPieChart({ searchText: product_name, searchBy: "product_name", groupBy: "county" });
                            drawPieChart({ searchText: product_name, searchBy: "product_name", groupBy: "district"});
                            drawPieChart({ searchText: product_name, searchBy: "product_name", groupBy: "season" });
                        }, 0 );
                    }else if(data.fields.indexOf("primary_category")==0){
                        const primary_category = data.rows[0][data.fields.indexOf("primary_category")];
                        setTimeout(() => {
                            drawPieChart({ searchText: primary_category, searchBy: "primary_category", groupBy: "county" });
                            drawPieChart({ searchText: primary_category, searchBy: "primary_category", groupBy: "district"});
                            drawPieChart({ searchText: primary_category, searchBy: "primary_category", groupBy: "season" });
                        }, 0 );
                    }
                } else {
                    alert("No results found");
                }
              });
        }
    }
});



const activeLayers = {}; // To store markers/clusterers for active saved layers

function renderSavedLayers() {
    const container = document.getElementById("customLayers");
    container.innerHTML = '';
    const saved = JSON.parse(localStorage.getItem('savedCustomLayers') || '[]');
    
    if (saved.length > 0) {
        container.classList.remove("d-none");
    } else {
        container.classList.add("d-none");
    }

    saved.forEach(layer => {
        const row = document.createElement("div");
        row.className = "d-flex align-items-center mb-2";

        const toggle = document.createElement("div");
        toggle.className = "layer-block flex-grow-1 " + (layer.active ? "active" : "");
        toggle.textContent = layer.name;
        // toggle.dataset.layerId = layer.id;
        
        toggle.addEventListener("click", function () {
            const isActive = this.classList.toggle("active");
            layer.active = isActive;
            updateSavedLayerState(layer.id, isActive);
            
            if (isActive) {
                drawSavedLayer(layer);
            } else {
                removeSavedLayer(layer.id);
            }
        });

        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-sm btn-danger ms-2";
        delBtn.innerHTML = '<i class="bi bi-trash"></i>';
        delBtn.addEventListener("click", () => {
             deleteSavedLayer(layer.id);
        });

        row.appendChild(toggle);
        row.appendChild(delBtn);
        container.appendChild(row);
    });
}

function updateSavedLayerState(id, active) {
    const saved = JSON.parse(localStorage.getItem('savedCustomLayers') || '[]');
    const idx = saved.findIndex(l => l.id === id);
    if (idx !== -1) {
        saved[idx].active = active;
        localStorage.setItem('savedCustomLayers', JSON.stringify(saved));
    }
}

function deleteSavedLayer(id) {
    removeSavedLayer(id); 
    const saved = JSON.parse(localStorage.getItem('savedCustomLayers') || '[]');
    const newSaved = saved.filter(l => l.id !== id);
    localStorage.setItem('savedCustomLayers', JSON.stringify(newSaved));
    renderSavedLayers();
}

function drawSavedLayer(layer) {
    if (activeLayers[layer.id]) return; 
    if (!window.map) return;

    const markers = createLayer(layer.data, "dollar");
    
    const clusterer = new MarkerClusterer({ map: window.map, markers: markers });
    
    activeLayers[layer.id] = {
        markers,
        clusterer
    };
}

function removeSavedLayer(id) {
    if (activeLayers[id]) {
        activeLayers[id].clusterer.clearMarkers();
        activeLayers[id].markers.forEach(m => m.setMap(null));
        delete activeLayers[id];
    }
}

document.getElementById("saveLayerBtn").addEventListener("click", () => {
    if (!currentResponseData) {
        alert("No query data to save! Run a query first.");
        return;
    }

    const saved = JSON.parse(localStorage.getItem('savedCustomLayers') || '[]');
    const newId = Date.now();
    const newLayer = {
        id: newId,
        name: `Layer ${saved.length + 1}`,
        data: currentResponseData,
        active: true 
    };
    
    saved.push(newLayer);
    localStorage.setItem('savedCustomLayers', JSON.stringify(saved));
    
    renderSavedLayers();
    drawSavedLayer(newLayer); 
});

document.addEventListener("DOMContentLoaded", () => {
     renderSavedLayers();
     const saved = JSON.parse(localStorage.getItem('savedCustomLayers') || '[]');
     
     const checkMap = setInterval(() => {
         if (window.map) {
             clearInterval(checkMap);
             saved.forEach(l => {
                 if (l.active) drawSavedLayer(l);
             });
         }
     }, 500);
});




// import { submitChatMessage } from './aiUtils.js';


// document.addEventListener("DOMContentLoaded", function () {
//     const chatForm = document.getElementById("chatForm");
  
//     chatForm.addEventListener("submit", function (e) {
//     //   e.preventDefault();
//       sendChatMessage();
//     });
//   });
  
//   function sendChatMessage() {
//     const input = document.getElementById("chatInput");
//     const message = input.value.trim();
    
  
//     if (message) {
//       const welcome = document.getElementById("chatWelcome");
//       if (welcome) welcome.style.display = "none";
//       const chatBox = document.getElementById("chatMessages");
  
//       const bubble = document.createElement("div");
//       bubble.className = "chat-bubble user-msg";
//       bubble.textContent = message;
  
//       chatBox.appendChild(bubble);
//       input.value = "";
//       chatBox.scrollTop = chatBox.scrollHeight;
//       submitChatMessage(message);

      
//     }
//   }


import './aiUtils.js'