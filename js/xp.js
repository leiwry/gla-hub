// ============================================================
// XP Calculator — level XP and potion conversion by tier
// ============================================================
// XP_PER_LEVEL / XP_TOTAL_BY_LEVEL and the potion-split algorithm
// were synced from the wiki's Widget:EXPCalculator (the source of
// truth for real per-level XP values) to fix incorrect results
// that came from a closed-form approximation formula.

const XP_LEVEL_MAX = 140;

// XP_PER_LEVEL[N]      -> XP needed to go from level N to N+1
// XP_TOTAL_BY_LEVEL[N] -> cumulative XP at the start of level N (0% progress)
const XP_PER_LEVEL = [
  0,
  98, 101, 189, 402, 708, 1067, 1611, 2221, 2833, 3726,
  4640, 5487, 6747, 7965, 9029, 10674, 12196, 13459, 15507, 17333,
  18777, 21246, 23376, 24983, 27891, 30325, 32077, 35442, 38180, 40059,
  43899, 46941, 48929, 53626, 56608, 58687, 63531, 67181, 69333, 74706,
  78660, 80867, 86787, 91045, 93289, 99774, 104336, 106599, 113667, 118533,
  120797, 128466, 133636, 135883, 144171, 149645, 151857, 160782, 166560, 168719,
  178299, 184381, 186469, 196722, 203108, 205107, 216051, 222741, 224633, 236286,
  243280, 245047, 257427, 264725, 266349, 279474, 287076, 288539, 302427, 310333,
  311617, 326286, 334496, 335583, 351051, 359565, 360437, 376722, 385540, 386179,
  403299, 412421, 412809, 430782, 440208, 440327, 459171, 468901, 468733, 488466,
  498500, 498027, 518667, 529005, 528209, 549774, 560416, 559279, 581787, 592733,
  591237, 614706, 625956, 624083, 648531, 660085, 657817, 683262, 695120, 692439,
  718899, 731061, 727949, 755442, 767908, 764347, 792891, 805661, 801633, 831246,
  844320, 839807, 870507, 883885, 878869, 910674, 924356, 918819, 951747,
  0
];

const XP_TOTAL_BY_LEVEL = [
  0,
  0, 98, 199, 388, 790, 1498, 2565, 4176, 6397, 9230,
  12956, 17596, 23083, 29830, 37795, 46824, 57498, 69694, 83153, 98660,
  115993, 134770, 156016, 179392, 204375, 232266, 262591, 294668, 330110, 368290,
  408349, 452248, 499189, 548118, 601744, 658352, 717039, 780570, 847751, 917084,
  991790, 1070450, 1151317, 1238104, 1329149, 1422438, 1522212, 1626548, 1733147, 1846814,
  1965347, 2086144, 2214610, 2348246, 2484129, 2628300, 2777945, 2929802, 3090584, 3257144,
  3425863, 3604162, 3788543, 3975012, 4171734, 4374842, 4579949, 4796000, 5018741, 5243374,
  5479660, 5722940, 5967987, 6225414, 6490139, 6756488, 7035962, 7323038, 7611577, 7914004,
  8224337, 8535954, 8862240, 9196736, 9532319, 9883370, 10242935, 10603372, 10980094, 11365634,
  11751813, 12155112, 12567533, 12980342, 13411124, 13851332, 14291659, 14750830, 15219731, 15688464,
  16176930, 16675430, 17173457, 17692124, 18221129, 18749338, 19299112, 19859528, 20418807, 21000594,
  21593327, 22184564, 22799270, 23425226, 24049309, 24697840, 25357925, 26015742, 26699004, 27394124,
  28086563, 28805462, 29536523, 30264472, 31019914, 31787822, 32552169, 33345060, 34150721, 34952354,
  35783600, 36627920, 37467727, 38338234, 39222119, 40100988, 41011662, 41936018, 42854837, 43806584
];

const XP_TIERS = {
  bronze: { multiplier: 3, icon: "sprites/xp/bronze_tier.png", nameKey: "xpTierBronze" },
  silver: { multiplier: 2, icon: "sprites/xp/silver_tier.png", nameKey: "xpTierSilver" },
  gold: { multiplier: 1, icon: "sprites/xp/gold_tier.png", nameKey: "xpTierGold" },
  diamond: { multiplier: 1, icon: "sprites/xp/diamond_tier.png", nameKey: "xpTierDiamond" }
};

const XP_POTS = {
  small: { baseXp: 1000, icon: "sprites/xp/small_xp_pot.png", nameKey: "xpPotSmall" },
  medium: { baseXp: 10000, icon: "sprites/xp/medium_xp_pot.png", nameKey: "xpPotMedium" },
  large: { baseXp: 100000, icon: "sprites/xp/large_xp_pot.png", nameKey: "xpPotLarge" }
};

// Cumulative XP at the start of `level` (0% progress into it).
function xpTotal(level) {
  level = Math.round(level);
  if (level <= 0) return 0;
  if (level > XP_LEVEL_MAX) level = XP_LEVEL_MAX;
  if (level === XP_LEVEL_MAX) {
    return XP_TOTAL_BY_LEVEL[XP_LEVEL_MAX] != null
      ? XP_TOTAL_BY_LEVEL[XP_LEVEL_MAX]
      : XP_TOTAL_BY_LEVEL[XP_LEVEL_MAX - 1] + XP_PER_LEVEL[XP_LEVEL_MAX - 1];
  }
  return XP_TOTAL_BY_LEVEL[level] || 0;
}

// XP required to go from `level` to `level + 1`.
function xpLevel(level) {
  return XP_PER_LEVEL[level] || 0;
}

function xpGetSelectedTierKey() {
  const host = document.getElementById("xp-tier-stars");
  if (!host) return "bronze";
  return host.dataset.selectedTier || "bronze";
}

function xpSetSelectedTier(tierKey) {
  const host = document.getElementById("xp-tier-stars");
  if (!host || !XP_TIERS[tierKey]) return;
  host.dataset.selectedTier = tierKey;

  host.querySelectorAll(".xp-star-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tier === tierKey);
  });
}

function xpBuildTierStars() {
  const host = document.getElementById("xp-tier-stars");
  if (!host) return;

  host.innerHTML = "";
  Object.entries(XP_TIERS).forEach(([key, tier]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "xp-star-btn";
    btn.dataset.tier = key;
    btn.title = xpT(tier.nameKey);
    btn.innerHTML = `<img src="${tier.icon}" alt="${xpT(tier.nameKey)}" />`;
    btn.addEventListener("click", () => {
      xpSetSelectedTier(key);
      xpRecalc();
    });
    host.appendChild(btn);
  });

  xpSetSelectedTier(xpGetSelectedTierKey());
}

function xpCalculate({ levelAtual, porcentagemAtual, levelDesejado, tierMultiplier }) {
  if (
    !Number.isFinite(levelAtual) ||
    !Number.isFinite(levelDesejado) ||
    !Number.isFinite(porcentagemAtual) ||
    levelAtual <= 0 ||
    levelAtual > XP_LEVEL_MAX ||
    levelDesejado > XP_LEVEL_MAX ||
    levelDesejado <= levelAtual ||
    porcentagemAtual < 0 ||
    porcentagemAtual > 100 ||
    !Number.isFinite(tierMultiplier) ||
    tierMultiplier <= 0
  ) {
    return { error: xpT("xpErrorInvalid") };
  }

  const xpAtual = xpTotal(levelAtual) + (xpLevel(levelAtual) * porcentagemAtual) / 100;
  const xpDesejada = xpTotal(levelDesejado);
  const xpFaltante = Math.max(0, Math.ceil(xpDesejada - xpAtual));

  const bigEff = XP_POTS.large.baseXp * tierMultiplier;
  const medEff = XP_POTS.medium.baseXp * tierMultiplier;
  const smallEff = XP_POTS.small.baseXp * tierMultiplier;

  // Same greedy order as the wiki calculator: floor large, floor medium
  // on what's left, then round the final remainder up to whole smalls.
  let remaining = xpFaltante;
  const large = Math.floor(remaining / bigEff);
  remaining -= large * bigEff;
  const medium = Math.floor(remaining / medEff);
  remaining -= medium * medEff;
  const small = remaining > 0 ? Math.ceil(remaining / smallEff) : 0;

  return {
    xpFaltante,
    pots: { large, medium, small }
  };
}

function xpRenderResult(result) {
  const list = document.getElementById("xp-result-list");
  const note = document.getElementById("xp-result-note");
  if (!list || !note) return;

  list.innerHTML = "";

  if (result.error) {
    note.className = "xp-error";
    note.textContent = result.error;
    return;
  }

  note.className = "xp-note";
  note.textContent = `${xpT("xpMissingXp")}: ${xpFormat(result.xpFaltante)}`;

  const order = [
    ["large", XP_POTS.large],
    ["medium", XP_POTS.medium],
    ["small", XP_POTS.small]
  ];

  let shown = 0;
  order.forEach(([key, meta]) => {
    const amount = result.pots[key] || 0;
    if (amount <= 0) return;
    shown += 1;

    const line = document.createElement("div");
    line.className = "xp-pot-line";
    line.innerHTML = `
      <img src="${meta.icon}" alt="${xpT(meta.nameKey)}" />
      <span>${xpT(meta.nameKey)}: <strong>${xpFormat(amount)}</strong></span>
    `;
    list.appendChild(line);
  });

  if (shown === 0) {
    const done = document.createElement("div");
    done.className = "xp-note";
    done.textContent = xpT("xpNoPotsNeeded");
    list.appendChild(done);
  }
}

function xpRecalc() {
  const levelAtual = Number(document.getElementById("xp-level-current")?.value || 0);
  const porcentagemAtual = Number(document.getElementById("xp-percent-current")?.value || 0);
  const levelDesejado = Number(document.getElementById("xp-level-target")?.value || 0);

  const tierKey = xpGetSelectedTierKey();
  const tier = XP_TIERS[tierKey] || XP_TIERS.bronze;

  const result = xpCalculate({
    levelAtual,
    porcentagemAtual,
    levelDesejado,
    tierMultiplier: tier.multiplier
  });

  xpRenderResult(result);
}

function xpFormat(value) {
  return Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0
  });
}

function xpT(key) {
  if (typeof t === "function") return t(key);
  return key;
}

function xpInit() {
  const panel = document.getElementById("xp");
  if (!panel) return;

  xpBuildTierStars();

  ["xp-level-current", "xp-percent-current", "xp-level-target"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el || el.dataset.boundXp === "1") return;
    el.dataset.boundXp = "1";
    el.addEventListener("input", xpRecalc);
    el.addEventListener("change", xpRecalc);
  });

  const clearBtn = document.getElementById("xp-clear-btn");
  if (clearBtn && clearBtn.dataset.boundXp !== "1") {
    clearBtn.dataset.boundXp = "1";
    clearBtn.addEventListener("click", () => {
      const lvl = document.getElementById("xp-level-current");
      const pct = document.getElementById("xp-percent-current");
      const tgt = document.getElementById("xp-level-target");
      if (lvl) lvl.value = "1";
      if (pct) pct.value = "0";
      if (tgt) tgt.value = "2";
      xpSetSelectedTier("bronze");
      xpRecalc();
    });
  }

  xpRecalc();
}
