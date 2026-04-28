import test from "node:test";
import assert from "node:assert/strict";
import {
  computeMatchPercent,
  grantMatchesFilters,
  normalizeGrantForIndex,
  recommendationSignalsFromPrefs,
  searchTokensForGrant,
  sortGrants,
} from "../src/lib/grant-utils.js";

test("normalizeGrantForIndex creates queryable keys and search tokens", () => {
  const grant = {
    title: "DAAD Research Fellowship",
    organization: "DAAD",
    country: "Germany",
    degree: ["Master", "PhD"],
    field: ["All Fields"],
    type: "Research",
    fundingType: "Full",
  };

  const indexed = normalizeGrantForIndex(grant);
  assert.deepEqual(indexed.degreeKeys, ["master", "phd"]);
  assert.equal(indexed.typeKey, "research");
  assert.deepEqual(indexed.fundingTypeKeys, ["full"]);
  assert.equal(indexed.searchTokens.includes("daad"), true);
  assert.equal(searchTokensForGrant(grant).includes("germany"), true);
});

test("grantMatchesFilters uses normalized fields when present", () => {
  const grant = {
    country: "Germany",
    trustScore: 97,
    degreeKeys: ["master", "phd"],
    typeKey: "research",
    fundingTypeKeys: ["full"],
    searchTokens: ["daad", "research", "germany"],
  };

  assert.equal(
    grantMatchesFilters(grant, {
      countries: ["Germany"],
      degrees: ["phd"],
      types: ["research"],
      fundingTypes: ["full"],
      searchTerms: ["daad"],
      minTrust: 90,
    }),
    true
  );
});

test("computeMatchPercent scores profile against a grant", () => {
  const score = computeMatchPercent(
    { targetCountries: ["Germany"], degree: "master", field: "IT & CS", gpa: 3.5, ielts: 7 },
    { country: "Germany", degree: ["master"], field: ["IT & CS"], minGPA: 3, minIELTS: 6.5 }
  );

  assert.equal(score, 100);
});

test("recommendationSignalsFromPrefs derives query signals from user input", () => {
  const signals = recommendationSignalsFromPrefs({
    targetCountries: ["Germany"],
    degree: "master",
    field: "Computer Science",
    goals: ["full_grant", "research"],
  });

  assert.deepEqual(signals.countries, ["Germany"]);
  assert.deepEqual(signals.degrees, ["master"]);
  assert.deepEqual(signals.fieldTerms, ["computer", "science"]);
  assert.equal(signals.types.includes("research"), true);
  assert.equal(signals.fundingTypes.includes("full"), true);
});

test("sortGrants can sort by match and deadline", () => {
  const grants = [
    { id: "b", matchPercent: 30, deadline: "2026-05-01" },
    { id: "a", matchPercent: 80, deadline: "2026-06-01" },
  ];

  assert.equal(sortGrants(grants, "match")[0].id, "a");
  assert.equal(sortGrants(grants, "deadline")[0].id, "b");
});
