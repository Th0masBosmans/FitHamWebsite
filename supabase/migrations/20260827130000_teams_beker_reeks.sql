-- Bekerwedstrijden van een team bij VolleyAdmin.
--
-- De kalender van de club bevat naast de competitie ook de beker, maar die
-- wedstrijden staan onder een eigen reekscode: "BVLPHG", "BVLPD-C", "IBH", ...
-- Die code valt niet af te leiden uit de competitiereeks in `reeks`, en de
-- ploegnaam alleen volstaat evenmin (zowel de heren als de dames spelen als
-- "Fit V.B.C. Ham A"). Daarom vult de beheerder ze hier zelf in, net zoals bij
-- `reeks`.
--
--   beker_reeks : één of meer bekerreeksen, gescheiden door komma's, bv.
--                 "BVLPHG, IBH". Leeg = dit team speelt geen beker.
--
-- Binnen één bekerreeks speelt hoogstens één ploeg van de club, dus de code
-- alleen volstaat om de juiste wedstrijden eruit te halen.
ALTER TABLE teams
  ADD COLUMN beker_reeks TEXT;
