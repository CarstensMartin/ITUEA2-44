// Demo Data
const RECIPES = [
  {
    id: 1,
    title: "Beef Bowl + Rice",
    kcal: 520,
    protein: 35,
    time: 18,
    tags: ["post", "highprotein"],
  },
  {
    id: 2,
    title: "Salmon + Quinoa + Greens",
    kcal: 480,
    protein: 38,
    time: 22,
    tags: ["highprotein", "lowcarb"],
  },
  {
    id: 3,
    title: "Veg Omelette + Salad",
    kcal: 340,
    protein: 24,
    time: 12,
    tags: ["under20", "gluten", "lowcarb"],
  },
  {
    id: 4,
    title: "Chicken Wrap + Fruit",
    kcal: 460,
    protein: 32,
    time: 15,
    tags: ["post", "under20"],
  },
  {
    id: 5,
    title: "Chickpea Bowl",
    kcal: 420,
    protein: 19,
    time: 16,
    tags: ["gluten", "under20", "lowcarb"],
  },
  {
    id: 6,
    title: "Tuna Pasta",
    kcal: 540,
    protein: 36,
    time: 19,
    tags: ["post", "under20", "highprotein"],
  },
  {
    id: 7,
    title: "Tofu Stir-fry",
    kcal: 400,
    protein: 22,
    time: 14,
    tags: ["gluten", "under20", "lowcarb"],
  },
  {
    id: 8,
    title: "Greek Yoghurt Bowl",
    kcal: 380,
    protein: 28,
    time: 5,
    tags: ["under20", "highprotein", "lowcarb"],
  },
];
const FAVOURITES = new Set([1, 6, 3]);

const CATS = [
  {
    key: "fav",
    label: "Favourites",
    filter: (r) => FAVOURITES.has(r.id),
    cls: "c-fav",
  },
  { key: "post", label: "Post-Workout", tag: "post", cls: "c-post" },
  { key: "lowcarb", label: "Low carb", tag: "lowcarb", cls: "c-lowcarb" },
  { key: "under20", label: "Under 20 min", tag: "under20", cls: "c-under20" },
  {
    key: "highprotein",
    label: "High protein",
    tag: "highprotein",
    cls: "c-highprotein",
  },
  { key: "gluten", label: "Gluten-free", tag: "gluten", cls: "c-gluten" },
];

const catGrid = document.getElementById("catGrid");
const resGrid = document.getElementById("resGrid");
const backBtn = document.getElementById("backBtn");
const labelEl = document.getElementById("suggestionsLabel");
const searchEl = document.getElementById("q");

let mode = "categories";
let currentCat = null;

function renderCategories() {
  catGrid.innerHTML = "";
  CATS.forEach((c) => {
    const b = document.createElement("button");
    b.className = "cat " + c.cls;
    b.setAttribute("data-cat", c.key);
    b.innerHTML = `<span class="tag">${c.label}</span><span class="heading">${c.label}</span>`;
    catGrid.appendChild(b);
  });
  catGrid.classList.remove("hide");
  resGrid.classList.add("hide");
  labelEl.textContent = "Suggestions";
  mode = "categories";
  currentCat = null;
}

function getByCategory(key) {
  const c = CATS.find((x) => x.key === key);
  if (!c) return [];
  let list = RECIPES.slice();
  if (c.filter) list = list.filter(c.filter);
  if (c.tag) list = list.filter((r) => r.tags.includes(c.tag));
  list.sort((a, b) => a.time - b.time || b.protein - a.protein);

  if (list.length < 6) {
    const ids = new Set(list.map((r) => r.id));
    const pool = RECIPES.filter((r) => !ids.has(r.id))
      .map((r) => {
        let s = 0;
        if (key === "fav" && FAVOURITES.has(r.id)) s += 3;
        if (c.tag && r.tags.includes(c.tag)) s += 2;
        if (key === "under20" && r.time <= 20) s += 2;
        if (key === "highprotein") s += Math.min(3, Math.floor(r.protein / 10));
        if (key === "lowcarb" && r.tags.includes("lowcarb")) s += 2;
        if (key === "gluten" && r.tags.includes("gluten")) s += 2;
        return { r, s };
      })
      .sort((a, b) => b.s - a.s || a.r.time - b.r.time)
      .map((x) => x.r);
    for (const r of pool) {
      if (list.length >= 6) break;
      list.push(r);
    }
  }
  return list.slice(0, 6);
}

function renderResults(key) {
  const cat = CATS.find((x) => x.key === key);
  const items = getByCategory(key);
  resGrid.innerHTML = "";
  items.forEach((r) => {
    const card = document.createElement("button");
    card.className = "recipe";
    card.innerHTML = `
      <div class="imgph" aria-hidden="true"></div>
      <div class="body">
        <span class="recTag ${cat.cls}">${cat.label}</span>
        <div class="title">${r.title}</div>
        <div class="meta">${r.kcal} kcal • ${r.protein}g protein • ${r.time} min</div>
      </div>`;
    resGrid.appendChild(card);
  });
  labelEl.textContent = cat.label;
  catGrid.classList.add("hide");
  resGrid.classList.remove("hide");
  mode = "results";
  currentCat = key;
}

function classForRecipe(r) {
  if (r.tags.includes("post")) return "c-post";
  if (r.tags.includes("under20")) return "c-under20";
  if (r.tags.includes("lowcarb")) return "c-lowcarb";
  if (r.tags.includes("highprotein")) return "c-highprotein";
  if (r.tags.includes("gluten")) return "c-gluten";
  return "c-fav";
}

// Search functionality rendering
function renderSearch(query) {
  const q = query.trim().toLowerCase();
  const list = RECIPES.filter((r) => r.title.toLowerCase().includes(q)).sort(
    (a, b) => a.time - b.time
  );

  resGrid.innerHTML = "";
  if (list.length === 0) {
    const empty = document.createElement("div");
    empty.className = "meta";
    empty.style.padding = "0 16px 16px";
    empty.textContent = `No results for “${query}”.`;
    resGrid.appendChild(empty);
  } else {
    list.slice(0, 6).forEach((r) => {
      const cls = classForRecipe(r);
      const card = document.createElement("button");
      card.className = "recipe";
      card.innerHTML = `
        <div class="imgph" aria-hidden="true"></div>
        <div class="body">
          <span class="recTag ${cls}">Search</span>
          <div class="title">${r.title}</div>
          <div class="meta">${r.kcal} kcal • ${r.protein}g protein • ${r.time} min</div>
        </div>`;
      resGrid.appendChild(card);
    });
  }
  labelEl.textContent = `Results`;
  catGrid.classList.add("hide");
  resGrid.classList.remove("hide");
  mode = "search";
}

// Initial render
renderCategories();

// Add Event Listeners
catGrid.addEventListener("click", (e) => {
  const tile = e.target.closest("[data-cat]");
  if (!tile) return;
  renderResults(tile.getAttribute("data-cat"));
});

backBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (mode === "results" || mode === "search") {
    renderCategories();
    searchEl.value = "";
  }
});

searchEl.addEventListener("input", () => {
  const q = searchEl.value || "";
  if (q.trim().length >= 2) {
    renderSearch(q);
  } else if (mode !== "categories") {
    renderCategories();
  }
});
