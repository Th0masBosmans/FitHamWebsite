-- Nieuwsberichten: hetzelfde idee als een evenement, maar met een eigen pagina
-- in plaats van een detailvenster. Bedoeld voor iets nieuws dat uitleg vraagt
-- (bv. de Smash Squad-jeugdwerking).
--
-- De vaste velden hieronder vormen de kop van de pagina. Alles daaronder staat
-- in `blocks`: een lijst blokken (tekst, kaarten, FAQ, foto's) die de beheerder
-- zelf samenstelt. Zo hoeft er voor een nieuw soort pagina geen kolom bij.
CREATE TABLE news_articles(
    id SERIAL PRIMARY KEY,
    -- Het stukje van het webadres: /nieuws/<slug>. Uniek, want het adres moet
    -- naar één bericht wijzen.
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    -- De ondertitel onder de titel. Mag leeg.
    subtitle TEXT,
    intro TEXT NOT NULL,
    -- De hoofdfoto in Cloudinary. Mag leeg: dan toont de pagina enkel de
    -- gekleurde achtergrond.
    image TEXT,
    -- De blokken van de pagina, zie Frontend/types.ts (type NewsBlock).
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Aangevinkt = dit bericht komt in het nieuwsblok op de homepagina.
    highlighted BOOLEAN NOT NULL DEFAULT false,
    -- Het moment van aanmaken; de beheerder kan dit niet invullen. Samen met
    -- updated_at toont de site "Gepubliceerd op" of "Bijgewerkt op".
    published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- De actieknop, net als bij een evenement: link + één van de vaste
    -- opschriften. Leeg = geen knop.
    cta_url TEXT,
    cta_label TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
