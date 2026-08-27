-- Eenmalig de bekerreeksen invullen voor seizoen 2026-2027, overgenomen uit de
-- clubkalender van VolleyAdmin (stamnummer L-0759). Vanaf hier houdt de
-- beheerder ze zelf bij in het beheerpaneel, net zoals `reeks`.
--
-- Er wordt gezocht op de competitiereeks, want die is per ploeg uniek — behalve
-- bij LHP2, waar zowel Heren B als Heren C in speelt; daar kijken we ook naar de
-- naam. Ploegen die al een bekerreeks hebben, blijven ongemoeid.
--
-- Heren C speelt dit seizoen geen beker en blijft dus leeg.

-- Heren A: Beker van Limburg én de interprovinciale beker.
UPDATE teams SET beker_reeks = 'BVLPHG, IBH'
  WHERE reeks = 'LHP1' AND beker_reeks IS NULL;

-- Heren B (LHP2 is gedeeld met Heren C, vandaar ook de naam).
UPDATE teams SET beker_reeks = 'BVLPHE'
  WHERE reeks = 'LHP2' AND name ILIKE '%Heren B%' AND beker_reeks IS NULL;

-- Dames A en Dames B.
UPDATE teams SET beker_reeks = 'BVLPD-C'
  WHERE reeks = 'LDP4-D' AND beker_reeks IS NULL;
UPDATE teams SET beker_reeks = 'BVLPD-N'
  WHERE reeks = 'LDP4-C' AND beker_reeks IS NULL;

-- U19 Meisjes: de club heeft één meisjesploeg van die leeftijd, die in de
-- competitie bij de U17 uitkomt.
UPDATE teams SET beker_reeks = 'BVLU19M'
  WHERE reeks = 'LMU17N1R1-B' AND beker_reeks IS NULL;
